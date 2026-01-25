# AI Section End-to-End Testing Guide

**Test Date**: $(date)  
**Version**: Production Ready

---

## 📋 Pre-Testing Checklist

### Prerequisites
- [ ] Development server running on `http://localhost:3001`
- [ ] All dependencies installed (`npm install`)
- [ ] Environment variables configured (Resend API key, etc.)
- [ ] Database connection working (if applicable)

---

## 🧪 Automated Test Suite

### Run Automated Tests
```bash
cd astrosetu
npm run dev  # Start server in one terminal
./test-ai-section-e2e.sh  # Run tests in another terminal
```

### Test Coverage
- ✅ Header functionality
- ✅ Footer links and navigation
- ✅ All routing (13 routes)
- ✅ Deep links (6 types)
- ✅ Form functionality
- ✅ Email API endpoints
- ✅ Orange header/footer fix verification

---

## 📝 Manual Testing Checklist

### 1. Header Tests

#### 1.1 Logo and Branding
- [ ] Logo displays correctly on `/ai-astrology`
- [ ] Logo is clickable and navigates to `/ai-astrology`
- [ ] Logo has proper hover state
- [ ] "AstroSetu AI" text displays correctly
- [ ] "Automated Astrology Reports" subtitle visible on desktop

#### 1.2 CTA Button
- [ ] "Generate Report" button visible (desktop)
- [ ] "Start" button visible (mobile)
- [ ] Button navigates to `/ai-astrology/input?reportType=life-summary`
- [ ] Button has proper hover state
- [ ] Button has minimum 44px touch target

#### 1.3 Sub-header Banner
- [ ] Banner displays: "Educational guidance only"
- [ ] Banner displays: "Fully automated"
- [ ] Banner displays: "No live support"
- [ ] Banner has correct styling (amber gradient)

---

### 2. Footer Tests

#### 2.1 Branding Section
- [ ] Logo displays in footer
- [ ] Copyright year shows current year (2026)
- [ ] "Operated by MindVeda" displays
- [ ] ABN: 60 656 401 253 displays
- [ ] Description text: "Fully automated platform..."

#### 2.2 Legal Links (Desktop)
- [ ] FAQ link → `/ai-astrology/faq`
- [ ] Privacy Policy link → `/privacy`
- [ ] Terms of Use link → `/terms`
- [ ] Disclaimer link → `/disclaimer`
- [ ] Refund Policy link → `/refund`
- [ ] Cookie Policy link → `/cookies`
- [ ] Contact link → `/contact`
- [ ] Data Breach Policy link → `/data-breach`
- [ ] Dispute Resolution link → `/disputes`

#### 2.3 Legal Links (Mobile - Collapsible)
- [ ] "Legal & Policies" button is clickable
- [ ] Button expands/collapses correctly
- [ ] All links work when expanded
- [ ] Touch targets are minimum 44px

#### 2.4 Contact Emails
- [ ] privacy@mindveda.net (mailto link works)
- [ ] legal@mindveda.net (mailto link works)
- [ ] security@mindveda.net (mailto link works)
- [ ] Email links open default email client

#### 2.5 Footer Disclaimer
- [ ] Important Notice section displays
- [ ] ABN information correct
- [ ] "No change-of-mind refunds" message visible

---

### 3. Routing Tests

#### 3.1 Core AI Pages
- [ ] `/ai-astrology` - Landing page loads
- [ ] `/ai-astrology/input` - Input form loads
- [ ] `/ai-astrology/faq` - FAQ page loads
- [ ] `/ai-astrology/bundle` - Bundle page loads
- [ ] `/ai-astrology/subscription` - Subscription page loads
- [ ] `/ai-astrology/preview` - Preview page loads (if applicable)

#### 3.2 Legal Pages (Footer Links)
- [ ] `/privacy` - Privacy Policy loads
- [ ] `/terms` - Terms of Use loads
- [ ] `/disclaimer` - Disclaimer loads
- [ ] `/refund` - Refund Policy loads
- [ ] `/cookies` - Cookie Policy loads
- [ ] `/contact` - Contact page loads
- [ ] `/data-breach` - Data Breach Policy loads
- [ ] `/disputes` - Dispute Resolution loads

#### 3.3 Payment Pages
- [ ] `/ai-astrology/payment/success` - Success page loads
- [ ] `/ai-astrology/payment/cancel` - Cancel page loads

#### 3.4 404 Handling
- [ ] Invalid routes show proper 404 page
- [ ] 404 page has link back to AI section

---

### 4. Deep Link Tests

#### 4.1 Report Type Deep Links
- [ ] `/ai-astrology/input?reportType=life-summary` → Form pre-filled with Life Summary
- [ ] `/ai-astrology/input?reportType=year-analysis` → Form pre-filled with Year Analysis
- [ ] `/ai-astrology/input?reportType=marriage-timing` → Form pre-filled with Marriage Timing
- [ ] `/ai-astrology/input?reportType=career-money` → Form pre-filled with Career & Money
- [ ] `/ai-astrology/input?reportType=full-life` → Form pre-filled with Full Life
- [ ] `/ai-astrology/input?reportType=major-life-phase` → Form pre-filled with Major Life Phase
- [ ] `/ai-astrology/input?reportType=decision-support` → Form pre-filled with Decision Support

#### 4.2 Bundle Deep Links
- [ ] `/ai-astrology/input?bundle=any-2` → Bundle form (Any 2 reports)
- [ ] `/ai-astrology/input?bundle=all-3` → Bundle form (All 3 reports)
- [ ] `/ai-astrology/input?bundle=any-2&reports=life-summary,marriage-timing` → Pre-selected reports

#### 4.3 Query Parameter Combinations
- [ ] Multiple query params work together
- [ ] Invalid query params handled gracefully
- [ ] Form state persists with query params

---

### 5. Form Tests

#### 5.1 Input Form (`/ai-astrology/input`)
- [ ] Name field accepts input
- [ ] Date of Birth field accepts valid dates
- [ ] Time of Birth field accepts valid times
- [ ] Place field has autocomplete
- [ ] Place autocomplete resolves coordinates
- [ ] Gender selection works (Male/Female)
- [ ] Form validation shows errors for invalid input
- [ ] Required fields marked appropriately
- [ ] Form submission works
- [ ] Loading state displays during submission
- [ ] Error messages display correctly

#### 5.2 Contact Form (`/contact`)
- [ ] Name field accepts input
- [ ] Email field validates email format
- [ ] Subject field accepts input
- [ ] Message field accepts long text
- [ ] Category dropdown works (if applicable)
- [ ] Form validation works
- [ ] Submission shows success message
- [ ] Submission sends email (check logs/Resend)
- [ ] Form resets after successful submission

---

### 6. Email Tests

#### 6.1 Contact Form Email
- [ ] User receives acknowledgement email
- [ ] Internal notification email sent to admin
- [ ] Email contains submitted data
- [ ] Email templates render correctly
- [ ] Email links work (if any)
- [ ] Email sent via Resend API (check Resend dashboard)

#### 6.2 Email API Endpoint
- [ ] `/api/contact` accepts POST requests
- [ ] API validates required fields
- [ ] API returns appropriate status codes
- [ ] API handles errors gracefully
- [ ] API rate limiting works
- [ ] API logs requests (check server logs)

---

### 7. Orange Header/Footer Fix

#### 7.1 Visual Test
- [ ] No orange header flash on `/ai-astrology`
- [ ] No orange footer flash on `/ai-astrology`
- [ ] No orange header flash on `/` (root)
- [ ] No orange header flash on `/privacy`
- [ ] No orange header flash on `/terms`
- [ ] No orange header flash on `/contact`
- [ ] AI header/footer show immediately on AI routes

#### 7.2 Technical Verification
- [ ] `data-ai-route="true"` attribute on `<html>` for AI routes
- [ ] Critical CSS injects before React hydration
- [ ] Blocking script runs before rendering
- [ ] Shell component hidden on AI routes
- [ ] No flash on page refresh

---

### 8. Cross-Browser Tests

#### 8.1 Desktop Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

#### 8.2 Mobile Browsers
- [ ] Chrome Mobile
- [ ] Safari Mobile (iOS)
- [ ] Firefox Mobile

#### 8.3 Responsive Design
- [ ] Mobile viewport (< 768px)
- [ ] Tablet viewport (768px - 1024px)
- [ ] Desktop viewport (> 1024px)
- [ ] All elements scale correctly
- [ ] Touch targets minimum 44px

---

### 9. Performance Tests

#### 9.1 Page Load
- [ ] Landing page loads < 2 seconds
- [ ] Form page loads < 2 seconds
- [ ] Legal pages load < 1 second
- [ ] No layout shift (CLS)

#### 9.2 API Performance
- [ ] Contact API responds < 500ms
- [ ] Form submission completes < 2 seconds
- [ ] No API timeouts

---

### 10. Accessibility Tests

#### 10.1 Keyboard Navigation
- [ ] All links accessible via Tab
- [ ] Forms navigable with keyboard
- [ ] Focus indicators visible
- [ ] Skip to content works (if implemented)

#### 10.2 Screen Readers
- [ ] All images have alt text
- [ ] Form labels properly associated
- [ ] Headings in logical order
- [ ] ARIA attributes where needed

---

## 🐛 Known Issues / Defects to Fix

### Before Production

#### Critical
- [ ] Verify all footer links work
- [ ] Test email delivery end-to-end
- [ ] Verify no console errors
- [ ] Test all form validations
- [ ] Verify orange header/footer fix works on all routes

#### High Priority
- [ ] Mobile footer collapse/expand works
- [ ] Deep links work correctly
- [ ] Form data persists correctly
- [ ] Email templates render correctly

#### Medium Priority
- [ ] Performance optimizations
- [ ] Accessibility improvements
- [ ] Error handling improvements

---

## ✅ Sign-Off Checklist

### Before Going to Production

- [ ] All automated tests pass
- [ ] All manual tests completed
- [ ] No critical bugs found
- [ ] All email functionality verified
- [ ] All routing verified
- [ ] All deep links verified
- [ ] Orange header/footer fix verified
- [ ] Cross-browser testing completed
- [ ] Mobile testing completed
- [ ] Performance acceptable
- [ ] Accessibility checked

---

## 📊 Test Results Template

```markdown
Test Date: [Date]
Tester: [Name]
Environment: [Production/Staging]

Results:
- Header Tests: X/X passed
- Footer Tests: X/X passed
- Routing Tests: X/X passed
- Deep Link Tests: X/X passed
- Form Tests: X/X passed
- Email Tests: X/X passed
- Orange Header/Footer Fix: ✅/❌
- Cross-Browser: ✅/❌
- Performance: ✅/❌

Issues Found:
1. [Issue description]
2. [Issue description]

Status: ✅ Ready for Production / ❌ Needs Fixes
```

---

## 🚀 Next Steps

1. Run automated test suite
2. Complete manual testing checklist
3. Fix any defects found
4. Re-test fixed issues
5. Get sign-off
6. Deploy to production

