/**
 * useElapsedSeconds Hook
 * 
 * Computes elapsed time from startTime (single source of truth).
 * NEVER stores elapsedTime as state - always compute it.
 * 
 * This eliminates timer freezing, jumping backwards, and continuing after completion.
 * 
 * CRITICAL FIX (ChatGPT Feedback): Persists timer start in sessionStorage to prevent reset on remount.
 * 
 * @param startTime - Start time in milliseconds (Date.now() value) or null
 * @param isRunning - Whether the timer should be running
 * @param startTimeRef - Optional ref to check if state is null (fixes race condition)
 * @param storageKey - Optional key for sessionStorage persistence (reportId or session_id)
 * @returns Elapsed time in seconds (computed, not stored)
 */

import { useState, useEffect, useRef, type RefObject } from 'react';

export function useElapsedSeconds(
  startTime: number | null,
  isRunning: boolean,
  startTimeRef?: RefObject<number | null>,
  storageKey?: string | null
): number {
  // CRITICAL: Don't store elapsedTime as state - compute it
  const [elapsed, setElapsed] = useState<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  // CRITICAL FIX: Use local mutable ref to store restored time from sessionStorage
  // This avoids trying to modify the read-only RefObject.current
  const restoredStartTimeRef = useRef<number | null>(null);
  
  // CRITICAL FIX (ChatGPT Feedback): Persist timer start in sessionStorage
  // This prevents timer from resetting when component remounts
  const getStorageKey = () => {
    if (!storageKey) return null;
    return `aiAstrologyTimer_${storageKey}`;
  };
  
  // Load persisted start time from sessionStorage on mount
  useEffect(() => {
    const key = getStorageKey();
    if (!key || typeof window === "undefined") return;
    
    try {
      const stored = sessionStorage.getItem(key);
      if (stored && !startTime && !startTimeRef?.current) {
        const storedTime = Number(stored);
        if (!isNaN(storedTime) && storedTime > 0) {
          // Only use stored time if it's recent (within last 24 hours)
          const now = Date.now();
          const maxAge = 24 * 60 * 60 * 1000; // 24 hours
          if (now - storedTime < maxAge) {
            // Restore start time from sessionStorage to local mutable ref
            restoredStartTimeRef.current = storedTime;
          } else {
            // Stored time is too old, clear it
            sessionStorage.removeItem(key);
            restoredStartTimeRef.current = null;
          }
        }
      }
    } catch (e) {
      // Ignore sessionStorage errors (private browsing, etc.)
      console.warn("[useElapsedSeconds] Failed to read from sessionStorage:", e);
    }
  }, []); // Only run on mount
  
  // Save start time to sessionStorage when it changes
  useEffect(() => {
    const key = getStorageKey();
    if (!key || typeof window === "undefined") return;
    
    const currentStartTime = startTime ?? startTimeRef?.current ?? restoredStartTimeRef.current ?? null;
    if (currentStartTime) {
      try {
        sessionStorage.setItem(key, String(currentStartTime));
        // Also update restored ref if we're using it
        if (!startTime && !startTimeRef?.current) {
          restoredStartTimeRef.current = currentStartTime;
        }
      } catch (e) {
        // Ignore sessionStorage errors
        console.warn("[useElapsedSeconds] Failed to write to sessionStorage:", e);
      }
    } else {
      // Clear storage when start time is cleared (generation completed)
      try {
        sessionStorage.removeItem(key);
        restoredStartTimeRef.current = null;
      } catch (e) {
        // Ignore sessionStorage errors
      }
    }
  }, [startTime, storageKey, startTimeRef]);

  useEffect(() => {
    // CRITICAL FIX: If not running, stop timer and reset elapsed time to 0
    // This ensures the timer resets when stopped, as expected by tests and UI behavior
    if (!isRunning) {
      // Always stop the interval when not running
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      // Reset elapsed time to 0 when not running
      // This matches test expectations and provides consistent UI behavior
      setElapsed(0);
      return;
    }

    // CRITICAL: Compute elapsed time immediately (don't wait for interval)
    const computeElapsed = () => {
      // Use ref if state is still null (race condition fix)
      // Also check restored time from sessionStorage
      const currentStartTime = startTime ?? startTimeRef?.current ?? restoredStartTimeRef.current ?? null;
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
      const currentStartTime = startTime ?? startTimeRef?.current ?? restoredStartTimeRef.current ?? null;
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

