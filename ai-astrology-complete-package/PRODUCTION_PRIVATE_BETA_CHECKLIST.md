# Production Private Beta Checklist

**Date**: 2026-01-17 23:30  
**Purpose**: Verify private beta gating is working correctly in production  
**Status**: ✅ **READY FOR VERIFICATION**

---

## ✅ Pre-Deployment Checklist

- [x] Middleware created (`middleware.ts`) with UI + API gate enforcement
- [x] Access page created (`/ai-astrology/access`) with birth details form
- [x] Verification API created (`/api/beta-access/verify`) with server-side allowlist matching
- [x] Server-only normalization helpers (`src/lib/betaAccess.ts`)
- [x] E2E tests created (beta-access-blocks, beta-access-allows, beta-access-blocks-api)
- [x] Unit tests created (`tests/unit/betaAccess.test.ts`)
- [x] Tests added to `test:critical` and `release:gate`
- [x] `.cursor/rules` updated with PRIVATE_BETA_GATING invariants
- [ ] **Production env var set**: `NEXT_PUBLIC_PRIVATE_BETA=true` (in Vercel Production environment)
- [ ] **Preview env var**: `NEXT_PUBLIC_PRIVATE_BETA` not set or `false` (preview can be open)

---

## 🔍 Verification Steps (In Production Incognito)

### Step 1: Verify Gate is Enabled

**Action**: Check production environment variable

**In Vercel Dashboard**:
- [ ] Go to Settings → Environment Variables
- [ ] Verify `NEXT_PUBLIC_PRIVATE_BETA=true` is set for **Production** environment
- [ ] Verify `NEXT_PUBLIC_PRIVATE_BETA` is NOT set (or `false`) for **Preview** environment (optional)

---

### Step 2: Verify UI Routes are Blocked (Without Cookie)

**Action**: Visit AI Astrology pages without beta access cookie

**In Incognito Browser** (no cookies):
1. [ ] Visit `/ai-astrology`
   - **Expected**: Redirects to `/ai-astrology/access`
   - **Verify**: URL contains `/ai-astrology/access`

2. [ ] Visit `/ai-astrology/preview?reportType=year-analysis`
   - **Expected**: Redirects to `/ai-astrology/access?returnTo=/ai-astrology/preview?reportType=year-analysis`
   - **Verify**: URL contains `/ai-astrology/access` and `returnTo=` parameter

3. [ ] Visit `/ai-astrology/subscription`
   - **Expected**: Redirects to `/ai-astrology/access`
   - **Verify**: URL contains `/ai-astrology/access`

4. [ ] Visit `/ai-astrology/input`
   - **Expected**: Redirects to `/ai-astrology/access`
   - **Verify**: URL contains `/ai-astrology/access`

5. [ ] Visit `/ai-astrology/access` (access page itself)
   - **Expected**: Page loads (no redirect)
   - **Verify**: "Private Beta Access" form is visible

---

### Step 3: Verify API Routes are Blocked (Without Cookie)

**Action**: Make API requests without beta access cookie

**In DevTools → Network** (incognito, no cookies):
1. [ ] POST `/api/ai-astrology/input-session`
   - **Expected**: 401 status
   - **Response**: `{ "error": "private_beta", "message": "Access restricted..." }`

2. [ ] POST `/api/ai-astrology/create-checkout`
   - **Expected**: 401 status
   - **Response**: `{ "error": "private_beta", "message": "Access restricted..." }`

3. [ ] GET `/api/billing/subscription`
   - **Expected**: 401 status
   - **Response**: `{ "error": "private_beta", "message": "Access restricted..." }`

---

### Step 4: Verify Access Verification (Valid User 1)

**Action**: Submit valid birth details for Amit Kumar Mandal

**In `/ai-astrology/access` page**:
1. [ ] Fill form:
   - Name: `Amit Kumar Mandal`
   - DOB: `26 Nov 1984` (or `1984-11-26`)
   - Time: `09:40 pm` (or `21:40`)
   - Place: `Noamundi, Jharkhand` (or `Noamundi, Jharkhand, India`)
   - Gender: `Male`

2. [ ] Click "Verify Access"

3. [ ] **Expected**:
   - Redirects to `/ai-astrology` (or `returnTo` if provided)
   - HttpOnly cookie `beta_access=1` is set (check in DevTools → Application → Cookies)

4. [ ] **Verify Access Granted**:
   - Can visit `/ai-astrology` without redirect
   - Can visit `/ai-astrology/preview?reportType=year-analysis` without redirect
   - Can submit input form (POST `/api/ai-astrology/input-session` returns 200, not 401)
   - Can access purchase/subscribe flows normally

---

### Step 5: Verify Access Verification (Valid User 2)

**Action**: Submit valid birth details for Ankita Surabhi

**Clear cookies first** (DevTools → Application → Storage → Clear site data), then:
1. [ ] Fill form:
   - Name: `Ankita Surabhi`
   - DOB: `01 Jul 1988` (or `1988-07-01`)
   - Time: `05:58 pm` (or `17:58`)
   - Place: `Ranchi, Jharkhand` (or `Ranchi, Jharkhand, India`)
   - Gender: `Female`

2. [ ] Click "Verify Access"

3. [ ] **Expected**:
   - Redirects to `/ai-astrology`
   - HttpOnly cookie `beta_access=1` is set

4. [ ] **Verify Access Granted**:
   - Can access all `/ai-astrology/*` pages without redirect
   - Can access all `/api/ai-astrology/*` and `/api/billing/*` APIs (200 status, not 401)

---

### Step 6: Verify Invalid Details are Blocked

**Action**: Submit invalid birth details

**In `/ai-astrology/access` page**:
1. [ ] Fill form with invalid details:
   - Name: `Test User`
   - DOB: `01 Jan 1990`
   - Time: `12:00 pm`
   - Place: `Delhi`
   - Gender: `Male`

2. [ ] Click "Verify Access"

3. [ ] **Expected**:
   - Stays on `/ai-astrology/access` page (no redirect)
   - Error message shown: "Access not granted. Please check your details and try again."
   - No cookie set (check DevTools → Application → Cookies)

4. [ ] **Verify Still Blocked**:
   - Cannot visit `/ai-astrology` (redirects to `/ai-astrology/access`)
   - Cannot access APIs (401 private_beta)

---

### Step 7: Verify Cookie Persistence

**Action**: Verify cookie persists across page navigations

**After successful verification** (cookie `beta_access=1` set):
1. [ ] Navigate to `/ai-astrology`
   - **Expected**: Page loads (no redirect)

2. [ ] Navigate to `/ai-astrology/preview?reportType=year-analysis`
   - **Expected**: Page loads (no redirect)

3. [ ] Close and reopen browser (same session)
   - **Expected**: Cookie persists (7-day TTL), access still granted

4. [ ] Check cookie in DevTools → Application → Cookies
   - **Expected**: `beta_access=1` is present, HttpOnly=true, expires in ~7 days

---

## 🐛 Failure Case Analysis

### Case 1: UI Routes Not Redirecting

**Symptom**: `/ai-astrology` loads without redirect to `/ai-astrology/access`

**Possible Causes**:
- `NEXT_PUBLIC_PRIVATE_BETA` is not set to `"true"` in production
- Middleware is not running (check Vercel logs)
- Cookie is already set from previous session

**Fix**:
- Verify env var is set correctly in Vercel Production
- Clear cookies and test again
- Check middleware logs in Vercel dashboard

---

### Case 2: API Routes Not Returning 401

**Symptom**: API routes return 200/other status instead of 401

**Possible Causes**:
- Middleware is not intercepting API routes
- Cookie is present (user already verified)
- Env var not set correctly

**Fix**:
- Verify middleware matcher includes `/api/ai-astrology/:path*` and `/api/billing/:path*`
- Clear cookies and test again
- Check middleware logs

---

### Case 3: Valid Details Not Matching

**Symptom**: Valid user details don't grant access

**Possible Causes**:
- Normalization function not handling input format
- Allowlist entry doesn't match (typo, wrong format)
- Server-side matching logic error

**Fix**:
- Check server logs for `[BETA_ACCESS]` messages
- Verify allowlist entries in `src/lib/betaAccess.ts`
- Test with exact formats: "26 Nov 1984", "09:40 pm", etc.

---

### Case 4: Cookie Not Set After Verification

**Symptom**: Verification succeeds but cookie not set

**Possible Causes**:
- HttpOnly cookie not being set by `/api/beta-access/verify`
- Cookie domain/path mismatch
- Browser blocking cookies

**Fix**:
- Check server logs for verification success
- Verify cookie headers in Network tab (DevTools)
- Check cookie domain/path settings

---

## 📋 Acceptance Criteria (MUST PASS IN PROD INCÓGNITO)

**All of these must be true**:
- ✅ Without cookie: `/ai-astrology` → redirects to `/ai-astrology/access`
- ✅ Without cookie: `/ai-astrology/preview?reportType=year-analysis` → redirects to `/ai-astrology/access` with returnTo preserved
- ✅ Without cookie: POST `/api/ai-astrology/input-session` → 401 private_beta
- ✅ With valid beta access (Amit Kumar Mandal): Can access `/ai-astrology`, submit input, reach preview, purchase/subscribe flows proceed normally
- ✅ With valid beta access (Ankita Surabhi): Can access `/ai-astrology`, submit input, reach preview, purchase/subscribe flows proceed normally
- ✅ Invalid details: Stays blocked, no hints, no cookie set

---

## 🚀 How to Disable Later

**To disable private beta gating**:

1. **In Vercel Dashboard**:
   - Go to Settings → Environment Variables
   - Set `NEXT_PUBLIC_PRIVATE_BETA=false` (or delete the env var)
   - Redeploy production

2. **Verify Disabled**:
   - Visit `/ai-astrology` in incognito (should load without redirect)
   - API routes should return 200 (not 401)

**Note**: Access cookies remain valid for 7 days. Users who already verified can still access until cookie expires.

---

**Ready for**: Production deployment and verification using this checklist.

