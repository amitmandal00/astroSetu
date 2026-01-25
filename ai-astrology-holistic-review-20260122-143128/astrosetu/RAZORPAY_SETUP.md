# Razorpay Payment Gateway Setup Guide

## Overview

Razorpay is integrated for wallet recharge and payment processing. The integration supports both test and production modes.

## Step 1: Create Razorpay Account

1. Go to https://razorpay.com
2. Click "Sign Up" or "Get Started"
3. Complete registration
4. Complete KYC verification (required for live mode)

## Step 2: Get API Keys

### Test Mode (Development)
1. Log in to Razorpay Dashboard
2. Go to **Settings** → **API Keys**
3. Click **Generate Test Key**
4. Copy **Key ID** and **Key Secret**

### Live Mode (Production)
1. Complete KYC verification
2. Go to **Settings** → **API Keys**
3. Click **Generate Live Key**
4. Copy **Key ID** and **Key Secret**

## Step 3: Configure Environment Variables

Add to `.env.local`:

```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_SECRET=your_secret_key_here
```

**Important**: 
- Use test keys for development
- Use live keys for production
- Never commit keys to version control

## Step 4: Test the Integration

### Test Mode (Without Real Payment)
1. Don't set `RAZORPAY_KEY_ID` and `RAZORPAY_SECRET`
2. App will use mock payment mode
3. Payments will be simulated (no real money)

### With Test Keys
1. Set test keys in `.env.local`
2. Restart dev server
3. Go to Wallet page
4. Click "Add Money"
5. Use Razorpay test cards:
   - **Success**: `4111 1111 1111 1111`
   - **Failure**: `4000 0000 0000 0002`
   - CVV: Any 3 digits
   - Expiry: Any future date

## Payment Flow

1. **User clicks "Add Money"**
   - Opens payment modal
   - Enters amount

2. **Create Order** (`/api/payments/create-order`)
   - Server creates Razorpay order
   - Returns order ID

3. **Razorpay Checkout**
   - Opens Razorpay payment popup
   - User completes payment

4. **Verify Payment** (`/api/payments/verify`)
   - Server verifies payment signature
   - Creates transaction in database
   - Updates wallet balance

## API Endpoints

### Create Order
```
POST /api/payments/create-order
Body: { amount: number, currency?: string, description?: string }
Response: { ok: true, data: { id, amount, currency, receipt, status } }
```

### Verify Payment
```
POST /api/payments/verify
Body: { orderId, paymentId, signature, amount }
Response: { ok: true, data: { id, type, amount, description, timestamp } }
```

### Get Config
```
GET /api/payments/config
Response: { ok: true, data: { keyId, configured } }
```

## Security Features

1. **Payment Signature Verification**
   - All payments are verified server-side
   - Prevents payment tampering

2. **Order Creation**
   - Orders created server-side
   - Amount validated before payment

3. **Transaction Logging**
   - All transactions stored in database
   - Includes payment metadata

## Pricing

- **Setup Fee**: ₹0
- **Transaction Fee**: 2% per transaction
- **No Monthly Charges**: Pay per use

Check Razorpay website for current pricing.

## Webhook Setup (Optional)

For production, set up webhooks:
1. Go to Razorpay Dashboard → Webhooks
2. Add webhook URL: `https://yourdomain.com/api/payments/webhook`
3. Select events: `payment.captured`, `payment.failed`
4. Verify webhook signature in handler

## Troubleshooting

### Payment Not Working
- Check API keys are correct
- Verify keys match environment (test/live)
- Check browser console for errors
- Verify Razorpay script is loaded

### Signature Verification Failed
- Ensure `RAZORPAY_SECRET` is correct
- Check order ID and payment ID match
- Verify signature is from Razorpay

### Mock Mode
- If keys not set, app uses mock mode
- Payments are simulated
- Good for development/testing

## Notes

- Test mode allows unlimited test transactions
- Live mode requires KYC verification
- All amounts in paise (₹1 = 100 paise)
- Currency defaults to INR
- Minimum amount: ₹100
- Maximum amount: ₹100,000

---

**Status**: Integration complete! Works with or without Razorpay keys (mock mode for development).

