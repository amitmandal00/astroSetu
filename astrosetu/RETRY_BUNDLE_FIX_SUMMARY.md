# Retry Loading Bundle Button - Fix Summary

**Date:** 2025-01-12  
**Status:** ✅ Fixed (Bundles) + Previously Fixed (Free Reports)

---

## Issue History

This issue was reported before but only **partially fixed**:

1. **Previous Fix (Commit `dc8ae61`)**: 
   - Fixed retry button for **FREE REPORTS ONLY**
   - Message: "Fix retry button not working for free reports"
   - Bundle retry functionality was NOT fixed

2. **Current Fix (This Session)**:
   - Fixed retry button for **BUNDLES**
   - Added bundle handling to `handleRetryLoading` function
   - Checks sessionStorage for bundle info even if state variables are empty

---

## What Was Fixed

### Previous Fix (Free Reports Only)
- Updated `handleRetryLoading` to get `reportId` from URL params directly
- Added regeneration logic for free reports when not found in storage

### Current Fix (Bundles)
Modified `handleRetryLoading` function in `src/app/ai-astrology/preview/page.tsx`:

1. **Added sessionStorage check for bundle info** (lines 1884-1892):
   - Checks `aiAstrologyBundle` and `aiAstrologyBundleReports` in sessionStorage
   - Works even when state variables (`bundleType`, `bundleReports`) are empty
   - Handles cases where bundle is stuck/failed and state is lost

2. **Direct bundle regeneration** (lines 1894-1922):
   - Calls `generateBundleReports` directly (instead of just redirecting)
   - Sets state variables from sessionStorage
   - Uses sessionId and paymentIntentId from sessionStorage

3. **Preserved payment info**:
   - Uses sessionId from URL if available, otherwise from sessionStorage
   - Uses paymentIntentId from sessionStorage

---

## Test Coverage

✅ Added E2E test: `should retry loading bundle when Retry Loading Bundle button is clicked`
✅ Test passes successfully
✅ Covers bundle retry functionality

---

## Key Code Changes

```typescript
// Check for bundle info in sessionStorage first (even if state variables are empty)
const savedBundleType = sessionStorage.getItem("aiAstrologyBundle");
const savedBundleReports = sessionStorage.getItem("aiAstrologyBundleReports");
const savedInput = sessionStorage.getItem("aiAstrologyInput");
const savedPaymentSessionId = sessionStorage.getItem("aiAstrologyPaymentSessionId");
const savedPaymentIntentId = sessionStorage.getItem("aiAstrologyPaymentIntentId");

const isBundle = !!(savedBundleType && savedBundleReports);

// Handle bundle retry
if (isBundle && savedInput) {
  const inputData = JSON.parse(savedInput);
  const bundleReportsList = JSON.parse(savedBundleReports) as ReportType[];
  
  // Set state and call generateBundleReports
  setInput(inputData);
  setBundleType(savedBundleType);
  setBundleReports(bundleReportsList);
  
  const sessionIdToUse = sessionIdFromUrl || savedPaymentSessionId || undefined;
  const paymentIntentIdToUse = savedPaymentIntentId || undefined;
  
  generateBundleReports(inputData, bundleReportsList, sessionIdToUse, paymentIntentIdToUse);
}
```

---

## Verification

✅ Code changes implemented
✅ No linting errors
✅ E2E test added and passing
✅ Functionality verified for bundles

---

**Status:** ✅ Fix complete - Bundles now supported (Free reports were fixed previously)

