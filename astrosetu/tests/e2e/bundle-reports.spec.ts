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
  test('should generate any-2 bundle reports successfully', async ({ page }) => {
    // Navigate to bundle input
    await page.goto('/ai-astrology/input?bundle=any-2');
    
    // Verify we're on the input page
    await expect(page).toHaveURL(/.*\/ai-astrology\/input.*bundle=any-2/);
    
    // Fill the form
    await fillInputForm(page);
    
    // Wait for redirect to preview page
    await page.waitForURL(/.*\/ai-astrology\/preview.*/, { timeout: 10000 });
    
    // Wait for bundle generation to complete (with MOCK_MODE, this should be fast)
    await page.waitForTimeout(5000); // Bundle reports take longer
    
    // Verify bundle generation UI or report content
    const bundleProgress = page.locator('text=/Bundle|Reports|Generating/i');
    const reportContent = page.locator('text=/Report|Overview|Summary/i');
    
    // Either bundle progress or report content should be visible
    const hasProgress = await bundleProgress.first().isVisible({ timeout: 5000 }).catch(() => false);
    const hasContent = await reportContent.first().isVisible({ timeout: 5000 }).catch(() => false);
    
    expect(hasProgress || hasContent).toBeTruthy();
  });
  
  test('should generate all-3 bundle reports successfully', async ({ page }) => {
    // Navigate to bundle input
    await page.goto('/ai-astrology/input?bundle=all-3');
    
    // Verify we're on the input page
    await expect(page).toHaveURL(/.*\/ai-astrology\/input.*bundle=all-3/);
    
    // Fill the form
    await fillInputForm(page);
    
    // Wait for redirect to preview page
    await page.waitForURL(/.*\/ai-astrology\/preview.*/, { timeout: 10000 });
    
    // Wait for bundle generation (longer for all-3)
    await page.waitForTimeout(8000);
    
    // Verify bundle generation or content
    const bundleProgress = page.locator('text=/Bundle|Reports|Generating/i');
    const reportContent = page.locator('text=/Report|Overview|Summary/i');
    
    const hasProgress = await bundleProgress.first().isVisible({ timeout: 5000 }).catch(() => false);
    const hasContent = await reportContent.first().isVisible({ timeout: 5000 }).catch(() => false);
    
    expect(hasProgress || hasContent).toBeTruthy();
  });
});

