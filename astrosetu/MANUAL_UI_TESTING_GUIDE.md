# 🧪 Manual UI Testing Guide

## Quick Start
1. Start the dev server: `npm run dev`
2. Open `http://localhost:3001` in your browser
3. Test on multiple devices/browsers
4. Use browser DevTools for responsive testing

---

## 🔍 Critical UI Tests (Must Do)

### 1. Login Page (`/login`)
**Test Steps:**
- [ ] Page loads without errors
- [ ] All form fields are visible and usable
- [ ] Email/Phone/OTP tabs switch correctly
- [ ] Input fields accept input
- [ ] "Remember me" checkbox works
- [ ] Submit button is enabled when form is valid
- [ ] Error messages display correctly
- [ ] Success redirects work
- [ ] 2FA flow works (if enabled)
- [ ] Close button (×) works in modals
- [ ] Click outside modal closes it
- [ ] ESC key closes modal

**Visual Checks:**
- [ ] Logo displays correctly
- [ ] Colors are consistent (saffron/orange theme)
- [ ] Text is readable
- [ ] Spacing looks good
- [ ] No overlapping elements
- [ ] No horizontal scroll

**Responsive:**
- [ ] Mobile (375px): Form fits, no horizontal scroll
- [ ] Tablet (768px): Layout adapts
- [ ] Desktop (1920px): Centered, max-width works

**Accessibility:**
- [ ] Tab through all fields works
- [ ] Focus indicators are visible
- [ ] Screen reader announces labels
- [ ] Keyboard navigation works

---

### 2. Kundli Page (`/kundli`)
**Test Steps:**
- [ ] Form displays correctly
- [ ] Date picker works
- [ ] Time input accepts valid format
- [ ] Place autocomplete works
- [ ] "Use Current Location" button works
- [ ] Form validation works
- [ ] Submit generates Kundli
- [ ] Results display correctly
- [ ] Chart visualizes correctly
- [ ] Download PDF works
- [ ] "Generate Life Report" button works

**Visual Checks:**
- [ ] Form layout is clean
- [ ] Results section displays well
- [ ] Chart is visible and readable
- [ ] No broken images
- [ ] Loading states show spinner

**Responsive:**
- [ ] Mobile: Form stacks vertically
- [ ] Desktop: Form uses grid layout

---

### 3. Wallet Page (`/wallet`)
**Test Steps:**
- [ ] Balance displays correctly
- [ ] Transaction history shows
- [ ] "Add Money" button opens modal
- [ ] Payment modal displays correctly
- [ ] **Close button (×) works** ⚠️ CRITICAL
- [ ] Click outside closes modal
- [ ] ESC key closes modal
- [ ] Amount input accepts numbers
- [ ] Validation works (min/max)
- [ ] Payment methods work
- [ ] UPI payment flow works
- [ ] Bank transfer flow works
- [ ] Success updates balance

**Visual Checks:**
- [ ] Modal is centered
- [ ] Close button is visible
- [ ] Form fields are clear
- [ ] Error messages are visible
- [ ] Success messages display

---

### 4. Profile Page (`/profile`)
**Test Steps:**
- [ ] User info displays
- [ ] "Edit Profile" button works
- [ ] Save changes works
- [ ] Cancel button works
- [ ] Birth details form works
- [ ] 2FA setup works
- [ ] 2FA QR code displays
- [ ] Logout works

**Visual Checks:**
- [ ] Profile card displays correctly
- [ ] Edit mode shows form
- [ ] 2FA section is clear

---

### 5. Services Page (`/services`)
**Test Steps:**
- [ ] Sidebar navigation works
- [ ] Service cards display
- [ ] Links navigate correctly
- [ ] "View All Paid Services" works
- [ ] Service icons display
- [ ] Hover effects work

**Visual Checks:**
- [ ] Grid layout works
- [ ] Cards are well-spaced
- [ ] Icons are visible
- [ ] Text is readable

---

## 📱 Responsive Testing

### Mobile (iPhone SE - 375px)
Test on:
- [ ] Chrome Mobile
- [ ] Safari iOS
- [ ] Real device if possible

**Check:**
- [ ] No horizontal scroll
- [ ] Text is readable (no zoom needed)
- [ ] Buttons are touch-friendly (44x44px min)
- [ ] Forms are usable
- [ ] Navigation works
- [ ] Modals fit screen
- [ ] Bottom nav visible

### Tablet (iPad - 768px)
**Check:**
- [ ] Layout adapts (2 columns)
- [ ] Forms are comfortable
- [ ] Navigation works
- [ ] Cards display in grid

### Desktop (1920px)
**Check:**
- [ ] Content is centered
- [ ] Max-width constraints work
- [ ] No stretched layouts
- [ ] Hover effects work
- [ ] Sidebars work

---

## 🌐 Cross-Browser Testing

### Chrome/Edge
- [ ] All features work
- [ ] Styling is correct
- [ ] No console errors
- [ ] Performance is good

### Firefox
- [ ] All features work
- [ ] Styling is correct
- [ ] No console errors

### Safari
- [ ] All features work
- [ ] Styling is correct
- [ ] iOS Safari works
- [ ] No console errors

---

## ♿ Accessibility Testing

### Keyboard Navigation
- [ ] Tab through all interactive elements
- [ ] Focus indicators are visible
- [ ] Enter/Space activate buttons
- [ ] ESC closes modals
- [ ] Arrow keys navigate menus

### Screen Reader (VoiceOver/NVDA)
- [ ] All images have alt text
- [ ] Form labels are announced
- [ ] Buttons have descriptive text
- [ ] Error messages are announced
- [ ] Page structure is clear

### Visual
- [ ] Text contrast meets WCAG AA (4.5:1)
- [ ] Color isn't only way to convey info
- [ ] Focus indicators are visible
- [ ] Text can be resized up to 200%

---

## 🎨 Visual Design Testing

### Colors
- [ ] Consistent saffron/orange theme
- [ ] Error states use red/rose
- [ ] Success states use green/emerald
- [ ] No hardcoded colors

### Typography
- [ ] Font sizes are consistent
- [ ] Line heights are readable
- [ ] Text doesn't overflow
- [ ] Headings hierarchy is clear

### Spacing
- [ ] Consistent padding/margins
- [ ] Cards have proper spacing
- [ ] Sections are well-separated

### Shadows & Borders
- [ ] Consistent shadow styles
- [ ] Border radius is consistent
- [ ] Borders are visible

---

## 🐛 Common Bugs to Check

### Layout Issues
- [ ] No horizontal scroll
- [ ] No overlapping elements
- [ ] No broken layouts
- [ ] No content overflow

### Visual Issues
- [ ] No broken images
- [ ] No missing icons
- [ ] No color inconsistencies
- [ ] No font loading issues

### Interaction Issues
- [ ] No unclickable buttons
- [ ] No broken forms
- [ ] No stuck modals
- [ ] No broken navigation
- [ ] No infinite loading

---

## 🔄 State Testing

### Loading States
- [ ] Spinners display
- [ ] Buttons disabled during loading
- [ ] Forms disabled during submission
- [ ] No duplicate submissions

### Error States
- [ ] Error messages display
- [ ] Error styling is consistent
- [ ] Retry buttons work
- [ ] Network errors handled

### Success States
- [ ] Success messages display
- [ ] Success styling is consistent
- [ ] Redirects work after success

---

## 📊 Performance Testing

### Visual Performance
- [ ] No layout shift (CLS)
- [ ] Images load efficiently
- [ ] Animations are smooth (60fps)
- [ ] No janky scrolling

### Loading Performance
- [ ] Initial load is fast
- [ ] Images lazy load
- [ ] Code splits work

---

## 🧪 Testing Tools

### Browser DevTools
1. **Chrome DevTools**
   - F12 → Lighthouse (Performance, Accessibility, SEO)
   - F12 → Console (check for errors)
   - F12 → Network (check loading)
   - Ctrl+Shift+M (responsive mode)

2. **Accessibility**
   - Chrome: Lighthouse → Accessibility
   - Firefox: Accessibility Inspector
   - axe DevTools extension

3. **Responsive Design**
   - Chrome: Device Toolbar (Ctrl+Shift+M)
   - Test multiple device sizes
   - Test portrait/landscape

### Manual Testing Checklist
- [ ] Test with slow 3G network
- [ ] Test with JavaScript disabled (progressive enhancement)
- [ ] Test with different screen sizes
- [ ] Test with keyboard only
- [ ] Test with screen reader

---

## ✅ Testing Priority

### Critical (Must Fix Before Launch)
1. ✅ Close button works in all modals
2. ✅ Forms submit correctly
3. ✅ Navigation works
4. ✅ Mobile responsive
5. ✅ No console errors
6. ✅ Accessibility basics

### Important (Should Fix)
1. ✅ Consistent styling
2. ✅ Smooth animations
3. ✅ Error handling
4. ✅ Loading states
5. ✅ Cross-browser compatibility

### Nice to Have (Can Fix Later)
1. ✅ Advanced animations
2. ✅ Micro-interactions
3. ✅ Advanced accessibility
4. ✅ Performance optimizations

---

## 📝 Testing Report Template

```
Date: ___________
Tester: ___________
Browser: ___________
Device: ___________

### Pages Tested:
- [ ] Home
- [ ] Login
- [ ] Kundli
- [ ] Wallet
- [ ] Profile
- [ ] Services

### Issues Found:
1. [Issue description]
   - Page: ___________
   - Steps to reproduce: ___________
   - Expected: ___________
   - Actual: ___________
   - Screenshot: ___________

### Notes:
___________
```

---

**Last Updated**: $(date)
**Status**: Ready for Manual Testing

