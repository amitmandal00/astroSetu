# Critical Redirect Loop & Stuck Screen Fixes
**Date**: 2026-01-18  
**Status**: 🔴 **CRITICAL - FIXING NOW**

---

## Issues Reported

1. **Purchase Yearly Analysis** - Keeps redirecting to enter details screen (redirect loop)
2. **Bundle reports** - Stuck at "redirecting" screen after entering details
3. **Free life summary** - Stuck at "redirecting" screen after entering details
4. **Other reports** - Stuck at "redirecting" screen
5. **Monthly subscription journey** - Not navigating back to subscription dashboard after entering birth details
6. **Subscribe button** - Redirects to same page, nothing happens

---

## Root Causes Identified

### Issue 1-4: Redirect Loops & Stuck "Redirecting..." Screen

**Root Cause**:
1. Token loading is async, but redirect check runs synchronously
2. `hasRedirectedRef` might be reset incorrectly
3. After token loads, state update might not happen before redirect check
4. `redirectInitiatedRef` is set but redirect doesn't complete (stuck screen)

**Fix Strategy**:
1. Ensure token loading completes BEFORE any redirect check
2. Only check redirect AFTER `tokenLoading === false`
3. Never reset `hasRedirectedRef` after token is loaded
4. Use `window.location.assign` instead of `router.push` for hard navigation
5. Clear `redirectInitiatedRef` only after successful navigation

### Issue 5: Subscription Journey Not Returning

**Root Cause**:
1. Subscription page loads token and cleans URL immediately
2. But doesn't check if there's a `returnTo` parameter to navigate to
3. Input page redirects with `input_token` but subscription page doesn't preserve returnTo

**Fix Strategy**:
1. After loading token, check for `returnTo` in URL
2. If `returnTo` exists and is valid, navigate to it
3. Only clean URL after navigation completes

### Issue 6: Subscribe Button Does Nothing

**Root Cause**:
1. Subscribe button checks `if (!input)` but input might be loading from token
2. State might not be updated yet when button is clicked
3. Redirect happens but then input loads, causing confusion

**Fix Strategy**:
1. Check `tokenLoading` before allowing subscribe
2. Wait for token to load before checking input
3. Show loading state while token is loading

---

## Implementation Plan

### Fix 1: Preview Page Redirect Logic
- Move redirect check to AFTER token loading completes
- Only check redirect when `tokenLoading === false`
- Never reset `hasRedirectedRef` after token is loaded
- Use `window.location.assign` for hard navigation

### Fix 2: Subscription Page ReturnTo Handling
- After loading token, check for `returnTo` parameter
- Navigate to `returnTo` if valid
- Only clean URL after navigation

### Fix 3: Subscribe Button Token Loading Check
- Disable subscribe button while `tokenLoading === true`
- Wait for token to load before checking input
- Show loading state

### Fix 4: Remove "Redirecting..." Stuck Screen
- Only show "Redirecting..." when redirect is actually initiated
- Clear `redirectInitiatedRef` after navigation completes
- Use hard navigation (`window.location.assign`) instead of soft (`router.push`)

---

## Test Plan

1. **Purchase Yearly Analysis Flow**:
   - Click "Purchase Yearly Analysis Report"
   - Enter birth details
   - Should return to preview with input_token
   - Should NOT redirect back to input
   - Should show purchase button

2. **Bundle Reports Flow**:
   - Select bundle
   - Enter birth details
   - Should return to preview with input_token
   - Should NOT show "Redirecting..." stuck screen
   - Should show bundle generation progress

3. **Free Life Summary Flow**:
   - Click "Get Free Life Summary"
   - Enter birth details
   - Should return to preview with input_token
   - Should NOT show "Redirecting..." stuck screen
   - Should show report generation

4. **Subscription Journey Flow**:
   - Click "Monthly Astrology Outlook"
   - Enter birth details
   - Should return to subscription dashboard
   - Should NOT redirect to free life report
   - Should show subscribe button

5. **Subscribe Button Flow**:
   - On subscription page with input_token
   - Click "Subscribe"
   - Should navigate to Stripe checkout
   - Should NOT redirect to same page

---

## Files to Modify

1. `astrosetu/src/app/ai-astrology/preview/page.tsx`
   - Fix redirect logic to wait for token loading
   - Use hard navigation
   - Fix stuck "Redirecting..." screen

2. `astrosetu/src/app/ai-astrology/subscription/page.tsx`
   - Fix returnTo handling
   - Fix subscribe button token loading check

3. `astrosetu/src/app/ai-astrology/input/page.tsx`
   - Ensure returnTo is preserved in subscription flow

4. Add/update E2E tests
   - Test redirect loops
   - Test stuck "Redirecting..." screen
   - Test subscription journey

