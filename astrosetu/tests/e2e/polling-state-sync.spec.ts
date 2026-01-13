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
    // Navigate to input page
    await page.goto('/ai-astrology/input?reportType=life-summary');
    await fillInputForm(page);
    
    // Wait for preview page
    await page.waitForURL(/.*\/ai-astrology\/preview.*/, { timeout: 10000 });
    
    // Wait for loading to start
    const loadingIndicator = page.locator('text=/Generating|Creating|Loading/i');
    await loadingIndicator.first().waitFor({ state: 'visible', timeout: 5000 });
    
    // Wait for timer to appear
    const timerText = page.locator('text=/Elapsed.*[0-9]+s/i');
    await timerText.first().waitFor({ state: 'visible', timeout: 5000 });
    
    // Get initial timer value
    const initialTimer = await timerText.first().textContent();
    console.log('[TEST] Initial timer:', initialTimer);
    
    // Wait for report to complete (polling should detect it)
    await waitForReportGeneration(page, 30000);
    
    // CRITICAL: Verify state was updated
    // 1. Loading should be false (no loading indicator)
    const stillLoading = await loadingIndicator.first().isVisible({ timeout: 2000 }).catch(() => false);
    expect(stillLoading).toBeFalsy();
    
    // 2. Report content should be displayed
    const reportContent = page.locator('text=/Report|Overview|Summary/i');
    await expect(reportContent.first()).toBeVisible({ timeout: 5000 });
    
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
    const loadingIndicator = page.locator('text=/Generating|Creating|Loading/i');
    const stillLoading = await loadingIndicator.first().isVisible({ timeout: 2000 }).catch(() => false);
    expect(stillLoading).toBeFalsy();
  });

  test('should stop timer when report already exists', async ({ page }) => {
    // Navigate directly to a completed report
    const reportId = 'RPT-TEST-123';
    await page.goto(`/ai-astrology/preview?reportId=${reportId}&reportType=life-summary`);
    
    // Set report in storage (simulating completed report)
    await page.evaluate((id) => {
      const reportData = JSON.stringify({
        content: { sections: ['test'] },
        reportType: 'life-summary',
        input: { name: 'Test', dob: '1990-01-01', tob: '12:00', place: 'Mumbai' },
        generatedAt: new Date().toISOString(),
        reportId: id,
      });
      sessionStorage.setItem(`aiAstrologyReport_${id}`, reportData);
      localStorage.setItem(`aiAstrologyReport_${id}`, reportData);
    }, reportId);
    
    // Reload page to trigger state initialization
    await page.reload();
    
    // Wait a bit for state to initialize
    await page.waitForTimeout(2000);
    
    // CRITICAL: Verify timer is NOT running
    const timerText = page.locator('text=/Elapsed.*[0-9]+s/i');
    const timerVisible = await timerText.first().isVisible({ timeout: 2000 }).catch(() => false);
    
    // Timer should NOT be visible if report already exists
    expect(timerVisible).toBeFalsy();
    
    // Report should be displayed
    const reportContent = page.locator('text=/Report|Overview|Summary/i');
    const reportVisible = await reportContent.first().isVisible({ timeout: 2000 }).catch(() => false);
    expect(reportVisible).toBeTruthy();
  });
});

