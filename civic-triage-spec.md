# NagarNetra: Civic Grievance & Infrastructure Triage (Spec v1)

IDEA//FORGE Online, Track 1, Problem 2. Build window: 20 Nov 6 PM to 22 Nov 11:59 PM IST. Target: submit by 22 Nov 8 PM.
Working name "NagarNetra" (city's eye). Rename freely.

---

## 1. Problem: who faces it and why it matters

**Who:** Urban and semi-urban citizens (commuters, two-wheeler riders, residents of wards with poor drainage and water supply) who see a broken road, leak, garbage dump or pollution source and have no simple way to report it to the right office. On the other side, **municipal ward engineers and department officers** get complaints that are unsorted, duplicated, missing location, and with no sense of which one is dangerous.

**Evidence (cite these in the submission):**
- Pothole-related road deaths rose 53% in five years: **9,438 people killed 2020 to 2024** (MoRTH data reported in Parliament). [Outlook](https://www.outlookindia.com/national/pothole-deaths-in-india-rise-53-in-5-years-9438-killed-between-2020-2024)
- The central grievance portal CPGRAMS alone redressed **over 26 lakh grievances in 2024**, and that excludes most municipal complaints, which sit in separate city apps, WhatsApp numbers and helplines. [Deccan Herald](https://www.deccanherald.com/amp/story/india%2Frecord-over-26-lakh-public-grievances-redressed-in-2024-union-minister-jitendra-singh-3453011)
- Pothole deaths are under-reported and accountability is unclear (Bengaluru case). [Deccan Herald](https://www.deccanherald.com/india/karnataka/bengaluru/pothole-deaths-under-reported-in-bengaluru-offenders-go-unpunished-1156517.html)

**Pain points we fix:**
1. Reporting is slow: long forms, "which department?" confusion, English-only.
2. No triage: a live wire next to a school is queued behind a faded zebra crossing.
3. Duplicates: 40 people report the same pothole as 40 tickets, nobody sees the pattern.
4. No transparency: citizens never learn if anything happened.

**One-line pitch:** Snap, speak or type a problem in any Indian language; AI rates how dangerous it is, groups duplicates, routes it to the right department, and puts it on a public map until it is fixed.

---

## 2. MVP scope (2 days)

### In scope (must ship)
| # | Feature | Acceptance |
|---|---|---|
| F1 | **Report**: photo (camera/upload), voice note (record in browser), or text, plus auto GPS (fallback: tap on map) | Report submits in under 3 taps after capture; works on mobile Chrome |
| F2 | **AI triage**: category, sub-type, severity 1 to 5 with reasons, hazard flags, short English + original-language summary | Result shown to citizen within ~8 s |
| F3 | **Routing**: map category to department (rules table) with SLA hours by severity | Every complaint has a department and due-by time |
| F4 | **Duplicate / cluster check**: same category within 75 m and open, AI confirms "same issue?" then merges as an upvote | Second report of same pothole increments count, not a new ticket |
| F5 | **Public dashboard**: map with severity-coloured pins, filters, counts (open/resolved, by department, avg time to fix), complaint detail page with timeline | Opens without login at the public URL |
| F6 | **Officer view** (simple PIN-protected page): queue sorted by priority score, change status (Acknowledged, In progress, Resolved with "after" photo) | Status change shows on public map |
| F7 | **Ticket tracking**: citizen gets ticket ID `NN-XXXX` and a link | Link shows live status |

### Priority score (shown in officer queue)
`priority = severity*20 + min(duplicate_count,10)*3 + (near_sensitive ? 10 : 0) + hours_overdue*0.5`
`near_sensitive` comes from AI hazard flags (school, hospital, main road, children, electrical).

### Stretch (only if Day 2 noon is green)
- AI "resolution verification": compare before/after photos, confirm fix is real.
- Short video upload (send to Gemini directly, under 20 MB).
- WhatsApp-style share card of the ticket.
- Weekly ward report card (AI summary of hotspots).

### Out of scope
Real government API integration, user accounts/OTP, SMS, native app. Say in the demo: "departments here are a configurable table; real deployment plugs into the city's CPGRAMS/ULB system."

---

## 3. Stack and architecture (all free)

| Layer | Choice | Why |
|---|---|---|
| Frontend + API | **Next.js 14 (App Router, TypeScript) + Tailwind + shadcn/ui** | One repo, API routes, easy Vercel deploy |
| Hosting | **Vercel Hobby** (free) | Public URL in minutes |
| DB, storage | **Supabase free**: Postgres + **PostGIS** + Storage bucket `media` | Geo queries for duplicates, public image URLs |
| AI primary | **Groq** (free tier, OpenAI-compatible API via `groq-sdk`): **Whisper large-v3** for voice (Indian languages), **Llama 4 Scout** vision model for photo + reasoning, JSON mode | Very fast, generous free limits. Check current model IDs in the Groq console on Day 1 |
| AI backup | **Google Gemini 2.5 Flash** via `@google/genai` (free tier). Takes image + audio in one call | Used when all Groq keys are rate-limited or a Groq call fails |
| Map | **Leaflet + react-leaflet + OpenStreetMap tiles**, `leaflet.markercluster` | Free, no key |
| Reverse geocode | **Nominatim** (OSM), 1 req/s, set a User-Agent with app name | Free address text |
| Charts | Recharts | Dashboard stats |

### AI provider chain and key rotation
All AI goes through one module, `lib/ai.ts`, which tries providers in order: **Groq first, Gemini second**.
- Keys come only from env vars, up to 4 per provider (one per team member's account): `GROQ_API_KEY_1..4`, `GEMINI_API_KEY_1..4`. Empty ones are skipped.
- Round-robin across a provider's keys per request. On **HTTP 429, quota/"rate limit" errors, or 401**, mark that key cooling for the `retry-after` time (default 60 s) and try the next key immediately. When every Groq key is cooling or a Groq call fails twice, fall through to Gemini keys the same way. If everything fails, return the safe fallback triage.
- Store `provider` and `key_slot` (1-4, never the key) in `reports.ai_raw` so you can see which account served each call.
- Cooling state is in memory per serverless instance, which is fine for a demo.

**Terms check:** before relying on this, each member should read Groq's and Google's API terms on whether spreading one app's load across several free accounts is allowed. If it isn't, use a single key per provider plus the Groq → Gemini fallback, which works the same way with fewer keys.

```
Citizen (mobile web)
  └─ /report ──POST /api/reports──┐
                                  ├─ upload media → Supabase Storage
                                  ├─ Gemini: triage(image, audio, text, address) → JSON
                                  ├─ routing rules → department, due_at
                                  ├─ PostGIS: open complaints same category ≤75 m
                                  │     └─ if any: Gemini dedupe check → merge or new
                                  └─ insert complaint/report rows → return ticket
Public  /dashboard, /c/[ticket]  ← GET /api/complaints (anon read, RLS)
Officer /officer (PIN)           → PATCH /api/complaints/[id]/status
```

Credit list (put in README and submission): Next.js, Supabase, PostGIS, Groq (Llama 4 Scout, Whisper large-v3), Google Gemini, Leaflet, OpenStreetMap contributors, Nominatim, Recharts, shadcn/ui, Claude Code (used to build).

---

## 4. Data model (Supabase SQL)

```sql
create extension if not exists postgis;

create table departments (
  id text primary key,            -- 'roads', 'water', 'sanitation', 'electrical', 'pollution', 'drainage', 'other'
  name text not null,             -- 'Roads & Infrastructure (PWD/ULB)'
  contact text,
  sla_hours jsonb not null        -- {"5":4,"4":24,"3":72,"2":168,"1":336}
);

create table complaints (         -- one real-world issue (a cluster)
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
create index on complaints using gist(location);
create index on complaints(status, category);

create table reports (             -- each citizen submission
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

create table status_events (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid references complaints(id) on delete cascade,
  status text not null,
  note text,
  image_url text,                   -- 'after' photo on resolve
  actor text default 'officer',
  created_at timestamptz default now()
);

-- find nearby open complaints of same category
create or replace function nearby_open(p_lat float, p_lng float, p_cat text, p_radius int default 75)
returns setof complaints language sql stable as $$
  select * from complaints
  where category = p_cat and status not in ('resolved','rejected')
    and st_dwithin(location, st_makepoint(p_lng, p_lat)::geography, p_radius)
  order by st_distance(location, st_makepoint(p_lng, p_lat)::geography) limit 3;
$$;
```

RLS: anon can `select` complaints and status_events (no raw reports with phone/text). All writes go through API routes with the service-role key (server only).

Routing table seed:
| category | department | SLA by severity (h) 5/4/3/2/1 |
|---|---|---|
| roads | Roads & Infrastructure | 4/24/72/168/336 |
| water | Water Supply Board | 4/12/48/120/240 |
| drainage | Storm Water Drains | 4/24/72/168/336 |
| sanitation | Solid Waste Management | 12/24/48/96/168 |
| electrical | Electricity / Streetlights | 2/12/48/120/240 |
| pollution | Pollution Control / Environment | 6/24/72/168/336 |
| other | Ward Office (manual) | 24/48/96/168/336 |

---

## 5. AI prompts used inside the app

### 5.1 Triage (system prompt; Groq: `response_format: {type:"json_object"}` with the schema pasted into the prompt; Gemini: `responseMimeType: application/json` + `responseSchema`)
On Groq, voice is transcribed by Whisper first and the transcript is passed in the user turn, so step 1 below only applies on Gemini.
```
You are a municipal infrastructure triage officer in India. You receive a citizen report that may include a photo, a voice note (any Indian language or English), typed text, and an approximate address.

Do this:
1. If there is audio, transcribe it exactly in its original language, then translate to English.
2. Decide the single best category: roads, water, drainage, sanitation, electrical, pollution, other. Give a short sub_type (e.g. pothole, broken_footpath, pipe_leak, sewage_overflow, garbage_dump, fallen_wire, streetlight_out, waterlogging, smoke_burning, open_manhole).
3. Rate severity 1-5 using this rubric:
   5 = immediate danger to life (open manhole, live/fallen wire, deep pothole on fast road at night, major flooding, building/wall at risk)
   4 = likely injury or health risk within days (large pothole on busy road, sewage overflow in residential lane, big water main leak, garbage near school/hospital)
   3 = significant nuisance, wider impact (medium pothole, overflowing bin, streetlight out on main street, steady leak)
   2 = minor, local (small crack, single broken light in by-lane, small litter)
   1 = cosmetic or unclear
   Raise by 1 if near school, hospital, bus stop, or if children/elderly/two-wheelers are visibly at risk. Never exceed 5.
4. List hazard_flags from: near_school, near_hospital, traffic_risk, electrical, health, children, flooding, night_risk.
5. Write a title (max 8 words), summary_en (max 40 words, factual, what + where + risk), and summary_local in the citizen's language if not English.
6. Set is_valid_civic_issue=false for selfies, memes, private disputes, or images with no civic problem, and explain in reject_reason.
7. confidence 0-1. If the photo and text disagree, trust the photo and note it.

Do not invent details you cannot see or hear. Output only JSON that matches the schema.
```
Schema:
```json
{"type":"object","properties":{
 "is_valid_civic_issue":{"type":"boolean"},"reject_reason":{"type":"string"},
 "language":{"type":"string"},"transcript":{"type":"string"},"transcript_en":{"type":"string"},
 "category":{"type":"string","enum":["roads","water","drainage","sanitation","electrical","pollution","other"]},
 "sub_type":{"type":"string"},"severity":{"type":"integer"},"severity_reasons":{"type":"array","items":{"type":"string"}},
 "hazard_flags":{"type":"array","items":{"type":"string"}},
 "title":{"type":"string"},"summary_en":{"type":"string"},"summary_local":{"type":"string"},
 "confidence":{"type":"number"}},
 "required":["is_valid_civic_issue","category","severity","title","summary_en","confidence"]}
```
User turn: `[image?] [audio?] Text: "<text or none>". Address: "<reverse-geocoded address>". Time: <local time>.`

### 5.2 Duplicate check
```
You compare a NEW civic report with up to 3 EXISTING open complaints nearby (same category, within 75 m).
Same issue = same physical problem at the same spot (same pothole, same leak, same garbage pile), even if photographed from a different angle or described in another language.
Different issue = different object, or clearly different spot (e.g. other side of junction, different pole).
Return JSON: {"duplicate_of": "<complaint id or null>", "reason": "<one sentence>", "confidence": 0-1}.
Only mark duplicate if confidence >= 0.7.
NEW: {title, summary_en, sub_type, image}
EXISTING: [{id, title, summary_en, sub_type, distance_m, cover_image}]
```

### 5.3 Resolution verification (stretch)
```
Compare BEFORE and AFTER photos of a reported civic issue: "<summary_en>".
Return JSON {"resolved": true|false, "confidence": 0-1, "note": "<one sentence on what changed>"}.
Say resolved=false if the after photo shows a different place, is unrelated, or the problem is still visible.
```

### 5.4 Dashboard insight (one call, cached 10 min)
```
Given these complaint stats as JSON, write 3 short bullet insights for a city officer: biggest hotspot, most overdue department, and one trend. Max 20 words each. No speculation beyond the data.
```

---

## 6. Build prompts for Claude Code (paste in order)

Tip: start each session with "Read SPEC.md first." Put this file in the repo as `SPEC.md`.

**P0 — Setup (30 min)**
```
Create a Next.js 14 App Router project in TypeScript named nagarnetra with Tailwind and shadcn/ui (button, card, badge, dialog, select, tabs, toast). Add deps: @supabase/supabase-js, groq-sdk, @google/genai, leaflet, react-leaflet, leaflet.markercluster, recharts, zod, nanoid. Create .env.example with NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, GROQ_API_KEY_1..GROQ_API_KEY_4, GROQ_VISION_MODEL, GROQ_STT_MODEL, GEMINI_API_KEY_1..GEMINI_API_KEY_4, GEMINI_MODEL, OFFICER_PIN. Create lib/supabase.ts (browser anon client and server service client, server one never imported in client components). Add SPEC.md (I will paste it). Commit.
```

**P1 — Database**
```
Read SPEC.md section 4. Write supabase/migrations/001_init.sql with exactly that schema, the nearby_open function, RLS (anon select on complaints and status_events only), a public storage bucket 'media', and seed departments from the routing table. Also write supabase/seed_demo.sql that inserts 25 realistic demo complaints spread across Bengaluru (lat 12.90-13.03, lng 77.55-77.70) with mixed categories, severities, statuses and created_at over the last 14 days, a few resolved with resolved_at. Tell me the exact steps to run both in the Supabase SQL editor.
```

**P2 — AI module**
```
Read SPEC.md section 5. Read SPEC.md section 3 "AI provider chain and key rotation". Create lib/keys.ts: load GROQ_API_KEY_1..4 and GEMINI_API_KEY_1..4 from env (skip empty), round-robin per provider, markCooling(provider, slot, retryAfterSec) on 429/quota/401, nextKey(provider) returns {key, slot} or null when all are cooling. Never log key values, only slots. Create lib/ai.ts exporting triage({imageBase64?, imageMime?, audioBase64?, audioMime?, text?, address, localTime}) and checkDuplicate(newItem, candidates). Provider order: Groq first (groq-sdk; Whisper model from GROQ_STT_MODEL, default 'whisper-large-v3', for audio; vision model from GROQ_VISION_MODEL, default 'meta-llama/llama-4-scout-17b-16e-instruct', with response_format json_object), then Gemini (@google/genai, GEMINI_MODEL default 'gemini-2.5-flash', responseMimeType 'application/json' + responseSchema). On a rate-limit error switch key and retry at once; when all Groq keys fail, fall through to Gemini. Use the prompts verbatim. Validate output with zod, clamp severity to 1-5, retry once on invalid JSON, and on total failure return a safe fallback {category:'other', severity:3, confidence:0, title from text}. Return provider and key_slot with every result. Add a vitest that mocks a 429 on key 1 and checks key 2 is used, and that all-Groq-429 falls back to Gemini. Add lib/routing.ts: department + due_at from category and severity, and computePriority() using the formula in SPEC section 2. Write a small script scripts/try-ai.ts that runs triage on test-assets/pothole.jpg and prints the JSON plus provider and key slot.
```

**P3 — Report API**
```
Create POST /api/reports (multipart: image?, audio?, text?, lat, lng). Steps: upload media to Supabase storage 'media/{date}/{nanoid}'; reverse geocode with Nominatim (User-Agent 'NagarNetra-hackathon', 3 s timeout, fallback to 'lat,lng'); call triage(); if !is_valid_civic_issue return 422 with reject_reason; call rpc nearby_open; if candidates, call checkDuplicate; if duplicate: insert report linked to it, increment report_count, bump severity to max(existing,new), recompute priority; else create complaint with ticket 'NN-' + 4 uppercase alphanumerics, department, due_at, priority, plus a status_event 'open'. Return {ticket, complaint, merged:boolean, ai}. Limit image 5 MB, audio 60 s / 2 MB. Log timings.
```

**P4 — Citizen report page (mobile first)**
```
Use the ui-ux-pro-max skill for a clean civic look (trust blue + amber for alerts, large touch targets, works at 360px). Build /report: three big tabs Photo / Voice / Text, can combine. Photo: <input type=file accept=image/* capture=environment>, client-side compress to max 1280px JPEG. Voice: MediaRecorder record/stop/replay, show timer, max 60 s. Auto-detect GPS with permission prompt; if denied show a Leaflet map to tap a pin. Submit shows a step loader ("Analysing photo… Checking nearby reports… Routing…"). Result card: ticket ID, severity badge (1-5 with colour), category, department, due-by time, title, summary in English and local language, and "Merged with N other reports" if merged. Buttons: Track status, Share link. Landing page / with headline, 'Report a problem' CTA and live counters.
```

**P5 — Public dashboard**
```
Build /dashboard (public, no login): top KPI row (total, open, resolved, resolved %, avg hours to resolve, overdue count); Leaflet map with markercluster, pins coloured by severity (5 red to 1 grey), resolved pins green; filters for category, status, severity, department; a 'Worst first' list sorted by priority; Recharts bar of complaints by department split open/resolved, and a 14-day line of new vs resolved. Add an AI insights card using prompt 5.4 (cache 10 min). Complaint detail /c/[ticket]: photo, map, AI summary, severity reasons, report_count, department, due-by, overdue badge, timeline from status_events with after photo. Fetch via server components from anon client.
```

**P6 — Officer view**
```
Build /officer guarded by OFFICER_PIN (simple form, httpOnly cookie, middleware). Show queue for a selected department sorted by priority, with overdue highlighted. Actions: Acknowledge, In progress, Resolve (requires after-photo upload, optional note), Reject (reason). PATCH /api/complaints/[id]/status writes status_events, updates status/resolved_at/updated_at. If time permits, on Resolve run resolution verification (prompt 5.3) and show the AI verdict on the timeline.
```

**P7 — Polish and hardening**
```
Add: loading/empty/error states everywhere; rate limit POST /api/reports to 10/min per IP (in-memory map is fine); strip EXIF GPS from stored images after reading it; i18n of UI labels for English and Hindi with a toggle; favicon and OG image; README with setup, architecture diagram, AI prompts summary, and a Credits section listing every library, API and model used, including Claude Code. Run npm run build and fix every error and warning.
```

**P8 — Deploy (use render-deploy or Vercel)**
```
Prepare for Vercel: confirm all env vars (including every GROQ_API_KEY_n and GEMINI_API_KEY_n that is set), add vercel.json only if needed, make sure the service-role key is never in client bundles (grep the .next output). Give me the exact Vercel dashboard steps and the list of env vars to paste. After deploy, run the smoke test from SPEC section 7 against the live URL with Playwright and report results.
```

---

## 7. Test plan

**Test assets** (`test-assets/`, collect on Day 1, real photos where possible): pothole on main road, small crack, open manhole, garbage pile near school gate, water pipe leak, sewage overflow, fallen wire, streetlight off, burning garbage smoke, a selfie (invalid), a meme (invalid); voice notes: Hindi "हमारे गली में पानी की पाइप फट गई है", Kannada road complaint, English complaint, 5 s of silence.

| Layer | Test | Pass |
|---|---|---|
| AI unit (`scripts/eval-ai.ts`) | Run triage on all assets, compare with expected category and severity band in `test-assets/expected.json` | Category ≥ 9/11 correct, severity within ±1 for ≥ 9/11, both invalid images rejected, Hindi/Kannada transcripts in correct language |
| Key rotation | Mock 429 on Groq key 1; mock 429 on all Groq keys | Key 2 serves the call; then Gemini serves it; no key value in logs |
| AI robustness | Text-only "road kharab hai", empty text + image, conflicting text vs photo | Valid JSON every time, fallback never crashes |
| Dedup | Submit same pothole twice from 2 angles 20 m apart; submit 2 different potholes 60 m apart | First pair merges (count=2), second pair stays separate |
| Routing | Each category → right department, due_at = created + SLA | 7/7 |
| API | Missing location, 10 MB image, 2 min audio, 11 requests/min | 400/413/413/429 respectively |
| E2E (Playwright, mobile viewport 390x844) | Report with photo → ticket shown → /c/ticket opens → officer resolves with after photo → dashboard shows green pin and resolved % increases | Passes on local and live URL |
| Security | Anon key cannot insert/update; /officer without PIN redirects; service key absent from client JS | All pass |
| Manual | Real phone, mobile data, incognito: GPS prompt, camera, mic | Works on Android Chrome; note iOS Safari result |
| Performance | Report round trip | p50 < 8 s, dashboard first load < 3 s |

Prompt for Claude Code:
```
Use the engineering:testing-strategy skill. Implement SPEC section 7: scripts/eval-ai.ts that prints a per-asset table and overall accuracy, a Playwright e2e at mobile viewport covering the full flow, and API negative tests with vitest. Run them and give me a pass/fail table. Do not weaken assertions to make tests pass; tell me what failed.
```

---

## 8. Build schedule

| When (IST) | Do |
|---|---|
| 20 Nov evening | P0-P2, collect test assets, AI eval passing |
| 21 Nov morning | P3-P4, first Vercel deploy (deploy early) |
| 21 Nov afternoon | P5-P6, seed demo data |
| 21 Nov night | P7, tests, fix |
| 22 Nov till 3 PM | Stretch if green, final deploy, incognito check |
| 22 Nov 3-7 PM | Record demo, write form, Readiness Check, submit by 8 PM |

---

## 9. Demo video script (2:30)

| Time | Visual | Voiceover |
|---|---|---|
| 0:00-0:15 | News headlines on pothole deaths, a real pothole photo | "Between 2020 and 2024, potholes killed 9,438 people in India. Reporting one still means guessing which department to call, and hoping someone reads it." |
| 0:15-0:25 | Title card NagarNetra | "NagarNetra lets anyone report a civic problem in seconds, and lets AI do the sorting." |
| 0:25-0:55 | Phone: open link, take photo of open manhole, submit, loader steps, result card severity 5 | "I take a photo. The AI identifies an open manhole, rates it severity 5 because it is next to a school, and routes it to Storm Water Drains with a 4-hour deadline." |
| 0:55-1:15 | Record Hindi voice note about water leak, result shows Hindi + English summary | "No typing needed. A voice note in Hindi is transcribed, translated, and triaged the same way." |
| 1:15-1:35 | Second person reports same pothole; card says "Merged with 1 other report" | "When a second person reports the same pothole, we check location and compare images, so it becomes one stronger complaint, not a duplicate." |
| 1:35-2:00 | Public dashboard: map, filters, KPIs, AI insights | "Everyone can see every complaint on a public map: what is open, what is overdue, which department is slowest." |
| 2:00-2:15 | Officer view: worst-first queue, resolve with after photo, pin turns green | "Officers get a queue sorted by danger, not by date. Fixing it needs an after photo, so the public sees proof." |
| 2:15-2:30 | Architecture slide + credits | "Built with Next.js, Supabase with PostGIS, Groq and Google Gemini, and OpenStreetMap. Try it at <link>." |

Record with OBS or Loom at 1080p; phone screen via scrcpy or Chrome device mode. Keep under 3 min.

---

## 10. Submission form draft

**Project name:** NagarNetra: AI Civic Grievance Triage

**Problem statement (who + why):**
Citizens in Indian cities face broken roads, open manholes, water leaks, garbage and pollution every day, but reporting them is slow, often English-only, and they rarely know which department is responsible. Municipal officers in turn receive unsorted, duplicated complaints with no sense of which are dangerous. The cost is real: pothole-related accidents killed 9,438 people in India between 2020 and 2024, up 53% in five years, and grievance volumes run into lakhs a year across disconnected portals. Commuters, two-wheeler riders, children walking to school, and residents of poorly served wards bear the most risk.

**Solution description:**
NagarNetra is a mobile-first web app where anyone can report a civic problem with a photo, a voice note in any Indian language, or text, with location captured automatically. Multimodal AI (Llama 4 vision and Whisper on Groq, with Google Gemini as backup) looks at the photo, transcribes and translates the voice note, and returns a category, a severity score from 1 to 5 with reasons, and hazard flags such as "near school" or "electrical". The system routes the complaint to the right department with a deadline based on severity, and uses geospatial search plus an AI image comparison to merge duplicate reports of the same problem into one stronger ticket. A public dashboard shows every complaint on a map with live counts of open, resolved and overdue issues, and department performance. Officers work from a queue sorted by danger, and must upload an "after" photo to close a ticket, which the AI can check, so the public sees proof of each fix. Citizens get a ticket link to follow progress.

**How AI is used:** multimodal vision and speech understanding, severity reasoning against a published rubric, multilingual transcription and translation, duplicate detection by image and text comparison, fix verification, and dashboard insights. Every AI decision is stored with its reasons for audit.

**MVP link:** https://<your-app>.vercel.app (check in incognito)
**Demo video:** <YouTube unlisted / Drive link, set to "anyone with link">
**Repo:** https://github.com/Praful0306/nagarnetra

**Credits:** Next.js, React, Tailwind CSS, shadcn/ui, Supabase (Postgres, PostGIS, Storage), Groq API (Meta Llama 4 Scout, OpenAI Whisper large-v3), Google Gemini API, Leaflet, OpenStreetMap contributors, Nominatim, Recharts, Playwright, Vercel. Built with help from Claude Code (Anthropic). Statistics: MoRTH data via Parliament replies; DARPG/CPGRAMS figures.

---

## 11. Final checklist
- [ ] Live URL opens in incognito on phone and laptop
- [ ] Demo data seeded, at least 1 resolved with after photo
- [ ] Demo video public/unlisted and opens logged out
- [ ] Problem statement names who faces it
- [ ] Credits listed in form and README
- [ ] Readiness Check run twice, project shows "Submitted"
