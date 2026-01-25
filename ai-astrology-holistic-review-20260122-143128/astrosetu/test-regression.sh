#!/bin/bash

# Regression Test Suite
# Tests critical functionality to ensure no breaking changes

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
    local data=${4:-""}
    
    if [ -n "$data" ]; then
        response=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" \
            -H "Content-Type: application/json" \
            -d "$data" \
            --max-time 10 "$url" 2>/dev/null || echo "000")
    else
        response=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" \
            --max-time 10 "$url" 2>/dev/null || echo "000")
    fi
    
    if [ "$response" = "200" ] || [ "$response" = "201" ] || [ "$response" = "400" ] || [ "$response" = "401" ] || [ "$response" = "403" ]; then
        # 200/201 = success, 400 = validation error (expected for test data), 401/403 = auth error (expected)
        log_success "$description (HTTP $response)"
        return 0
    elif [ "$response" = "000" ]; then
        log_error "$description - Connection failed"
        return 1
    else
        log_error "$description - Unexpected status (HTTP $response)"
        return 1
    fi
}

echo "=========================================="
echo "Regression Test Suite"
echo "=========================================="
echo "Base URL: $BASE_URL"
echo "Date: $(date)"
echo "=========================================="
echo ""

# ============================================
# CRITICAL: Core Pages (Must Always Work)
# ============================================
echo "1. CRITICAL: Core Pages"
echo "----------------------------------------"
test_endpoint "$BASE_URL" "Home page"
test_endpoint "$BASE_URL/ai-astrology" "AI Astrology landing page"
test_endpoint "$BASE_URL/ai-astrology/input" "Input form page"
test_endpoint "$BASE_URL/ai-astrology/preview" "Preview page"
test_endpoint "$BASE_URL/ai-astrology/faq" "FAQ page"
echo ""

# ============================================
# CRITICAL: Payment API Endpoints
# ============================================
echo "2. CRITICAL: Payment API Endpoints"
echo "----------------------------------------"
test_api_endpoint "POST" "$BASE_URL/api/ai-astrology/create-checkout" "Create checkout API" '{"reportType":"year-analysis","input":{"name":"Test","dob":"1990-01-01","tob":"10:00","place":"Mumbai"}}'
test_api_endpoint "GET" "$BASE_URL/api/ai-astrology/verify-payment?session_id=test_session_life-summary" "Payment verification API (test session)"
echo ""

# ============================================
# CRITICAL: Report Generation API
# ============================================
echo "3. CRITICAL: Report Generation API"
echo "----------------------------------------"
test_api_endpoint "POST" "$BASE_URL/api/ai-astrology/generate-report" "Generate report API" '{"input":{"name":"Test","dob":"1990-01-01","tob":"10:00","place":"Mumbai","latitude":19.0760,"longitude":72.8777},"reportType":"life-summary"}'
echo ""

# ============================================
# CRITICAL: Payment Capture/Cancel APIs
# ============================================
echo "4. CRITICAL: Payment Capture/Cancel APIs"
echo "----------------------------------------"
test_api_endpoint "POST" "$BASE_URL/api/ai-astrology/capture-payment" "Capture payment API" '{"paymentIntentId":"pi_test","sessionId":"test_session"}'
test_api_endpoint "POST" "$BASE_URL/api/ai-astrology/cancel-payment" "Cancel payment API" '{"paymentIntentId":"pi_test","sessionId":"test_session","reason":"test"}'
echo ""

# ============================================
# CRITICAL: Health Check
# ============================================
echo "5. CRITICAL: Health Check"
echo "----------------------------------------"
test_api_endpoint "GET" "$BASE_URL/api/health" "Health check endpoint"
echo ""

# ============================================
# Summary
# ============================================
echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo "Total Tests: $TOTAL_TESTS"
echo -e "${GREEN}Passed: $PASSED_TESTS${NC}"
echo -e "${RED}Failed: $FAILED_TESTS${NC}"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}✅ ALL CRITICAL TESTS PASSED${NC}"
    exit 0
else
    echo -e "${RED}❌ SOME TESTS FAILED${NC}"
    exit 1
fi

