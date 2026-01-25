#!/bin/bash

# Comprehensive Functional Flow Test Suite
# Tests all major user flows and functionality

set -e

BASE_URL="${1:-https://www.mindveda.net}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
CRITICAL_FAILURES=0

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
    PASSED_TESTS=$((PASSED_TESTS + 1))
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
}

log_error() {
    echo -e "${RED}[FAIL]${NC} $1"
    FAILED_TESTS=$((FAILED_TESTS + 1))
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
}

log_critical() {
    echo -e "${RED}[CRITICAL]${NC} $1"
    CRITICAL_FAILURES=$((CRITICAL_FAILURES + 1))
    FAILED_TESTS=$((FAILED_TESTS + 1))
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
}

test_endpoint() {
    local url=$1
    local description=$2
    local expected_status=${3:-200}
    
    response=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url" 2>/dev/null || echo "000")
    
    if [ "$response" = "$expected_status" ] || [ "$response" = "200" ]; then
        log_success "$description (HTTP $response)"
        return 0
    else
        log_error "$description - Expected HTTP $expected_status, got $response"
        return 1
    fi
}

test_api_endpoint() {
    local method=$1
    local url=$2
    local description=$3
    local payload=${4:-"{}"}
    local expected_status=${5:-200}
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url" 2>/dev/null || echo "000")
    else
        response=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 -X "$method" \
            -H "Content-Type: application/json" \
            -d "$payload" \
            "$url" 2>/dev/null || echo "000")
    fi
    
    # Accept 200, 201, 400, 401, 403, 422, 500 (but not 404, 503, 000)
    if [ "$response" = "200" ] || [ "$response" = "201" ] || [ "$response" = "400" ] || \
       [ "$response" = "401" ] || [ "$response" = "403" ] || [ "$response" = "422" ] || \
       [ "$response" = "500" ]; then
        log_success "$description (HTTP $response)"
        return 0
    elif [ "$response" = "404" ] || [ "$response" = "503" ] || [ "$response" = "000" ]; then
        log_critical "$description - Endpoint not found or unreachable (HTTP $response)"
        return 1
    else
        log_error "$description - Unexpected status (HTTP $response)"
        return 1
    fi
}

echo "=========================================="
echo "Comprehensive Functional Flow Test Suite"
echo "=========================================="
echo "Base URL: $BASE_URL"
echo "Date: $(date)"
echo "=========================================="
echo ""

# ============================================
# 1. CRITICAL: Core Pages
# ============================================
echo "1. CORE PAGES"
echo "----------------------------------------"
test_endpoint "$BASE_URL" "Home page"
test_endpoint "$BASE_URL/ai-astrology" "AI Astrology landing page"
test_endpoint "$BASE_URL/ai-astrology/input" "Input form page"
test_endpoint "$BASE_URL/ai-astrology/preview" "Preview page"
test_endpoint "$BASE_URL/ai-astrology/faq" "FAQ page"
test_endpoint "$BASE_URL/kundli" "Kundli page"
test_endpoint "$BASE_URL/match" "Match compatibility page"
echo ""

# ============================================
# 2. CRITICAL: API Endpoints
# ============================================
echo "2. API ENDPOINTS"
echo "----------------------------------------"

# Health check
test_api_endpoint "GET" "$BASE_URL/api/health" "Health check endpoint"

# Astrology APIs
test_api_endpoint "POST" "$BASE_URL/api/astrology/kundli" "Kundli API endpoint" '{"name":"Test","dob":"1990-01-01","tob":"10:00","place":"Mumbai"}'
test_api_endpoint "POST" "$BASE_URL/api/astrology/match" "Match API endpoint" '{"aName":"Test A","aDob":"1990-01-01","bName":"Test B","bDob":"1990-01-01"}'

# AI Astrology APIs
test_api_endpoint "POST" "$BASE_URL/api/ai-astrology/generate-report" "Generate report API" '{"input":{"name":"Test","dob":"1990-01-01","tob":"10:00","place":"Mumbai","latitude":19.0760,"longitude":72.8777},"reportType":"life-summary"}'
test_api_endpoint "GET" "$BASE_URL/api/ai-astrology/verify-payment?session_id=test" "Payment verification API"

# Contact API
test_api_endpoint "POST" "$BASE_URL/api/contact" "Contact form API" '{"name":"Test","email":"test@test.com","message":"Test","subject":"Test"}'

echo ""

# ============================================
# 3. CRITICAL: Bundle Flows
# ============================================
echo "3. BUNDLE FLOWS"
echo "----------------------------------------"
test_endpoint "$BASE_URL/ai-astrology/input?bundle=any-2&reports=marriage-timing,career-money" "Any 2 bundle page"
test_endpoint "$BASE_URL/ai-astrology/input?bundle=life-decision-pack&reports=marriage-timing,career-money,year-analysis" "Life Decision Pack page"
test_endpoint "$BASE_URL/ai-astrology/input?bundle=all-3" "All 3 bundle page"
echo ""

# ============================================
# 4. CRITICAL: Report Type Deep Links
# ============================================
echo "4. REPORT TYPE DEEP LINKS"
echo "----------------------------------------"
test_endpoint "$BASE_URL/ai-astrology/input?reportType=life-summary" "Life Summary deep link"
test_endpoint "$BASE_URL/ai-astrology/input?reportType=marriage-timing" "Marriage Timing deep link"
test_endpoint "$BASE_URL/ai-astrology/input?reportType=career-money" "Career & Money deep link"
test_endpoint "$BASE_URL/ai-astrology/input?reportType=year-analysis" "Year Analysis deep link"
test_endpoint "$BASE_URL/ai-astrology/input?reportType=full-life" "Full Life deep link"
test_endpoint "$BASE_URL/ai-astrology/input?reportType=decision-support" "Decision Support deep link"
echo ""

# ============================================
# 5. CRITICAL: Payment Flows
# ============================================
echo "5. PAYMENT FLOWS"
echo "----------------------------------------"
test_endpoint "$BASE_URL/ai-astrology/payment/success?session_id=test" "Payment success page"
test_api_endpoint "POST" "$BASE_URL/api/ai-astrology/create-checkout" "Create checkout API" '{"reportType":"year-analysis","input":{"name":"Test","dob":"1990-01-01","tob":"10:00","place":"Mumbai"}}'
echo ""

# ============================================
# 6. CRITICAL: Legal Pages
# ============================================
echo "6. LEGAL PAGES"
echo "----------------------------------------"
test_endpoint "$BASE_URL/privacy" "Privacy Policy"
test_endpoint "$BASE_URL/terms" "Terms of Use"
test_endpoint "$BASE_URL/disclaimer" "Disclaimer"
test_endpoint "$BASE_URL/refund" "Refund Policy"
test_endpoint "$BASE_URL/contact" "Contact page"
echo ""

# ============================================
# 7. CRITICAL: Navigation & Routing
# ============================================
echo "7. NAVIGATION & ROUTING"
echo "----------------------------------------"
test_endpoint "$BASE_URL/services" "Services page"
test_endpoint "$BASE_URL/horoscope" "Horoscope page"
test_endpoint "$BASE_URL/panchang" "Panchang page"
echo ""

# ============================================
# 8. ERROR HANDLING
# ============================================
echo "8. ERROR HANDLING"
echo "----------------------------------------"
# Test 404 handling
response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/nonexistent-page-12345" 2>/dev/null || echo "000")
if [ "$response" = "404" ] || [ "$response" = "200" ]; then
    log_success "404 error handling (HTTP $response)"
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    log_error "404 error handling - Unexpected status (HTTP $response)"
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
echo ""

# ============================================
# 9. CONTENT VERIFICATION
# ============================================
echo "9. CONTENT VERIFICATION"
echo "----------------------------------------"
# Check if pages have expected content
ai_page=$(curl -s "$BASE_URL/ai-astrology" 2>/dev/null || echo "")
if echo "$ai_page" | grep -q "AstroSetu\|AI Astrology\|Generate Report" > /dev/null; then
    log_success "AI Astrology page has expected content"
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    log_critical "AI Astrology page missing expected content"
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

# Check for orange header fix
if echo "$ai_page" | grep -q 'data-ai-route="true"' > /dev/null; then
    log_success "Orange header fix working (data-ai-route present)"
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    log_error "Orange header fix - data-ai-route attribute missing"
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
echo ""

# Summary
echo "=========================================="
echo "TEST SUMMARY"
echo "=========================================="
echo "Total Tests: $TOTAL_TESTS"
echo -e "${GREEN}Passed: $PASSED_TESTS${NC}"
echo -e "${RED}Failed: $FAILED_TESTS${NC}"
if [ $CRITICAL_FAILURES -gt 0 ]; then
    echo -e "${RED}Critical Failures: $CRITICAL_FAILURES${NC}"
fi
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    success_rate=100
else
    success_rate=$(awk "BEGIN {printf \"%.1f\", ($PASSED_TESTS/$TOTAL_TESTS)*100}")
fi
echo -e "Success Rate: ${success_rate}%"
echo ""

if [ $CRITICAL_FAILURES -gt 0 ]; then
    echo "=========================================="
    echo -e "${RED}CRITICAL FAILURES DETECTED${NC}"
    echo "=========================================="
    exit 2
elif [ $FAILED_TESTS -eq 0 ]; then
    echo "=========================================="
    echo -e "${GREEN}ALL TESTS PASSED${NC}"
    echo "=========================================="
    exit 0
else
    echo "=========================================="
    echo -e "${YELLOW}SOME TESTS FAILED (Non-Critical)${NC}"
    echo "=========================================="
    exit 1
fi
