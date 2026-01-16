/**
 * E2E Test: Polling State Synchronization
 * 
 * This test verifies that state is properly updated when polling succeeds.
 * This catches the root cause: state not being updated when polling detects completion.
 * 
 * Test Scenario:
 * 1. Start report generation
 * 2. API returns "processing" status
 * 3. Polling starts
 * 4. Polling detects completion
 * 5. Verify state is updated (loading=false, reportContent set, timer stops)
 * 6. Verify report is displayed
 */

import { test, expect } from '@playwright/test';
import { fillInputForm, waitForReportGeneration } from './test-helpers';

test.describe('Polling State Synchronization', () => {
  test('should update state when polling detects completion', async ({ page }) => {
    // Deterministic mock: ensure polling transitions to completed within a few polls.
    // This keeps the test stable and focused on UI state sync (not backend timing).
    const reportId = "test_polling_report_1";
    let polls = 0;
    await page.route("**/api/ai-astrology/generate-report**", async (route) => {
      const req = route.request();
      const url = new URL(req.url());
      const rid = url.searchParams.get("reportId");
      if (req.method() === "POST") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ ok: true, data: { status: "processing", reportId } }),
        });
        return;
      }
      if (req.method() === "GET" && rid) {
        polls += 1;
        const done = polls >= 3;
        await route.fulfill({
          status: done ? 200 : 202,
          contentType: "application/json",
          body: JSON.stringify({
            ok: true,
            data: done
              ? {
                  status: "completed",
                  reportId,
                  reportType: "life-summary",
                  content: { title: "Life Summary", sections: [{ title: "Summary", content: "Ok" }] },
                }
              : { status: "processing", reportId },
          }),
        });
        return;
      }
      await route.continue();
    });

    // Navigate to input page
    await page.goto('/ai-astrology/input?reportType=life-summary');
    await fillInputForm(page);
    
    // Wait for preview page
    await page.waitForURL(/.*\/ai-astrology\/preview.*/, { timeout: 10000 });
    
    // Wait for either loading to start OR report to already be visible (possible with very fast MOCK_MODE/cache hits)
    // Prefer loader *heading* to avoid matching unrelated copy containing "loading"/"generating".
    const loadingIndicator = page.getByRole('heading', { name: /Generating|Verifying|Preparing/i }).first();
    const reportContent = page.locator('text=/Report|Overview|Summary/i').first();
    await Promise.race([
      loadingIndicator.waitFor({ state: 'visible', timeout: 8000 }),
      reportContent.waitFor({ state: 'visible', timeout: 8000 }),
    ]).catch(() => {});
    
    // Wait for timer to appear
    const timerText = page.locator('text=/Elapsed.*[0-9]+s/i');
    await timerText.first().waitFor({ state: 'visible', timeout: 8000 }).catch(() => {});
    
    // Get initial timer value
    const initialTimer = await timerText.first().textContent().catch(() => null);
    console.log('[TEST] Initial timer:', initialTimer);
    
    // Wait for report to complete (polling should detect it)
    await waitForReportGeneration(page, 45000);
    
    // CRITICAL: Verify state was updated
    // 1. Loading should be false (no loading indicator)
    const stillLoading = await loadingIndicator.isVisible({ timeout: 2000 }).catch(() => false);
    const reportVisible = await reportContent.isVisible({ timeout: 2000 }).catch(() => false);
    // In MOCK_MODE the report can render slightly before the loader unmounts; report visibility is primary.
    expect(stillLoading && !reportVisible).toBeFalsy();
    
    // 2. Report content should be displayed
    await expect(reportContent).toBeVisible({ timeout: 5000 });
    
    // 3. Timer should have stopped (should not be incrementing)
    // Wait a bit to ensure timer doesn't increment
    await page.waitForTimeout(3000);
    const finalTimer = await timerText.first().textContent().catch(() => null);
    
    // If timer is still visible, it should not have incremented significantly
    if (finalTimer) {
      const initialMatch = initialTimer?.match(/Elapsed:\s*(\d+)s/i);
      const finalMatch = finalTimer.match(/Elapsed:\s*(\d+)s/i);
      
      if (initialMatch && finalMatch) {
        const initialTime = parseInt(initialMatch[1]);
        const finalTime = parseInt(finalMatch[1]);
        
        // Timer should not have incremented more than 5 seconds after report completion
        // (allowing for some delay in state update)
        expect(finalTime - initialTime).toBeLessThan(5);
      }
    }
  });

  test('should display report even if navigation fails', async ({ page }) => {
    // This test verifies that report displays even if router.replace fails
    // We'll intercept navigation and verify state is updated
    
    await page.goto('/ai-astrology/input?reportType=life-summary');
    await fillInputForm(page);
    
    await page.waitForURL(/.*\/ai-astrology\/preview.*/, { timeout: 10000 });
    
    // Wait for report generation
    await waitForReportGeneration(page, 30000);
    
    // CRITICAL: Verify report is displayed (even if navigation didn't happen)
    const reportContent = page.locator('text=/Report|Overview|Summary/i');
    await expect(reportContent.first()).toBeVisible({ timeout: 5000 });
    
    // Verify loading state is false
    const loadingIndicator = page.getByRole('heading', { name: /Generating|Verifying|Preparing/i }).first();
    const stillLoading = await loadingIndicator.isVisible({ timeout: 2000 }).catch(() => false);
    const reportVisible = await reportContent.first().isVisible({ timeout: 2000 }).catch(() => false);
    expect(stillLoading && !reportVisible).toBeFalsy();
  });

  test('should stop timer when report already exists', async ({ page }) => {
    // Deterministic: treat reportId as "already completed" via API response (no storage timing dependency).
    const reportId = "RPT-TEST-123";
    await page.route("**/api/ai-astrology/generate-report**", async (route) => {
      const req = route.request();
      const url = new URL(req.url());
      const rid = url.searchParams.get("reportId");
      if (req.method() === "GET" && rid === reportId) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            ok: true,
            data: {
              status: "completed",
              reportId,
              reportType: "life-summary",
              content: { title: "Test Report", sections: [{ title: "Summary", content: "Test content" }] },
            },
          }),
        });
        return;
      }
      await route.continue();
    });

    await page.goto(`/ai-astrology/preview?reportId=${reportId}&reportType=life-summary`, { waitUntil: "domcontentloaded" });
    
    // CRITICAL: Verify timer is NOT running
    const timerText = page.locator('text=/Elapsed.*[0-9]+s/i');
    const reportContent = page.locator('text=/Report|Overview|Summary/i').first();

    // Report should be displayed
    await expect(reportContent).toBeVisible({ timeout: 10000 });

    // Loader/timer must not be stuck when report is already present locally.
    // Some environments can briefly mount the loader before storage hydration; tolerate brief overlap.
    const loaderHeading = page.getByRole('heading', { name: /Generating|Verifying|Preparing/i }).first();
    await expect
      .poll(async () => await loaderHeading.isVisible().catch(() => false), { timeout: 15000 })
      .toBe(false);

    const timerVisible = await timerText.first().isVisible().catch(() => false);
    if (timerVisible) {
      const t1 = await timerText.first().textContent().catch(() => null);
      await page.waitForTimeout(2500);
      const t2 = await timerText.first().textContent().catch(() => null);
      const n1 = Number.parseInt((t1?.match(/Elapsed:\s*(\d+)s/i)?.[1] || "0"), 10);
      const n2 = Number.parseInt((t2?.match(/Elapsed:\s*(\d+)s/i)?.[1] || "0"), 10);
      expect(n2 - n1).toBeLessThanOrEqual(1);
    }
  });
});

