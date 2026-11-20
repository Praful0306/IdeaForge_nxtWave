import { describe, it, expect, beforeEach, vi } from "vitest";
import { getProviderKeys, nextKey, markCooling, resetCooling, isSlotCooling } from "@/lib/keys";
import { triage } from "@/lib/ai";
import { getRouting, computePriority } from "@/lib/routing";

describe("Routing and Priority Calculation", () => {
  it("assigns correct department and SLA hours for roads category", () => {
    const r5 = getRouting("roads", 5);
    expect(r5.departmentId).toBe("roads");
    expect(r5.slaHours).toBe(4);

    const r3 = getRouting("roads", 3);
    expect(r3.departmentId).toBe("roads");
    expect(r3.slaHours).toBe(72);
  });

  it("assigns water department correctly with 12h SLA for severity 4", () => {
    const r = getRouting("water", 4);
    expect(r.departmentId).toBe("water");
    expect(r.slaHours).toBe(12);
  });

  it("calculates priority according to SPEC formula", () => {
    // priority = severity*20 + min(dup, 10)*3 + (near_sensitive ? 10 : 0) + hours_overdue*0.5
    // severity=4 -> 80
    // dup=2 -> 6
    // near_sensitive=true ('near_school') -> 10
    // hours_overdue=0
    // total = 80 + 6 + 10 = 96
    const score = computePriority({
      severity: 4,
      duplicateCount: 2,
      hazardFlags: ["near_school"],
      dueAt: new Date(Date.now() + 100000),
    });
    expect(score).toBe(96);
  });

  it("boosts priority when overdue", () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 3600 * 1000);
    const score = computePriority({
      severity: 5, // 100
      duplicateCount: 1, // 3
      hazardFlags: [], // 0
      dueAt: twoHoursAgo, // 2h overdue * 0.5 = 1
    });
    expect(score).toBe(104);
  });
});

describe("AI Key Rotation & 429 Cooling", () => {
  beforeEach(() => {
    resetCooling();
    vi.unstubAllEnvs();
  });

  it("loads configured keys and rotates round-robin", () => {
    vi.stubEnv("GROQ_API_KEY_1", "key-slot-1");
    vi.stubEnv("GROQ_API_KEY_2", "key-slot-2");

    const k1 = nextKey("groq");
    expect(k1?.slot).toBe(1);

    const k2 = nextKey("groq");
    expect(k2?.slot).toBe(2);

    const k3 = nextKey("groq");
    expect(k3?.slot).toBe(1);
  });

  it("skips cooling keys and picks the next available key", () => {
    vi.stubEnv("GROQ_API_KEY_1", "key-slot-1");
    vi.stubEnv("GROQ_API_KEY_2", "key-slot-2");

    // Mark slot 1 as cooling
    markCooling("groq", 1, 60);
    expect(isSlotCooling("groq", 1)).toBe(true);

    // Should return slot 2
    const key = nextKey("groq");
    expect(key?.slot).toBe(2);
  });

  it("returns null when all keys for a provider are cooling", () => {
    vi.stubEnv("GROQ_API_KEY_1", "key-slot-1");
    markCooling("groq", 1, 60);

    const key = nextKey("groq");
    expect(key).toBeNull();
  });

  it("falls through to safe fallback when no keys are configured without crashing", async () => {
    const res = await triage({
      text: "Big open pothole on MG Road outside Metro station",
    });

    expect(res.provider).toBe("fallback");
    expect(res.result.category).toBe("roads");
    expect(res.result.severity).toBe(3);
    expect(res.result.title).toContain("Big open pothole");
  });
});
