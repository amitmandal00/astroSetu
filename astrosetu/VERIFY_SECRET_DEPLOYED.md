# ✅ Verify New Client Secret is Deployed

## Current Status

The diagnostic shows the **old secret** is still being used:
- `clientSecretPreview: "06SC...YZ6o"` ❌ (OLD)
- Should show: `"VOZH...uSg"` ✅ (NEW)

This means the new secret hasn't been deployed yet.

---

## Step 1: Verify Secret in Vercel

### 1.1 Check Environment Variable

1. Go to: https://vercel.com/dashboard
2. Your Project → **Settings** → **Environment Variables**
3. Find `PROKERALA_CLIENT_SECRET`
4. Click on it to view the value
5. **Verify it shows:** `VOZHU6VQDLyiRMU7QOue7XViuvKm7Vd4IddfhuSg`

**If it shows the old value:**
- Click **"Edit"**
- Replace with: `VOZHU6VQDLyiRMU7QOue7XViuvKm7Vd4IddfhuSg`
- Click **"Save"**

**If it shows the new value:**
- ✅ Good! Proceed to Step 2

---

## Step 2: Force Redeploy

**CRITICAL:** Environment variables only take effect after redeployment!

### 2.1 Redeploy on Vercel

1. Go to **Deployments** tab
2. Find the **latest deployment**
3. Click **"..."** (three dots) menu
4. Click **"Redeploy"**
5. **IMPORTANT:** 
   - ✅ **Uncheck** "Use existing Build Cache"
   - This ensures new environment variables are loaded
6. Click **"Redeploy"**
7. Wait 3-5 minutes for deployment to complete

### 2.2 Verify Deployment

1. Check the deployment status
2. Should show "Ready" or "Building"
3. Wait until it's "Ready"
4. Check build logs for any errors

---

## Step 3: Test Again

After deployment completes, test:

```bash
curl https://astrosetu-app.vercel.app/api/astrology/diagnostic | jq '.data.prokeralaTest'
```

### Expected Changes:

**Before (OLD secret):**
```json
{
  "clientSecretPreview": "06SC...YZ6o"
}
```

**After (NEW secret):**
```json
{
  "clientSecretPreview": "VOZH...uSg"
}
```

### Expected Success:

```json
{
  "status": "connected",
  "ok": true,
  "message": "Successfully authenticated and tested Prokerala API"
}
```

---

## Step 4: If Still Shows Old Secret

If diagnostic still shows `06SC...YZ6o` after redeployment:

### 4.1 Check Deployment Logs

1. Go to Vercel Dashboard → Deployments
2. Click on the latest deployment
3. Check build logs
4. Look for environment variable loading

### 4.2 Verify Environment

1. Go to Settings → Environment Variables
2. Check `PROKERALA_CLIENT_SECRET`
3. Verify it's set for **Production** environment
4. Not just Preview/Development

### 4.3 Try Manual Redeploy

1. Go to Deployments
2. Click **"..."** → **"Redeploy"**
3. **Uncheck** "Use existing Build Cache"
4. Click **"Redeploy"**
5. Wait 5 minutes
6. Test again

### 4.4 Clear All Caches

If still not working:
1. Wait 10 minutes (sometimes Vercel caches)
2. Try accessing with a query parameter: `?t=1234567890`
3. Or wait for next automatic deployment

---

## Quick Verification

After redeployment, check:

```bash
curl https://astrosetu-app.vercel.app/api/astrology/diagnostic | jq '.data.prokeralaTest.authDiagnostic.clientSecretPreview'
```

**Should return:** `"VOZH...uSg"` (not `"06SC...YZ6o"`)

---

## Summary

**Current Issue:**
- Old secret still deployed: `06SC...YZ6o`
- New secret not deployed yet: `VOZH...uSg`

**Solution:**
1. ✅ Verify new secret in Vercel
2. ✅ Force redeploy (clear cache)
3. ✅ Wait for deployment
4. ✅ Test diagnostic endpoint
5. ✅ Verify `clientSecretPreview` shows `VOZH...uSg`

**After deployment, authentication should work!**

