# 🔧 Force Update Client Secret - Step by Step

## Current Issue

Still seeing old secret: `06SC...YZ6o`  
Should see new secret: `VOZH...uSg`

---

## Step 1: Double-Check Vercel Environment Variable

### 1.1 Go to Vercel Dashboard

1. Visit: https://vercel.com/dashboard
2. Click your project: **astrosetu**
3. Go to **Settings** → **Environment Variables**

### 1.2 Verify PROKERALA_CLIENT_SECRET

1. Find `PROKERALA_CLIENT_SECRET` in the list
2. **Click on it** to view the value
3. **What does it show?**
   - ❌ `06SCo9ssJBOnQWYbDWx7GXvnNAc0dqMhDrvIYZ6o` (OLD - needs update)
   - ✅ `VOZHU6VQDLyiRMU7QOue7XViuvKm7Vd4IddfhuSg` (NEW - correct)

### 1.3 If It Shows OLD Value

1. Click **"Edit"** button
2. **Select all** the old value (Cmd+A / Ctrl+A)
3. **Delete** it completely
4. **Paste** the new value: `VOZHU6VQDLyiRMU7QOue7XViuvKm7Vd4IddfhuSg`
5. **Check for spaces:**
   - No space before: `VOZHU6VQDLyiRMU7QOue7XViuvKm7Vd4IddfhuSg` ✅
   - No space after: `VOZHU6VQDLyiRMU7QOue7XViuvKm7Vd4IddfhuSg` ✅
6. **Check for quotes:**
   - Should NOT be: `"VOZHU6VQDLyiRMU7QOue7XViuvKm7Vd4IddfhuSg"` ❌
   - Should be: `VOZHU6VQDLyiRMU7QOue7XViuvKm7Vd4IddfhuSg` ✅
7. Click **"Save"**

### 1.4 Check Environment Scope

**IMPORTANT:** Make sure it's set for **Production**:

1. Look at the environment column for `PROKERALA_CLIENT_SECRET`
2. Should show: **Production** ✅
3. If it shows **Preview** or **Development** only:
   - Click **"Edit"**
   - Check **"Production"** checkbox
   - Click **"Save"**

---

## Step 2: Delete and Recreate (If Needed)

If the value still doesn't update, try deleting and recreating:

### 2.1 Delete Old Variable

1. Find `PROKERALA_CLIENT_SECRET`
2. Click **"..."** menu
3. Click **"Delete"**
4. Confirm deletion

### 2.2 Create New Variable

1. Click **"Add New"** or **"Create Variable"**
2. **Key:** `PROKERALA_CLIENT_SECRET`
3. **Value:** `VOZHU6VQDLyiRMU7QOue7XViuvKm7Vd4IddfhuSg`
4. **Environment:** Select **Production** ✅
5. Click **"Save"**

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

## Step 4: Verify Deployment

### 4.1 Check Build Logs

1. Click on the deployment
2. Go to **"Build Logs"** or **"Function Logs"**
3. Look for environment variable loading
4. Check for any errors

### 4.2 Test Secret Preview

```bash
curl https://astrosetu-app.vercel.app/api/astrology/diagnostic | jq '.data.prokeralaTest.authDiagnostic.clientSecretPreview'
```

**Expected:** `"VOZH...uSg"`  
**If still shows:** `"06SC...YZ6o"` → Secret not updated or not deployed

---

## Step 5: If Still Not Working

### 5.1 Wait Longer

Sometimes Vercel caches:
- Wait 10 minutes after deployment
- Try again

### 5.2 Check Multiple Environments

1. Go to Settings → Environment Variables
2. Check if `PROKERALA_CLIENT_SECRET` exists in:
   - Production ✅ (should have new value)
   - Preview (might have old value)
   - Development (might have old value)
3. Update all environments if needed

### 5.3 Try Different Deployment Method

1. Make a small code change (add a comment)
2. Commit and push:
   ```bash
   git add src/lib/astrologyAPI.ts
   git commit -m "Trigger redeploy for env var update"
   git push origin main
   ```
3. This will trigger a new deployment with fresh environment variables

### 5.4 Contact Vercel Support

If still not working:
- Vercel support can verify environment variables are set correctly
- They can check if there's a caching issue

---

## Verification Checklist

- [ ] Vercel shows new secret: `VOZHU6VQDLyiRMU7QOue7XViuvKm7Vd4IddfhuSg`
- [ ] No spaces before or after
- [ ] No quotes around value
- [ ] Set for Production environment
- [ ] Force redeployed with cache cleared
- [ ] Waited for deployment to complete
- [ ] Tested secret preview: Should show `VOZH...uSg`
- [ ] Full test: Should show `"status": "connected"`

---

## Quick Test Commands

```bash
# Check secret preview
curl https://astrosetu-app.vercel.app/api/astrology/diagnostic | jq '.data.prokeralaTest.authDiagnostic.clientSecretPreview'

# Full diagnostic
curl https://astrosetu-app.vercel.app/api/astrology/diagnostic | jq '.data.prokeralaTest'

# Check status
curl https://astrosetu-app.vercel.app/api/astrology/diagnostic | jq '.data.prokeralaTest.status'
```

---

## Summary

**The secret is still showing as old, which means:**
1. Either not updated in Vercel yet
2. Or not deployed yet (needs redeploy)
3. Or wrong environment (not Production)

**Follow steps above to:**
1. ✅ Verify secret in Vercel
2. ✅ Update if needed
3. ✅ Force redeploy (clear cache)
4. ✅ Test again

**After proper deployment, should see `VOZH...uSg` and authentication should work!**

