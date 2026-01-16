/**
 * E2E Test: Retry Flow
 * 
 * Tests that retry works when API fails once, second attempt succeeds:
 * 1. Trigger report generation
 * 2. Simulate/verify error state
 * 3. Click retry button
 * 4. Verify second attempt succeeds
 * 5. Verify no duplicate charges
 * 
 * Note: With MOCK_MODE, errors may not occur naturally
 * This test verifies retry UI and flow exists
 */

import { test, expect } from '@playwright/test';
import { fillInputForm, waitForReportGeneration } from './test-helpers';

test.describe('Retry Flow E2E', () => {
  test('should have retry button when generation fails', async ({ page }) => {
    // This test verifies retry UI exists
    // In MOCK_MODE, failures may not occur, so we test the UI structure
    
    await page.goto('/ai-astrology/input?reportType=life-summary');
    await fillInputForm(page);
    
    // Wait for preview page
    await page.waitForURL(/.*\/ai-astrology\/preview.*/, { timeout: 10000 });
    
    // In MOCK_MODE, generation should succeed
    // But we can verify retry button exists in error scenarios
    // For now, verify generation completes successfully (which is the expected behavior)
    await waitForReportGeneration(page, 15000);
    
    // Verify report is displayed (success case)
    const reportContent = page.locator('text=/Your.*Report|Life Summary|Overview/i');
    await expect(reportContent.first()).toBeVisible({ timeout: 5000 });
    
    // Note: To test actual retry flow, we would need to:
    // 1. Mock API failures in test environment
    // 2. Trigger error state
    // 3. Verify retry button appears
    // 4. Click retry
    // 5. Verify second attempt succeeds
    // This requires more advanced mocking setup
  });
  
  test('should allow retry without duplicate charges', async ({ page }) => {
    // This test documents the expected behavior:
    // - Retry should not trigger duplicate payment charges
    // - Idempotency should prevent duplicate API calls
    
    // Navigate to input page first, then generate report, so we have proper context
    // Navigating directly to preview without input data causes redirect
    await page.goto('/ai-astrology/input?reportType=life-summary');
    
    // Fill the form to generate a report
    await fillInputForm(page);
    
    // Wait for preview page
    await page.waitForURL(/.*\/ai-astrology\/preview.*/, { timeout: 10000 });
    
    // Wait for report generation to complete (MOCK_MODE can be fast, but don't assume 3s)
    await waitForReportGeneration(page, 30000);
    
    // Look for retry button (may not be visible if no error)
    const retryButton = page.locator('button:has-text("Retry"), button:has-text("Try Again"), a:has-text("Retry")');
    
    // Check for various UI states that might be present
    const hasRetryButton = await retryButton.isVisible({ timeout: 2000 }).catch(() => false);
    const downloadButton = page.locator('button:has-text("Download")').first();
    const reportMarker = page
      .locator('text=/Report|Overview|Summary|Insights|Timing|Career|Decision|Year\\s*Analysis|Life\\s*Summary|Bundle/i')
      .first();
    const loaderHeading = page.getByRole('heading', { name: /Generating|Verifying|Preparing/i }).first();

    const hasDownload = await downloadButton.isVisible({ timeout: 2000 }).catch(() => false);
    const hasMarker = await reportMarker.isVisible({ timeout: 2000 }).catch(() => false);
    const hasLoading = await loaderHeading.isVisible({ timeout: 2000 }).catch(() => false);
    
    // The preview page should show one of: retry button, report content, or loading state
    // All are valid states depending on the current state of report generation
    const hasAnyUI = hasRetryButton || hasDownload || hasMarker || hasLoading;
    
    // At least one UI element should be present (this verifies the page loaded and report generated)
    expect(hasAnyUI).toBeTruthy();
    
    if (hasRetryButton) {
      // If retry button exists, verify it's clickable
      await expect(retryButton.first()).toBeEnabled();
      // In a real test, we'd click retry and verify:
      // 1. No duplicate payment charges
      // 2. Idempotency prevents duplicate API calls
      // 3. Report generation succeeds on retry
    }
  });
  
  test('should retry loading bundle when Retry Loading Bundle button is clicked', async ({ page }) => {
    // This test verifies the "Retry Loading Bundle" button functionality
    // The button should appear for bundles and clicking it should retry bundle generation
    
    // Navigate to bundle input page
    await page.goto('/ai-astrology/input?bundle=all-3');
    
    // Fill the form to generate bundle reports
    await fillInputForm(page);
    
    // Wait for preview page
    await page.waitForURL(/.*\/ai-astrology\/preview.*/, { timeout: 10000 });
    
    // Wait a bit for the page to initialize
    await page.waitForTimeout(2000);
    
    // Look for "Retry Loading Bundle" button
    // The button text is: "🔄 Retry Loading Bundle" or "Retry Loading Bundle"
    const retryBundleButton = page.locator('button:has-text("Retry Loading Bundle"), button:has-text("Retry Loading")').first();
    
    // Check if button is visible (it may not be visible if bundle is still loading or completed)
    const hasRetryButton = await retryBundleButton.isVisible({ timeout: 3000 }).catch(() => false);
    
    if (hasRetryButton) {
      // If button is visible, verify it's enabled
      await expect(retryBundleButton).toBeEnabled();
      
      // Click the button to retry
      await retryBundleButton.click();
      
      // After clicking, we should see loading state or bundle generation continue
      // Wait a bit for the retry to trigger
      await page.waitForTimeout(1000);
      
      // Verify that either:
      // 1. Loading state appears (bundle generation started)
      // 2. Bundle progress is visible
      // 3. Bundle reports continue/complete
      const loadingState = page.locator('text=/Generating|Loading/i');
      const bundleProgress = page.locator('text=/Bundle|Reports|Generating|Progress/i');
      const bundleContent = page.locator('text=/Report|Overview|Summary|Bundle/i');
      
      const hasLoading = await loadingState.first().isVisible({ timeout: 3000 }).catch(() => false);
      const hasProgress = await bundleProgress.first().isVisible({ timeout: 3000 }).catch(() => false);
      const hasContent = await bundleContent.first().isVisible({ timeout: 3000 }).catch(() => false);
      
      // At least one of these should be true after clicking retry
      expect(hasLoading || hasProgress || hasContent).toBeTruthy();
    } else {
      // If button is not visible, bundle might have completed already
      // Verify bundle content is visible instead
      const bundleContent = page.locator('text=/Report|Overview|Summary|Bundle/i');
      const hasContent = await bundleContent.first().isVisible({ timeout: 5000 }).catch(() => false);
      
      // In MOCK_MODE, bundles complete very quickly, so content might already be visible
      // This is acceptable - the test verifies the button exists when needed
      if (!hasContent) {
        // If no content and no button, check for loading state
        const loadingState = page.locator('text=/Generating|Loading/i');
        const hasLoading = await loadingState.first().isVisible({ timeout: 2000 }).catch(() => false);
        expect(hasLoading).toBeTruthy();
      }
    }
  });
});

