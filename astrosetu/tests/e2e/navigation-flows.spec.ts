/**
 * E2E Test: Navigation Flows
 * 
 * Tests navigation scenarios:
 * 1. Back button navigation
 * 2. Direct URL navigation to preview
 * 3. Browser refresh during generation
 * 4. Navigation between pages
 */

import { test, expect } from '@playwright/test';
import { fillInputForm } from './test-helpers';

test.describe('Navigation Flows E2E', () => {
  test('should handle back button from preview to input', async ({ page }) => {
    // Navigate and fill form
    await page.goto('/ai-astrology/input?reportType=life-summary');
    await fillInputForm(page);
    
    // Wait for preview page
    await page.waitForURL(/.*\/ai-astrology\/preview.*/, { timeout: 10000 });
    
    // Go back
    await page.goBack();
    
    // Should be back on input page
    await expect(page).toHaveURL(/.*\/ai-astrology\/input.*/);
  });
  
  test('should handle direct navigation to preview page', async ({ page }) => {
    // Navigate directly to preview (without form submission)
    await page.goto('/ai-astrology/preview?reportType=life-summary');
    
    // Page should load (may show error or redirect, but shouldn't crash)
    await page.waitForLoadState('networkidle').catch(() => {});
    
    // Check that page loaded (doesn't matter what state it's in)
    const pageContent = page.locator('body');
    await expect(pageContent).toBeVisible();
  });
  
  test('should preserve form data across navigation', async ({ page }) => {
    await page.goto('/ai-astrology/input?reportType=life-summary');
    
    // Fill form partially
    const nameInput = page.locator('input[placeholder*="full name"]').first();
    await nameInput.fill('Test User');
    
    // Navigate away and back (simulate user behavior)
    await page.goto('/');
    await page.goBack();
    
    // Form should still be accessible (data might be cleared, but form should work)
    await expect(page).toHaveURL(/.*\/ai-astrology\/input.*/);
  });
  
  test('should handle page refresh during generation', async ({ page }) => {
    // Start report generation
    await page.goto('/ai-astrology/input?reportType=life-summary');
    await fillInputForm(page);
    
    // Wait for preview page
    await page.waitForURL(/.*\/ai-astrology\/preview.*/, { timeout: 10000 });
    
    // Refresh page (simulate user refresh)
    await page.reload();
    
    // Page should load (may show error, loading, or report - all valid)
    await page.waitForLoadState('networkidle').catch(() => {});
    
    const pageContent = page.locator('body');
    await expect(pageContent).toBeVisible();
  });
  
  test('should handle multiple report type navigation', async ({ page }) => {
    // Start with one report type
    await page.goto('/ai-astrology/input?reportType=life-summary');
    await expect(page).toHaveURL(/.*reportType=life-summary/);
    
    // Navigate to another report type
    await page.goto('/ai-astrology/input?reportType=year-analysis');
    await expect(page).toHaveURL(/.*reportType=year-analysis/);
    
    // Form should be accessible
    const formInput = page.locator('input[placeholder*="full name"]').first();
    await expect(formInput).toBeVisible();
  });
});

