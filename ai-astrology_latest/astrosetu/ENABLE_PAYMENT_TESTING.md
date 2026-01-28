# Enable Payment Testing for Production Test Users

## Problem
Production test users (Amit Kumar Mandal, Ankita Surabhi) were bypassing Stripe payment flow, preventing payment flow testing.

## Solution
Added environment variable `BYPASS_PAYMENT_FOR_TEST_USERS` to control whether test users go through Stripe or bypass payment.

## Configuration

### To Enable Payment Testing (Recommended)

**Set in Vercel Environment Variables:**
```
BYPASS_PAYMENT_FOR_TEST_USERS=false
```

This will:
- ✅ Force test users through Stripe checkout
- ✅ Require actual payment verification
- ✅ Test full payment flow end-to-end
- ✅ Test payment capture/refund flows

### Default Behavior (Payment Bypass)

If `BYPASS_PAYMENT_FOR_TEST_USERS` is not set or set to `true`:
- ❌ Test users bypass Stripe (mock sessions)
- ❌ No actual payment flow testing
- ✅ Fast testing without payment setup

## Quick Setup for Payment Testing

1. **Set Environment Variable in Vercel:**
   ```
   BYPASS_PAYMENT_FOR_TEST_USERS=false
   ```

2. **Ensure Stripe Test Keys are Set:**
   ```
   STRIPE_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

3. **Test Users Still Restricted:**
   - Access restriction still applies (`NEXT_PUBLIC_RESTRICT_ACCESS=true`)
   - Only authorized users can access
   - But authorized users now go through Stripe payment flow

## Test Cards

Use these Stripe test cards for payment testing:

| Card Number | Purpose | Result |
|------------|---------|--------|
| `4242 4242 4242 4242` | ✅ Success | Payment succeeds |
| `5555 5555 5555 4444` | ✅ Success | Payment succeeds (Mastercard) |
| `4000 0025 0000 3155` | ⚠️ 3D Secure | Requires authentication |
| `4000 0000 0000 0002` | 🔴 Declined | Card declined |
| `4000 0000 0000 9995` | 🔴 Declined | Insufficient funds |

**All test cards:**
- CVV: `123` (any 3 digits)
- Expiry: `12/28` (any future date)
- ZIP: `12345` (any 5 digits)

## Test Scenarios

### Scenario 1: Successful Payment
1. Set `BYPASS_PAYMENT_FOR_TEST_USERS=false`
2. Login as test user (Amit or Ankita)
3. Select paid report
4. Use card: `4242 4242 4242 4242`
5. Complete checkout
6. **Expected:** Payment succeeds → Report generates → Payment captured

### Scenario 2: Payment → Report Fails → Refund
1. Set `BYPASS_PAYMENT_FOR_TEST_USERS=false`
2. Complete payment with test card
3. Simulate report failure (or let it fail naturally)
4. **Expected:** Payment canceled → No charge

### Scenario 3: 3D Secure
1. Use card: `4000 0025 0000 3155`
2. Complete payment
3. Click "Complete authentication" in modal
4. **Expected:** Payment proceeds

## Verification

After setting `BYPASS_PAYMENT_FOR_TEST_USERS=false`:

1. **Check Logs:**
   - Should see Stripe checkout creation (not mock session)
   - Should see payment verification
   - Should see payment capture after success

2. **Stripe Dashboard:**
   - Check test mode: https://dashboard.stripe.com/test
   - Verify payments are showing up
   - Check payment intents status

3. **User Experience:**
   - Test users should see Stripe checkout page
   - Should be able to enter test card details
   - Should go through normal payment flow

## Important Notes

1. **Access Restriction Still Active:**
   - `NEXT_PUBLIC_RESTRICT_ACCESS=true` still restricts access
   - Only authorized users (Amit, Ankita) can access
   - But they now go through Stripe payment flow

2. **Demo Mode Still Bypasses:**
   - `AI_ASTROLOGY_DEMO_MODE=true` still bypasses payment
   - Only affects test user detection, not demo mode

3. **Backward Compatible:**
   - Default behavior unchanged (bypass enabled)
   - Only changes when explicitly set to `false`

---

**Updated:** January 8, 2026

