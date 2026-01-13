# Year-Analysis Timer Fix

## 🔴 Issue
Year-analysis timer stuck at 0s - not incrementing.

## 🔍 Root Cause
**Race condition**: `useElapsedSeconds` hook depends on `loadingStartTime` state, but React state updates are async. When `setLoadingStartTime()` is called, the state update hasn't flushed yet, so the hook receives `null` and returns 0.

### The Flow (Year-Analysis - Paid Report)
1. `setLoadingStartTime(startTime)` called (line 1243) - **async state update**
2. `setLoading(true)` called (line 1236) - **async state update**
3. `useElapsedSeconds(loadingStartTime, loading)` runs immediately
4. But `loadingStartTime` is still `null` (state update hasn't flushed!)
5. Hook returns 0 because `startTime` is null
6. Timer shows 0s

## ✅ Fix
Modified `useElapsedSeconds` hook to accept an optional `startTimeRef` parameter. If state is null but ref has a value, use the ref. This fixes the race condition.

### Changes
1. **`useElapsedSeconds.ts`**: Added optional `startTimeRef` parameter
2. **`preview/page.tsx`**: Pass `loadingStartTimeRef` to hook
3. **Hook logic**: Use ref as fallback if state is null

### Code Changes
```typescript
// Before:
const elapsedTime = useElapsedSeconds(loadingStartTime, loading);

// After:
const elapsedTime = useElapsedSeconds(loadingStartTime, loading, loadingStartTimeRef);
```

```typescript
// Hook now checks ref if state is null:
const effectiveStartTime = startTime ?? startTimeRef?.current ?? null;
```

## 🎯 Why Tests Didn't Catch It
1. **E2E tests use MOCK_MODE**: Reports complete too quickly (< 1s)
2. **Tests check visibility, not values**: Don't verify actual timer state
3. **Race condition is timing-dependent**: Hard to reproduce in tests
4. **Tests don't wait for state flush**: Assume state is immediately available

## 📋 Next Steps
1. ✅ Fix implemented
2. ⏳ Test the fix manually
3. ⏳ Update E2E tests to catch race conditions
4. ⏳ Add unit test for ref fallback behavior

