/**
 * E2E Test: Report Generation Stuck Prevention
 * 
 * Tests to prevent reports from getting stuck:
 * 1. Free report not generating (reported)
 * 2. Yearly analysis report stuck (reported)
 * 3. Bundle report stuck (reported)
 * 4. Individual reports stuck (reported multiple times)
 * 
 * These tests verify reports complete successfully and don't get stuck
 */

import { test, expect } from '@playwright/test';
import { fillInputForm, waitForReportGeneration } from './test-helpers';

test.describe('Report Generation Stuck Prevention', () => {
  test('free report should generate successfully (not get stuck)', async ({ page }) => {
    // This test verifies free reports generate properly
    await page.goto('/ai-astrology/input?reportType=life-summary');
    await fillInputForm(page);
    
    // Wait for preview page
    await page.waitForURL(/.*\/ai-astrology\/preview.*/, { timeout: 10000 });
    
    // Wait for report generation with timeout
    await waitForReportGeneration(page, 20000); // Longer timeout to catch stuck states
    
    // Verify report is displayed (not stuck)
    const reportContent = page.locator('text=/Report|Overview|Summary|Life Summary/i');
    await expect(reportContent.first()).toBeVisible({ timeout: 5000 });
    
    // Verify loading state is gone
    const loadingState = page.locator('text=/Generating.*Report|Creating.*Report/i');
    const stillLoading = await loadingState.first().isVisible({ timeout: 2000 }).catch(() => false);
    
    expect(stillLoading).toBeFalsy();
  });
  
  test('yearly analysis report should generate successfully (not get stuck)', async ({ page }) => {
    // This test verifies year-analysis reports generate properly
    await page.goto('/ai-astrology/input?reportType=year-analysis');
    await fillInputForm(page);
    
    // Wait for preview page
    await page.waitForURL(/.*\/ai-astrology\/preview.*/, { timeout: 10000 });
    
    // Wait for timer to start (payment verification might happen first)
    await page.waitForTimeout(2000);
    
    // Check timer is running (should show elapsed time)
    const timer = page.locator('text=/Elapsed|⏱️|Timer/i');
    const timerVisible = await timer.first().isVisible({ timeout: 3000 }).catch(() => false);
    
    // Wait for report generation (year-analysis is a paid report, may take longer)
    await waitForReportGeneration(page, 25000); // Longer timeout for paid reports
    
    // Verify report is displayed (not stuck)
    const reportContent = page.locator('text=/Report|Overview|Summary|Year Analysis|Year.*Analysis/i');
    await expect(reportContent.first()).toBeVisible({ timeout: 5000 });
    
    // Verify not stuck in loading
    const loadingState = page.locator('text=/Generating.*Report|Creating.*Report/i');
    const stillLoading = await loadingState.first().isVisible({ timeout: 2000 }).catch(() => false);
    
    expect(stillLoading).toBeFalsy();
  });
  
  test('bundle reports should generate successfully (not get stuck after 18 seconds)', async ({ page }) => {
    // This test verifies bundle reports generate properly and don't get stuck at 18 seconds (reported issue)
    await page.goto('/ai-astrology/input?bundle=all-3');
    await fillInputForm(page);
    
    // Wait for preview page
    await page.waitForURL(/.*\/ai-astrology\/preview.*/, { timeout: 10000 });
    
    // Wait for timer to start
    await page.waitForTimeout(2000);
    
    // CRITICAL: Monitor timer at 18 seconds (reported stuck point for 3-report bundles)
    await page.waitForTimeout(16000); // Wait to 18 seconds total
    
    // Verify timer is still running or report completed (not stuck at 18s)
    const timerText = await page.locator('text=/Elapsed.*[1-9][0-9]s|Elapsed.*2[0-9]s/i').first().isVisible({ timeout: 3000 }).catch(() => false);
    const bundleProgress = page.locator('text=/Bundle|Reports|Generating|Progress/i');
    const reportContent = page.locator('text=/Report|Overview|Summary/i');
    const hasProgress = await bundleProgress.first().isVisible({ timeout: 3000 }).catch(() => false);
    const hasContent = await reportContent.first().isVisible({ timeout: 3000 }).catch(() => false);
    
    // Timer should show at least 18s or more (not stuck), OR bundle should be generating/completed
    expect(timerText || hasProgress || hasContent).toBeTruthy();
    
    // Wait more to ensure timer continues past 18 seconds
    await page.waitForTimeout(10000); // Wait to 28 seconds total
    
    // Verify timer is still running or report completed (not stuck)
    const timerTextAfter = await page.locator('text=/Elapsed.*[2-9][0-9]s|Elapsed.*[1-9][0-9][0-9]s/i').first().isVisible({ timeout: 3000 }).catch(() => false);
    const hasProgressAfter = await bundleProgress.first().isVisible({ timeout: 3000 }).catch(() => false);
    const hasContentAfter = await reportContent.first().isVisible({ timeout: 3000 }).catch(() => false);
    
    // Bundle should be generating (progress visible) or completed (content visible) - not stuck
    expect(timerTextAfter || hasProgressAfter || hasContentAfter).toBeTruthy();
    
    // Wait for bundle generation to complete (longer timeout for 3-report bundles)
    await waitForReportGeneration(page, 50000); // 50s additional timeout
    
    // Verify bundle reports completed (not stuck)
    const finalContent = page.locator('text=/Report|Overview|Summary|Bundle/i');
    await expect(finalContent.first()).toBeVisible({ timeout: 5000 });
    
    // Verify not stuck in loading state
    const loadingState = page.locator('text=/Generating.*Report|Creating.*Report/i');
    const stillLoading = await loadingState.first().isVisible({ timeout: 2000 }).catch(() => false);
    expect(stillLoading).toBeFalsy();
  });
  
  test('individual reports should not get stuck', async ({ page }) => {
    // Test multiple individual report types to ensure none get stuck
    const reportTypes = ['marriage-timing', 'career-money', 'full-life'];
    
    for (const reportType of reportTypes) {
      await page.goto(`/ai-astrology/input?reportType=${reportType}`);
      await fillInputForm(page);
      
      // Wait for preview page
      await page.waitForURL(/.*\/ai-astrology\/preview.*/, { timeout: 10000 });
      
      // Wait for report generation
      await waitForReportGeneration(page, 20000);
      
      // Verify report is displayed
      const reportContent = page.locator('text=/Report|Overview|Summary/i');
      await expect(reportContent.first()).toBeVisible({ timeout: 5000 });
      
      // Verify not stuck
      const loadingState = page.locator('text=/Generating.*Report/i');
      const stillLoading = await loadingState.first().isVisible({ timeout: 2000 }).catch(() => false);
      expect(stillLoading).toBeFalsy();
    }
  });
  
  test('report should complete within reasonable time (prevent infinite loading)', async ({ page }) => {
    // This test verifies reports don't hang indefinitely
    await page.goto('/ai-astrology/input?reportType=life-summary');
    await fillInputForm(page);
    
    // Wait for preview page
    await page.waitForURL(/.*\/ai-astrology\/preview.*/, { timeout: 10000 });
    
    // Wait for report with timeout (should complete within 20 seconds in MOCK_MODE)
    await waitForReportGeneration(page, 20000);
    
    // Verify report completed (not stuck in infinite loading)
    const reportContent = page.locator('text=/Report|Overview|Summary/i');
    await expect(reportContent.first()).toBeVisible({ timeout: 5000 });
    
    // Verify loading stopped
    const loadingState = page.locator('text=/Generating.*Report/i');
    const stillLoading = await loadingState.first().isVisible({ timeout: 2000 }).catch(() => false);
    
    // Should not be stuck in loading state
    expect(stillLoading).toBeFalsy();
  });
});

