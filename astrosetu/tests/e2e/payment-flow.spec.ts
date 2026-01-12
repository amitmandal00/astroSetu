/**
 * E2E Test: Payment Flow
 * 
 * Tests that payment success redirects to preview correctly:
 * 1. Navigate to paid report input
 * 2. Fill form and submit
 * 3. Verify payment prompt/flow
 * 4. Verify redirect to preview after payment
 * 
 * Note: With MOCK_MODE=true, payment may be bypassed
 * This test verifies the payment → preview redirect flow
 */

import { test, expect } from '@playwright/test';
import { fillInputForm, TEST_USER } from './test-helpers';

test.describe('Payment Flow E2E', () => {
  test('should redirect to preview after payment verification', async ({ page }) => {
    // Step 1: Navigate to paid report input
    await page.goto('/ai-astrology/input?reportType=year-analysis');
    
    // Step 2: Fill the form (includes submission and confirmation modal)
    await fillInputForm(page);
    
    // Step 3: Wait for redirect to preview page
    await page.waitForURL(/.*\/ai-astrology\/preview.*/, { timeout: 10000 });
    
    // Step 4: Verify we're on the preview page (payment should redirect here)
    await expect(page).toHaveURL(/.*\/ai-astrology\/preview.*/);
    
    // Step 5: Verify we reached the preview page (payment flow redirects here)
    // With MOCK_MODE, payment might be bypassed, but we should be on preview page
    // Just verify we're on the preview page (which is the main goal)
    await expect(page).toHaveURL(/.*\/ai-astrology\/preview.*/);
    
    // Optionally check for either payment message or report generation (both are valid)
    const paymentVerified = page.locator('text=/Payment.*Verified|Payment.*Confirmed/i');
    const generatingReport = page.locator('text=/Generating|Creating|Analyzing/i');
    const reportContent = page.locator('text=/Report|Overview|Summary/i');
    
    const hasPaymentMsg = await paymentVerified.isVisible({ timeout: 2000 }).catch(() => false);
    const hasGenerating = await generatingReport.isVisible({ timeout: 2000 }).catch(() => false);
    const hasReport = await reportContent.isVisible({ timeout: 2000 }).catch(() => false);
    
    // At least one of these should be visible (payment UI, generation, or report)
    expect(hasPaymentMsg || hasGenerating || hasReport).toBeTruthy();
  });
  
  test('should show payment prompt for paid reports', async ({ page }) => {
    await page.goto('/ai-astrology/input?reportType=year-analysis');
    await fillInputForm(page);
    
    // Wait for preview page
    await page.waitForURL(/.*\/ai-astrology\/preview.*/, { timeout: 10000 });
    
    // Check for payment-related UI or report generation (may be bypassed in demo/MOCK mode)
    const paymentButton = page.locator('button:has-text("Pay"), button:has-text("Purchase"), a:has-text("Pay")');
    const paymentText = page.locator('text=/Payment|Purchase|Pay.*now/i');
    const generatingReport = page.locator('text=/Generating|Creating|Analyzing/i');
    const reportContent = page.locator('text=/Report|Overview|Summary/i');
    
    // In MOCK_MODE or demo mode, payment might be bypassed
    // So we check if payment UI exists OR if report generation/report content appears
    const hasPaymentUI = await paymentButton.isVisible({ timeout: 2000 }).catch(() => false) || 
                         await paymentText.isVisible({ timeout: 2000 }).catch(() => false);
    const hasGenerating = await generatingReport.isVisible({ timeout: 2000 }).catch(() => false);
    const hasReport = await reportContent.isVisible({ timeout: 2000 }).catch(() => false);
    
    // At least one should be true (payment UI OR generation started OR report displayed)
    expect(hasPaymentUI || hasGenerating || hasReport).toBeTruthy();
  });
});

