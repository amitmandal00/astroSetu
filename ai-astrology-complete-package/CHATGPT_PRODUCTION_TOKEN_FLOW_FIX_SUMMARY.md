# ChatGPT Production Token Flow Fix Summary

**Date**: 2026-01-17 23:00  
**Issue**: Production shows POST to `/api/ai-astrology/input-session` works, but NO GET requests (token not reaching preview/subscription)  
**Status**: ✅ **FIXES APPLIED**

---

## 🐛 Root Cause Analysis

### What Vercel Logs Show
- ✅ `POST /api/ai-astrology/input-session` (token creation works)
- ❌ **NO** `GET /api/ai-astrology/input-session?token=...` (token fetch NOT happening)
- ⚠️ Many `/sw.js` requests (service worker interfering/caching)

### Root Causes Identified
1. **Soft navigation losing query params**: `router.push()` is soft navigation that can lose query params or cause stale state
2. **Service worker caching old JS**: Service worker is serving cached JS, making it appear like "code deployed but behavior unchanged"
3. **No visibility into token flow**: No logging to prove token is in URL or being fetched

---

## ✅ Fixes Applied

### 1. Hard Navigation for Input Redirect ✅

**Problem**: `router.push()` loses query params or causes stale state.

**Fix Applied**:
- **Location**: `astrosetu/src/app/ai-astrology/input/page.tsx` (lines 237-300)
- **Change**: Replaced `router.push()` with `window.location.assign(fullUrl)` for all input → preview/subscription redirects
- **Why**: Hard navigation guarantees query params survive and avoids Next soft-navigation keeping stale state

**Code Evidence**:
```typescript
// Before: router.push(subscriptionUrl);
// After:
const fullUrl = typeof window !== "undefined" ? new URL(subscriptionUrl, window.location.origin).toString() : subscriptionUrl;
console.info("[INPUT_REDIRECT]", fullUrl);
window.location.assign(fullUrl);
```

**Result**: Input submit now uses hard navigation, ensuring `input_token` survives in URL.

---

### 2. Service Worker Disabled During Stabilization ✅

**Problem**: Service worker is caching old JS, making it appear like "code deployed but behavior unchanged".

**Fix Applied**:
- **Location**: `astrosetu/src/app/ai-astrology/layout.tsx` (lines 20-38)
- **Change**: Service worker now gated behind `NEXT_PUBLIC_ENABLE_PWA === "true"` env flag
- **Behavior**: 
  - If `NEXT_PUBLIC_ENABLE_PWA !== "true"`: Unregister any existing service workers
  - Default: disabled in all environments until flows are stable

**Code Evidence**:
```typescript
const enablePWA = process.env.NEXT_PUBLIC_ENABLE_PWA === "true";

if (enablePWA && typeof window !== "undefined" && "serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js")...
} else if (!enablePWA) {
  // Unregister any existing service workers
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      registration.unregister()...
    });
  });
}
```

**Result**: Service worker disabled during stabilization, preventing cached JS from breaking deploy verification.

---

### 3. Build ID Stamp Added ✅

**Problem**: Cannot prove deployed JS is active (browser might be running cached bundles).

**Fix Applied**:
- **Location**: 
  - `astrosetu/src/components/ai-astrology/AIFooter.tsx` (lines 11-12, 35)
  - `astrosetu/src/app/ai-astrology/preview/page.tsx` (lines 25-34)
  - `astrosetu/src/app/ai-astrology/subscription/page.tsx` (lines 22-31)
- **Change**: 
  - Footer displays build ID (`NEXT_PUBLIC_BUILD_ID` or `VERCEL_GIT_COMMIT_SHA`)
  - Console logs `[BUILD] buildId` on page mount

**Code Evidence**:
```typescript
const buildId = process.env.NEXT_PUBLIC_BUILD_ID || process.env.VERCEL_GIT_COMMIT_SHA || `dev-${Date.now().toString(36)}`;

useEffect(() => {
  console.info("[BUILD]", buildId);
}, [buildId]);
```

**Result**: Build ID visible in footer and console, proving deployed JS is active.

---

### 4. Token Visibility Logging ✅

**Problem**: Cannot see if token is in URL or being fetched (no visibility in DevTools/console).

**Fix Applied**:
- **Location**: 
  - `astrosetu/src/app/ai-astrology/preview/page.tsx` (lines 29-31, 1360-1371)
  - `astrosetu/src/app/ai-astrology/subscription/page.tsx` (lines 29-30, 56-68)
- **Change**: 
  - Log `[TOKEN_IN_URL] token` on mount (or "none")
  - Log `[TOKEN_FETCH_START] ...suffix` when starting token fetch
  - Log `[TOKEN_FETCH_RESPONSE] {ok, status, error}` when token fetch completes

**Code Evidence**:
```typescript
// On mount
const inputToken = searchParams.get("input_token");
console.info("[TOKEN_IN_URL]", inputToken || "none");

// Before token fetch
console.info("[TOKEN_FETCH_START]", `...${tokenSuffix}`);

// After token fetch
console.info("[TOKEN_FETCH_RESPONSE]", {
  ok: tokenResponse.ok,
  status: tokenResponse.ok ? "success" : "failed",
  error: tokenResponse.error || null,
});
```

**Result**: Token fetch is now visible in DevTools/console for debugging.

---

### 5. Input Redirect Logging ✅

**Problem**: Cannot verify redirect URL is correct (no logging before redirect).

**Fix Applied**:
- **Location**: `astrosetu/src/app/ai-astrology/input/page.tsx` (lines 243, 274, 299)
- **Change**: Log `[INPUT_REDIRECT] fullUrl` before redirect

**Code Evidence**:
```typescript
const fullUrl = typeof window !== "undefined" ? new URL(subscriptionUrl, window.location.origin).toString() : subscriptionUrl;
console.info("[INPUT_REDIRECT]", fullUrl);
window.location.assign(fullUrl);
```

**Result**: Redirect URL is now visible in console before navigation.

---

## 🧪 New Test Added

### `input-token-in-url-after-submit.spec.ts`

**Purpose**: Verify input submit → URL contains `input_token` AND network call visible AND no redirect loop.

**Test Cases**:
1. Input submit → preview with `input_token` → network call visible → no redirect loop
2. Input submit → subscription with `input_token` → network call visible → no redirect loop

**Location**: `astrosetu/tests/e2e/input-token-in-url-after-submit.spec.ts`

**Key Assertions**:
- URL contains `input_token=` within 2s
- Network call to `/api/ai-astrology/input-session?token=` is visible
- Page does NOT redirect back to input again

**Added to**: `test:critical` script

---

## 📋 Updated Configuration

### `.cursor/rules`
**Added Section**: "HARD NAVIGATION & SERVICE WORKER STABILIZATION (ChatGPT Feedback - CRITICAL - 2026-01-17 22:45)"

**Key Rules**:
1. **Input redirect must use `window.location.assign`** (NOT `router.push`)
2. **Service worker disabled during stabilization** (gated behind `NEXT_PUBLIC_ENABLE_PWA`)
3. **Build ID stamp required** (footer + console)
4. **Token visibility logging required** (`[TOKEN_IN_URL]`, `[TOKEN_FETCH_START]`, `[TOKEN_FETCH_RESPONSE]`)
5. **Input redirect logging required** (`[INPUT_REDIRECT]`)
6. **No service worker while stabilizing checkout/routing**

**Location**: `.cursor/rules` (lines 125-145)

---

### `package.json`
**Updated**: `test:critical` script to include:
- `tests/e2e/input-token-in-url-after-submit.spec.ts`

**Location**: `astrosetu/package.json` (line 27)

---

## ✅ Verification Checklist

- [x] Hard navigation implemented (replaced `router.push` with `window.location.assign`)
- [x] Service worker disabled (gated behind env flag)
- [x] Build ID stamp added (footer + console)
- [x] Token visibility logging added (preview + subscription)
- [x] Input redirect logging added
- [x] New E2E test created (`input-token-in-url-after-submit.spec.ts`)
- [x] `.cursor/rules` updated with new rules
- [x] `test:critical` updated to include new test
- [ ] Deploy to production
- [ ] Verify in DevTools:
  - Build ID visible in footer/console
  - `[INPUT_REDIRECT]` log shows correct URL
  - `[TOKEN_IN_URL]` log shows token (not "none")
  - `[TOKEN_FETCH_START]` log appears
  - `[TOKEN_FETCH_RESPONSE]` log appears
  - Network tab shows `GET /api/ai-astrology/input-session?token=...`
- [ ] Verify in Vercel logs: `GET /api/ai-astrology/input-session?token=...` appears

---

## 🚀 Next Steps

1. **Deploy to production**: Push changes and deploy
2. **Clear browser cache/SW** (if needed):
   - DevTools → Application → Service Workers → Unregister
   - Application → Storage → Clear site data
   - Hard reload (Cmd+Shift+R)
3. **Verify token flow**:
   - Submit input form
   - Check URL contains `input_token=...`
   - Check console shows `[INPUT_REDIRECT]`, `[TOKEN_IN_URL]`, `[TOKEN_FETCH_START]`, `[TOKEN_FETCH_RESPONSE]`
   - Check Network tab shows `GET /api/ai-astrology/input-session?token=...`
   - Check Vercel logs show `GET /api/ai-astrology/input-session?token=...`
4. **Verify build ID**: Footer shows build ID, console shows `[BUILD] buildId`

---

## 📝 Summary for ChatGPT

**Status**: ✅ **ALL FIXES APPLIED**

**What Was Fixed**:
1. ✅ Hard navigation for input redirect (replaced `router.push` with `window.location.assign`)
2. ✅ Service worker disabled during stabilization (gated behind `NEXT_PUBLIC_ENABLE_PWA`)
3. ✅ Build ID stamp added (footer + console)
4. ✅ Token visibility logging added (preview + subscription)
5. ✅ Input redirect logging added
6. ✅ New E2E test created (`input-token-in-url-after-submit.spec.ts`)

**What to Verify After Deploy**:
- Build ID visible in footer/console (proves deployed JS is active)
- `[INPUT_REDIRECT]` log shows correct URL with `input_token`
- `[TOKEN_IN_URL]` log shows token (not "none")
- `[TOKEN_FETCH_START]` and `[TOKEN_FETCH_RESPONSE]` logs appear
- Network tab shows `GET /api/ai-astrology/input-session?token=...`
- Vercel logs show `GET /api/ai-astrology/input-session?token=...`

**Ready for**: Production deployment and verification (clear cache/SW first if needed)

