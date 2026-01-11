# Stripe Currency Conversion Verification Guide

## Purpose
This document outlines the steps to verify that Stripe's automatic currency conversion is properly configured for global pricing.

---

## ✅ Verification Steps

### 1. Access Stripe Dashboard
1. Log in to your Stripe Dashboard at https://dashboard.stripe.com
2. Navigate to your account settings

### 2. Enable Currency Conversion (if not already enabled)
1. Go to: **Settings → Payments → Currencies**
2. Under "Automatic currency conversion", ensure the following is enabled:
   - ✅ **"Enable automatic conversion"** - Should be ON
   - ✅ **"Display prices in customer's currency"** - Should be ON

### 3. Verify Payment Settings
1. Navigate to: **Settings → Payments → Payment methods**
2. Ensure international payment methods are enabled (if needed)
3. Check that your default currency is set to **AUD** (Australian Dollars)

### 4. Test Checkout Flow
1. Create a test checkout session with a price in AUD (e.g., AU$0.50)
2. Use a test payment method from a different country (e.g., US test card)
3. Verify that:
   - ✅ The checkout page shows the price in the customer's local currency (e.g., $0.33 USD)
   - ✅ The customer can complete payment in their local currency
   - ✅ You receive the payment in AUD in your Stripe account

---

## 📋 Expected Behavior

### What Users See:
- **On your website:** "AU$0.50"
- **At Stripe checkout:** "$0.33 USD" (or their local currency)

### What Happens Behind the Scenes:
- Stripe detects the customer's location/country
- Stripe converts AUD price to customer's local currency
- Customer pays in their local currency
- You receive payment in AUD in your account
- Stripe handles all FX conversion and fees

---

## ⚠️ Important Notes

1. **Exchange Rates:** Stripe uses real-time exchange rates, which may vary slightly
2. **Conversion Fees:** Stripe charges a small fee for currency conversion (check Stripe pricing)
3. **Default Currency:** Your default currency should be AUD (as defined in `payments.ts`)
4. **Test Mode:** Make sure to test in both test mode and live mode

---

## 🔍 Verification Checklist

- [ ] Automatic currency conversion is enabled in Stripe Dashboard
- [ ] Default currency is set to AUD
- [ ] Test checkout shows correct local currency for test user
- [ ] Payment processes successfully in local currency
- [ ] Funds are received in AUD in your account
- [ ] Exchange rate disclaimer is visible to users (via frontend implementation)

---

## 📝 Related Files

- `src/lib/ai-astrology/payments.ts` - Price definitions (all in AUD)
- `src/app/api/ai-astrology/create-checkout/route.ts` - Stripe checkout creation
- `src/app/ai-astrology/preview/page.tsx` - Price display with disclaimer

---

**Status:** Admin/Configuration task (not code)
**Priority:** High (must verify before global launch)
**Last Updated:** [Current Date]

