# AstroSetu - Comprehensive Testing Guide for ChatGPT

## Overview

AstroSetu is a full-stack astrology application with both web and mobile components. This guide provides comprehensive testing instructions for ChatGPT to perform detailed user testing.

## Application Structure

```
astrosetu/
├── src/                    # Next.js web application
│   ├── app/               # Pages and API routes
│   ├── components/        # React components
│   └── lib/               # Utilities and services
├── mobile/                # React Native mobile app
└── public/                # Static assets
```

## Prerequisites

### Web Application
- Node.js 18+ installed
- `.env.local` file with API keys (see setup below)
- Browser (Chrome/Firefox/Safari) for testing

### Mobile Application
- React Native development environment
- iOS Simulator or Android Emulator
- Metro bundler

## Quick Start

### 1. Web Application Setup

```bash
cd astrosetu
npm install
npm run dev
```

The app will be available at: `http://localhost:3001`

### 2. Mobile Application Setup

```bash
cd mobile
npm install
# For iOS
npx react-native run-ios
# For Android
npx react-native run-android
```

## Test Environment Configuration

### Required Environment Variables

Create `astrosetu/.env.local`:

```env
# Supabase (Optional - app works in demo mode without it)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# VAPID Keys for Push Notifications (Optional)
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key

# Prokerala API (Optional - app uses mock data without it)
PROKERALA_CLIENT_ID=your-client-id
PROKERALA_CLIENT_SECRET=your-client-secret

# Razorpay (Optional - for payments)
NEXT_PUBLIC_RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret
```

**Note**: The app works in demo/mock mode without these credentials, but some features will be limited.

## Testing Scenarios

### 1. Authentication & User Management

#### Test Case 1.1: User Registration
**Steps:**
1. Navigate to `/register` or `/login`
2. Click "Create Account" or "Sign Up"
3. Fill in:
   - Name: "Test User"
   - Email: "test@example.com"
   - Password: "Test123!@#"
   - Phone (optional): "+91 9876543210"
4. Submit form

**Expected:**
- User account created successfully
- Redirected to home page or onboarding
- Success message displayed
- User session established

**Verify:**
- Check browser console for errors
- Verify user data in localStorage/session
- Check if profile page shows user info

#### Test Case 1.2: User Login
**Steps:**
1. Navigate to `/login`
2. Enter registered email and password
3. Click "Login"

**Expected:**
- Successful login
- Redirected to home page
- User session active
- Profile accessible

**Verify:**
- Session persists on page refresh
- Logout works correctly
- Protected routes accessible

#### Test Case 1.3: Profile Management
**Steps:**
1. Login as user
2. Navigate to `/profile`
3. Click "Edit Profile"
4. Update name, email, phone
5. Save changes

**Expected:**
- Profile updates saved
- Changes reflected immediately
- Success message shown

**Verify:**
- Data persists after refresh
- All fields editable
- Validation works (invalid email, etc.)

### 2. Kundli Generation

#### Test Case 2.1: Basic Kundli Generation
**Steps:**
1. Navigate to `/kundli`
2. Fill in birth details:
   - Name: "Test Person"
   - Date: 15/06/1990
   - Time: 10:30 AM
   - Place: "Mumbai, Maharashtra, India"
3. Click "Generate Kundli"

**Expected:**
- Kundli generated successfully
- Chart displayed
- Planetary positions shown
- Ascendant/Rashi calculated
- No errors in console

**Verify:**
- Chart is accurate (if API configured)
- All planets visible
- House divisions correct
- Data can be saved

#### Test Case 2.2: Place Autocomplete
**Steps:**
1. Go to `/kundli`
2. Start typing in place field: "Del"
3. Select from autocomplete suggestions

**Expected:**
- Autocomplete suggestions appear
- Can select from list
- Coordinates auto-filled
- Timezone detected

**Verify:**
- Suggestions are relevant
- Selection works correctly
- Coordinates accurate

#### Test Case 2.3: Save Kundli
**Steps:**
1. Generate a Kundli
2. Click "Save" or "Save Kundli"
3. Go to profile page

**Expected:**
- Kundli saved successfully
- Appears in saved Kundlis list
- Can be accessed later

**Verify:**
- Saved Kundlis list shows entry
- Can regenerate from saved data
- Multiple Kundlis can be saved

### 3. Horoscope Features

#### Test Case 3.1: Daily Horoscope
**Steps:**
1. Navigate to horoscope section
2. Select zodiac sign
3. View daily predictions

**Expected:**
- Horoscope content displayed
- Sign-specific predictions
- Date shown
- Can share/export

**Verify:**
- Content is relevant
- All signs accessible
- UI is readable

#### Test Case 3.2: Weekly/Monthly/Yearly Horoscope
**Steps:**
1. Navigate to horoscope
2. Switch between Daily/Weekly/Monthly/Yearly tabs
3. View predictions for each period

**Expected:**
- Different content for each period
- Smooth tab switching
- No errors

**Verify:**
- Content updates correctly
- Period labels accurate
- Navigation works

### 4. Match Kundli (Compatibility)

#### Test Case 4.1: Basic Match
**Steps:**
1. Navigate to `/match`
2. Fill in Person 1 details
3. Fill in Person 2 details
4. Click "Match Kundli" or "Calculate Compatibility"

**Expected:**
- Compatibility score calculated
- Guna Milan results shown
- Dosha analysis displayed
- Recommendations provided

**Verify:**
- Score is reasonable (0-36)
- All gunas calculated
- Doshas identified correctly
- Can save match report

### 5. Push Notifications (Web)

#### Test Case 5.1: Subscribe to Notifications
**Steps:**
1. Navigate to `/notifications/settings`
2. Click "Subscribe"
3. Grant browser permission
4. Configure preferences

**Expected:**
- Permission requested
- Subscription successful
- Preferences saved
- Status shows "Subscribed"

**Verify:**
- Service worker registered
- Subscription stored in database
- Preferences persist

#### Test Case 5.2: Notification Preferences
**Steps:**
1. Go to `/notifications/settings`
2. Toggle notification types:
   - Weekly Insights: ON
   - Daily Horoscope: OFF
   - Astrological Events: ON
3. Set quiet hours: 22:00 - 08:00
4. Save preferences

**Expected:**
- Toggles work correctly
- Quiet hours saved
- Preferences persist
- Success message shown

**Verify:**
- Settings saved to backend
- Can retrieve settings
- Quiet hours logic works

#### Test Case 5.3: Unsubscribe
**Steps:**
1. Go to `/notifications/settings`
2. Click "Unsubscribe"
3. Confirm

**Expected:**
- Subscription removed
- Status shows "Not Subscribed"
- No more notifications received

**Verify:**
- Subscription deleted from database
- Service worker unsubscribed
- Can resubscribe later

### 6. Payments & Subscriptions

#### Test Case 6.1: View Premium Plans
**Steps:**
1. Navigate to `/premium`
2. View available plans
3. Check pricing

**Expected:**
- Plans displayed
- Pricing shown correctly
- Features listed
- CTA buttons visible

**Verify:**
- All plans visible
- Pricing accurate
- Currency correct (INR/USD)

#### Test Case 6.2: Subscription Purchase (Test Mode)
**Steps:**
1. Go to `/premium`
2. Select a plan (Weekly/Yearly)
3. Click "Subscribe" or "Buy Now"
4. Use Razorpay test card:
   - Card: 4111 1111 1111 1111
   - CVV: Any 3 digits
   - Expiry: Any future date
5. Complete payment

**Expected:**
- Razorpay checkout opens
- Payment processed
- Subscription activated
- Success message shown

**Verify:**
- Payment gateway works
- Subscription status updated
- Access to premium features

### 7. Reports & Analysis

#### Test Case 7.1: Yearly Horoscope Report
**Steps:**
1. Navigate to `/reports/yearly`
2. Select zodiac sign or use saved Kundli
3. Generate report
4. View report

**Expected:**
- Report generated
- Comprehensive analysis
- Predictions for year
- Can download/share

**Verify:**
- Report content accurate
- All sections present
- Export works
- Can save report

#### Test Case 7.2: Life Report
**Steps:**
1. Navigate to `/lifereport` or `/reports/life`
2. Enter birth details
3. Generate report

**Expected:**
- Life report generated
- Multiple sections (Career, Health, Relationships, etc.)
- Detailed analysis
- Professional formatting

**Verify:**
- All sections present
- Content is relevant
- Can navigate sections
- Export available

### 8. Mobile App Testing

#### Test Case 8.1: App Launch
**Steps:**
1. Launch mobile app
2. Check initial screen

**Expected:**
- App launches without errors
- Home screen displayed
- Navigation works
- No crashes

**Verify:**
- Splash screen (if any)
- Main navigation accessible
- Theme applied correctly

#### Test Case 8.2: Mobile Authentication
**Steps:**
1. Open app
2. Navigate to Login
3. Enter credentials
4. Login

**Expected:**
- Login screen displayed
- Can enter credentials
- Login successful
- Session maintained

**Verify:**
- API calls work
- Error handling works
- Session persists
- Logout works

#### Test Case 8.3: Mobile Kundli Generation
**Steps:**
1. Navigate to Kundli screen
2. Fill birth details
3. Use place autocomplete
4. Generate Kundli

**Expected:**
- Form works correctly
- Autocomplete functional
- Kundli generated
- Results displayed

**Verify:**
- UI is responsive
- Keyboard handling works
- Results accurate
- Can save Kundli

#### Test Case 8.4: Mobile Notifications
**Steps:**
1. Go to Settings
2. Enable notifications
3. Grant permissions
4. Schedule daily horoscope

**Expected:**
- Permissions requested
- Notifications enabled
- Can schedule notifications
- Preferences saved

**Verify:**
- Permissions work
- Notifications received
- Scheduling works
- Preferences persist

### 9. Error Handling & Edge Cases

#### Test Case 9.1: Invalid Input
**Steps:**
1. Try to submit forms with:
   - Empty required fields
   - Invalid email format
   - Invalid date (e.g., 32/13/1990)
   - Invalid time
2. Submit form

**Expected:**
- Validation errors shown
- Form not submitted
- Error messages clear
- Fields highlighted

**Verify:**
- All validations work
- Error messages helpful
- Can correct and resubmit

#### Test Case 9.2: Network Errors
**Steps:**
1. Disable network
2. Try to:
   - Login
   - Generate Kundli
   - Save data
3. Re-enable network

**Expected:**
- Error messages shown
- App doesn't crash
- Can retry after network restored
- Graceful degradation

**Verify:**
- Error handling works
- User-friendly messages
- Retry mechanisms work

#### Test Case 9.3: API Failures
**Steps:**
1. Use invalid API credentials
2. Try to generate Kundli
3. Check fallback behavior

**Expected:**
- Demo mode activated
- Mock data used
- User informed
- App still functional

**Verify:**
- Fallback works
- Demo mode banner shown
- Mock data reasonable
- Can continue using app

### 10. Performance Testing

#### Test Case 10.1: Page Load Times
**Steps:**
1. Open browser DevTools → Network
2. Navigate to each major page
3. Check load times

**Expected:**
- Pages load in < 3 seconds
- No blocking resources
- Images optimized
- Code split properly

**Verify:**
- Load times acceptable
- No memory leaks
- Smooth navigation

#### Test Case 10.2: Mobile Performance
**Steps:**
1. Test on device/simulator
2. Navigate between screens
3. Generate Kundli
4. Check responsiveness

**Expected:**
- Smooth animations
- No lag
- Fast navigation
- Good battery usage

**Verify:**
- 60 FPS animations
- No jank
- Efficient rendering

### 11. Accessibility Testing

#### Test Case 11.1: Keyboard Navigation
**Steps:**
1. Use only keyboard (Tab, Enter, Arrow keys)
2. Navigate entire app
3. Complete tasks

**Expected:**
- All interactive elements accessible
- Focus indicators visible
- Logical tab order
- Can complete all tasks

**Verify:**
- No keyboard traps
- Focus management works
- Screen reader compatible

#### Test Case 11.2: Screen Reader
**Steps:**
1. Enable screen reader (VoiceOver/NVDA)
2. Navigate app
3. Check announcements

**Expected:**
- Elements announced correctly
- Labels present
- ARIA attributes used
- Navigation logical

**Verify:**
- All content accessible
- Forms usable
- Errors announced

### 12. Cross-Browser Testing

#### Test Case 12.1: Chrome
**Steps:**
1. Test in Chrome
2. Verify all features

**Expected:**
- All features work
- No console errors
- UI renders correctly

#### Test Case 12.2: Firefox
**Steps:**
1. Test in Firefox
2. Verify compatibility

**Expected:**
- Features work
- No Firefox-specific issues

#### Test Case 12.3: Safari
**Steps:**
1. Test in Safari
2. Check WebKit compatibility

**Expected:**
- Works in Safari
- Push notifications work (if supported)

## Known Issues & Limitations

1. **Demo Mode**: App works without API keys but uses mock data
2. **Push Notifications**: Require HTTPS (except localhost) and VAPID keys
3. **Mobile**: Some features may need platform-specific configuration
4. **Payments**: Test mode only, requires Razorpay test credentials

## Test Data

### Test User Credentials
```
Email: test@example.com
Password: Test123!@#
```

### Test Birth Details
```
Name: Test User
Date: 15/06/1990
Time: 10:30 AM
Place: Mumbai, Maharashtra, India
```

### Test Payment Card (Razorpay Test)
```
Card: 4111 1111 1111 1111
CVV: 123
Expiry: 12/25
Name: Test User
```

## Reporting Issues

When reporting issues, include:
1. **Steps to Reproduce**: Detailed steps
2. **Expected Behavior**: What should happen
3. **Actual Behavior**: What actually happens
4. **Browser/Device**: Chrome 120, iPhone 14, etc.
5. **Console Errors**: Any errors in console
6. **Screenshots**: If applicable
7. **Network Tab**: Failed requests

## Success Criteria

The app is considered working correctly if:
- ✅ All core features functional
- ✅ No critical errors
- ✅ User flows complete
- ✅ Data persists correctly
- ✅ Responsive design works
- ✅ Performance acceptable
- ✅ Accessibility standards met

## Testing Checklist

### Web Application
- [ ] User registration works
- [ ] User login works
- [ ] Profile management works
- [ ] Kundli generation works
- [ ] Place autocomplete works
- [ ] Horoscope features work
- [ ] Match Kundli works
- [ ] Push notifications work
- [ ] Payment flow works
- [ ] Reports generate correctly
- [ ] Error handling works
- [ ] Mobile responsive

### Mobile Application
- [ ] App launches without errors
- [ ] Authentication works
- [ ] Kundli generation works
- [ ] Navigation works
- [ ] Notifications work
- [ ] Settings work
- [ ] Performance acceptable
- [ ] No crashes

## Additional Notes

- The app supports both authenticated and guest modes
- Some features require authentication
- Demo mode allows testing without API keys
- All API endpoints have rate limiting
- Error boundaries catch React errors
- Telemetry tracks usage (if configured)

---

**Last Updated**: December 2025
**Version**: 1.0.0
