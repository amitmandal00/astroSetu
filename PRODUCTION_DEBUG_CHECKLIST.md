# Production Debug Checklist

**Date**: 2026-01-17 23:00  
**Issue**: Production shows POST to `/api/ai-astrology/input-session` works, but NO GET requests (token not reaching preview/subscription)

---

## 🔍 Quick Immediate Check (Before Code Changes)

**Do this once before any more iterations:**

1. **Open DevTools → Application → Service Workers → Unregister**
2. **Application → Storage → Clear site data**
3. **Hard reload** (Cmd+Shift+R or Ctrl+Shift+R)
4. **Re-test**: After input submit, confirm URL contains `input_token=...`

**If you still don't see `input_token` in the URL after submit**, the fix is 100% in input redirect (switch to `window.location.assign(...)` + logging) - **This is now implemented ✅**.

---

## ✅ After Code Deploy - Verification Steps

### Step 1: Verify Build ID is Visible

**In Browser**:
1. Open DevTools → Console
2. Look for `[BUILD] buildId` log on page mount
3. Scroll to footer, verify build ID is displayed (e.g., "Build: 9598229")

**Expected**: Build ID matches deployment commit hash

**If missing**: Build ID env var not set in Vercel

---

### Step 2: Verify Service Worker is Disabled

**In Browser**:
1. Open DevTools → Application → Service Workers
2. **Expected**: No service workers registered (or shows "No service workers registered")

**If service worker is registered**: Check `NEXT_PUBLIC_ENABLE_PWA` is not set to "true" in Vercel

---

### Step 3: Verify Input Redirect Logging

**Steps**:
1. Go to `/ai-astrology/input?reportType=year-analysis`
2. Fill birth details and submit
3. **Before redirect happens**, check Console for `[INPUT_REDIRECT]` log
4. **Expected**: Log shows full URL with `input_token=...`

**Example**:
```
[INPUT_REDIRECT] https://your-app.vercel.app/ai-astrology/preview?reportType=year-analysis&input_token=abc123...
```

**If missing or URL doesn't contain `input_token`**: Input redirect fix not working

---

### Step 4: Verify Token in URL After Submit

**Steps**:
1. After input submit, check address bar
2. **Expected**: URL contains `input_token=...` parameter

**Example**:
```
https://your-app.vercel.app/ai-astrology/preview?reportType=year-analysis&input_token=abc123...
```

**If missing**: Hard navigation (`window.location.assign`) not working or URL construction is wrong

---

### Step 5: Verify Token Fetch Logging

**In Console**:
1. After navigating to preview/subscription with `input_token`
2. Look for logs:
   - `[TOKEN_IN_URL] abc123...` (or "none" if missing)
   - `[TOKEN_FETCH_START] ...suffix`
   - `[TOKEN_FETCH_RESPONSE] {ok: true, status: "success"}`

**Expected**: All three logs appear, `[TOKEN_IN_URL]` shows token (not "none")

**If `[TOKEN_IN_URL]` shows "none"**: Token not in URL (input redirect issue)

**If `[TOKEN_FETCH_START]` doesn't appear**: Token fetch not being triggered

**If `[TOKEN_FETCH_RESPONSE]` shows `ok: false`**: Token fetch failed (check error message)

---

### Step 6: Verify Network Call to Token API

**In DevTools → Network**:
1. Filter by "input-session"
2. After navigating to preview/subscription with `input_token`
3. **Expected**: `GET /api/ai-astrology/input-session?token=...` request appears

**If missing**: Token fetch not being triggered (check `[TOKEN_IN_URL]` log)

**If request fails**: Check response status/error (410 = expired, 404 = invalid, 500 = server error)

---

### Step 7: Verify Vercel Logs Show GET Request

**In Vercel Dashboard → Logs**:
1. After navigating to preview/subscription with `input_token`
2. **Expected**: `GET /api/ai-astrology/input-session?token=...` appears in logs

**If missing**: Request not reaching server (check Network tab in DevTools)

**If present but fails**: Check error message in Vercel logs

---

## 🐛 Failure Point Identification

### If `[INPUT_REDIRECT]` log is missing or URL doesn't contain `input_token`:
- **Fix**: Hard navigation not working or URL construction wrong
- **Check**: `input/page.tsx` lines 237-300 (should use `window.location.assign`)

### If `[TOKEN_IN_URL]` shows "none":
- **Fix**: Token not in URL (input redirect issue)
- **Check**: Step 4 (verify token in URL after submit)

### If `[TOKEN_FETCH_START]` doesn't appear:
- **Fix**: Token fetch not being triggered
- **Check**: `preview/page.tsx` or `subscription/page.tsx` - token fetch code should run when `input_token` is in URL

### If `[TOKEN_FETCH_RESPONSE]` shows `ok: false`:
- **Fix**: Token fetch failed (check error message)
- **Check**: Token expired (410), invalid (404), or server error (500)

### If Network tab shows no request:
- **Fix**: Token fetch not being triggered
- **Check**: `[TOKEN_IN_URL]` log (should show token, not "none")

### If Vercel logs show no GET request:
- **Fix**: Request not reaching server
- **Check**: Network tab in DevTools (should show request)

---

## 📝 What to Report to ChatGPT

**If issues persist after deploy**, provide:

1. **Build ID**: What build ID shows in footer/console?
2. **Input redirect URL**: What does `[INPUT_REDIRECT]` log show?
3. **Token in URL**: Does URL contain `input_token=` after submit?
4. **Token fetch logs**: What do `[TOKEN_IN_URL]`, `[TOKEN_FETCH_START]`, `[TOKEN_FETCH_RESPONSE]` show?
5. **Network request**: Does DevTools Network tab show `GET /api/ai-astrology/input-session?token=...`?
6. **Vercel logs**: Does Vercel dashboard show `GET /api/ai-astrology/input-session?token=...`?
7. **Service worker status**: Is service worker registered? (DevTools → Application → Service Workers)

This will pinpoint the exact failure point (input redirect, token fetch, network, or server).

---

## 🚀 Expected Behavior After Fixes

**After input submit**:
1. ✅ `[INPUT_REDIRECT]` log shows full URL with `input_token=...`
2. ✅ URL in address bar contains `input_token=...`
3. ✅ `[TOKEN_IN_URL]` log shows token (not "none")
4. ✅ `[TOKEN_FETCH_START]` log appears
5. ✅ `[TOKEN_FETCH_RESPONSE]` log shows `ok: true`
6. ✅ Network tab shows `GET /api/ai-astrology/input-session?token=...` (200 status)
7. ✅ Vercel logs show `GET /api/ai-astrology/input-session?token=...` (200 status)
8. ✅ Preview/subscription loads input data (no redirect loop)

If all 8 steps pass, the token flow is working ✅.

---

**Ready for**: Production deployment and verification using this checklist.

