# Regression Prevention Guide

## Overview
This document outlines all critical flows and ensures that changes don't break existing functionality.

## Critical Flows to Test

### 1. Free Report Generation Flow
**Path:** Input Page → Preview Page → Report Display

**Steps:**
1. User fills form on `/ai-astrology/input?reportType=life-summary`
2. Clicks "Get Free Life Summary"
3. Navigates to `/ai-astrology/preview`
4. Report auto-generates
5. Report displays

**Key Logic:**
- No `reportId` in URL initially
- No `session_id` (free report)
- `savedInput` in sessionStorage
- Auto-generates immediately (no payment needed)
- Report saved to both sessionStorage AND localStorage

**Regression Checks:**
- ✅ Report generates automatically
- ✅ No redirect loop back to input page
- ✅ Report content displays correctly
- ✅ Report persists after page refresh (localStorage)

### 2. Paid Report Flow (Direct Navigation)
**Path:** Input Page → Payment → Preview Page → Report Display

**Steps:**
1. User fills form on `/ai-astrology/input?reportType=marriage-timing`
2. Clicks "Purchase Marriage Timing Report"
3. Completes payment via Stripe
4. Redirects to `/ai-astrology/preview?session_id=XXX&auto_generate=true`
5. Report auto-generates
6. Report displays

**Key Logic:**
- `session_id` in URL
- `auto_generate=true` in URL
- Payment verified in sessionStorage
- Report generates after payment verification
- Report saved to both storages

**Regression Checks:**
- ✅ Payment verification works
- ✅ Report generates after payment
- ✅ No redirect loop
- ✅ Report persists after refresh

### 3. Paid Report Flow (Year Analysis - No auto_generate)
**Path:** Input Page → Payment → Preview Page → Report Display

**Steps:**
1. User fills form on `/ai-astrology/input?reportType=year-analysis`
2. Completes payment
3. Navigates to `/ai-astrology/preview?session_id=XXX` (no auto_generate)
4. Report should still generate (payment verified)

**Key Logic:**
- `session_id` in URL
- NO `auto_generate` flag
- Payment verified in sessionStorage
- Should still auto-generate (fixed in latest changes)

**Regression Checks:**
- ✅ Report generates even without `auto_generate=true`
- ✅ Payment verification works
- ✅ No redirect loop

### 4. Page Refresh Flow (ReportId in URL)
**Path:** User refreshes page with reportId in URL

**Steps:**
1. User has generated report (reportId in URL)
2. User refreshes page
3. Report should load from localStorage
4. Report displays

**Key Logic:**
- `reportId` in URL
- Check sessionStorage first
- Fallback to localStorage
- Load report immediately (no delay)
- Don't regenerate (would create new ID)

**Regression Checks:**
- ✅ Report loads from localStorage on refresh
- ✅ Report displays correctly
- ✅ No blank page
- ✅ No regeneration (preserves reportId)

### 5. Page Refresh Flow (No ReportId - Coming from Input)
**Path:** User clicks button → Navigates → Refreshes before report generated

**Steps:**
1. User clicks button on input page
2. Navigates to preview page
3. User refreshes before report generates
4. Should regenerate or show loading

**Key Logic:**
- No `reportId` in URL
- `savedInput` in sessionStorage (after delay)
- Should regenerate report
- Delay prevents race condition

**Regression Checks:**
- ✅ Report regenerates on refresh
- ✅ No redirect loop
- ✅ Loading state shows correctly

### 6. Bundle Report Flow
**Path:** Bundle Selection → Input → Payment → Preview → Multiple Reports

**Steps:**
1. User selects bundle
2. Fills form
3. Completes payment
4. Multiple reports generate
5. All reports display

**Key Logic:**
- Bundle info in sessionStorage
- Multiple reports generate sequentially
- All reports saved to storage
- Bundle loading screen shows progress

**Regression Checks:**
- ✅ All bundle reports generate
- ✅ Loading screen works for bundles
- ✅ Reports persist after refresh

## Critical Logic Paths

### ReportId Loading (Lines 663-697)
```typescript
if (reportId && !reportContent) {
  // 1. Check sessionStorage
  // 2. Fallback to localStorage
  // 3. If found, load and return (no delay)
  // 4. If NOT found, show error (don't regenerate)
}
```

**Why:** Regenerating with a different ID is wrong. Show error instead.

### Delayed sessionStorage Check (Lines 706-918)
```typescript
setTimeout(() => {
  // 1. Check for savedInput (after delay)
  // 2. If not found, redirect (preserve reportType)
  // 3. If found, continue with generation logic
}, 200);
```

**Why:** Prevents race condition where we check before input page saves data.

### Auto-Generation Logic (Lines 857-911)
```typescript
const shouldAutoGenerate = 
  (isPaidReport && paymentVerified && !reportContent) ||
  (!isPaidReport && !reportContent);
```

**Why:** Supports both flows - with and without `auto_generate=true`.

## Potential Regression Points

### 1. Delay Addition (200ms)
**Risk:** Might cause delays in report loading
**Mitigation:** 
- Only applies when NO reportId in URL
- ReportId loading happens immediately (before delay)
- Delay only for input page → preview navigation

### 2. localStorage Addition
**Risk:** Storage quota, browser compatibility
**Mitigation:**
- Try-catch around all storage operations
- Falls back gracefully if storage fails
- Still works with just sessionStorage

### 3. Redirect Guard (hasRedirectedRef)
**Risk:** Might prevent legitimate redirects
**Mitigation:**
- Reset on route change (searchParams change)
- Only prevents multiple redirects in same render

### 4. Error Handling for Missing ReportId
**Risk:** Might show errors when report should regenerate
**Mitigation:**
- Only show error if reportId in URL but not found
- If no reportId, allow regeneration (existing flow)

## Testing Checklist

Before pushing any changes to preview page:

1. ✅ **Free Report:**
   - [ ] Generates automatically
   - [ ] Displays correctly
   - [ ] Persists after refresh
   - [ ] No redirect loop

2. ✅ **Paid Report (with auto_generate):**
   - [ ] Generates after payment
   - [ ] Displays correctly
   - [ ] Persists after refresh

3. ✅ **Paid Report (without auto_generate):**
   - [ ] Still generates (payment verified)
   - [ ] Displays correctly

4. ✅ **Page Refresh with reportId:**
   - [ ] Loads from localStorage
   - [ ] Displays correctly
   - [ ] No blank page

5. ✅ **Page Refresh without reportId:**
   - [ ] Regenerates or redirects appropriately
   - [ ] No infinite loops

6. ✅ **Bundle Reports:**
   - [ ] All reports generate
   - [ ] Loading screen works
   - [ ] All persist after refresh

7. ✅ **Error Cases:**
   - [ ] Missing reportId shows error (don't regenerate)
   - [ ] Storage errors handled gracefully
   - [ ] Network errors show proper messages

## Code Review Checklist

When reviewing changes:

- [ ] Does this change affect multiple flows? (Risk: High)
- [ ] Are there early returns that skip important logic?
- [ ] Are refs/reset guards properly managed?
- [ ] Are all error cases handled?
- [ ] Are storage operations wrapped in try-catch?
- [ ] Does the change preserve existing working flows?
- [ ] Are comments explaining WHY, not just WHAT?

## Safe Change Pattern

1. **Add new functionality:** ✅ Safe (as long as it doesn't interfere)
2. **Modify existing logic:** ⚠️ Review all flows it affects
3. **Remove code:** ⚠️ Ensure it's truly unused
4. **Change timing/delays:** ⚠️ Test all flows that use timing
5. **Modify storage logic:** ⚠️ Test persistence across refreshes

## Recent Changes Summary

### Change 1: Added Delay Before sessionStorage Check
**Purpose:** Fix redirect loop
**Affects:** Input page → Preview navigation
**Safe:** Yes (only when no reportId)

### Change 2: Added localStorage Persistence
**Purpose:** Fix blank page on refresh
**Affects:** Page refresh flow
**Safe:** Yes (fallback, doesn't break existing)

### Change 3: Fixed reportId Not Found Handling
**Purpose:** Prevent wrong regeneration
**Affects:** Refresh with missing reportId
**Safe:** Yes (shows error instead of wrong behavior)

### Change 4: Reset Redirect Guard on Route Change
**Purpose:** Ensure redirects work on navigation
**Affects:** All navigation flows
**Safe:** Yes (allows legitimate redirects)

## Monitoring

Watch for these in production:
1. High error rates on preview page
2. Users stuck on loading screen
3. Blank reports
4. Redirect loops (check analytics)
5. Failed report generations

