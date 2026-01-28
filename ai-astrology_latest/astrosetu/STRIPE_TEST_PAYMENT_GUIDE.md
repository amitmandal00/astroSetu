# 🧪 Stripe Test Payment Setup for Production Testing

**Purpose**: Test end-to-end payment flows like a real production user without actual charges

---

## 🎯 **Stripe Test Cards**

### **✅ Successful Payments**

#### **Card Number: `4242 4242 4242 4242`**
- **CVV**: Any 3 digits (e.g., `123`)
- **Expiry**: Any future date (e.g., `12/28`)
- **ZIP**: Any 5 digits (e.g., `12345`)
- **Result**: Payment succeeds immediately

#### **Card Number: `5555 5555 5555 4444`**
- **CVV**: Any 3 digits
- **Expiry**: Any future date
- **ZIP**: Any 5 digits
- **Result**: Payment succeeds (Mastercard)

#### **Card Number: `4000 0025 0000 3155`**
- **CVV**: Any 3 digits
- **Expiry**: Any future date
- **ZIP**: Any 5 digits
- **Result**: Requires 3D Secure authentication (SCA)

---

### **🔴 Declined Payments**

#### **Card Number: `4000 0000 0000 0002`**
- **Result**: Card declined (generic decline)

#### **Card Number: `4000 0000 0000 9995`**
- **Result**: Insufficient funds

#### **Card Number: `4000 0000 0000 9987`**
- **Result**: Lost card

#### **Card Number: `4000 0000 0000 0069`**
- **Result**: Expired card

---

### **⚠️ Authentication Required (3D Secure)**

#### **Card Number: `4000 0025 0000 3155`**
- **Result**: Requires 3D Secure authentication
- **Test**: Click "Complete authentication" in Stripe test modal

#### **Card Number: `4000 0027 6000 3184`**
- **Result**: Requires 3D Secure (alternative)

---

### **🔄 Requires Capture (Manual Capture)**

#### **Card Number: `4242 4242 4242 4242`**
- **With**: `capture_method: "manual"` in checkout
- **Result**: Payment authorized but not captured (perfect for our use case!)

---

## 🔧 **Stripe Test Mode Setup**

### **Step 1: Enable Test Mode in Stripe Dashboard**

1. Go to: https://dashboard.stripe.com/test
2. **Toggle**: Switch to "Test mode" (top right)
3. **Note**: Test mode uses separate API keys

### **Step 2: Get Test API Keys**

1. Go to: https://dashboard.stripe.com/test/apikeys
2. **Publishable Key**: Starts with `pk_test_...`
3. **Secret Key**: Starts with `sk_test_...`
4. **Copy both keys**

### **Step 3: Update Vercel Environment Variables**

**For Testing** (use test keys):
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51SiuJBLdgH7zpsQH...
STRIPE_SECRET_KEY=sk_test_51SiuJBLdgH7zpsQH...
```

**For Production** (use live keys):
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51SiuJBLdgH7zpsQH...
STRIPE_SECRET_KEY=sk_live_51SiuJBLdgH7zpsQH...
```

---

## 🧪 **Complete Test Scenarios**

### **Scenario 1: Successful Payment → Report Generated**

**Steps**:
1. Fill in birth details (Amit Kumar Mandal or Ankita Surabhi)
2. Select paid report type (e.g., Year Analysis)
3. Click "Pay Now"
4. On Stripe checkout:
   - Card: `4242 4242 4242 4242`
   - Expiry: `12/28`
   - CVV: `123`
   - ZIP: `12345`
5. Click "Pay"
6. **Expected**:
   - ✅ Payment succeeds
   - ✅ Redirected to success page
   - ✅ Auto-redirected to preview
   - ✅ Report generates automatically
   - ✅ Payment captured after report success
   - ✅ Report viewable/downloadable

---

### **Scenario 2: Payment → Report Generation Fails → Refund**

**Steps**:
1. Use test card: `4242 4242 4242 4242`
2. Complete payment
3. Simulate report failure (or let it timeout)
4. **Expected**:
   - ✅ Payment authorized (not captured yet)
   - ✅ Report generation fails
   - ✅ Payment automatically cancelled/refunded
   - ✅ User sees error message
   - ✅ No money deducted

---

### **Scenario 3: 3D Secure Authentication**

**Steps**:
1. Use card: `4000 0025 0000 3155`
2. Complete payment
3. **Expected**:
   - ✅ 3D Secure modal appears
   - ✅ Click "Complete authentication"
   - ✅ Payment proceeds
   - ✅ Report generates

---

### **Scenario 4: Declined Payment**

**Steps**:
1. Use card: `4000 0000 0000 0002`
2. Complete payment
3. **Expected**:
   - ✅ Payment declined
   - ✅ Error message shown
   - ✅ No checkout session created
   - ✅ User stays on payment page

---

## 📋 **Quick Test Card Reference**

| Card Number | Purpose | Result |
|-------------|---------|--------|
| `4242 4242 4242 4242` | ✅ Success | Payment succeeds |
| `5555 5555 5555 4444` | ✅ Success | Payment succeeds (Mastercard) |
| `4000 0025 0000 3155` | ⚠️ 3D Secure | Requires authentication |
| `4000 0000 0000 0002` | 🔴 Declined | Card declined |
| `4000 0000 0000 9995` | 🔴 Declined | Insufficient funds |
| `4000 0027 6000 3184` | ⚠️ 3D Secure | Requires authentication |

**All cards**:
- **CVV**: Any 3 digits (e.g., `123`)
- **Expiry**: Any future date (e.g., `12/28`)
- **ZIP**: Any 5 digits (e.g., `12345`)
- **Name**: Any name (e.g., `Test User`)

---

## 🔍 **Testing Manual Capture Flow**

### **Current Implementation**:
- Payment uses `capture_method: "manual"`
- Payment authorized but not captured until report succeeds

### **Test Steps**:

1. **Complete Payment**:
   - Use card: `4242 4242 4242 4242`
   - Complete checkout

2. **Check Stripe Dashboard**:
   - Go to: https://dashboard.stripe.com/test/payments
   - Find payment
   - Status should be: **"Authorized"** (not "Captured")

3. **Generate Report**:
   - Report generates successfully
   - Payment should auto-capture

4. **Verify Capture**:
   - Check Stripe Dashboard
   - Status should be: **"Captured"**

5. **Test Failure**:
   - Simulate report failure
   - Check Stripe Dashboard
   - Status should be: **"Canceled"**

---

## 🎯 **Production-Like Testing Checklist**

### **✅ Payment Flow**:
- [ ] Test successful payment with `4242 4242 4242 4242`
- [ ] Test 3D Secure with `4000 0025 0000 3155`
- [ ] Test declined payment with `4000 0000 0000 0002`
- [ ] Verify payment status in Stripe Dashboard

### **✅ Report Generation**:
- [ ] Test successful report generation after payment
- [ ] Test report failure → payment cancellation
- [ ] Verify payment capture on success
- [ ] Verify payment cancellation on failure

### **✅ Edge Cases**:
- [ ] Test mobile payment flow
- [ ] Test payment timeout
- [ ] Test network failure during payment
- [ ] Test duplicate payment attempts

### **✅ User Experience**:
- [ ] Verify auto-redirect after payment
- [ ] Verify auto-generation trigger
- [ ] Verify error messages
- [ ] Verify recovery mechanisms

---

## 📊 **Monitoring Test Payments**

### **Stripe Dashboard**:
1. Go to: https://dashboard.stripe.com/test/payments
2. Filter by:
   - **Status**: Authorized, Captured, Canceled
   - **Date**: Last 24 hours
   - **Amount**: Filter by test amount

### **Test Payment Details**:
- **Payment Intent ID**: `pi_test_...`
- **Session ID**: `cs_test_...`
- **Status**: Authorized → Captured (success) or Canceled (failure)

---

## ⚠️ **Important Notes**

### **Test Mode vs Live Mode**:

1. **Test Mode**:
   - Uses `pk_test_...` and `sk_test_...`
   - All payments are simulated
   - No real money charged
   - Perfect for testing

2. **Live Mode**:
   - Uses `pk_live_...` and `sk_live_...`
   - Real payments
   - Real money charged
   - Use only when ready

### **Test Cards Only Work in Test Mode**:
- Test cards (e.g., `4242 4242 4242 4242`) only work in Stripe test mode
- If using live keys, test cards will fail
- Always verify you're in test mode before testing

### **Payment Authorization Expiry**:
- Authorized payments expire after 7 days
- Reports must be generated within 7 days
- After expiry, payment cannot be captured

---

## 🚀 **Quick Start Testing**

### **1. Setup Test Mode**:
```bash
# Update Vercel environment variables
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

### **2. Use Test Card**:
- Card: `4242 4242 4242 4242`
- Expiry: `12/28`
- CVV: `123`
- ZIP: `12345`

### **3. Complete Payment Flow**:
- Fill birth details
- Select paid report
- Complete Stripe checkout
- Verify report generates
- Check Stripe Dashboard for payment status

---

## 📝 **Testing Script**

### **Complete End-to-End Test**:

1. **Start**: Navigate to `/ai-astrology`
2. **Input**: Enter birth details (Amit Kumar Mandal)
3. **Select**: Year Analysis Report (paid)
4. **Pay**: Use test card `4242 4242 4242 4242`
5. **Verify**: Payment succeeds → Report generates → Payment captured

### **Test Failure Scenario**:
1. **Start**: Same as above
2. **Pay**: Use test card
3. **Simulate**: Report generation failure (or timeout)
4. **Verify**: Payment canceled → No charge → Error shown

---

## 🔗 **Useful Links**

- **Stripe Test Dashboard**: https://dashboard.stripe.com/test
- **Test Cards**: https://stripe.com/docs/testing#cards
- **Test API Keys**: https://dashboard.stripe.com/test/apikeys
- **Payment Intents**: https://dashboard.stripe.com/test/payments
- **Webhooks**: https://dashboard.stripe.com/test/webhooks

---

**Last Updated**: January 6, 2026  
**Status**: ✅ Ready for Testing  
**Priority**: 🔴 **CRITICAL**

