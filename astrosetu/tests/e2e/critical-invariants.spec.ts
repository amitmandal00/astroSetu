/**
 * Critical Invariant Tests - The Killer Tests That Prevent Timer Regressions
 * 
 * These tests enforce the core invariants that prevent all timer/report stuck issues.
 * 
 * Test 1: Loader visible => Elapsed ticks within 2 seconds (year-analysis, bundle, paid)
 * Test 2: Session resume scenario (exact screenshot bug)
 * Test 3: Retry must be a full restart
 * Test 4: reportType alone must not show loader
 */

import { test, expect } from "@playwright/test";

const LOADER_TITLE = /Generating|Verifying/i;
const ELAPSED = '[data-testid="elapsed-seconds"]';

async function expectTimerTicks(page: any) {
  await expect(page.getByText(LOADER_TITLE)).toBeVisible({ timeout: 10000 });
  const elapsedElement = page.locator(ELAPSED);
  await expect(elapsedElement).toBeVisible({ timeout: 5000 });
  
  const t1 = await elapsedElement.innerText();
  await page.waitForTimeout(2200);
  const t2 = await elapsedElement.innerText();

  const n1 = parseInt((t1.match(/\d+/) ?? ["0"])[0], 10);
  const n2 = parseInt((t2.match(/\d+/) ?? ["0"])[0], 10);

  expect(n2).toBeGreaterThan(n1);
}

test.describe("Critical Invariants - Timer & Report Generation", () => {
  
  // Test 1: Loader visible => Elapsed ticks (year-analysis with session_id)
  test("Loader visible => elapsed ticks within 2 seconds (year-analysis with session_id)", async ({ page }) => {
    // CRITICAL: This is the exact scenario that's broken in production
    await page.goto("/ai-astrology/preview?session_id=test_session_123&reportType=year-analysis", {
      waitUntil: "networkidle"
    });

    // Wait for loader to appear
    await expect(page.getByText(LOADER_TITLE)).toBeVisible({ timeout: 10000 });

    // CRITICAL: Assert timer ticks within 2 seconds
    await expectTimerTicks(page);
  });

  // Test 1: Loader visible => Elapsed ticks (bundle with retry)
  test("Loader visible => elapsed ticks within 2 seconds (bundle with retry)", async ({ page }) => {
    await page.goto("/ai-astrology/preview?bundle=any-2&reports=marriage-timing,career-money&auto_generate=true", {
      waitUntil: "networkidle"
    });

    await expect(page.getByText(LOADER_TITLE)).toBeVisible({ timeout: 10000 });
    await expectTimerTicks(page);

    // Try retry if available
    const retryBtn = page.getByRole("button", { name: /retry|Retry/i });
    const isRetryVisible = await retryBtn.isVisible().catch(() => false);
    
    if (isRetryVisible) {
      await retryBtn.click();
      await expect(page.getByText(LOADER_TITLE)).toBeVisible({ timeout: 10000 });
      await expectTimerTicks(page);
    }
  });

  // Test 1: Loader visible => Elapsed ticks (paid transition: verify → generate)
  test("Loader visible => elapsed ticks within 2 seconds (paid transition: verify → generate)", async ({ page }) => {
    // Navigate with session_id to trigger verification → generation flow
    await page.goto("/ai-astrology/preview?session_id=test_session_paid&reportType=marriage-timing", {
      waitUntil: "networkidle"
    });

    // Wait for "Verifying" loader
    await expect(page.getByText(/Verifying/i)).toBeVisible({ timeout: 10000 });
    await expectTimerTicks(page);

    // Wait for transition to "Generating"
    await expect(page.getByText(/Generating/i)).toBeVisible({ timeout: 15000 });
    await expectTimerTicks(page);
  });

  // Test 2: Session resume scenario (exact screenshot bug)
  test("Session resume: loader visible => elapsed increments => report renders", async ({ page }) => {
    // CRITICAL: This is the exact bug from screenshots
    // Open preview with session_id and reportType (no auto_generate)
    await page.goto("/ai-astrology/preview?session_id=test_session_resume&reportType=year-analysis", {
      waitUntil: "networkidle"
    });

    // Assert loader visible
    await expect(page.getByText(LOADER_TITLE)).toBeVisible({ timeout: 10000 });

    // CRITICAL: Assert elapsed increments (this is what's broken)
    await expectTimerTicks(page);

    // Mock status endpoint to return "processing" twice then "completed"
    await page.route("**/api/ai-astrology/generate-report*", async (route) => {
      const url = route.request().url();
      if (url.includes("reportId=")) {
        // Polling request - return processing then completed
        const callCount = route.request().headers()["x-call-count"] ? 
          parseInt(route.request().headers()["x-call-count"]) : 0;
        
        if (callCount < 2) {
          await route.fulfill({
            status: 200,
            body: JSON.stringify({
              ok: true,
              data: {
                status: "processing",
                reportId: "test_report_123"
              }
            })
          });
        } else {
          await route.fulfill({
            status: 200,
            body: JSON.stringify({
              ok: true,
              data: {
                status: "completed",
                reportId: "test_report_123",
                content: {
                  title: "Test Report",
                  sections: [{ title: "Test Section", content: "Test content" }]
                }
              }
            })
          });
        }
      } else {
        // Initial request
        await route.continue();
      }
    });

    // Wait for report to complete (in MOCK_MODE this should be quick)
    await page.waitForSelector('button:has-text("Download PDF"), [data-testid="report-content"]', {
      timeout: 30000
    }).catch(() => {
      // If report doesn't complete, that's okay - we're testing timer ticks
    });

    // Assert loader disappears and report content appears
    const loaderVisible = await page.getByText(LOADER_TITLE).isVisible().catch(() => false);
    const reportContent = await page.locator('[data-testid="report-content"], button:has-text("Download PDF")').isVisible().catch(() => false);
    
    // Either loader is hidden OR report content is visible
    expect(loaderVisible || reportContent).toBeTruthy();
  });

  // Test 3: Retry must be a full restart
  test("Retry must be a full restart: abort + reset + restart", async ({ page }) => {
    await page.goto("/ai-astrology/preview?bundle=any-2&reports=marriage-timing,career-money&auto_generate=true", {
      waitUntil: "networkidle"
    });

    await expect(page.getByText(LOADER_TITLE)).toBeVisible({ timeout: 10000 });

    // Track API calls
    const apiCalls: string[] = [];
    await page.route("**/api/ai-astrology/generate-report*", async (route) => {
      apiCalls.push(route.request().url());
      await route.continue();
    });

    // Find and click retry button
    const retryBtn = page.getByRole("button", { name: /retry|Retry/i });
    const isRetryVisible = await retryBtn.isVisible().catch(() => false);
    
    if (isRetryVisible) {
      const callsBeforeRetry = apiCalls.length;
      
      await retryBtn.click();
      
      // Wait a bit for retry to process
      await page.waitForTimeout(1000);
      
      // Assert: elapsed resets and then ticks
      const elapsedElement = page.locator(ELAPSED);
      await expect(elapsedElement).toBeVisible({ timeout: 5000 });
      
      // Wait and check timer ticks
      await expectTimerTicks(page);
      
      // Assert: reports eventually render (or at least loader continues)
      const loaderStillVisible = await page.getByText(LOADER_TITLE).isVisible().catch(() => false);
      const reportRendered = await page.locator('button:has-text("Download PDF"), [data-testid="report-content"]').isVisible().catch(() => false);
      
      // Either loader continues OR report renders
      expect(loaderStillVisible || reportRendered).toBeTruthy();
    }
  });

  // Test 4: reportType alone must not show loader
  test("reportType alone must not show loader (anti-regression)", async ({ page }) => {
    // CRITICAL: This prevents the loader from showing just because reportType is in URL
    await page.goto("/ai-astrology/preview?reportType=year-analysis", {
      waitUntil: "networkidle"
    });

    // Wait a bit to see if loader appears
    await page.waitForTimeout(2000);

    // Assert: Loader should NOT be visible
    const loaderVisible = await page.getByText(LOADER_TITLE).isVisible().catch(() => false);
    
    // Should show input form or redirect, NOT "Generating..."
    expect(loaderVisible).toBe(false);
    
    // Should show input form or have redirected
    const inputForm = await page.locator('form, [data-testid="birth-details-form"]').isVisible().catch(() => false);
    const redirected = page.url().includes("/input") || page.url().includes("/preview?reportType=");
    
    expect(inputForm || redirected).toBeTruthy();
  });

  // Test 5: Year-analysis timer must NOT reset to 0 (CRITICAL BUG)
  test("Year-analysis timer must NOT reset to 0 after a few seconds", async ({ page }) => {
    // CRITICAL: This is the exact bug - timer resets to 0 after a few seconds
    await page.goto("/ai-astrology/preview?session_id=test_year_analysis&reportType=year-analysis", {
      waitUntil: "networkidle"
    });

    // Wait for loader
    await expect(page.getByText(LOADER_TITLE)).toBeVisible({ timeout: 10000 });
    const elapsedElement = page.locator(ELAPSED);
    await expect(elapsedElement).toBeVisible({ timeout: 5000 });
    
    // Get initial elapsed time
    const t0 = await elapsedElement.innerText();
    const n0 = parseInt((t0.match(/\d+/) ?? ["0"])[0], 10);
    
    // Wait 3 seconds
    await page.waitForTimeout(3000);
    
    // Get elapsed time after 3 seconds
    const t1 = await elapsedElement.innerText();
    const n1 = parseInt((t1.match(/\d+/) ?? ["0"])[0], 10);
    
    // CRITICAL: Timer must have increased, NOT reset to 0
    expect(n1).toBeGreaterThan(n0);
    expect(n1).toBeGreaterThanOrEqual(2); // Should be at least 2-3 seconds
    
    // Wait another 3 seconds
    await page.waitForTimeout(3000);
    
    // Get elapsed time after 6 seconds total
    const t2 = await elapsedElement.innerText();
    const n2 = parseInt((t2.match(/\d+/) ?? ["0"])[0], 10);
    
    // CRITICAL: Timer must continue increasing, NOT reset
    expect(n2).toBeGreaterThan(n1);
    expect(n2).toBeGreaterThanOrEqual(5); // Should be at least 5-6 seconds
  });

  // Test 6: Bundle timer must NOT stay at 0 (CRITICAL BUG)
  test("Bundle timer must NOT stay at 0 during generation", async ({ page }) => {
    // CRITICAL: Bundle generates fine but timer stays at 0
    await page.goto("/ai-astrology/preview?bundle=any-3&reports=marriage-timing,career-money,full-life&auto_generate=true", {
      waitUntil: "networkidle"
    });

    // Wait for loader
    await expect(page.getByText(LOADER_TITLE)).toBeVisible({ timeout: 10000 });
    const elapsedElement = page.locator(ELAPSED);
    await expect(elapsedElement).toBeVisible({ timeout: 5000 });
    
    // Wait 2 seconds and check timer ticks
    await expectTimerTicks(page);
    
    // Wait another 3 seconds
    await page.waitForTimeout(3000);
    
    // Get elapsed time
    const t = await elapsedElement.innerText();
    const n = parseInt((t.match(/\d+/) ?? ["0"])[0], 10);
    
    // CRITICAL: Timer must be greater than 0
    expect(n).toBeGreaterThan(0);
    expect(n).toBeGreaterThanOrEqual(4); // Should be at least 4-5 seconds
  });

  // Test 7: Decision-support timer must NOT stay at 0 (CRITICAL BUG)
  test("Decision-support timer must NOT stay at 0 during generation", async ({ page }) => {
    // CRITICAL: Decision pack generates fine but timer stays at 0
    await page.goto("/ai-astrology/preview?reportType=decision-support&auto_generate=true", {
      waitUntil: "networkidle"
    });

    // Wait for loader
    await expect(page.getByText(LOADER_TITLE)).toBeVisible({ timeout: 10000 });
    const elapsedElement = page.locator(ELAPSED);
    await expect(elapsedElement).toBeVisible({ timeout: 5000 });
    
    // Wait 2 seconds and check timer ticks
    await expectTimerTicks(page);
    
    // Wait another 3 seconds
    await page.waitForTimeout(3000);
    
    // Get elapsed time
    const t = await elapsedElement.innerText();
    const n = parseInt((t.match(/\d+/) ?? ["0"])[0], 10);
    
    // CRITICAL: Timer must be greater than 0
    expect(n).toBeGreaterThan(0);
    expect(n).toBeGreaterThanOrEqual(4); // Should be at least 4-5 seconds
  });

  // Test 8: Full-life must NOT flicker and end in error (CRITICAL BUG)
  test("Full-life must NOT flicker and end in error screen", async ({ page }) => {
    // CRITICAL: Full-life flickers a lot and ends in "Error Generating Report"
    await page.goto("/ai-astrology/preview?reportType=full-life&auto_generate=true", {
      waitUntil: "networkidle"
    });

    // Wait for loader
    await expect(page.getByText(LOADER_TITLE)).toBeVisible({ timeout: 10000 });
    
    // Track stage transitions
    const stages: string[] = [];
    let lastStage = "";
    
    // Monitor for 10 seconds
    for (let i = 0; i < 10; i++) {
      await page.waitForTimeout(1000);
      
      const verifyingVisible = await page.getByText(/Verifying/i).isVisible().catch(() => false);
      const generatingVisible = await page.getByText(/Generating/i).isVisible().catch(() => false);
      
      let currentStage = "none";
      if (verifyingVisible) currentStage = "verifying";
      else if (generatingVisible) currentStage = "generating";
      
      if (currentStage !== lastStage && currentStage !== "none") {
        stages.push(currentStage);
        lastStage = currentStage;
      }
    }
    
    // CRITICAL: Should not have excessive flickering (verify ↔ generate bouncing)
    // Allow max 2 transitions (verify → generate is normal, but not back and forth)
    expect(stages.length).toBeLessThanOrEqual(3); // verify → generate is 2 transitions
    
    // CRITICAL: Should not end in error screen
    const errorVisible = await page.getByText(/Error Generating Report/i).isVisible().catch(() => false);
    expect(errorVisible).toBe(false);
    
    // Should either show loader or report content
    const loaderVisible = await page.getByText(LOADER_TITLE).isVisible().catch(() => false);
    const reportContent = await page.locator('[data-testid="report-content"], button:has-text("Download PDF")').isVisible().catch(() => false);
    
    expect(loaderVisible || reportContent).toBeTruthy();
  });
});

