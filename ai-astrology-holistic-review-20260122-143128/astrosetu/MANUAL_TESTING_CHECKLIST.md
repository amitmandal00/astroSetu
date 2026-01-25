# 📱 Manual Testing Checklist - Critical Flows

**Priority**: 🔴 **CRITICAL** - Must test before production  
**Focus**: Payment & Report Generation on Web & Mobile

---

## 🌐 **WEB BROWSER TESTS**

### **Test 1: Complete Payment Flow (Chrome/Firefox)**

**Steps**:
1. [ ] Go to: `https://astrosetu-app.vercel.app/ai-astrology`
2. [ ] Select "Year Analysis Report"
3. [ ] Fill birth details:
   - Name: Test User
   - DOB: 1990-01-15
   - TOB: 10:30
   - Place: Mumbai, Maharashtra, India
   - Gender: Male
4. [ ] Click "Generate Report"
5. [ ] Complete Stripe checkout:
   - Card: `4242 4242 4242 4242`
   - Expiry: 12/25
   - CVC: 123
   - Name: Test User
6. [ ] **VERIFY**: Redirects to success page
7. [ ] **VERIFY**: Shows "Payment Successful!"
8. [ ] **VERIFY**: URL includes `session_id` parameter
9. [ ] Open DevTools → Application → Session Storage
10. [ ] **VERIFY**: `aiAstrologyPaymentToken` exists
11. [ ] **VERIFY**: `aiAstrologyPaymentVerified = "true"`
12. [ ] **VERIFY**: `aiAstrologyPaymentSessionId` exists
13. [ ] Click "View My Report Now" (or wait for auto-redirect)
14. [ ] **VERIFY**: Report generates automatically
15. [ ] **VERIFY**: Report content displays
16. [ ] Click "Download PDF"
17. [ ] **VERIFY**: PDF downloads correctly

**Result**: [ ] ✅ PASS / [ ] ❌ FAIL  
**Issues**: ________________________________

---

### **Test 2: Token Loss Scenario (Web)**

**Steps**:
1. [ ] Complete payment (follow Test 1 steps 1-6)
2. [ ] On success page, open DevTools → Console
3. [ ] Run: `sessionStorage.clear()`
4. [ ] **VERIFY**: Token cleared (check Session Storage)
5. [ ] Click "View My Report Now"
6. [ ] **CRITICAL VERIFY**: Report still generates (token regenerated from session_id)
7. [ ] **VERIFY**: No "permission denied" error

**Result**: [ ] ✅ PASS / [ ] ❌ FAIL  
**Issues**: ________________________________

---

### **Test 3: Direct URL Access with Session ID**

**Steps**:
1. [ ] Complete payment
2. [ ] Copy URL from success page (includes `session_id`)
3. [ ] Open new incognito/private window
4. [ ] Paste URL directly
5. [ ] **VERIFY**: Success page loads
6. [ ] Click "View My Report Now"
7. [ ] **VERIFY**: Report generates (token created from session_id)

**Result**: [ ] ✅ PASS / [ ] ❌ FAIL  
**Issues**: ________________________________

---

## 📱 **MOBILE BROWSER TESTS**

### **Test 4: Payment Flow (Safari iOS)**

**Steps**:
1. [ ] Open Safari on iPhone/iPad
2. [ ] Navigate to: `https://astrosetu-app.vercel.app/ai-astrology`
3. [ ] Select "Year Analysis Report"
4. [ ] Fill birth details
5. [ ] Complete payment (use Apple Pay or card)
6. [ ] **VERIFY**: Payment succeeds
7. [ ] **VERIFY**: Success page shows
8. [ ] **VERIFY**: URL includes `session_id`
9. [ ] Click "View My Report Now"
10. [ ] **VERIFY**: Report generates
11. [ ] **VERIFY**: Report displays correctly on mobile

**Result**: [ ] ✅ PASS / [ ] ❌ FAIL  
**Issues**: ________________________________

---

### **Test 5: Token Loss on Mobile (Safari iOS) - CRITICAL**

**Steps**:
1. [ ] Complete payment on Safari iOS (Test 4 steps 1-6)
2. [ ] On success page, use Safari Web Inspector:
   - Mac: Safari → Develop → [Your iPhone] → [Page]
   - Run in console: `sessionStorage.clear()`
3. [ ] Click "View My Report Now"
4. [ ] **CRITICAL VERIFY**: Report still generates
5. [ ] **VERIFY**: No "permission denied" error
6. [ ] **VERIFY**: Token regenerated automatically

**Alternative (without Web Inspector)**:
1. [ ] Complete payment
2. [ ] Copy URL (with `session_id`)
3. [ ] Close Safari completely
4. [ ] Reopen Safari
5. [ ] Paste URL
6. [ ] **VERIFY**: Report generates

**Result**: [ ] ✅ PASS / [ ] ❌ FAIL  
**Issues**: ________________________________

---

### **Test 6: Payment Flow (Chrome Android)**

**Steps**:
1. [ ] Open Chrome on Android
2. [ ] Navigate to: `https://astrosetu-app.vercel.app/ai-astrology`
3. [ ] Complete payment flow
4. [ ] **VERIFY**: Payment succeeds
5. [ ] **VERIFY**: Report generates
6. [ ] Test token loss scenario (close/reopen tab)
7. [ ] **VERIFY**: Report still generates

**Result**: [ ] ✅ PASS / [ ] ❌ FAIL  
**Issues**: ________________________________

---

## 🔄 **EDGE CASES & ERROR SCENARIOS**

### **Test 7: Failed Payment**

**Steps**:
1. [ ] Start checkout
2. [ ] Use declined card: `4000 0000 0000 0002`
3. [ ] **VERIFY**: Payment fails gracefully
4. [ ] **VERIFY**: Error message shown
5. [ ] **VERIFY**: Can retry payment

**Result**: [ ] ✅ PASS / [ ] ❌ FAIL  
**Issues**: ________________________________

---

### **Test 8: Network Error**

**Steps**:
1. [ ] Complete payment
2. [ ] Disable network (airplane mode or disable WiFi)
3. [ ] Click "View My Report Now"
4. [ ] **VERIFY**: Error message shown
5. [ ] Re-enable network
6. [ ] Retry
7. [ ] **VERIFY**: Report generates

**Result**: [ ] ✅ PASS / [ ] ❌ FAIL  
**Issues**: ________________________________

---

### **Test 9: Invalid Session ID**

**Steps**:
1. [ ] Navigate to: `/ai-astrology/preview?session_id=invalid_12345`
2. [ ] **VERIFY**: Shows appropriate error
3. [ ] **VERIFY**: Can navigate back to purchase

**Result**: [ ] ✅ PASS / [ ] ❌ FAIL  
**Issues**: ________________________________

---

### **Test 10: Expired Token**

**Steps**:
1. [ ] Complete payment
2. [ ] Get token from `sessionStorage`
3. [ ] Wait 1+ hour (or manually expire token)
4. [ ] Try to generate report
5. [ ] **VERIFY**: Token regenerated from `session_id`
6. [ ] **VERIFY**: Report generates

**Result**: [ ] ✅ PASS / [ ] ❌ FAIL  
**Issues**: ________________________________

---

## 📊 **ALL REPORT TYPES TEST**

### **Test Each Report Type**:

- [ ] **Life Summary** (free) - No payment
- [ ] **Year Analysis** - Payment required ✅
- [ ] **Marriage Timing** - Payment required
- [ ] **Career & Money** - Payment required
- [ ] **Full Life** - Payment required
- [ ] **Major Life Phase** - Payment required
- [ ] **Decision Support** - Payment required

**For each paid report**:
- [ ] Payment succeeds
- [ ] Report generates
- [ ] Token loss scenario works
- [ ] PDF download works

---

## 🎯 **CRITICAL PATH TEST (5 MINUTES)**

**Quick validation**:
1. [ ] Complete payment on web → Report generates ✅
2. [ ] Clear `sessionStorage` → Report still generates ✅
3. [ ] Complete payment on mobile → Report generates ✅
4. [ ] Try invalid `session_id` → Error handled ✅

**If all pass**: ✅ **Critical flows working**  
**If any fail**: 🔴 **STOP - DO NOT DEPLOY**

---

## 📝 **TEST RESULTS**

**Date**: _______________  
**Tester**: _______________  
**Environment**: Web / Mobile (specify browser/device)

**Summary**:
- Total Tests: _____
- Passed: _____
- Failed: _____

**Critical Issues Found**:
1. ________________________________
2. ________________________________
3. ________________________________

**Status**: [ ] ✅ READY FOR PRODUCTION / [ ] ⚠️ ISSUES FOUND

---

**Last Updated**: January 6, 2026  
**Priority**: 🔴 **CRITICAL**

