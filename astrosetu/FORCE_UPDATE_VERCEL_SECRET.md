# 🔧 Force Update Vercel Secret - Step by Step

## Current Issue

Diagnostic still shows: `"06SC...YZ6o"` (OLD secret)  
Should show: `"Oz9i...5Ilk"` (NEW secret)

This means Vercel environment variables haven't been updated or deployment didn't pick them up.

---

## Step 1: Verify Secret in Vercel Dashboard

### 1.1 Go to Vercel

1. Visit: https://vercel.com/dashboard
2. Click your project: **astrosetu**
3. Go to **Settings** → **Environment Variables**

### 1.2 Check PROKERALA_CLIENT_SECRET

1. Find `PROKERALA_CLIENT_SECRET` in the list
2. **Click on it** to view the value
3. **What does it show?**
   - ❌ `06SCo9ssJBOnQWYbDWx7GXvnNAc0dqMhDrvIYZ6o` (OLD - needs update)
   - ✅ `Oz9iwYNzgCtkIAsXOcC0BWw6IwboDVx7uNfV5Ilk` (NEW - correct)

### 1.3 If It Shows OLD Value

**Delete and Recreate (Most Reliable Method):**

1. Click on `PROKERALA_CLIENT_SECRET`
2. Click **"Delete"** button
3. Confirm deletion
4. Click **"Add New"** or **"Create Variable"**
5. **Key:** `PROKERALA_CLIENT_SECRET`
6. **Value:** `Oz9iwYNzgCtkIAsXOcC0BWw6IwboDVx7uNfV5Ilk`
   - Copy character by character from ProKerala dashboard
   - No spaces, no quotes
7. **Environment:** Select **Production** ✅ (and Preview/Development if needed)
8. Click **"Save"**

### 1.4 If It Shows NEW Value

If it already shows the new value, the issue is deployment. Go to Step 2.

---

## Step 2: Verify Environment Scope

**CRITICAL:** Make sure it's set for **Production**:

1. Look at the environment column for `PROKERALA_CLIENT_SECRET`
2. Should show: **Production** ✅
3. If it shows **Preview** or **Development** only:
   - Click **"Edit"**
   - Check **"Production"** checkbox
   - Click **"Save"**

---

## Step 3: Force Redeploy with Cache Cleared

### 3.1 Go to Deployments

1. Click **"Deployments"** tab
2. Find the **latest deployment**

### 3.2 Redeploy

1. Click **"..."** (three dots) on the latest deployment
2. Click **"Redeploy"**
3. **CRITICAL:** In the dialog:
   - ✅ **UNCHECK** "Use existing Build Cache"
   - This forces Vercel to reload environment variables
4. Click **"Redeploy"**

### 3.3 Wait for Deployment

1. Watch the deployment status
2. Wait until it shows **"Ready"** (usually 3-5 minutes)
3. Don't test until deployment is complete

---

## Step 4: Alternative - Trigger New Deployment

If redeploy doesn't work, trigger a new deployment:

### 4.1 Make a Small Code Change

```bash
# In astrosetu directory
echo "// Updated $(date)" >> src/lib/astrologyAPI.ts
```

### 4.2 Commit and Push

```bash
git add src/lib/astrologyAPI.ts
git commit -m "Trigger redeploy for env var update"
git push origin main
```

This will trigger a fresh deployment with new environment variables.

---

## Step 5: Verify After Deployment

After deployment completes:

```bash
# Check secret preview
curl https://astrosetu-app.vercel.app/api/astrology/diagnostic | jq '.data.prokeralaTest.authDiagnostic.clientSecretPreview'
```

**Expected:** `"Oz9i...5Ilk"` (NEW)  
**If still shows:** `"06SC...YZ6o"` (OLD) → Secret not updated in Vercel

---

## Step 6: If Still Not Working

### 6.1 Double-Check Secret Character

From ProKerala dashboard, verify:
- Is it `Oz9iwYNzgCtkIAsXOcC0BWw6IwboDVx7uNfV5Ilk` (letter O)?
- Or `Oz9iwYNzgCtkIAsX0cC0BWw6IwboDVx7uNfV5Ilk` (zero 0)?

Copy character by character from ProKerala dashboard.

### 6.2 Check Multiple Environments

1. In Vercel → Environment Variables
2. Check if `PROKERALA_CLIENT_SECRET` exists in:
   - Production ✅ (should have new value)
   - Preview (might have old value)
   - Development (might have old value)
3. Update all environments if needed

### 6.3 Wait Longer

Sometimes Vercel caches:
- Wait 10 minutes after deployment
- Try accessing with query param: `?t=1234567890`
- Or wait for next automatic deployment

### 6.4 Check Vercel Function Logs

1. Go to Vercel Dashboard → Functions
2. Click on `/api/astrology/diagnostic`
3. Check logs for environment variable loading
4. Look for any errors

---

## Quick Checklist

- [ ] Verified secret in Vercel dashboard
- [ ] Deleted and recreated if needed
- [ ] Set for Production environment
- [ ] Force redeployed with cache cleared
- [ ] Waited for deployment to complete
- [ ] Tested secret preview
- [ ] Still shows old → Check character (O vs 0)
- [ ] Still shows old → Check all environments
- [ ] Still shows old → Wait 10 minutes

---

## Most Common Issue

**90% of cases:** Secret wasn't actually updated in Vercel, or wrong environment selected.

**Quick fix:**
1. Delete `PROKERALA_CLIENT_SECRET` in Vercel
2. Recreate with exact value from ProKerala
3. Set for Production
4. Force redeploy (clear cache)
5. Wait 5 minutes
6. Test again

---

## Summary

**Current:** Still showing old secret `06SC...YZ6o`  
**Expected:** Should show new secret `Oz9i...5Ilk`

**Solution:**
1. ✅ Verify/update secret in Vercel
2. ✅ Delete and recreate if needed
3. ✅ Set for Production
4. ✅ Force redeploy (clear cache)
5. ✅ Wait for deployment
6. ✅ Test again

**After proper update and redeploy, should show new secret!**

