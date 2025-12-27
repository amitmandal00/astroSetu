# AI Astrology Section - Quick Test Guide

## 🚀 Quick Start Testing

This is a condensed guide for rapid testing. For comprehensive testing, see `AI_ASTROLOGY_TESTING_CHECKLIST.md`.

---

## Critical Test Flows

### 1. Free Life Summary Flow (Most Important)
```
Landing Page → Input Form → Preview (Auto-generates) → View Report
```
**Test Points:**
- ✅ All landing page links work
- ✅ Form validates correctly (requires coordinates)
- ✅ Autocomplete place selection works
- ✅ Report generates automatically
- ✅ Report content displays correctly

### 2. Paid Report Flow
```
Landing Page → Input Form → Preview (Payment Gate) → Stripe Checkout → Payment Success → Preview (Full Report)
```
**Test Points:**
- ✅ Payment gate shows for paid reports
- ✅ Refund checkbox required before purchase
- ✅ Stripe checkout redirect works
- ✅ Payment success page verifies payment
- ✅ Full report generates after payment
- ✅ PDF download works

### 3. Subscription Flow
```
Landing Page → Subscription Page → Stripe Checkout → Payment Success → Subscription Dashboard
```
**Test Points:**
- ✅ Subscription page loads correctly
- ✅ Subscribe button creates checkout
- ✅ Payment success marks subscription active
- ✅ Daily guidance loads if subscribed

---

## Key Functional Tests

### Form Validation (Input Page)
- [ ] Name: Required, min 2 characters
- [ ] Date of Birth: Required, date picker works, max = today
- [ ] Time of Birth: Required, time picker works (24-hour format)
- [ ] Place: Required, autocomplete works, coordinates resolved
- [ ] Gender: Optional
- [ ] Submit button: Disabled until all valid + coordinates resolved

### Navigation Links
- [ ] All landing page CTAs → correct input form with reportType
- [ ] "#features" anchor link scrolls smoothly
- [ ] "Back to AI Astrology" links work
- [ ] FAQ links work
- [ ] Payment cancel → redirects correctly
- [ ] Payment success → redirects correctly

### Error Handling
- [ ] Missing sessionStorage → redirects to input form
- [ ] API failures → shows user-friendly error messages
- [ ] Invalid form data → shows validation errors
- [ ] Network errors → handled gracefully

### Mobile Testing (Critical Breakpoints)
- [ ] 320px (small mobile): No horizontal scroll, text readable
- [ ] 375px (iPhone SE): All buttons tappable
- [ ] 768px (tablet): Grid layouts adapt
- [ ] 1024px+ (desktop): Full layout visible

---

## Common Issues to Watch For

1. **Coordinate Resolution**
   - Place autocomplete must select a city (not just type)
   - Coordinates must be resolved before form submission
   - Check green confirmation message appears

2. **Session Management**
   - Data persists across page navigations
   - Payment verification persists after Stripe redirect
   - Missing data redirects appropriately

3. **Payment Flow**
   - Refund checkbox required before purchase
   - Payment token stored correctly
   - Paid reports require token for generation

4. **Loading States**
   - Forms show loading during submission
   - Reports show loading during generation
   - PDF shows loading during generation
   - Buttons disabled during async operations

5. **Mobile Touch Targets**
   - All buttons ≥ 44x44px
   - Form inputs easily tappable
   - Links easily tappable
   - No accidental double-taps

---

## Quick Test Checklist (10 Minutes)

### Landing Page (2 min)
- [ ] All CTAs link correctly
- [ ] #features anchor scrolls
- [ ] Responsive on mobile

### Input Form (3 min)
- [ ] All fields validate
- [ ] Place autocomplete works
- [ ] Coordinates resolve
- [ ] Submit works

### Preview/Report (3 min)
- [ ] Free report generates
- [ ] Paid report shows payment gate
- [ ] PDF download works (if paid)
- [ ] Error handling works

### Payment Flow (2 min)
- [ ] Checkout creation works
- [ ] Success page verifies payment
- [ ] Cancel page redirects correctly

---

## Browser Testing Priority

1. **Chrome/Edge** (Primary - test thoroughly)
2. **Safari** (iOS testing critical)
3. **Firefox** (Secondary)
4. **Mobile browsers** (Chrome Android, Safari iOS)

---

## Test Data

### Valid Test Input
- **Name**: "Test User"
- **DOB**: 1990-01-15
- **TOB**: 14:30 (2:30 PM)
- **Place**: "Delhi" (select from autocomplete)
- **Gender**: Any

### Expected Results
- Coordinates: ~28.6139, 77.2090 (Delhi)
- Form submits successfully
- Report generates (may require API keys for AI)

---

## Known Dependencies

### Required Environment Variables
- `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` (for AI report generation)
- `STRIPE_SECRET_KEY` (for payments)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (for checkout)

### API Requirements
- Prokerala API configured (for astrology calculations)
- AI API configured (for report generation)
- Stripe configured (for payments)

---

## 🐛 Report Issues

When reporting issues, include:
1. Browser and version
2. Device (desktop/mobile, screen size)
3. Steps to reproduce
4. Expected vs actual behavior
5. Console errors (if any)
6. Network tab errors (if any)

---

**Last Updated:** $(date)  
**Version:** 1.0

