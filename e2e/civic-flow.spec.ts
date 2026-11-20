import { test, expect } from "@playwright/test";

test.describe("NagarNetra End-to-End Civic Flow (Mobile Viewport 390x844)", () => {
  test("citizen can visit homepage and see live counters and CTA", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("AI Triages the City's Hazards");
    await expect(page.getByText("Report a Civic Issue").first()).toBeVisible();
    await expect(page.getByText("9,438 Deaths")).toBeVisible();
  });

  test("public dashboard loads map, filters, and priority queue", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.locator("h1")).toContainText("Live City Triage Map");
    await expect(page.getByText("Total Grievances")).toBeVisible();
    await expect(page.locator("#civic-leaflet-map")).toBeVisible({ timeout: 10000 });
  });

  test("officer portal requires PIN and unlocks queue", async ({ page }) => {
    await page.goto("/officer");
    await expect(page.getByText("Municipal Officer Command Center")).toBeVisible();

    // Fill PIN 7789
    await page.fill('input[type="password"]', "7789");
    await page.click('button:has-text("Unlock Queue")');

    // Should see authorized dispatch session
    await expect(page.getByText("Authorized Dispatch Session")).toBeVisible({ timeout: 5000 });
  });
});
