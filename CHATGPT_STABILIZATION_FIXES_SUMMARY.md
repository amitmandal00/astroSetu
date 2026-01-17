# ChatGPT Stabilization Fixes Implementation Summary

**Date**: 2026-01-18  
**Objective**: Fix existing issues in-place (no rollback) - Step 0 through Step 4

---

## 🎯 Goal

**Fix existing issues in-place without rolling back**, following ChatGPT's structured approach:
1. First lock "what code is live" (Build ID + Service Worker)
2. Then fix redirect loops (token fetch authoritative)
3. Fix purchase button (only work after input ready)
4. Fix subscription flow (end-to-end)
5. Add tests to catch real failures

---

## 📋 Step 0: Lock "What Code Is Live" (Must Do First)

### Current State
- ✅ Build ID already fetches from `/build.json` (7-char commit hash)
- ✅ Service worker gated behind `NEXT_PUBLIC_ENABLE_PWA` (unregisters if disabled)
- ✅ `[BUILD]` log exists in preview/subscription (uses buildId from fetch)

### Required Changes

**1. Ensure Footer Build ID Shows FULL Commit SHA**:
- **File**: `astrosetu/src/components/ai-astrology/AIFooter.tsx`
- **Change**: Display `data?.fullSha` instead of `data?.buildId` (or show both: `Build: cbb7d53 (cbb7d532...)`)
- **Rationale**: Build ID should show full commit SHA for complete verification, not just 7 chars

**2. Completely Disable Service Worker (Not Gated)**:
- **File**: `astrosetu/src/app/ai-astrology/layout.tsx`
- **Change**: Remove `enablePWA` check - ALWAYS unregister all service workers during stabilization
- **Change**: Add console log: `console.log("[SW] Service Worker disabled for stabilization")`
- **Rationale**: No SW during stabilization to prevent cached JS from breaking deploy verification

**3. Add [BUILD_ID] Console Log**:
- **Files**: `AIFooter.tsx`, `preview/page.tsx`, `subscription/page.tsx`
- **Change**: Already exists (`console.info("[BUILD]")`) - verify it logs once per page load
- **Status**: ✅ Already implemented

---

## 📋 Step 1: Fix Redirect Loops (Make Token Fetch Authoritative)

### Problem
- `input_token` exists in URL
- Preview/subscription starts token fetch (async)
- **Redirect logic runs BEFORE token fetch completes**
- Redirect happens while token is still loading → "Redirecting..." forever

### Required Changes

**Preview Page (`preview/page.tsx`)**:

1. **Add `tokenLoading` State**:
   ```typescript
   const [tokenLoading, setTokenLoading] = useState(false);
   ```

2. **Set `tokenLoading=true` When Token Fetch Starts**:
   ```typescript
   if (inputToken) {
     setTokenLoading(true);
     console.info("[TOKEN_GET] start");
     // ... fetch token
   }
   ```

3. **Prevent Redirect While `tokenLoading=true`**:
   ```typescript
   // Redirect to /input ONLY when:
   // - tokenLoading === false
   // - no input_token in URL
   // - and input is missing
   if (!tokenLoading && !inputToken && !input) {
     console.info("[REDIRECT_TO_INPUT] reason=missing_input_no_token");
     // redirect
   }
   ```

4. **Set `tokenLoading=false` After Fetch Completes**:
   ```typescript
   try {
     // ... fetch
     setTokenLoading(false);
   } catch {
     setTokenLoading(false);
   }
   ```

5. **Show "Loading your details..." While `tokenLoading=true`**:
   ```typescript
   if (tokenLoading) {
     return <div>Loading your details...</div>; // NOT "Redirecting..."
   }
   ```

6. **Log Token Fetch Lifecycle**:
   ```typescript
   console.info("[TOKEN_GET] start");
   console.info("[TOKEN_GET] ok status=200");
   console.info("[TOKEN_GET] fail status=...");
   console.info("[REDIRECT_TO_INPUT] reason=missing_input_no_token");
   ```

**Subscription Page (`subscription/page.tsx`)**:

- Same changes as preview page (add `tokenLoading` state, prevent redirect while loading)

---

## 📋 Step 2: Fix Purchase Button (Only Work After Input Ready)

### Problem
- Purchase button clicked
- `input_token` exists but input not loaded yet (fetch still in progress)
- Purchase handler sees `!input` → redirects to input → loop

### Required Changes

**Preview Page (`preview/page.tsx`) - Purchase Handler**:

1. **Check `tokenLoading` Before Purchase**:
   ```typescript
   if (tokenLoading || !input) {
     if (tokenLoading) {
       // Disable button, show "Loading your details..."
       return;
     }
     // No input + no token → redirect to input
     router.push(`/ai-astrology/input?reportType=${reportType}&returnTo=...`);
     return;
   }
   ```

2. **Log Purchase Click**:
   ```typescript
   console.info("[PURCHASE_CLICK]", { hasInput: !!input, hasToken: !!inputToken });
   ```

3. **Never Silent Return**:
   - Remove `if (!input) return;`
   - Always redirect OR show error

---

## 📋 Step 3: Fix Subscription Flow (End-to-End)

### Required Changes

**1. Monthly CTA Always Sets `flow=subscription`**:
- **File**: Find where monthly CTA navigates (likely main `/ai-astrology` page or cards component)
- **Change**: Ensure navigation to input includes `flow=subscription`:
  ```typescript
  router.push(`/ai-astrology/input?reportType=life-summary&flow=subscription&returnTo=/ai-astrology/subscription`);
  ```

**2. Input Page Respects `flow=subscription`**:
- **File**: `astrosetu/src/app/ai-astrology/input/page.tsx`
- **Change**: After POST to `/api/ai-astrology/input-session`, check `flow`:
  ```typescript
  if (flow === "subscription") {
    window.location.assign(`/ai-astrology/subscription?input_token=${token}`);
  } else {
    window.location.assign(`/ai-astrology/preview?...&input_token=${token}`);
  }
  ```

**3. Subscription Page Loads Token First**:
- **File**: `astrosetu/src/app/ai-astrology/subscription/page.tsx`
- **Change**: Already implemented (checks `input_token` first) - verify it works correctly

---

## 📋 Step 4: Add Tests to Catch Real Failures

### New E2E Tests

**1. `token-get-required.spec.ts`**:
- Submit input → expect navigation includes `input_token`
- Expect GET `/api/ai-astrology/input-session?token=...` occurs within 2s
- Fail if no GET happens

**2. `no-redirect-while-token-loading.spec.ts`**:
- Load preview with `input_token` in URL
- Assert it does NOT redirect to input while `tokenLoading === true`
- Assert "Loading your details..." shows (not "Redirecting...")

---

## 📋 Files to Modify

### Step 0 (Lock "What Code Is Live")
1. `astrosetu/src/components/ai-astrology/AIFooter.tsx` - Show full SHA
2. `astrosetu/src/app/ai-astrology/layout.tsx` - Always disable SW

### Step 1 (Fix Redirect Loops)
1. `astrosetu/src/app/ai-astrology/preview/page.tsx` - Add `tokenLoading` state, prevent redirect while loading
2. `astrosetu/src/app/ai-astrology/subscription/page.tsx` - Add `tokenLoading` state, prevent redirect while loading

### Step 2 (Fix Purchase Button)
1. `astrosetu/src/app/ai-astrology/preview/page.tsx` - Check `tokenLoading` in purchase handler

### Step 3 (Fix Subscription Flow)
1. Find monthly CTA navigation (likely `/ai-astrology` page or cards)
2. `astrosetu/src/app/ai-astrology/input/page.tsx` - Redirect to subscription if `flow=subscription`

### Step 4 (Add Tests)
1. `astrosetu/tests/e2e/token-get-required.spec.ts` (new)
2. `astrosetu/tests/e2e/no-redirect-while-token-loading.spec.ts` (new)

---

## 📋 Workflow Updates

### `.cursor/rules`
- Add: "Token fetch must be authoritative - no redirect while `tokenLoading=true`"
- Add: "Purchase/subscribe handlers must check `tokenLoading` before proceeding"

### `CURSOR_PROGRESS.md`
- Document: Step 0-4 implementation status
- Document: What changed, what passed, what still failing

### `CURSOR_ACTIONS_REQUIRED.md`
- Only if user action required (e.g., verify Build ID shows full SHA in production)

---

## ⚠️ Implementation Order (Critical)

**DO NOT skip Step 0**:
1. ✅ Step 0: Lock "what code is live" (Build ID + SW) - **MUST DO FIRST**
2. ✅ Step 1: Fix redirect loops (token fetch authoritative)
3. ✅ Step 2: Fix purchase button (only work after input ready)
4. ✅ Step 3: Fix subscription flow (end-to-end)
5. ✅ Step 4: Add tests (catch real failures)

**Rationale**: Step 0 ensures we're testing actual deployed code. Skipping it means any bugfix is meaningless (testing stale JS).

---

## ✅ Verification Checklist (After Implementation)

**Step 0**:
- [ ] Footer shows full commit SHA (not just 7 chars)
- [ ] Service worker unregistered in production
- [ ] `[BUILD_ID]` log appears once per page load

**Step 1**:
- [ ] Preview with `input_token` does NOT redirect while token loading
- [ ] Shows "Loading your details..." (not "Redirecting...")
- [ ] Console shows `[TOKEN_GET] start` and `[TOKEN_GET] ok/fail`

**Step 2**:
- [ ] Purchase button disabled while `tokenLoading=true`
- [ ] Purchase redirects to input if no input (not silent return)
- [ ] Console shows `[PURCHASE_CLICK] {hasInput, hasToken}`

**Step 3**:
- [ ] Monthly CTA includes `flow=subscription`
- [ ] Input redirects to subscription if `flow=subscription`
- [ ] Subscription loads token first, then shows Subscribe button

**Step 4**:
- [ ] `token-get-required.spec.ts` passes (GET occurs within 2s)
- [ ] `no-redirect-while-token-loading.spec.ts` passes (no redirect while loading)

---

## 📝 Summary for ChatGPT

**Implementation Status**: In Progress  
**Approach**: In-place fixes (no rollback), structured Step 0 → Step 4  
**Priority**: Step 0 must complete first (lock "what code is live")

**Next**: Implementing Step 0 (Build ID full SHA + SW disable), then Step 1-4

