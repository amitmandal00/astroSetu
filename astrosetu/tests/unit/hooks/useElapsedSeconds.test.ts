/**
 * Unit Tests for useElapsedSeconds Hook
 * Tests the hook that computes elapsed time from startTime (single source of truth)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useElapsedSeconds } from '@/hooks/useElapsedSeconds';

describe('useElapsedSeconds Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Timer Initialization', () => {
    it('should return 0 when startTime is null', () => {
      const { result } = renderHook(() => useElapsedSeconds(null, false));
      expect(result.current).toBe(0);
    });

    it('should return 0 when isRunning is false', () => {
      const startTime = Date.now();
      const { result } = renderHook(() => useElapsedSeconds(startTime, false));
      expect(result.current).toBe(0);
    });

    it('should compute elapsed time when running', () => {
      const startTime = Date.now();
      const { result } = renderHook(() => useElapsedSeconds(startTime, true));
      
      // Initially should be 0 or very small
      expect(result.current).toBeGreaterThanOrEqual(0);
      
      // Advance time by 5 seconds
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      
      // Should be approximately 5 seconds
      expect(result.current).toBeGreaterThanOrEqual(4);
      expect(result.current).toBeLessThanOrEqual(6);
    });
  });

  describe('Timer Updates', () => {
    it('should update every second when running', () => {
      const startTime = Date.now();
      const { result } = renderHook(() => useElapsedSeconds(startTime, true));
      
      // Initially should be 0 or very small
      expect(result.current).toBeGreaterThanOrEqual(0);
      
      // Advance by 1 second
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      
      // Should be approximately 1 second
      expect(result.current).toBeGreaterThanOrEqual(0);
      expect(result.current).toBeLessThanOrEqual(2);
      
      // Advance by another 2 seconds
      act(() => {
        vi.advanceTimersByTime(2000);
      });
      
      // Should be approximately 3 seconds
      expect(result.current).toBeGreaterThanOrEqual(2);
      expect(result.current).toBeLessThanOrEqual(4);
    });

    it('should stop updating when isRunning becomes false', () => {
      const startTime = Date.now();
      const { result, rerender } = renderHook(
        ({ isRunning }) => useElapsedSeconds(startTime, isRunning),
        { initialProps: { isRunning: true } }
      );
      
      // Advance time
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      
      const elapsedBeforeStop = result.current;
      expect(elapsedBeforeStop).toBeGreaterThanOrEqual(4);
      
      // Stop timer
      rerender({ isRunning: false });
      
      // Advance more time
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      
      // Should still be 0 (reset when stopped)
      expect(result.current).toBe(0);
    });

    it('should reset when startTime changes', () => {
      const initialStartTime = Date.now();
      const { result, rerender } = renderHook(
        ({ startTime }) => useElapsedSeconds(startTime, true),
        { initialProps: { startTime: initialStartTime } }
      );
      
      // Advance time
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      
      expect(result.current).toBeGreaterThanOrEqual(4);
      
      // Change startTime to now (reset)
      const newStartTime = Date.now();
      rerender({ startTime: newStartTime });
      
      // Should reset to 0 or very small
      expect(result.current).toBeLessThan(2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null startTime gracefully', () => {
      const { result } = renderHook(() => useElapsedSeconds(null, true));
      expect(result.current).toBe(0);
    });

    it('should handle startTime in the future', () => {
      const futureTime = Date.now() + 10000; // 10 seconds in future
      const { result } = renderHook(() => useElapsedSeconds(futureTime, true));
      
      // Should return 0 (can't have negative elapsed time)
      expect(result.current).toBe(0);
    });

    it('should compute correctly for long durations', () => {
      const startTime = Date.now() - 60000; // Started 60 seconds ago
      const { result } = renderHook(() => useElapsedSeconds(startTime, true));
      
      // Should be approximately 60 seconds
      expect(result.current).toBeGreaterThanOrEqual(59);
      expect(result.current).toBeLessThanOrEqual(61);
    });
  });

  describe('Single Source of Truth', () => {
    it('should always compute from startTime, never store state', () => {
      const startTime = Date.now();
      const { result } = renderHook(() => useElapsedSeconds(startTime, true));
      
      // Advance time
      act(() => {
        vi.advanceTimersByTime(3000);
      });
      
      const firstValue = result.current;
      expect(firstValue).toBeGreaterThanOrEqual(2);
      
      // Advance more time
      act(() => {
        vi.advanceTimersByTime(2000);
      });
      
      const secondValue = result.current;
      expect(secondValue).toBeGreaterThan(firstValue);
      
      // This proves it's computing, not storing
      // If it were storing, the second value wouldn't increase
    });
  });
});

