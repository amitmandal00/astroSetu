# 🚨 Immediate Testing Actions - Critical Flows

**Priority**: 🔴 **HIGH PRIORITY**  
**Focus**: Payment & Report Generation Issues

---

## ⚡ **QUICK START - Test Now (15 minutes)**

### **Critical Test 1: Payment → Report Generation (Web)**

**Do This First**:
1. Open Chrome/Firefox
2. Go to: `https://astrosetu-app.vercel.app/ai-astrology`
3. Select "Year Analysis Report"
4. Fill details:
   - Name: Test User
   - DOB: 1990-01-15
   - TOB: 10:30
   - Place: Mumbai, Maharashtra, India
   - Gender: Male
5. Click "Generate Report"
6. Complete payment: Card `4242 4242 4242 4242`, Exp: 12/25, CVC: 123
7. **CRITICAL CHECK**:
   - ✅ Payment succeeds?
   - ✅ Success page shows?
   - ✅ URL has `session_id`?
   - ✅ Report generates automatically?
   - ✅ No "permission denied" error?

**If FAIL**: 🔴 **STOP - Critical issue found**

---

### **Critical Test 2: Token Loss Scenario (Web)**

**After Test 1**:
1. On success page, open DevTools (F12)
2. Console tab → Run: `sessionStorage.clear()`
3. Click "View My Report Now"
4. **CRITICAL CHECK**:
   - ✅ Report still generates?
   - ✅ No "permission denied"?
   - ✅ Token regenerated from `session_id`?

**If FAIL**: 🔴 **The fix didn't work - need to investigate**

---

### **Critical Test 3: Mobile Payment Flow**

**On Mobile Device (Safari iOS or Chrome Android)**:
1. Open browser
2. Complete payment flow
3. **CRITICAL CHECK**:
   - ✅ Payment succeeds?
   - ✅ Report generates?
   - ✅ Works even after closing/reopening tab?

**If FAIL**: 🔴 **Mobile issue - critical**

---

## 📋 **AUTOMATED TEST RUN**

Run the automated test script:
```bash
cd astrosetu
./test-critical-payment-flows.sh https://astrosetu-app.vercel.app year-analysis
```

**Or test locally**:
```bash
./test-critical-payment-flows.sh http://localhost:3000 year-analysis
```

---

## 🎯 **TEST RESULTS LOG**

### **Web Browser Test**:
- Payment Flow: [ ] ✅ PASS / [ ] ❌ FAIL
- Token Loss: [ ] ✅ PASS / [ ] ❌ FAIL
- Report Generation: [ ] ✅ PASS / [ ] ❌ FAIL

### **Mobile Browser Test**:
- Payment Flow: [ ] ✅ PASS / [ ] ❌ FAIL
- Token Loss: [ ] ✅ PASS / [ ] ❌ FAIL
- Report Generation: [ ] ✅ PASS / [ ] ❌ FAIL

### **Error Handling**:
- Failed Payment: [ ] ✅ PASS / [ ] ❌ FAIL
- Network Error: [ ] ✅ PASS / [ ] ❌ FAIL
- Invalid Session: [ ] ✅ PASS / [ ] ❌ FAIL

---

## ⚠️ **IF TESTS FAIL**

### **Critical Issue Found**:

1. **Document the issue**:
   - What failed?
   - Error message?
   - Steps to reproduce?

2. **Check logs**:
   - Browser console errors
   - Network tab (failed requests)
   - Vercel logs

3. **Immediate fix needed**:
   - Fix code
   - Test again
   - Re-deploy

---

## ✅ **IF ALL TESTS PASS**

### **Proceed with**:
- ✅ Full manual testing (see `MANUAL_TESTING_CHECKLIST.md`)
- ✅ Test all report types
- ✅ Test edge cases
- ✅ Monitor production for issues

---

## 📊 **TESTING PRIORITY**

1. 🔴 **Payment → Report Generation** (Web & Mobile)
2. 🔴 **Token Loss Scenarios** (Critical fix validation)
3. 🟡 **Error Handling** (Failed payments, network errors)
4. 🟡 **All Report Types** (Year Analysis, Marriage, etc.)
5. 🟢 **Edge Cases** (Timeouts, performance)

---

**Last Updated**: January 6, 2026  
**Status**: Ready for Testing

