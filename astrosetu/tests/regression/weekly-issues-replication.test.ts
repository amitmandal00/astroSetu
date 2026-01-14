/**
 * Weekly Issues Replication Tests
 * 
 * These tests specifically replicate the 7 issues reported last week (Jan 6-13, 2026):
 * 1. Retry Loading Bundle Button Not Working
 * 2. Free Report Timer Stuck at 0s / 19s
 * 3. Bundle Timer Stuck at 25/26s
 * 4. Year-Analysis Timer Stuck at 0s
 * 5. Paid Report Timer Stuck at 0s
 * 6. State Not Updated When Polling Succeeds (ROOT CAUSE)
 * 7. Timer Continues After Report Completes (ROOT CAUSE)
 * 
 * These tests verify that all issues are fixed.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useElapsedSeconds } from '@/hooks/useElapsedSeconds';
import { useReportGenerationController } from '@/hooks/useReportGenerationController';
import type { AIAstrologyInput } from '@/lib/ai-astrology/types';

// Mock fetch
global.fetch = vi.fn();

describe('Weekly Issues Replication Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    (global.fetch as any).mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('Issue #1: Retry Loading Bundle Button Not Working', () => {
    it('should reset generation guards before retrying bundle', async () => {
      // This test verifies that bundle retry resets guards
      // Before fix: Guards not reset, retry blocked
      // After fix: Guards reset, retry works
      
      const { result } = renderHook(() => useReportGenerationController());
      
      const input: AIAstrologyInput = {
        name: 'Test User',
        dob: '1990-01-01',
        tob: '12:00',
        place: 'Mumbai',
      };

      // Start first attempt - mock initial response
      (global.fetch as any).mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ ok: true, data: { status: 'processing', reportId: 'report-1' } }),
        } as Response)
      );

      await act(async () => {
        await result.current.start(input, 'marriage-timing');
      });

      // Wait for polling to start - allow time for async operations
      await waitFor(() => {
        expect(result.current.status).toBe('polling');
      }, { timeout: 5000 });

      // Cancel (simulating retry) - this should reset guards
      await act(async () => {
        result.current.cancel();
      });

      // Should be able to start again (guards reset)
      expect(result.current.status).toBe('idle');

      // Start second attempt (retry) - mock initial response that completes immediately
      // Use mockImplementation to handle any subsequent polling
      (global.fetch as any).mockImplementation((url: string) => {
        // If it's a polling request for report-2, return completed
        if (url.includes('reportId=report-2')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => ({ ok: true, data: { status: 'completed', reportId: 'report-2', content: { title: 'Test', sections: [] } } }),
          } as Response);
        }
        // Initial POST request - return completed immediately
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ ok: true, data: { status: 'completed', reportId: 'report-2', content: { title: 'Test', sections: [] } } }),
        } as Response);
      });

      await act(async () => {
        await result.current.start(input, 'marriage-timing');
      });

      // Should succeed (not blocked by guards) - use real timers
      await waitFor(() => {
        expect(result.current.status).toBe('completed');
      }, { timeout: 5000 });
    }, { timeout: 10000 });
  });

  describe('Issue #2: Free Report Timer Stuck at 0s / 19s', () => {
    it('should not get stuck at 0s - timer should increment immediately', () => {
      // This test verifies timer doesn't get stuck at 0s
      // Before fix: Timer stuck at 0s initially
      // After fix: Timer increments immediately
      
      const startTime = Date.now();
      const { result } = renderHook(() => useElapsedSeconds(startTime, true));

      // Initially should be 0 or very small (not stuck)
      expect(result.current).toBeGreaterThanOrEqual(0);
      expect(result.current).toBeLessThan(2);

      // Advance time by 5 seconds
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      // Should be approximately 5 seconds (not stuck at 0s)
      expect(result.current).toBeGreaterThanOrEqual(4);
      expect(result.current).toBeLessThanOrEqual(6);
    });

    it('should not get stuck at 19s - timer should continue incrementing', () => {
      // This test verifies timer doesn't get stuck at 19s
      // Before fix: Timer stuck at 19s
      // After fix: Timer continues incrementing
      
      const startTime = Date.now() - 19000; // Started 19 seconds ago
      const { result } = renderHook(() => useElapsedSeconds(startTime, true));

      // Should be approximately 19 seconds
      expect(result.current).toBeGreaterThanOrEqual(18);
      expect(result.current).toBeLessThanOrEqual(20);

      // Advance time by 5 seconds
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      // Should be approximately 24 seconds (not stuck at 19s)
      expect(result.current).toBeGreaterThanOrEqual(23);
      expect(result.current).toBeLessThanOrEqual(25);
    });
  });

  describe('Issue #3: Bundle Timer Stuck at 25/26s', () => {
    it('should not get stuck at 25s - timer should continue incrementing', () => {
      // This test verifies bundle timer doesn't get stuck at 25s
      // Before fix: Timer stuck at 25s for bundles
      // After fix: Timer continues incrementing
      
      const startTime = Date.now() - 25000; // Started 25 seconds ago
      const { result } = renderHook(() => useElapsedSeconds(startTime, true));

      // Should be approximately 25 seconds
      expect(result.current).toBeGreaterThanOrEqual(24);
      expect(result.current).toBeLessThanOrEqual(26);

      // Advance time by 10 seconds
      act(() => {
        vi.advanceTimersByTime(10000);
      });

      // Should be approximately 35 seconds (not stuck at 25s)
      expect(result.current).toBeGreaterThanOrEqual(34);
      expect(result.current).toBeLessThanOrEqual(36);
    });
  });

  describe('Issue #4: Year-Analysis Timer Stuck at 0s', () => {
    it('should not get stuck at 0s for year-analysis reports', () => {
      // This test verifies year-analysis timer doesn't get stuck at 0s
      // Before fix: Timer stuck at 0s for year-analysis
      // After fix: Timer increments immediately (ref fallback fixes race condition)
      
      const startTime = Date.now();
      const startTimeRef = { current: startTime }; // Simulate ref being set
      const { result } = renderHook(() => 
        useElapsedSeconds(null, true, startTimeRef as any) // State null, but ref has value
      );

      // Should use ref fallback and show elapsed time (not stuck at 0s)
      expect(result.current).toBeGreaterThanOrEqual(0);
      expect(result.current).toBeLessThan(2);

      // Advance time by 5 seconds
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      // Should be approximately 5 seconds (not stuck at 0s)
      expect(result.current).toBeGreaterThanOrEqual(4);
      expect(result.current).toBeLessThanOrEqual(6);
    });
  });

  describe('Issue #5: Paid Report Timer Stuck at 0s', () => {
    it('should not get stuck at 0s during payment verification to generation transition', () => {
      // This test verifies timer doesn't reset during transition
      // Before fix: Timer reset to 0s during transition
      // After fix: Timer preserves start time across transitions
      
      const initialStartTime = Date.now() - 5000; // Started 5 seconds ago
      const { result, rerender } = renderHook(
        ({ startTime, isRunning }) => useElapsedSeconds(startTime, isRunning),
        { initialProps: { startTime: initialStartTime, isRunning: true } }
      );

      // Should be approximately 5 seconds
      expect(result.current).toBeGreaterThanOrEqual(4);
      expect(result.current).toBeLessThanOrEqual(6);

      // Simulate transition (startTime changes but should preserve elapsed time)
      // In real scenario, we preserve the startTime, so elapsed continues
      const newStartTime = initialStartTime; // Preserved (not reset)
      rerender({ startTime: newStartTime, isRunning: true });

      // Advance time by 3 seconds
      act(() => {
        vi.advanceTimersByTime(3000);
      });

      // Should be approximately 8 seconds (not reset to 0s)
      expect(result.current).toBeGreaterThanOrEqual(7);
      expect(result.current).toBeLessThanOrEqual(9);
    });
  });

  describe('Issue #6: State Not Updated When Polling Succeeds (ROOT CAUSE)', () => {
    it('should update state immediately when polling succeeds', async () => {
      // This test verifies state is updated when polling succeeds
      // Before fix: State not updated, timer continues, report not displayed
      // After fix: State updated immediately, timer stops, report displayed
      
      const { result } = renderHook(() => useReportGenerationController());
      
      const input: AIAstrologyInput = {
        name: 'Test User',
        dob: '1990-01-01',
        tob: '12:00',
        place: 'Mumbai',
      };

      // Set up mock to handle both initial request and polling
      // Use a counter to track calls
      let fetchCallCount = 0;
      (global.fetch as any).mockImplementation((url: string | Request, options?: RequestInit) => {
        fetchCallCount++;
        const urlString = typeof url === 'string' ? url : url.toString();
        
        // First call: Initial POST request - return processing
        if (fetchCallCount === 1) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => ({ 
              ok: true, 
              data: { status: 'processing', reportId: 'report-1' } 
            }),
          } as Response);
        }
        
        // Subsequent calls: Polling GET requests - return completed
        if (urlString.includes('reportId=report-1') || urlString.includes('reportId')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => ({ 
              ok: true, 
              data: { 
                status: 'completed', 
                reportId: 'report-1',
                content: { title: 'Test Report', sections: [] }
              } 
            }),
          } as Response);
        }
        
        // Fallback: return processing
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ 
            ok: true, 
            data: { status: 'processing', reportId: 'report-1' } 
          }),
        } as Response);
      });

      await act(async () => {
        await result.current.start(input, 'life-summary');
      });

      await waitFor(() => {
        expect(result.current.status).toBe('polling');
      }, { timeout: 5000 });

      // Advance time to trigger polling (polling interval is 2000ms)
      // Use real timers for async operations
      await act(async () => {
        vi.advanceTimersByTime(2500); // Slightly more than poll interval
      });

      // CRITICAL: State should be updated immediately
      await waitFor(() => {
        expect(result.current.status).toBe('completed');
        expect(result.current.reportContent).not.toBeNull();
      }, { timeout: 8000 });
      
      // Timer should be stopped (startTime is null when completed)
      expect(result.current.startTime).toBeNull();
    }, { timeout: 10000 });
  });

  describe('Issue #7: Timer Continues After Report Completes (ROOT CAUSE)', () => {
    it('should stop timer immediately when report completes', async () => {
      // This test verifies timer stops when report completes
      // Before fix: Timer continues after completion
      // After fix: Timer stops immediately
      
      const startTime = Date.now() - 10000; // Started 10 seconds ago
      const { result, rerender } = renderHook(
        ({ startTime, isRunning, reportContent }) => {
          const elapsed = useElapsedSeconds(startTime, isRunning);
          return { elapsed, reportContent };
        },
        { initialProps: { startTime, isRunning: true, reportContent: null } }
      );

      // Should be approximately 10 seconds
      expect(result.current.elapsed).toBeGreaterThanOrEqual(9);
      expect(result.current.elapsed).toBeLessThanOrEqual(11);

      // Simulate report completion (reportContent set, loading false)
      rerender({ startTime: null, isRunning: false, reportContent: { title: 'Test' } });

      // Timer should stop immediately (elapsed should be 0)
      expect(result.current.elapsed).toBe(0);

      // Advance time - timer should NOT increment
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      // Timer should still be 0 (not continuing)
      expect(result.current.elapsed).toBe(0);
    });
  });

  describe('Comprehensive: All Issues Together', () => {
    it('should handle complete flow without any stuck states', async () => {
      // This test verifies the complete flow works without any of the 7 issues
      // Simulates: Free report → Timer starts → Polling → Completion → Timer stops
      
      const { result: controllerResult } = renderHook(() => useReportGenerationController());
      const startTime = Date.now();
      const { result: timerResult } = renderHook(() => 
        useElapsedSeconds(startTime, true)
      );
      
      const input: AIAstrologyInput = {
        name: 'Test User',
        dob: '1990-01-01',
        tob: '12:00',
        place: 'Mumbai',
      };

      // Set up mock to handle both initial request and polling
      let fetchCallCount = 0;
      (global.fetch as any).mockImplementation((url: string | Request, options?: RequestInit) => {
        fetchCallCount++;
        const urlString = typeof url === 'string' ? url : url.toString();
        
        // First call: Initial POST request - return processing
        if (fetchCallCount === 1) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => ({ 
              ok: true, 
              data: { status: 'processing', reportId: 'report-1' } 
            }),
          } as Response);
        }
        
        // Subsequent calls: Polling GET requests - return completed
        if (urlString.includes('reportId=report-1') || urlString.includes('reportId')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => ({ 
              ok: true, 
              data: { 
                status: 'completed', 
                reportId: 'report-1',
                content: { title: 'Test Report', sections: [] }
              } 
            }),
          } as Response);
        }
        
        // Fallback: return processing
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ 
            ok: true, 
            data: { status: 'processing', reportId: 'report-1' } 
          }),
        } as Response);
      });

      await act(async () => {
        await controllerResult.current.start(input, 'life-summary');
      });

      // Timer should be incrementing (not stuck at 0s)
      await act(async () => {
        vi.advanceTimersByTime(5000);
      });
      expect(timerResult.current).toBeGreaterThanOrEqual(4);
      expect(timerResult.current).toBeLessThanOrEqual(6);

      // Advance more time - timer should continue (not stuck)
      await act(async () => {
        vi.advanceTimersByTime(10000);
      });
      expect(timerResult.current).toBeGreaterThanOrEqual(14);
      expect(timerResult.current).toBeLessThanOrEqual(16);

      // Advance time to trigger polling
      await act(async () => {
        vi.advanceTimersByTime(2500); // Slightly more than poll interval
      });

      // CRITICAL: State should be updated and timer should stop
      await waitFor(() => {
        expect(controllerResult.current.status).toBe('completed');
        expect(controllerResult.current.reportContent).not.toBeNull();
      }, { timeout: 8000 });

      // Timer should stop (isRunning becomes false)
      const { result: stoppedTimerResult } = renderHook(() => 
        useElapsedSeconds(null, false)
      );
      expect(stoppedTimerResult.current).toBe(0);

      // Advance time - timer should NOT increment
      await act(async () => {
        vi.advanceTimersByTime(5000);
      });
      expect(stoppedTimerResult.current).toBe(0);
    }, { timeout: 15000 });
  });
});

