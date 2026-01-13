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
 * @returns Elapsed time in seconds (computed, not stored)
 */

import { useState, useEffect, useRef } from 'react';

export function useElapsedSeconds(
  startTime: number | null,
  isRunning: boolean
): number {
  // CRITICAL: Don't store elapsedTime as state - compute it
  const [elapsed, setElapsed] = useState<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // If not running or no start time, reset to 0
    if (!isRunning || !startTime) {
      setElapsed(0);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // CRITICAL: Compute elapsed time immediately (don't wait for interval)
    const computeElapsed = () => {
      return Math.floor((Date.now() - startTime) / 1000);
    };

    // Set initial elapsed time immediately
    setElapsed(computeElapsed());

    // Update every second
    intervalRef.current = setInterval(() => {
      setElapsed(computeElapsed());
    }, 1000);

    // Cleanup on unmount or when dependencies change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [startTime, isRunning]);

  return elapsed;
}

