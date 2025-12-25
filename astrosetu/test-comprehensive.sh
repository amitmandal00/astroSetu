#!/bin/bash

# Comprehensive Testing Script for AstroSetu
# Tests both web and mobile functionality

echo "🧪 AstroSetu - Comprehensive Testing Script"
echo "============================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if server is running
echo "Checking if dev server is running..."
if curl -s http://localhost:3001 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Server is running on http://localhost:3001${NC}"
else
    echo -e "${RED}❌ Server is not running!${NC}"
    echo "   Please start the server: npm run dev"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 WEB BROWSER TESTING"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Please test in the following browsers:"
echo "  1. Chrome (Desktop)"
echo "  2. Firefox (Desktop)"
echo "  3. Safari (Desktop - Mac only)"
echo "  4. Edge (Desktop)"
echo ""
echo "For each browser, check:"
echo "  • Home page loads correctly"
echo "  • All navigation links work"
echo "  • All forms submit correctly"
echo "  • No console errors (F12 → Console)"
echo "  • No network errors (F12 → Network)"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📱 MOBILE BROWSER TESTING"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Please test on:"
echo "  1. iOS Safari (iPhone/iPad)"
echo "  2. Chrome Mobile (Android)"
echo "  3. Samsung Internet (Android)"
echo ""
echo "For mobile, check:"
echo "  • Touch interactions work"
echo "  • Bottom navigation works"
echo "  • Forms are easy to fill"
echo "  • Keyboard doesn't cover inputs"
echo "  • No horizontal scrolling"
echo "  • Text is readable without zooming"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 AUTOMATED API TESTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test Home Page
echo "1. Testing Home Page..."
if curl -s http://localhost:3001 | grep -q "AstroSetu"; then
    echo -e "${GREEN}   ✅ Home page loads correctly${NC}"
else
    echo -e "${RED}   ❌ Home page failed to load${NC}"
fi

# Test API Endpoints
echo ""
echo "2. Testing API Endpoints..."

# Horoscope API
echo "   Testing Horoscope API..."
horoscope_response=$(curl -s "http://localhost:3001/api/astrology/horoscope?sign=Aries&mode=daily")
if echo "$horoscope_response" | grep -q '"ok":true'; then
    echo -e "${GREEN}   ✅ Horoscope API works${NC}"
else
    echo -e "${RED}   ❌ Horoscope API failed${NC}"
fi

# Panchang API
echo "   Testing Panchang API..."
panchang_response=$(curl -s "http://localhost:3001/api/astrology/panchang?date=$(date +%Y-%m-%d)&place=Delhi")
if echo "$panchang_response" | grep -q '"ok":true'; then
    echo -e "${GREEN}   ✅ Panchang API works${NC}"
else
    echo -e "${RED}   ❌ Panchang API failed${NC}"
fi

# Numerology API
echo "   Testing Numerology API..."
numerology_response=$(curl -s -X POST "http://localhost:3001/api/astrology/numerology" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User"}')
if echo "$numerology_response" | grep -q '"ok":true'; then
    echo -e "${GREEN}   ✅ Numerology API works${NC}"
else
    echo -e "${RED}   ❌ Numerology API failed${NC}"
fi

# Payment Config API
echo "   Testing Payment Config API..."
payment_config=$(curl -s "http://localhost:3001/api/payments/config")
if echo "$payment_config" | grep -q '"ok":true'; then
    echo -e "${GREEN}   ✅ Payment Config API works${NC}"
else
    echo -e "${YELLOW}   ⚠️  Payment Config API may require configuration${NC}"
fi

# Wallet API
echo "   Testing Wallet API endpoint..."
wallet_response=$(curl -s "http://localhost:3001/api/wallet")
if echo "$wallet_response" | grep -q '"ok"'; then
    echo -e "${GREEN}   ✅ Wallet API endpoint exists${NC}"
else
    echo -e "${YELLOW}   ⚠️  Wallet API may require authentication${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 MANUAL TESTING CHECKLIST"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Please complete the manual testing checklist:"
echo ""
echo "📖 Open: COMPREHENSIVE_TESTING_GUIDE.md"
echo ""
echo "Key areas to test:"
echo "  ✅ All 7 astrology features"
echo "  ✅ User authentication (register/login/logout)"
echo "  ✅ Profile management"
echo "  ✅ Wallet and payments"
echo "  ✅ Chat functionality"
echo "  ✅ Responsive design (desktop/tablet/mobile)"
echo "  ✅ Error handling"
echo "  ✅ Performance (page load times)"
echo "  ✅ Browser compatibility"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 TESTING URLS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Desktop Testing:"
echo "  http://localhost:3001"
echo ""
echo "Mobile Testing (use browser dev tools):"
echo "  1. Open Chrome DevTools (F12)"
echo "  2. Click device toolbar icon (Ctrl+Shift+M)"
echo "  3. Select device (iPhone 12, Galaxy S20, etc.)"
echo "  4. Test all features"
echo ""
echo "Or test on actual devices:"
echo "  • Connect phone to same WiFi"
echo "  • Find your computer's IP: ifconfig (Mac/Linux) or ipconfig (Windows)"
echo "  • Open: http://[YOUR_IP]:3001 on phone browser"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 TESTING REPORT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "After testing, update:"
echo "  • TESTING_RESULTS.md - Track your progress"
echo "  • Create a testing report with issues found"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

read -p "Press Enter to open testing guide in browser..."
open http://localhost:3001 2>/dev/null || xdg-open http://localhost:3001 2>/dev/null || echo "Please open http://localhost:3001 in your browser"

echo ""
echo "✅ Testing script complete!"
echo "📖 Follow COMPREHENSIVE_TESTING_GUIDE.md for detailed testing"
echo ""

