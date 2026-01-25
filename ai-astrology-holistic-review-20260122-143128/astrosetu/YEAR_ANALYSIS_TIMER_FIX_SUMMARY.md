# Year-Analysis Timer Fix - Summary

## ✅ Fix Applied

### Root Cause
**Race condition**: `useElapsedSeconds` hook depends on `loadingStartTime` state, but React state updates are async. When `setLoadingStartTime()` is called for year-analysis (paid report), the state update hasn't flushed yet, so the hook receives `null` and returns 0.

### Solution
Modified `useElapsedSeconds` hook to accept an optional `startTimeRef` parameter. If state is null but ref has a value, use the ref as fallback. This fixes the race condition because refs are updated synchronously.

### Files Changed
1. **`src/hooks/useElapsedSeconds.ts`**:
   - Added optional `startTimeRef?: RefObject<number | null>` parameter
   - Use ref as fallback: `const effectiveStartTime = startTime ?? startTimeRef?.current ?? null;`
   - Check ref in `computeElapsed()` function as well

2. **`src/app/ai-astrology/preview/page.tsx`**:
   - Pass `loadingStartTimeRef` to hook: `useElapsedSeconds(loadingStartTime, loading, loadingStartTimeRef)`
   - Moved hook call after ref declaration to fix TypeScript error

### Why Tests Didn't Catch It
1. **E2E tests use MOCK_MODE**: Reports complete in < 1s, timer never shows bug
2. **Tests check visibility, not values**: Don't verify actual timer state
3. **Race condition is timing-dependent**: Hard to reproduce in controlled test environment
4. **Tests don't wait for state flush**: Assume state is immediately available

### Test Improvements Needed
1. Add state flush verification in E2E tests
2. Disable MOCK_MODE for timer-specific tests
3. Verify actual timer values (not just visibility)
4. Add race condition test case
5. Test with real React state updates

## 🎯 Status
- ✅ Fix implemented
- ✅ TypeScript errors resolved
- ⏳ Manual testing needed
- ⏳ Test improvements needed

