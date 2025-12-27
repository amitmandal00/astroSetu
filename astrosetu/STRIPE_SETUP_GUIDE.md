# Stripe Setup Guide for AI Astrology Payments

This guide will help you configure Stripe payment processing for the AI Astrology platform.

## Prerequisites

1. A Stripe account (sign up at https://stripe.com if you don't have one)
2. Access to your Vercel project dashboard

---

## Step 1: Get Your Stripe API Keys

### 1.1 Login to Stripe Dashboard

1. Go to https://dashboard.stripe.com
2. Login to your Stripe account

### 1.2 Navigate to API Keys

1. Click on **"Developers"** in the left sidebar
2. Click on **"API keys"** in the submenu

### 1.3 Get Your Keys

You'll see two keys:

**Test Mode (for development/testing):**
- **Publishable key**: Starts with `pk_test_...`
- **Secret key**: Starts with `sk_test_...` (click "Reveal test key" to see it)

**Live Mode (for production):**
- **Publishable key**: Starts with `pk_live_...`
- **Secret key**: Starts with `sk_live_...` (click "Reveal live key" to see it)

> **Important**: For testing, use **Test Mode** keys. Only use **Live Mode** keys when you're ready for real payments.

---

## Step 2: Add Keys to Vercel Environment Variables

### 2.1 Access Vercel Project Settings

1. Go to https://vercel.com/dashboard
2. Select your project: **astrosetu-app**
3. Click on **"Settings"** tab
4. Click on **"Environment Variables"** in the left sidebar

### 2.2 Add Stripe Secret Key

1. Click **"Add New"** button
2. **Key**: `STRIPE_SECRET_KEY`
3. **Value**: Paste your Stripe secret key (e.g., `sk_test_...` for test mode)
4. **Environment**: Select all environments (Production, Preview, Development)
5. Click **"Save"**

### 2.3 Add Stripe Publishable Key

1. Click **"Add New"** button again
2. **Key**: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
3. **Value**: Paste your Stripe publishable key (e.g., `pk_test_...` for test mode)
4. **Environment**: Select all environments (Production, Preview, Development)
5. Click **"Save"**

---

## Step 3: Verify Configuration

### 3.1 Check Environment Variables

After adding the keys, verify they're set:

1. In Vercel, go to **Settings** → **Environment Variables**
2. Confirm both keys are listed:
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

### 3.2 Redeploy Application

**Important**: After adding environment variables, you need to redeploy:

1. Go to **Deployments** tab in Vercel
2. Click the **"..."** menu on the latest deployment
3. Click **"Redeploy"**
4. Wait for deployment to complete

OR

1. Make a small commit and push to trigger a new deployment
2. Vercel will automatically pick up the new environment variables

---

## Step 4: Test Payment Flow

### 4.1 Test Mode Keys (Recommended for Testing)

If you're using **Test Mode** keys:

1. Use Stripe's test card numbers:
   - **Card**: `4242 4242 4242 4242`
   - **Expiry**: Any future date (e.g., `12/34`)
   - **CVC**: Any 3 digits (e.g., `123`)
   - **ZIP**: Any 5 digits (e.g., `12345`)

2. Test the payment flow:
   - Go to AI Astrology page
   - Select a paid report (Marriage Timing, Career & Money, or Full Life)
   - Fill in birth details
   - Complete checkout
   - Use test card details

### 4.2 Verify Payment Processing

1. Check Stripe Dashboard → **Payments** section
2. You should see test payments appearing
3. Verify they're marked as "Succeeded"

---

## Environment Variables Summary

| Variable Name | Description | Example Value |
|--------------|-------------|---------------|
| `STRIPE_SECRET_KEY` | Stripe secret API key (server-side only) | `sk_test_51AbCdEf...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (client-side safe) | `pk_test_51AbCdEf...` |

---

## Important Notes

### Security

- **Never commit** Stripe keys to your git repository
- `STRIPE_SECRET_KEY` should only be set in Vercel environment variables (server-side)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is safe to expose (it's used client-side)

### Test vs Live Mode

- **Test Mode**: Use for development and testing (no real charges)
- **Live Mode**: Use for production (real payments)
- You can switch between test and live keys by updating the environment variables

### Testing Without Stripe

If you need to test without Stripe configured:

1. The app will work in **demo mode** if:
   - `AI_ASTROLOGY_DEMO_MODE=true` is set, OR
   - `NODE_ENV=development` is set

2. Test users (Amit Kumar Mandal with specific birth details) can bypass payment

3. For other users, you'll need Stripe configured for paid reports

---

## Troubleshooting

### Issue: "Payment processing not configured" error

**Solution**: 
- Verify both `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` are set in Vercel
- Redeploy the application after adding keys
- Check that keys are not empty or have extra spaces

### Issue: Payment fails with "Invalid API Key"

**Solution**:
- Verify you copied the complete key (they're long strings)
- Check you're using test keys for test mode or live keys for production
- Ensure there are no extra spaces or line breaks

### Issue: Keys not updating after deployment

**Solution**:
- Make sure you selected the correct environment (Production/Preview/Development)
- Redeploy the application manually
- Clear browser cache and try again

---

## Support

For Stripe-specific issues:
- Stripe Documentation: https://stripe.com/docs
- Stripe Support: https://support.stripe.com

For application-specific issues:
- Check Vercel deployment logs
- Review browser console for errors
- Check Network tab for API call failures

