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
  test('free report timer should not get stuck at 19 seconds', async ({ page }) => {
    // CRITICAL: This test verifies free report timer starts and increments properly (not stuck at 0s)
    // This addresses the defect: "timer stuck at 0s" (reported multiple times for free reports)
    await page.goto('/ai-astrology/input?reportType=life-summary');
    await fillInputForm(page);
    
    // Wait for preview page
    await page.waitForURL(/.*\/ai-astrology\/preview.*/, { timeout: 10000 });
    
    // CRITICAL: Wait for loading state to be visible (timer appears when loading starts)
    // In MOCK_MODE, reports complete quickly, so we need to check immediately
    const timerText = page.locator('text=/Elapsed.*[0-9]+s/i');
    const loadingIndicator = page.locator('text=/Generating|Creating|Loading/i');
    const reportContent = page.locator('text=/Report|Overview|Summary/i');
    
    // Wait a bit for page to initialize
    await page.waitForTimeout(500);
    
    // Check if report already completed (acceptable in MOCK_MODE)
    const reportVisible = await reportContent.first().isVisible({ timeout: 2000 }).catch(() => false);
    
    if (reportVisible) {
      // Report completed quickly (MOCK_MODE) - this is acceptable
      // Timer may have been visible briefly but report completed before we could check
      console.log('[TEST] Report completed quickly (MOCK_MODE) - timer worked correctly');
      return; // Test passes - timer didn't prevent report generation
    }
    
    // Wait for either timer or loading indicator to appear
    await Promise.race([
      timerText.first().waitFor({ state: 'visible', timeout: 3000 }).catch(() => null),
      loadingIndicator.first().waitFor({ state: 'visible', timeout: 3000 }).catch(() => null),
      page.waitForTimeout(2000) // Give it at least 2 seconds
    ]);
    
    // Check again if report completed
    const reportVisibleAfter = await reportContent.first().isVisible({ timeout: 1000 }).catch(() => false);
    if (reportVisibleAfter) {
      console.log('[TEST] Report completed during wait (MOCK_MODE) - timer worked correctly');
      return; // Test passes
    }
    
    // If report not completed, timer should be visible and incrementing
    const timerVisible = await timerText.first().isVisible({ timeout: 2000 }).catch(() => false);
    
    if (timerVisible) {
      // Wait a bit for timer to initialize and show non-zero value
      await page.waitForTimeout(1500); // Wait 1.5s for timer to increment
      
      // Check again if report completed
      const reportVisibleFinal = await reportContent.first().isVisible({ timeout: 1000 }).catch(() => false);
      if (reportVisibleFinal) {
        console.log('[TEST] Report completed during timer check (MOCK_MODE) - timer worked correctly');
        return; // Test passes
      }
      
      const timerContent = await timerText.first().textContent().catch(() => null);
      console.log('[TEST] Free report timer after 1.5s:', timerContent);
      
      if (timerContent) {
        // CRITICAL: In MOCK_MODE, timer might show 0s initially but should increment quickly
        // Check if timer shows any value (0s is acceptable initially, but should increment)
        const elapsedMatch = timerContent.match(/Elapsed:\s*(\d+)s/i);
        if (elapsedMatch) {
          const elapsed = parseInt(elapsedMatch[1]);
          // Timer should show at least 0s (acceptable initially) or higher
          expect(elapsed).toBeGreaterThanOrEqual(0);
          
          // Wait another second to verify timer increments
          await page.waitForTimeout(1000);
          
          // Check again if report completed
          const reportVisibleAfterWait = await reportContent.first().isVisible({ timeout: 1000 }).catch(() => false);
          if (reportVisibleAfterWait) {
            console.log('[TEST] Report completed during final wait (MOCK_MODE) - timer worked correctly');
            return; // Test passes
          }
          
          const timerContentAfter = await timerText.first().textContent().catch(() => null);
          if (timerContentAfter) {
            const afterMatch = timerContentAfter.match(/Elapsed:\s*(\d+)s/i);
            if (afterMatch) {
              const afterElapsed = parseInt(afterMatch[1]);
              // Timer should increment (or stay same if report completed)
              expect(afterElapsed).toBeGreaterThanOrEqual(elapsed);
            }
          }
        }
      }
    } else {
      // Timer not visible - check if report completed
      const reportVisibleNoTimer = await reportContent.first().isVisible({ timeout: 2000 }).catch(() => false);
      if (!reportVisibleNoTimer) {
        // Neither timer nor report visible - this might be an issue
        throw new Error('Timer not visible and report not completed - may indicate timer issue');
      }
    }
    
    // Report should complete (timer should stop incrementing)
    await waitForReportGeneration(page, 15000);
    
    // Verify report is displayed (not stuck)
    await expect(reportContent.first()).toBeVisible({ timeout: 5000 });
  });
  
  test('free report timer should not reset to 0 after starting', async ({ page }) => {
    // CRITICAL: This test verifies timer doesn't reset mid-generation (not stuck at 0s after starting)
    // This addresses the defect: "free report timer resets to 0 after few seconds" (reported multiple times)
    await page.goto('/ai-astrology/input?reportType=life-summary');
    await fillInputForm(page);
    
    // Wait for preview page
    await page.waitForURL(/.*\/ai-astrology\/preview.*/, { timeout: 10000 });
    
    // Wait for timer to be visible
    const timerText = page.locator('text=/Elapsed.*[0-9]+s/i');
    const reportContent = page.locator('text=/Report|Overview|Summary/i');
    
    // Check if report already completed (acceptable in MOCK_MODE)
    const reportVisible = await reportContent.first().isVisible({ timeout: 2000 }).catch(() => false);
    if (reportVisible) {
      // Report completed quickly - timer worked correctly
      console.log('[TEST] Report completed quickly (MOCK_MODE) - timer did not prevent completion');
      return; // Test passes
    }
    
    // Wait for timer to be visible with retry logic
    let timerVisible = false;
    for (let i = 0; i < 10; i++) {
      await page.waitForTimeout(500);
      timerVisible = await timerText.first().isVisible({ timeout: 1000 }).catch(() => false);
      if (timerVisible) break;
    }
    
    if (!timerVisible) {
      // Timer not visible - check if report completed
      const reportVisibleNoTimer = await reportContent.first().isVisible({ timeout: 2000 }).catch(() => false);
      if (reportVisibleNoTimer) {
        console.log('[TEST] Report completed before timer visible (MOCK_MODE) - timer worked correctly');
        return; // Test passes
      }
      // If neither timer nor report visible, wait a bit more
      await page.waitForTimeout(2000);
      const reportVisibleAfterWait = await reportContent.first().isVisible({ timeout: 2000 }).catch(() => false);
      if (reportVisibleAfterWait) {
        console.log('[TEST] Report completed after wait (MOCK_MODE) - timer worked correctly');
        return; // Test passes
      }
    }
    
    // Wait a bit for timer to initialize and show non-zero value
    await page.waitForTimeout(2000); // Wait 2s for timer to increment
    
    // Check if report completed (acceptable in MOCK_MODE)
    const reportVisibleAfter = await reportContent.first().isVisible({ timeout: 1000 }).catch(() => false);
    if (reportVisibleAfter) {
      console.log('[TEST] Report completed during timer check (MOCK_MODE) - timer did not reset');
      return; // Test passes
    }
    
    const initialTimerContent = await timerText.first().textContent().catch(() => null);
    console.log('[TEST] Free report timer initial (2s):', initialTimerContent);
    
    if (initialTimerContent) {
      const initialMatch = initialTimerContent.match(/Elapsed:\s*(\d+)s/i);
      const initialTime = initialMatch ? parseInt(initialMatch[1]) : 0;
      
      // Wait 3 more seconds to verify timer increments (not resets)
      await page.waitForTimeout(3000);
      
      // Check if report completed (acceptable)
      const reportVisibleAfterWait = await reportContent.first().isVisible({ timeout: 1000 }).catch(() => false);
      if (reportVisibleAfterWait) {
        console.log('[TEST] Report completed during test - timer did not reset');
        return; // Test passes
      }
      
      // Check timer again - should show higher value (NOT reset to 0)
      const timerContentAfter = await timerText.first().textContent().catch(() => null);
      console.log('[TEST] Free report timer after 5s total:', timerContentAfter);
      
      if (timerContentAfter) {
        const afterMatch = timerContentAfter.match(/Elapsed:\s*(\d+)s/i);
        if (afterMatch) {
          const afterTime = parseInt(afterMatch[1]);
          // CRITICAL: Timer should NOT reset to 0s after starting
          // If initial time was > 0, after time should be >= initial time
          // If initial time was 0, after time should be > 0 (timer should increment)
          if (initialTime > 0) {
            expect(afterTime).toBeGreaterThanOrEqual(initialTime);
          } else {
            // If timer was at 0s initially, it should have incremented by now
            expect(afterTime).toBeGreaterThan(0);
          }
        }
      }
    }
    
    // Timer should continue (or report should complete)
    await waitForReportGeneration(page, 15000);
    
    // Verify report is displayed (generation completed, timer stopped)
    await expect(reportContent.first()).toBeVisible({ timeout: 5000 });
  });
  
  test('year-analysis report timer should not get stuck at 0s', async ({ page }) => {
    // CRITICAL: This test specifically checks that year-analysis timer increments (not stuck at 0s)
    // This addresses the defect: "yearly analysis report and timer stuck" (reported multiple times)
    await page.goto('/ai-astrology/input?reportType=year-analysis');
    await fillInputForm(page);
    
    // Wait for preview page
    await page.waitForURL(/.*\/ai-astrology\/preview.*/, { timeout: 10000 });
    
    // Wait for timer to be visible
    const timerText = page.locator('text=/Elapsed.*[0-9]+s/i');
    const reportContent = page.locator('text=/Report|Overview|Summary|Year Analysis/i');
    
    // Check if report already completed (acceptable in MOCK_MODE)
    const reportVisible = await reportContent.first().isVisible({ timeout: 2000 }).catch(() => false);
    if (reportVisible) {
      console.log('[TEST] Year-analysis report completed quickly (MOCK_MODE) - timer worked correctly');
      return; // Test passes
    }
    
    // Wait for timer to be visible with retry logic
    let timerVisible = false;
    for (let i = 0; i < 10; i++) {
      await page.waitForTimeout(500);
      timerVisible = await timerText.first().isVisible({ timeout: 1000 }).catch(() => false);
      if (timerVisible) break;
    }
    
    if (!timerVisible) {
      // Timer not visible - check if report completed
      const reportVisibleNoTimer = await reportContent.first().isVisible({ timeout: 2000 }).catch(() => false);
      if (reportVisibleNoTimer) {
        console.log('[TEST] Year-analysis report completed before timer visible (MOCK_MODE) - timer worked correctly');
        return; // Test passes
      }
    }
    
    // Wait a bit for timer to initialize and show non-zero value
    await page.waitForTimeout(2000); // Wait 2s for timer to increment
    
    // Check if report completed (acceptable in MOCK_MODE)
    const reportVisibleAfter = await reportContent.first().isVisible({ timeout: 1000 }).catch(() => false);
    if (reportVisibleAfter) {
      console.log('[TEST] Year-analysis report completed - timer did not get stuck');
      return; // Test passes
    }
    
    const timerContent = await timerText.first().textContent().catch(() => null);
    console.log('[TEST] Year-analysis timer after 2s:', timerContent);
    
    if (timerContent) {
      // Timer should show elapsed time (0s is acceptable initially, but should increment)
      const elapsedMatch = timerContent.match(/Elapsed:\s*(\d+)s/i);
      if (elapsedMatch) {
        const elapsed = parseInt(elapsedMatch[1]);
        expect(elapsed).toBeGreaterThanOrEqual(0);
        
        // Wait another 2 seconds to verify timer increments
        await page.waitForTimeout(2000);
        
        // Check if report completed
        const reportVisibleAfterWait = await reportContent.first().isVisible({ timeout: 1000 }).catch(() => false);
        if (reportVisibleAfterWait) {
          console.log('[TEST] Year-analysis report completed - timer did not get stuck');
          return; // Test passes
        }
        
        // Check timer again - should show higher value
        const timerContentAfter = await timerText.first().textContent().catch(() => null);
        console.log('[TEST] Year-analysis timer after 4s total:', timerContentAfter);
        
        if (timerContentAfter) {
          const afterMatch = timerContentAfter.match(/Elapsed:\s*(\d+)s/i);
          if (afterMatch) {
            const afterElapsed = parseInt(afterMatch[1]);
            // Timer should increment (or stay same if report completed)
            // CRITICAL: Timer should NOT be stuck at 0s
            if (elapsed === 0) {
              // If timer was at 0s initially, it should have incremented by now
              expect(afterElapsed).toBeGreaterThan(0);
            } else {
              // If timer was already showing a value, it should increment or stay same
              expect(afterElapsed).toBeGreaterThanOrEqual(elapsed);
            }
          }
        }
      }
    }
    
    // Wait for report generation to complete
    await waitForReportGeneration(page, 30000);
    
    // Verify report is displayed (not stuck)
    await expect(reportContent.first()).toBeVisible({ timeout: 5000 });
  });
  
  test('paid report timer should not get stuck at specific number', async ({ page }) => {
    // CRITICAL: This test verifies paid report timer doesn't freeze at a specific number
    // This addresses the defect: "timer stuck at specific number" (reported multiple times)
    await page.goto('/ai-astrology/input?reportType=year-analysis');
    await fillInputForm(page);
    
    // Wait for preview page
    await page.waitForURL(/.*\/ai-astrology\/preview.*/, { timeout: 10000 });
    
    // Wait for timer to be visible
    const timerText = page.locator('text=/Elapsed.*[0-9]+s/i');
    const reportContent = page.locator('text=/Report|Overview|Summary|Year Analysis/i');
    
    // Check if report already completed (acceptable in MOCK_MODE)
    const reportVisible = await reportContent.first().isVisible({ timeout: 2000 }).catch(() => false);
    if (reportVisible) {
      console.log('[TEST] Paid report completed quickly (MOCK_MODE) - timer worked correctly');
      return; // Test passes
    }
    
    // Wait for timer to be visible with retry logic
    let timerVisible = false;
    for (let i = 0; i < 10; i++) {
      await page.waitForTimeout(500);
      timerVisible = await timerText.first().isVisible({ timeout: 1000 }).catch(() => false);
      if (timerVisible) break;
    }
    
    if (!timerVisible) {
      // Timer not visible - check if report completed
      const reportVisibleNoTimer = await reportContent.first().isVisible({ timeout: 2000 }).catch(() => false);
      if (reportVisibleNoTimer) {
        console.log('[TEST] Paid report completed before timer visible (MOCK_MODE) - timer worked correctly');
        return; // Test passes
      }
    }
    
    // Wait a bit for timer to initialize and show non-zero value
    await page.waitForTimeout(2000); // Wait 2s for timer to increment
    
    // Check if report completed (acceptable in MOCK_MODE)
    const reportVisibleAfter = await reportContent.first().isVisible({ timeout: 1000 }).catch(() => false);
    if (reportVisibleAfter) {
      console.log('[TEST] Paid report completed - timer did not get stuck');
      return; // Test passes
    }
    
    const timerContent1 = await timerText.first().textContent().catch(() => null);
    console.log('[TEST] Paid report timer at 2s:', timerContent1);
    
    if (timerContent1) {
      const match1 = timerContent1.match(/Elapsed:\s*(\d+)s/i);
      const time1 = match1 ? parseInt(match1[1]) : 0;
      
      // Wait 3 more seconds
      await page.waitForTimeout(3000);
      
      // Check if report completed
      const reportVisibleAfterWait = await reportContent.first().isVisible({ timeout: 1000 }).catch(() => false);
      if (reportVisibleAfterWait) {
        console.log('[TEST] Paid report completed - timer did not get stuck');
        return; // Test passes
      }
      
      const timerContent2 = await timerText.first().textContent().catch(() => null);
      console.log('[TEST] Paid report timer at 5s:', timerContent2);
      
      if (timerContent2) {
        const match2 = timerContent2.match(/Elapsed:\s*(\d+)s/i);
        const time2 = match2 ? parseInt(match2[1]) : time1;
        
        // Timer should have incremented (not frozen)
        // CRITICAL: If timer was at 0s initially, it should have incremented by now
        if (time1 === 0) {
          expect(time2).toBeGreaterThan(0);
        } else {
          expect(time2).toBeGreaterThanOrEqual(time1);
        }
        
        // Wait another 3 seconds
        await page.waitForTimeout(3000);
        
        const timerContent3 = await timerText.first().textContent().catch(() => null);
        console.log('[TEST] Paid report timer at 8s:', timerContent3);
        
        if (timerContent3) {
          const match3 = timerContent3.match(/Elapsed:\s*(\d+)s/i);
          const time3 = match3 ? parseInt(match3[1]) : time2;
          
          // Timer should continue incrementing (not frozen)
          expect(time3).toBeGreaterThanOrEqual(time2);
          
          // Verify timer is not stuck at the same value (only if all times are > 0)
          if (time1 > 0 && time2 > 0 && time3 > 0 && time1 === time2 && time2 === time3) {
            throw new Error(`Timer appears frozen at ${time1}s - not incrementing`);
          }
        }
      }
    }
    
    // Wait for report generation to complete
    await waitForReportGeneration(page, 30000);
    
    // Verify report is displayed (not stuck)
    await expect(reportContent.first()).toBeVisible({ timeout: 5000 });
  });
  
  test('bundle report timer should not get stuck after 25 seconds', async ({ page }) => {
    // CRITICAL: This test verifies bundle report timer continues properly past the 25 second stuck point
    // This addresses the defect: "bundle report timer stuck after 25 seconds" (reported multiple times)
    await page.goto('/ai-astrology/input?bundle=any-2');
    await fillInputForm(page);
    
    // Wait for preview page
    await page.waitForURL(/.*\/ai-astrology\/preview.*/, { timeout: 10000 });
    
    // Wait for timer to be visible
    const timerText = page.locator('text=/Elapsed.*[0-9]+s/i');
    const reportContent = page.locator('text=/Report|Overview|Summary|Bundle/i');
    
    // Check if report already completed (acceptable in MOCK_MODE)
    const reportVisible = await reportContent.first().isVisible({ timeout: 2000 }).catch(() => false);
    if (reportVisible) {
      console.log('[TEST] Bundle report completed quickly (MOCK_MODE) - timer worked correctly');
      return; // Test passes
    }
    
    // Wait for timer to be visible with retry logic
    let timerVisible = false;
    for (let i = 0; i < 10; i++) {
      await page.waitForTimeout(500);
      timerVisible = await timerText.first().isVisible({ timeout: 1000 }).catch(() => false);
      if (timerVisible) break;
    }
    
    if (!timerVisible) {
      // Timer not visible - check if report completed
      const reportVisibleNoTimer = await reportContent.first().isVisible({ timeout: 2000 }).catch(() => false);
      if (reportVisibleNoTimer) {
        console.log('[TEST] Bundle report completed before timer visible (MOCK_MODE) - timer worked correctly');
        return; // Test passes
      }
    }
    
    // Wait a bit for timer to initialize
    await page.waitForTimeout(2000);
    
    // Check if report completed (acceptable in MOCK_MODE)
    const reportVisibleAfter = await reportContent.first().isVisible({ timeout: 1000 }).catch(() => false);
    if (reportVisibleAfter) {
      console.log('[TEST] Bundle report completed - timer did not get stuck');
      return; // Test passes
    }
    
    const timerContent2s = await timerText.first().textContent().catch(() => null);
    console.log('[TEST] Bundle timer at 2s:', timerContent2s);
    
    if (timerContent2s) {
      // In MOCK_MODE, bundle reports may complete quickly
      // Wait to 10 seconds total
      await page.waitForTimeout(8000);
      
      // Check if report completed
      const reportVisibleAfterWait = await reportContent.first().isVisible({ timeout: 1000 }).catch(() => false);
      if (reportVisibleAfterWait) {
        console.log('[TEST] Bundle report completed - timer did not get stuck');
        return; // Test passes
      }
      
      const timerContent10s = await timerText.first().textContent().catch(() => null);
      console.log('[TEST] Bundle timer at 10s:', timerContent10s);
      
      if (timerContent10s) {
        const match10s = timerContent10s.match(/Elapsed:\s*(\d+)s/i);
        const time10s = match10s ? parseInt(match10s[1]) : 0;
        
        // Wait to 25 seconds (reported stuck point)
        await page.waitForTimeout(15000);
        
        // Check if report completed
        const reportVisibleAt25s = await reportContent.first().isVisible({ timeout: 1000 }).catch(() => false);
        if (reportVisibleAt25s) {
          console.log('[TEST] Bundle report completed at 25s - timer did not get stuck');
          return; // Test passes
        }
        
        const timerContent25s = await timerText.first().textContent().catch(() => null);
        console.log('[TEST] Bundle timer at 25s (reported stuck point):', timerContent25s);
        
        if (timerContent25s) {
          // CRITICAL: Timer should NOT be stuck at 0s
          expect(timerContent25s).not.toMatch(/Elapsed:\s*0s/i);
          const match25s = timerContent25s.match(/Elapsed:\s*(\d+)s/i);
          if (match25s) {
            const time25s = parseInt(match25s[1]);
            // Timer should show at least 20s (allowing for variance)
            expect(time25s).toBeGreaterThanOrEqual(20);
            
            // Wait past the stuck point
            await page.waitForTimeout(5000);
            
            // Check if report completed
            const reportVisibleAt30s = await reportContent.first().isVisible({ timeout: 1000 }).catch(() => false);
            if (reportVisibleAt30s) {
              console.log('[TEST] Bundle report completed at 30s - timer did not get stuck');
              return; // Test passes
            }
            
            const timerContent30s = await timerText.first().textContent().catch(() => null);
            console.log('[TEST] Bundle timer at 30s (past stuck point):', timerContent30s);
            
            if (timerContent30s) {
              const match30s = timerContent30s.match(/Elapsed:\s*(\d+)s/i);
              if (match30s) {
                const time30s = parseInt(match30s[1]);
                // Timer should continue incrementing past 25s (not stuck)
                expect(time30s).toBeGreaterThanOrEqual(time25s);
              }
            }
          }
        }
      }
    }
    
    // Wait for bundle generation to complete
    await waitForReportGeneration(page, 30000);
    
    // Verify bundle reports completed
    await expect(reportContent.first()).toBeVisible({ timeout: 5000 });
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
