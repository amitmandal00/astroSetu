#!/bin/bash

# Comprehensive E2E Test Script for Report Generation
# This script helps verify all report generation flows

echo "🧪 Comprehensive Report Generation E2E Test"
echo "============================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test results
PASSED=0
FAILED=0
WARNINGS=0

# Function to check if server is running
check_server() {
    echo "Checking if development server is running..."
    if curl -s http://localhost:3000 > /dev/null; then
        echo -e "${GREEN}✓${NC} Server is running"
        return 0
    else
        echo -e "${RED}✗${NC} Server is not running. Please start it with: npm run dev"
        return 1
    fi
}

# Function to test URL accessibility
test_url() {
    local url=$1
    local description=$2
    
    echo -n "Testing: $description... "
    if curl -s "$url" > /dev/null; then
        echo -e "${GREEN}✓${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗${NC}"
        ((FAILED++))
        return 1
    fi
}

# Function to check for console errors in build
check_build() {
    echo "Running build check..."
    if npm run build 2>&1 | grep -q "Compiled successfully"; then
        echo -e "${GREEN}✓${NC} Build successful"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗${NC} Build failed"
        ((FAILED++))
        return 1
    fi
}

# Function to check TypeScript errors
check_typescript() {
    echo "Checking TypeScript..."
    if npx tsc --noEmit 2>&1 | grep -q "error TS"; then
        echo -e "${RED}✗${NC} TypeScript errors found"
        ((FAILED++))
        return 1
    else
        echo -e "${GREEN}✓${NC} No TypeScript errors"
        ((PASSED++))
        return 0
    fi
}

# Main test execution
echo "Starting comprehensive tests..."
echo ""

# 1. Build check
check_build
echo ""

# 2. TypeScript check
check_typescript
echo ""

# 3. Server check (optional - only if server is running)
if check_server; then
    echo ""
    echo "Testing URLs (requires server to be running)..."
    echo ""
    
    # Test all input pages
    test_url "http://localhost:3000/ai-astrology/input" "Free Life Summary Input Page"
    test_url "http://localhost:3000/ai-astrology/input?reportType=marriage-timing" "Marriage Timing Input Page"
    test_url "http://localhost:3000/ai-astrology/input?reportType=career-money" "Career & Money Input Page"
    test_url "http://localhost:3000/ai-astrology/input?reportType=full-life" "Full Life Input Page"
    test_url "http://localhost:3000/ai-astrology/input?reportType=year-analysis" "Year Analysis Input Page"
    test_url "http://localhost:3000/ai-astrology/input?reportType=major-life-phase" "Major Life Phase Input Page"
    test_url "http://localhost:3000/ai-astrology/input?reportType=decision-support" "Decision Support Input Page"
    
    echo ""
fi

# Summary
echo "============================================"
echo "Test Summary:"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo -e "${YELLOW}Warnings: $WARNINGS${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All automated tests passed!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Follow the COMPREHENSIVE_E2E_TEST_PLAN.md for manual testing"
    echo "2. Test all report generation flows in browser"
    echo "3. Verify no redirect loops occur"
    echo "4. Test payment flows end-to-end"
    exit 0
else
    echo -e "${RED}✗ Some tests failed. Please review and fix issues.${NC}"
    exit 1
fi

