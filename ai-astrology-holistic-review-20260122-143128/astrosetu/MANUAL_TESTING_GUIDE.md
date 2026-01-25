# Manual Testing Guide - Report Generation

## Prerequisites

1. **Test User Credentials:**
   - Name: `Amit Kumar Mandal`
   - DOB: `1984-11-28` (or `1984-11-26` - both should work)
   - Time: `21:40`
   - Place: `Noamundi, Jharkhand, India`
   - Gender: `Male`

2. **Environment:**
   - Production URL: `https://www.mindveda.net`
   - Ensure `NEXT_PUBLIC_RESTRICT_ACCESS=true` is set
   - Ensure `BYPASS_PAYMENT_FOR_TEST_USERS=true` (default)

---

## Test Checklist

### ✅ Test 1: Life Summary (Free Report)

**URL:** `https://www.mindveda.net/ai-astrology/input?reportType=life-summary`

**Steps:**
1. Navigate to URL
2. Fill in test user data
3. Click "Generate Free Report"
4. **Verify:**
   - [ ] No payment required
   - [ ] Test user detected (check browser console for `[TEST USER]` log)
   - [ ] Loading screen shows progress indicators
   - [ ] Report generates within 15-30 seconds
   - [ ] Report displays with sections

**Expected Result:** ✅ Free report generated successfully

---

### ✅ Test 2: Marriage Timing Report (Paid)

**URL:** `https://www.mindveda.net/ai-astrology/input?reportType=marriage-timing`

**Steps:**
1. Navigate to URL
2. Fill in test user data
3. Click "Purchase Marriage Timing Report"
4. **Verify:**
   - [ ] Test user detected
   - [ ] Checkout session created (mock session)
   - [ ] Payment bypassed (test user)
   - [ ] Redirected to preview page
   - [ ] Loading screen shows progress
   - [ ] Report generates within 25-40 seconds
   - [ ] Report displays with marriage timing sections

**Expected Result:** ✅ Paid report generated with payment bypass

---

### ✅ Test 3: Career & Money Report (Paid)

**URL:** `https://www.mindveda.net/ai-astrology/input?reportType=career-money`

**Steps:**
1. Navigate to URL
2. Fill in test user data
3. Click "Purchase Career & Money Report"
4. **Verify:**
   - [ ] Test user detected
   - [ ] Payment bypassed
   - [ ] Report generates within 25-40 seconds
   - [ ] Report displays with career/money sections

**Expected Result:** ✅ Report generated successfully

---

### ✅ Test 4: Full Life Report (Paid - Complex)

**URL:** `https://www.mindveda.net/ai-astrology/input?reportType=full-life`

**Steps:**
1. Navigate to URL
2. Fill in test user data
3. Click "Purchase Full Life Report"
4. **Verify:**
   - [ ] Test user detected
   - [ ] Payment bypassed
   - [ ] Report generates within 35-50 seconds (complex report)
   - [ ] Report displays with executive summary
   - [ ] All sections displayed

**Expected Result:** ✅ Complex report generated successfully

---

### ✅ Test 5: Year Analysis Report (Paid)

**URL:** `https://www.mindveda.net/ai-astrology/input?reportType=year-analysis`

**Steps:**
1. Navigate to URL
2. Fill in test user data
3. Click "Purchase Year Analysis Report"
4. **Verify:**
   - [ ] Test user detected
   - [ ] Payment bypassed
   - [ ] Report generates within 25-40 seconds
   - [ ] Report displays with 12-month analysis

**Expected Result:** ✅ Report generated successfully

---

### ✅ Test 6: Major Life Phase Report (Paid - Complex)

**URL:** `https://www.mindveda.net/ai-astrology/input?reportType=major-life-phase`

**Steps:**
1. Navigate to URL
2. Fill in test user data
3. Click "Purchase 3-5 Year Strategic Life Phase Report"
4. **Verify:**
   - [ ] Test user detected
   - [ ] Payment bypassed
   - [ ] Report generates within 35-50 seconds
   - [ ] Report displays with strategic overview

**Expected Result:** ✅ Complex report generated successfully

---

### ✅ Test 7: Decision Support Report (Paid)

**URL:** `https://www.mindveda.net/ai-astrology/input?reportType=decision-support`

**Steps:**
1. Navigate to URL
2. Fill in test user data
3. Enter decision context: "Should I change my job in the next 6 months?"
4. Click "Purchase Decision Support Report"
5. **Verify:**
   - [ ] Test user detected
   - [ ] Payment bypassed
   - [ ] Decision context included
   - [ ] Report generates within 25-40 seconds
   - [ ] Report displays with decision guidance

**Expected Result:** ✅ Report generated with decision context

---

## Error Scenarios to Test

### ❌ Test 8: Invalid Input

**Steps:**
1. Navigate to any report type
2. Leave name field empty
3. Try to submit
4. **Verify:**
   - [ ] Validation error shown
   - [ ] Form doesn't submit

**Expected Result:** ✅ Validation prevents submission

---

### ❌ Test 9: Access Restriction (Non-Test User)

**Steps:**
1. Use a different name (not Amit or Ankita)
2. Try to generate a report
3. **Verify:**
   - [ ] Access restriction error shown
   - [ ] Payment not charged

**Expected Result:** ✅ Access denied for non-test users

---

### ❌ Test 10: Timeout Handling

**Steps:**
1. Generate a complex report (full-life)
2. Wait for timeout (if it occurs)
3. **Verify:**
   - [ ] Timeout error shown
   - [ ] Payment automatically refunded/cancelled
   - [ ] User can retry

**Expected Result:** ✅ Graceful timeout handling

---

## Loading Screen UX Tests

### ✅ Test 11: Loading Screen Features

**Steps:**
1. Generate any report
2. Observe loading screen
3. **Verify:**
   - [ ] Progress indicators show (birth chart, planetary analysis, generating insights)
   - [ ] Time estimate shown (60-90 seconds)
   - [ ] Value proposition shown ("What you're getting")
   - [ ] Report ID displayed (if available)
   - [ ] "Retry Loading Report" button works
   - [ ] "Copy Report Link" button works
   - [ ] Recovery guidance appears after 90 seconds

**Expected Result:** ✅ All loading screen features work correctly

---

## Browser Console Checks

While testing, check browser console for:

1. **Test User Detection:**
   ```
   [TEST USER] Production test user detected: amit kumar mandal
   ```

2. **Access Check:**
   ```
   [ACCESS CHECK] { action: "ACCESS_GRANTED_TEST_USER" }
   ```

3. **Payment Bypass:**
   ```
   [PAYMENT BYPASS STATUS] { mode: "TEST USER" }
   ```

4. **Generation Start:**
   ```
   [GENERATION START] { action: "REPORT_GENERATION_START" }
   ```

5. **Generation Success:**
   ```
   [REPORT GENERATION SUCCESS] { generationTimeMs: ... }
   ```

---

## Vercel Logs Checks

Check Vercel logs for:

1. **Request Start:**
   ```
   [REQUEST START] { requestId: "req-..." }
   ```

2. **Test User Detection:**
   ```
   [TEST USER] Production test user detected
   ```

3. **Access Granted:**
   ```
   [ACCESS CHECK] { action: "ACCESS_GRANTED_TEST_USER" }
   ```

4. **Generation Success:**
   ```
   [REPORT GENERATION SUCCESS] { generationTimeMs: ... }
   ```

5. **Response Sent:**
   ```
   [RESPONSE SUCCESS] { totalTimeMs: ... }
   ```

---

## Performance Benchmarks

| Report Type | Expected Time | Max Time |
|------------|---------------|----------|
| life-summary | 15-30s | 60s |
| marriage-timing | 25-40s | 75s |
| career-money | 25-40s | 75s |
| year-analysis | 25-40s | 75s |
| full-life | 35-50s | 90s |
| major-life-phase | 35-50s | 90s |
| decision-support | 25-40s | 75s |

---

## Issues to Report

When testing, document:

1. **Critical Issues:**
   - Report generation fails
   - Payment not bypassed for test user
   - Access restriction blocks test user
   - Timeout errors

2. **Minor Issues:**
   - Slow generation (beyond expected time)
   - UI/UX issues
   - Error messages unclear

3. **Enhancements:**
   - Suggestions for improvement
   - Missing features

---

## Test Results Template

```markdown
## Test Results - [Date]

### Test 1: Life Summary
- Status: ✅ PASS / ❌ FAIL
- Generation Time: ___ seconds
- Issues: ___

### Test 2: Marriage Timing
- Status: ✅ PASS / ❌ FAIL
- Generation Time: ___ seconds
- Issues: ___

[... continue for all tests ...]

### Summary
- Total Tests: 7
- Passed: ___
- Failed: ___
- Critical Issues: ___
- Minor Issues: ___
```
