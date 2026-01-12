/**
 * E2E Test: All Report Types
 * 
 * Tests generation for all report types to ensure they all work:
 * - marriage-timing
 * - career-money
 * - full-life
 * - major-life-phase
 * - decision-support
 */

import { test, expect } from '@playwright/test';
import { fillInputForm, waitForReportGeneration } from './test-helpers';

const REPORT_TYPES = [
  { type: 'marriage-timing', name: 'Marriage Timing' },
  { type: 'career-money', name: 'Career & Money' },
  { type: 'full-life', name: 'Full Life' },
  { type: 'major-life-phase', name: 'Strategic Life Phase' },
  { type: 'decision-support', name: 'Decision Support' },
] as const;

test.describe('All Report Types E2E', () => {
  for (const { type, name } of REPORT_TYPES) {
    test(`should generate ${name} report successfully`, async ({ page }) => {
      // Navigate to input form with report type
      await page.goto(`/ai-astrology/input?reportType=${type}`);
      
      // Verify we're on the input page
      await expect(page).toHaveURL(new RegExp(`.*/ai-astrology/input.*reportType=${type}`));
      
      // Fill the form
      await fillInputForm(page);
      
      // Wait for redirect to preview page
      await page.waitForURL(/.*\/ai-astrology\/preview.*/, { timeout: 10000 });
      
      // Wait for report generation (with MOCK_MODE, this should be fast)
      // Paid reports may take slightly longer due to payment verification
      await waitForReportGeneration(page, 20000);
      
      // Verify report is displayed
      await page.waitForTimeout(2000); // Wait for report to render
      
      // Check for report content (flexible selector)
      const reportContent = page.locator('text=/Report|Overview|Summary|Insights|Timing|Career|Life|Decision/i');
      await expect(reportContent.first()).toBeVisible({ timeout: 5000 });
      
      // Verify not stuck in loading state
      const loadingState = page.locator('text=/Generating.*Report|Creating.*Report/i');
      const stillLoading = await loadingState.first().isVisible({ timeout: 2000 }).catch(() => false);
      expect(stillLoading).toBeFalsy();
    });
  }
});

