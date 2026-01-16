import { test, expect } from "@playwright/test";

/**
 * E2E Regression: first-load year-analysis MUST NOT stall forever.
 *
 * This reproduces the real-world scenario:
 * - fresh context (no storage)
 * - user lands on /ai-astrology (cold load)
 * - then opens a payment/preview URL with session_id + auto_generate=true
 *
 * Acceptance:
 * - within 120s we either see report content OR an explicit error screen
 * - timer must not reset back to 0 once it has started
 */

function parseElapsedSeconds(text: string | null): number | null {
  if (!text) return null;
  const m = text.match(/Elapsed:\s*(\d+)s/i);
  if (!m) return null;
  const n = Number.parseInt(m[1], 10);
  return Number.isFinite(n) ? n : null;
}

test.describe("First-load year-analysis must not stall", () => {
  test("cold start → auto_generate year-analysis reaches report or error (no infinite spinner)", async ({ page }) => {
    // Fresh context: simulate true first load
    await page.addInitScript(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // Seed localStorage form data (preview can recover this when sessionStorage is missing on cold load/new tab)
    await page.addInitScript(() => {
      localStorage.setItem(
        "aiAstrologyFormData",
        JSON.stringify({
          name: "Amit Kumar Mandal",
          dob: "1984-11-26",
          tob: "10:30",
          place: "Noamundi, Jharkhand",
          gender: "Male",
          latitude: 22.16,
          longitude: 85.5,
        })
      );
    });

    await page.goto("/ai-astrology", { waitUntil: "domcontentloaded" });

    // Use a test_session_* so backend mock path is deterministic in E2E (no Stripe/OpenAI dependency).
    await page.goto(
      "/ai-astrology/preview?session_id=test_session_year-analysis_req-1768553681015-e2e&reportType=year-analysis&auto_generate=true",
      { waitUntil: "domcontentloaded" }
    );

    const timer = page.locator("text=/Elapsed.*\\d+s/i");
    const report = page.locator("text=/Year Analysis|Your Year Analysis|12-month strategic overview/i");
    const error = page.locator("text=/Error Generating Report|Payment verification failed|Report generation timed out/i");

    // Timer monotonic sampling while we're waiting for completion/error.
    const samples: number[] = [];
    let sawNonZero = false;
    const t0 = Date.now();
    while (Date.now() - t0 < 15_000) {
      const done = (await report.first().isVisible().catch(() => false)) || (await error.first().isVisible().catch(() => false));
      if (done) break;

      const timerVisible = await timer.first().isVisible().catch(() => false);
      if (timerVisible) {
        const t = parseElapsedSeconds(await timer.first().textContent().catch(() => null));
        if (t != null) {
          samples.push(t);
          if (t > 0) sawNonZero = true;
          if (sawNonZero) expect(t).toBeGreaterThan(0);
          if (samples.length >= 2) {
            expect(samples[samples.length - 1]).toBeGreaterThanOrEqual(samples[samples.length - 2]);
          }
        }
      }
      await page.waitForTimeout(1000);
    }

    // Hard acceptance window: report OR explicit error within 120s (no infinite spinner).
    await Promise.race([
      report.first().waitFor({ state: "visible", timeout: 120_000 }),
      error.first().waitFor({ state: "visible", timeout: 120_000 }),
    ]);

    // If we end up in an error state, it must be explicit (not stuck generating).
    const endedWithError = await error.first().isVisible().catch(() => false);
    if (endedWithError) {
      await expect(error.first()).toBeVisible();
    }
  });
});


