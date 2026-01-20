/**
 * useElapsedSeconds Hook
 * 
 * Computes elapsed time from startTime (single source of truth).
 * NEVER stores elapsedTime as state - always compute it.
 * 
 * This eliminates timer freezing, jumping backwards, and continuing after completion.
 * 
 * @param startTime - Start time in milliseconds (Date.now() value) or null
 * @param isRunning - Whether the timer should be running
 * @param startTimeRef - Optional ref to check if state is null (fixes race condition)
 * @returns Elapsed time in seconds (computed, not stored)
 */

import { useState, useEffect, useRef, type RefObject } from 'react';

export function useElapsedSeconds(
  startTime: number | null,
  isRunning: boolean,
  startTimeRef?: RefObject<number | null>
): number {
  // CRITICAL: Don't store elapsedTime as state - compute it
  const [elapsed, setElapsed] = useState<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // CRITICAL FIX: If not running, stop timer but DON'T reset elapsed time if startTime is still set
    // This prevents timer from resetting during brief state transitions (e.g., bundle generation)
    // Only reset elapsed time when startTime is null (generation hasn't started or has fully completed)
    if (!isRunning) {
      // Always stop the interval when not running
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      // Only reset elapsed time if startTime is null (generation fully completed or never started)
      const currentStartTime = startTime ?? startTimeRef?.current ?? null;
      if (!currentStartTime) {
        setElapsed(0);
        return;
      }
      // If startTime exists but not running, keep showing last elapsed time (don't reset)
      // This prevents timer from resetting during brief state transitions
      // The elapsed time will be computed below if isRunning becomes true again
      return;
    }

    // CRITICAL: Compute elapsed time immediately (don't wait for interval)
    const computeElapsed = () => {
      // Use ref if state is still null (race condition fix)
      const currentStartTime = startTime ?? startTimeRef?.current ?? null;
      if (!currentStartTime) return 0;
      const elapsed = Math.floor((Date.now() - currentStartTime) / 1000);
      // CRITICAL FIX: Clamp to 0 (can't have negative elapsed time for future startTime)
      return Math.max(0, elapsed);
    };

    // Set initial elapsed time immediately
    setElapsed(computeElapsed());

    // Update every second.
    // IMPORTANT: Even if startTime isn't available *yet*, keep the interval alive while isRunning is true.
    // Some flows set `startTimeRef.current` slightly after `isRunning` flips true; without this,
    // the timer can get "stuck" at 0 because the effect would bail out before the ref is populated.
    intervalRef.current = setInterval(() => {
      // CRITICAL FIX: Check if still running on each interval
      // This prevents timer from continuing if loading was set to false
      const currentStartTime = startTime ?? startTimeRef?.current ?? null;
      if (!currentStartTime) {
        setElapsed(0);
        return;
      }
      setElapsed(computeElapsed());
    }, 1000);

    // Cleanup on unmount or when dependencies change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [startTime, isRunning, startTimeRef]);

  return elapsed;
}

