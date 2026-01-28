# Complete Vercel Environment Variables Checklist

## Current Status

✅ **Build:** Successful  
✅ **Deployment:** Live  
❌ **Prokerala API:** Authentication failed (Error 602)

## Required Environment Variables

Add these to Vercel → Your Project → Settings → Environment Variables:

### 1. Prokerala API (Required for Astrology Features)

**Variable 1:**
```
Key: PROKERALA_CLIENT_ID
Value: 4aedeb7a-2fd2-4cd4-a0ec-11b01a895749
Environment: ✅ Production, ✅ Preview
```

**Variable 2:**
```
Key: PROKERALA_CLIENT_SECRET
Value: 06SCo9ssJB0nQWYbDWx7GXvnNAc0dqMhDrvIYZ6o
Environment: ✅ Production, ✅ Preview
```

**Status:** ❌ **MISSING** - This is causing the 400 error

---

### 2. Supabase (Optional - for Database/Auth)

**Variable 1:**
```
Key: NEXT_PUBLIC_SUPABASE_URL
Value: https://your-project-id.supabase.co
Environment: ✅ Production, ✅ Preview
```

**Variable 2:**
```
Key: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGci... (your anon key)
Environment: ✅ Production, ✅ Preview
```

**Variable 3:**
```
Key: SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGci... (your service role key)
Environment: ✅ Production, ✅ Preview
```

**Status:** ⚠️ Check if configured

---

### 3. Razorpay (Optional - for Payments)

**Variable 1:**
```
Key: NEXT_PUBLIC_RAZORPAY_KEY_ID
Value: rzp_test_xxxxx or rzp_live_xxxxx
Environment: ✅ Production, ✅ Preview
```

**Variable 2:**
```
Key: RAZORPAY_KEY_SECRET
Value: your-secret-key
Environment: ✅ Production, ✅ Preview
```

**Variable 3:**
```
Key: RAZORPAY_WEBHOOK_SECRET
Value: your-webhook-secret (optional)
Environment: ✅ Production
```

**Status:** ⚠️ Check if configured

---

### 4. App Configuration

**Variable 1:**
```
Key: NEXT_PUBLIC_APP_URL
Value: https://astrosetu-8yfzxcbd4-amits-projects-a49d49fa.vercel.app
Environment: ✅ Production, ✅ Preview
```

**Variable 2:**
```
Key: NEXT_PUBLIC_APP_NAME
Value: AstroSetu
Environment: ✅ Production, ✅ Preview
```

**Status:** ⚠️ Check if configured

---

### 5. Node Environment

**Variable:**
```
Key: NODE_ENV
Value: production
Environment: ✅ Production
```

**Status:** ✅ Usually auto-set by Vercel

---

## Quick Fix Steps

### Step 1: Add Prokerala Credentials (URGENT)

1. Go to Vercel → Your Project → **Settings** → **Environment Variables**
2. Click **"+ Add Another"**
3. Add:
   - **Key:** `PROKERALA_CLIENT_ID`
   - **Value:** `4aedeb7a-2fd2-4cd4-a0ec-11b01a895749`
   - **Environment:** Check "Production" and "Preview"
4. Click **"Add Another"** again
5. Add:
   - **Key:** `PROKERALA_CLIENT_SECRET`
   - **Value:** `06SCo9ssJB0nQWYbDWx7GXvnNAc0dqMhDrvIYZ6o`
   - **Environment:** Check "Production" and "Preview"
6. Click **"Save"** or **"Finish update"**

### Step 2: Redeploy

1. Go to **Deployments** tab
2. Click **three dots (⋯)** on latest deployment
3. Click **"Redeploy"**

### Step 3: Verify

1. Visit your app: `https://astrosetu-8yfzxcbd4-amits-projects-a49d49fa.vercel.app/kundli`
2. Try generating a Kundli
3. Check Network tab - should see `200 OK` instead of `400 Bad Request`
4. Error messages should disappear

---

## Verification Endpoints

After adding credentials, test these:

### Test Prokerala Configuration:
```
GET https://your-app.vercel.app/api/astrology/config
```

**Expected Response:**
```json
{
  "ok": true,
  "data": {
    "configured": true
  }
}
```

### Test Kundli Generation:
```
POST https://your-app.vercel.app/api/astrology/kundli
```

**Expected:** Should return Kundli data (not 400 error)

---

## Current Error Analysis

**Error Code:** 602  
**Error Message:** "Client authentication failed. Please check your client credentials"  
**HTTP Status:** 400 Bad Request  
**Endpoint:** `/api/astrology/kundli`

**Root Cause:** `PROKERALA_CLIENT_ID` and/or `PROKERALA_CLIENT_SECRET` are not set in Vercel environment variables.

**Fix:** Add both variables to Vercel → Settings → Environment Variables → Redeploy

---

## Priority Order

1. **URGENT:** Add Prokerala credentials (fixes the 400 error)
2. **Important:** Add Supabase credentials (if using auth/database)
3. **Important:** Add Razorpay credentials (if using payments)
4. **Optional:** Add app configuration variables

---

## After Adding All Variables

1. ✅ Redeploy application
2. ✅ Test Kundli generation
3. ✅ Test authentication (if Supabase configured)
4. ✅ Test payments (if Razorpay configured)
5. ✅ Verify all features work

---

**The main issue right now is missing Prokerala credentials. Add them to fix the 400 error!** 🔧
