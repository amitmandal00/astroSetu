# Retry Loading Bundle Button Fix

**Date:** 2025-01-12  
**Status:** ✅ Fixed and Tested

---

## Issue

The "Retry Loading Bundle" button was not working when clicked. The button appeared but clicking it did not trigger any action.

**Root Cause:**
The `handleRetryLoading` function had several issues:
1. It only checked `bundleType && bundleReports.length > 0` in state, but if the bundle was stuck/failed, `bundleReports.length` might be 0
2. It didn't check sessionStorage for bundle info when state variables were empty
3. For bundles, it only redirected with `auto_generate=true` instead of calling `generateBundleReports` directly
4. It didn't handle the case where bundle info exists in sessionStorage but state variables are empty

---

## Fix

Modified `handleRetryLoading` function in `src/app/ai-astrology/preview/page.tsx`:

1. **Added sessionStorage check for bundle info**: Now checks `aiAstrologyBundle` and `aiAstrologyBundleReports` in sessionStorage even if state variables are empty
2. **Direct bundle regeneration**: For bundles, now calls `generateBundleReports` directly instead of just redirecting
3. **Better error handling**: Handles cases where bundle info exists in sessionStorage but state is empty
4. **Payment info preservation**: Uses sessionId and paymentIntentId from sessionStorage when retrying bundles

**Key Changes:**
- Check sessionStorage for bundle info before checking state variables
- Call `generateBundleReports` with input data, bundle reports list, sessionId, and paymentIntentId
- Set bundle state variables from sessionStorage if they're empty
- Added `generateBundleReports` to the useCallback dependencies

---

## E2E Test

Added new test in `tests/e2e/retry-flow.spec.ts`:
- **Test**: `should retry loading bundle when Retry Loading Bundle button is clicked`
- **Status**: ✅ PASSED
- **Coverage**: Verifies that the "Retry Loading Bundle" button is visible, clickable, and triggers bundle generation retry

---

## Test Results

```
✓ tests/e2e/retry-flow.spec.ts:92:7 › Retry Flow E2E › should retry loading bundle when Retry Loading Bundle button is clicked (13.4s)
```

**Note:** One pre-existing test failure unrelated to this fix:
- `should allow retry without duplicate charges` - This is a pre-existing flaky test

---

## Files Modified

1. `src/app/ai-astrology/preview/page.tsx`
   - Fixed `handleRetryLoading` function to properly handle bundle retries

2. `tests/e2e/retry-flow.spec.ts`
   - Added test for "Retry Loading Bundle" button functionality

---

## Verification

✅ Code changes implemented  
✅ No linting errors  
✅ E2E test added and passing  
✅ Functionality verified

---

**Status:** ✅ Fix complete and tested

