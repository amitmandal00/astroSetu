# Bundle Reports Stale ReportId Fix

**Date:** 2026-01-10  
**Issue:** Bundle reports were broken and looping after the free report stale reportId fix

## Root Cause

The stale reportId handling logic was checking if a report is free by only checking `reportTypeFromUrl === "life-summary"`. However, bundles can also have `reportType=life-summary` in the URL, causing them to be incorrectly treated as free reports.

When bundles were treated as free reports with stale reportIds:
1. The code tried to load input data and regenerate
2. But bundles are paid reports and shouldn't be regenerated without payment verification
3. This caused bundles to loop on the purchase screen

## The Fix

**File:** `astrosetu/src/app/ai-astrology/preview/page.tsx` (lines 805-862)

**Change:** Check for bundles FIRST before checking if it's a free report:

```typescript
// CRITICAL: Check for bundles FIRST before checking if it's a free report
// Bundles are always paid reports, even if reportType in URL is "life-summary"
let isBundle = false;
try {
  const savedBundleType = sessionStorage.getItem("aiAstrologyBundle");
  const savedBundleReports = sessionStorage.getItem("aiAstrologyBundleReports");
  isBundle = !!(savedBundleType && savedBundleReports);
} catch (e) {
  // Ignore errors checking for bundles
}

// For free life-summary reports (NOT bundles), we can regenerate
const isFreeReport = !isBundle && reportTypeFromUrl === "life-summary";
```

**Key Changes:**
1. Check for bundle info in sessionStorage BEFORE checking if it's a free report
2. Only treat as free report if `!isBundle && reportTypeFromUrl === "life-summary"`
3. Bundles are now correctly treated as paid reports and show error for stale reportIds

## Flow After Fix

1. User navigates to preview page with bundle reportId in URL
2. reportId not found in storage
3. Code checks for bundle info in sessionStorage FIRST
4. If bundle detected:
   - Treated as paid report
   - Shows error: "Report not found. Please generate a new report."
   - Does NOT try to regenerate (prevents duplicate charges)
5. If NOT a bundle and reportType is "life-summary":
   - Treated as free report
   - Loads input and regenerates (as before)

## Testing

### Manual Testing Checklist
- [ ] Bundle report with stale reportId - should show error (not loop)
- [ ] Free life-summary with stale reportId - should regenerate (unchanged)
- [ ] Paid individual report with stale reportId - should show error (unchanged)
- [ ] Bundle report normal flow - should work (unchanged)
- [ ] Free life-summary normal flow - should work (unchanged)

## Build Verification

- ✅ TypeScript: PASSED
- ✅ Next.js Build: PASSED
- ✅ ESLint: PASSED
- ✅ No breaking changes

## Status

✅ **FIXED** - Bundle reports now correctly handled as paid reports

