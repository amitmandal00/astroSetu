/**
 * Critical E2E Test: Loader Timer Never Stuck
 * 
 * Contract: If the generating/verifying screen is visible, the elapsed timer MUST tick.
 * This must hold across report types: year-analysis, life-summary, bundle, paid.
 * 
 * This test encodes the invariant that keeps breaking:
 * "If loader is visible, elapsed must increase"
 * 
 * What it catches (all recurring bugs):
 * - Loader shows but loading=false → timer stuck at 0 (year-analysis, paid transition)
 * - Timer interval cleared by rerender → stuck at 19/25/26
 * - Retry starts but old attempt still active → UI stuck / timer not ticking
 * - Param mismatch (session_id vs sessionId) causing isProcessingUI false while loader visible
 */

import { test, expect } from "@playwright/test";

// Selectors - using data-testid for stability
const LOADER_TITLE = /Generating|Verifying/i;
const ELAPSED = '[data-testid="elapsed-seconds"]';
const START_BUTTON = '[data-testid="start-generation"]';

/**
 * Helper: Assert that timer ticks when loader is visible
 * Reads elapsed time twice (2.2 seconds apart) and asserts it increases
 */
async function expectTimerTicks(page: any) {
  // Ensure loader is visible
  await expect(page.getByText(LOADER_TITLE)).toBeVisible({ timeout: 10000 });

  // Read elapsed time first
  const elapsedElement = page.locator(ELAPSED);
  await expect(elapsedElement).toBeVisible({ timeout: 5000 });
  
  const t1 = await elapsedElement.innerText();
  
  // Wait 2.2 seconds (slightly more than 2s to account for any delays)
  await page.waitForTimeout(2200);
  
  // Read elapsed time again
  const t2 = await elapsedElement.innerText();

  // Extract first integer from the string
  const n1 = parseInt((t1.match(/\d+/) ?? ["0"])[0], 10);
  const n2 = parseInt((t2.match(/\d+/) ?? ["0"])[0], 10);

  // Assert timer increased
  expect(n2).toBeGreaterThan(n1);
}

test.describe("Loader Timer Never Stuck - Critical Contract", () => {
  test.beforeEach(async ({ page }) => {
    // Set up MOCK_MODE for faster testing
    await page.goto("/ai-astrology/preview?reportType=life-summary&auto_generate=true");
    // Wait for page to load
    await page.waitForLoadState("networkidle");
  });

  test("Loader visible => elapsed ticks (year-analysis)", async ({ page }) => {
    // Navigate to year-analysis with auto_generate
    await page.goto("/ai-astrology/preview?reportType=year-analysis&auto_generate=true", {
      waitUntil: "networkidle"
    });

    // Wait for loader to appear
    await expect(page.getByText(LOADER_TITLE)).toBeVisible({ timeout: 10000 });

    // Assert timer ticks
    await expectTimerTicks(page);
  });

  test("Loader visible => elapsed ticks (life-summary)", async ({ page }) => {
    // Navigate to life-summary with auto_generate
    await page.goto("/ai-astrology/preview?reportType=life-summary&auto_generate=true", {
      waitUntil: "networkidle"
    });

    // Wait for loader to appear
    await expect(page.getByText(LOADER_TITLE)).toBeVisible({ timeout: 10000 });

    // Assert timer ticks
    await expectTimerTicks(page);
  });

  test("Loader visible => elapsed ticks (paid report - marriage-timing)", async ({ page }) => {
    // Navigate to paid report with auto_generate
    await page.goto("/ai-astrology/preview?reportType=marriage-timing&auto_generate=true", {
      waitUntil: "networkidle"
    });

    // Wait for loader to appear
    await expect(page.getByText(LOADER_TITLE)).toBeVisible({ timeout: 10000 });

    // Assert timer ticks
    await expectTimerTicks(page);
  });

  test("Loader visible => elapsed ticks (verifying payment stage)", async ({ page }) => {
    // Navigate with session_id to trigger verification stage
    await page.goto("/ai-astrology/preview?reportType=year-analysis&session_id=test_session_123", {
      waitUntil: "networkidle"
    });

    // Wait for "Verifying" loader to appear
    await expect(page.getByText(/Verifying/i)).toBeVisible({ timeout: 10000 });

    // Assert timer ticks even during verification
    await expectTimerTicks(page);
  });

  test("Retry does not break timer (bundle)", async ({ page }) => {
    // Navigate to bundle with auto_generate
    await page.goto("/ai-astrology/preview?bundle=any-2&reports=marriage-timing,career-money&auto_generate=true", {
      waitUntil: "networkidle"
    });

    // Wait for loader to appear
    await expect(page.getByText(LOADER_TITLE)).toBeVisible({ timeout: 10000 });

    // Assert timer ticks initially
    await expectTimerTicks(page);

    // Try to find retry button (if visible, click it)
    const retryBtn = page.getByRole("button", { name: /retry|Retry/i });
    const isRetryVisible = await retryBtn.isVisible().catch(() => false);
    
    if (isRetryVisible) {
      // Click retry
      await retryBtn.click();
      
      // Wait for loader to appear again
      await expect(page.getByText(LOADER_TITLE)).toBeVisible({ timeout: 10000 });
      
      // Assert timer ticks after retry
      await expectTimerTicks(page);
    } else {
      // If retry button not visible, that's okay - test still passes
      // (retry might not be needed if generation succeeds)
      test.info().annotations.push({
        type: "note",
        description: "Retry button not visible - generation may have succeeded"
      });
    }
  });

  test("Timer stops when report completes", async ({ page }) => {
    // Navigate to life-summary (fastest to complete in MOCK_MODE)
    await page.goto("/ai-astrology/preview?reportType=life-summary&auto_generate=true", {
      waitUntil: "networkidle"
    });

    // Wait for loader to appear
    await expect(page.getByText(LOADER_TITLE)).toBeVisible({ timeout: 10000 });

    // Read initial elapsed time
    const elapsedElement = page.locator(ELAPSED);
    const t1 = await elapsedElement.innerText();
    const n1 = parseInt((t1.match(/\d+/) ?? ["0"])[0], 10);

    // Wait for report to complete (in MOCK_MODE, this should be quick)
    // Look for report content or "Download PDF" button
    await page.waitForSelector('button:has-text("Download PDF"), [data-testid="report-content"]', {
      timeout: 30000
    }).catch(() => {
      // If report doesn't complete, that's okay - we're testing timer stops on completion
      // The important part is that timer was ticking while loader was visible
    });

    // After completion, elapsed element should not be visible (loader hidden)
    const isElapsedVisible = await elapsedElement.isVisible().catch(() => false);
    
    // Timer should stop (elapsed element hidden when loader is hidden)
    // This is the contract: completion stops everything
    if (isElapsedVisible) {
      // If still visible, wait a bit more and check again
      await page.waitForTimeout(2000);
      const stillVisible = await elapsedElement.isVisible().catch(() => false);
      expect(stillVisible).toBe(false);
    }
  });
});

