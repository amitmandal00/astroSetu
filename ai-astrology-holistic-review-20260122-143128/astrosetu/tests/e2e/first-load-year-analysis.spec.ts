import { test, expect } from "@playwright/test";

/**
 * E2E Test: First-load Year Analysis Cold Start Invariant
 * 
 * ChatGPT Feedback Fix: Tests the production-only "first load stuck" issue
 * 
 * Root Cause: Serverless timeout/cold start + missing long-running route config
 * leaves reports stuck in "processing" status forever.
 * 
 * This test reproduces the exact scenario:
 * - Clean browser context (cold start simulation)
 * - Navigate to year-analysis preview with auto_generate=true
 * - Assert report completes OR explicit error within max timeout (180s)
 * - Assert timer is monotonic (never resets to 0 unexpectedly)
 * 
 * Success Criteria:
 * - Either report content appears OR explicit error state (no infinite timer)
 * - Timer never resets to 0 mid-run
 * - Completion/error within 180s (maxDuration from route config)
 */

function parseElapsedSeconds(text: string | null): number | null {
  if (!text) return null;
  const m = text.match(/Elapsed:\s*(\d+)s/i) || text.match(/(\d+)s/i);
  if (!m) return null;
  const n = Number.parseInt(m[1], 10);
  return Number.isFinite(n) ? n : null;
}

test.describe("First-load Year Analysis Cold Start Invariant", () => {
  test("cold start → year-analysis must complete or error within 180s (no infinite timer)", async ({ page }) => {
    // CRITICAL: Fresh context - simulate true cold start (no cached state)
    await page.addInitScript(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // Seed localStorage form data (preview can recover this when sessionStorage is missing on cold load)
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

    // Navigate to landing page first (simulate user flow)
    await page.goto("/ai-astrology", { waitUntil: "domcontentloaded" });

    // Direct navigation to preview URL with auto_generate=true (first-load scenario)
    // Use test session ID for deterministic backend behavior
    const sessionId = `test_session_year-analysis_req-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    await page.goto(
      `/ai-astrology/preview?session_id=${sessionId}&reportType=year-analysis&auto_generate=true`,
      { waitUntil: "domcontentloaded" }
    );

    // Max timeout: 180s (matches maxDuration from route config)
    // Add 30s buffer for network overhead and UI updates
    const maxTimeoutMs = 210_000; // 210 seconds (180s + 30s buffer)
    const pollIntervalMs = 1000; // Check every second
    const startTime = Date.now();

    // Track timer monotonicity (critical invariant)
    const timerSamples: number[] = [];
    let sawNonZeroTimer = false;
    let lastElapsed = 0;

    // Wait for either content OR error state
    let completed = false;

    while (Date.now() - startTime < maxTimeoutMs) {
      // Check for completion (report content visible)
      const reportContent = page.locator(
        '[data-testid="report-content"], [data-testid="report-content-year"], text=/Year Analysis|Your Year Analysis|12-month strategic overview/i'
      );
      const hasContent = await reportContent.first().isVisible().catch(() => false);

      // Check for failure (error state visible)
      const errorState = page.locator(
        '[data-testid="generation-failed"], text=/Error Generating Report|Payment verification failed|Report generation timed out|Please try again|Generation failed/i'
      );
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

    // CRITICAL: Must complete (content OR error) within max timeout (no infinite timer)
    expect(completed).toBe(true);

    // Verify we didn't exceed max timeout significantly
    expect(totalElapsed).toBeLessThan(240); // Hard limit: 240 seconds (180s + 60s buffer)

    // If we got here and have content, verify it's visible
    const finalReportContent = page.locator(
      '[data-testid="report-content"], [data-testid="report-content-year"], text=/Year Analysis|Your Year Analysis/i'
    );
    const finalErrorState = page.locator(
      '[data-testid="generation-failed"], text=/Error|Failed|Please try again|Generation failed/i'
    );

    const finalHasContent = await finalReportContent.first().isVisible().catch(() => false);
    const finalHasError = await finalErrorState.first().isVisible().catch(() => false);

    // Must have either content OR explicit error (never infinite spinner)
    expect(finalHasContent || finalHasError).toBe(true);

    // If we have error, it must be explicit (not stuck generating)
    if (finalHasError) {
      const errorText = await finalErrorState.first().textContent().catch(() => "");
      expect(errorText).toMatch(/Error|Failed|try again|timed out|Generation failed/i);
    }

    // Timer must have been monotonic if it was visible
    if (sawNonZeroTimer && timerSamples.length >= 2) {
      const firstNonZero = timerSamples.findIndex((t) => t > 0);
      const finalTimer = timerSamples[timerSamples.length - 1];
      if (firstNonZero >= 0) {
        expect(finalTimer).toBeGreaterThanOrEqual(timerSamples[firstNonZero]);
      }
    }

    // CRITICAL ASSERTION: Never reset to 0 mid-run
    if (sawNonZeroTimer) {
      const nonZeroSamples = timerSamples.filter((t) => t > 0);
      if (nonZeroSamples.length >= 2) {
        // After seeing a non-zero value, all subsequent values must also be non-zero
        const firstNonZeroIndex = timerSamples.findIndex((t) => t > 0);
        for (let i = firstNonZeroIndex + 1; i < timerSamples.length; i++) {
          if (timerSamples[i] !== null && timerSamples[i] !== undefined) {
            expect(timerSamples[i]).toBeGreaterThan(0);
          }
        }
      }
    }
  });
});

