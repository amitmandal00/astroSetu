# AI Section End-to-End Testing Guide

## Overview
This guide provides comprehensive testing instructions for the AI Astrology section, including all pages, navigation flows, headers, footers, redirect links, and payment flows.

**Base URL**: `https://astrosetu-52hsqvj5v-amits-projects-a49d49fa.vercel.app/`

---

## 🎯 Testing Scope

### Pages to Test
1. **Landing Page** (`/ai-astrology`)
2. **Input Form** (`/ai-astrology/input`)
3. **Preview Page** (`/ai-astrology/preview`)
4. **Bundle Selection** (`/ai-astrology/bundle`)
5. **FAQ Page** (`/ai-astrology/faq`)
6. **Subscription Page** (`/ai-astrology/subscription`)
7. **Payment Success** (`/ai-astrology/payment/success`)
8. **Payment Cancel** (`/ai-astrology/payment/cancel`)
9. **Legal Pages** (Privacy, Terms, Disclaimer, Refund, Contact, etc.)

---

## 📋 Pre-Testing Checklist

### Visual Requirements
- [ ] No flash of orange header/footer on any AI section page
- [ ] AI header appears consistently (purple/amber gradient logo)
- [ ] AI footer appears on all pages with correct links
- [ ] Mobile responsive (test on mobile viewport)
- [ ] Desktop responsive (test on desktop viewport)

### Functional Requirements
- [ ] All navigation links work correctly
- [ ] All footer links redirect properly
- [ ] Form validation works
- [ ] Payment flows complete successfully
- [ ] PDF downloads work
- [ ] Error handling displays properly

---

## 🧪 Test Scenarios

### Scenario 1: Landing Page (`/ai-astrology`)

**URL**: `https://astrosetu-52hsqvj5v-amits-projects-a49d49fa.vercel.app/ai-astrology`

**Steps**:
1. Navigate to landing page
2. Verify AI header is visible (not orange Shell header)
3. Verify AI footer is visible at bottom
4. Check all "Order Now" / "Get Started" buttons
5. Verify all report type links work
6. Check bundle pricing cards
7. Verify FAQ link in footer

**Expected Results**:
- ✅ AI header with "AstroSetu AI" logo and "Generate Report" button
- ✅ Sub-header banner: "Educational guidance only • Fully automated • No live support"
- ✅ AI footer with 3 columns (Brand, Important Notice, Legal Links)
- ✅ All report type buttons link to `/ai-astrology/input?reportType=<type>`
- ✅ Bundle buttons link to `/ai-astrology/bundle?type=<bundle-type>`
- ✅ No orange Shell header/footer visible

**Links to Verify**:
- Logo → `/ai-astrology` (home)
- "Generate Report" button → `/ai-astrology/input?reportType=life-summary`
- "Order Now" buttons → `/ai-astrology/input?reportType=<report-type>`
- Bundle buttons → `/ai-astrology/bundle?type=<bundle-type>`
- FAQ link → `/ai-astrology/faq`
- Privacy/Terms/Disclaimer → `/privacy`, `/terms`, `/disclaimer`

---

### Scenario 2: Input Form (`/ai-astrology/input`)

**URL Patterns**:
- `/ai-astrology/input?reportType=life-summary`
- `/ai-astrology/input?reportType=marriage-timing`
- `/ai-astrology/input?reportType=career-money`
- `/ai-astrology/input?reportType=full-life`
- `/ai-astrology/input?reportType=year-analysis`
- `/ai-astrology/input?reportType=major-life-phase`
- `/ai-astrology/input?reportType=decision-support`
- `/ai-astrology/input?bundle=any-2&reports=marriage-timing,career-money`

**Steps**:
1. Navigate to input form with different report types
2. Verify form fields appear correctly
3. Test form validation
4. Fill out form with test data
5. Submit form
6. Verify redirect to preview page

**Test Data**:
```
Name: Test User
DOB: 1990-01-15
TOB: 10:30
Place: Mumbai, Maharashtra, India
Gender: Male
```

**Expected Results**:
- ✅ Form displays all required fields
- ✅ Date/time pickers work correctly
- ✅ Place autocomplete functions
- ✅ Form validation shows errors for missing fields
- ✅ On submit, redirects to `/ai-astrology/preview?reportType=<type>`
- ✅ Form data persists in localStorage

---

### Scenario 3: Preview Page (`/ai-astrology/preview`)

**URL Patterns**:
- `/ai-astrology/preview?reportType=life-summary`
- `/ai-astrology/preview?reportType=marriage-timing`
- `/ai-astrology/preview?reportType=career-money`

**Steps**:
1. Navigate to preview page (should come from input form)
2. Verify report content displays
3. Test "Download PDF" button (for free reports)
4. Test "Purchase Report" button (for paid reports)
5. Verify payment flow initiates correctly

**Expected Results**:
- ✅ Report preview displays correctly
- ✅ Free reports show "Download PDF" button
- ✅ Paid reports show "Purchase Report" button with price
- ✅ Payment button redirects to Stripe checkout
- ✅ Footer links remain accessible

---

### Scenario 4: Bundle Selection (`/ai-astrology/bundle`)

**URL Patterns**:
- `/ai-astrology/bundle?type=any-2`
- `/ai-astrology/bundle?type=all-3`
- `/ai-astrology/bundle?type=life-decision-pack`

**Steps**:
1. Navigate to bundle selection page
2. Verify bundle options display
3. Select reports for bundle
4. Verify pricing calculations
5. Proceed to payment

**Expected Results**:
- ✅ Bundle cards display correctly
- ✅ Report selection works
- ✅ Pricing shows savings correctly
- ✅ "Get Bundle" button redirects to input form with bundle params

---

### Scenario 5: Payment Flow

**Test Stripe Checkout**:
1. Select a paid report
2. Fill out input form
3. Proceed to preview
4. Click "Purchase Report"
5. Complete Stripe checkout
6. Verify redirect to success page

**Success Page** (`/ai-astrology/payment/success`):
- ✅ Displays success message
- ✅ Shows download PDF button
- ✅ Links back to AI section
- ✅ Footer links work

**Cancel Page** (`/ai-astrology/payment/cancel`):
- ✅ Displays cancellation message
- ✅ Links back to AI section
- ✅ Allows retry

---

### Scenario 6: Footer Links Testing

**Footer Sections**:
1. **Legal Links** (Desktop - always visible, Mobile - collapsible):
   - FAQ → `/ai-astrology/faq`
   - Privacy Policy → `/privacy`
   - Terms of Use → `/terms`
   - Disclaimer → `/disclaimer`
   - Refund Policy → `/refund`
   - Cookie Policy → `/cookies`

2. **Additional Information** (Desktop only):
   - Contact & Legal Info → `/contact`
   - Data Breach Policy → `/data-breach`
   - Dispute Resolution → `/disputes`

3. **Contact Emails**:
   - privacy@mindveda.net
   - legal@mindveda.net
   - security@mindveda.net

**Expected Results**:
- ✅ All links navigate correctly
- ✅ Legal pages load without orange Shell header
- ✅ Mobile collapsible section works
- ✅ Email links open mail client

---

### Scenario 7: Header Navigation

**Header Components**:
1. **Logo**: Links to `/ai-astrology` (home)
2. **"Generate Report" Button**: Links to `/ai-astrology/input?reportType=life-summary`

**Expected Results**:
- ✅ Logo always returns to AI section home
- ✅ CTA button initiates report flow
- ✅ Header is sticky (stays on scroll)

---

### Scenario 8: Cross-Page Navigation

**Test Navigation Flows**:
1. Landing → Input → Preview → Payment → Success
2. Landing → Bundle → Input → Preview → Payment
3. Any page → Footer link → Legal page → Back
4. Landing → FAQ → Back to landing

**Expected Results**:
- ✅ No orange Shell header/footer appears during navigation
- ✅ AI header/footer persists across all AI section pages
- ✅ Browser back/forward buttons work correctly
- ✅ Direct URL navigation works

---

### Scenario 9: Mobile Responsiveness

**Test on Mobile Viewport** (375px width):
1. Verify header collapses appropriately
2. Check footer collapsible section works
3. Test form inputs on mobile
4. Verify buttons are touch-friendly (min 44px height)
5. Check PWA install prompt appears (if supported)

**Expected Results**:
- ✅ All elements fit on mobile screen
- ✅ Touch targets are adequate size
- ✅ Footer legal section collapses on mobile
- ✅ Form is usable on mobile

---

### Scenario 10: Error Handling

**Test Error Scenarios**:
1. Invalid form data submission
2. Payment failure
3. Network errors during report generation
4. Missing query parameters

**Expected Results**:
- ✅ Error messages display clearly
- ✅ Users can retry failed operations
- ✅ No broken UI states
- ✅ Error boundaries catch React errors

---

## 🔗 Complete Link Reference

### Report Type Links
- Life Summary (Free): `/ai-astrology/input?reportType=life-summary`
- Marriage Timing: `/ai-astrology/input?reportType=marriage-timing`
- Career & Money: `/ai-astrology/input?reportType=career-money`
- Full Life: `/ai-astrology/input?reportType=full-life`
- Year Analysis: `/ai-astrology/input?reportType=year-analysis`
- Major Life Phase: `/ai-astrology/input?reportType=major-life-phase`
- Decision Support: `/ai-astrology/input?reportType=decision-support`

### Bundle Links
- Life Decision Pack: `/ai-astrology/bundle?type=life-decision-pack`
- All 3 Reports: `/ai-astrology/bundle?type=all-3`
- Any 2 Reports: `/ai-astrology/bundle?type=any-2`

### Navigation Links
- AI Section Home: `/ai-astrology`
- FAQ: `/ai-astrology/faq`
- Subscription: `/ai-astrology/subscription`

### Legal/Compliance Links
- Privacy: `/privacy`
- Terms: `/terms`
- Disclaimer: `/disclaimer`
- Refund: `/refund`
- Contact: `/contact`
- Cookies: `/cookies`
- Data Breach: `/data-breach`
- Disputes: `/disputes`
- Compliance: `/compliance`

---

## ✅ Acceptance Criteria

### Must Pass:
1. ✅ No orange Shell header/footer visible on any AI section page
2. ✅ All footer links navigate correctly
3. ✅ All header links work
4. ✅ Form submission works
5. ✅ Payment flow completes
6. ✅ PDF downloads work
7. ✅ Mobile responsive
8. ✅ Error handling works
9. ✅ Navigation between pages is smooth
10. ✅ Direct URL access works

### Visual Quality:
1. ✅ Consistent AI branding (purple/amber theme)
2. ✅ Professional appearance
3. ✅ Clear call-to-action buttons
4. ✅ Readable text and proper contrast
5. ✅ Smooth animations/transitions

---

## 🐛 Common Issues to Watch For

1. **Orange Header/Footer Flash**: Should never appear on AI routes
2. **Broken Links**: All footer/header links should work
3. **Form Validation**: Should catch invalid data before submission
4. **Payment Flow**: Should complete without errors
5. **Mobile Layout**: Should not have horizontal scroll
6. **PDF Generation**: Should download correctly
7. **Error Messages**: Should be user-friendly

---

## 📝 Testing Report Template

For each test scenario, document:
- ✅ Pass/Fail
- ⚠️ Issues found
- 📸 Screenshots (if issues found)
- 🔍 Browser/Device used
- ⏱️ Time taken

---

## 🚀 Quick Test Checklist

Use this checklist for quick smoke testing:

- [ ] Landing page loads without orange header/footer flash
- [ ] Header logo links to `/ai-astrology`
- [ ] "Generate Report" button works
- [ ] Footer links all work
- [ ] Input form validates correctly
- [ ] Preview page shows report content
- [ ] Payment flow initiates
- [ ] Success page displays
- [ ] Mobile view is usable
- [ ] All legal pages load without Shell header

---

**End of Testing Guide**

