# Critical Redirect Loop Fix - Free Life Summary
**Date**: 2026-01-18  
**Status**: 🔴 **CRITICAL BUG IDENTIFIED**

---

## 🐛 Bug Description

**User Report**: Free life summary report loops around "Enter Your Birth Details" screen.

**URL with Duplicate Tokens**:
```
https://www.mindveda.net/ai-astrology/preview?reportType=life-summary&input_token=ed0e6d24-8443-464c-9f43-f26eeb8b4749&input_token=4d785450-ecd1-45e9-91bc-6a5de4de8765
```

**Issue**: URL contains **TWO `input_token` parameters**, causing redirect loop.

---

## 🔍 Root Cause Analysis

### Issue 1: Duplicate `input_token` in URL

**Problem**: Input page appends `input_token` to `returnTo` URL even if it already contains one.

**Location**: `src/app/ai-astrology/input/page.tsx` (line ~275-277)

**Current Code**:
```typescript
const separator = sanitizedReturnTo.includes("?") ? "&" : "?";
const returnUrl = inputToken
  ? `${sanitizedReturnTo}${separator}input_token=${encodeURIComponent(inputToken)}`
  : sanitizedReturnTo;
```

**Problem**: If `returnTo` is:
```
/ai-astrology/preview?reportType=life-summary&input_token=old-token
```

Then the code appends another `input_token`, resulting in:
```
/ai-astrology/preview?reportType=life-summary&input_token=old-token&input_token=new-token
```

### Issue 2: Preview Page Redirecting After Token Loads

**Problem**: Preview page redirects back to input even after successfully loading token.

**Location**: `src/app/ai-astrology/preview/page.tsx` (line ~1333-1339)

**Current Code**:
```typescript
// Token loading completed but no input - token might be invalid
if (!input) {
  console.log("[Preview] Token in URL but loading completed with no input - token may be invalid");
  // Don't redirect - error state will show "Start again" button
  return;
}
```

**Problem**: If token loading completes but `input` state hasn't updated yet (race condition), this check might trigger redirect.

---

## 🔧 Fixes Required

### Fix 1: Replace `input_token` Instead of Appending

**File**: `src/app/ai-astrology/input/page.tsx`

**Fix**: Check if `returnTo` already contains `input_token`, and if so, replace it instead of appending.

**Code**:
```typescript
// Include input_token in returnTo if we have it
// CRITICAL FIX: Replace existing input_token instead of appending (prevent duplicates)
let returnUrl = sanitizedReturnTo;
if (inputToken) {
  const urlObj = new URL(sanitizedReturnTo, window.location.origin);
  urlObj.searchParams.set("input_token", inputToken); // set() replaces if exists
  returnUrl = urlObj.pathname + urlObj.search;
}
const fullUrl = typeof window !== "undefined" ? new URL(returnUrl, window.location.origin).toString() : returnUrl;
```

### Fix 2: Prevent Redirect While Token Loading State Updates

**File**: `src/app/ai-astrology/preview/page.tsx`

**Fix**: Add small delay or ref check before redirecting after token load completes.

**Code**:
```typescript
// CRITICAL: Token loading completed but no input
// Wait a bit for state to update (race condition prevention)
if (!input && !tokenLoading) {
  // Small delay to allow state updates to flush
  setTimeout(() => {
    // Re-check input state after delay
    if (!input) {
      console.log("[Preview] Token in URL but loading completed with no input - token may be invalid");
      // Don't redirect - error state will show "Start again" button
      return;
    }
  }, 100);
  return;
}
```

**OR better**: Use ref to track if token was successfully loaded, not just state.

---

## 📊 Vercel Logs Analysis

### Pattern from Logs:

1. **09:45:49.98**: `POST /api/ai-astrology/input-session` creates token `...8b4749`
2. **09:45:49.98**: `POST /api/ai-astrology/input-session` creates token `...de8765` (same time, different request)
3. **09:45:50.77**: `GET /api/ai-astrology/input-session` for token `...8b4749` (200 OK)
4. **09:45:50.77**: `GET /ai-astrology/input` (redirect back to input)
5. **09:45:50.77**: `GET /ai-astrology/preview` (redirect again)

### Observations:

- ✅ Token API works (200 OK responses)
- ❌ Preview page redirects after token loads successfully
- ❌ Multiple tokens created (double-submit or redirect loop)
- ❌ URL contains duplicate `input_token` parameters

---

## 🎯 Implementation Plan

### Step 1: Fix Duplicate Token in URL (15 min)

**File**: `src/app/ai-astrology/input/page.tsx`

**Change**:
- Use `URLSearchParams.set()` instead of string concatenation
- This automatically replaces existing `input_token` if present

**Expected Result**: URL will have only ONE `input_token` parameter

### Step 2: Prevent Redirect After Token Loads (10 min)

**File**: `src/app/ai-astrology/preview/page.tsx`

**Change**:
- Add ref to track token loading success
- Only redirect if token load explicitly failed (not just "no input yet")
- Add small delay for state updates to flush

**Expected Result**: Preview page won't redirect if token loads successfully

### Step 3: Test (5 min)

**Test Steps**:
1. Navigate to input page: `https://www.mindveda.net/ai-astrology/input?reportType=life-summary`
2. Fill birth details and submit
3. Verify URL has only ONE `input_token` parameter
4. Verify preview page loads (doesn't redirect back to input)
5. Verify report generates (or shows loading state)

---

## 📋 Expected Behavior After Fix

### Before Fix:
- ❌ URL: `/preview?reportType=life-summary&input_token=old&input_token=new`
- ❌ Preview redirects to input immediately
- ❌ Loop continues indefinitely

### After Fix:
- ✅ URL: `/preview?reportType=life-summary&input_token=new` (only one token)
- ✅ Preview loads token successfully
- ✅ Preview shows report (or loading state)
- ✅ No redirect loop

---

## 🚨 Critical Notes

1. **Multiple Submits**: The logs show two tokens created at the same time, suggesting double-submit or rapid redirects. Consider adding submit guard.

2. **Token Validation**: Preview page should validate token BEFORE redirecting. If token is valid, don't redirect.

3. **State Updates**: React state updates are async. Use refs for immediate checks, state for UI updates.

---

**Status**: 🔴 **CRITICAL BUG** - Needs immediate fix  
**Priority**: 🔴 **P0 - BLOCKER**  
**Next Action**: Fix duplicate token URL construction

