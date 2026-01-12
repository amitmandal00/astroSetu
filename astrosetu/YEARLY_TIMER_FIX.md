# Yearly Analysis Timer Fix

**Date:** 2025-01-XX  
**Issue:** Year-analysis report timer stuck at 0s

---

## Root Cause

The timer useEffect has dependencies `[loading, loadingStage, reportType, bundleGenerating]`. When `loadingStage` changes from "verifying" to "generating" during payment verification flow, the useEffect re-runs and clears/recreates the interval.

However, the timer initialization logic calculates elapsed time from `loadingStartTimeRef.current`, which should be set during payment verification. The issue might be:

1. The timer useEffect dependency array causes interval to be cleared/recreated
2. When interval is recreated, the initial elapsed time calculation might not run correctly
3. Or the interval callback might have a closure issue

---

## Fix Strategy

The timer logic should:
1. Start when loading becomes true (payment verification starts)
2. Continue seamlessly when loadingStage changes from "verifying" to "generating"
3. Calculate elapsed time correctly from the initial start time

Current code already has:
- `loadingStartTimeRef.current` set during payment verification
- Initial elapsed time calculation in useEffect
- Interval using ref (not state) to avoid closure issues

The issue might be that when `loadingStage` changes, the useEffect re-runs, but the initial elapsed time calculation happens before the interval is set up, and there might be a race condition.

Let me check if there's an issue with the dependency array causing unnecessary interval recreation.

Actually, wait - the dependency array includes `loadingStage`, so every time `loadingStage` changes, the useEffect re-runs, clearing the old interval and creating a new one. This is expected and correct.

But the initial elapsed time calculation should run every time the useEffect runs (when loading is true), so the timer should update correctly.

Let me check if there's something else...

---

## Investigation Needed

1. Check if `loadingStartTimeRef.current` is set correctly for year-analysis
2. Check if the timer useEffect is running
3. Check if the interval callback is being called
4. Check if `setElapsedTime` is being called

---

**Status**: Investigating...

