#!/bin/bash

# Comprehensive Functional Flow Testing Script
# Tests all critical user flows and API endpoints

set -e

BASE_URL="${BASE_URL:-https://www.mindveda.net}"
FAILED=0
PASSED=0

echo "🔍 Comprehensive Functional Flow Testing"
echo "========================================"
echo "Testing: $BASE_URL"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

test_check() {
    local name="$1"
    local url="$2"
    local expected_status="${3:-200}"
    local description="$4"
    
    echo -n "Testing: $name... "
    response=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url" 2>/dev/null || echo "000")
    
    if [ "$response" = "$expected_status" ] || [ "$response" = "000" ] && [ "$expected_status" = "000" ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $response)"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (Expected HTTP $expected_status, got $response)"
        echo "  Description: $description"
        ((FAILED++))
        return 1
    fi
}

# ============================================
# CRITICAL FLOWS - Payment & Reports
# ============================================
echo "📋 CRITICAL FLOWS - Payment & Reports"
echo "--------------------------------------"

# 1. Landing Page
test_check "AI Astrology Landing Page" \
    "$BASE_URL/ai-astrology" \
    "200" \
    "Main landing page must load"

# 2. Input Form
test_check "Input Form Page" \
    "$BASE_URL/ai-astrology/input" \
    "200" \
    "Input form must be accessible"

# 3. Preview Page (should redirect if no input)
test_check "Preview Page" \
    "$BASE_URL/ai-astrology/preview" \
    "200" \
    "Preview page accessible (may redirect to input)"

# 4. Payment Success Page
test_check "Payment Success Page" \
    "$BASE_URL/ai-astrology/payment/success" \
    "200" \
    "Payment success page accessible"

# ============================================
# API ENDPOINTS - Critical
# ============================================
echo ""
echo "🔌 API ENDPOINTS - Critical"
echo "---------------------------"

# Payment API
test_check "Create Checkout API" \
    "$BASE_URL/api/ai-astrology/create-checkout" \
    "405" \
    "Create checkout endpoint exists (405 = method not allowed for GET, expected)"

# Report Generation API
test_check "Generate Report API" \
    "$BASE_URL/api/ai-astrology/generate-report" \
    "405" \
    "Generate report endpoint exists (405 = method not allowed for GET, expected)"

# Verify Payment API
test_check "Verify Payment API" \
    "$BASE_URL/api/ai-astrology/verify-payment" \
    "400" \
    "Verify payment endpoint exists (400 = bad request for GET without params, expected)"

# ============================================
# NAVIGATION FLOWS
# ============================================
echo ""
echo "🧭 NAVIGATION FLOWS"
echo "-------------------"

# FAQ Page
test_check "FAQ Page" \
    "$BASE_URL/ai-astrology/faq" \
    "200" \
    "FAQ page accessible"

# Year Analysis Page
test_check "Year Analysis 2026 Page" \
    "$BASE_URL/ai-astrology/year-analysis-2026" \
    "200" \
    "Year analysis content page accessible"

# Home Page
test_check "Home Page" \
    "$BASE_URL" \
    "200" \
    "Home page accessible"

# ============================================
# STATIC FILES
# ============================================
echo ""
echo "📄 STATIC FILES"
echo "---------------"

# Robots.txt
test_check "Robots.txt" \
    "$BASE_URL/robots.txt" \
    "200" \
    "robots.txt accessible"

# Sitemap
test_check "Sitemap.xml" \
    "$BASE_URL/sitemap.xml" \
    "200" \
    "sitemap.xml accessible"

# ============================================
# HEADERS CHECK
# ============================================
echo ""
echo "🔒 SECURITY HEADERS"
echo "-------------------"

check_header() {
    local url="$1"
    local header="$2"
    local expected="$3"
    local name="$4"
    
    echo -n "Checking: $name... "
    header_value=$(curl -s -I --max-time 10 "$url" 2>/dev/null | grep -i "$header:" | cut -d: -f2 | tr -d '\r\n' || echo "")
    
    if echo "$header_value" | grep -qi "$expected"; then
        echo -e "${GREEN}✓ PASS${NC} (Found: $header_value)"
        ((PASSED++))
        return 0
    else
        echo -e "${YELLOW}⚠ WARN${NC} ($header not found or incorrect)"
        return 1
    fi
}

check_header "$BASE_URL/ai-astrology" "Cache-Control" "no-cache" "Cache-Control header"

# ============================================
# SUMMARY
# ============================================
echo ""
echo "========================================"
echo "📊 TEST SUMMARY"
echo "========================================"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All critical flows are working!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed. Please review the errors above.${NC}"
    exit 1
fi

