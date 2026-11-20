// NagarNetra Department Routing & SLA Management
// Maps categories to departments, calculates statutory due-by timestamps, and computes priority scores

export interface DepartmentRule {
  id: string;
  name: string;
  contact: string;
  slaHours: Record<number, number>; // severity (1-5) -> SLA hours
}

export const DEPARTMENTS: Record<string, DepartmentRule> = {
  roads: {
    id: "roads",
    name: "Roads & Infrastructure (PWD/ULB)",
    contact: "pwd-roads@bbmp.gov.in",
    slaHours: { 5: 4, 4: 24, 3: 72, 2: 168, 1: 336 },
  },
  water: {
    id: "water",
    name: "Water Supply Board (BWSSB)",
    contact: "helpline@bwssb.gov.in",
    slaHours: { 5: 4, 4: 12, 3: 48, 2: 120, 1: 240 },
  },
  drainage: {
    id: "drainage",
    name: "Storm Water Drains (SWD)",
    contact: "swd-control@bbmp.gov.in",
    slaHours: { 5: 4, 4: 24, 3: 72, 2: 168, 1: 336 },
  },
  sanitation: {
    id: "sanitation",
    name: "Solid Waste Management (SWM)",
    contact: "swm-grievance@bbmp.gov.in",
    slaHours: { 5: 12, 4: 24, 3: 48, 2: 96, 1: 168 },
  },
  electrical: {
    id: "electrical",
    name: "Electricity / Streetlights (BESCOM)",
    contact: "1912@bescom.co.in",
    slaHours: { 5: 2, 4: 12, 3: 48, 2: 120, 1: 240 },
  },
  pollution: {
    id: "pollution",
    name: "Pollution Control / Environment (KSPCB)",
    contact: "complaints@kspcb.gov.in",
    slaHours: { 5: 6, 4: 24, 3: 72, 2: 168, 1: 336 },
  },
  other: {
    id: "other",
    name: "Ward Citizen Services Office",
    contact: "ward-officer@bbmp.gov.in",
    slaHours: { 5: 24, 4: 48, 3: 96, 2: 168, 1: 336 },
  },
};

export const SENSITIVE_HAZARD_FLAGS = new Set([
  "near_school",
  "near_hospital",
  "children",
  "electrical",
  "flooding",
  "night_risk",
  "traffic_risk",
]);

/**
 * Returns department assignment and calculated SLA deadline.
 */
export function getRouting(category: string, severity: number, createdAt: Date = new Date()) {
  const clampedSeverity = Math.min(5, Math.max(1, Math.round(severity)));
  const dept = DEPARTMENTS[category.toLowerCase()] || DEPARTMENTS.other;
  const slaHours = dept.slaHours[clampedSeverity] ?? 72;
  const dueAt = new Date(createdAt.getTime() + slaHours * 60 * 60 * 1000);

  return {
    departmentId: dept.id,
    departmentName: dept.name,
    contact: dept.contact,
    slaHours,
    dueAt,
  };
}

/**
 * Calculates priority score shown in officer queue according to SPEC formula:
 * priority = severity*20 + min(duplicate_count, 10)*3 + (near_sensitive ? 10 : 0) + hours_overdue*0.5
 */
export function computePriority(params: {
  severity: number;
  duplicateCount: number;
  hazardFlags?: string[] | null;
  dueAt?: Date | string | null;
  now?: Date;
}): number {
  const clampedSeverity = Math.min(5, Math.max(1, Math.round(params.severity)));
  const dupBoost = Math.min(Math.max(params.duplicateCount || 1, 1), 10) * 3;

  // Check if any hazard flag matches sensitive criteria
  const flags = params.hazardFlags || [];
  const nearSensitive = flags.some((f) => SENSITIVE_HAZARD_FLAGS.has(f.toLowerCase()));
  const sensitiveBoost = nearSensitive ? 10 : 0;

  // Calculate overdue boost
  let hoursOverdue = 0;
  if (params.dueAt) {
    const dueTime = new Date(params.dueAt).getTime();
    const currentTime = (params.now || new Date()).getTime();
    if (currentTime > dueTime) {
      hoursOverdue = (currentTime - dueTime) / (1000 * 60 * 60);
    }
  }

  const overdueBoost = Math.max(0, hoursOverdue) * 0.5;

  const score = clampedSeverity * 20 + dupBoost + sensitiveBoost + overdueBoost;
  return Math.round(score * 10) / 10;
}
