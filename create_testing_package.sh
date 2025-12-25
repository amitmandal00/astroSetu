#!/bin/bash

# Script to create a testing package for ChatGPT

echo "📦 Creating AstroSetu Testing Package for ChatGPT..."

# Create temporary directory
TEMP_DIR="astrosetu_testing_package"
mkdir -p "$TEMP_DIR"

# Copy testing documentation
echo "📄 Copying testing documentation..."
cp TESTING_GUIDE_FOR_CHATGPT.md "$TEMP_DIR/"
cp TEST_SCENARIOS_DETAILED.md "$TEMP_DIR/"
cp CHATGPT_TESTING_INSTRUCTIONS.md "$TEMP_DIR/"
cp NOTIFICATIONS_SETUP.md "$TEMP_DIR/"

# Copy key documentation files
echo "📚 Copying key documentation..."
cp astrosetu/README.md "$TEMP_DIR/README.md" 2>/dev/null || echo "README.md not found, skipping"
cp astrosetu/SUPABASE_SETUP.md "$TEMP_DIR/SUPABASE_SETUP.md" 2>/dev/null || echo "SUPABASE_SETUP.md not found, skipping"
cp astrosetu/QUICK_SETUP_GUIDE.md "$TEMP_DIR/QUICK_SETUP_GUIDE.md" 2>/dev/null || echo "QUICK_SETUP_GUIDE.md not found, skipping"

# Copy package.json files for reference
echo "📦 Copying package files..."
cp astrosetu/package.json "$TEMP_DIR/web_package.json" 2>/dev/null || echo "web package.json not found, skipping"
cp astrosetu/mobile/package.json "$TEMP_DIR/mobile_package.json" 2>/dev/null || echo "mobile package.json not found, skipping"

# Create a README for the package
cat > "$TEMP_DIR/PACKAGE_README.md" << 'EOF'
# AstroSetu Testing Package for ChatGPT

This package contains all the documentation and instructions needed for ChatGPT to perform comprehensive testing of the AstroSetu application.

## Files Included

1. **CHATGPT_TESTING_INSTRUCTIONS.md** - Start here! Instructions for ChatGPT on how to test
2. **TESTING_GUIDE_FOR_CHATGPT.md** - Comprehensive testing guide with all test scenarios
3. **TEST_SCENARIOS_DETAILED.md** - Detailed step-by-step test scenarios
4. **NOTIFICATIONS_SETUP.md** - Push notification setup guide (if needed)
5. **SUPABASE_SETUP.md** - Database setup guide (if needed)
6. **QUICK_SETUP_GUIDE.md** - Quick setup instructions
7. **README.md** - Application overview

## How to Use This Package

1. **For ChatGPT**: Start with `CHATGPT_TESTING_INSTRUCTIONS.md` - it contains all the instructions
2. **For Manual Testing**: Use `TESTING_GUIDE_FOR_CHATGPT.md` as your testing checklist
3. **For Detailed Scenarios**: Refer to `TEST_SCENARIOS_DETAILED.md` for step-by-step instructions

## Application Structure

- **Web App**: Next.js application in `astrosetu/` directory
- **Mobile App**: React Native application in `astrosetu/mobile/` directory
- **Runs on**: `http://localhost:3001` (web)

## Quick Start

1. Navigate to `astrosetu/` directory
2. Run `npm install` (if not done)
3. Run `npm run dev`
4. Open `http://localhost:3001` in browser
5. Start testing!

## Test Credentials (if needed)

- Email: `test@example.com`
- Password: `Test123!@#`
- Test Card: `4111 1111 1111 1111` (Razorpay test)

## Important Notes

- App works in **demo mode** without API keys (uses mock data)
- Some features require API configuration (see setup guides)
- Push notifications need VAPID keys (see NOTIFICATIONS_SETUP.md)
- Payments need Razorpay test credentials

## Support

If you encounter issues during testing:
1. Check browser console for errors
2. Check network tab for failed requests
3. Verify environment variables are set
4. Review error messages carefully

---

**Package Created**: $(date)
**Version**: 1.0.0
EOF

# Create a summary file
cat > "$TEMP_DIR/TESTING_SUMMARY.md" << 'EOF'
# Testing Summary

## What to Test

### Critical Features (Must Test)
- ✅ User Registration & Login
- ✅ Kundli Generation
- ✅ Place Autocomplete
- ✅ Save/Retrieve Kundli
- ✅ Navigation
- ✅ Form Validation
- ✅ Error Handling

### Important Features (Should Test)
- ✅ Push Notifications
- ✅ Payment Flow
- ✅ Reports Generation
- ✅ Match Kundli
- ✅ Mobile App

### Optional Features (Nice to Test)
- ✅ Accessibility
- ✅ Cross-browser
- ✅ Performance
- ✅ Edge Cases

## Test Approach

1. **Start with basics**: Authentication, navigation
2. **Test core features**: Kundli generation, horoscopes
3. **Test advanced features**: Notifications, payments
4. **Test edge cases**: Error handling, invalid inputs
5. **Test mobile**: If mobile app available

## Expected Outcomes

After testing, you should provide:
- ✅ Test results for each scenario
- ✅ List of bugs found (with severity)
- ✅ Recommendations for improvements
- ✅ Overall assessment of app readiness

## Success Criteria

App is ready if:
- ✅ All critical features work
- ✅ No blocking bugs
- ✅ User experience is good
- ✅ Performance is acceptable
- ✅ Error handling works

---

**Good luck with testing!**
EOF

echo "✅ Package created in: $TEMP_DIR"
echo ""
echo "📦 Creating ZIP file..."

# Create ZIP file
ZIP_NAME="AstroSetu_Testing_Package_$(date +%Y%m%d_%H%M%S).zip"
cd "$TEMP_DIR"
zip -r "../$ZIP_NAME" . > /dev/null 2>&1
cd ..

# Clean up temp directory
rm -rf "$TEMP_DIR"

echo "✅ ZIP file created: $ZIP_NAME"
echo ""
echo "📋 Package Contents:"
unzip -l "$ZIP_NAME" | tail -n +4 | head -n -2

echo ""
echo "🎉 Testing package ready!"
echo "   File: $ZIP_NAME"
echo "   Size: $(du -h "$ZIP_NAME" | cut -f1)"
