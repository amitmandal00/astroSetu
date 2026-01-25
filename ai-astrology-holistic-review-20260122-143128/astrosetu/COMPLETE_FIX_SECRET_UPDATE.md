# 🔧 Complete Fix: Secret Still Showing Old Value

## Current Problem

Diagnostic keeps showing: `"06SC...YZ6o"` (OLD secret)  
Should show: `"Oz9i...5Ilk"` or `"Oz9i...5Ilk"` (NEW secret)

**This means Vercel environment variables are NOT being updated or deployment is using cache.**

---

## ✅ SOLUTION: Complete Reset Method

### Step 1: Delete ALL ProKerala Variables in Vercel

1. Go to: https://vercel.com/dashboard
2. Your Project → **Settings** → **Environment Variables**
3. **Delete BOTH variables:**
   - `PROKERALA_CLIENT_ID` → Click → Delete
   - `PROKERALA_CLIENT_SECRET` → Click → Delete
4. **Wait 10 seconds** (let them fully delete)

### Step 2: Recreate Both Variables

**Create PROKERALA_CLIENT_ID:**
1. Click **"Add New"**
2. **Key:** `PROKERALA_CLIENT_ID`
3. **Value:** `70b7ffb3-78f1-4a2f-9044-835ac8e5e642`
4. **Environment:** Check **"Production"** ✅
5. Click **"Save"**

**Create PROKERALA_CLIENT_SECRET:**
1. Click **"Add New"** again
2. **Key:** `PROKERALA_CLIENT_SECRET`
3. **Value:** `Oz9iwYNzgCtkIAsX0cC0BWw6IwboDVx7uNfV5Ilk`
   - **CRITICAL:** Use zero `0`, NOT letter `O`
   - Copy character by character from ProKerala dashboard
4. **Environment:** Check **"Production"** ✅
5. Click **"Save"**

### Step 3: Verify Both Variables

1. Check the list - should see both:
   - `PROKERALA_CLIENT_ID` = `70b7ffb3-78f1-4a2f-9044-835ac8e5e642`
   - `PROKERALA_CLIENT_SECRET` = `Oz9iwYNzgCtkIAsX0cC0BWw6IwboDVx7uNfV5Ilk`
2. Click on each to verify the values
3. Verify both show **"Production"** in environment column

---

## Step 4: Trigger Fresh Deployment

### Option A: Force Redeploy (Try This First)

1. Go to **Deployments** tab
2. Click **"..."** on latest deployment
3. Click **"Redeploy"**
4. **UNCHECK** "Use existing Build Cache" ✅
5. Click **"Redeploy"**
6. Wait 5 minutes

### Option B: Make Code Change (If Option A Doesn't Work)

If redeploy still shows old secret, trigger a new deployment:

```bash
cd astrosetu

# Make a small comment change to trigger deployment
echo "" >> src/lib/astrologyAPI.ts
echo "// Environment variables updated: $(date)" >> src/lib/astrologyAPI.ts

# Commit and push
git add src/lib/astrologyAPI.ts
git commit -m "Trigger deployment for env var update"
git push origin main
```

This will trigger a completely fresh deployment that will load the new environment variables.

---

## Step 5: Wait and Test

1. **Wait 5-10 minutes** after deployment completes
2. **Test:**
   ```bash
   curl https://astrosetu-app.vercel.app/api/astrology/diagnostic | jq '.data.prokeralaTest.authDiagnostic.clientSecretPreview'
   ```

**Expected:** `"Oz9i...5Ilk"` (NEW secret)  
**If still old:** Go to Troubleshooting below

---

## 🔍 Troubleshooting: If Still Shows Old Secret

### Check 1: Verify Secret Character

**From ProKerala dashboard, the secret is:**
```
Oz9iwYNzgCtkIAsX0cC0BWw6IwboDVx7uNfV5Ilk
            ^^^^
            Zero 0 (NOT letter O)
```

**Make sure in Vercel you have:**
- `AsX0cC0` (zero 0) ✅
- NOT `AsXOcC0` (letter O) ❌

### Check 2: Multiple Environments

1. In Vercel → Environment Variables
2. Check if `PROKERALA_CLIENT_SECRET` appears multiple times
3. Delete ALL instances
4. Create ONE new one for Production

### Check 3: Check All Environments

1. Look at the environment column
2. Make sure it's set for **Production**
3. If it shows Preview/Development only, that's the problem

### Check 4: Vercel Function Logs

1. Go to Vercel Dashboard → Functions
2. Click on `/api/astrology/diagnostic`
3. Check the latest function logs
4. Look for environment variable values
5. See what secret is actually being used

### Check 5: Wait Longer

Sometimes Vercel has aggressive caching:
- Wait 15 minutes after deployment
- Try accessing with cache-busting: `?t=$(date +%s)`
- Or wait for next automatic deployment

### Check 6: Contact Vercel Support

If nothing works:
- Vercel support can verify environment variables are set correctly
- They can check if there's a caching issue
- They can force a fresh deployment

---

## 🎯 Nuclear Option: Complete Reset

If absolutely nothing works:

1. **Delete project from Vercel** (or create new project)
2. **Reconnect to GitHub**
3. **Add environment variables fresh**
4. **Deploy**

This ensures no cached values.

---

## 📋 Final Checklist

- [ ] Deleted BOTH `PROKERALA_CLIENT_ID` and `PROKERALA_CLIENT_SECRET` in Vercel
- [ ] Recreated `PROKERALA_CLIENT_ID` with correct value
- [ ] Recreated `PROKERALA_CLIENT_SECRET` with correct value (zero 0, not letter O)
- [ ] Verified both are set for Production
- [ ] Force redeployed with cache cleared
- [ ] OR triggered new deployment with code change
- [ ] Waited 5-10 minutes after deployment
- [ ] Tested secret preview
- [ ] Still shows old → Check Vercel function logs
- [ ] Still shows old → Contact Vercel support

---

## Summary

**Current:** Still showing old secret `06SC...YZ6o`  
**Root Cause:** Environment variables not updating or deployment using cache  
**Solution:** Delete both variables, recreate with exact values, trigger fresh deployment

**After complete reset, should show new secret and authentication should work!**

