# 🚀 Deploy and Verify - Step by Step

## Current Status

**The error confirms old code is still deployed:**
- ❌ Error shows POST is being used (old code)
- ❌ No `debug` object in response (old diagnostic code)
- ✅ Latest code has GET enforcement + debug logging

## Step 1: Verify Code is Ready

```bash
cd astrosetu

# Check that changes are present
git status

# Should show:
# - src/lib/astrologyAPI.ts (modified)
# - src/app/api/astrology/diagnostic/route.ts (modified)
```

## Step 2: Commit Changes

```bash
git add src/lib/astrologyAPI.ts src/app/api/astrology/diagnostic/route.ts
git commit -m "Fix ProKerala panchang: Triple enforce GET method + always include debug info"
```

## Step 3: Push to GitHub

```bash
git push origin main
```

## Step 4: Force Redeploy on Vercel

### Option A: Via Vercel Dashboard (Recommended)

1. Go to: https://vercel.com/dashboard
2. Click your project: **astrosetu** (or your project name)
3. Go to **"Deployments"** tab
4. Find the **latest deployment** (should show "Building" or "Ready")
5. Click the **"..."** (three dots) menu on the latest deployment
6. Click **"Redeploy"**
7. **CRITICAL**: In the redeploy dialog, **UNCHECK** "Use existing Build Cache"
8. Click **"Redeploy"**
9. Wait 3-5 minutes for build to complete

### Option B: Via Vercel CLI

```bash
# If you have Vercel CLI installed
vercel --prod --force
```

## Step 5: Verify Deployment

### 5.1 Check Build Logs

1. In Vercel Dashboard → Deployments → Latest deployment
2. Click on the deployment to see build logs
3. Verify:
   - ✅ Build completed successfully
   - ✅ Commit hash matches your latest commit
   - ✅ No build errors

### 5.2 Test Diagnostic Endpoint

```bash
# Test full response
curl https://astrosetu-app.vercel.app/api/astrology/diagnostic | jq

# Test just prokeralaTest
curl https://astrosetu-app.vercel.app/api/astrology/diagnostic | jq '.data.prokeralaTest'

# Test debug object (should NOT be null)
curl https://astrosetu-app.vercel.app/api/astrology/diagnostic | jq '.data.prokeralaTest.debug'
```

## Step 6: Expected Results

### ✅ Success Indicators

After deployment, the diagnostic response should show:

```json
{
  "ok": true,
  "data": {
    "prokeralaTest": {
      "status": "error" or "connected",
      "debug": {
        "method": "GET",
        "endpoint": "/panchang",
        "isPanchangError": true,
        "isPostError": true,
        "error": "...",
        "note": "...",
        "timestamp": "..."
      }
    }
  }
}
```

**Key checks:**
- ✅ `debug` object is **NOT null**
- ✅ `debug.method` is **"GET"** (if panchang error)
- ✅ `debug.isPostError` is **true** (if POST error detected)
- ✅ Error message may include `[PANCHANG_DEBUG:]` prefix

### ❌ If Still Failing

If `debug` is still null or error persists:

1. **Check Build Logs:**
   - Verify commit hash matches your push
   - Check for any build errors
   - Verify files were updated

2. **Check Vercel Function Logs:**
   - Go to Vercel Dashboard → Your Project → Functions
   - Click on `/api/astrology/diagnostic`
   - Look for `[Diagnostic]` console logs
   - Check what method is actually being used

3. **Clear All Caches:**
   - Redeploy again with cache unchecked
   - Wait 5 minutes after deployment
   - Try accessing with a different URL or query param

4. **Verify Environment Variables:**
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Verify `PROKERALA_CLIENT_ID` is set
   - Verify `PROKERALA_CLIENT_SECRET` is set
   - No typos or extra spaces

## Step 7: If Error Persists

If after deployment you still see:
- `debug: null`
- POST method error
- No `[PANCHANG_DEBUG:]` in error

**Share with me:**
1. Full diagnostic response: `curl https://astrosetu-app.vercel.app/api/astrology/diagnostic | jq`
2. Vercel build logs (screenshot or copy)
3. Vercel function logs for `/api/astrology/diagnostic`
4. Git commit hash: `git log -1 --oneline`

## Quick Test Commands

```bash
# Full diagnostic
curl https://astrosetu-app.vercel.app/api/astrology/diagnostic | jq

# Just debug object
curl https://astrosetu-app.vercel.app/api/astrology/diagnostic | jq '.data.prokeralaTest.debug'

# Check if debug exists
curl https://astrosetu-app.vercel.app/api/astrology/diagnostic | jq '.data.prokeralaTest.debug != null'

# Check error message
curl https://astrosetu-app.vercel.app/api/astrology/diagnostic | jq '.data.prokeralaTest.error'
```

## Summary

1. ✅ Code is fixed and ready
2. ⏳ Commit and push changes
3. ⏳ Force redeploy on Vercel (clear cache)
4. ⏳ Verify `debug` object is present
5. ⏳ Check that method is GET in debug info

**The fix is in the code - it just needs to be deployed!**

