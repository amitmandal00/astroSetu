# Root Cause Analysis: Year-Analysis Timer Stuck at 0s

## 🔴 Issue
Year-analysis report timer is stuck at 0s and not incrementing.

## 🔍 Root Cause

### The Problem
For **paid reports** (including year-analysis), there's a **race condition** between:
1. Setting `loadingStartTime` state in the auto-generate flow (line 1243)
2. The `useElapsedSeconds` hook reading `loadingStartTime` (line 44)

### The Flow (Year-Analysis - Paid Report)

1. **Auto-generate flow** (lines 1236-1247):
   ```typescript
   setLoading(true);  // Line 1236
   setLoadingStage("generating");  // Line 1237
   if (loadingStartTimeRef.current === null) {
     const startTime = Date.now();
     loadingStartTimeRef.current = startTime;  // Line 1242 - REF set immediately
     setLoadingStartTime(startTime);  // Line 1243 - STATE set (async!)
   }
   ```

2. **generateReport called** (line 1347) with 300ms delay:
   ```typescript
   setTimeout(() => {
     generateReport(...);  // Line 1347
   }, 300);
   ```

3. **Inside generateReport** (lines 169-183):
   ```typescript
   if (loadingStartTimeRef.current === null) {  // This is FALSE (already set)
     // Won't execute - ref already set
   } else {
     // This executes, but doesn't update state
     const currentElapsed = Math.floor((Date.now() - loadingStartTimeRef.current) / 1000);
     // But this doesn't update loadingStartTime state!
   }
   ```

### The Critical Issue

**`useElapsedSeconds` depends on `loadingStartTime` STATE, not the REF!**

```typescript
const elapsedTime = useElapsedSeconds(loadingStartTime, loading);  // Line 44
```

But `loadingStartTime` state update is **async** (React state updates are batched). So:

1. `setLoadingStartTime(startTime)` is called (line 1243)
2. `setLoading(true)` is called (line 1236)
3. `useElapsedSeconds(loadingStartTime, loading)` runs
4. But `loadingStartTime` is still `null` (state update hasn't flushed yet!)
5. Hook returns 0 because `startTime` is null
6. Timer shows 0s

### Why Tests Don't Catch This

1. **E2E tests use MOCK_MODE**: Reports complete too quickly (< 1s), so timer never has a chance to show the bug
2. **Tests check for timer visibility, not state**: Tests verify timer text is visible, but don't verify the actual state values
3. **Race condition is timing-dependent**: Only happens when state update is delayed, which is hard to reproduce in tests

## ✅ Solution

### Option 1: Use Ref Directly in Hook (Recommended)
Modify `useElapsedSeconds` to accept a ref or use a different approach that doesn't depend on async state updates.

### Option 2: Ensure State is Set Synchronously
Use `flushSync` or ensure `loadingStartTime` is set before `setLoading(true)`.

### Option 3: Use Ref for Timer Calculation
Calculate elapsed time from `loadingStartTimeRef.current` directly in the component, not in the hook.

### Option 4: Fix the Race Condition
Ensure `loadingStartTime` state is set BEFORE `setLoading(true)`, or use a ref-based approach.

## 🎯 Recommended Fix

**Use `loadingStartTimeRef.current` directly in the component for timer calculation**, bypassing the async state update issue:

```typescript
// Instead of:
const elapsedTime = useElapsedSeconds(loadingStartTime, loading);

// Use:
const elapsedTime = useElapsedSeconds(
  loadingStartTimeRef.current,  // Use ref directly
  loading
);
```

But this requires modifying the hook to accept `number | null` directly, or creating a wrapper.

**Better approach**: Modify `useElapsedSeconds` to also check a ref if state is null:

```typescript
export function useElapsedSeconds(
  startTime: number | null,
  isRunning: boolean,
  startTimeRef?: React.RefObject<number | null>  // Optional ref fallback
): number {
  // Use ref if state is null but ref has value
  const effectiveStartTime = startTime ?? startTimeRef?.current ?? null;
  // ... rest of hook
}
```

## 📋 Test Fix

Update E2E tests to:
1. **Disable MOCK_MODE** for timer tests (or add delay)
2. **Check actual timer value** (not just visibility)
3. **Wait for state to flush** before checking timer
4. **Verify timer increments** over multiple seconds

