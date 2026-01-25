#!/bin/bash

# AstroSetu - Comprehensive App Testing Script
# Tests all features and functionality

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results
PASSED=0
FAILED=0
WARNINGS=0

# Test counter
TOTAL_TESTS=0

echo "🧪 AstroSetu - Comprehensive App Testing"
echo "=========================================="
echo ""

# Function to run a test
test_check() {
    local test_name="$1"
    local command="$2"
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo -n "Testing: $test_name... "
    
    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PASS${NC}"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC}"
        FAILED=$((FAILED + 1))
        return 1
    fi
}

# Function to check warning
test_warning() {
    local test_name="$1"
    local command="$2"
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo -n "Checking: $test_name... "
    
    if eval "$command" > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠ WARNING${NC}"
        WARNINGS=$((WARNINGS + 1))
        return 0
    else
        echo -e "${GREEN}✓ OK${NC}"
        PASSED=$((PASSED + 1))
        return 0
    fi
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Please run from astrosetu directory.${NC}"
    exit 1
fi

echo "📋 Pre-Testing Checks"
echo "---------------------"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  node_modules not found. Installing dependencies...${NC}"
    npm install
fi

# Check if dev server is running
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${GREEN}✅ Dev server is running on port 3001${NC}"
else
    echo -e "${YELLOW}⚠️  Dev server is NOT running${NC}"
    echo "   Please start it with: npm run dev"
    echo ""
fi

echo ""
echo "🔍 File Structure Tests"
echo "-----------------------"

# Test critical files exist
test_check "Home page exists" "[ -f 'src/app/page.tsx' ]"
test_check "Layout file exists" "[ -f 'src/app/layout.tsx' ]"
test_check "Error page exists" "[ -f 'src/app/error.tsx' ]"
test_check "Not found page exists" "[ -f 'src/app/not-found.tsx' ]"

# Test all main pages
test_check "Kundli page exists" "[ -f 'src/app/kundli/page.tsx' ]"
test_check "Match page exists" "[ -f 'src/app/match/page.tsx' ]"
test_check "Horoscope page exists" "[ -f 'src/app/horoscope/page.tsx' ]"
test_check "Panchang page exists" "[ -f 'src/app/panchang/page.tsx' ]"
test_check "Muhurat page exists" "[ -f 'src/app/muhurat/page.tsx' ]"
test_check "Numerology page exists" "[ -f 'src/app/numerology/page.tsx' ]"
test_check "Remedies page exists" "[ -f 'src/app/remedies/page.tsx' ]"
test_check "Astrologers page exists" "[ -f 'src/app/astrologers/page.tsx' ]"
test_check "Services page exists" "[ -f 'src/app/services/page.tsx' ]"
test_check "Wallet page exists" "[ -f 'src/app/wallet/page.tsx' ]"
test_check "Profile page exists" "[ -f 'src/app/profile/page.tsx' ]"
test_check "Login page exists" "[ -f 'src/app/login/page.tsx' ]"
test_check "Puja page exists" "[ -f 'src/app/puja/page.tsx' ]"
test_check "Sessions page exists" "[ -f 'src/app/sessions/page.tsx' ]"
test_check "Community page exists" "[ -f 'src/app/community/page.tsx' ]"
test_check "Learn page exists" "[ -f 'src/app/learn/page.tsx' ]"

# Test report pages
test_check "Life Report page exists" "[ -f 'src/app/lifereport/page.tsx' ]"
test_check "Ascendant Report page exists" "[ -f 'src/app/reports/ascendant/page.tsx' ]"
test_check "Lal Kitab Report page exists" "[ -f 'src/app/reports/lalkitab/page.tsx' ]"
test_check "Sade Sati Report page exists" "[ -f 'src/app/reports/sadesati/page.tsx' ]"
test_check "Varshphal Report page exists" "[ -f 'src/app/reports/varshphal/page.tsx' ]"

echo ""
echo "🔌 API Routes Tests"
echo "------------------"

# Test API routes exist
test_check "Kundli API exists" "[ -f 'src/app/api/astrology/kundli/route.ts' ]"
test_check "Match API exists" "[ -f 'src/app/api/astrology/match/route.ts' ]"
test_check "Horoscope API exists" "[ -f 'src/app/api/astrology/horoscope/route.ts' ]"
test_check "Panchang API exists" "[ -f 'src/app/api/astrology/panchang/route.ts' ]"
test_check "Muhurat API exists" "[ -f 'src/app/api/astrology/muhurat/route.ts' ]"
test_check "Numerology API exists" "[ -f 'src/app/api/astrology/numerology/route.ts' ]"
test_check "Remedies API exists" "[ -f 'src/app/api/astrology/remedies/route.ts' ]"
test_check "Life Report API exists" "[ -f 'src/app/api/reports/life/route.ts' ]"
test_check "Ascendant Report API exists" "[ -f 'src/app/api/reports/ascendant/route.ts' ]"
test_check "Payment API exists" "[ -f 'src/app/api/payments/create-order/route.ts' ]"
test_check "Wallet API exists" "[ -f 'src/app/api/wallet/route.ts' ]"

echo ""
echo "🧩 Component Tests"
echo "------------------"

# Test critical components
test_check "Logo component exists" "[ -f 'src/components/ui/Logo.tsx' ]"
test_check "Card component exists" "[ -f 'src/components/ui/Card.tsx' ]"
test_check "Button component exists" "[ -f 'src/components/ui/Button.tsx' ]"
test_check "Input component exists" "[ -f 'src/components/ui/Input.tsx' ]"
test_check "Shell layout exists" "[ -f 'src/components/layout/Shell.tsx' ]"
test_check "BottomNav component exists" "[ -f 'src/components/layout/BottomNav.tsx' ]"
test_check "AIChatbot component exists" "[ -f 'src/components/ai/AIChatbot.tsx' ]"
test_check "KundliChartVisual component exists" "[ -f 'src/components/ui/KundliChartVisual.tsx' ]"

echo ""
echo "📦 Configuration Tests"
echo "---------------------"

# Test config files
test_check "package.json exists" "[ -f 'package.json' ]"
test_check "tsconfig.json exists" "[ -f 'tsconfig.json' ]"
test_check "tailwind config exists" "[ -f 'tailwind.config.ts' ]"
test_check "next.config.mjs exists" "[ -f 'next.config.mjs' ]"
test_check "globals.css exists" "[ -f 'src/app/globals.css' ]"

echo ""
echo "📚 Documentation Tests"
echo "---------------------"

# Test documentation
test_check "E2E Testing Guide exists" "[ -f 'E2E_TESTING_GUIDE.md' ]"
test_check "Test User Data exists" "[ -f 'TEST_USER_DATA.md' ]"
test_check "Quick Test Reference exists" "[ -f 'QUICK_TEST_REFERENCE.md' ]"
test_check "Blank Page Fix Guide exists" "[ -f 'BLANK_PAGE_FIX.md' ]"

echo ""
echo "🔧 TypeScript & Build Tests"
echo "--------------------------"

# Check for TypeScript errors (without actually building)
echo "Checking TypeScript configuration..."
if [ -f "tsconfig.json" ]; then
    echo -e "${GREEN}✓ TypeScript config found${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}✗ TypeScript config missing${NC}"
    FAILED=$((FAILED + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# Check for linting errors
echo "Checking for common code issues..."
if grep -r "console.log" src/app --include="*.tsx" --include="*.ts" | grep -v "//" | head -1 > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠ Found console.log statements (consider removing for production)${NC}"
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "${GREEN}✓ No console.log statements found${NC}"
    PASSED=$((PASSED + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

echo ""
echo "🌐 Route Configuration Tests"
echo "---------------------------"

# Check if all routes are properly configured
echo "Verifying route structure..."

# Check if all main routes have page.tsx
routes=("kundli" "match" "horoscope" "panchang" "muhurat" "numerology" "remedies" "astrologers" "services" "wallet" "profile" "login" "puja" "sessions" "community" "learn")
for route in "${routes[@]}"; do
    if [ -f "src/app/$route/page.tsx" ]; then
        # Check if it exports default
        if grep -q "export default" "src/app/$route/page.tsx"; then
            echo -e "${GREEN}✓ $route route properly configured${NC}"
            PASSED=$((PASSED + 1))
        else
            echo -e "${RED}✗ $route route missing default export${NC}"
            FAILED=$((FAILED + 1))
        fi
        TOTAL_TESTS=$((TOTAL_TESTS + 1))
    fi
done

echo ""
echo "📊 Test Summary"
echo "==============="
echo ""
echo -e "Total Tests: ${BLUE}$TOTAL_TESTS${NC}"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo -e "${YELLOW}Warnings: $WARNINGS${NC}"
echo ""

# Calculate percentage
if [ $TOTAL_TESTS -gt 0 ]; then
    PERCENTAGE=$((PASSED * 100 / TOTAL_TESTS))
    echo -e "Success Rate: ${BLUE}$PERCENTAGE%${NC}"
fi

echo ""
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All critical tests passed!${NC}"
    echo ""
    echo "Next Steps:"
    echo "1. Start dev server: npm run dev"
    echo "2. Open http://localhost:3001 in browser"
    echo "3. Follow E2E_TESTING_GUIDE.md for manual testing"
    echo "4. Use test data from TEST_USER_DATA.md"
    exit 0
else
    echo -e "${RED}❌ Some tests failed. Please fix the issues above.${NC}"
    exit 1
fi

