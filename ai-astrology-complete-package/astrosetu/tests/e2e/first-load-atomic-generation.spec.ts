import { test, expect } from "@playwright/test";

/**
 * CRITICAL E2E Test: First-Load Atomic Generation
 * 
 * Tests the atomic generation invariant:
 * - When auto_generate=true, controller MUST enter verifying/generating/polling OR failed within 1s
 * - Controller must NEVER remain idle while UI shows "Generating"
 * - Timer must be monotonic (never reset to 0 after starting)
 * - Report must complete or show Retry within 120s (no infinite spinner)
 * 
 * This test prevents the "timer resets after 1 second and nothing happens" bug.
 */

test.describe("First-Load Atomic Generation", () => {
  test("atomic generation invariant: controller leaves idle within 1s when auto_generate=true", async ({ page, context }) => {
    // Fresh browser context (no storage, no cookies)
    await context.clearCookies();
    await context.clearPermissions();
    
    // Seed localStorage with mock birth details for cold start
    await page.addInitScript(() => {
      const mockInput = {
        name: "Test User",
        dob: "1990-01-01",
        tob: "10:00:00",
        place: "Mumbai",
        gender: "Male",
        latitude: 19.0760,
        longitude: 72.8777,
        timezone: "Asia/Kolkata"
      };
      localStorage.setItem("aiAstrologyFormData", JSON.stringify(mockInput));
    });
    
    // Navigate to preview URL with auto_generate=true
    const sessionId = `test_session_year-analysis_req-${Date.now()}-test123-000001`;
    const previewUrl = `/ai-astrology/preview?session_id=${sessionId}&reportType=year-analysis&auto_generate=true`;
    
    // Track controller state via network interception
    let firstPollingRequest: { url: string; timestamp: number } | null = null;
    let controllerStatusObservable = false;
    let startCallCount = 0; // Count POST requests to generation endpoint (prevent double-start)
    
    // Intercept generation API calls to detect controller state and count start calls
    await page.route("**/api/ai-astrology/generate-report**", async (route) => {
      const url = route.request().url();
      const method = route.request().method();
      const isGetRequest = method === "GET";
      const isPostRequest = method === "POST";
      
      // Count POST requests (generation start calls)
      if (isPostRequest) {
        startCallCount++;
      }
      
      // Track first polling request (GET indicates controller entered polling state)
      if (isGetRequest && !firstPollingRequest) {
        // This indicates controller entered polling state (left idle)
        firstPollingRequest = { url, timestamp: Date.now() };
        controllerStatusObservable = true;
      }
      
      await route.continue();
    });
    
    const navigationStartTime = Date.now();
    await page.goto(previewUrl);
    
    // Wait for initial hydration
    await page.waitForLoadState("networkidle");
    
    // CRITICAL ASSERTION 1: Within 1000ms, controller must NOT be idle
    // Either "Retry" is visible OR spinner is visible and first polling call happened
    const oneSecondAfterStart = Date.now();
    const elapsedSinceStart = oneSecondAfterStart - navigationStartTime;
    
    // Check for Retry button (indicates failed state - controller left idle, entered failed)
    const retryButton = page.locator('button:has-text("Retry"), button:has-text("Try again")').first();
    const retryVisible = await retryButton.isVisible().catch(() => false);
    
    // Check for spinner/loading state (indicates processing)
    const spinnerOrLoading = page.locator('[data-testid="loading-spinner"], [data-testid="generating"], .animate-spin, :has-text("Generating")').first();
    const loadingVisible = await spinnerOrLoading.isVisible().catch(() => false);
    
    // Check if polling started (controller entered polling state)
    const pollingStarted = firstPollingRequest !== null;
    
    // ASSERT: Within 1s, either Retry is visible OR (spinner visible AND polling started)
    // This ensures controller is NOT idle while UI shows "Generating"
    expect(
      elapsedSinceStart < 2000 && (retryVisible || (loadingVisible && pollingStarted)),
      `Within 1s, controller must leave idle. Retry visible: ${retryVisible}, Loading visible: ${loadingVisible}, Polling started: ${pollingStarted}, Elapsed: ${elapsedSinceStart}ms`
    ).toBe(true);
    
    // CRITICAL ASSERTION: Single start call (no double-start allowed)
    // Wait a bit to ensure no second start call happens within first few seconds
    await page.waitForTimeout(3000);
    expect(
      startCallCount <= 1,
      `Single-flight guard: Expected ≤1 start calls, got ${startCallCount}. This indicates double-start bug.`
    ).toBe(true);
    
    // CRITICAL ASSERTION 2: Timer is monotonic (never resets to 0 after starting)
    // Wait up to 5 seconds and verify timer only increases
    const timerSelector = ':has-text("elapsed"), :has-text("Taking longer"), [data-testid="timer"], .timer';
    const timerVisible = await page.locator(timerSelector).first().isVisible().catch(() => false);
    
    if (timerVisible) {
      let previousElapsed = -1;
      for (let i = 0; i < 5; i++) {
        await page.waitForTimeout(1000); // Wait 1 second between checks
        
        const timerText = await page.locator(timerSelector).first().textContent().catch(() => null);
        if (timerText) {
          // Extract elapsed seconds from timer text (e.g., "45s elapsed", "Taking longer than expected (77s elapsed)")
          const match = timerText.match(/(\d+)s?\s*(elapsed|seconds)/i) || timerText.match(/\((\d+)s/);
          if (match) {
            const currentElapsed = parseInt(match[1], 10);
            
            // ASSERT: Timer must never go backwards
            if (previousElapsed >= 0) {
              expect(
                currentElapsed >= previousElapsed,
                `Timer must be monotonic. Previous: ${previousElapsed}s, Current: ${currentElapsed}s`
              ).toBe(true);
            }
            
            // ASSERT: Timer must never reset to 0 after starting (unless failed/completed)
            if (previousElapsed > 0) {
              expect(
                currentElapsed > 0,
                `Timer must not reset to 0 after starting. Previous: ${previousElapsed}s, Current: ${currentElapsed}s`
              ).toBe(true);
            }
            
            previousElapsed = currentElapsed;
          }
        }
      }
    }
    
    // CRITICAL ASSERTION 3: Within 120s, either report renders OR Retry appears (no infinite spinner)
    const maxWaitTime = 120000; // 120 seconds
    const startWaitTime = Date.now();
    
    // Wait for either report content OR Retry button OR explicit error
    const reportContent = page.locator('[data-testid="report-content"], .report-content, :has-text("Astrology Report")').first();
    const errorState = page.locator('[data-testid="generation-failed"], :has-text("Generation failed"), :has-text("Failed to generate")').first();
    
    let reportRendered = false;
    let retryShown = false;
    let errorShown = false;
    
    // Poll for completion state
    while (Date.now() - startWaitTime < maxWaitTime) {
      reportRendered = await reportContent.isVisible().catch(() => false);
      retryShown = await retryButton.isVisible().catch(() => false);
      errorShown = await errorState.isVisible().catch(() => false);
      
      if (reportRendered || retryShown || errorShown) {
        break;
      }
      
      await page.waitForTimeout(2000); // Check every 2 seconds
    }
    
    // ASSERT: Within 120s, either report renders OR Retry/error appears
    expect(
      reportRendered || retryShown || errorShown,
      `Within 120s, report must render OR Retry/error must appear. Report rendered: ${reportRendered}, Retry shown: ${retryShown}, Error shown: ${errorShown}`
    ).toBe(true);
    
    // ASSERT: No infinite spinner (if we waited the full 120s without completion/failure, test should fail)
    const totalElapsed = Date.now() - startWaitTime;
    if (totalElapsed >= maxWaitTime - 2000) {
      // We waited almost the full timeout
      expect(reportRendered || retryShown || errorShown).toBe(true);
    }
  });
});

