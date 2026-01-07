# 🔍 Environment Variable Validation Report

**Date**: January 6, 2026  
**Validated**: `NEXT_PUBLIC_APP_URL` and `STRIPE_SECRET_KEY`

---

## ❌ **CRITICAL ISSUES FOUND**

### 1. ⚠️ **`NEXT_PUBLIC_APP_URL` - INCORRECT VALUE**

**What you provided**:
```
https://astrosetu-app.vercel.app/NEXT_PUBLIC_APP_URL
```

**Problem**: 
- ❌ This is a **URL path**, not a base URL
- ❌ The `/NEXT_PUBLIC_APP_URL` part should not be there
- ❌ This will cause payment redirects and email links to fail

**Correct Value Should Be**:
```
https://astrosetu-app.vercel.app
```

**How it's used in code**:
- Payment success redirects: `${baseUrl}/ai-astrology/payment/success`
- Email links: `${baseUrl}/contact`
- All internal URL generation

**Current Behavior** (with wrong value):
- ❌ Redirects will go to: `https://astrosetu-app.vercel.app/NEXT_PUBLIC_APP_URL/ai-astrology/payment/success` (404 error)
- ❌ Email links broken
- ❌ All URL generation broken

---

### 2. 🔴 **`STRIPE_SECRET_KEY` - USING TEST KEY IN PRODUCTION**

**What you provided**:
```
sk_test_51SiuJBLdgH7zpsQH...EzVL (TEST KEY - masked for security)
```

**Problem**:
- ⚠️ Key starts with `sk_test_` = **TEST/MODE KEY**
- ❌ **Cannot process real payments** in production
- ❌ Customers will see test mode indicators
- ❌ No real money will be collected

**For Production, You Need**:
```
sk_live_... (LIVE KEY - Get from Stripe Dashboard, must start with `sk_live_`)
```
*(Note: The actual live key will have different characters than the test key, but must start with `sk_live_`)*

**How to Get Live Key**:
1. Go to https://dashboard.stripe.com
2. Click **"Activate test mode"** toggle to turn it OFF (switches to live mode)
3. Go to **Developers** → **API keys**
4. Copy the **Secret key** (starts with `sk_live_`)
5. Update in Vercel

**Also Update**:
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Should be `pk_live_...` (not `pk_test_...`)

---

## ✅ **VALIDATION SUMMARY**

| Variable | Status | Issue | Action Required |
|----------|--------|-------|-----------------|
| `NEXT_PUBLIC_APP_URL` | ❌ **WRONG** | Has `/NEXT_PUBLIC_APP_URL` path | Remove path, use base URL only |
| `STRIPE_SECRET_KEY` | ⚠️ **TEST KEY** | Starts with `sk_test_` | Get live key from Stripe dashboard |

---

## 🔧 **IMMEDIATE FIXES REQUIRED**

### Fix 1: Correct `NEXT_PUBLIC_APP_URL`

**Current (WRONG)**:
```
https://astrosetu-app.vercel.app/NEXT_PUBLIC_APP_URL
```

**Correct**:
```
https://astrosetu-app.vercel.app
```

**Steps**:
1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Find `NEXT_PUBLIC_APP_URL`
3. Click edit (three dots menu)
4. Change to: `https://astrosetu-app.vercel.app` (remove `/NEXT_PUBLIC_APP_URL`)
5. Save
6. Redeploy (or trigger new deployment)

---

### Fix 2: Switch to Stripe Live Keys

**Steps**:
1. Go to https://dashboard.stripe.com
2. **Turn OFF test mode** (toggle at top right)
3. Go to **Developers** → **API keys**
4. Copy **Publishable key** (`pk_live_...`)
5. Copy **Secret key** (`sk_live_...`)
6. Update in Vercel:
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = `pk_live_...`
   - `STRIPE_SECRET_KEY` = `sk_live_...`
7. Save and redeploy

**⚠️ IMPORTANT**: 
- Test mode keys will **NOT collect real payments**
- You must activate your Stripe account (complete verification)
- Verify your bank account is connected in Stripe

---

## ✅ **AFTER FIXES - VERIFICATION**

### Test `NEXT_PUBLIC_APP_URL`:
1. Submit contact form
2. Check email - links should work (not 404)
3. Complete a payment
4. Verify redirect to success page works

### Test Stripe Keys:
1. Go to Stripe Dashboard
2. Check if test mode is OFF
3. Try a real payment (small amount)
4. Verify payment appears in Stripe Dashboard → Payments (live mode)

---

## 📊 **KEY FORMAT REFERENCE**

### Stripe Keys:

**TEST Mode** (for development):
- Publishable: `pk_test_...`
- Secret: `sk_test_...`

**LIVE Mode** (for production):
- Publishable: `pk_live_...`
- Secret: `sk_live_...`

### App URL Format:

**CORRECT**:
```
https://astrosetu-app.vercel.app
```

**WRONG**:
```
https://astrosetu-app.vercel.app/NEXT_PUBLIC_APP_URL  ❌
http://localhost:3000/NEXT_PUBLIC_APP_URL  ❌
```

---

## 🎯 **PRIORITY**

1. 🔴 **URGENT**: Fix `NEXT_PUBLIC_APP_URL` (breaks all redirects and links)
2. 🔴 **URGENT**: Switch to Stripe live keys (required for real payments)
3. ✅ Then: Run Supabase migration
4. ✅ Then: End-to-end testing

---

## ⚠️ **SECURITY NOTE**

**Do NOT commit Stripe keys to Git!**
- They're already in Vercel (correct)
- Only update via Vercel dashboard
- Never paste in chat or public places (already exposed - consider rotating)

---

**Last Updated**: January 6, 2026  
**Status**: ⚠️ **ACTION REQUIRED** - Fix both values before going live

