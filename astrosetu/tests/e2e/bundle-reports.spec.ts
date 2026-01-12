/**
 * E2E Test: Bundle Reports
 * 
 * Tests bundle report generation flows:
 * 1. Navigate to bundle input
 * 2. Fill form
 * 3. Generate multiple reports in bundle
 * 4. Verify all reports are generated
 */

import { test, expect } from '@playwright/test';
import { fillInputForm, waitForReportGeneration } from './test-helpers';

test.describe('Bundle Reports E2E', () => {
  test('should generate any-2 bundle reports successfully (not stuck after 25 seconds)', async ({ page }) => {
    // Navigate to bundle input
    await page.goto('/ai-astrology/input?bundle=any-2');
    
    // Verify we're on the input page
    await expect(page).toHaveURL(/.*\/ai-astrology\/input.*bundle=any-2/);
    
    // Fill the form
    await fillInputForm(page);
    
    // Wait for redirect to preview page
    await page.waitForURL(/.*\/ai-astrology\/preview.*/, { timeout: 10000 });
    
    // Wait for timer to start
    await page.waitForTimeout(2000);
    
    // Monitor timer - it should continue past 25 seconds (previously stuck point)
    await page.waitForTimeout(3000); // Wait to 5 seconds
    
    const timer = page.locator('text=/Elapsed|⏱️|Timer/i');
    const timerVisible = await timer.first().isVisible({ timeout: 3000 }).catch(() => false);
    
    // Wait more to ensure timer continues past 25 seconds (critical stuck point)
    await page.waitForTimeout(25000); // Wait to 30 seconds total
    
    // Verify timer is still running or report completed (not stuck at 25s)
    const bundleProgress = page.locator('text=/Bundle|Reports|Generating/i');
    const reportContent = page.locator('text=/Report|Overview|Summary/i');
    const hasProgress = await bundleProgress.first().isVisible({ timeout: 3000 }).catch(() => false);
    const hasContent = await reportContent.first().isVisible({ timeout: 3000 }).catch(() => false);
    
    // Bundle should be generating (progress visible) or completed (content visible) - not stuck
    expect(hasProgress || hasContent).toBeTruthy();
    
    // Wait for bundle generation to complete (longer timeout for bundles)
    await waitForReportGeneration(page, 30000); // 30s additional timeout
    
    // Verify bundle reports completed
    const finalContent = page.locator('text=/Report|Overview|Summary|Bundle/i');
    await expect(finalContent.first()).toBeVisible({ timeout: 5000 });
    
    // Verify not stuck in loading state
    const loadingState = page.locator('text=/Generating.*Report|Creating.*Report/i');
    const stillLoading = await loadingState.first().isVisible({ timeout: 2000 }).catch(() => false);
    expect(stillLoading).toBeFalsy();
  });
  
  test('should generate all-3 bundle reports successfully (not stuck after 25 seconds)', async ({ page }) => {
    // Navigate to bundle input
    await page.goto('/ai-astrology/input?bundle=all-3');
    
    // Verify we're on the input page
    await expect(page).toHaveURL(/.*\/ai-astrology\/input.*bundle=all-3/);
    
    // Fill the form
    await fillInputForm(page);
    
    // Wait for redirect to preview page
    await page.waitForURL(/.*\/ai-astrology\/preview.*/, { timeout: 10000 });
    
    // Wait for timer to start
    await page.waitForTimeout(2000);
    
    // Monitor timer - it should continue past 25 seconds (previously stuck point)
    await page.waitForTimeout(3000); // Wait to 5 seconds
    
    const timer = page.locator('text=/Elapsed|⏱️|Timer/i');
    const timerVisible = await timer.first().isVisible({ timeout: 3000 }).catch(() => false);
    
    // Wait more to ensure timer continues past 25 seconds (critical stuck point)
    await page.waitForTimeout(25000); // Wait to 30 seconds total
    
    // Verify timer is still running or report completed (not stuck at 25s)
    const bundleProgress = page.locator('text=/Bundle|Reports|Generating/i');
    const reportContent = page.locator('text=/Report|Overview|Summary/i');
    const hasProgress = await bundleProgress.first().isVisible({ timeout: 3000 }).catch(() => false);
    const hasContent = await reportContent.first().isVisible({ timeout: 3000 }).catch(() => false);
    
    // Bundle should be generating (progress visible) or completed (content visible) - not stuck
    expect(hasProgress || hasContent).toBeTruthy();
    
    // Wait for bundle generation to complete (longer timeout for all-3 bundles)
    await waitForReportGeneration(page, 40000); // 40s additional timeout for all-3
    
    // Verify bundle reports completed
    const finalContent = page.locator('text=/Report|Overview|Summary|Bundle/i');
    await expect(finalContent.first()).toBeVisible({ timeout: 5000 });
    
    // Verify not stuck in loading state
    const loadingState = page.locator('text=/Generating.*Report|Creating.*Report/i');
    const stillLoading = await loadingState.first().isVisible({ timeout: 2000 }).catch(() => false);
    expect(stillLoading).toBeFalsy();
  });
});

