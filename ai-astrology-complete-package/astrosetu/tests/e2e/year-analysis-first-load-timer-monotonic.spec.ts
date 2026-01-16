/**
 * E2E Regression: FIRST LOAD → Year Analysis timer must be monotonic (never reset to 0) while generating.
 *
 * Goal:
 * - Fresh browser context
 * - Start year-analysis generation
 * - If timer is visible, it must increase monotonically and must not jump back to 0 after becoming > 0
 * - If MOCK_MODE completes too fast, the test should pass (no opportunity for timer sampling)
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

test.describe("Year Analysis first-load timer monotonic", () => {
  test("timer should never reset to 0 after starting (monotonic while generating)", async ({ page }) => {
    await page.goto("/ai-astrology/input?reportType=year-analysis");
    await fillInputForm(page);

    await page.waitForURL(/.*\/ai-astrology\/preview.*/, { timeout: 10000 });

    const reportContent = page.locator("text=/Year Analysis|Your Year|Year.*Report|Quarterly|Overview|Summary|Insights/i");
    const loadingIndicator = page.locator("text=/Generating|Creating|Preparing|Loading/i");
    const timer = page.locator("text=/Elapsed.*\\d+s/i");

    // If it completes immediately (common in MOCK_MODE), we're done.
    const reportAlreadyVisible = await reportContent.first().isVisible({ timeout: 2000 }).catch(() => false);
    if (reportAlreadyVisible) return;

    // Wait briefly for either loader or timer to appear (or completion).
    await Promise.race([
      reportContent.first().waitFor({ state: "visible", timeout: 5000 }).catch(() => null),
      loadingIndicator.first().waitFor({ state: "visible", timeout: 5000 }).catch(() => null),
      timer.first().waitFor({ state: "visible", timeout: 5000 }).catch(() => null),
    ]);

    // Sample timer values while generation UI is present.
    const samples: number[] = [];
    let sawNonZero = false;

    for (let i = 0; i < 6; i++) {
      const completed = await reportContent.first().isVisible({ timeout: 500 }).catch(() => false);
      if (completed) break;

      const timerVisible = await timer.first().isVisible({ timeout: 500 }).catch(() => false);
      if (!timerVisible) {
        // If timer isn't visible, at least ensure we're either loading or completed.
        const stillLoading = await loadingIndicator.first().isVisible({ timeout: 500 }).catch(() => false);
        if (!stillLoading) break; // UI moved on (likely completed quickly)
        await page.waitForTimeout(750);
        continue;
      }

      const t = parseElapsedSeconds(await timer.first().textContent().catch(() => null));
      if (t !== null) {
        samples.push(t);
        if (t > 0) sawNonZero = true;
        // Non-negotiable invariant: once we see >0 during generation, we must not go back to 0.
        if (sawNonZero) {
          expect(t).toBeGreaterThan(0);
        }
        // Monotonic check (non-decreasing).
        if (samples.length >= 2) {
          expect(samples[samples.length - 1]).toBeGreaterThanOrEqual(samples[samples.length - 2]);
        }
      }

      await page.waitForTimeout(1000);
    }

    // If we observed the timer, it should not be stuck at a constant 0 while still loading.
    if (samples.length >= 3 && samples.every((v) => v === 0)) {
      throw new Error("Timer appears stuck at 0s for year-analysis while generation UI is present");
    }

    // Ensure the flow completes (or at least doesn't hang the test suite).
    await waitForReportGeneration(page, 30000);
  });
});


