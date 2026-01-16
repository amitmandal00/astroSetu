/**
 * E2E: UI must never render past 20xx years in timing/prediction surfaces.
 *
 * We intentionally scan for 20xx (ignores birth years like 1984).
 * Contract: any 20xx year shown should be >= current year.
 */

import { test, expect } from "@playwright/test";
import { fillInputForm, waitForReportGeneration } from "./test-helpers";

function extractYears20xx(text: string): number[] {
  const matches = text.match(/\b20\d{2}\b/g) || [];
  return matches.map((m) => Number(m)).filter((n) => Number.isFinite(n));
}

async function assertNoPastYears(page: any) {
  const currentYear = new Date().getFullYear();
  const bodyText = await page.locator("body").innerText();
  const years = extractYears20xx(bodyText);

  // If there are no 20xx years on the page, the invariant trivially holds.
  // (Some report types use only relative phrasing like "next 3-6 months".)
  const past = years.filter((y) => y < currentYear);
  expect(past, `Found past years on page: ${past.join(", ")}`).toHaveLength(0);
}

test.describe("Future-only timing invariant (E2E)", () => {
  test("marriage-timing should not show past 20xx years", async ({ page }) => {
    await page.goto("/ai-astrology/input?reportType=marriage-timing");
    await fillInputForm(page);
    await page.waitForURL(/.*\/ai-astrology\/preview.*/, { timeout: 10000 });
    await waitForReportGeneration(page, 30000);
    await assertNoPastYears(page);
  });

  test("major-life-phase should not show past 20xx years", async ({ page }) => {
    await page.goto("/ai-astrology/input?reportType=major-life-phase");
    await fillInputForm(page);
    await page.waitForURL(/.*\/ai-astrology\/preview.*/, { timeout: 10000 });
    await waitForReportGeneration(page, 30000);
    await assertNoPastYears(page);
  });
});


