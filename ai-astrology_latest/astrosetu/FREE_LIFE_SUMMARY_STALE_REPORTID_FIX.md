# Fix: Free Life-Summary Report Looping with Stale ReportId

**Date:** 2026-01-10  
**Issue:** Free life-summary reports getting stuck in loading screen when reportId in URL is stale (not in storage)

## Problem

When a user navigates to the preview page with a stale reportId in the URL (from a previous session), the report would get stuck on the loading screen. The code would detect the stale reportId but wasn't properly handling the case for free reports.

## Root Cause

When a reportId was found in the URL but not in storage:
1. For free reports, the code would continue (not return early)
2. But it wouldn't load input data from sessionStorage immediately
3. It would fall through to the setTimeout path (500ms delay)
4. If input data was in sessionStorage, it would eventually load, but the delay could cause issues
5. If input data wasn't in sessionStorage, it would redirect, but only after the delay

## Solution

Modified the stale reportId handling (lines 812-845) to:
1. **For free reports with stale reportIds**: Immediately check sessionStorage for input data
2. **If input data exists**: Load it immediately and set state, allowing auto-generation to trigger
3. **If input data doesn't exist**: Redirect to input page immediately (no delay)
4. **For paid reports**: Still show error (unchanged behavior)

## Changes Made

**File:** `astrosetu/src/app/ai-astrology/preview/page.tsx` (lines 812-845)

```typescript
if (isFreeReport) {
  // Try to load input data from sessionStorage immediately (may not exist if session expired)
  try {
    const savedInput = sessionStorage.getItem("aiAstrologyInput");
    if (savedInput) {
      const inputData = JSON.parse(savedInput);
      setInput(inputData);
      setReportType("life-summary");
      // Don't set loading here - let the normal auto-generation flow handle it
      // This ensures the useEffect will trigger generation when it sees input data
    } else {
      // No input data in sessionStorage - redirect to input page
      console.log("[CLIENT] No input data found for stale free report, redirecting to input page");
      if (!hasRedirectedRef.current) {
        hasRedirectedRef.current = true;
        router.push("/ai-astrology/input?reportType=life-summary");
        return;
      }
    }
  } catch (error) {
    console.error("[CLIENT] Failed to load input data for stale free report:", error);
    // Redirect to input page on error
    if (!hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      router.push("/ai-astrology/input?reportType=life-summary");
      return;
    }
  }
  // Continue to allow normal auto-generation flow to proceed
}
```

## Impact

- ✅ Free reports with stale reportIds now properly load input data and trigger generation
- ✅ Free reports with no input data redirect immediately to input page
- ✅ Paid reports unchanged (still show error for stale reportIds)
- ✅ No breaking changes
- ✅ Build passes (TypeScript, Next.js, ESLint)

## Testing

### Manual Testing Checklist
1. ✅ Free life-summary report with stale reportId in URL (input data in sessionStorage)
2. ✅ Free life-summary report with stale reportId in URL (no input data in sessionStorage)
3. ✅ Free life-summary report normal flow (no stale reportId)
4. ✅ Paid report with stale reportId (should show error)

## Status

✅ **FIXED** - Ready for testing and deployment

