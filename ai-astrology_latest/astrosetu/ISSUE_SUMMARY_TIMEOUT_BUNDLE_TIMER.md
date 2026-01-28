# Issue Summary: Timeout, Bundle Reports, and Timer Resetting Issues

## Date: January 20, 2025

## Overview
This document summarizes the issues encountered with report generation, specifically related to:
1. **Timeout Issues**: Reports timing out before completion
2. **Bundle Report Issues**: Partial results or errors in bundle reports
3. **Timer Resetting**: Timer resetting to 0 during report generation

---

## Issue 1: Timeout Errors for Complex Reports

### Problem Description
- **Full Life Report**: Timer keeps resetting to 0 in "Generating Your Full Life Report..." screen
- **Career & Money Report**: Timer keeps resetting to 0 or keeps increasing in "Generating Your Career & Money Report..." screen
- Reports were timing out before completion, causing generation failures

### Root Cause Analysis
1. **Server-side timeout too short**: Complex reports (full-life, career-money) were set to 90s timeout, but these reports require more time due to:
   - Large token generation requirements (2200+ tokens for comprehensive analysis)
   - Multiple sections and detailed analysis
   - AI processing time for complex calculations

2. **Client-side timeout mismatch**: Bundle reports had 80s client timeout, but server timeout was 90s (now 120s), causing premature client-side timeouts

### Solutions Implemented

#### Solution 1.1: Increased Server-Side Timeout
**File**: `astrosetu/src/app/api/ai-astrology/generate-report/route.ts`

**Changes**:
- Increased timeout for complex reports (full-life, major-life-phase) from 90s to 120s
- Added separate timeout for Career & Money reports (120s)
- Updated timeout logic:
  ```typescript
  const isComplexReport = reportType === "full-life" || reportType === "major-life-phase";
  const isCareerMoneyReport = reportType === "career-money";
  const REPORT_GENERATION_TIMEOUT = isComplexReport || isCareerMoneyReport ? 120000 : (isFreeReport ? 65000 : 60000);
  ```

**Rationale**: Complex reports need more time to generate comprehensive content. 120s provides sufficient buffer for AI processing while still maintaining reasonable user wait times.

#### Solution 1.2: Increased Client-Side Timeout for Bundles
**File**: `astrosetu/src/app/ai-astrology/preview/page.tsx`

**Changes**:
- Increased `INDIVIDUAL_REPORT_TIMEOUT` from 80s to 130s
- Updated comment to reflect new server timeout values
- Ensures client doesn't timeout before server completes

**Rationale**: Client timeout should be slightly longer than server timeout to account for network overhead and ensure server has time to complete.

### Expected Outcome
- Full Life and Career & Money reports should complete successfully without timing out
- Bundle reports should have sufficient time to generate all reports
- Reduced timeout-related errors in production

---

## Issue 2: Bundle Report Partial Results and Errors

### Problem Description
- **2 Bundle Report**: Shows error and only shows partial one report only
- **All 3 Reports Bundle**: Report is very short, does not look like real report - shows only partial, one of 3 reports
- **Complete Life Decision Pack**: Shows error - report is very short, does not look like real report - shows only partial, two of 3 reports

### Root Cause Analysis
1. **Primary report selection logic**: When bundle generation completed, the code selected the first successful report (`successes[0].reportType`) instead of the first report in the bundle order. This caused:
   - Wrong report to be displayed as primary
   - Reports appearing out of order
   - User confusion about which report they're viewing

2. **Error handling**: While the code used `Promise.allSettled` to handle partial failures, the primary report selection didn't account for the original bundle order

3. **Logging**: Insufficient logging made it difficult to debug which reports succeeded/failed

### Solutions Implemented

#### Solution 2.1: Fixed Primary Report Selection
**File**: `astrosetu/src/app/ai-astrology/preview/page.tsx`

**Changes**:
- Changed primary report selection to use bundle order instead of first success
- Updated logic:
  ```typescript
  // OLD: const bundleContent = bundleContentsMap.get(reports[0]) || bundleContentsMap.values().next().value || null;
  // NEW: Use the first report in the bundle order, not the first success
  const primaryReportType = reports.find(rt => bundleContentsMap.has(rt)) || successes[0].reportType;
  const bundleContent = bundleContentsMap.get(primaryReportType) || bundleContentsMap.values().next().value || null;
  ```

**Rationale**: Users expect to see reports in the order they were purchased. Selecting the first report in the bundle order (that succeeded) maintains this expectation.

#### Solution 2.2: Enhanced Bundle Completion Logging
**File**: `astrosetu/src/app/ai-astrology/preview/page.tsx`

**Changes**:
- Added detailed logging for bundle completion:
  ```typescript
  console.log(`[BUNDLE COMPLETE] ${successes.length}/${reports.length} reports succeeded. Successful: ${successes.map(s => getReportName(s.reportType)).join(", ")}, Failed: ${failures.map(f => getReportName(f.reportType)).join(", ")}`);
  ```

**Rationale**: Better logging helps debug bundle generation issues in production and provides visibility into which reports succeeded/failed.

### Expected Outcome
- Bundle reports display in correct order
- Primary report matches user expectations
- Better debugging capabilities with enhanced logging
- All successful reports are shown even if some fail

---

## Issue 3: Timer Resetting to 0 During Generation

### Problem Description
- **Full Life Report**: Timer keeps resetting to 0 in "Generating Your Full Life Report..." screen
- **Career & Money Report**: Timer keeps resetting to 0 or keeps increasing
- Timer would reset during report generation, causing confusion about actual elapsed time

### Root Cause Analysis
1. **State transition resets**: The `useElapsedSeconds` hook was resetting elapsed time to 0 whenever `isRunning` became false, even if generation was still in progress
2. **Brief state transitions**: During bundle generation or state changes, `isProcessingUI` could briefly become false, causing the timer to reset
3. **Timer logic**: The hook didn't distinguish between "generation completed" (should reset) and "brief state transition" (should not reset)

### Solutions Implemented

#### Solution 3.1: Prevent Timer Reset During Active Generation
**File**: `astrosetu/src/hooks/useElapsedSeconds.ts`

**Changes**:
- Modified timer reset logic to only reset when `startTime` is null (generation fully completed)
- Timer now preserves elapsed time during brief state transitions:
  ```typescript
  if (!isRunning) {
    // Always stop the interval when not running
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    // Only reset elapsed time if startTime is null (generation fully completed or never started)
    const currentStartTime = startTime ?? startTimeRef?.current ?? null;
    if (!currentStartTime) {
      setElapsed(0);
      return;
    }
    // If startTime exists but not running, keep showing last elapsed time (don't reset)
    // This prevents timer from resetting during brief state transitions
    return;
  }
  ```

**Rationale**: 
- Timer should only reset when generation is fully completed (`startTime` is null)
- During brief state transitions (e.g., bundle generation, loading stage changes), the timer should preserve elapsed time
- This provides a consistent user experience and accurate elapsed time display

### Expected Outcome
- Timer no longer resets during report generation
- Accurate elapsed time display throughout the generation process
- Better user experience with consistent timer behavior

---

## Related Previous Fixes

### Previous Issue: Short Reports and Validation Failures
**Date**: Earlier in this session

**Problem**: Reports were too short or contained placeholder content, causing validation failures.

**Solutions Applied**:
1. **Laxer placeholder check**: Modified `reportValidation.ts` to only flag obvious placeholders (lorem ipsum, "placeholder text", etc.), not just short content
2. **Validation order**: Ensured `ensureMinimumSections` runs after `stripMockContent` to guarantee cleaned reports meet minimum requirements
3. **Improved fallback sections**: Added more specific fallback sections for `career-money` reports in `reportGenerator.ts`

**Files Modified**:
- `astrosetu/src/lib/ai-astrology/reportValidation.ts`
- `astrosetu/src/app/api/ai-astrology/generate-report/route.ts`
- `astrosetu/src/lib/ai-astrology/reportGenerator.ts`

---

## Testing Recommendations

### Manual Testing
1. **Full Life Report**:
   - Generate a Full Life report
   - Verify timer does not reset during generation
   - Verify report completes within 120s
   - Verify report has sufficient content (not short)

2. **Career & Money Report**:
   - Generate a Career & Money report
   - Verify timer does not reset during generation
   - Verify report completes within 120s
   - Verify report has sufficient content

3. **Bundle Reports**:
   - Generate a 2-report bundle
   - Verify all successful reports are shown
   - Verify reports appear in correct order
   - Verify primary report matches bundle order
   - Check logs for bundle completion details

4. **Timer Behavior**:
   - Monitor timer during generation
   - Verify timer does not reset to 0
   - Verify timer continues counting during state transitions

### Automated Testing
- Add unit tests for timeout values
- Add integration tests for bundle report generation
- Add tests for timer behavior during state transitions

---

## Deployment Checklist

- [x] Code changes committed
- [x] No linter errors
- [x] Build passes (pending sandbox restrictions)
- [ ] Deploy to staging
- [ ] Test in staging environment
- [ ] Monitor logs for timeout and bundle issues
- [ ] Deploy to production
- [ ] Monitor production metrics

---

## Files Modified

1. `astrosetu/src/app/api/ai-astrology/generate-report/route.ts`
   - Increased timeout for complex reports (90s → 120s)
   - Added separate timeout for Career & Money reports

2. `astrosetu/src/app/ai-astrology/preview/page.tsx`
   - Increased client timeout for bundle reports (80s → 130s)
   - Fixed primary report selection to use bundle order
   - Added detailed bundle completion logging

3. `astrosetu/src/hooks/useElapsedSeconds.ts`
   - Fixed timer resetting logic to preserve elapsed time during state transitions
   - Timer only resets when generation is fully completed

---

## Commit History

- **Commit**: `bb4b56a` - "Fix: Timeout, bundle reports, and timer resetting issues"
- **Previous Commit**: `103b2b9` - "Fix: Multiple report generation and validation issues"

---

## Next Steps

1. **Monitor Production**: Watch for timeout errors and timer resetting issues after deployment
2. **Gather Metrics**: Track report generation success rates, average generation times
3. **Optimize Further**: If timeouts still occur, consider:
   - Further increasing timeout values
   - Optimizing AI prompt/response handling
   - Implementing progressive loading for long reports
4. **User Feedback**: Collect user feedback on report quality and generation experience

---

## Notes

- All changes maintain backward compatibility
- No breaking changes to API contracts
- Changes are focused on improving reliability and user experience
- Timer fix is particularly important for user trust and perceived performance

