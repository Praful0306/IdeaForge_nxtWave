-- NagarNetra Schema Migration: 001_init.sql
-- Enables PostGIS extension, core tables, spatial indexes, RLS, storage bucket and routing seed

create extension if not exists postgis;

-- Departments Table
create table if not exists departments (
  id text primary key,            -- 'roads', 'water', 'sanitation', 'electrical', 'pollution', 'drainage', 'other'
  name text not null,             -- 'Roads & Infrastructure (PWD/ULB)'
  contact text,
  sla_hours jsonb not null        -- {"5":4,"4":24,"3":72,"2":168,"1":336}
);

-- Complaints Table (Clusters)
create table if not exists complaints (
  id uuid primary key default gen_random_uuid(),
  ticket text unique not null,    -- 'NN-4F7K'
  category text not null,         -- roads|water|sanitation|electrical|pollution|drainage|other
  sub_type text,                  -- 'pothole', 'pipe_leak', 'garbage_dump', ...
  title text not null,
  summary_en text not null,
  summary_local text,
  language text,                  -- 'hi', 'kn', 'en' ...
  severity int not null check (severity between 1 and 5),
  severity_reasons text[],
  hazard_flags text[],            -- 'near_school','traffic_risk','electrical','health','children'
  department_id text references departments(id),
  status text not null default 'open', -- open|acknowledged|in_progress|resolved|rejected
  priority numeric not null default 0,
  report_count int not null default 1,
  location geography(point,4326) not null,
  address text,
  ward text,
  cover_image_url text,
  due_at timestamptz,
  resolved_at timestamptz,
  ai_confidence numeric,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_complaints_location on complaints using gist(location);
create index if not exists idx_complaints_status_category on complaints(status, category);
create index if not exists idx_complaints_ticket on complaints(ticket);
create index if not exists idx_complaints_priority on complaints(priority desc);

-- Reports Table (Individual citizen submissions)
create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid references complaints(id) on delete cascade,
  input_type text not null,         -- photo|voice|text|mixed
  text text,
  transcript text,
  image_url text,
  audio_url text,
  location geography(point,4326),
  ai_raw jsonb,                     -- full model output for audit
  created_at timestamptz default now()
);

-- Status Events (Audit trail & resolution verification)
create table if not exists status_events (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid references complaints(id) on delete cascade,
  status text not null,
  note text,
  image_url text,                   -- 'after' photo on resolve
  actor text default 'officer',
  created_at timestamptz default now()
);

-- PostGIS function to find nearby open complaints of same category within p_radius meters
create or replace function nearby_open(p_lat float, p_lng float, p_cat text, p_radius int default 75)
returns setof complaints language sql stable as $$
  select * from complaints
  where category = p_cat and status not in ('resolved','rejected')
    and st_dwithin(location, st_makepoint(p_lng, p_lat)::geography, p_radius)
  order by st_distance(location, st_makepoint(p_lng, p_lat)::geography) limit 3;
$$;

-- Row Level Security (RLS)
alter table departments enable row level security;
alter table complaints enable row level security;
alter table status_events enable row level security;
alter table reports enable row level security;

-- Drop old policies if re-running
drop policy if exists "Allow anon read departments" on departments;
drop policy if exists "Allow anon read complaints" on complaints;
drop policy if exists "Allow anon read status_events" on status_events;

-- Anon can read complaints, status_events, and departments
create policy "Allow anon read departments" on departments for select using (true);
create policy "Allow anon read complaints" on complaints for select using (true);
create policy "Allow anon read status_events" on status_events for select using (true);

-- No public read on reports table (protecting citizen transcripts, raw text, and personal data)

-- Storage bucket setup for public media
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

drop policy if exists "Public Media Access" on storage.objects;
create policy "Public Media Access" on storage.objects
  for select using (bucket_id = 'media');

-- Seed Departments Routing Table
insert into departments (id, name, contact, sla_hours) values
  ('roads', 'Roads & Infrastructure (PWD/ULB)', 'pwd-roads@bbmp.gov.in', '{"5":4,"4":24,"3":72,"2":168,"1":336}'::jsonb),
  ('water', 'Water Supply Board (BWSSB)', 'helpline@bwssb.gov.in', '{"5":4,"4":12,"3":48,"2":120,"1":240}'::jsonb),
  ('drainage', 'Storm Water Drains (SWD)', 'swd-control@bbmp.gov.in', '{"5":4,"4":24,"3":72,"2":168,"1":336}'::jsonb),
  ('sanitation', 'Solid Waste Management (SWM)', 'swm-grievance@bbmp.gov.in', '{"5":12,"4":24,"3":48,"2":96,"1":168}'::jsonb),
  ('electrical', 'Electricity / Streetlights (BESCOM)', '1912@bescom.co.in', '{"5":2,"4":12,"3":48,"2":120,"1":240}'::jsonb),
  ('pollution', 'Pollution Control / Environment (KSPCB)', 'complaints@kspcb.gov.in', '{"5":6,"4":24,"3":72,"2":168,"1":336}'::jsonb),
  ('other', 'Ward Citizen Services Office', 'ward-officer@bbmp.gov.in', '{"5":24,"4":48,"3":96,"2":168,"1":336}'::jsonb)
on conflict (id) do update set
  name = excluded.name,
  contact = excluded.contact,
  sla_hours = excluded.sla_hours;
