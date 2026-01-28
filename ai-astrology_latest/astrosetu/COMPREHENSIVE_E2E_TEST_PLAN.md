# 🧪 Comprehensive End-to-End Test Plan
## Report Generation Testing - All Report Types

**Date:** After redirect loop fixes  
**Commit:** Latest changes  
**Purpose:** Verify all report generation flows work correctly end-to-end

---

## 📋 Pre-Test Checklist

- [ ] Clear browser cache and sessionStorage
- [ ] Test in incognito/private browsing mode
- [ ] Test in regular browsing mode
- [ ] Test with browser DevTools open (Network tab)
- [ ] Test with slow network (throttle in DevTools)

---

## 🆓 Free Report: Life Summary

### Test Case 1.1: Normal Flow
**Steps:**
1. Navigate to `/ai-astrology/input` (or `/ai-astrology/input?reportType=life-summary`)
2. Fill in birth details:
   - Name: "Test User"
   - DOB: 26/11/1984
   - TOB: 09:40 PM
   - Place: "Noamundi, Jharkhand, India"
   - Gender: Male (optional)
3. Verify coordinates are resolved (green checkmark)
4. Click "Get Free Life Summary" button

**Expected Results:**
- ✅ Redirects to `/ai-astrology/preview?reportType=life-summary`
- ✅ Shows loading screen: "Generating Your Report..."
- ✅ Progress indicators show (Birth Chart → Planetary Analysis → Generating Insights)
- ✅ Report generates automatically (no payment prompt)
- ✅ Report content displays correctly
- ✅ No redirect loops back to input page
- ✅ All sections render properly

**Verify:**
- [ ] No console errors
- [ ] Loading screen appears within 1 second
- [ ] Report generates within 60-70 seconds
- [ ] All report sections visible
- [ ] PDF download button works

### Test Case 1.2: Direct Navigation
**Steps:**
1. Fill form and submit (from Test 1.1)
2. Copy preview page URL
3. Open new tab
4. Navigate directly to preview URL
5. Refresh page

**Expected Results:**
- ✅ Report loads from sessionStorage/localStorage
- ✅ No regeneration triggered
- ✅ Content displays correctly

---

## 💰 Paid Reports

### Test Case 2.1: Marriage Timing Report
**Steps:**
1. Navigate to `/ai-astrology/input?reportType=marriage-timing`
2. Fill in birth details (same as Test 1.1)
3. Click "Purchase Marriage Timing Report"
4. Verify redirect to preview page
5. Complete payment flow (Stripe checkout)
6. Return from payment success page

**Expected Results:**
- ✅ Redirects to `/ai-astrology/preview?reportType=marriage-timing` (reportType in URL)
- ✅ Payment prompt shows initially (if not paid)
- ✅ After payment, redirects with: `session_id`, `reportType=marriage-timing`, `auto_generate=true`
- ✅ Payment verification works
- ✅ Report generates automatically after payment
- ✅ Loading screen shows progress
- ✅ Report content displays correctly
- ✅ No redirect to free life summary
- ✅ reportType preserved throughout

**Verify:**
- [ ] Payment flow works correctly
- [ ] Payment success redirect includes reportType
- [ ] Report generates after payment
- [ ] All sections render
- [ ] PDF download available

### Test Case 2.2: Career & Money Report
**Steps:**
1. Navigate to `/ai-astrology/input?reportType=career-money`
2. Fill in birth details
3. Click "Purchase Career & Money Report"
4. Complete payment flow
5. Verify report generation

**Expected Results:**
- ✅ Same as Test 2.1
- ✅ reportType=career-money preserved throughout
- ✅ Report content specific to career & money

### Test Case 2.3: Full Life Report
**Steps:**
1. Navigate to `/ai-astrology/input?reportType=full-life`
2. Fill in birth details
3. Click "Purchase Full Life Report"
4. Complete payment flow
5. Verify report generation

**Expected Results:**
- ✅ Same as Test 2.1
- ✅ reportType=full-life preserved throughout
- ✅ Comprehensive report content

### Test Case 2.4: Year Analysis Report ⚠️ CRITICAL (Was Broken)
**Steps:**
1. Navigate to `/ai-astrology/input?reportType=year-analysis`
2. Fill in birth details
3. Click "Purchase Year Analysis Report"
4. Verify redirect
5. Complete payment flow
6. Verify report generation

**Expected Results:**
- ✅ **MUST NOT** redirect to free life summary input page ❌
- ✅ Redirects to preview with `reportType=year-analysis` in URL
- ✅ Payment success redirect includes `reportType=year-analysis`
- ✅ Report generates after payment
- ✅ reportType preserved throughout entire flow
- ✅ Report content specific to year analysis
- ✅ No redirect loops

**Critical Checks:**
- [ ] Does NOT redirect to `/ai-astrology/input` (free life summary)
- [ ] reportType stays as "year-analysis" throughout
- [ ] Payment flow completes successfully
- [ ] Report generates correctly

### Test Case 2.5: Major Life Phase Report
**Steps:**
1. Navigate to `/ai-astrology/input?reportType=major-life-phase`
2. Fill in birth details
3. Click "Purchase 3-5 Year Strategic Life Phase Report"
4. Complete payment flow
5. Verify report generation

**Expected Results:**
- ✅ Same as Test 2.1
- ✅ reportType=major-life-phase preserved
- ✅ 3-5 year strategic content

### Test Case 2.6: Decision Support Report
**Steps:**
1. Navigate to `/ai-astrology/input?reportType=decision-support`
2. Fill in birth details
3. Click "Purchase Decision Support Report"
4. Complete payment flow
5. Verify report generation

**Expected Results:**
- ✅ Same as Test 2.1
- ✅ reportType=decision-support preserved
- ✅ Decision-focused content

---

## 📦 Bundle Reports

### Test Case 3.1: Any 2 Reports Bundle
**Steps:**
1. Navigate to bundle selection page
2. Select 2 reports (e.g., marriage-timing + career-money)
3. Navigate to input page with bundle params
4. Fill in birth details
5. Complete payment
6. Verify both reports generate

**Expected Results:**
- ✅ Bundle selection works
- ✅ Input page shows bundle title
- ✅ Payment flow works for bundle
- ✅ Both reports generate sequentially
- ✅ Progress indicator shows current report
- ✅ Both reports accessible after generation
- ✅ Bundle navigation works

### Test Case 3.2: All 3 Reports Bundle
**Steps:**
1. Select all 3 reports bundle
2. Fill in birth details
3. Complete payment
4. Verify all 3 reports generate

**Expected Results:**
- ✅ All 3 reports generate
- ✅ Progress tracking works
- ✅ All reports accessible

---

## 🔄 Redirect Loop Testing

### Test Case 4.1: Normal Navigation (No Loop)
**Steps:**
1. Start at input page
2. Fill form and submit
3. Monitor navigation

**Expected Results:**
- ✅ Goes to preview page ONCE
- ✅ Does NOT redirect back to input
- ✅ Report generates or payment prompt shows
- ✅ No infinite redirects

### Test Case 4.2: Missing sessionStorage
**Steps:**
1. Clear sessionStorage
2. Navigate to `/ai-astrology/preview?reportType=year-analysis`
3. Monitor behavior

**Expected Results:**
- ✅ Waits for useEffect to check (shows loading)
- ✅ Either loads from URL params OR redirects to input with reportType preserved
- ✅ Does NOT create redirect loop
- ✅ reportType preserved in redirect URL

### Test Case 4.3: Payment Success Redirect
**Steps:**
1. Complete payment for year-analysis
2. Monitor redirect URL

**Expected Results:**
- ✅ Redirect URL includes `reportType=year-analysis`
- ✅ Redirect URL includes `session_id`
- ✅ Redirect URL includes `auto_generate=true`
- ✅ Preview page receives all params correctly

---

## 🧪 Test User Detection

### Test Case 5.1: Test User - Amit Kumar Mandal
**Steps:**
1. Navigate to input page
2. Enter name: "Amit Kumar Mandal"
3. Enter birth details (any DOB/place - can mismatch)
4. Submit form

**Expected Results:**
- ✅ Test user detected
- ✅ Access restrictions bypassed
- ✅ Can generate reports without payment (if configured)
- ✅ Works for all report types

---

## 🎯 Auto-Generation Logic

### Test Case 6.1: Free Report Auto-Generation
**Steps:**
1. Navigate to input page for life-summary
2. Submit form
3. Verify auto-generation

**Expected Results:**
- ✅ Automatically starts generating on preview page
- ✅ No manual trigger needed
- ✅ Loading screen shows immediately

### Test Case 6.2: Paid Report Auto-Generation (After Payment)
**Steps:**
1. Complete payment for paid report
2. Return from payment success
3. Verify auto-generation

**Expected Results:**
- ✅ Automatically starts generating after payment verification
- ✅ Works with `auto_generate=true` flag
- ✅ Works WITHOUT `auto_generate=true` flag (if payment verified)

---

## 🔐 Payment Verification

### Test Case 7.1: Normal Payment Flow
**Steps:**
1. Submit paid report form
2. Complete Stripe checkout
3. Return from payment
4. Verify payment verification

**Expected Results:**
- ✅ Payment success page loads
- ✅ Redirects to preview with session_id
- ✅ Payment verification API called
- ✅ Payment token generated
- ✅ Report generation proceeds

### Test Case 7.2: Payment Verification with session_id
**Steps:**
1. Navigate directly to preview with session_id in URL
2. Verify payment verification works

**Expected Results:**
- ✅ Payment verification works (even if sessionStorage lost)
- ✅ reportType retrieved from verification response
- ✅ Report generates with correct type

---

## 🚫 Error Handling

### Test Case 8.1: Missing Input Data
**Steps:**
1. Navigate directly to preview page without input
2. Monitor behavior

**Expected Results:**
- ✅ Redirects to input page (only once - no loop)
- ✅ reportType preserved in redirect URL if present

### Test Case 8.2: Network Errors
**Steps:**
1. Throttle network to "Slow 3G" in DevTools
2. Submit form
3. Trigger network error during generation

**Expected Results:**
- ✅ Error message shows clearly
- ✅ Retry button works
- ✅ Can recover and regenerate

### Test Case 8.3: Payment Failures
**Steps:**
1. Simulate payment failure
2. Verify error handling

**Expected Results:**
- ✅ Error message shows
- ✅ Can retry payment
- ✅ No redirect loops

---

## 📝 State Management

### Test Case 9.1: sessionStorage Persistence
**Steps:**
1. Fill form on input page
2. Navigate to preview
3. Verify data persisted

**Expected Results:**
- ✅ Data saved to sessionStorage
- ✅ Data retrieved correctly
- ✅ reportType saved and retrieved

### Test Case 9.2: URL Params as Fallback
**Steps:**
1. Clear sessionStorage
2. Navigate with reportType in URL
3. Verify fallback works

**Expected Results:**
- ✅ reportType read from URL
- ✅ reportType saved to sessionStorage
- ✅ Flow continues correctly

---

## 🎨 UI/UX Consistency

### Test Case 10.1: Loading Screens
**Steps:**
1. Generate different report types
2. Verify loading screens

**Expected Results:**
- ✅ All reports use same loading screen style
- ✅ Progress indicators work
- ✅ Estimated times show
- ✅ Value propositions display

### Test Case 10.2: Error Messages
**Steps:**
1. Trigger various errors
2. Verify error messages

**Expected Results:**
- ✅ Consistent error styling
- ✅ Clear, actionable messages
- ✅ Recovery options available

---

## 🔄 Regression Tests

### Test Case 11.1: Previously Working Features
**Verify:**
- [ ] Free life summary still works
- [ ] Marriage timing report still works
- [ ] Payment flow end-to-end works
- [ ] Bundle reports work
- [ ] Test user detection works

### Test Case 11.2: Recently Fixed Issues
**Verify:**
- [ ] Redirect loops fixed ✅
- [ ] Year-analysis redirect issue fixed ✅
- [ ] reportType preservation works ✅
- [ ] Payment success redirect includes reportType ✅
- [ ] Input page doesn't loop back to itself ✅

---

## 📊 Test Results Template

For each test case, record:

**Test ID:** [e.g., 2.4]  
**Test Name:** [e.g., Year Analysis Report]  
**Status:** ✅ PASS / ❌ FAIL / ⚠️ PARTIAL  
**Date:** [Date]  
**Browser:** [Browser name/version]  
**Notes:** [Any issues or observations]  
**Screenshots:** [If applicable]

---

## 🐛 Known Issues & Workarounds

| Issue | Workaround | Status |
|-------|-----------|--------|
| [List any known issues] | [Workaround if any] | [Status] |

---

## ✅ Sign-Off

**Tested By:** _______________  
**Date:** _______________  
**Overall Status:** ✅ PASS / ❌ FAIL / ⚠️ PARTIAL  

**Notes:**
- [Any overall observations]
- [Any recommendations]
- [Any follow-up actions needed]

