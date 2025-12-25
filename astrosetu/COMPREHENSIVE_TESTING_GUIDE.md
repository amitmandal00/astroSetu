# 🧪 AstroSetu - Comprehensive Testing Guide

## 🎯 Testing Strategy

This guide covers **thorough testing** for both **web** and **mobile** before production launch.

---

## 📋 Pre-Testing Setup

### 1. Ensure Dev Server is Running
```bash
cd astrosetu
npm run dev
```

### 2. Clear Browser Cache
- **Chrome/Edge**: `Ctrl+Shift+Delete` (Windows) or `Cmd+Shift+Delete` (Mac)
- **Firefox**: `Ctrl+Shift+Delete`
- **Safari**: `Cmd+Option+E`

### 3. Open Browser DevTools
- **Chrome/Edge**: `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
- **Firefox**: `F12`
- **Safari**: `Cmd+Option+I` (enable Developer menu first)

---

## 🌐 Web Browser Testing

### Desktop Browsers to Test

#### Chrome (Latest)
- [ ] Home page loads correctly
- [ ] All navigation links work
- [ ] All forms submit correctly
- [ ] No console errors
- [ ] No network errors
- [ ] Images load properly
- [ ] Animations work smoothly

#### Firefox (Latest)
- [ ] Home page loads correctly
- [ ] All navigation links work
- [ ] All forms submit correctly
- [ ] No console errors
- [ ] CSS renders correctly
- [ ] JavaScript functions work

#### Safari (Latest - Mac only)
- [ ] Home page loads correctly
- [ ] All navigation links work
- [ ] All forms submit correctly
- [ ] No console errors
- [ ] WebKit-specific features work
- [ ] Touch events work (if MacBook has touch)

#### Edge (Latest)
- [ ] Home page loads correctly
- [ ] All navigation links work
- [ ] All forms submit correctly
- [ ] No console errors
- [ ] Edge-specific features work

---

## 📱 Mobile Browser Testing

### iOS Safari (iPhone/iPad)
- [ ] Home page loads correctly
- [ ] Touch interactions work
- [ ] Bottom navigation works
- [ ] Forms are easy to fill
- [ ] Keyboard doesn't cover inputs
- [ ] Scrolling is smooth
- [ ] No horizontal scrolling issues
- [ ] Images load properly
- [ ] No console errors

### Chrome Mobile (Android)
- [ ] Home page loads correctly
- [ ] Touch interactions work
- [ ] Bottom navigation works
- [ ] Forms are easy to fill
- [ ] Keyboard doesn't cover inputs
- [ ] Scrolling is smooth
- [ ] No horizontal scrolling issues
- [ ] Images load properly
- [ ] No console errors

### Samsung Internet (Android)
- [ ] Home page loads correctly
- [ ] All features work
- [ ] No rendering issues

---

## ✅ Feature-by-Feature Testing

### 1. Home Page (`/`)

#### Desktop Testing
- [ ] Hero section displays correctly
- [ ] All CTA buttons work (Generate Kundli, Match Kundli, Chat)
- [ ] Feature cards are clickable
- [ ] Navigation links work
- [ ] Trust indicators display
- [ ] Footer links work
- [ ] Logo links to home
- [ ] Language switcher works
- [ ] No layout issues at different window sizes

#### Mobile Testing
- [ ] Hero section fits on screen
- [ ] CTA buttons are easily tappable (min 44x44px)
- [ ] Feature cards are scrollable horizontally
- [ ] Bottom navigation works
- [ ] Top navigation collapses correctly
- [ ] Text is readable without zooming
- [ ] Images load and display correctly
- [ ] No horizontal scrolling

---

### 2. Kundli Generation (`/kundli`)

#### Desktop Testing
- [ ] Form loads correctly
- [ ] Name field accepts input
- [ ] Gender selection works (radio buttons)
- [ ] Date fields (Day/Month/Year) work
- [ ] Time fields (Hours/Minutes/Seconds) work
- [ ] Place autocomplete works
- [ ] "Use Current Location" button works
- [ ] "Fill Current Time" button works
- [ ] Advanced Settings toggle works
- [ ] Form validation works (required fields)
- [ ] Submit button shows loading state
- [ ] Results display correctly
- [ ] All sections show: Ascendant, Rashi, Nakshatra, Planets, Dosha
- [ ] Chart visualization displays
- [ ] Error messages display on failure
- [ ] PDF download button works (if implemented)

#### Mobile Testing
- [ ] Form fits on screen
- [ ] All inputs are easily tappable
- [ ] Keyboard doesn't cover inputs
- [ ] Date/time pickers work on mobile
- [ ] Place autocomplete works on mobile
- [ ] Submit button is easily tappable
- [ ] Results are scrollable
- [ ] Chart visualization works on mobile
- [ ] No horizontal scrolling

#### Edge Cases
- [ ] Invalid date (e.g., Feb 30) shows error
- [ ] Invalid time (e.g., 25:00) shows error
- [ ] Empty required fields show validation
- [ ] Very long names handled correctly
- [ ] Special characters in name handled

---

### 3. Marriage Matching (`/match`)

#### Desktop Testing
- [ ] Both Person A and B forms work
- [ ] All date/time/place inputs work
- [ ] "Match Now" button works
- [ ] Results display with compatibility score
- [ ] Guna breakdown displays correctly
- [ ] Verdict badge shows correct color
- [ ] Dosha analysis for both persons displays
- [ ] Guidance section appears
- [ ] PDF download button works

#### Mobile Testing
- [ ] Forms are scrollable
- [ ] Both forms work on mobile
- [ ] Results display correctly
- [ ] All sections are readable
- [ ] Buttons are easily tappable

#### Edge Cases
- [ ] Matching with same person shows appropriate message
- [ ] Very different birth times handled
- [ ] Invalid inputs show errors

---

### 4. Horoscope (`/horoscope`)

#### Desktop Testing
- [ ] Tab switching works (Daily/Weekly/Monthly/Yearly)
- [ ] Sign selection dropdown works
- [ ] Date selection works (for daily/weekly)
- [ ] Month selection works (for monthly)
- [ ] Year selection works (for yearly)
- [ ] "Get Horoscope" button works
- [ ] Results display for each mode
- [ ] All 12 signs work
- [ ] Zodiac icons display
- [ ] Images load correctly

#### Mobile Testing
- [ ] Tabs are easily tappable
- [ ] Sign dropdown works on mobile
- [ ] Date/month/year pickers work
- [ ] Results are scrollable
- [ ] No layout issues

#### Edge Cases
- [ ] Future dates handled correctly
- [ ] Past dates handled correctly
- [ ] Invalid dates show error

---

### 5. Panchang (`/panchang`)

#### Desktop Testing
- [ ] Date input works
- [ ] Place input works
- [ ] "Get Panchang" button works
- [ ] Results display correctly
- [ ] All elements show: Tithi, Nakshatra, Yoga, Karana
- [ ] Sunrise/sunset times display
- [ ] Rahu Kaal displays
- [ ] Abhijit Muhurat displays
- [ ] All timing cards display

#### Mobile Testing
- [ ] Date picker works on mobile
- [ ] Place input works
- [ ] Results are scrollable
- [ ] All information readable

---

### 6. Muhurat (`/muhurat`)

#### Desktop Testing
- [ ] Event type selection works
- [ ] Date input works
- [ ] "Find Muhurat" button works
- [ ] Auspicious timings display
- [ ] Avoid timings display
- [ ] Quality indicators show
- [ ] All event types work

#### Mobile Testing
- [ ] Event type dropdown works
- [ ] Date picker works
- [ ] Results display correctly

---

### 7. Numerology (`/numerology`)

#### Desktop Testing
- [ ] Name input accepts text
- [ ] "Calculate" button works
- [ ] All numbers display: Life Path, Destiny, Soul, Personality
- [ ] Analysis text appears
- [ ] Lucky numbers display
- [ ] Lucky colors display
- [ ] Lucky days display

#### Mobile Testing
- [ ] Name input works
- [ ] Results display correctly
- [ ] All information readable

#### Edge Cases
- [ ] Empty name shows error
- [ ] Very long names handled
- [ ] Special characters handled
- [ ] Numbers in name handled

---

### 8. Remedies (`/remedies`)

#### Desktop Testing
- [ ] Planet selection dropdown works
- [ ] Issue input works
- [ ] "Get Remedies" button works
- [ ] Remedies display in grid
- [ ] Images load correctly
- [ ] Icons display
- [ ] Instructions are clear
- [ ] Benefits listed

#### Mobile Testing
- [ ] Dropdowns work on mobile
- [ ] Results are scrollable
- [ ] Images load correctly

---

### 9. User Authentication

#### Registration (`/login` - Register Tab)
- [ ] Registration form works
- [ ] Email validation works
- [ ] Password requirements (if any)
- [ ] Success message appears
- [ ] User redirected after registration
- [ ] Profile created in database
- [ ] Works on mobile

#### Login (`/login` - Login Tab)
- [ ] Login form works
- [ ] Invalid credentials show error
- [ ] Success redirects correctly
- [ ] Session persists on page refresh
- [ ] Works on mobile

#### Logout
- [ ] Logout button works
- [ ] Session cleared
- [ ] Redirected to home
- [ ] Works on mobile

---

### 10. Profile Management (`/profile`)

#### Desktop Testing
- [ ] Profile page loads user data
- [ ] Edit name works
- [ ] Edit phone works
- [ ] Birth details save correctly
- [ ] Changes persist after refresh
- [ ] Avatar displays correctly

#### Mobile Testing
- [ ] Profile page loads
- [ ] Edit forms work
- [ ] Save button works
- [ ] Changes persist

---

### 11. Wallet (`/wallet`)

#### Desktop Testing
- [ ] Wallet page loads
- [ ] Balance displays correctly
- [ ] Transaction history shows
- [ ] Date formatting works
- [ ] Empty state works
- [ ] "Add Money" button opens modal
- [ ] Amount input validation works
- [ ] Payment modal displays correctly
- [ ] Razorpay checkout opens (if configured)
- [ ] Mock payment works (if not configured)
- [ ] Payment success updates wallet
- [ ] Transaction appears in history
- [ ] Error handling works

#### Mobile Testing
- [ ] Wallet page loads
- [ ] Balance visible
- [ ] Transaction history scrollable
- [ ] Add Money button easily tappable
- [ ] Payment modal works on mobile
- [ ] Payment flow works

---

### 12. Chat System

#### Chat Session Creation
- [ ] Can create session from astrologer page
- [ ] Session appears in chat history
- [ ] Welcome message appears
- [ ] Works on mobile

#### Chat Functionality (`/chat/[sessionId]`)
- [ ] Messages send successfully
- [ ] Messages appear in real-time
- [ ] Typing indicator works
- [ ] Auto-scroll works
- [ ] Message timestamps display
- [ ] Session end works
- [ ] Error handling works (network issues)
- [ ] Works on mobile

#### Chat History (`/chat`)
- [ ] All sessions list correctly
- [ ] Status badges show correctly
- [ ] Date formatting works
- [ ] Click to open session works
- [ ] Empty state displays correctly
- [ ] Works on mobile

---

### 13. Astrologers

#### Astrologers List (`/astrologers`)
- [ ] All astrologers display
- [ ] Search works
- [ ] Filters work
- [ ] Chat button works
- [ ] Call button works
- [ ] Profile links work
- [ ] Works on mobile

#### Astrologer Profile (`/astrologers/[id]`)
- [ ] Profile displays correctly
- [ ] Consultation type selection works
- [ ] Payment method selection works
- [ ] Start consultation button works
- [ ] Works on mobile

---

### 14. Other Pages

#### Puja (`/puja`)
- [ ] All puja services display
- [ ] Images load
- [ ] Booking flow works
- [ ] Works on mobile

#### Sessions (`/sessions`)
- [ ] All sessions display
- [ ] Filters work
- [ ] Join button works
- [ ] Works on mobile

#### Community (`/community`)
- [ ] Posts display
- [ ] Search works
- [ ] Filters work
- [ ] Works on mobile

#### Learn (`/learn`)
- [ ] Courses display
- [ ] Articles display
- [ ] Links work
- [ ] Works on mobile

---

## 🎨 UI/UX Testing

### Responsive Design

#### Desktop (> 1024px)
- [ ] Layout uses full width appropriately
- [ ] Navigation is horizontal
- [ ] Cards are in grid layout
- [ ] Text is readable
- [ ] Images are appropriately sized

#### Tablet (768px - 1024px)
- [ ] Layout adapts correctly
- [ ] Navigation works
- [ ] Cards adjust to 2 columns
- [ ] Text remains readable
- [ ] Touch targets adequate

#### Mobile (< 768px)
- [ ] Layout is single column
- [ ] Bottom navigation visible
- [ ] Top navigation collapses
- [ ] Cards stack vertically
- [ ] Text is readable without zoom
- [ ] Touch targets are min 44x44px
- [ ] No horizontal scrolling

### Loading States
- [ ] Loading spinners appear
- [ ] Loading text is clear
- [ ] No flickering on load
- [ ] Skeleton screens (if implemented)

### Error Handling
- [ ] Error messages are clear
- [ ] Error boundaries catch crashes
- [ ] Network errors handled gracefully
- [ ] 404 pages work
- [ ] Invalid routes handled
- [ ] Form validation errors clear

---

## ⚡ Performance Testing

### Page Load Times
- [ ] Home page loads < 3s
- [ ] Other pages load < 2s
- [ ] Images load progressively
- [ ] No layout shift (CLS)
- [ ] First Contentful Paint < 1.5s

### API Performance
- [ ] API calls complete < 2s
- [ ] No unnecessary API calls
- [ ] Polling doesn't overload server
- [ ] Caching works correctly

### Mobile Performance
- [ ] Pages load quickly on 3G
- [ ] Images are optimized
- [ ] No memory leaks
- [ ] Smooth scrolling

---

## 🔒 Security Testing

### Authentication
- [ ] API routes require authentication
- [ ] Session tokens work correctly
- [ ] Logout clears session
- [ ] Unauthorized access blocked

### Data Security
- [ ] Sensitive data not exposed
- [ ] API keys not in client code
- [ ] Input validation on server
- [ ] XSS protection works
- [ ] CSRF protection works

---

## 🌍 Browser Compatibility

### Desktop
- [ ] Chrome (latest) ✅
- [ ] Firefox (latest) ✅
- [ ] Safari (latest) ✅
- [ ] Edge (latest) ✅

### Mobile
- [ ] Chrome Mobile (Android) ✅
- [ ] Safari iOS (iPhone/iPad) ✅
- [ ] Samsung Internet (Android) ✅

---

## 📝 Testing Checklist Summary

### Critical Features (Must Work)
- [ ] All 7 astrology features work
- [ ] User authentication works
- [ ] Payment flow works
- [ ] Chat functionality works
- [ ] Profile management works

### UI/UX (Must Work)
- [ ] Responsive design works
- [ ] Navigation works
- [ ] Loading states work
- [ ] Error handling works

### Performance (Should Work)
- [ ] Pages load quickly
- [ ] API calls are fast
- [ ] No memory leaks

### Browser Compatibility (Should Work)
- [ ] Works on major browsers
- [ ] Works on mobile browsers

---

## 🚨 Common Issues to Check

### Desktop
- [ ] No horizontal scrolling
- [ ] No layout breaks
- [ ] All buttons clickable
- [ ] Forms submit correctly
- [ ] No console errors

### Mobile
- [ ] No horizontal scrolling
- [ ] Keyboard doesn't cover inputs
- [ ] Touch targets adequate
- [ ] Text readable without zoom
- [ ] Bottom navigation works
- [ ] No console errors

---

## 📊 Testing Report Template

After testing, create a report:

```markdown
# Testing Report - [Date]

## Tested By: [Your Name]

## Browsers Tested
- [ ] Chrome Desktop
- [ ] Firefox Desktop
- [ ] Safari Desktop
- [ ] Edge Desktop
- [ ] Chrome Mobile
- [ ] Safari iOS

## Issues Found
1. [Issue description]
   - Browser: [Browser]
   - Severity: [Critical/High/Medium/Low]
   - Status: [Fixed/Pending]

## Features Tested
- [ ] All 7 astrology features
- [ ] Authentication
- [ ] Payments
- [ ] Chat
- [ ] Profile

## Overall Status
- [ ] Ready for production
- [ ] Needs fixes before launch
```

---

## 🎯 Ready for Launch When

- [ ] All critical features work on all browsers
- [ ] Mobile experience is smooth
- [ ] No critical bugs
- [ ] Performance acceptable
- [ ] Error handling robust
- [ ] Security verified

---

**Start Testing**: Open `http://localhost:3001` and go through this checklist systematically!

