# Fix: Enable Payment Testing for Test Users (Amit & Ankita)

## Issue
Test users (Amit Kumar Mandal and Ankita Surabhi) are not getting payment windows - they're bypassing Stripe checkout.

## Root Cause
The `BYPASS_PAYMENT_FOR_TEST_USERS` environment variable defaults to `true` if not explicitly set, causing test users to bypass payment.

## Solution

### Step 1: Set Environment Variable in Vercel

1. Go to Vercel Dashboard: https://vercel.com/dashboard
2. Select your project: `astrosetu` (or your project name)
3. Go to **Settings** → **Environment Variables**
4. Add/Update the following variable:

   **Variable Name:** `BYPASS_PAYMENT_FOR_TEST_USERS`  
   **Value:** `false`  
   **Environment:** Production, Preview, Development

5. Click **Save**
6. **Redeploy** the application (or wait for next deployment)

### Step 2: Verify the Setting

After deployment, check Vercel logs:
- The code will log: `[DEMO MODE] Returning mock checkout session` if bypass is enabled
- If you see Stripe checkout URL being returned, payment testing is working

### Step 3: Test Payment Flow

1. **For Amit Kumar Mandal:**
   - Name: Amit Kumar Mandal
   - DOB: 26/11/1984
   - Time: 21:40
   - Place: Noamundi, Jharkhand, India
   - Gender: Male

2. **For Ankita Surabhi:**
   - Name: Ankita Surabhi
   - DOB: (will match flexibly)
   - Time: (will match flexibly)
   - Place: (should contain "Delhi")
   - Gender: Female

3. **Expected Behavior:**
   - After setting `BYPASS_PAYMENT_FOR_TEST_USERS=false`, test users should:
     - See Stripe checkout window
     - Complete payment with test cards
     - Go through full payment verification flow

## Code Changes

The code has been updated to:
1. ✅ Support both Amit and Ankita as test users
2. ✅ Use flexible matching for Ankita (name-based primary, other fields flexible)
3. ✅ Respect `BYPASS_PAYMENT_FOR_TEST_USERS=false` setting

## Test Cards for Payment Testing

Use these Stripe test cards:

### Successful Payment
- **Card:** 4242 4242 4242 4242
- **CVV:** Any 3 digits (e.g., 123)
- **Expiry:** Any future date (e.g., 12/28)
- **ZIP:** Any 5 digits (e.g., 12345)

### 3D Secure Required
- **Card:** 4000 0025 0000 3155
- **CVV:** Any 3 digits
- **Expiry:** Any future date
- **ZIP:** Any 5 digits
- **Action:** Complete authentication in modal

### Declined Cards
- **Card:** 4000 0000 0000 0002 (Card declined)
- **Card:** 4000 0000 0000 9995 (Insufficient funds)

## Verification

After setting the environment variable:

1. ✅ Check Vercel environment variables dashboard
2. ✅ Redeploy application
3. ✅ Test with Amit Kumar Mandal credentials
4. ✅ Test with Ankita Surabhi credentials
5. ✅ Verify Stripe checkout window appears
6. ✅ Complete test payment
7. ✅ Verify report generation after payment

## Troubleshooting

### If payment window still doesn't appear:

1. **Check Vercel logs:**
   ```bash
   # In Vercel dashboard → Deployment → Functions → Logs
   # Look for: [DEMO MODE] or [CHECKOUT CREATION]
   ```

2. **Verify environment variable:**
   - Variable name must be exactly: `BYPASS_PAYMENT_FOR_TEST_USERS`
   - Value must be exactly: `false` (lowercase)
   - Must be set for Production environment

3. **Check if demo mode is enabled:**
   - If `AI_ASTROLOGY_DEMO_MODE=true`, payment will be bypassed
   - Ensure this is `false` or not set for production

4. **Verify test user matching:**
   - Check Vercel logs for: `test user: true` or `test user: false`
   - Ensure name matches exactly (case-insensitive)

## Current Status

✅ **Code Updated:**
- Test user check now supports both Amit and Ankita
- Flexible matching for Ankita's details

⏳ **Action Required:**
- Set `BYPASS_PAYMENT_FOR_TEST_USERS=false` in Vercel
- Redeploy application
- Test payment flow

---

**Note:** If Ankita's exact DOB, time, or place is different, update the test user array in `create-checkout/route.ts` with correct values.

