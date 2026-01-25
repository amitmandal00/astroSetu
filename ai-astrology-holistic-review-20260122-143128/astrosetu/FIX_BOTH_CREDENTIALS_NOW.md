# 🚨 URGENT: Fix BOTH Credentials - Still Showing Old Values

## Current Problem

**Diagnostic shows OLD credentials:**
- Client ID: `4aed...5749` ❌ (OLD - should be `70b7...e642`)
- Client Secret: `06SC...YZ6o` ❌ (OLD - should be `Oz9i...5Ilk`)

**This means BOTH environment variables in Vercel are NOT updated or deployment is using cache.**

---

## ✅ SOLUTION: Complete Reset of Both Variables

### Step 1: Delete BOTH Variables in Vercel

1. Go to: https://vercel.com/dashboard
2. Your Project → **Settings** → **Environment Variables**
3. **Delete BOTH:**
   - Find `PROKERALA_CLIENT_ID` → Click → **Delete** → Confirm
   - Find `PROKERALA_CLIENT_SECRET` → Click → **Delete** → Confirm
4. **Wait 10 seconds** (let them fully delete)

### Step 2: Recreate PROKERALA_CLIENT_ID

1. Click **"Add New"** or **"Create Variable"**
2. **Key:** `PROKERALA_CLIENT_ID`
3. **Value:** `70b7ffb3-78f1-4a2f-9044-835ac8e5e642`
   - Copy exactly from ProKerala dashboard
   - No spaces, no quotes
4. **Environment:** 
   - ✅ Check **"Production"**
   - ✅ Check **"Preview"** (optional)
   - ✅ Check **"Development"** (optional)
5. Click **"Save"**

### Step 3: Recreate PROKERALA_CLIENT_SECRET

1. Click **"Add New"** again
2. **Key:** `PROKERALA_CLIENT_SECRET`
3. **Value:** `Oz9iwYNzgCtkIAsX0cC0BWw6IwboDVx7uNfV5Ilk`
   - **CRITICAL:** Use zero `0` in `AsX0cC0`, NOT letter `O`
   - Copy character by character from ProKerala dashboard
   - No spaces, no quotes
4. **Environment:**
   - ✅ Check **"Production"**
   - ✅ Check **"Preview"** (optional)
   - ✅ Check **"Development"** (optional)
5. Click **"Save"**

### Step 4: Verify Both Variables

1. Check the list - should see:
   - `PROKERALA_CLIENT_ID` = `70b7ffb3-78f1-4a2f-9044-835ac8e5e642` ✅
   - `PROKERALA_CLIENT_SECRET` = `Oz9iwYNzgCtkIAsX0cC0BWw6IwboDVx7uNfV5Ilk` ✅
2. Click on each to verify values match exactly
3. Verify both show **"Production"** in environment column

---

## Step 5: Trigger Fresh Deployment (CRITICAL!)

### Option A: Force Redeploy

1. Go to **Deployments** tab
2. Click **"..."** on latest deployment
3. Click **"Redeploy"**
4. **UNCHECK** "Use existing Build Cache" ✅
5. Click **"Redeploy"**
6. Wait 5 minutes

### Option B: Code Change (MOST RELIABLE)

This forces a completely fresh deployment:

```bash
cd astrosetu

# Make a small change to trigger deployment
echo "" >> src/lib/astrologyAPI.ts
echo "// Env vars updated: $(date +%Y-%m-%d)" >> src/lib/astrologyAPI.ts

# Commit and push
git add src/lib/astrologyAPI.ts
git commit -m "Trigger deployment: Update ProKerala credentials"
git push origin main
```

This will trigger a new deployment that will load the new environment variables.

---

## Step 6: Wait and Test

1. **Wait 5-10 minutes** after deployment completes
2. **Test:**
   ```bash
   curl https://astrosetu-app.vercel.app/api/astrology/diagnostic | jq '.data.prokeralaTest.authDiagnostic'
   ```

**Expected:**
```json
{
  "clientIdPreview": "70b7...e642",
  "clientSecretPreview": "Oz9i...5Ilk",
  "statusCode": 200
}
```

**If still shows old values:** Go to Troubleshooting

---

## Step 7: Full Test

```bash
curl https://astrosetu-app.vercel.app/api/astrology/diagnostic | jq '.data.prokeralaTest'
```

**Expected Success:**
```json
{
  "status": "connected",
  "ok": true,
  "message": "Successfully authenticated and tested Prokerala API"
}
```

---

## 🔍 Troubleshooting

### If Still Shows Old Values:

1. **Check Vercel Function Logs:**
   - Vercel Dashboard → Functions → `/api/astrology/diagnostic`
   - Check logs to see what values are actually being used
   - This will confirm if env vars are loaded

2. **Verify Secret Character:**
   - ProKerala dashboard shows: `Oz9iwYNzgCtkIAsX0cC0BWw6IwboDVx7uNfV5Ilk`
   - Make sure Vercel has: `AsX0cC0` (zero 0), NOT `AsXOcC0` (letter O)

3. **Check for Multiple Variables:**
   - Look for duplicate `PROKERALA_CLIENT_ID` or `PROKERALA_CLIENT_SECRET`
   - Delete ALL instances
   - Create ONE of each

4. **Wait Longer:**
   - Sometimes Vercel caches for 15 minutes
   - Wait 15 minutes and try again

5. **Check Environment Scope:**
   - Make sure both variables are set for **Production**
   - Not just Preview or Development

---

## 📋 Complete Checklist

- [ ] Deleted `PROKERALA_CLIENT_ID` in Vercel
- [ ] Deleted `PROKERALA_CLIENT_SECRET` in Vercel
- [ ] Recreated `PROKERALA_CLIENT_ID` = `70b7ffb3-78f1-4a2f-9044-835ac8e5e642`
- [ ] Recreated `PROKERALA_CLIENT_SECRET` = `Oz9iwYNzgCtkIAsX0cC0BWw6IwboDVx7uNfV5Ilk` (zero 0)
- [ ] Verified both are set for Production
- [ ] Verified values match ProKerala dashboard exactly
- [ ] Triggered fresh deployment (code change method)
- [ ] Waited 5-10 minutes after deployment
- [ ] Tested diagnostic endpoint
- [ ] Verified `clientIdPreview` shows `70b7...e642`
- [ ] Verified `clientSecretPreview` shows `Oz9i...5Ilk`
- [ ] Got `"status": "connected"`

---

## Summary

**Current:** Both credentials showing old values  
**Fix:** Delete both, recreate with exact values, trigger fresh deployment  
**Method:** Code change deployment is most reliable

**After complete reset, both credentials should update and authentication should work!**

