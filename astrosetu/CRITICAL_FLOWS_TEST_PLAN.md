# 🧪 Critical Flows Test Plan - High Priority

**Focus**: Payment & Report Generation - Web & Mobile  
**Priority**: 🔴 **CRITICAL**  
**Date**: January 6, 2026

---

## 🎯 **TESTING SCOPE**

### **Critical Flows to Test**:
1. ✅ Payment Flow (Stripe checkout)
2. ✅ Payment Verification
3. ✅ Report Generation After Payment
4. ✅ Token Persistence/Loss Scenarios
5. ✅ Mobile-Specific Issues
6. ✅ Error Handling & Edge Cases

---

## 🔴 **TEST 1: Payment Flow - Web Browser**

### **Test Steps**:

1. **Initial Purchase**:
   - [ ] Go to `/ai-astrology`
   - [ ] Select "Year Analysis Report" (or any paid report)
   - [ ] Fill in birth details
   - [ ] Click "Generate Report"
   - [ ] Complete Stripe checkout (use test card: `4242 4242 4242 4242`)
   - [ ] **Verify**: Redirects to success page

2. **Payment Verification**:
   - [ ] Check success page shows "Payment Successful!"
   - [ ] **Verify**: `sessionStorage` has:
     - `aiAstrologyPaymentToken`
     - `aiAstrologyPaymentVerified = "true"`
     - `aiAstrologyPaymentSessionId`
     - `aiAstrologyReportType`
   - [ ] **Verify**: URL includes `session_id` parameter

3. **Report Generation**:
   - [ ] Click "View My Report Now" (or auto-redirect)
   - [ ] **Verify**: Redirects to `/ai-astrology/preview?session_id=xxx`
   - [ ] **Verify**: Report generates automatically
   - [ ] **Verify**: Report content displays correctly
   - [ ] **Verify**: PDF download works

**Expected Result**: ✅ Payment → Verification → Report Generated

---

## 📱 **TEST 2: Payment Flow - Mobile Browser**

### **Test Steps** (Safari iOS / Chrome Android):

1. **Initial Purchase**:
   - [ ] Open mobile browser (Safari/Chrome)
   - [ ] Navigate to `/ai-astrology`
   - [ ] Select report and fill details
   - [ ] Complete payment (Apple Pay if iOS, or card)
   - [ ] **Verify**: Payment succeeds

2. **Payment Verification** (Critical):
   - [ ] **Verify**: Success page loads
   - [ ] Check `sessionStorage`:
     - [ ] Open DevTools (mobile: use remote debugging or Safari Web Inspector)
     - [ ] Check if `aiAstrologyPaymentToken` exists
   - [ ] **Verify**: URL includes `session_id`

3. **Simulate Token Loss** (Critical Test):
   - [ ] Clear `sessionStorage` (or close/reopen tab)
   - [ ] Click "View My Report Now"
   - [ ] **CRITICAL VERIFY**: Report still generates
   - [ ] **Verify**: Token regenerated from `session_id`

4. **Report Generation**:
   - [ ] **Verify**: Report generates even after token loss
   - [ ] **Verify**: Report content displays on mobile
   - [ ] **Verify**: PDF download works on mobile

**Expected Result**: ✅ Payment → Token Lost → Still Works via `session_id` Fallback

---

## 🔄 **TEST 3: Token Loss Scenarios**

### **Scenario 3.1: SessionStorage Cleared**

1. **Steps**:
   - [ ] Complete payment successfully
   - [ ] Open browser console
   - [ ] Run: `sessionStorage.clear()`
   - [ ] Navigate to preview page with `session_id` in URL
   - [ ] **Verify**: Token regenerated automatically
   - [ ] **Verify**: Report generates

**Expected**: ✅ Should recover automatically

---

### **Scenario 3.2: Tab Closed/Reopened**

1. **Steps**:
   - [ ] Complete payment
   - [ ] Copy preview URL with `session_id`
   - [ ] Close browser tab
   - [ ] Open new tab
   - [ ] Paste URL
   - [ ] **Verify**: Report generates (token regenerated)

**Expected**: ✅ Should work via `session_id` in URL

---

### **Scenario 3.3: Private/Incognito Mode**

1. **Steps**:
   - [ ] Open private/incognito window
   - [ ] Complete payment
   - [ ] **Verify**: Token stored in `sessionStorage`
   - [ ] Navigate to preview
   - [ ] **Verify**: Report generates
   - [ ] **Verify**: `session_id` fallback works if token lost

**Expected**: ✅ Should work with `session_id` fallback

---

## 🚨 **TEST 4: Error Handling**

### **Scenario 4.1: Failed Payment**

1. **Steps**:
   - [ ] Start checkout
   - [ ] Use declined card (4000 0000 0000 0002)
   - [ ] **Verify**: Payment fails gracefully
   - [ ] **Verify**: User sees error message
   - [ ] **Verify**: Can retry payment

**Expected**: ✅ Graceful error handling

---

### **Scenario 4.2: Network Error During Verification**

1. **Steps**:
   - [ ] Complete payment
   - [ ] Disable network (or block API)
   - [ ] Click "View My Report Now"
   - [ ] **Verify**: Shows appropriate error
   - [ ] Re-enable network
   - [ ] Retry
   - [ ] **Verify**: Works after network restored

**Expected**: ✅ Error shown, retry works

---

### **Scenario 4.3: Expired Token**

1. **Steps**:
   - [ ] Complete payment
   - [ ] Wait 1+ hour (token expires after 1 hour)
   - [ ] Try to generate report
   - [ ] **Verify**: Token regeneration from `session_id` works
   - [ ] **Verify**: Report generates

**Expected**: ✅ Should regenerate token from `session_id`

---

### **Scenario 4.4: Invalid Session ID**

1. **Steps**:
   - [ ] Manually navigate to `/ai-astrology/preview?session_id=invalid`
   - [ ] **Verify**: Shows appropriate error
   - [ ] **Verify**: Can navigate back to purchase

**Expected**: ✅ Graceful error, no crash

---

## 🧪 **TEST 5: Report Generation - All Types**

### **Test Each Report Type**:

For each report type, test:
- [ ] **Life Summary** (free) - No payment needed
- [ ] **Year Analysis** - Payment required
- [ ] **Marriage Timing** - Payment required
- [ ] **Career & Money** - Payment required
- [ ] **Full Life** - Payment required
- [ ] **Major Life Phase** - Payment required
- [ ] **Decision Support** - Payment required

**Test Steps** (for each paid report):
1. [ ] Complete payment
2. [ ] Verify report generates
3. [ ] Verify content is correct
4. [ ] Verify PDF download works
5. [ ] Test with token loss scenario

---

## ⏱️ **TEST 6: Timeout & Performance**

### **Scenario 6.1: Report Generation Timeout**

1. **Steps**:
   - [ ] Generate report (should complete in <55 seconds)
   - [ ] **Verify**: Report generates within timeout
   - [ ] If timeout occurs, **verify**: Shows user-friendly error

**Expected**: ✅ Completes or shows timeout error

---

### **Scenario 6.2: Slow Network**

1. **Steps**:
   - [ ] Throttle network to "Slow 3G" (Chrome DevTools)
   - [ ] Complete payment
   - [ ] Generate report
   - [ ] **Verify**: Loading states shown
   - [ ] **Verify**: Report eventually generates

**Expected**: ✅ Works on slow network

---

## 🔒 **TEST 7: Security & Authorization**

### **Scenario 7.1: Access Without Payment**

1. **Steps**:
   - [ ] Try to access `/ai-astrology/preview` directly (no payment)
   - [ ] **Verify**: Redirects to input or shows payment prompt
   - [ ] **Verify**: Cannot generate paid report without payment

**Expected**: ✅ Payment required

---

### **Scenario 7.2: Token Tampering**

1. **Steps**:
   - [ ] Complete payment
   - [ ] Get token from `sessionStorage`
   - [ ] Modify token
   - [ ] Try to generate report
   - [ ] **Verify**: Invalid token rejected
   - [ ] **Verify**: Falls back to `session_id` verification

**Expected**: ✅ Invalid token rejected, `session_id` fallback works

---

## 📊 **TEST 8: Multiple Reports**

### **Scenario 8.1: Generate Multiple Reports**

1. **Steps**:
   - [ ] Purchase Year Analysis
   - [ ] Generate report
   - [ ] Purchase Marriage Timing
   - [ ] Generate report
   - [ ] **Verify**: Both reports accessible
   - [ ] **Verify**: Tokens don't conflict

**Expected**: ✅ Multiple reports work independently

---

## 🎯 **PRIORITY TEST CHECKLIST**

### **🔴 CRITICAL (Must Test Before Production)**:

- [ ] **Payment → Report Generation** (Web)
- [ ] **Payment → Report Generation** (Mobile)
- [ ] **Token Loss Scenario** (Clear sessionStorage)
- [ ] **session_id Fallback** (Direct URL access)
- [ ] **Error Handling** (Failed payment, network errors)
- [ ] **All Report Types** (Year Analysis, Marriage, etc.)

### **🟡 HIGH PRIORITY**:

- [ ] Private browsing mode
- [ ] Tab close/reopen
- [ ] Expired token handling
- [ ] Slow network performance
- [ ] Multiple reports

### **🟢 NICE TO HAVE**:

- [ ] Token tampering
- [ ] Edge cases
- [ ] Performance under load

---

## 🧪 **AUTOMATED TEST SCRIPT**

See: `test-critical-payment-flows.sh` (to be created)

---

## 📝 **TEST RESULTS TEMPLATE**

```
TEST DATE: ___________
TESTER: ___________
ENVIRONMENT: Web / Mobile (specify browser/device)

PAYMENT FLOW - WEB:
- [ ] Payment successful
- [ ] Token stored
- [ ] Report generated
- Issues found: ___________

PAYMENT FLOW - MOBILE:
- [ ] Payment successful
- [ ] Token stored
- [ ] Token loss recovery works
- [ ] Report generated
- Issues found: ___________

TOKEN LOSS SCENARIOS:
- [ ] SessionStorage cleared - Works
- [ ] Tab closed/reopened - Works
- [ ] Private mode - Works
- Issues found: ___________

ERROR HANDLING:
- [ ] Failed payment handled
- [ ] Network error handled
- [ ] Invalid token handled
- Issues found: ___________

OVERALL STATUS: [ ] PASS / [ ] FAIL
```

---

## 🚀 **QUICK TEST (5 MINUTES)**

### **Critical Path Test**:

1. **Web**: Complete payment → Verify report generates
2. **Mobile**: Complete payment → Clear sessionStorage → Verify report still generates
3. **Error**: Try invalid session_id → Verify error handled

**If all pass**: ✅ Critical flows working  
**If any fail**: 🔴 **STOP - DO NOT DEPLOY**

---

**Last Updated**: January 6, 2026  
**Priority**: 🔴 **CRITICAL**

