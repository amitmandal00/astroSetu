# 🔧 Fix: Preview vs Production Environment Variables

## Issue Found! 🎯

**The diagnostic works on Production:**
- URL: `https://astrosetu-app.vercel.app` ✅
- Status: "connected" ✅

**But kundli fails on Preview:**
- URL: `https://astrosetu-8yfzxcbd4-amits-projects-a49d49fa.vercel.app` ❌
- Error: Authentication failed ❌

**Root Cause:** Preview deployments have different environment variables!

---

## ✅ Solution: Update Preview Environment Variables

### Step 1: Go to Vercel Environment Variables

1. Visit: https://vercel.com/dashboard
2. Your Project → **Settings** → **Environment Variables**

### Step 2: Update for Preview Environment

For **BOTH** variables:

1. **PROKERALA_CLIENT_ID:**
   - Click on it
   - Click **"Edit"**
   - Check **"Preview"** environment ✅
   - Value: `70b7ffb3-78f1-4a2f-9044-835ac8e5e642`
   - Click **"Save"**

2. **PROKERALA_CLIENT_SECRET:**
   - Click on it
   - Click **"Edit"**
   - Check **"Preview"** environment ✅
   - Value: `Oz9iwYNzgCtkIAsX0cC0BWw6IwboDVx7uNfV5Ilk` (zero `0`)
   - Click **"Save"**

### Step 3: Verify Environment Scope

Both variables should be set for:
- ✅ **Production** (already working)
- ✅ **Preview** (needs to be added)
- ✅ **Development** (optional, for local dev)

### Step 4: Redeploy Preview

After updating:

1. Go to **Deployments** tab
2. Find the **Preview** deployment (the one with the long hash)
3. Click **"..."** → **"Redeploy"**
4. **UNCHECK** "Use existing Build Cache"
5. Click **"Redeploy"**
6. Wait 3-5 minutes

---

## Alternative: Set for All Environments

When creating/editing variables:

1. Check **ALL** environments:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

This ensures all deployments use the same credentials.

---

## Test Both URLs

### Production:
```bash
curl https://astrosetu-app.vercel.app/api/astrology/diagnostic | jq '.data.prokeralaTest.status'
```
**Expected:** `"connected"` ✅

### Preview:
```bash
curl https://astrosetu-8yfzxcbd4-amits-projects-a49d49fa.vercel.app/api/astrology/diagnostic | jq '.data.prokeralaTest.status'
```
**Expected:** `"connected"` (after updating Preview env vars)

---

## Why This Happens

Vercel has separate environment variables for:
- **Production:** `astrosetu-app.vercel.app`
- **Preview:** `astrosetu-xxx.vercel.app` (each PR/branch gets unique URL)
- **Development:** Local development

If you only set variables for Production, Preview deployments won't have them!

---

## Quick Fix Checklist

- [ ] Go to Vercel → Settings → Environment Variables
- [ ] Edit `PROKERALA_CLIENT_ID` → Check **"Preview"** ✅
- [ ] Edit `PROKERALA_CLIENT_SECRET` → Check **"Preview"** ✅
- [ ] Verify values are correct
- [ ] Redeploy Preview deployment
- [ ] Test Preview URL
- [ ] Should work now! ✅

---

## Summary

**Issue:** Preview deployment doesn't have environment variables  
**Fix:** Add credentials for Preview environment in Vercel  
**Result:** Both Production and Preview will work

**After updating Preview environment variables, kundli should work on Preview deployments!**

