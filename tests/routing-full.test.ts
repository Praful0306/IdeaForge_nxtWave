import { describe, it, expect } from "vitest";
import { getRouting, DEPARTMENTS } from "@/lib/routing";

describe("Statutory Routing & SLA Assignment (7/7 Categories)", () => {
  const categories = [
    { cat: "roads", dept: "roads", sla5: 4, sla1: 336 },
    { cat: "water", dept: "water", sla5: 4, sla1: 240 },
    { cat: "drainage", dept: "drainage", sla5: 4, sla1: 336 },
    { cat: "sanitation", dept: "sanitation", sla5: 12, sla1: 168 },
    { cat: "electrical", dept: "electrical", sla5: 2, sla1: 240 },
    { cat: "pollution", dept: "pollution", sla5: 6, sla1: 336 },
    { cat: "other", dept: "other", sla5: 24, sla1: 336 },
  ];

  categories.forEach(({ cat, dept, sla5, sla1 }) => {
    it(`routes category '${cat}' to department '${dept}' with verified SLA boundaries`, () => {
      const routing5 = getRouting(cat, 5);
      expect(routing5.departmentId).toBe(dept);
      expect(routing5.slaHours).toBe(sla5);

      const routing1 = getRouting(cat, 1);
      expect(routing1.departmentId).toBe(dept);
      expect(routing1.slaHours).toBe(sla1);

      // Verify due date calculation
      const now = new Date();
      const calculatedDue = new Date(now.getTime() + sla5 * 60 * 60 * 1000);
      const diffHours = (routing5.dueAt.getTime() - now.getTime()) / (1000 * 60 * 60);
      expect(Math.round(diffHours)).toBe(sla5);
    });
  });
});
