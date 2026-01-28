# 💳 E2E Payment Testing Guide - AI Astrology Reports

**Complete guide to test the payment flow like a production user**

---

## 📋 Prerequisites

### 1. Environment Setup

Make sure you have Stripe test keys configured:

```bash
# In your .env.local or Vercel environment variables:
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
```

**Get Stripe Test Keys:**
1. Go to: https://dashboard.stripe.com/test/apikeys
2. Copy **Publishable key** (starts with `pk_test_`)
3. Click **Reveal test key** and copy **Secret key** (starts with `sk_test_`)

---

## 🎯 Testing Options

### Option 1: Demo Mode (No Stripe Required) ⚡
**Bypasses payment completely - instant access**

**Setup:**
```bash
# In .env.local
AI_ASTROLOGY_DEMO_MODE=true
```

**How it works:**
- No Stripe checkout
- No payment required
- Reports generate immediately
- Perfect for quick testing

**Limitation:** Doesn't test actual Stripe integration

---

### Option 2: Test User Mode (No Payment) 🧪
**Uses specific test user credentials**

**Test User Details:**
- **Name**: `Amit Kumar Mandal`
- **DOB**: `1984-11-26` or `26/11/1984` or `26-11-1984`
- **Time**: `21:40` or `9:40 PM` or `09:40 PM`
- **Place**: `Noamundi` (any case)
- **Gender**: `Male`

**How it works:**
- Enter these exact details
- Bypasses Stripe payment
- Generates report immediately
- Tests full flow except payment

---

### Option 3: Full Stripe Test Mode (Recommended for E2E) 💳
**Tests complete payment flow with Stripe test cards**

**Setup:**
1. Make sure `AI_ASTROLOGY_DEMO_MODE` is **NOT** set (or set to `false`)
2. Ensure Stripe test keys are configured
3. Use Stripe test card numbers (see below)

---

## 💳 Stripe Test Card Numbers

### ✅ Successful Payment Cards

| Card Number | Type | Result |
|-------------|------|--------|
| `4242 4242 4242 4242` | Visa | ✅ Success |
| `5555 5555 5555 4444` | Mastercard | ✅ Success |
| `3782 822463 10005` | Amex | ✅ Success |
| `6011 1111 1111 1117` | Discover | ✅ Success |

**Test Details:**
- **Expiry**: Any future date (e.g., `12/34`)
- **CVC**: Any 3-4 digits (e.g., `123`)
- **ZIP/Postal**: Any 5 digits (e.g., `12345`)
- **Name**: Any name

### ❌ Failed Payment Cards

| Card Number | Type | Result |
|-------------|------|--------|
| `4000 0000 0000 0002` | Visa | ❌ Card declined |
| `4000 0000 0000 9995` | Visa | ❌ Insufficient funds |

### 🔄 3D Secure Cards (Requires Authentication)

| Card Number | Type | Action |
|-------------|------|--------|
| `4000 0027 6000 3184` | Visa | Requires 3D Secure |
| `4000 0025 0000 3155` | Visa | Requires 3D Secure |

**For 3D Secure:**
- Use authentication code: `112233`

---

## 🚀 Step-by-Step Testing Guide

### Test 1: Single Report Purchase

1. **Navigate to AI Section**
   ```
   https://your-domain.com/ai-astrology
   ```

2. **Click on any report** (e.g., "Marriage Timing Report")

3. **Enter Birth Details**
   - Name: Any name (or test user name for bypass)
   - DOB: Any date
   - Time: Any time
   - Place: Any location
   - Gender: Select gender

4. **Click "Generate Report"**

5. **Preview Page Appears**
   - Should see 35% free preview
   - "Upgrade to Full Report" button visible

6. **Click "Upgrade to Full Report"**

7. **Stripe Checkout Opens**
   - Should show: AU$0.50
   - Product: "AstroSetu AI – [Report Name]"

8. **Enter Test Card**
   ```
   Card: 4242 4242 4242 4242
   Expiry: 12/34
   CVC: 123
   ZIP: 12345
   ```

9. **Click "Pay"**

10. **Success Page**
    - Redirected to `/ai-astrology/payment/success`
    - Should see "Payment Successful"
    - Report should generate automatically

11. **Verify Report**
    - Full report should be visible
    - No "Upgrade" buttons
    - Can download PDF

---

### Test 2: Bundle Purchase

1. **Navigate to Bundle Page**
   ```
   https://your-domain.com/ai-astrology/bundle
   ```

2. **Select a Bundle**
   - "Any 2 Reports"
   - "All 3 Reports"
   - "Life Decision Pack"

3. **Enter Birth Details**
   - Fill all required fields

4. **Click "Purchase Bundle"**

5. **Stripe Checkout**
   - Shows bundle price: AU$0.50
   - Description includes bundle name

6. **Complete Payment**
   - Use test card: `4242 4242 4242 4242`
   - Complete checkout

7. **Verify Bundle Reports**
   - All reports in bundle should be accessible
   - Can switch between reports
   - Each report is fully unlocked

---

### Test 3: Subscription Purchase

1. **Navigate to Subscription Page**
   ```
   https://your-domain.com/ai-astrology/subscription
   ```

2. **Enter Birth Details**

3. **Click "Subscribe"**

4. **Stripe Checkout**
   - Shows: AU$0.01/month
   - Description: "Monthly AI Astrology Outlook"

5. **Complete Payment**
   - Use test card
   - Complete checkout

6. **Verify Subscription**
   - Should redirect to subscription dashboard
   - Daily guidance should be accessible

---

### Test 4: Payment Cancellation

1. **Start Report Purchase**
   - Go through steps 1-6 from Test 1

2. **Open Stripe Checkout**

3. **Click "Cancel" or Close Window**

4. **Verify Cancellation**
   - Should redirect to `/ai-astrology/payment/cancel`
   - Should show cancellation message
   - User should be able to try again

---

## ✅ Verification Checklist

### Payment Flow
- [ ] Stripe checkout opens correctly
- [ ] Correct price displayed (AU$0.50 for reports)
- [ ] Correct product description shown
- [ ] Payment processes successfully
- [ ] Success redirect works
- [ ] Report generates after payment
- [ ] PDF download works

### Error Handling
- [ ] Invalid card number shows error
- [ ] Declined card shows error
- [ ] Cancellation works correctly
- [ ] Network errors handled gracefully

### Metadata & Receipts
- [ ] Check Stripe Dashboard → Payments
- [ ] Verify payment metadata includes:
  - `report_type`
  - `user_id`
  - `timestamp`
- [ ] Receipt email sent (if configured)
- [ ] Invoice generated correctly

### Edge Cases
- [ ] Test with 3D Secure card
- [ ] Test with different currencies (if applicable)
- [ ] Test bundle purchases
- [ ] Test subscription flow
- [ ] Test multiple purchases in session

---

## 🔍 Debugging Tips

### Check Stripe Dashboard

1. **View Payments**
   - Go to: https://dashboard.stripe.com/test/payments
   - Should see all test payments
   - Check metadata, amount, status

2. **View Checkout Sessions**
   - Go to: https://dashboard.stripe.com/test/checkout/sessions
   - Verify session details
   - Check customer info

3. **View Logs**
   - Check browser console for errors
   - Check Vercel function logs
   - Check Stripe webhook logs (if configured)

### Common Issues

**Issue: Checkout doesn't open**
- ✅ Check Stripe keys are set
- ✅ Verify keys are test keys (not live)
- ✅ Check browser console for errors
- ✅ Verify `AI_ASTROLOGY_DEMO_MODE` is not set

**Issue: Payment succeeds but report doesn't generate**
- ✅ Check `/api/ai-astrology/verify-payment` endpoint
- ✅ Verify redirect URL is correct
- ✅ Check session_id in URL
- ✅ Check Vercel logs for errors

**Issue: Wrong price displayed**
- ✅ Check `lib/payments.ts` prices
- ✅ Verify currency is AUD
- ✅ Clear browser cache
- ✅ Check Stripe product configuration

---

## 📊 Test Scenarios Matrix

| Scenario | Demo Mode | Test User | Stripe Test | Expected Result |
|----------|-----------|-----------|-------------|-----------------|
| Single Report | ✅ | ✅ | ✅ | Report generated |
| Bundle Purchase | ✅ | ✅ | ✅ | All reports unlocked |
| Subscription | ✅ | ✅ | ✅ | Subscription active |
| Payment Cancel | ❌ | ❌ | ✅ | Cancel page shown |
| Failed Payment | ❌ | ❌ | ✅ | Error message |
| 3D Secure | ❌ | ❌ | ✅ | Auth required |

---

## 🎬 Quick Test Script

**Fastest way to test complete flow:**

1. **Set Demo Mode** (if testing without Stripe)
   ```bash
   AI_ASTROLOGY_DEMO_MODE=true
   ```

2. **Or Use Test User**
   - Name: `Amit Kumar Mandal`
   - DOB: `1984-11-26`
   - Time: `21:40`
   - Place: `Noamundi`
   - Gender: `Male`

3. **Navigate & Purchase**
   - Go to `/ai-astrology`
   - Select any report
   - Enter details (or test user details)
   - Click through to checkout
   - Complete payment (or auto-bypass if demo/test user)

4. **Verify Report**
   - Should see full report
   - Can download PDF
   - No upgrade prompts

---

## 🔗 Test URLs

### Local Development
```
http://localhost:3000/ai-astrology
http://localhost:3000/ai-astrology/input?reportType=marriage-timing
http://localhost:3000/ai-astrology/bundle
http://localhost:3000/ai-astrology/subscription
```

### Production/Preview
```
https://your-vercel-url.vercel.app/ai-astrology
https://your-vercel-url.vercel.app/ai-astrology/payment/success
https://your-vercel-url.vercel.app/ai-astrology/payment/cancel
```

---

## 📝 Testing Checklist

### Pre-Production Checklist
- [ ] All test scenarios completed
- [ ] Stripe test payments working
- [ ] Error handling verified
- [ ] Cancellation flow tested
- [ ] Bundle purchases tested
- [ ] Subscription flow tested
- [ ] PDF downloads working
- [ ] Receipt emails working (if configured)
- [ ] Metadata correct in Stripe dashboard
- [ ] Mobile responsive tested
- [ ] Different browsers tested

### Production Readiness
- [ ] Switch to Stripe live keys (when ready)
- [ ] Update prices from AU$0.50 to production prices
- [ ] Remove or disable demo mode
- [ ] Remove test user bypass (optional)
- [ ] Test with real card (small amount)
- [ ] Verify webhook endpoints
- [ ] Set up monitoring/alerts

---

## 🚨 Important Notes

1. **Test Mode Only**: Always use Stripe test keys (`sk_test_`, `pk_test_`) for testing
2. **No Real Charges**: Test cards never charge real money
3. **Demo Mode**: Set `AI_ASTROLOGY_DEMO_MODE=true` to bypass all payments
4. **Test User**: Specific credentials bypass payment automatically
5. **Production**: Switch to live keys and real prices only when ready

---

**Ready to test!** Start with Option 1 (Demo Mode) for quick testing, then move to Option 3 (Full Stripe Test) for complete E2E validation.

