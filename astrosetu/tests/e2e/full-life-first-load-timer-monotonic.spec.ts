/**
 * E2E Regression: FIRST LOAD → Full Life timer must be monotonic (never reset to 0) while generating.
 *
 * This mirrors the year-analysis monotonic test but targets the full-life paid report flow.
 */

import { test, expect } from "@playwright/test";
import { fillInputForm, waitForReportGeneration } from "./test-helpers";

function parseElapsedSeconds(text: string | null): number | null {
  if (!text) return null;
  const m = text.match(/Elapsed:\s*(\d+)s/i);
  if (!m) return null;
  const n = Number.parseInt(m[1], 10);
  return Number.isFinite(n) ? n : null;
}

test.describe("Full Life first-load timer monotonic", () => {
  test("timer should never reset to 0 after starting (monotonic while generating)", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    await page.goto("/ai-astrology/input?reportType=full-life");
    await fillInputForm(page);

    await page.waitForURL(/.*\/ai-astrology\/preview.*/, { timeout: 15000 });

    const reportContent = page.locator("text=/Full Life|Your Key Life|Life Report|Executive Summary|Life Insights/i");
    const loadingIndicator = page.locator("text=/Generating|Creating|Preparing|Loading/i");
    const timer = page.locator("text=/Elapsed.*\\d+s/i");

    // If it completes immediately (possible in MOCK_MODE), we're done.
    const reportAlreadyVisible = await reportContent.first().isVisible({ timeout: 2000 }).catch(() => false);
    if (reportAlreadyVisible) return;

    await Promise.race([
      reportContent.first().waitFor({ state: "visible", timeout: 7000 }).catch(() => null),
      loadingIndicator.first().waitFor({ state: "visible", timeout: 7000 }).catch(() => null),
      timer.first().waitFor({ state: "visible", timeout: 7000 }).catch(() => null),
    ]);

    const samples: number[] = [];
    let sawNonZero = false;

    for (let i = 0; i < 6; i++) {
      const completed = await reportContent.first().isVisible({ timeout: 500 }).catch(() => false);
      if (completed) break;

      const timerVisible = await timer.first().isVisible({ timeout: 500 }).catch(() => false);
      if (!timerVisible) {
        const stillLoading = await loadingIndicator.first().isVisible({ timeout: 500 }).catch(() => false);
        if (!stillLoading) break;
        await page.waitForTimeout(750);
        continue;
      }

      const t = parseElapsedSeconds(await timer.first().textContent().catch(() => null));
      if (t !== null) {
        samples.push(t);
        if (t > 0) sawNonZero = true;
        if (sawNonZero) {
          expect(t).toBeGreaterThan(0);
        }
        if (samples.length >= 2) {
          expect(samples[samples.length - 1]).toBeGreaterThanOrEqual(samples[samples.length - 2]);
        }
      }

      await page.waitForTimeout(1000);
    }

    if (samples.length >= 3 && samples.every((v) => v === 0)) {
      throw new Error("Timer appears stuck at 0s for full-life while generation UI is present");
    }

    await waitForReportGeneration(page, 45000);
  });
});


