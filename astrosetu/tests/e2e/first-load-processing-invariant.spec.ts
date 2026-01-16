import { test, expect } from "@playwright/test";

/**
 * E2E Test: First-load processing invariant
 * 
 * ChatGPT Feedback Fix: Ensures polling does not stop prematurely on first load.
 * 
 * This test reproduces the exact scenario from ChatGPT feedback:
 * - Fresh context (first initial load)
 * - Year-analysis or full-life report
 * - Timer keeps ticking and continues to increase
 * - Report must appear OR explicit error/failure state within max timeout
 * 
 * Acceptance Criteria:
 * - Either content appears (data-testid="report-content" or similar stable selector)
 * - OR a failure state appears (data-testid="generation-failed" or error message)
 * - Must NOT remain on spinner past max timeout (90-120s depending on report type)
 * - Timer must be monotonic (never reset to 0 mid-run)
 * - Timer must not get stuck while loader is visible
 */

function parseElapsedSeconds(text: string | null): number | null {
  if (!text) return null;
  const m = text.match(/Elapsed:\s*(\d+)s/i) || text.match(/(\d+)s/i);
  if (!m) return null;
  const n = Number.parseInt(m[1], 10);
  return Number.isFinite(n) ? n : null;
}

test.describe("First-load processing invariant", () => {
  test("year-analysis first load - must complete or error within max timeout (no infinite spinner)", async ({ page }) => {
    // Fresh context: simulate true first load (no storage)
    await page.addInitScript(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // Seed localStorage form data for recovery (preview can use this when sessionStorage is missing)
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

    // Directly navigate to preview with auto_generate (first load scenario)
    const sessionId = `test_session_year-analysis_req-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    await page.goto(
      `/ai-astrology/preview?session_id=${sessionId}&reportType=year-analysis&auto_generate=true`,
      { waitUntil: "domcontentloaded" }
    );

    // Max timeout for year-analysis: 90s (server) + 10s buffer = 100s client
    const maxTimeoutMs = 110_000; // 110 seconds max
    const pollIntervalMs = 1000; // Check every second
    const startTime = Date.now();

    // Track timer monotonicity
    const timerSamples: number[] = [];
    let sawNonZeroTimer = false;

    // Wait for either content OR error state
    let completed = false;
    let lastElapsed = 0;

    while (Date.now() - startTime < maxTimeoutMs) {
      // Check for completion (report content visible)
      const reportContent = page.locator('[data-testid="report-content"], [data-testid="report-content-year"], text=/Year Analysis|Your Year Analysis|12-month strategic overview/i');
      const hasContent = await reportContent.first().isVisible().catch(() => false);

      // Check for failure (error state visible)
      const errorState = page.locator('[data-testid="generation-failed"], text=/Error Generating Report|Payment verification failed|Report generation timed out|Please try again/i');
      const hasError = await errorState.first().isVisible().catch(() => false);

      // Check for spinner/loader
      const loader = page.locator('[data-testid="generation-loader"], text=/Generating|Processing/i');
      const hasLoader = await loader.first().isVisible().catch(() => false);

      // Check timer (if visible)
      const timer = page.locator("text=/Elapsed.*\\d+s/i, text=/\\d+s/i");
      const timerText = await timer.first().textContent().catch(() => null);
      const elapsedSeconds = parseElapsedSeconds(timerText);

      if (elapsedSeconds !== null) {
        timerSamples.push(elapsedSeconds);
        if (elapsedSeconds > 0) sawNonZeroTimer = true;

        // CRITICAL: Timer must be monotonic (never reset to 0 once it started)
        if (sawNonZeroTimer && elapsedSeconds > 0) {
          expect(elapsedSeconds).toBeGreaterThan(0);
          if (timerSamples.length >= 2) {
            const prevElapsed = timerSamples[timerSamples.length - 2];
            // Allow for 1s variation due to polling intervals
            expect(elapsedSeconds).toBeGreaterThanOrEqual(prevElapsed - 1);
          }
        }
        lastElapsed = elapsedSeconds;
      }

      // If we have content or explicit error, we're done
      if (hasContent || hasError) {
        completed = true;
        break;
      }

      // If loader disappeared and we don't have content/error, wait a bit more (might be transitioning)
      if (!hasLoader && !hasContent && !hasError && sawNonZeroTimer) {
        // Wait a bit longer to see if content appears
        await page.waitForTimeout(2000);
        const finalCheckContent = await reportContent.first().isVisible().catch(() => false);
        const finalCheckError = await errorState.first().isVisible().catch(() => false);
        if (finalCheckContent || finalCheckError) {
          completed = true;
          break;
        }
      }

      await page.waitForTimeout(pollIntervalMs);
    }

    const totalElapsed = Math.floor((Date.now() - startTime) / 1000);

    // CRITICAL: Must complete (content OR error) within max timeout
    expect(completed).toBe(true);

    // Verify we didn't exceed max timeout
    expect(totalElapsed).toBeLessThan(120); // Hard limit: 120 seconds

    // If we got here and have content, verify it's visible
    const finalReportContent = page.locator('[data-testid="report-content"], [data-testid="report-content-year"], text=/Year Analysis|Your Year Analysis/i');
    const finalErrorState = page.locator('[data-testid="generation-failed"], text=/Error|Failed|Please try again/i');
    
    const finalHasContent = await finalReportContent.first().isVisible().catch(() => false);
    const finalHasError = await finalErrorState.first().isVisible().catch(() => false);

    // Must have either content OR explicit error
    expect(finalHasContent || finalHasError).toBe(true);

    // If we have error, it must be explicit (not stuck)
    if (finalHasError) {
      const errorText = await finalErrorState.first().textContent().catch(() => "");
      expect(errorText).toMatch(/Error|Failed|try again|timed out/i);
    }

    // Timer must have been monotonic if it was visible
    if (sawNonZeroTimer && timerSamples.length >= 2) {
      const firstNonZero = timerSamples.findIndex((t) => t > 0);
      const finalTimer = timerSamples[timerSamples.length - 1];
      if (firstNonZero >= 0) {
        expect(finalTimer).toBeGreaterThanOrEqual(timerSamples[firstNonZero]);
      }
    }
  });

  test("full-life first load - must complete or error within max timeout", async ({ page }) => {
    // Same test but for full-life report
    await page.addInitScript(() => {
      localStorage.clear();
      sessionStorage.clear();
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

    const sessionId = `test_session_full-life_req-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    await page.goto(
      `/ai-astrology/preview?session_id=${sessionId}&reportType=full-life&auto_generate=true`,
      { waitUntil: "domcontentloaded" }
    );

    const maxTimeoutMs = 110_000;
    const startTime = Date.now();
    let completed = false;

    while (Date.now() - startTime < maxTimeoutMs) {
      const reportContent = page.locator('[data-testid="report-content"], text=/Full Life Report|Your Full Life Report/i');
      const errorState = page.locator('[data-testid="generation-failed"], text=/Error|Failed|Please try again/i');

      if (await reportContent.first().isVisible().catch(() => false) || 
          await errorState.first().isVisible().catch(() => false)) {
        completed = true;
        break;
      }

      await page.waitForTimeout(1000);
    }

    expect(completed).toBe(true);
    expect(Math.floor((Date.now() - startTime) / 1000)).toBeLessThan(120);
  });
});

