# Fix Prokerala Authentication Error in Vercel

## Issue

Your app is deployed and working, but you're seeing:
```
Prokerala authentication failed: Client authentication failed. Please check your client credentials
```

This means the Prokerala API credentials are not set in Vercel environment variables.

## Solution: Add Prokerala Credentials to Vercel

### Step 1: Go to Vercel Environment Variables

1. Go to your Vercel project dashboard
2. Click on your project: **astrosetu-app**
3. Go to **Settings** → **Environment Variables**

### Step 2: Add Prokerala Credentials

Click **"+ Add Another"** and add these two variables:

#### Variable 1: PROKERALA_CLIENT_ID
```
Key: PROKERALA_CLIENT_ID
Value: 4aedeb7a-2fd2-4cd4-a0ec-11b01a895749
Environment: Production (and Preview if you want)
```

#### Variable 2: PROKERALA_CLIENT_SECRET
```
Key: PROKERALA_CLIENT_SECRET
Value: 06SCo9ssJB0nQWYbDWx7GXvnNAc0dqMhDrvIYZ6o
Environment: Production (and Preview if you want)
```

### Step 3: Set Environment Scope

For each variable:
- ✅ Check **"Production"** (required)
- ✅ Optionally check **"Preview"** (for preview deployments)
- ❌ Don't check **"Development"** (that's for local only)

### Step 4: Save and Redeploy

1. Click **"Save"** or **"Finish update"**
2. Go to **Deployments** tab
3. Click **three dots (⋯)** on the latest deployment
4. Click **"Redeploy"**

OR

The next time you push to GitHub, it will automatically redeploy with the new environment variables.

## Your Prokerala Credentials

Based on your project documentation:

```
PROKERALA_CLIENT_ID=4aedeb7a-2fd2-4cd4-a0ec-11b01a895749
PROKERALA_CLIENT_SECRET=06SCo9ssJB0nQWYbDWx7GXvnNAc0dqMhDrvIYZ6o
```

## Verification

After redeploying:

1. **Visit your deployment URL**
2. **Go to the Kundli page**
3. **The error should be gone**
4. **Try generating a Kundli** - it should work with real Prokerala API

## Alternative: Test API Configuration

You can also test if the credentials are working:

Visit: `https://your-app.vercel.app/api/astrology/config`

Should return:
```json
{"ok":true,"data":{"configured":true}}
```

If it returns `{"configured":false}`, the credentials aren't set correctly.

## Troubleshooting

### If credentials still don't work:

1. **Double-check the values:**
   - No extra spaces
   - No quotes around values
   - Exact copy-paste from above

2. **Verify in Vercel:**
   - Go to Settings → Environment Variables
   - Make sure both variables are listed
   - Check they're set for "Production"

3. **Redeploy:**
   - Environment variables only apply to new deployments
   - Must redeploy after adding variables

4. **Check Prokerala account:**
   - Verify your Prokerala account is active
   - Check if credentials are still valid
   - Visit: https://www.prokerala.com/account/api.php

## Summary

**The Fix:**
1. Add `PROKERALA_CLIENT_ID` to Vercel environment variables
2. Add `PROKERALA_CLIENT_SECRET` to Vercel environment variables
3. Set both for "Production" environment
4. Redeploy your application

**After this, your Kundli and astrology features will work with real Prokerala API!** ✅
