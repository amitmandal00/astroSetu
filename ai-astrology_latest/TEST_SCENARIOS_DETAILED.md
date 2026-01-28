# Detailed Test Scenarios for AstroSetu

## Table of Contents
1. [Authentication Flow](#authentication-flow)
2. [Kundli Generation Flow](#kundli-generation-flow)
3. [Horoscope Features](#horoscope-features)
4. [Match Kundli Flow](#match-kundli-flow)
5. [Push Notifications Flow](#push-notifications-flow)
6. [Payment & Subscription Flow](#payment--subscription-flow)
7. [Reports Generation](#reports-generation)
8. [Mobile App Flows](#mobile-app-flows)
9. [Error Scenarios](#error-scenarios)
10. [Edge Cases](#edge-cases)

---

## Authentication Flow

### Scenario 1: New User Registration
**Objective**: Verify new user can create an account

**Preconditions**: 
- User is not logged in
- Browser supports localStorage

**Steps**:
1. Navigate to `/login` or `/register`
2. Click "Create Account" or "Sign Up" link
3. Fill registration form:
   - Name: "John Doe"
   - Email: "john.doe@example.com"
   - Password: "SecurePass123!"
   - Phone (optional): "+91 9876543210"
4. Click "Register" or "Sign Up"
5. Wait for response

**Expected Results**:
- ✅ Registration successful
- ✅ User redirected to home page or onboarding
- ✅ Success message displayed
- ✅ User session created
- ✅ Profile accessible at `/profile`

**Verification Points**:
- Check browser console for errors
- Verify `localStorage` has user data
- Check network tab for successful API call
- Verify user can access protected routes

**Failure Cases to Test**:
- Duplicate email
- Invalid email format
- Weak password
- Network failure during registration

---

### Scenario 2: Existing User Login
**Objective**: Verify existing user can log in

**Preconditions**:
- User account exists
- User is logged out

**Steps**:
1. Navigate to `/login`
2. Enter email: "john.doe@example.com"
3. Enter password: "SecurePass123!"
4. Click "Login"
5. Wait for authentication

**Expected Results**:
- ✅ Login successful
- ✅ Redirected to home page
- ✅ User session active
- ✅ Profile shows user info
- ✅ Protected routes accessible

**Verification Points**:
- Session persists on page refresh
- User data loaded correctly
- No authentication errors
- Can access user-specific features

**Failure Cases to Test**:
- Wrong password
- Non-existent email
- Account locked (if implemented)
- Network timeout

---

### Scenario 3: Password Reset
**Objective**: Verify password reset flow

**Preconditions**:
- User account exists
- User is logged out

**Steps**:
1. Navigate to `/login`
2. Click "Forgot Password"
3. Enter email: "john.doe@example.com"
4. Submit form
5. Check email (if email service configured)
6. Follow reset link
7. Enter new password
8. Confirm new password
9. Submit

**Expected Results**:
- ✅ Reset email sent (if configured)
- ✅ Reset link works
- ✅ Password updated
- ✅ Can login with new password

**Verification Points**:
- Email received (if service configured)
- Reset link valid
- Password validation works
- Old password no longer works

---

## Kundli Generation Flow

### Scenario 4: Complete Kundli Generation
**Objective**: Generate a complete birth chart

**Preconditions**:
- User may or may not be logged in
- Browser supports geolocation (optional)

**Steps**:
1. Navigate to `/kundli`
2. Fill in birth details:
   - Name: "Test Person"
   - Gender: "Male" or "Female"
   - Date of Birth: 15/06/1990
   - Time of Birth: 10:30:00
   - Place: Start typing "Mumbai"
3. Select "Mumbai, Maharashtra, India" from autocomplete
4. Verify coordinates auto-filled
5. Click "Generate Kundli" or "Calculate"
6. Wait for calculation

**Expected Results**:
- ✅ Kundli generated successfully
- ✅ Birth chart displayed
- ✅ Planetary positions shown
- ✅ Ascendant/Rashi calculated
- ✅ House divisions visible
- ✅ Dasha information shown (if available)
- ✅ Can view detailed information

**Verification Points**:
- Chart accuracy (if API configured)
- All 12 houses visible
- All planets positioned correctly
- Ascendant sign correct
- Moon sign (Rashi) correct
- No calculation errors

**Data to Verify**:
- Ascendant: Should match expected sign
- Moon Sign: Should match expected Rashi
- Planetary positions: Should be accurate
- House system: Placidus (default)
- Ayanamsa: Lahiri (default)

---

### Scenario 5: Place Autocomplete
**Objective**: Test place search and autocomplete

**Steps**:
1. Navigate to `/kundli`
2. Click on "Place" input field
3. Type "Del" (partial city name)
4. Wait for suggestions
5. Select "Delhi, India" from dropdown
6. Verify fields auto-filled

**Expected Results**:
- ✅ Suggestions appear as typing
- ✅ Relevant results shown
- ✅ Can select from list
- ✅ Coordinates auto-filled
- ✅ Timezone detected
- ✅ Place name displayed

**Verification Points**:
- Suggestions appear quickly (< 500ms)
- Results are relevant
- Selection works with mouse and keyboard
- Coordinates are accurate
- Timezone correct for location

**Edge Cases**:
- Very long place names
- Special characters in place names
- No results found
- Network failure during search

---

### Scenario 6: Save and Retrieve Kundli
**Objective**: Save generated Kundli and retrieve later

**Preconditions**:
- User is logged in
- Kundli has been generated

**Steps**:
1. Generate a Kundli (from Scenario 4)
2. Click "Save" or "Save Kundli" button
3. Enter name for Kundli (optional)
4. Confirm save
5. Navigate to `/profile`
6. Find saved Kundli in list
7. Click on saved Kundli
8. Verify data loads

**Expected Results**:
- ✅ Kundli saved successfully
- ✅ Appears in saved list
- ✅ Can click to regenerate
- ✅ All birth details preserved
- ✅ Can delete saved Kundli

**Verification Points**:
- Saved Kundlis list shows entry
- Data matches original
- Can regenerate from saved data
- Multiple Kundlis can be saved
- Can manage (edit/delete) saved Kundlis

---

## Horoscope Features

### Scenario 7: Daily Horoscope
**Objective**: View daily horoscope predictions

**Steps**:
1. Navigate to horoscope section (`/horoscope` or similar)
2. Select zodiac sign (e.g., "Aries")
3. View daily predictions
4. Check date shown
5. Try sharing/exporting

**Expected Results**:
- ✅ Horoscope content displayed
- ✅ Sign-specific predictions
- ✅ Current date shown
- ✅ Content is relevant
- ✅ Can share/export

**Verification Points**:
- All 12 signs accessible
- Content updates daily
- UI is readable
- Share functionality works
- Export works (if implemented)

---

### Scenario 8: Weekly/Monthly/Yearly Horoscope
**Objective**: View different time period horoscopes

**Steps**:
1. Navigate to horoscope section
2. Switch to "Weekly" tab
3. View weekly predictions
4. Switch to "Monthly" tab
5. View monthly predictions
6. Switch to "Yearly" tab
7. View yearly predictions

**Expected Results**:
- ✅ Different content for each period
- ✅ Smooth tab switching
- ✅ Period labels accurate
- ✅ Content relevant to period
- ✅ No errors

**Verification Points**:
- Tabs work correctly
- Content differs between periods
- Navigation smooth
- No loading issues

---

## Match Kundli Flow

### Scenario 9: Compatibility Analysis
**Objective**: Calculate compatibility between two people

**Steps**:
1. Navigate to `/match`
2. Fill Person 1 details:
   - Name: "Person A"
   - Date: 15/06/1990
   - Time: 10:30
   - Place: "Mumbai, India"
3. Fill Person 2 details:
   - Name: "Person B"
   - Date: 20/08/1992
   - Time: 14:00
   - Place: "Delhi, India"
4. Click "Match Kundli" or "Calculate Compatibility"
5. Wait for results

**Expected Results**:
- ✅ Compatibility score calculated (0-36)
- ✅ Guna Milan results shown
- ✅ All 36 gunas evaluated
- ✅ Dosha analysis displayed
- ✅ Recommendations provided
- ✅ Can save match report

**Verification Points**:
- Score is reasonable (typically 18-36)
- All gunas calculated correctly
- Doshas identified (Mangal, Nadi, Bhakoot)
- Recommendations are relevant
- Can export/share report

**Expected Output Sections**:
- Overall Compatibility Score
- Guna Milan Breakdown
- Dosha Analysis
- Planetary Compatibility
- Recommendations

---

## Push Notifications Flow

### Scenario 10: Subscribe to Web Push Notifications
**Objective**: Enable push notifications for web

**Preconditions**:
- User is logged in
- Browser supports push notifications
- HTTPS enabled (or localhost)

**Steps**:
1. Navigate to `/notifications/settings`
2. Check current subscription status
3. Click "Subscribe" button
4. Grant browser permission when prompted
5. Wait for subscription confirmation
6. Verify status shows "Subscribed"

**Expected Results**:
- ✅ Permission dialog appears
- ✅ Permission granted
- ✅ Subscription successful
- ✅ Status updated to "Subscribed"
- ✅ Service worker registered
- ✅ Subscription saved to backend

**Verification Points**:
- Service worker active (check DevTools → Application)
- Subscription object created
- Backend has subscription record
- Can receive test notifications
- Preferences can be configured

**Browser DevTools Check**:
- Application → Service Workers: Should show registered worker
- Application → Storage → IndexedDB: Should have subscription data

---

### Scenario 11: Configure Notification Preferences
**Objective**: Set notification types and quiet hours

**Preconditions**:
- User is subscribed to notifications

**Steps**:
1. Navigate to `/notifications/settings`
2. Toggle "Weekly Insights" to ON
3. Toggle "Daily Horoscope" to OFF
4. Toggle "Astrological Events" to ON
5. Enable "Quiet Hours"
6. Set start time: 22:00
7. Set end time: 08:00
8. Click "Save Preferences"

**Expected Results**:
- ✅ Toggles work correctly
- ✅ Quiet hours saved
- ✅ Preferences persist
- ✅ Success message shown
- ✅ Settings saved to backend

**Verification Points**:
- Preferences saved in localStorage
- Backend has preferences record
- Quiet hours logic works
- Can retrieve preferences later
- Changes persist after refresh

---

### Scenario 12: Unsubscribe from Notifications
**Objective**: Disable push notifications

**Steps**:
1. Navigate to `/notifications/settings`
2. Click "Unsubscribe" button
3. Confirm action (if prompted)
4. Verify status updated

**Expected Results**:
- ✅ Subscription removed
- ✅ Status shows "Not Subscribed"
- ✅ Service worker unsubscribed
- ✅ Backend record deleted
- ✅ No more notifications received

**Verification Points**:
- Subscription removed from browser
- Backend record deleted
- Can resubscribe later
- Service worker still active (for other features)

---

## Payment & Subscription Flow

### Scenario 13: View Premium Plans
**Objective**: Browse available subscription plans

**Steps**:
1. Navigate to `/premium`
2. View available plans
3. Check pricing for each plan
4. Review features included
5. Check currency (INR/USD)

**Expected Results**:
- ✅ All plans displayed
- ✅ Pricing shown correctly
- ✅ Features listed clearly
- ✅ CTA buttons visible
- ✅ Currency appropriate

**Verification Points**:
- Weekly plan visible
- Yearly plan visible
- Pricing accurate
- Features match plan
- UI is clear

---

### Scenario 14: Purchase Subscription (Test Mode)
**Objective**: Complete subscription purchase

**Preconditions**:
- User is logged in
- Razorpay test credentials configured

**Steps**:
1. Navigate to `/premium`
2. Select "Yearly" plan
3. Click "Subscribe" or "Buy Now"
4. Razorpay checkout opens
5. Enter test card details:
   - Card: 4111 1111 1111 1111
   - CVV: 123
   - Expiry: 12/25
   - Name: Test User
6. Complete payment
7. Wait for confirmation

**Expected Results**:
- ✅ Razorpay checkout opens
- ✅ Payment form works
- ✅ Payment processed
- ✅ Subscription activated
- ✅ Success message shown
- ✅ Redirected to confirmation page

**Verification Points**:
- Payment gateway integration works
- Subscription status updated in database
- User has premium access
- Can view subscription in profile
- Receipt/confirmation available

**Post-Payment Verification**:
- Check `/profile` for subscription status
- Verify premium features accessible
- Check subscription expiry date
- Verify payment recorded in transactions

---

## Reports Generation

### Scenario 15: Yearly Horoscope Report
**Objective**: Generate comprehensive yearly report

**Preconditions**:
- User has saved Kundli or can enter birth details

**Steps**:
1. Navigate to `/reports/yearly`
2. Select zodiac sign OR use saved Kundli
3. Click "Generate Report"
4. Wait for generation
5. Review report sections

**Expected Results**:
- ✅ Report generated successfully
- ✅ Multiple sections present:
   - Overview
   - Career Predictions
   - Health Forecast
   - Relationship Insights
   - Financial Outlook
   - Important Dates
6. Can download/share report

**Verification Points**:
- All sections present
- Content is relevant
- Predictions for full year
- Can navigate between sections
- Export functionality works
- Report can be saved

---

### Scenario 16: Life Report
**Objective**: Generate detailed life analysis report

**Steps**:
1. Navigate to `/lifereport`
2. Enter birth details (or use saved)
3. Click "Generate Report"
4. Wait for generation
5. Review comprehensive analysis

**Expected Results**:
- ✅ Life report generated
- ✅ Multiple analysis sections
- ✅ Detailed predictions
- ✅ Professional formatting
- ✅ Can export/share

**Verification Points**:
- Report comprehensive
- All life aspects covered
- Calculations accurate
- UI professional
- Export works

---

## Mobile App Flows

### Scenario 17: Mobile App Launch
**Objective**: Verify app launches correctly

**Preconditions**:
- Mobile app installed
- Development environment set up

**Steps**:
1. Launch app on device/simulator
2. Observe initial screen
3. Check for errors in console
4. Verify navigation accessible

**Expected Results**:
- ✅ App launches without crashes
- ✅ Home screen displayed
- ✅ Navigation works
- ✅ Theme applied correctly
- ✅ No console errors

**Verification Points**:
- Splash screen (if any) displays
- Main screen loads
- Navigation drawer/menu accessible
- Performance acceptable
- No memory warnings

---

### Scenario 18: Mobile Authentication
**Objective**: Login on mobile app

**Steps**:
1. Open app
2. Navigate to Login screen
3. Enter email and password
4. Click "Login"
5. Wait for authentication

**Expected Results**:
- ✅ Login screen displayed correctly
- ✅ Keyboard appears appropriately
- ✅ Login successful
- ✅ Session maintained
- ✅ Redirected to home

**Verification Points**:
- UI responsive on mobile
- Keyboard doesn't cover inputs
- API calls work
- Error handling works
- Session persists

---

### Scenario 19: Mobile Kundli Generation
**Objective**: Generate Kundli on mobile

**Steps**:
1. Navigate to Kundli screen
2. Fill birth details form
3. Use place autocomplete
4. Generate Kundli
5. View results

**Expected Results**:
- ✅ Form works on mobile
- ✅ Autocomplete functional
- ✅ Kundli generated
- ✅ Results displayed properly
- ✅ Can save Kundli

**Verification Points**:
- UI is touch-friendly
- Keyboard handling works
- Results scrollable
- Chart displays correctly
- Performance acceptable

---

### Scenario 20: Mobile Notifications
**Objective**: Enable and test mobile notifications

**Steps**:
1. Go to Settings screen
2. Navigate to Notifications
3. Enable notifications
4. Grant permissions when prompted
5. Configure preferences
6. Schedule daily horoscope

**Expected Results**:
- ✅ Permissions requested
- ✅ Notifications enabled
- ✅ Can schedule notifications
- ✅ Preferences saved
- ✅ Notifications received

**Verification Points**:
- Permission flow works
- Scheduling works
- Notifications appear
- Preferences persist
- Can disable notifications

---

## Error Scenarios

### Scenario 21: Invalid Form Input
**Objective**: Test form validation

**Steps**:
1. Navigate to any form (e.g., `/kundli`)
2. Try to submit with:
   - Empty required fields
   - Invalid email format
   - Invalid date (32/13/1990)
   - Invalid time (25:99)
   - Future date for birth
3. Attempt submission

**Expected Results**:
- ✅ Validation errors shown
- ✅ Form not submitted
- ✅ Error messages clear
- ✅ Invalid fields highlighted
- ✅ Can correct and resubmit

**Verification Points**:
- All validations trigger
- Error messages helpful
- UI indicates errors clearly
- Can fix errors and retry

---

### Scenario 22: Network Failure Handling
**Objective**: Test app behavior during network issues

**Steps**:
1. Open browser DevTools → Network
2. Set to "Offline" mode
3. Try to:
   - Login
   - Generate Kundli
   - Save data
   - Load profile
4. Re-enable network
5. Retry operations

**Expected Results**:
- ✅ Error messages shown
- ✅ App doesn't crash
- ✅ User-friendly error messages
- ✅ Can retry after network restored
- ✅ Data not lost

**Verification Points**:
- Error handling works
- Messages are clear
- Retry mechanisms work
- No data corruption
- Graceful degradation

---

### Scenario 23: API Failure Fallback
**Objective**: Test demo mode when API unavailable

**Preconditions**:
- API credentials invalid or missing

**Steps**:
1. Use app without valid API keys
2. Try to generate Kundli
3. Check for demo mode banner
4. Verify mock data used
5. Continue using app

**Expected Results**:
- ✅ Demo mode activated
- ✅ Mock data used
- ✅ User informed of demo mode
- ✅ App still functional
- ✅ Can use all features (with mock data)

**Verification Points**:
- Demo banner visible
- Mock data reasonable
- No errors in console
- App continues to work
- User experience acceptable

---

## Edge Cases

### Scenario 24: Extreme Date/Time Values
**Objective**: Test with edge case dates

**Steps**:
1. Navigate to `/kundli`
2. Try dates:
   - Very old: 01/01/1900
   - Very recent: Today's date
   - Leap year: 29/02/2000
   - Invalid: 32/13/1990
3. Try times:
   - Midnight: 00:00:00
   - Noon: 12:00:00
   - End of day: 23:59:59
4. Generate Kundli

**Expected Results**:
- ✅ Valid dates accepted
- ✅ Invalid dates rejected
- ✅ Calculations work for valid dates
- ✅ Error messages for invalid dates

---

### Scenario 25: Multiple Tabs/Sessions
**Objective**: Test concurrent sessions

**Steps**:
1. Open app in multiple browser tabs
2. Login in one tab
3. Perform actions in different tabs
4. Logout in one tab
5. Check other tabs

**Expected Results**:
- ✅ Session syncs across tabs
- ✅ Actions in one tab reflect in others
- ✅ Logout affects all tabs
- ✅ No conflicts or errors

---

### Scenario 26: Browser Back/Forward Navigation
**Objective**: Test browser navigation

**Steps**:
1. Navigate through app
2. Use browser back button
3. Use browser forward button
4. Refresh pages
5. Check state preservation

**Expected Results**:
- ✅ Back/forward works correctly
- ✅ State preserved where appropriate
- ✅ Forms don't lose data unexpectedly
- ✅ Navigation logical

---

## Performance Testing

### Scenario 27: Page Load Performance
**Objective**: Verify acceptable load times

**Steps**:
1. Open DevTools → Network
2. Clear cache
3. Navigate to each major page:
   - Home
   - Kundli
   - Profile
   - Premium
   - Reports
4. Measure load times
5. Check resource sizes

**Expected Results**:
- ✅ Pages load in < 3 seconds
- ✅ No blocking resources
- ✅ Images optimized
- ✅ Code split properly
- ✅ Lazy loading works

**Metrics to Check**:
- First Contentful Paint (FCP) < 1.8s
- Largest Contentful Paint (LCP) < 2.5s
- Time to Interactive (TTI) < 3.8s
- Total page size < 2MB

---

### Scenario 28: Mobile Performance
**Objective**: Test on mobile device

**Steps**:
1. Test on actual device or simulator
2. Navigate between screens
3. Generate Kundli
4. Check frame rate
5. Monitor memory usage

**Expected Results**:
- ✅ Smooth animations (60 FPS)
- ✅ No lag or jank
- ✅ Fast navigation
- ✅ Acceptable memory usage
- ✅ Good battery efficiency

---

## Accessibility Testing

### Scenario 29: Keyboard Navigation
**Objective**: Test keyboard-only navigation

**Steps**:
1. Use only keyboard (no mouse)
2. Tab through all interactive elements
3. Complete tasks:
   - Navigate to Kundli
   - Fill form
   - Generate Kundli
   - Save results
4. Check focus indicators

**Expected Results**:
- ✅ All elements accessible via keyboard
- ✅ Focus indicators visible
- ✅ Logical tab order
- ✅ Can complete all tasks
- ✅ No keyboard traps

---

### Scenario 30: Screen Reader Compatibility
**Objective**: Test with screen reader

**Steps**:
1. Enable screen reader (VoiceOver/NVDA)
2. Navigate app
3. Fill forms
4. Generate Kundli
5. Check announcements

**Expected Results**:
- ✅ Elements announced correctly
- ✅ Labels present
- ✅ ARIA attributes used
- ✅ Navigation logical
- ✅ Forms usable

**Verification Points**:
- All content accessible
- Form labels announced
- Error messages announced
- Navigation landmarks present

---

## Test Completion Checklist

After completing all scenarios, verify:

### Functionality
- [ ] All core features work
- [ ] No critical bugs
- [ ] User flows complete
- [ ] Data persists correctly

### Performance
- [ ] Pages load quickly
- [ ] Smooth animations
- [ ] No memory leaks
- [ ] Mobile performance acceptable

### Compatibility
- [ ] Works in Chrome
- [ ] Works in Firefox
- [ ] Works in Safari
- [ ] Mobile app works on iOS
- [ ] Mobile app works on Android

### Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Focus management correct
- [ ] Color contrast adequate

### Security
- [ ] Authentication secure
- [ ] Data encrypted
- [ ] No sensitive data exposed
- [ ] Rate limiting works

---

**End of Test Scenarios**
