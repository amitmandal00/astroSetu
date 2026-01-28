# 🧪 Production Testing Checklist

**Date**: January 6, 2026  
**Status**: Ready for End-to-End Testing  
**Prerequisites**: ✅ Environment fixes done, ✅ Supabase migration complete

---

## ✅ **PREREQUISITES COMPLETE**

- [x] Environment variables fixed (`NEXT_PUBLIC_APP_URL`, Stripe live keys)
- [x] Vercel redeployment complete
- [x] Supabase table migration complete (5 new columns added)

---

## 🎯 **TESTING CHECKLIST**

### **⚠️ NOTE: Test on Preview First, Then Production**

**Preview URL**: `https://astrosetu-ogd5xl4i0-amits-projects-a49d49fa.vercel.app`  
**Production URL**: `https://astrosetu-app.vercel.app`

**Recommendation**: Test on preview first, then promote and test production.

---

### **Test 1: Contact Form - End-to-End** (10 minutes) 🔴 **CRITICAL**

**Steps**:
1. Go to: `{PREVIEW_OR_PRODUCTION_URL}/contact`
   - Preview: `https://astrosetu-ogd5xl4i0-amits-projects-a49d49fa.vercel.app/contact`
   - Production: `https://astrosetu-app.vercel.app/contact`
2. Fill out the contact form:
   - Name: `Test User`
   - Email: `your-test-email@example.com` (use a real email you can check)
   - Phone: `1234567890`
   - Subject: `Test Submission - Production`
   - Message: `This is a test submission to verify email delivery and database logging.`
   - Category: Select any
3. Click **"Submit"**

**Verify**:
- [ ] ✅ Form submits successfully (no errors)
- [ ] ✅ Success message appears
- [ ] ✅ Receive acknowledgment email (check inbox)
  - [ ] Email has correct timestamp in IST format
  - [ ] Email includes submission details
- [ ] ✅ Internal notification email sent (check compliance email)
- [ ] ✅ Database record created in Supabase:
  - [ ] Go to Supabase Dashboard → Table Editor → `contact_submissions`
  - [ ] Find your test submission
  - [ ] Verify these columns exist and have values:
    - [ ] `email_sent_user` = `true`
    - [ ] `email_sent_internal` = `true`
    - [ ] `email_sent_user_at` = timestamp
    - [ ] `email_sent_internal_at` = timestamp
    - [ ] `email_error` = `NULL` (or empty if no errors)

**Expected Result**: ✅ All emails sent, database logged correctly

---

### **Test 2: AI Section - Purchase Flow** (15 minutes) 🔴 **CRITICAL**

**Steps**:
1. Go to: `https://astrosetu-app.vercel.app/ai-astrology`
2. Select a report type (e.g., **"Year Analysis Report"**)
3. Fill out birth details:
   - Name: `Test User`
   - Date of Birth: `1990-01-15`
   - Time of Birth: `10:30`
   - Place of Birth: `Mumbai, Maharashtra, India`
   - Gender: Select appropriate
4. Click **"Generate Report"**
5. Complete Stripe checkout:
   - Use a **test card** (or small real amount):
     - Card: `4242 4242 4242 4242`
     - Expiry: Any future date (e.g., `12/25`)
     - CVC: Any 3 digits (e.g., `123`)
     - Name: Any name
   - Complete payment

**Verify**:
- [ ] ✅ Stripe checkout loads (should use live keys - no test mode indicators if using real card)
- [ ] ✅ Payment processes successfully
- [ ] ✅ Redirect to success page works: `/ai-astrology/payment/success`
  - [ ] **CRITICAL**: No 404 error (this tests `NEXT_PUBLIC_APP_URL` fix)
  - [ ] Success page displays correctly
- [ ] ✅ Report generates and displays:
  - [ ] Report content loads
  - [ ] Report shows **current year (2026)** analysis, not next year
  - [ ] All sections render correctly
- [ ] ✅ PDF download works:
  - [ ] Click "Download PDF"
  - [ ] PDF generates successfully
  - [ ] PDF formatting is clean (no excessive blank spaces)
  - [ ] Paragraphs are properly formatted

**Expected Result**: ✅ Complete purchase flow works end-to-end

---

### **Test 3: URL Redirects & Links** (5 minutes)

**Steps**:
1. After completing Test 2 (payment), verify:
   - [ ] ✅ Success page URL is correct: `https://astrosetu-app.vercel.app/ai-astrology/payment/success?session_id=...`
   - [ ] ✅ No 404 errors
   - [ ] ✅ All internal links work (footer, header if visible)
   - [ ] ✅ Navigation works (back button, direct links)

**Verify**:
- [ ] ✅ All URLs use correct base URL (no `/NEXT_PUBLIC_APP_URL` path)
- [ ] ✅ Email links (if any) work correctly
- [ ] ✅ Deep links work (e.g., direct report URLs)

**Expected Result**: ✅ All redirects and links work correctly

---

### **Test 4: Header/Footer Flash** (2 minutes)

**Steps**:
1. Open in incognito/private window
2. Visit: `https://astrosetu-app.vercel.app/` (base URL)
3. Visit: `https://astrosetu-app.vercel.app/ai-astrology`
4. Refresh page multiple times

**Verify**:
- [ ] ✅ No flash of old orange header/footer
- [ ] ✅ AI section has correct header/footer
- [ ] ✅ Base URL landing page shows correct layout
- [ ] ✅ No visual glitches on page load

**Expected Result**: ✅ No flash of incorrect UI elements

---

### **Test 5: Stripe Live Mode Verification** (5 minutes)

**Steps**:
1. Go to Stripe Dashboard: https://dashboard.stripe.com
2. Check top right corner:
   - [ ] ✅ **Test mode is OFF** (should say "Live mode" or no toggle visible)
3. Go to **Payments**:
   - [ ] ✅ See your test payment from Test 2 (if you used a real card)
   - [ ] ✅ Payment status is "Succeeded"
   - [ ] ✅ Payment amount is correct
4. Go to **Developers** → **API keys**:
   - [ ] ✅ Secret key starts with `sk_live_...` (not `sk_test_...`)
   - [ ] ✅ Publishable key starts with `pk_live_...` (not `pk_test_...`)

**Expected Result**: ✅ Stripe is in live mode and processing payments

---

### **Test 6: Report Date Logic** (5 minutes)

**Steps**:
1. Generate a **"Year Analysis Report"** (from Test 2)
2. Review report content

**Verify**:
- [ ] ✅ Report mentions **2026** (current year), not 2027
- [ ] ✅ Date ranges are appropriate (12-month window from current date)
- [ ] ✅ Report content is relevant to current year
- [ ] ✅ No references to "next year" or future years incorrectly

**Generate other reports to verify**:
- [ ] ✅ Major Life Phase Report - date ranges are current year forward
- [ ] ✅ Marriage Timing Report - date ranges are current year forward
- [ ] ✅ Career/Money Report - date ranges are current year forward

**Expected Result**: ✅ All reports use current date logic correctly

---

### **Test 7: Error Handling** (5 minutes)

**Steps**:
1. Submit contact form with invalid data (e.g., invalid email)
2. Try to generate report without payment
3. Test invalid payment scenarios

**Verify**:
- [ ] ✅ Error messages display correctly
- [ ] ✅ No console errors (F12 → Console)
- [ ] ✅ Error states are user-friendly
- [ ] ✅ Failed payments don't break the flow

**Expected Result**: ✅ Error handling works gracefully

---

## 📊 **TEST RESULTS SUMMARY**

### **Critical Tests** (Must Pass):
- [ ] Test 1: Contact Form - End-to-End
- [ ] Test 2: AI Section - Purchase Flow
- [ ] Test 3: URL Redirects & Links
- [ ] Test 5: Stripe Live Mode Verification

### **Important Tests** (Should Pass):
- [ ] Test 4: Header/Footer Flash
- [ ] Test 6: Report Date Logic
- [ ] Test 7: Error Handling

---

## ✅ **IF ALL TESTS PASS**

### **You're Ready to Go Live!** 🚀

**Final Steps**:
1. ✅ All tests passing
2. ✅ No critical errors
3. ✅ Monitor first few real transactions
4. ✅ Watch Vercel logs for any issues
5. ✅ Check email delivery rates
6. ✅ Verify database logging continues to work

---

## ⚠️ **IF TESTS FAIL**

### **Common Issues & Fixes**:

**Contact Form Fails**:
- Check Supabase migration completed correctly
- Verify `contact_submissions` table has 5 new columns
- Check Resend API key is valid
- Verify email addresses are correct

**Payment Flow Fails**:
- Verify Stripe keys are live (not test)
- Check Stripe account is activated
- Verify bank account connected in Stripe
- Check `NEXT_PUBLIC_APP_URL` is correct (no path)

**URL Redirects Fail**:
- Double-check `NEXT_PUBLIC_APP_URL` in Vercel
- Should be: `https://astrosetu-app.vercel.app` (no path)
- Redeploy if changed

**Report Generation Fails**:
- Check OpenAI API key is valid
- Verify Prokerala API credentials
- Check Vercel logs for API errors
- Verify payment verification endpoint works

---

## 🎯 **QUICK REFERENCE**

### **Test URLs**:
- Production: `https://astrosetu-app.vercel.app`
- Contact Form: `https://astrosetu-app.vercel.app/contact`
- AI Section: `https://astrosetu-app.vercel.app/ai-astrology`

### **Dashboards**:
- Vercel: https://vercel.com/dashboard
- Stripe: https://dashboard.stripe.com
- Supabase: https://app.supabase.com
- Resend: https://resend.com/emails

### **Key Files**:
- This checklist: `TESTING_CHECKLIST.md`
- E2E Test Guide: `AI_SECTION_E2E_TEST_GUIDE.md`
- Next Steps: `NEXT_STEPS_AFTER_ENV_FIX.md`

---

## 📝 **TEST EXECUTION LOG**

**Date**: _______________  
**Tester**: _______________  
**Environment**: Production

**Results**:
- Test 1: Contact Form - [ ] Pass / [ ] Fail
- Test 2: AI Section Purchase - [ ] Pass / [ ] Fail
- Test 3: URL Redirects - [ ] Pass / [ ] Fail
- Test 4: Header/Footer Flash - [ ] Pass / [ ] Fail
- Test 5: Stripe Live Mode - [ ] Pass / [ ] Fail
- Test 6: Report Date Logic - [ ] Pass / [ ] Fail
- Test 7: Error Handling - [ ] Pass / [ ] Fail

**Issues Found**:
- _________________________________
- _________________________________
- _________________________________

**Overall Status**: [ ] ✅ Ready for Production / [ ] ⚠️ Issues to Fix

---

**Last Updated**: January 6, 2026  
**Status**: Ready for Testing
