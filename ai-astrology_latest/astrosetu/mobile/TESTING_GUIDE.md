# Mobile App Testing Guide

## Issue: "No iOS devices available in Simulator.app"

### Solution 1: Open Simulator App Manually

1. **Open Xcode Simulator manually:**
   ```bash
   open -a Simulator
   ```

2. **Create a new simulator:**
   - In Simulator menu: **File → New Simulator**
   - Choose device: **iPhone 15** or **iPhone 14**
   - Choose iOS version: **Latest available** (iOS 17+)
   - Click **Create**

3. **Once simulator is open, go back to Expo terminal and press `i` again**

### Solution 2: Use Android Emulator (Alternative)

If you have Android Studio installed:

1. **Open Android Studio**
2. **Tools → Device Manager**
3. **Create Virtual Device** (if none exists)
4. **Choose device** (e.g., Pixel 6)
5. **Choose system image** (Android 13+)
6. **Finish and start emulator**

7. **In Expo terminal, press `a` to open Android**

### Solution 3: Use Physical Device (Recommended for Real Testing)

#### For iOS (iPhone/iPad):

1. **Install Expo Go** from App Store
2. **Ensure phone and computer are on same WiFi**
3. **Scan QR code** shown in Expo terminal with Camera app
4. **App will open in Expo Go**

#### For Android:

1. **Install Expo Go** from Play Store
2. **Ensure phone and computer are on same WiFi**
3. **Scan QR code** shown in Expo terminal with Expo Go app
4. **App will open in Expo Go**

---

## Complete Testing Checklist

### ✅ Prerequisites

- [ ] Backend server running (`npm run dev` in `astrosetu/` directory)
- [ ] Mobile app server running (`npx expo start` in `mobile/` directory)
- [ ] Device/emulator connected or Expo Go installed

### ✅ Authentication Testing

- [ ] **Register new account**
  - Fill name, email, phone
  - Verify registration success
  - Check redirect to home

- [ ] **Login with email/password**
  - Enter credentials
  - Check "Remember me" works
  - Verify session persists after app restart

- [ ] **Login with OTP**
  - Enter phone number
  - Check authorization checkbox appears
  - Verify OTP sent
  - Enter OTP and verify login

- [ ] **Profile shows correct name** (not email)
  - Go to Profile screen
  - Verify name displays correctly

### ✅ Kundli Generation Testing

- [ ] **Fill birth details form**
  - Name, Gender, DOB (Day/Month/Year)
  - Time (Hrs/Min/Sec)
  - Place of Birth (test autocomplete)
  - Test "CURRENT LOCATION" button
  - Test "NOW" button
  - Test "SETTINGS" toggle

- [ ] **Generate Kundli**
  - Click "DONE" or "DONE AND SAVE"
  - Verify loading state
  - Check chart displays correctly
  - Verify all sections load (Planets, Houses, Doshas, etc.)

- [ ] **Verify chart styling**
  - Check North Indian diamond style
  - Verify planet abbreviations (Su, Mo, Ma, etc.)
  - Check colored house numbers
  - Verify dashed borders

### ✅ Reports Testing

- [ ] **Life Report**
  - Navigate from Services or Kundli page
  - Verify chart appears at top
  - Check all sections load (Planets, Houses, Predictions, Remedies)

- [ ] **Ascendant Report**
  - Generate report
  - Verify chart displays
  - Check Lagna analysis sections

- [ ] **Varshphal Report**
  - Generate report
  - Verify "Varshphal Chart & Table" header
  - Check chart displays
  - Verify year predictions

- [ ] **Lal Kitab Report**
  - Generate report
  - Verify chart displays
  - Check remedies and predictions

- [ ] **Dasha Phal Analysis**
  - Generate analysis
  - Verify current Dasha period
  - Check Antardashas
  - Verify predictions

### ✅ Horoscope Testing

- [ ] **Daily Horoscope**
  - Select zodiac sign
  - Verify content loads
  - Check date displays

- [ ] **Weekly/Monthly/Yearly**
  - Switch between periods
  - Verify content updates

### ✅ Panchang Testing

- [ ] **View today's Panchang**
  - Navigate to Panchang page
  - Verify Tithi, Nakshatra, Yoga, Karana display
  - Check timings are shown

### ✅ Match & Numerology Testing

- [ ] **Kundli Matching**
  - Enter male and female details
  - Generate match report
  - Verify Guna matching scores
  - Check compatibility analysis

- [ ] **Numerology**
  - Enter name and DOB
  - Generate numerology report
  - Verify numbers and interpretations

### ✅ Astrologers & Chat Testing

- [ ] **View Astrologers List**
  - Navigate to Astrologers screen
  - Verify list loads
  - Check filters work

- [ ] **View Astrologer Profile**
  - Tap on astrologer
  - Verify details display
  - Check ratings and reviews

- [ ] **Start Chat**
  - Tap "Chat" button
  - Verify chat screen opens
  - Send test message
  - Verify message appears

### ✅ Wallet & Payments Testing

- [ ] **View Wallet**
  - Navigate to Wallet screen
  - Verify balance displays
  - Check transaction history

- [ ] **Recharge Wallet**
  - Tap recharge button
  - Verify payment modal opens
  - Test UPI payment flow
  - Test Bank Transfer flow
  - Verify close button works
  - Check authentication (should not show "Not authenticated" if logged in)

- [ ] **Purchase Service**
  - Go to Services page
  - Tap on paid service
  - Verify payment flow
  - Check success/error handling

### ✅ Navigation Testing

- [ ] **Bottom Tab Navigation**
  - Test all tabs: Home, Kundli, Horoscope, Astrologers, Profile
  - Verify active state highlights
  - Check navigation works smoothly

- [ ] **Stack Navigation**
  - Navigate to detail pages
  - Test back button
  - Verify header titles

- [ ] **Deep Links**
  - Test navigation from notifications
  - Verify redirects work

### ✅ UI/UX Testing

- [ ] **Theme Consistency**
  - Verify saffron/orange/gold colors throughout
  - Check dark mode (if implemented)
  - Verify Indian spiritual theme elements

- [ ] **Responsive Design**
  - Test on different screen sizes
  - Verify layouts adapt correctly
  - Check text readability

- [ ] **Loading States**
  - Verify loading indicators appear
  - Check skeleton loaders
  - Test error states

- [ ] **Form Validation**
  - Test empty form submission
  - Verify error messages
  - Check field validation

### ✅ Performance Testing

- [ ] **App Launch Time**
  - Measure cold start time
  - Check warm start time

- [ ] **API Response Times**
  - Verify Kundli generation < 3s
  - Check report generation < 5s
  - Test chat message delivery

- [ ] **Memory Usage**
  - Monitor memory during heavy usage
  - Check for memory leaks

### ✅ Error Handling

- [ ] **Network Errors**
  - Disable WiFi/data
  - Verify error messages
  - Check retry mechanisms

- [ ] **API Errors**
  - Test invalid inputs
  - Verify error messages display
  - Check graceful degradation

### ✅ Cross-Platform Testing

- [ ] **iOS Testing**
  - Test on iOS simulator
  - Test on physical iPhone
  - Verify iOS-specific features

- [ ] **Android Testing**
  - Test on Android emulator
  - Test on physical Android device
  - Verify Android-specific features

---

## Quick Test Commands

### Start Backend:
```bash
cd /Users/amitkumarmandal/Documents/astroCursor/astrosetu
npm run dev
```

### Start Mobile App:
```bash
cd /Users/amitkumarmandal/Documents/astroCursor/astrosetu/mobile
npx expo start
```

### Open iOS Simulator:
```bash
open -a Simulator
# Then in Expo terminal, press 'i'
```

### Open Android Emulator:
```bash
# Start Android Studio and launch emulator
# Then in Expo terminal, press 'a'
```

### Clear Cache and Restart:
```bash
cd mobile
npx expo start --clear
```

---

## Common Issues & Solutions

### Issue: "No iOS devices available"
**Solution:** Open Simulator app manually and create a device (see Solution 1 above)

### Issue: "Metro bundler error"
**Solution:** 
```bash
cd mobile
rm -rf node_modules
npm install
npx expo start --clear
```

### Issue: "Cannot connect to backend"
**Solution:** 
- Verify backend is running on `http://localhost:3000`
- Check `API_BASE_URL` in `mobile/src/constants/config.ts`
- For physical device, use your computer's IP address instead of `localhost`

### Issue: "Payment modal shows 'Not authenticated'"
**Solution:**
- Verify user is logged in
- Check session storage
- Verify auth token is being sent in API requests

### Issue: "Chart not displaying"
**Solution:**
- Verify Kundli was generated successfully
- Check chart data exists in response
- Verify `KundliChartVisual` component is imported correctly

---

## Test Results Template

```
Date: ___________
Tester: ___________
Device: ___________
OS Version: ___________

### Authentication
- Register: [ ] Pass [ ] Fail
- Login: [ ] Pass [ ] Fail
- Profile: [ ] Pass [ ] Fail

### Kundli
- Generation: [ ] Pass [ ] Fail
- Chart Display: [ ] Pass [ ] Fail
- Save: [ ] Pass [ ] Fail

### Reports
- Life Report: [ ] Pass [ ] Fail
- Ascendant: [ ] Pass [ ] Fail
- Varshphal: [ ] Pass [ ] Fail
- Lal Kitab: [ ] Pass [ ] Fail

### Payments
- Wallet: [ ] Pass [ ] Fail
- Recharge: [ ] Pass [ ] Fail
- Service Purchase: [ ] Pass [ ] Fail

### Issues Found:
1. 
2. 
3. 

### Notes:
```

---

## Next Steps After Testing

1. **Document all bugs** found during testing
2. **Prioritize fixes** (P0 = Critical, P1 = High, P2 = Medium)
3. **Create bug reports** with steps to reproduce
4. **Fix critical issues** before launch
5. **Re-test** after fixes are applied
