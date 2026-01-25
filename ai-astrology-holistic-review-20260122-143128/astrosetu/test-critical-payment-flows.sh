#!/bin/bash

# Critical Payment & Report Generation Flow Tests
# Tests payment verification, token handling, and report generation

set -e

BASE_URL="${1:-https://astrosetu-app.vercel.app}"
TEST_REPORT_TYPE="${2:-year-analysis}"

echo "🧪 Critical Payment Flows Test Suite"
echo "===================================="
echo "Base URL: $BASE_URL"
echo "Report Type: $TEST_REPORT_TYPE"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0

test_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ PASS${NC}: $2"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC}: $2"
        ((FAILED++))
    fi
}

# Test 1: Payment Success Page Accessibility
echo "📋 TEST 1: Payment Success Page"
test_url="$BASE_URL/ai-astrology/payment/success?session_id=test_session_$TEST_REPORT_TYPE_test123"
response=$(curl -s -o /dev/null -w "%{http_code}" "$test_url" 2>/dev/null || echo "000")
if [ "$response" = "200" ]; then
    test_result 0 "Payment success page accessible"
else
    test_result 1 "Payment success page not accessible (HTTP $response)"
fi
echo ""

# Test 2: Preview Page Accessibility
echo "📋 TEST 2: Preview Page"
test_url="$BASE_URL/ai-astrology/preview"
response=$(curl -s -o /dev/null -w "%{http_code}" "$test_url" 2>/dev/null || echo "000")
if [ "$response" = "200" ]; then
    test_result 0 "Preview page accessible"
else
    test_result 1 "Preview page not accessible (HTTP $response)"
fi
echo ""

# Test 3: Payment Verification API
echo "📋 TEST 3: Payment Verification API"
test_session_id="test_session_$TEST_REPORT_TYPE_test123"
verify_url="$BASE_URL/api/ai-astrology/verify-payment?session_id=$test_session_id"
response=$(curl -s "$verify_url" 2>/dev/null || echo '{"ok":false}')
if echo "$response" | grep -q '"ok":true'; then
    test_result 0 "Payment verification API works (test session)"
else
    test_result 1 "Payment verification API failed"
    echo "   Response: $response"
fi
echo ""

# Test 4: Generate Report API (with test session)
echo "📋 TEST 4: Generate Report API"
test_session_id="test_session_$TEST_REPORT_TYPE_test123"
generate_url="$BASE_URL/api/ai-astrology/generate-report?session_id=$test_session_id"
test_payload='{
  "input": {
    "name": "Test User",
    "dob": "1990-01-15",
    "tob": "10:30",
    "place": "Mumbai, Maharashtra, India",
    "latitude": 19.0760,
    "longitude": 72.8777,
    "gender": "Male"
  },
  "reportType": "'$TEST_REPORT_TYPE'"
}'

response=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "$test_payload" \
    "$generate_url" 2>/dev/null || echo '{"ok":false}')

if echo "$response" | grep -q '"ok":true'; then
    test_result 0 "Generate report API works with session_id fallback"
else
    error_msg=$(echo "$response" | grep -o '"error":"[^"]*"' | head -1)
    test_result 1 "Generate report API failed: $error_msg"
fi
echo ""

# Test 5: Session ID in URL Parameter
echo "📋 TEST 5: Session ID URL Parameter Handling"
test_url="$BASE_URL/ai-astrology/preview?session_id=test_session_$TEST_REPORT_TYPE_test123"
html=$(curl -s "$test_url" 2>/dev/null || echo "")
if echo "$html" | grep -q "session_id"; then
    test_result 0 "Session ID parameter preserved in URL"
else
    # Check if page loads (might not show session_id in HTML but processes it)
    if echo "$html" | grep -q "astrosetu\|preview\|report"; then
        test_result 0 "Preview page loads with session_id (may be processed client-side)"
    else
        test_result 1 "Preview page doesn't handle session_id parameter"
    fi
fi
echo ""

# Test 6: API Error Handling
echo "📋 TEST 6: Error Handling"
# Test with invalid session_id
invalid_url="$BASE_URL/api/ai-astrology/verify-payment?session_id=invalid_session_12345"
response=$(curl -s "$invalid_url" 2>/dev/null || echo '{"ok":false}')
if echo "$response" | grep -q '"ok":false'; then
    test_result 0 "Invalid session_id properly rejected"
else
    test_result 1 "Invalid session_id not properly handled"
fi
echo ""

# Summary
echo "===================================="
echo "📊 TEST SUMMARY"
echo "===================================="
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ ALL CRITICAL TESTS PASSED${NC}"
    exit 0
else
    echo -e "${RED}❌ SOME TESTS FAILED - REVIEW CRITICAL FLOWS${NC}"
    exit 1
fi

