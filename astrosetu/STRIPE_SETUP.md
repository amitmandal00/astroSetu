# Stripe Payment Setup for AI Astrology Platform

## Overview

The AI Astrology platform uses Stripe for secure payment processing. This guide explains how to set up Stripe for your deployment.

## Step 1: Create Stripe Account

1. Go to https://stripe.com
2. Click "Sign up" or "Start now"
3. Complete registration
4. Complete account verification (required for live mode)

## Step 2: Get API Keys

### Test Mode (Development)

1. Log in to Stripe Dashboard
2. Go to **Developers** → **API keys**
3. Toggle "Test mode" to ON (if not already on)
4. Copy **Publishable key** (starts with `pk_test_...`)
5. Click **Reveal test key** and copy **Secret key** (starts with `sk_test_...`)

### Live Mode (Production)

1. Complete account verification
2. Go to **Developers** → **API keys**
3. Toggle "Test mode" to OFF
4. Copy **Publishable key** (starts with `pk_live_...`)
5. Click **Reveal live key** and copy **Secret key** (starts with `sk_live_...`)

## Step 3: Configure Environment Variables

Add to `.env.local` (for local development) or your hosting platform's environment variables:

```bash
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here

# Your app URL (for redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

For production, use live keys:
```bash
STRIPE_SECRET_KEY=sk_live_your_live_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## Step 4: Install Stripe Package

The Stripe package is already included in `package.json`. If you need to reinstall:

```bash
npm install stripe
```

## Step 5: Test the Integration

### With Test Keys

1. Set test keys in `.env.local`
2. Restart dev server
3. Navigate to `/ai-astrology/input?report=marriage-timing`
4. Fill form and submit
5. Click "Purchase" button
6. Use Stripe test card:
   - **Card number**: `4242 4242 4242 4242`
   - **Expiry**: Any future date (e.g., `12/34`)
   - **CVC**: Any 3 digits (e.g., `123`)
   - **ZIP**: Any 5 digits (e.g., `12345`)

### Test Card Numbers

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires authentication**: `4000 0025 0000 3155`

More test cards: https://stripe.com/docs/testing

## Payment Flow

1. **User selects paid report** → Fills birth details
2. **Preview page shows** → Payment required prompt
3. **User clicks "Purchase"** → Creates Stripe checkout session
4. **Stripe checkout opens** → User completes payment
5. **Payment success** → Redirects to `/ai-astrology/payment/success`
6. **Payment verified** → Report is unlocked
7. **Report generated** → User sees full report

## Pricing

| Report Type | Price | Status |
|-------------|-------|--------|
| Life Summary | FREE | ✅ No payment required |
| Marriage Timing | $29.00 | ✅ Payment required |
| Career & Money | $29.00 | ✅ Payment required |
| Full Life | $49.00 | ✅ Payment required |
| Premium Subscription | $9.99/month | ⚠️ Coming soon |

## Webhook Setup (Optional, for production)

For production, set up webhooks to handle payment events securely:

1. Go to **Developers** → **Webhooks** in Stripe Dashboard
2. Click **Add endpoint**
3. Enter your webhook URL: `https://yourdomain.com/api/ai-astrology/webhook`
4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the webhook signing secret

Add to `.env.local`:
```bash
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

## Troubleshooting

### "Payment processing not configured"
- Make sure `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` are set
- Restart dev server after adding keys

### "Invalid API key"
- Check that keys match (test keys together, live keys together)
- Ensure no extra spaces or quotes in `.env.local`

### Payment succeeds but report not unlocked
- Check browser console for errors
- Verify payment verification endpoint is working
- Check sessionStorage for `aiAstrologyPaymentVerified`

### Redirect URLs not working
- Ensure `NEXT_PUBLIC_APP_URL` is set correctly
- For local dev, use `http://localhost:3000` (or your port)
- For production, use your full domain with `https://`

## Security Notes

- ✅ Never commit API keys to version control
- ✅ Use test keys for development
- ✅ Use environment variables, not hardcoded keys
- ✅ Enable HTTPS in production
- ✅ Verify payments server-side (already implemented)

## Next Steps

- Set up webhooks for production (recommended)
- Add subscription management
- Add receipt email templates
- Add refund handling (if needed)

---

**Last Updated**: January 2025

