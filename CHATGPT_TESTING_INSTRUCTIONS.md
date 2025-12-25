# Instructions for ChatGPT: Testing AstroSetu Application

## Your Role

You are tasked with performing comprehensive user testing of the AstroSetu astrology application. This document provides you with all the information needed to test the application thoroughly.

## Application Overview

**AstroSetu** is a full-stack astrology application with:
- **Web Application**: Next.js-based web app (runs on `http://localhost:3001`)
- **Mobile Application**: React Native mobile app
- **Features**: Kundli generation, horoscopes, match making, push notifications, payments, reports

## How to Access the Application

### For Web Testing:
1. The application should be running on `http://localhost:3001`
2. If not running, you'll need to:
   - Navigate to `astrosetu/` directory
   - Run `npm install` (if not done)
   - Run `npm run dev`
   - Wait for server to start

### For Mobile Testing:
1. The mobile app should be running in a simulator/emulator
2. If not running, you'll need to:
   - Navigate to `mobile/` directory
   - Run `npm install` (if not done)
   - Run `npx react-native run-ios` or `npx react-native run-android`

## Testing Approach

### Phase 1: Basic Functionality Testing
Start with core features to ensure the app works:
1. **Authentication**: Register, login, logout
2. **Kundli Generation**: Generate a basic birth chart
3. **Navigation**: Navigate between major pages
4. **UI/UX**: Check if interface is usable

### Phase 2: Feature-Specific Testing
Test each major feature in detail:
1. **Kundli Features**: Generation, saving, place autocomplete
2. **Horoscope**: Daily, weekly, monthly, yearly
3. **Match Kundli**: Compatibility analysis
4. **Push Notifications**: Subscribe, configure, unsubscribe
5. **Payments**: View plans, test payment flow
6. **Reports**: Generate yearly and life reports

### Phase 3: Edge Cases & Error Handling
Test error scenarios and edge cases:
1. Invalid inputs
2. Network failures
3. API errors
4. Browser compatibility
5. Mobile-specific issues

### Phase 4: Performance & Accessibility
1. Page load times
2. Mobile performance
3. Keyboard navigation
4. Screen reader compatibility

## Testing Methodology

### For Each Test Scenario:

1. **Read the Scenario**: Understand what needs to be tested
2. **Execute Steps**: Follow the steps exactly as written
3. **Observe Results**: Note what actually happens
4. **Compare with Expected**: Check if results match expected behavior
5. **Document Findings**: Record:
   - ✅ Pass: If test passes
   - ❌ Fail: If test fails (with details)
   - ⚠️ Partial: If partially works (with details)
   - 📝 Note: Any observations or suggestions

### Example Test Report Format:

```
Test Case: User Registration
Status: ✅ PASS
Steps Executed: All steps completed
Actual Results: User registered successfully, redirected to home page
Issues Found: None
Notes: Registration flow is smooth and intuitive
```

## Important Notes

### Demo Mode
- The app works in **demo mode** without API keys
- Some features use mock data when APIs aren't configured
- This is expected behavior, not a bug

### Known Limitations
- Push notifications require HTTPS (except localhost) and VAPID keys
- Payments require Razorpay test credentials
- Some features may need Supabase configuration

### Test Data
Use these test credentials if needed:
- Email: `test@example.com`
- Password: `Test123!@#`
- Test Card: `4111 1111 1111 1111` (Razorpay test)

## What to Test

### Must Test (Critical):
1. ✅ User can register and login
2. ✅ User can generate a Kundli
3. ✅ Place autocomplete works
4. ✅ User can save Kundli
5. ✅ Navigation works between pages
6. ✅ Forms validate input correctly
7. ✅ Error messages are clear
8. ✅ App doesn't crash on errors

### Should Test (Important):
1. ✅ Push notifications (if configured)
2. ✅ Payment flow (if configured)
3. ✅ Reports generation
4. ✅ Match Kundli feature
5. ✅ Mobile app functionality
6. ✅ Performance on mobile

### Nice to Test (Optional):
1. ✅ Accessibility features
2. ✅ Cross-browser compatibility
3. ✅ Advanced features
4. ✅ Edge cases

## Reporting Issues

When you find issues, document them with:

1. **Issue Title**: Brief description
2. **Severity**: Critical / High / Medium / Low
3. **Steps to Reproduce**: Detailed steps
4. **Expected Behavior**: What should happen
5. **Actual Behavior**: What actually happens
6. **Screenshots/Logs**: If applicable
7. **Browser/Device**: Chrome 120, iPhone 14, etc.

### Issue Severity Levels:
- **Critical**: App crashes, data loss, security issues
- **High**: Major feature broken, user blocked
- **Medium**: Feature partially works, workaround exists
- **Low**: Minor UI issues, cosmetic problems

## Testing Checklist

Use this checklist to track your progress:

### Web Application
- [ ] Authentication (Register, Login, Logout)
- [ ] Profile Management
- [ ] Kundli Generation
- [ ] Place Autocomplete
- [ ] Save/Retrieve Kundli
- [ ] Horoscope Features
- [ ] Match Kundli
- [ ] Push Notifications
- [ ] Payment Flow
- [ ] Reports Generation
- [ ] Error Handling
- [ ] Mobile Responsive

### Mobile Application
- [ ] App Launch
- [ ] Authentication
- [ ] Kundli Generation
- [ ] Navigation
- [ ] Notifications
- [ ] Settings
- [ ] Performance

### Cross-Cutting
- [ ] Performance
- [ ] Accessibility
- [ ] Error Handling
- [ ] Browser Compatibility

## Questions to Answer

After testing, provide answers to:

1. **Overall Assessment**: Is the app ready for users?
2. **Critical Issues**: What must be fixed before launch?
3. **User Experience**: Is the app intuitive and easy to use?
4. **Performance**: Is the app fast enough?
5. **Reliability**: Does the app handle errors gracefully?
6. **Mobile Experience**: How does mobile compare to web?
7. **Recommendations**: What improvements would you suggest?

## Testing Resources

Refer to these files for detailed scenarios:
- `TESTING_GUIDE_FOR_CHATGPT.md` - Complete testing guide
- `TEST_SCENARIOS_DETAILED.md` - Detailed test scenarios
- `NOTIFICATIONS_SETUP.md` - Push notification setup (if needed)
- `SUPABASE_SETUP.md` - Database setup (if needed)

## Getting Help

If you encounter issues:
1. Check browser console for errors
2. Check network tab for failed requests
3. Verify environment variables are set (if needed)
4. Check if services are running
5. Review error messages carefully

## Final Deliverable

After completing testing, provide:

1. **Executive Summary**: High-level assessment
2. **Test Results**: Detailed results for each scenario
3. **Issue List**: All bugs found with severity
4. **Recommendations**: Improvement suggestions
5. **Test Coverage**: What was tested and what wasn't

## Remember

- Test as a real user would use the app
- Don't assume anything works - verify everything
- Document everything clearly
- Be thorough but efficient
- Focus on user experience, not just functionality

---

**Good luck with testing!**
