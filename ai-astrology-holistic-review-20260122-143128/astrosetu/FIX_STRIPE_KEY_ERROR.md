# Fix: "This API call cannot be made with a publishable API key" Error

## Quick Fix Steps

This error occurs when `STRIPE_SECRET_KEY` in Vercel is set to a **publishable key** (`pk_...`) instead of a **secret key** (`sk_...`).

### Step-by-Step Fix:

1. **Go to Stripe Dashboard**
   - Visit: https://dashboard.stripe.com
   - Navigate to: **Developers** → **API keys**
   - Make sure you're in the correct mode (Test mode for testing, Live mode for production)

2. **Get Your Secret Key**
   - Look for the **"Secret key"** section (NOT "Publishable key")
   - Click **"Reveal test key"** or **"Reveal live key"** to see it
   - Copy the key that starts with `sk_test_...` (test) or `sk_live_...` (live)
   - ⚠️ **DO NOT** use the key that starts with `pk_` (that's the publishable key)

3. **Fix Vercel Environment Variable**
   - Go to: https://vercel.com/dashboard
   - Select your project: **astrosetu-app**
   - Go to: **Settings** → **Environment Variables**
   - Find: `STRIPE_SECRET_KEY`
   - Click the **pencil icon** (edit) or **three dots** → **Edit**
   - Check the current value:
     - ❌ **WRONG**: If it starts with `pk_` (publishable key)
     - ✅ **CORRECT**: Should start with `sk_` (secret key)
   - If wrong, **replace** the entire value with your secret key from step 2
   - Click **"Save"**

4. **Redeploy Application**
   - Go to: **Deployments** tab
   - Click the **"..."** menu on the latest deployment
   - Click **"Redeploy"**
   - Wait for deployment to complete (usually 1-2 minutes)

5. **Verify Fix**
   - Test the payment flow again
   - The error should be resolved

---

## How to Verify Keys Are Correct

### ✅ Correct Configuration:

| Environment Variable | Should Start With | Example |
|---------------------|-------------------|---------|
| `STRIPE_SECRET_KEY` | `sk_test_` or `sk_live_` | `sk_test_51AbCdEf...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_` or `pk_live_` | `pk_test_51AbCdEf...` |

### ❌ Common Mistakes:

- Setting `STRIPE_SECRET_KEY` to `pk_test_...` (publishable key) → **CAUSES THIS ERROR**
- Setting `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` to `sk_test_...` (secret key) → Wrong, but won't cause this specific error
- Mixing test and live keys → Use test keys for development, live keys for production

---

## Visual Guide

In Stripe Dashboard, you'll see two keys:

```
┌─────────────────────────────────────────┐
│ Publishable key                         │
│ pk_test_51AbCdEfGhIjKlMnOpQrStUvWxYz   │  ← Use for NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
│ [Reveal test key]                       │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Secret key                              │
│ sk_test_51AbCdEfGhIjKlMnOpQrStUvWxYz   │  ← Use for STRIPE_SECRET_KEY
│ [Reveal test key]                       │
└─────────────────────────────────────────┘
```

---

## Still Having Issues?

If you've followed all steps and still see the error:

1. **Double-check** both environment variables are set correctly
2. **Confirm** you redeployed after making changes
3. **Check** you're not mixing test and live keys
4. **Verify** there are no extra spaces or line breaks in the key values
5. **Try** deleting and re-adding the environment variable

For more help, see the full [STRIPE_SETUP_GUIDE.md](./STRIPE_SETUP_GUIDE.md).

