# Production Verification After Deploy

**Date**: 2026-01-17 23:00  
**Fix**: Hard navigation + SW disabled + Build ID + Token logging  
**Status**: ✅ **READY FOR DEPLOYMENT VERIFICATION**

---

## ✅ Pre-Deployment Checklist

- [x] Hard navigation implemented (`window.location.assign` instead of `router.push`)
- [x] Service worker disabled (gated behind `NEXT_PUBLIC_ENABLE_PWA`)
- [x] Build ID stamp added (footer + console)
- [x] Token visibility logging added (preview + subscription)
- [x] Input redirect logging added
- [x] New E2E test created (`input-token-in-url-after-submit.spec.ts`)
- [ ] **Vercel env vars set for Preview + Production**:
  - [ ] `SUPABASE_SERVICE_ROLE_KEY` (server-only)
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_APP_URL` (for checkout baseUrl)
  - [ ] `NEXT_PUBLIC_ENABLE_PWA=false` (disable SW during stabilization)

---

## 🔍 Verification Steps (In This Exact Order)

### Step 1: Deploy + Confirm You're Running New JS ✅

**Action**: Open deployed site in Incognito and check:

**In Browser Footer**:
- [ ] Build ID is visible (e.g., "Build: 9598229")
- [ ] Build ID matches deployment commit hash

**In Console** (DevTools → Console):
- [ ] `[BUILD] buildId` log appears on page mount
- [ ] Build ID matches deployment commit hash

**If Build ID doesn't change** → You're not running new bundle (still cached / wrong domain / wrong deployment)

**Expected Output**:
```
[BUILD] 9598229
```

**Footer should show**:
```
Build: 9598229
```

---

### Step 2: Confirm Service Worker is Truly Out ✅

**In DevTools → Application → Service Workers**:
- [ ] Shows "No service workers registered" (or "unregistered")
- [ ] **If service worker is registered**: Unregister it manually

**In DevTools → Application → Storage**:
- [ ] Clear site data (for that domain)

**Hard Reload**:
- [ ] Press Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows/Linux)

**In DevTools → Network** (after reload):
- [ ] `/sw.js` should NOT appear in Network tab (or should fail with 404)

**If `/sw.js` still shows up** → SW is still active from older install (new auto-unregister should handle it, but verify manually if needed)

---

### Step 3: Run ONE Flow and Check "Truth Signals" ✅

**Flow**: Year Analysis → Purchase → Input submit

**You MUST see ALL of these:**

#### A. Input Page Console (Before Redirect)

**Action**: Fill birth details and click submit, check Console before redirect happens

**Expected**:
```
[INPUT_REDIRECT] https://your-app.vercel.app/ai-astrology/preview?reportType=year-analysis&input_token=abc123...
```

**If missing or URL doesn't contain `input_token=`** → Input redirect fix not working

---

#### B. Address Bar (After Submit)

**Action**: Check address bar after input submit

**Expected**: URL contains `input_token=...`

**Example**:
```
https://your-app.vercel.app/ai-astrology/preview?reportType=year-analysis&input_token=abc123...
```

**If missing** → Hard navigation not working or URL construction wrong

---

#### C. Preview Page Console (After Navigation)

**Action**: Check Console on preview page after navigation

**Expected**:
```
[BUILD] 9598229
[TOKEN_IN_URL] abc123...
[TOKEN_FETCH_START] ...suffix
[TOKEN_FETCH_RESPONSE] {ok: true, status: "success"}
```

**If `[TOKEN_IN_URL]` shows "none"** → Token not in URL (redirect issue)

**If `[TOKEN_FETCH_START]` doesn't appear** → Token fetch not being triggered

**If `[TOKEN_FETCH_RESPONSE]` shows `ok: false`** → Token fetch failed (check error)

---

#### D. Vercel Logs (After Navigation)

**Action**: Check Vercel Dashboard → Logs

**Expected**: `GET /api/ai-astrology/input-session?token=...` appears in logs

**Example**:
```
GET 200 /api/ai-astrology/input-session?token=abc123...
```

**If missing** → Request not reaching server (check Network tab in DevTools)

**If present but fails** → Check error status/message

---

## 🐛 Failure Case Analysis

### Case 1: `input_token` in URL, but `TOKEN_FETCH_RESPONSE` is 410

**Meaning**: ✅ Token system works. The token is expiring/invalid/consumed.

**Fix Options**:
1. Increase TTL temporarily (e.g., 2 hours) while stabilizing
2. Confirm server clock/timezone isn't off
3. Confirm "multi-use semantics" matches your actual flow

**Check**: `input-session/route.ts` - TTL is 30 minutes default (`expiresIn = 1800`)

---

### Case 2: `TOKEN_FETCH_RESPONSE` is 500

**Meaning**: Server env is missing (very common with Preview deployments)

**Fix**:
1. **Confirm env vars exist in Vercel for Preview + Production**:
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only)
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_APP_URL` (for checkout baseUrl)
   - `NEXT_PUBLIC_ENABLE_PWA=false` (disable SW)
2. **Confirm SQL migration executed in Supabase**:
   - `AI_INPUT_SESSIONS_SUPABASE.sql` - table must exist with correct schema

**Check**: Vercel Dashboard → Settings → Environment Variables (set for both Preview and Production)

---

### Case 3: Still NO `GET` in Vercel Logs

**Meaning**: Preview/subscription is not actually attempting the fetch

**Possible Causes**:
1. Token not in URL (redirect still wrong)
2. Request never fired due to early redirect logic
3. Still on cached JS (build ID didn't change)

**Debug Steps**:
1. Check `[TOKEN_IN_URL]` log - should show token (not "none")
2. Check `[TOKEN_FETCH_START]` log - should appear if token is in URL
3. Check Build ID - should match deployment commit
4. Check Network tab - should show `GET /api/ai-astrology/input-session?token=...`

**The build stamp + logs will tell you exactly which of these is true.**

---

## 📋 What to Paste Back (Minimal)

After redeploy + incognito test, provide:

### 1. Footer Build ID Text (or Screenshot)
```
Build: 9598229
```

### 2. Console Lines from ONE Flow
```
[BUILD] 9598229
[INPUT_REDIRECT] https://your-app.vercel.app/ai-astrology/preview?reportType=year-analysis&input_token=abc123...
[TOKEN_IN_URL] abc123...
[TOKEN_FETCH_START] ...suffix
[TOKEN_FETCH_RESPONSE] {ok: true, status: "success"}
```

### 3. One Vercel Log Line
**Show**: `GET /api/ai-astrology/input-session?token=...` (200 or error status)

**Or**: "No GET request found" (if still missing)

---

## 🎯 Expected Success Criteria

**All of these must be true**:
- ✅ Build ID visible in footer and matches deployment commit
- ✅ Service worker NOT registered (or unregistered)
- ✅ `[INPUT_REDIRECT]` log shows full URL with `input_token=...`
- ✅ Address bar contains `input_token=...` after submit
- ✅ `[TOKEN_IN_URL]` log shows token (not "none")
- ✅ `[TOKEN_FETCH_START]` log appears
- ✅ `[TOKEN_FETCH_RESPONSE]` log shows `ok: true`
- ✅ Network tab shows `GET /api/ai-astrology/input-session?token=...` (200 status)
- ✅ Vercel logs show `GET /api/ai-astrology/input-session?token=...` (200 status)

**If ALL pass** → Token flow is working ✅

**If ANY fail** → Use failure case analysis above to identify exact blocker

---

## 🚀 Next Steps

1. **Set Vercel env vars** (if not already set):
   - `SUPABASE_SERVICE_ROLE_KEY` (Preview + Production)
   - `NEXT_PUBLIC_SUPABASE_URL` (Preview + Production)
   - `NEXT_PUBLIC_APP_URL` (Preview + Production)
   - `NEXT_PUBLIC_ENABLE_PWA=false` (Preview + Production)
2. **Deploy to production** (commit `9598229` with fixes)
3. **Run verification steps above** (in exact order)
4. **Paste back minimal results** (Build ID, Console logs, Vercel log line)

**Ready for**: Production deployment and verification

