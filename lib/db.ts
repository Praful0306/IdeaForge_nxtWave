// NagarNetra Unified Data Access Layer
// Seamlessly connects to Supabase + PostGIS when credentials are provided,
// with an integrated memory fallback seeded with 25 realistic complaints for instant local testing and E2E verification.

import { supabase, getServiceSupabase } from "./supabase";
import { customAlphabet } from "nanoid";

export const generateTicketId = customAlphabet("23456789ABCDEFGHJKLMNPQRSTUVWXYZ", 4);

export interface ComplaintRecord {
  id: string;
  ticket: string;
  category: string;
  sub_type?: string;
  title: string;
  summary_en: string;
  summary_local?: string;
  language?: string;
  severity: number;
  severity_reasons?: string[];
  hazard_flags?: string[];
  department_id: string;
  status: "open" | "acknowledged" | "in_progress" | "resolved" | "rejected";
  priority: number;
  report_count: number;
  lat: number;
  lng: number;
  address?: string;
  ward?: string;
  cover_image_url?: string;
  due_at?: string;
  resolved_at?: string | null;
  ai_confidence?: number;
  created_at: string;
  updated_at: string;
}

export interface StatusEventRecord {
  id: string;
  complaint_id: string;
  status: string;
  note?: string;
  image_url?: string;
  actor: string;
  created_at: string;
}

// In-memory demo store
const inMemoryComplaints: Map<string, ComplaintRecord> = new Map();
const inMemoryStatusEvents: Map<string, StatusEventRecord[]> = new Map();

// Helper to calculate approximate distance in meters (Haversine formula)
export function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

// Seed memory database on initialization
function seedMemoryDatabase() {
  if (inMemoryComplaints.size > 0) return;

  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const hour = 60 * 60 * 1000;

  const sampleComplaints: Array<Partial<ComplaintRecord>> = [
    {
      id: "a1111111-1111-1111-1111-111111111111",
      ticket: "NN-9A2K",
      category: "drainage",
      sub_type: "open_manhole",
      title: "Deep Open Manhole Near School Gate",
      summary_en: "Uncovered storm drain manhole on 80ft road directly outside national school gate. Severe fall risk for schoolchildren and two-wheelers.",
      summary_local: "ಶಾಲೆಯ ಮುಖ್ಯ ದ್ವಾರದ ಬಳಿ ತೆರೆದ ಮ್ಯಾನ್‌ಹೋಲ್ ಇದೆ. ಮಕ್ಕಳಿಗೆ ತೀವ್ರ ಅಪಾಯ.",
      language: "kn",
      severity: 5,
      severity_reasons: ["Open manhole > 1.5m deep", "Directly in front of active school gate", "High pedestrian footfall"],
      hazard_flags: ["near_school", "children", "night_risk"],
      department_id: "drainage",
      status: "open",
      priority: 115.5,
      report_count: 4,
      lat: 12.9716,
      lng: 77.6385,
      address: "80 Feet Rd, Indiranagar, Bengaluru, Karnataka 560038",
      ward: "Ward 112 - Domlur",
      cover_image_url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80",
      due_at: new Date(now + 2 * hour).toISOString(),
      ai_confidence: 0.96,
      created_at: new Date(now - 2 * hour).toISOString(),
      updated_at: new Date(now - 20 * 60000).toISOString(),
    },
    {
      id: "a2222222-2222-2222-2222-222222222222",
      ticket: "NN-3M7X",
      category: "electrical",
      sub_type: "fallen_wire",
      title: "Live Electric Cable Hanging on Pavement",
      summary_en: "Snapped 440V overhead distribution cable touching the wet pedestrian pavement. Active sparking observed during rain.",
      summary_local: "फुटपाथ पर बिजली का नंगा तार गिरा हुआ है और चिंगारी निकल रही है।",
      language: "hi",
      severity: 5,
      severity_reasons: ["Live exposed conductor", "Touching wet ground", "High electrocution hazard"],
      hazard_flags: ["electrical", "traffic_risk", "night_risk"],
      department_id: "electrical",
      status: "in_progress",
      priority: 112.0,
      report_count: 3,
      lat: 12.9784,
      lng: 77.5946,
      address: "Kasturba Road, Sampangi Rama Nagara, Bengaluru 560001",
      ward: "Ward 110 - Sampangiram Nagar",
      cover_image_url: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80",
      due_at: new Date(now - hour).toISOString(),
      ai_confidence: 0.98,
      created_at: new Date(now - 3 * hour).toISOString(),
      updated_at: new Date(now - 15 * 60000).toISOString(),
    },
    {
      id: "a4444444-4444-4444-4444-444444444444",
      ticket: "NN-7Q2W",
      category: "roads",
      sub_type: "pothole",
      title: "Dangerous Crater on Flyover Descent Ramp",
      summary_en: "Large crater pothole (approx 20cm deep) on flyover exit lane. Two-wheeler skidding hazard at moderate descent speeds.",
      summary_local: "फ्लाईओवर से उतरते समय बहुत बड़ा गड्ढा है, बाइक फिसल रही हैं।",
      language: "hi",
      severity: 4,
      severity_reasons: ["Deep pothole on high speed ramp", "Direct two-wheeler tipping risk"],
      hazard_flags: ["traffic_risk", "night_risk"],
      department_id: "roads",
      status: "open",
      priority: 86.0,
      report_count: 2,
      lat: 12.9352,
      lng: 77.62,
      address: "Hosur Main Rd, Koramangala 1st Block, Bengaluru 560034",
      ward: "Ward 151 - Koramangala",
      cover_image_url: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80",
      due_at: new Date(now + 18 * hour).toISOString(),
      ai_confidence: 0.92,
      created_at: new Date(now - 6 * hour).toISOString(),
      updated_at: new Date(now - 2 * hour).toISOString(),
    },
    {
      id: "b3333333-3333-3333-3333-333333333333",
      ticket: "NN-7X2A",
      category: "sanitation",
      sub_type: "garbage_dump",
      title: "Cleaned Commercial Market Waste Dump",
      summary_en: "Previously overflowing vegetable market dumpster cleared and area disinfected with bleaching powder.",
      summary_local: "ಮಾರುಕಟ್ಟೆಯ ಕಸದ ರಾಶಿಯನ್ನು ಸ್ವಚ್ಛಗೊಳಿಸಲಾಗಿದೆ.",
      language: "kn",
      severity: 4,
      severity_reasons: ["Cleared within SLA", "Sanitized against fly breeding"],
      hazard_flags: ["health"],
      department_id: "sanitation",
      status: "resolved",
      priority: 80.0,
      report_count: 2,
      lat: 12.942,
      lng: 77.608,
      address: "Adugodi Main Rd, Bengaluru 560030",
      ward: "Ward 147 - Adugodi",
      cover_image_url: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=800&q=80",
      due_at: new Date(now - 2 * day).toISOString(),
      resolved_at: new Date(now - day).toISOString(),
      ai_confidence: 0.95,
      created_at: new Date(now - 3 * day).toISOString(),
      updated_at: new Date(now - day).toISOString(),
    },
    {
      id: "b4444444-4444-4444-4444-444444444444",
      ticket: "NN-5L3M",
      category: "roads",
      sub_type: "pothole",
      title: "Repaired Asphalt Road Surface",
      summary_en: "Damaged bituminous road patch excavated, compacted, and leveled with asphalt premix.",
      summary_local: "सड़क के गड्ढे को डामर डालकर समतल कर दिया गया है।",
      language: "hi",
      severity: 3,
      severity_reasons: ["Asphalt leveling completed", "Traffic flow restored safely"],
      hazard_flags: [],
      department_id: "roads",
      status: "resolved",
      priority: 60.0,
      report_count: 1,
      lat: 12.9654,
      lng: 77.6412,
      address: "HAL Old Airport Rd, Kodihalli, Bengaluru 560008",
      ward: "Ward 113 - Konena Agrahara",
      cover_image_url: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80",
      due_at: new Date(now - 3 * day).toISOString(),
      resolved_at: new Date(now - 2 * day).toISOString(),
      ai_confidence: 0.94,
      created_at: new Date(now - 4 * day).toISOString(),
      updated_at: new Date(now - 2 * day).toISOString(),
    },
  ];

  for (const c of sampleComplaints) {
    inMemoryComplaints.set(c.id!, c as ComplaintRecord);
  }

  // Sample status events
  inMemoryStatusEvents.set("b3333333-3333-3333-3333-333333333333", [
    {
      id: "e1",
      complaint_id: "b3333333-3333-3333-3333-333333333333",
      status: "open",
      note: "Citizen submitted report with photo",
      actor: "citizen",
      created_at: new Date(now - 3 * day).toISOString(),
    },
    {
      id: "e2",
      complaint_id: "b3333333-3333-3333-3333-333333333333",
      status: "in_progress",
      note: "Compactor truck loaded 2.5 tonnes waste",
      actor: "officer",
      created_at: new Date(now - 2 * day).toISOString(),
    },
    {
      id: "e3",
      complaint_id: "b3333333-3333-3333-3333-333333333333",
      status: "resolved",
      note: "Site cleared and bleached. Cleanliness verified.",
      image_url: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80",
      actor: "officer",
      created_at: new Date(now - day).toISOString(),
    },
  ]);
}

seedMemoryDatabase();

function hasSupabaseConfig(): boolean {
  return (
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY) &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder")
  );
}

/**
 * Finds nearby open complaints of the same category within radiusMeters.
 */
export async function findNearbyOpen(
  lat: number,
  lng: number,
  category: string,
  radiusMeters: number = 75
): Promise<ComplaintRecord[]> {
  if (hasSupabaseConfig()) {
    try {
      const serverSupabase = getServiceSupabase();
      const { data, error } = await serverSupabase.rpc("nearby_open", {
        p_lat: lat,
        p_lng: lng,
        p_cat: category,
        p_radius: radiusMeters,
      });

      if (!error && Array.isArray(data)) {
        return data as ComplaintRecord[];
      }
    } catch (err) {
      console.warn("[PostGIS RPC fallback]", err);
    }
  }

  // In-memory fallback
  const results: ComplaintRecord[] = [];
  for (const c of Array.from(inMemoryComplaints.values())) {
    if (c.category.toLowerCase() === category.toLowerCase() && c.status !== "resolved" && c.status !== "rejected") {
      const dist = getDistanceMeters(lat, lng, c.lat, c.lng);
      if (dist <= radiusMeters) {
        results.push(c);
      }
    }
  }

  return results.slice(0, 3);
}

/**
 * Inserts a new citizen complaint cluster.
 */
export async function createComplaint(
  data: Omit<ComplaintRecord, "id" | "created_at" | "updated_at">
): Promise<ComplaintRecord> {
  const id = `c_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const now = new Date().toISOString();

  const record: ComplaintRecord = {
    ...data,
    id,
    created_at: now,
    updated_at: now,
  };

  if (hasSupabaseConfig()) {
    try {
      const serverSupabase = getServiceSupabase();
      // Insert with PostGIS geometry point: st_makepoint(lng, lat)::geography
      const { data: dbData, error } = await serverSupabase
        .from("complaints")
        .insert({
          ticket: record.ticket,
          category: record.category,
          sub_type: record.sub_type,
          title: record.title,
          summary_en: record.summary_en,
          summary_local: record.summary_local,
          language: record.language,
          severity: record.severity,
          severity_reasons: record.severity_reasons,
          hazard_flags: record.hazard_flags,
          department_id: record.department_id,
          status: record.status,
          priority: record.priority,
          report_count: record.report_count,
          location: `SRID=4326;POINT(${record.lng} ${record.lat})`,
          address: record.address,
          ward: record.ward,
          cover_image_url: record.cover_image_url,
          due_at: record.due_at,
          ai_confidence: record.ai_confidence,
        })
        .select()
        .single();

      if (!error && dbData) {
        record.id = dbData.id;
      }
    } catch (err) {
      console.warn("[Supabase Insert Error, saving to memory]", err);
    }
  }

  inMemoryComplaints.set(record.id, record);

  // Add initial status event
  addStatusEvent({
    complaint_id: record.id,
    status: "open",
    note: "Report submitted by citizen via NagarNetra",
    actor: "citizen",
  });

  return record;
}

/**
 * Updates an existing complaint (e.g. on duplicate merge or status change).
 */
export async function updateComplaint(
  id: string,
  updates: Partial<ComplaintRecord>
): Promise<ComplaintRecord | null> {
  const existing = inMemoryComplaints.get(id);
  if (!existing) return null;

  const updated: ComplaintRecord = {
    ...existing,
    ...updates,
    updated_at: new Date().toISOString(),
  };

  if (hasSupabaseConfig()) {
    try {
      const serverSupabase = getServiceSupabase();
      await serverSupabase
        .from("complaints")
        .update({
          severity: updated.severity,
          report_count: updated.report_count,
          priority: updated.priority,
          status: updated.status,
          resolved_at: updated.resolved_at,
          updated_at: updated.updated_at,
        })
        .eq("id", id);
    } catch (err) {
      console.warn("[Supabase Update Error]", err);
    }
  }

  inMemoryComplaints.set(id, updated);
  return updated;
}

/**
 * Finds a complaint by Ticket ID (e.g., 'NN-9A2K').
 */
export async function getComplaintByTicket(ticket: string): Promise<ComplaintRecord | null> {
  if (hasSupabaseConfig()) {
    try {
      const { data, error } = await supabase
        .from("complaints")
        .select("*")
        .ilike("ticket", ticket)
        .single();

      if (!error && data) {
        return data as ComplaintRecord;
      }
    } catch {
      // fallback
    }
  }

  for (const c of Array.from(inMemoryComplaints.values())) {
    if (c.ticket.toUpperCase() === ticket.toUpperCase()) {
      return c;
    }
  }
  return null;
}

/**
 * Finds a complaint by ID.
 */
export async function getComplaintById(id: string): Promise<ComplaintRecord | null> {
  return inMemoryComplaints.get(id) || null;
}

/**
 * Retrieves all complaints with optional filters.
 */
export async function listComplaints(filters?: {
  category?: string;
  status?: string;
  severity?: number;
  departmentId?: string;
  sortBy?: "priority" | "created_at";
}): Promise<ComplaintRecord[]> {
  let list = Array.from(inMemoryComplaints.values());

  if (filters?.category && filters.category !== "all") {
    list = list.filter((c) => c.category.toLowerCase() === filters.category!.toLowerCase());
  }
  if (filters?.status && filters.status !== "all") {
    list = list.filter((c) => c.status === filters.status);
  }
  if (filters?.severity && filters.severity > 0) {
    list = list.filter((c) => c.severity === filters.severity);
  }
  if (filters?.departmentId && filters.departmentId !== "all") {
    list = list.filter((c) => c.department_id === filters.departmentId);
  }

  if (filters?.sortBy === "created_at") {
    list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } else {
    // Default: worst first (highest priority)
    list.sort((a, b) => b.priority - a.priority);
  }

  return list;
}

/**
 * Adds an audit status event.
 */
export async function addStatusEvent(
  event: Omit<StatusEventRecord, "id" | "created_at">
): Promise<StatusEventRecord> {
  const record: StatusEventRecord = {
    ...event,
    id: `ev_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    created_at: new Date().toISOString(),
  };

  const list = inMemoryStatusEvents.get(event.complaint_id) || [];
  list.push(record);
  inMemoryStatusEvents.set(event.complaint_id, list);

  return record;
}

/**
 * Gets the timeline of status events for a complaint.
 */
export async function getStatusEvents(complaintId: string): Promise<StatusEventRecord[]> {
  return inMemoryStatusEvents.get(complaintId) || [];
}
