# ⚡ Quick Payment Testing Reference

**Fast reference for testing AI astrology reports payment flow**

---

## 🚀 Fastest Test Options

### Option 1: Demo Mode (Instant - No Payment)
```bash
# Set in .env.local
AI_ASTROLOGY_DEMO_MODE=true
```
✅ **No Stripe required**  
✅ **Instant report generation**  
❌ **Doesn't test payment flow**

---

### Option 2: Test User (Instant - No Payment)
Use these exact details:
```
Name: Amit Kumar Mandal
DOB: 1984-11-26
Time: 21:40
Place: Noamundi
Gender: Male
```
✅ **No Stripe required**  
✅ **Full flow except payment**  
✅ **Tests report generation**

---

### Option 3: Stripe Test Cards (Full E2E)

**Success Card:**
```
Card: 4242 4242 4242 4242
Expiry: 12/34
CVC: 123
ZIP: 12345
```

**Decline Card (Test Errors):**
```
Card: 4000 0000 0000 0002
Expiry: 12/34
CVC: 123
```

---

## 📍 Test URLs

### Your Vercel Preview:
```
https://astrosetu-gzj8ype0p-amits-projects-a49d49fa.vercel.app/ai-astrology
```

**Key Pages:**
- Landing: `/ai-astrology`
- Input Form: `/ai-astrology/input?reportType=marriage-timing`
- Preview: `/ai-astrology/preview`
- Bundle: `/ai-astrology/bundle`
- Subscription: `/ai-astrology/subscription`

---

## ✅ Quick Test Flow (2 minutes)

1. **Go to**: `https://astrosetu-gzj8ype0p-amits-projects-a49d49fa.vercel.app/ai-astrology`

2. **Click any report** (e.g., "Marriage Timing Report")

3. **Enter details:**
   - **Quick Option**: Use test user details (bypasses payment)
   - **Full Test**: Use any details + Stripe test card

4. **Preview appears** → Click "Upgrade to Full Report"

5. **Stripe checkout** → Enter test card: `4242 4242 4242 4242`

6. **Success** → Report generates automatically

---

## 💰 Current Prices (Testing)

- **Individual Reports**: AU$0.50
- **Bundles**: AU$0.50
- **Subscription**: AU$0.01/month

**Note**: These are testing prices. Update to production prices when ready.

---

## 🔑 Required Environment Variables

```bash
# Stripe Test Keys (for real payment testing)
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx

# Optional: Demo mode (bypasses payment)
AI_ASTROLOGY_DEMO_MODE=true
```

**Get Stripe Test Keys:**
- https://dashboard.stripe.com/test/apikeys

---

## 🎯 What to Test

### Essential Tests
- [ ] Single report purchase
- [ ] Bundle purchase
- [ ] Payment success flow
- [ ] Payment cancellation
- [ ] Report generation after payment
- [ ] PDF download

### Edge Cases
- [ ] Failed payment (use decline card)
- [ ] 3D Secure (use `4000 0027 6000 3184`)
- [ ] Multiple purchases in one session
- [ ] Subscription purchase

---

## 🐛 Quick Troubleshooting

**Checkout doesn't open?**
- ✅ Check Stripe keys are set
- ✅ Verify keys start with `sk_test_` and `pk_test_`
- ✅ Check `AI_ASTROLOGY_DEMO_MODE` is not set (unless testing demo)

**Payment succeeds but no report?**
- ✅ Check Vercel function logs
- ✅ Verify redirect URL has `session_id`
- ✅ Check `/api/ai-astrology/verify-payment` endpoint

**Wrong price?**
- ✅ Check `lib/payments.ts`
- ✅ Clear browser cache
- ✅ Verify currency is AUD

---

## 📊 Verify in Stripe Dashboard

After testing, check:
1. **Payments**: https://dashboard.stripe.com/test/payments
   - Should see test payments
   - Check metadata includes `report_type`, `user_id`

2. **Checkout Sessions**: https://dashboard.stripe.com/test/checkout/sessions
   - Verify session details
   - Check amounts match

---

**Full Guide**: See `E2E_PAYMENT_TESTING_GUIDE.md` for complete details

