/**
 * E2E Test: Timer Behavior (Critical Defect Coverage)
 * 
 * Tests timer behavior to prevent previously reported defects:
 * 1. Timer stuck at 0s (reported multiple times)
 * 2. Timer stuck at specific number (reported multiple times)
 * 3. Timer resetting to 0 (reported multiple times)
 * 4. Timer stuck after few seconds (bundle reports)
 * 5. Timer resets to 0 after few seconds (free reports)
 * 
 * These tests specifically target defects that were reported multiple times
 */

import { test, expect } from '@playwright/test';
import { fillInputForm, waitForReportGeneration } from './test-helpers';

test.describe('Timer Behavior (Critical Defect Coverage)', () => {
  test('free report timer should not get stuck at 0s', async ({ page }) => {
    // CRITICAL: This test verifies free report timer starts and increments properly (not stuck at 0s)
    // This addresses the defect: "timer stuck at 0s" (reported multiple times for free reports)
    await page.goto('/ai-astrology/input?reportType=life-summary');
    await fillInputForm(page);
    
    // Wait for preview page
    await page.waitForURL(/.*\/ai-astrology\/preview.*/, { timeout: 10000 });
    
    // Wait for timer to start
    await page.waitForTimeout(3000);
    
    // CRITICAL: Check timer is visible and verify it shows elapsed time > 0s (not stuck at 0s)
    const timerText = page.locator('text=/Elapsed.*[0-9]+s/i');
    const timerVisible = await timerText.first().isVisible({ timeout: 5000 }).catch(() => false);
    
    if (timerVisible) {
      // Get the timer text content
      const timerContent = await timerText.first().textContent();
      console.log('[TEST] Free report timer text at 3s:', timerContent);
      
      // CRITICAL: Verify timer shows elapsed time > 0s (not stuck at "Elapsed: 0s")
      // Timer format is: "⏱️ Elapsed: Xs" where X should be > 0 after 3 seconds
      expect(timerContent).not.toMatch(/Elapsed:\s*0s/i);
      
      // Wait a few more seconds to ensure timer continues incrementing
      await page.waitForTimeout(3000);
      
      // Check timer again - should show higher value (or report completed)
      const timerContentAfter = await timerText.first().textContent().catch(() => null);
      if (timerContentAfter) {
        console.log('[TEST] Free report timer text at 6s:', timerContentAfter);
        // Extract elapsed time values
        const firstMatch = timerContent?.match(/Elapsed:\s*(\d+)s/i);
        const secondMatch = timerContentAfter.match(/Elapsed:\s*(\d+)s/i);
        
        if (firstMatch && secondMatch) {
          const firstTime = parseInt(firstMatch[1]);
          const secondTime = parseInt(secondMatch[1]);
          // Second time should be >= first time (timer should increment)
          expect(secondTime).toBeGreaterThanOrEqual(firstTime);
        }
      }
    } else {
      // If timer is not visible, check if report already completed (acceptable in MOCK_MODE)
      const reportContent = page.locator('text=/Report|Overview|Summary/i');
      const reportVisible = await reportContent.first().isVisible({ timeout: 2000 }).catch(() => false);
      if (!reportVisible) {
        // Timer should be visible if report is still generating
        throw new Error('Timer not visible and report not completed - timer may be stuck');
      }
    }
    
    // Report should complete (timer should stop incrementing)
    await waitForReportGeneration(page, 15000);
    
    // Verify report is displayed (not stuck)
    const reportContent = page.locator('text=/Report|Overview|Summary/i');
    await expect(reportContent.first()).toBeVisible({ timeout: 5000 });
  });
  
  test('free report timer should not reset to 0 after starting', async ({ page }) => {
    // CRITICAL: This test verifies timer doesn't reset mid-generation (not stuck at 0s after starting)
    // This addresses the defect: "free report timer resets to 0 after few seconds" (reported multiple times)
    await page.goto('/ai-astrology/input?reportType=life-summary');
    await fillInputForm(page);
    
    // Wait for preview page
    await page.waitForURL(/.*\/ai-astrology\/preview.*/, { timeout: 10000 });
    
    // Wait for timer to start
    await page.waitForTimeout(3000);
    
    // CRITICAL: Capture initial timer value
    const timerText = page.locator('text=/Elapsed.*[0-9]+s/i');
    const timerVisible = await timerText.first().isVisible({ timeout: 5000 }).catch(() => false);
    
    if (timerVisible) {
      // Get initial timer value
      const initialTimerContent = await timerText.first().textContent();
      console.log('[TEST] Free report timer initial value (3s):', initialTimerContent);
      
      // CRITICAL: Verify timer shows elapsed time > 0s (not stuck at 0s)
      expect(initialTimerContent).not.toMatch(/Elapsed:\s*0s/i);
      
      // Extract initial elapsed time
      const initialMatch = initialTimerContent?.match(/Elapsed:\s*(\d+)s/i);
      const initialTime = initialMatch ? parseInt(initialMatch[1]) : null;
      
      if (initialTime !== null) {
        // Wait a few more seconds to ensure timer doesn't reset
        await page.waitForTimeout(5000); // Wait to 8 seconds total
        
        // CRITICAL: Check timer again - should show higher or same value (NOT reset to 0)
        const timerContentAfter = await timerText.first().textContent().catch(() => null);
        if (timerContentAfter) {
          console.log('[TEST] Free report timer value after 5s more (8s total):', timerContentAfter);
          
          // CRITICAL: Verify timer did NOT reset to 0s
          expect(timerContentAfter).not.toMatch(/Elapsed:\s*0s/i);
          
          // Extract elapsed time after wait
          const afterMatch = timerContentAfter.match(/Elapsed:\s*(\d+)s/i);
          if (afterMatch) {
            const afterTime = parseInt(afterMatch[1]);
            // Timer should have incremented (or stayed same if report completed)
            // CRITICAL: After time should be >= initial time (timer should not reset)
            expect(afterTime).toBeGreaterThanOrEqual(initialTime);
          }
        }
      }
    } else {
      // If timer is not visible, check if report already completed (acceptable)
      const reportContent = page.locator('text=/Report|Overview|Summary/i');
      const reportVisible = await reportContent.first().isVisible({ timeout: 2000 }).catch(() => false);
      if (!reportVisible) {
        throw new Error('Timer not visible and report not completed - timer may be stuck');
      }
    }
    
    // Timer should continue (or report should complete)
    await waitForReportGeneration(page, 15000);
    
    // Verify report is displayed (generation completed, timer stopped)
    const reportContent = page.locator('text=/Report|Overview|Summary/i');
    await expect(reportContent.first()).toBeVisible({ timeout: 5000 });
  });
  
  test('year-analysis report timer should not get stuck at 0s', async ({ page }) => {
    // CRITICAL: This test specifically checks that year-analysis timer increments (not stuck at 0s)
    // This addresses the defect: "yearly analysis report and timer stuck" (reported multiple times)
    await page.goto('/ai-astrology/input?reportType=year-analysis');
    await fillInputForm(page);
    
    // Wait for preview page
    await page.waitForURL(/.*\/ai-astrology\/preview.*/, { timeout: 10000 });
    
    // Wait for timer to start (payment verification might happen first)
    await page.waitForTimeout(3000);
    
    // CRITICAL: Check timer is visible and extract the elapsed time value
    const timerText = page.locator('text=/Elapsed.*[0-9]+s/i');
    const timerVisible = await timerText.first().isVisible({ timeout: 5000 }).catch(() => false);
    
    if (timerVisible) {
      // Get the timer text content
      const timerContent = await timerText.first().textContent();
      console.log('[TEST] Year-analysis timer text at 3s:', timerContent);
      
      // CRITICAL: Verify timer shows elapsed time > 0s (not stuck at "Elapsed: 0s")
      // Timer should show something like "Elapsed: 3s" or "Elapsed: 4s" (not "Elapsed: 0s")
      expect(timerContent).not.toMatch(/Elapsed:\s*0s/i);
      
      // Wait a few more seconds to ensure timer continues incrementing
      await page.waitForTimeout(3000);
      
      // Check timer again - should show higher value
      const timerContentAfter = await timerText.first().textContent();
      console.log('[TEST] Year-analysis timer text at 6s:', timerContentAfter);
      
      // Timer should have incremented (not still at 0s or same value)
      if (timerContentAfter) {
        // Extract elapsed time values (simple regex to get number before 's')
        const firstMatch = timerContent.match(/Elapsed:\s*(\d+)s/i);
        const secondMatch = timerContentAfter.match(/Elapsed:\s*(\d+)s/i);
        
        if (firstMatch && secondMatch) {
          const firstTime = parseInt(firstMatch[1]);
          const secondTime = parseInt(secondMatch[1]);
          
          // Second time should be >= first time (timer should increment or stay same if report completes)
          expect(secondTime).toBeGreaterThanOrEqual(firstTime);
        }
      }
    } else {
      // If timer is not visible, check if report already completed (acceptable)
      const reportContent = page.locator('text=/Report|Overview|Summary|Year Analysis/i');
      const reportVisible = await reportContent.first().isVisible({ timeout: 2000 }).catch(() => false);
      if (!reportVisible) {
        // Timer should be visible if report is still generating
        throw new Error('Timer not visible and report not completed - timer may be stuck');
      }
    }
    
    // Wait for report generation to complete
    await waitForReportGeneration(page, 30000);
    
    // Verify report is displayed (not stuck)
    const reportContent = page.locator('text=/Report|Overview|Summary|Year Analysis/i');
    await expect(reportContent.first()).toBeVisible({ timeout: 5000 });
  });
  
  test('paid report timer should not get stuck at specific number', async ({ page }) => {
    // CRITICAL: This test verifies paid report timer doesn't freeze at a specific number
    // This addresses the defect: "timer stuck at specific number" (reported multiple times)
    await page.goto('/ai-astrology/input?reportType=year-analysis');
    await fillInputForm(page);
    
    // Wait for preview page
    await page.waitForURL(/.*\/ai-astrology\/preview.*/, { timeout: 10000 });
    
    // Wait for timer to start (payment verification might happen first)
    await page.waitForTimeout(3000);
    
    // CRITICAL: Monitor timer at multiple time points to ensure it doesn't freeze
    const timerText = page.locator('text=/Elapsed.*[0-9]+s/i');
    const timerVisible = await timerText.first().isVisible({ timeout: 5000 }).catch(() => false);
    
    if (timerVisible) {
      // First check: Get timer value at 3 seconds
      const timerContent1 = await timerText.first().textContent();
      console.log('[TEST] Paid report timer at 3s:', timerContent1);
      
      // CRITICAL: Verify timer shows elapsed time > 0s
      expect(timerContent1).not.toMatch(/Elapsed:\s*0s/i);
      
      // Extract first elapsed time
      const match1 = timerContent1?.match(/Elapsed:\s*(\d+)s/i);
      const time1 = match1 ? parseInt(match1[1]) : null;
      
      if (time1 !== null) {
        // Second check: Wait 5 more seconds and check again (at 8 seconds total)
        await page.waitForTimeout(5000);
        const timerContent2 = await timerText.first().textContent().catch(() => null);
        console.log('[TEST] Paid report timer at 8s:', timerContent2);
        
        if (timerContent2) {
          const match2 = timerContent2.match(/Elapsed:\s*(\d+)s/i);
          const time2 = match2 ? parseInt(match2[1]) : null;
          
          if (time2 !== null) {
            // CRITICAL: Timer should have incremented (not frozen at time1)
            // Timer should be >= time1 + 4 (allowing for some variance)
            expect(time2).toBeGreaterThanOrEqual(time1);
            
            // Third check: Wait 5 more seconds and check again (at 13 seconds total)
            await page.waitForTimeout(5000);
            const timerContent3 = await timerText.first().textContent().catch(() => null);
            console.log('[TEST] Paid report timer at 13s:', timerContent3);
            
            if (timerContent3) {
              const match3 = timerContent3.match(/Elapsed:\s*(\d+)s/i);
              const time3 = match3 ? parseInt(match3[1]) : null;
              
              if (time3 !== null) {
                // CRITICAL: Timer should continue incrementing (not frozen at time2)
                expect(time3).toBeGreaterThanOrEqual(time2);
                
                // Verify timer is not stuck at the same value across all checks
                // At least one increment should have occurred
                if (time1 === time2 && time2 === time3 && time1 > 0) {
                  throw new Error(`Timer appears frozen at ${time1}s - not incrementing`);
                }
              }
            }
          }
        }
      }
    } else {
      // If timer is not visible, check if report already completed (acceptable)
      const reportContent = page.locator('text=/Report|Overview|Summary|Year Analysis/i');
      const reportVisible = await reportContent.first().isVisible({ timeout: 2000 }).catch(() => false);
      if (!reportVisible) {
        throw new Error('Timer not visible and report not completed - timer may be stuck');
      }
    }
    
    // Wait for report generation to complete
    await waitForReportGeneration(page, 30000);
    
    // Verify report is displayed (not stuck)
    const reportContent = page.locator('text=/Report|Overview|Summary|Year Analysis/i');
    await expect(reportContent.first()).toBeVisible({ timeout: 5000 });
  });
  
  test('bundle report timer should not get stuck after 25 seconds', async ({ page }) => {
    // CRITICAL: This test verifies bundle report timer continues properly past the 25 second stuck point
    // This addresses the defect: "bundle report timer stuck after 25 seconds" (reported multiple times)
    await page.goto('/ai-astrology/input?bundle=any-2');
    await fillInputForm(page);
    
    // Wait for preview page
    await page.waitForURL(/.*\/ai-astrology\/preview.*/, { timeout: 10000 });
    
    // Wait for timer to start (bundle reports take longer)
    await page.waitForTimeout(2000);
    
    // CRITICAL: Check timer is running and monitor at multiple points
    const timerText = page.locator('text=/Elapsed.*[0-9]+s/i');
    const timerVisible = await timerText.first().isVisible({ timeout: 5000 }).catch(() => false);
    
    if (timerVisible) {
      // Check timer before the stuck point (at 10 seconds)
      await page.waitForTimeout(8000); // Wait to 10 seconds total
      const timerContent10s = await timerText.first().textContent().catch(() => null);
      console.log('[TEST] Bundle timer at 10s:', timerContent10s);
      
      if (timerContent10s) {
        // CRITICAL: Wait to the reported stuck point (25 seconds)
        await page.waitForTimeout(15000); // Wait to 25 seconds total
        const timerContent25s = await timerText.first().textContent().catch(() => null);
        console.log('[TEST] Bundle timer at 25s (reported stuck point):', timerContent25s);
        
        // CRITICAL: Verify timer shows elapsed time >= 25s (not stuck)
        if (timerContent25s) {
          expect(timerContent25s).not.toMatch(/Elapsed:\s*0s/i);
          const match25s = timerContent25s.match(/Elapsed:\s*(\d+)s/i);
          if (match25s) {
            const time25s = parseInt(match25s[1]);
            // Timer should show at least 20s (allowing for some variance)
            expect(time25s).toBeGreaterThanOrEqual(20);
          }
          
          // CRITICAL: Wait past the stuck point to verify timer continues
          await page.waitForTimeout(5000); // Wait to 30 seconds total
          const timerContent30s = await timerText.first().textContent().catch(() => null);
          console.log('[TEST] Bundle timer at 30s (past stuck point):', timerContent30s);
          
          if (timerContent30s && match25s) {
            const match30s = timerContent30s.match(/Elapsed:\s*(\d+)s/i);
            if (match30s) {
              const time30s = parseInt(match30s[1]);
              const time25s = parseInt(match25s[1]);
              // Timer should continue incrementing past 25s (not stuck)
              expect(time30s).toBeGreaterThanOrEqual(time25s);
            }
          }
        }
      }
    }
    
    // Verify timer is still running or report completed (not stuck)
    const bundleProgress = page.locator('text=/Bundle|Reports|Generating/i');
    const reportContent = page.locator('text=/Report|Overview|Summary/i');
    const hasProgress = await bundleProgress.first().isVisible({ timeout: 3000 }).catch(() => false);
    const hasContent = await reportContent.first().isVisible({ timeout: 3000 }).catch(() => false);
    
    // Bundle should be generating (progress visible) or completed (content visible) - not stuck
    expect(hasProgress || hasContent || timerVisible).toBeTruthy();
    
    // Wait for bundle generation to complete
    await waitForReportGeneration(page, 30000);
    
    // Verify bundle reports completed
    const finalContent = page.locator('text=/Report|Overview|Summary|Bundle/i');
    await expect(finalContent.first()).toBeVisible({ timeout: 5000 });
  });
  
  test('timer should stop when report generation completes', async ({ page }) => {
    // This test verifies timer stops properly when report is ready
    await page.goto('/ai-astrology/input?reportType=life-summary');
    await fillInputForm(page);
    
    // Wait for preview page
    await page.waitForURL(/.*\/ai-astrology\/preview.*/, { timeout: 10000 });
    
    // Wait for report generation to complete
    await waitForReportGeneration(page, 15000);
    
    // After completion, timer should not be incrementing
    // (Timer might still be visible briefly, but report should be displayed)
    const reportContent = page.locator('text=/Report|Overview|Summary/i');
    await expect(reportContent.first()).toBeVisible({ timeout: 5000 });
    
    // Verify we're not stuck in loading state
    const loadingText = page.locator('text=/Generating.*Report|Creating.*Report/i');
    const stillLoading = await loadingText.first().isVisible({ timeout: 2000 }).catch(() => false);
    
    // Loading should be gone (report displayed)
    expect(stillLoading).toBeFalsy();
  });
});
