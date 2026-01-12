/**
 * E2E Test: Paid Report (Year Analysis) End-to-End
 * 
 * Tests the complete flow for paid year-analysis reports:
 * 1. Navigate to input form
 * 2. Fill form with test data
 * 3. Submit form
 * 4. Verify payment prompt appears (or payment verification)
 * 5. Wait for report generation (MOCK_MODE enabled)
 * 6. Verify report is displayed
 * 
 * Note: With MOCK_MODE=true, payment verification may be bypassed
 * This test focuses on the report generation flow
 */

import { test, expect } from '@playwright/test';
import { fillInputForm, waitForReportGeneration, TEST_USER } from './test-helpers';

test.describe('Paid Report (Year Analysis) E2E', () => {
  test('should generate year-analysis report successfully', async ({ page }) => {
    // Step 1: Navigate to input form with reportType=year-analysis
    await page.goto('/ai-astrology/input?reportType=year-analysis');
    
    // Verify we're on the input page
    await expect(page).toHaveURL(/.*\/ai-astrology\/input.*reportType=year-analysis/);
    
    // Step 2: Fill the form (includes submission and confirmation modal)
    await fillInputForm(page);
    
    // Step 3: Wait for redirect to preview page
    await page.waitForURL(/.*\/ai-astrology\/preview.*/, { timeout: 10000 });
    
    // Step 6: Check if payment prompt appears (may be bypassed in MOCK_MODE/demo mode)
    const paymentPrompt = page.locator('text=/Payment|Purchase|Pay/i');
    const hasPaymentPrompt = await paymentPrompt.isVisible().catch(() => false);
    
    if (hasPaymentPrompt) {
      // If payment is required, we'd need to handle payment flow
      // For now, just verify payment prompt is shown
      await expect(paymentPrompt.first()).toBeVisible({ timeout: 5000 });
      // In a real test, we'd complete payment here
      // For MOCK_MODE testing, payment might be bypassed
    }
    
    // Step 4: Wait for report generation (with MOCK_MODE, this should be fast)
    // Paid reports may take slightly longer due to payment verification
    await waitForReportGeneration(page, 20000);
    
    // Step 5: Verify report is displayed
    await page.waitForTimeout(2000); // Wait for report to render
    
    // Check for report title or content
    const reportTitle = page.locator('text=/Year Analysis|Your Year|Year.*Report/i');
    const titleVisible = await reportTitle.first().isVisible({ timeout: 5000 }).catch(() => false);
    
    // Verify report sections are visible (year-analysis specific or general content)
    const reportContent = page.locator('text=/Quarterly|Theme|Year.*Theme|Overview|Summary|Insights/i');
    await expect(reportContent.first()).toBeVisible({ timeout: 5000 });
    
    // Verify not stuck in loading state
    const loadingState = page.locator('text=/Generating.*Report|Creating.*Report/i');
    const stillLoading = await loadingState.first().isVisible({ timeout: 2000 }).catch(() => false);
    expect(stillLoading).toBeFalsy();
    
    // User's name might not be displayed, so we just verify content exists
    expect(titleVisible || await reportContent.first().isVisible()).toBeTruthy();
  });
});

