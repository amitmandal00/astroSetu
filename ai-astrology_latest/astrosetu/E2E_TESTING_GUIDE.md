# 🧪 AstroSetu - End-to-End (E2E) Testing Guide

## 🎯 Purpose
This guide provides **complete customer journey testing** scenarios to validate all flows work like a production environment.

---

## 📋 Pre-Testing Setup

### 1. Start Development Server
```bash
cd astrosetu
npm run dev
```
Server should run on `http://localhost:3001`

### 2. Clear Browser Data
- Clear cache, cookies, and localStorage
- Use **Incognito/Private mode** for clean testing
- Or use browser DevTools → Application → Clear Storage

### 3. Test Data Preparation
Keep these test data ready:
- **Name**: `Amit Kumar Mandal`
- **Phone Number**: `9876543210` (for OTP testing)
- **Email**: `amit@astrosetu.com`
- **Birth Details**: 
  - Date: `26 November 1984`
  - Day: `26`, Month: `November`, Year: `1984`
  - Time: `21:40:00` (9:40 PM)
  - Hours: `21`, Minutes: `40`, Seconds: `00`
  - Place: `Noamundi, Jharkhand, India`

---

## 🚀 Customer Journey 1: New User - First Kundli Generation

### Flow Steps:
1. **Landing on Home Page**
   - ✅ Navigate to `http://localhost:3001`
   - ✅ Verify hero section displays
   - ✅ Verify "Generate Kundli" button is visible
   - ✅ Verify all feature cards are visible

2. **Navigate to Kundli Page**
   - ✅ Click "Generate Kundli" button
   - ✅ Should navigate to `/kundli`
   - ✅ Verify form is displayed

3. **Fill Kundli Form**
   - ✅ Enter Name: `Amit Kumar Mandal`
   - ✅ Select Gender: `Male`
   - ✅ Enter Date: `26`, Month: `November`, Year: `1984`
   - ✅ Enter Time: `21:40:00` (Hours: `21`, Minutes: `40`, Seconds: `00`)
   - ✅ Enter Place: Start typing `Noamundi` → Select `Noamundi, Jharkhand, India` from autocomplete
   - ✅ Verify "Generate Kundli" button is enabled

4. **Generate Kundli**
   - ✅ Click "Generate Kundli" button
   - ✅ Verify loading state appears
   - ✅ Wait for results (should complete in < 5 seconds)
   - ✅ Verify results page displays:
     - Birth details summary
     - Ascendant, Rashi, Nakshatra
     - Planetary positions
     - Dosha analysis
     - Kundli chart visualization
     - AI Insights section

5. **Download/Share Kundli**
   - ✅ Click "Download PDF Report" button
   - ✅ Verify PDF download starts (or print dialog opens)
   - ✅ Click "Generate Life Report" button
   - ✅ Should navigate to `/lifereport` with Kundli data

**Expected Outcome**: Complete Kundli generated successfully, all sections visible, PDF download works.

---

## 💑 Customer Journey 2: Marriage Compatibility Check

### Flow Steps:
1. **Navigate to Match Page**
   - ✅ From home page, click "Match Kundli" or navigate to `/match`
   - ✅ Verify two forms are displayed (Boy's Details & Girl's Details)

2. **Fill Boy's Details**
   - ✅ Name: `Amit Kumar Mandal`
   - ✅ Gender: `Male`
   - ✅ Date: `26/11/1984` (26 November 1984)
   - ✅ Time: `21:40:00`
   - ✅ Place: `Noamundi, Jharkhand, India`

3. **Fill Girl's Details**
   - ✅ Name: `Priya Sharma`
   - ✅ Gender: `Female`
   - ✅ Date: `20/05/1992`
   - ✅ Time: `14:15:00`
   - ✅ Place: `Delhi, Delhi, India`

4. **Calculate Match**
   - ✅ Click "Match Now" button
   - ✅ Verify loading state
   - ✅ Wait for results

5. **Verify Match Results**
   - ✅ Compatibility score displayed (e.g., "36/36 - Excellent Match")
   - ✅ Guna breakdown visible (Varna, Vashya, Tara, Yoni, etc.)
   - ✅ Verdict badge shows correct color (Green/Yellow/Red)
   - ✅ Dosha analysis for both persons
   - ✅ Guidance/recommendations section

6. **Download Match Report**
   - ✅ Click "Download PDF Report"
   - ✅ Verify PDF download works

**Expected Outcome**: Match calculation completes, all Guna scores visible, verdict displayed correctly.

---

## 📅 Customer Journey 3: Daily Horoscope Check

### Flow Steps:
1. **Navigate to Horoscope Page**
   - ✅ Click "Horoscope" from navigation or go to `/horoscope`
   - ✅ Verify tabs are visible (Daily/Weekly/Monthly/Yearly)

2. **Select Daily Horoscope**
   - ✅ Ensure "Daily" tab is selected
   - ✅ Select Zodiac Sign: `Aries` (or any sign)
   - ✅ Select Date: Today's date (default)
   - ✅ Click "Get Horoscope" button

3. **Verify Results**
   - ✅ Horoscope text displays
   - ✅ Zodiac icon/image visible
   - ✅ Date information shown
   - ✅ All sections visible (Love, Career, Health, Finance, etc.)

4. **Test Other Tabs**
   - ✅ Switch to "Weekly" tab
   - ✅ Select sign and date range
   - ✅ Verify weekly horoscope displays
   - ✅ Repeat for "Monthly" and "Yearly"

**Expected Outcome**: All horoscope types work, content displays correctly for each sign.

---

## 📿 Customer Journey 4: Panchang & Muhurat Check

### Flow Steps:
1. **Navigate to Panchang**
   - ✅ Go to `/panchang`
   - ✅ Verify date input (defaults to today)
   - ✅ Verify place input

2. **Get Panchang**
   - ✅ Enter Place: `Mumbai, Maharashtra, India`
   - ✅ Click "Get Panchang" button
   - ✅ Verify results display:
     - Tithi, Nakshatra, Yoga, Karana
     - Sunrise/Sunset times
     - Rahu Kaal
     - Abhijit Muhurat
     - Auspicious timings

3. **Navigate to Muhurat**
   - ✅ Go to `/muhurat`
   - ✅ Select Event Type: `Marriage`
   - ✅ Select Date: Future date
   - ✅ Click "Find Muhurat" button

4. **Verify Muhurat Results**
   - ✅ Auspicious timings displayed
   - ✅ Avoid timings displayed
   - ✅ Quality indicators shown

**Expected Outcome**: Panchang and Muhurat calculations work, all timings displayed correctly.

---

## 💰 Customer Journey 5: Payment & Wallet Flow

### Flow Steps:
1. **Navigate to Wallet Page**
   - ✅ Click "Wallet" from header navigation
   - ✅ If not logged in, should redirect to `/login`
   - ✅ Login with test credentials

2. **View Wallet Balance**
   - ✅ Verify current balance displays (₹0 if new user)
   - ✅ Verify transaction history section (empty if no transactions)

3. **Add Money via Razorpay**
   - ✅ Click "Add Money" button
   - ✅ Enter Amount: `500`
   - ✅ Click "Pay with Razorpay"
   - ✅ If Razorpay configured: Complete payment flow
   - ✅ If not configured: Verify mock payment works
   - ✅ Verify wallet balance updates
   - ✅ Verify transaction appears in history

4. **Add Money via UPI**
   - ✅ Click "UPI" section in wallet
   - ✅ Enter UPI ID: `test@paytm`
   - ✅ Enter Amount: `200`
   - ✅ Click "Pay via UPI"
   - ✅ Verify QR code displays (if implemented)
   - ✅ Verify payment status polling works

5. **Add Money via Bank Transfer**
   - ✅ Click "Bank Transfer" section
   - ✅ Enter Amount: `1000`
   - ✅ Verify bank details display
   - ✅ Verify reference number generated
   - ✅ Test "Verify Payment" button

**Expected Outcome**: All payment methods work, wallet balance updates correctly, transactions recorded.

---

## 🛒 Customer Journey 6: Purchase Paid Service

### Flow Steps:
1. **Navigate to Services**
   - ✅ Go to `/services` or click "Services" from navigation
   - ✅ Verify all service cards display
   - ✅ Click "View All Paid Services" or go to `/services/paid`

2. **Browse Paid Services**
   - ✅ Verify all paid services listed
   - ✅ Verify prices displayed (₹99 each)
   - ✅ Verify "ORDER NOW" buttons visible

3. **Purchase Service (With Wallet Balance)**
   - ✅ Ensure wallet has sufficient balance (add money if needed)
   - ✅ Click "ORDER NOW" on any service (e.g., "Ascendant Report")
   - ✅ Verify purchase completes
   - ✅ Verify wallet balance deducted
   - ✅ Verify service accessible

4. **Purchase Service (Insufficient Balance)**
   - ✅ Ensure wallet balance < service price
   - ✅ Click "ORDER NOW" on a service
   - ✅ Verify prompt to add money appears
   - ✅ Verify redirect to wallet page
   - ✅ Add money, then retry purchase

**Expected Outcome**: Service purchase works, wallet integration correct, services accessible after purchase.

---

## 💬 Customer Journey 7: Chat with Astrologer

### Flow Steps:
1. **Browse Astrologers**
   - ✅ Navigate to `/astrologers`
   - ✅ Verify astrologer cards display
   - ✅ Verify ratings, specializations, availability shown

2. **Select Astrologer**
   - ✅ Click on any astrologer card
   - ✅ Should navigate to `/astrologers/[id]`
   - ✅ Verify astrologer profile details
   - ✅ Verify "Start Chat" or "Book Consultation" button

3. **Start Chat Session**
   - ✅ Click "Start Chat" button
   - ✅ If not logged in, should redirect to login
   - ✅ After login, verify chat session starts
   - ✅ Should navigate to `/chat/[sessionId]`

4. **Send Messages**
   - ✅ Type message: `Hello, I need help with my Kundli`
   - ✅ Click "Send" button
   - ✅ Verify message appears in chat
   - ✅ Verify message timestamp displays
   - ✅ Send 2-3 more messages
   - ✅ Verify all messages display correctly

5. **Receive Messages (Mock)**
   - ✅ Verify astrologer responses appear (if mock responses implemented)
   - ✅ Verify typing indicator works (if implemented)
   - ✅ Verify auto-scroll to latest message

6. **End Session**
   - ✅ Click "End Session" button (if available)
   - ✅ Verify session closes
   - ✅ Navigate to `/chat` to see chat history
   - ✅ Verify session appears in history

**Expected Outcome**: Chat flow works, messages send/receive, session management works.

---

## 📊 Customer Journey 8: Generate Life Report

### Flow Steps:
1. **Generate Kundli First**
   - ✅ Follow Journey 1 to generate a Kundli
   - ✅ On results page, click "Generate Life Report" button

2. **View Life Report**
   - ✅ Should navigate to `/lifereport?kundliData=...`
   - ✅ Verify report loads
   - ✅ Verify all sections display:
     - Cover page
     - Executive summary
     - Birth chart
     - Planetary positions
     - House analysis
     - Dasha analysis
     - Predictions
     - Dosha analysis
     - Remedies

3. **Download Report**
   - ✅ Click "Download PDF" button
   - ✅ Verify PDF generation/print dialog

**Expected Outcome**: Life report generates with all sections, PDF download works.

---

## 🔐 Customer Journey 9: User Registration & Login

### Flow Steps:
1. **Navigate to Login**
   - ✅ Go to `/login`
   - ✅ Verify login form displays

2. **Register New User**
   - ✅ Click "Register" or "Sign Up" link (if available)
   - ✅ Enter Name: `Amit Kumar Mandal`
   - ✅ Enter Phone: `9876543210`
   - ✅ Enter Email: `amit@astrosetu.com` (if required)
   - ✅ Click "Send OTP"
   - ✅ Enter OTP: `123456` (or actual OTP if SMS configured)
   - ✅ Verify registration completes
   - ✅ Verify redirect to home or profile page

3. **Login Existing User**
   - ✅ Enter Phone: `9876543210`
   - ✅ Click "Send OTP"
   - ✅ Enter OTP
   - ✅ Verify login succeeds
   - ✅ Verify session persists on page refresh

4. **View Profile**
   - ✅ Navigate to `/profile`
   - ✅ Verify user details display: `Amit Kumar Mandal`
   - ✅ Verify birth details can be saved:
     - Date: `26 November 1984`
     - Time: `21:40:00`
     - Place: `Noamundi, Jharkhand, India`
   - ✅ Edit name or phone if needed
   - ✅ Save changes
   - ✅ Verify changes persist

5. **Logout**
   - ✅ Click "Logout" button
   - ✅ Verify session cleared
   - ✅ Verify redirect to home or login

**Expected Outcome**: Registration, login, profile management, and logout all work correctly.

---

## 📚 Customer Journey 10: Browse Services & Reports

### Flow Steps:
1. **Navigate to Services Page**
   - ✅ Go to `/services`
   - ✅ Verify left sidebar navigation
   - ✅ Verify service grid displays

2. **Browse All Services**
   - ✅ Click on "Kundli (Birth Chart)" → Should go to `/kundli`
   - ✅ Click on "Ascendant Report" → Should go to `/reports/ascendant`
   - ✅ Click on "Lal Kitab Horoscope" → Should go to `/reports/lalkitab`
   - ✅ Click on "Life Report PDF" → Should go to `/lifereport`
   - ✅ Verify all links work

3. **Generate Ascendant Report**
   - ✅ Navigate to `/reports/ascendant`
   - ✅ If Kundli data needed, generate Kundli first
   - ✅ Verify report generates
   - ✅ Verify all sections display

4. **Generate Lal Kitab Report**
   - ✅ Navigate to `/reports/lalkitab`
   - ✅ Verify report generates
   - ✅ Verify remedies and predictions display

**Expected Outcome**: All service links work, reports generate correctly.

---

## 🎓 Customer Journey 11: Educational Content & Community

### Flow Steps:
1. **Browse Learn Page**
   - ✅ Navigate to `/learn`
   - ✅ Verify educational content displays
   - ✅ Verify categories/sections visible
   - ✅ Click on any article/course
   - ✅ Verify content loads

2. **Browse Community Forum**
   - ✅ Navigate to `/community`
   - ✅ Verify posts/questions display
   - ✅ Click on any post
   - ✅ Verify post details load
   - ✅ Test "Ask Question" button (if available)

3. **Browse Live Sessions**
   - ✅ Navigate to `/sessions`
   - ✅ Verify upcoming sessions list
   - ✅ Click on any session
   - ✅ Verify session details
   - ✅ Test "Register" or "Join" button

4. **Browse Puja Services**
   - ✅ Navigate to `/puja`
   - ✅ Verify puja services list
   - ✅ Click on any puja
   - ✅ Verify booking flow (if implemented)

**Expected Outcome**: All content pages load, navigation works, interactive elements function.

---

## 🔢 Customer Journey 12: Numerology & Remedies

### Flow Steps:
1. **Calculate Numerology**
   - ✅ Navigate to `/numerology`
   - ✅ Enter Name: `Amit Kumar Mandal`
   - ✅ Click "Calculate" button
   - ✅ Verify results display:
     - Life Path Number
     - Destiny Number
     - Soul Number
     - Personality Number
     - Analysis text
     - Lucky numbers, colors, days

2. **Get Remedies**
   - ✅ Navigate to `/remedies`
   - ✅ Select Planet: `Saturn`
   - ✅ Enter Issue: `Career problems`
   - ✅ Click "Get Remedies" button
   - ✅ Verify remedies display:
     - Remedy name
     - Instructions
     - Benefits
     - Images/icons

**Expected Outcome**: Numerology calculation works, remedies display correctly.

---

## 🧪 Complete E2E Test Scenarios

### Scenario 1: Complete New User Journey
1. ✅ Land on home page
2. ✅ Generate Kundli (without login)
3. ✅ Register account
4. ✅ Login
5. ✅ Generate Match compatibility
6. ✅ Add money to wallet
7. ✅ Purchase a paid service
8. ✅ Chat with astrologer
9. ✅ Generate Life Report
10. ✅ Download PDF reports

### Scenario 2: Returning User Journey
1. ✅ Login with existing account
2. ✅ View profile
3. ✅ Check wallet balance
4. ✅ View chat history
5. ✅ Generate new horoscope
6. ✅ Check Panchang
7. ✅ Purchase another service

### Scenario 3: Payment Flow
1. ✅ Login
2. ✅ Navigate to wallet
3. ✅ Add money via Razorpay
4. ✅ Verify balance updated
5. ✅ Purchase service
6. ✅ Verify balance deducted
7. ✅ Check transaction history

### Scenario 4: Chat Consultation Flow
1. ✅ Login
2. ✅ Browse astrologers
3. ✅ Select astrologer
4. ✅ Start chat session
5. ✅ Send multiple messages
6. ✅ Receive responses
7. ✅ End session
8. ✅ View chat history

---

## 🐛 Common Issues & Fixes

### Issue: "Not authenticated" error
**Fix**: Ensure you're logged in. Check `/login` page works.

### Issue: Payment modal doesn't open
**Fix**: Check browser console for errors. Verify Razorpay keys configured.

### Issue: Kundli doesn't generate
**Fix**: Check API endpoint. Verify Prokerala API keys configured or mock mode enabled.

### Issue: Chat messages don't send
**Fix**: Check network tab. Verify Supabase configured or mock mode enabled.

### Issue: Wallet balance doesn't update
**Fix**: Check transaction API. Verify database connection.

---

## ✅ Testing Checklist Summary

### Critical Flows (Must Work)
- [ ] New user can generate Kundli
- [ ] User can register and login
- [ ] User can add money to wallet
- [ ] User can purchase services
- [ ] User can chat with astrologer
- [ ] All navigation links work
- [ ] All forms submit correctly
- [ ] PDF downloads work

### Important Flows (Should Work)
- [ ] Match compatibility calculation
- [ ] All horoscope types (Daily/Weekly/Monthly/Yearly)
- [ ] Panchang and Muhurat
- [ ] Numerology calculation
- [ ] Remedies display
- [ ] Life Report generation
- [ ] All report types

### Nice-to-Have Flows
- [ ] Community forum interactions
- [ ] Live sessions registration
- [ ] Puja booking
- [ ] Educational content browsing

---

## 📊 Test Results Template

```
Date: ___________
Tester: ___________
Browser: ___________
Device: ___________

Journey 1: New User Kundli
- Status: ✅ Pass / ❌ Fail
- Issues: ___________

Journey 2: Marriage Match
- Status: ✅ Pass / ❌ Fail
- Issues: ___________

Journey 3: Payment Flow
- Status: ✅ Pass / ❌ Fail
- Issues: ___________

... (continue for all journeys)
```

---

## 🚀 Production Readiness Checklist

Before going live, ensure:
- [ ] All critical flows tested and passing
- [ ] Payment gateway configured and tested
- [ ] Authentication working correctly
- [ ] Database connections stable
- [ ] API endpoints responding correctly
- [ ] Error handling robust
- [ ] Mobile responsive on all devices
- [ ] Performance acceptable (< 3s page load)
- [ ] No console errors
- [ ] All navigation links work
- [ ] Forms validate correctly
- [ ] PDF generation works
- [ ] Chat functionality works

---

**Last Updated**: After Complete Implementation
**Status**: Ready for E2E Testing

