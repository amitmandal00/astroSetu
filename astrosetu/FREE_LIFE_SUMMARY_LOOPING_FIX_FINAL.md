# Free Life-Summary Report Looping Fix (Final)

**Date:** 2026-01-10  
**Issue:** Free life-summary reports getting stuck in loading screen loop

## Root Cause Analysis

When a `reportId` is in the URL but not found in storage (stale reportId or fresh reportId from a failed generation), the code was:

1. Detecting the stale reportId
2. Loading input data from sessionStorage
3. Setting input state
4. **BUT**: The code had a comment saying "continue to allow normal auto-generation flow to proceed", but the logic wasn't clear

The issue was that the stale reportId handling would set input data, but then the setTimeout path (which contains the auto-generation logic) would ALSO run. However, there was confusion about whether we should skip the setTimeout or let it run.

## The Fix

**File:** `astrosetu/src/app/ai-astrology/preview/page.tsx` (lines 812-845)

**Change:** Clarified that when we handle stale reportIds for free reports, we should NOT return early. Instead, we should:

1. Load input data from sessionStorage
2. Set input state immediately
3. Continue to the setTimeout path (don't skip it)
4. The setTimeout path will use the input data and trigger auto-generation

**Why this works:**
- The auto-generation logic is INSIDE the setTimeout path (lines 1097+)
- If we return early, we skip the setTimeout, which means we skip auto-generation
- By continuing to the setTimeout path, we ensure auto-generation triggers
- The setTimeout path reads from sessionStorage (which we just verified exists), so it will proceed
- The setTimeout path then triggers auto-generation using the input data

## Code Changes

```typescript
if (isFreeReport) {
  // Load input from sessionStorage
  const savedInput = sessionStorage.getItem("aiAstrologyInput");
  if (savedInput) {
    const inputData = JSON.parse(savedInput);
    setInput(inputData);
    setReportType("life-summary");
    // CRITICAL: Don't return early - let the setTimeout path handle auto-generation
    // The setTimeout path will see input is already set and trigger generation
    // Returning early would skip the auto-generation logic entirely
  } else {
    // Redirect if no input data
    router.push("/ai-astrology/input?reportType=life-summary");
    return;
  }
  // Continue to setTimeout path - it will use the input we just set and trigger auto-generation
}
```

## Flow After Fix

1. User navigates to preview page with reportId in URL
2. reportId not found in storage
3. For free reports:
   - Load input from sessionStorage
   - Set input state
   - Continue (don't return early)
4. setTimeout path runs (500ms delay):
   - Reads input from sessionStorage (same data we just set)
   - Sets input state (redundant but harmless)
   - Triggers auto-generation (line 1097+)
5. Report generation starts
6. Loading screen shows progress
7. Report completes

## Testing

### Manual Testing Checklist
- [ ] Free life-summary with stale reportId (reportId in URL, not in storage, input in sessionStorage)
- [ ] Free life-summary with stale reportId (reportId in URL, not in storage, no input in sessionStorage) - should redirect
- [ ] Free life-summary normal flow (no reportId in URL, input in sessionStorage)
- [ ] Paid reports with stale reportId - should show error (unchanged)
- [ ] Bundle reports - should work (unchanged)

## Build Verification

- ✅ TypeScript: PASSED
- ✅ Next.js Build: PASSED
- ✅ ESLint: PASSED
- ✅ No breaking changes

## Status

✅ **FIXED** - Ready for testing

