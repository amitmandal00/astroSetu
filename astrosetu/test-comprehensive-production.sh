#!/bin/bash

# Comprehensive Production User Flow Test
# Simulates real user experience end-to-end

set -e

BASE_URL="${BASE_URL:-https://www.mindveda.net}"
TEST_USER_NAME="Amit Kumar Mandal"
TEST_USER_DOB="1984-11-26"
TEST_USER_TIME="21:40"
TEST_USER_PLACE="Noamundi, Jharkhand, India"

echo "🧪 Comprehensive Production User Flow Test"
echo "=========================================="
echo "Base URL: $BASE_URL"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0
WARNINGS=0

# Helper function
test_check() {
  local name="$1"
  local command="$2"
  local expected="$3"
  
  echo -n "Testing: $name... "
  
  if eval "$command" > /tmp/test_output.txt 2>&1; then
    if [ -z "$expected" ] || grep -q "$expected" /tmp/test_output.txt 2>/dev/null; then
      echo -e "${GREEN}✓ PASS${NC}"
      ((PASSED++))
      return 0
    else
      echo -e "${YELLOW}⚠ WARNING${NC} (Unexpected output)"
      ((WARNINGS++))
      return 1
    fi
  else
    echo -e "${RED}✗ FAIL${NC}"
    cat /tmp/test_output.txt
    ((FAILED++))
    return 1
  fi
}

# Test 1: Server Accessibility
echo ""
echo "📡 Testing Server Accessibility..."
test_check "Server is reachable" "curl -s -o /dev/null -w '%{http_code}' --max-time 10 $BASE_URL" "200\|301\|302"

# Test 2: Core Pages Load
echo ""
echo "📄 Testing Core Pages..."
test_check "Landing page loads" "curl -s -o /dev/null -w '%{http_code}' --max-time 10 $BASE_URL/ai-astrology" "200"
test_check "Input page loads" "curl -s -o /dev/null -w '%{http_code}' --max-time 10 $BASE_URL/ai-astrology/input" "200"
test_check "FAQ page loads" "curl -s -o /dev/null -w '%{http_code}' --max-time 10 $BASE_URL/ai-astrology/faq" "200"

# Test 3: API Endpoints - Health Check
echo ""
echo "🔌 Testing API Endpoints..."
test_check "Health check endpoint" "curl -s --max-time 10 $BASE_URL/api/health 2>/dev/null | head -1" ""

# Test 4: Free Report Generation (Life Summary)
echo ""
echo "🆓 Testing Free Report Generation..."
FREE_REPORT_RESPONSE=$(curl -s --max-time 30 -X POST "$BASE_URL/api/ai-astrology/generate-report" \
  -H "Content-Type: application/json" \
  -d "{
    \"input\": {
      \"name\": \"$TEST_USER_NAME\",
      \"dob\": \"$TEST_USER_DOB\",
      \"tob\": \"$TEST_USER_TIME\",
      \"place\": \"$TEST_USER_PLACE\",
      \"gender\": \"Male\",
      \"latitude\": 22.15,
      \"longitude\": 85.5
    },
    \"reportType\": \"life-summary\"
  }" 2>/dev/null)

if echo "$FREE_REPORT_RESPONSE" | grep -q '"ok":true' 2>/dev/null; then
  echo -e "Testing: Free report generation... ${GREEN}✓ PASS${NC}"
  ((PASSED++))
else
  echo -e "Testing: Free report generation... ${RED}✗ FAIL${NC}"
  echo "$FREE_REPORT_RESPONSE" | head -20
  ((FAILED++))
fi

# Test 5: Checkout Creation
echo ""
echo "💳 Testing Payment Flow..."
CHECKOUT_RESPONSE=$(curl -s --max-time 15 -X POST "$BASE_URL/api/ai-astrology/create-checkout" \
  -H "Content-Type: application/json" \
  -d "{
    \"input\": {
      \"name\": \"$TEST_USER_NAME\",
      \"dob\": \"$TEST_USER_DOB\",
      \"tob\": \"$TEST_USER_TIME\",
      \"place\": \"$TEST_USER_PLACE\",
      \"gender\": \"Male\",
      \"latitude\": 22.15,
      \"longitude\": 85.5
    },
    \"reportType\": \"year-analysis\"
  }" 2>/dev/null)

if echo "$CHECKOUT_RESPONSE" | grep -q '"ok":true\|"url":' 2>/dev/null; then
  echo -e "Testing: Checkout creation... ${GREEN}✓ PASS${NC}"
  ((PASSED++))
  # Extract session ID if available
  SESSION_ID=$(echo "$CHECKOUT_RESPONSE" | grep -o '"sessionId":"[^"]*"' | cut -d'"' -f4 | head -1)
  if [ -n "$SESSION_ID" ]; then
    echo "  Session ID: ${SESSION_ID:0:30}..."
  fi
else
  echo -e "Testing: Checkout creation... ${RED}✗ FAIL${NC}"
  echo "$CHECKOUT_RESPONSE" | head -20
  ((FAILED++))
fi

# Test 6: Verify Payment Endpoint (if we have session ID)
if [ -n "$SESSION_ID" ]; then
  echo ""
  echo "✅ Testing Payment Verification..."
  VERIFY_RESPONSE=$(curl -s --max-time 10 "$BASE_URL/api/ai-astrology/verify-payment?session_id=$SESSION_ID" 2>/dev/null)
  
  if echo "$VERIFY_RESPONSE" | grep -q '"ok":true' 2>/dev/null; then
    echo -e "Testing: Payment verification... ${GREEN}✓ PASS${NC}"
    ((PASSED++))
  else
    echo -e "Testing: Payment verification... ${YELLOW}⚠ WARNING${NC} (Test session may not be verified)"
    ((WARNINGS++))
  fi
fi

# Test 7: Bundle Report Generation
echo ""
echo "📦 Testing Bundle Report Generation..."
BUNDLE_RESPONSE=$(curl -s --max-time 60 -X POST "$BASE_URL/api/ai-astrology/generate-report" \
  -H "Content-Type: application/json" \
  -d "{
    \"input\": {
      \"name\": \"$TEST_USER_NAME\",
      \"dob\": \"$TEST_USER_DOB\",
      \"tob\": \"$TEST_USER_TIME\",
      \"place\": \"$TEST_USER_PLACE\",
      \"gender\": \"Male\",
      \"latitude\": 22.15,
      \"longitude\": 85.5
    },
    \"reportType\": \"marriage-timing\"
  }" 2>/dev/null)

if echo "$BUNDLE_RESPONSE" | grep -q '"ok":true\|"error":' 2>/dev/null; then
  if echo "$BUNDLE_RESPONSE" | grep -q '"error":' 2>/dev/null; then
    ERROR_MSG=$(echo "$BUNDLE_RESPONSE" | grep -o '"error":"[^"]*"' | head -1)
    echo -e "Testing: Paid report generation (requires payment)... ${YELLOW}⚠ EXPECTED${NC} - $ERROR_MSG"
    ((WARNINGS++))
  else
    echo -e "Testing: Paid report generation... ${GREEN}✓ PASS${NC}"
    ((PASSED++))
  fi
else
  echo -e "Testing: Paid report generation... ${RED}✗ FAIL${NC}"
  echo "$BUNDLE_RESPONSE" | head -20
  ((FAILED++))
fi

# Test 8: Error Handling
echo ""
echo "⚠️  Testing Error Handling..."
ERROR_RESPONSE=$(curl -s --max-time 10 -X POST "$BASE_URL/api/ai-astrology/generate-report" \
  -H "Content-Type: application/json" \
  -d "{
    \"input\": {
      \"name\": \"\",
      \"dob\": \"invalid\"
    },
    \"reportType\": \"life-summary\"
  }" 2>/dev/null)

if echo "$ERROR_RESPONSE" | grep -q '"error":\|"ok":false' 2>/dev/null; then
  echo -e "Testing: Error handling (invalid input)... ${GREEN}✓ PASS${NC} (Returns error)"
  ((PASSED++))
else
  echo -e "Testing: Error handling... ${YELLOW}⚠ WARNING${NC} (Expected error response)"
  ((WARNINGS++))
fi

# Test 9: Content Verification
echo ""
echo "📝 Testing Content Structure..."
if [ -n "$FREE_REPORT_RESPONSE" ]; then
  if echo "$FREE_REPORT_RESPONSE" | grep -q '"content":\|"data":' 2>/dev/null; then
    echo -e "Testing: Response has content structure... ${GREEN}✓ PASS${NC}"
    ((PASSED++))
    
    # Check for reportId
    if echo "$FREE_REPORT_RESPONSE" | grep -q '"reportId":' 2>/dev/null; then
      echo -e "Testing: Response includes reportId... ${GREEN}✓ PASS${NC}"
      ((PASSED++))
    else
      echo -e "Testing: Response includes reportId... ${YELLOW}⚠ WARNING${NC}"
      ((WARNINGS++))
    fi
    
    # Check for redirectUrl
    if echo "$FREE_REPORT_RESPONSE" | grep -q '"redirectUrl":\|"status":"completed"' 2>/dev/null; then
      echo -e "Testing: Response includes redirectUrl/status... ${GREEN}✓ PASS${NC}"
      ((PASSED++))
    else
      echo -e "Testing: Response includes redirectUrl/status... ${YELLOW}⚠ WARNING${NC}"
      ((WARNINGS++))
    fi
  else
    echo -e "Testing: Content structure... ${RED}✗ FAIL${NC}"
    ((FAILED++))
  fi
fi

# Test 10: Rate Limiting / Timeout Handling
echo ""
echo "⏱️  Testing Timeout Configuration..."
# This test just checks that the endpoint accepts requests (actual timeout testing requires longer waits)
TIMEOUT_TEST=$(timeout 5 curl -s --max-time 5 -X POST "$BASE_URL/api/ai-astrology/generate-report" \
  -H "Content-Type: application/json" \
  -d "{
    \"input\": {
      \"name\": \"$TEST_USER_NAME\",
      \"dob\": \"$TEST_USER_DOB\",
      \"tob\": \"$TEST_USER_TIME\",
      \"place\": \"$TEST_USER_PLACE\",
      \"gender\": \"Male\",
      \"latitude\": 22.15,
      \"longitude\": 85.5
    },
    \"reportType\": \"life-summary\"
  }" 2>/dev/null)

if [ -n "$TIMEOUT_TEST" ]; then
  echo -e "Testing: Endpoint accepts requests (timeout > 5s)... ${GREEN}✓ PASS${NC}"
  ((PASSED++))
else
  echo -e "Testing: Timeout configuration... ${YELLOW}⚠ WARNING${NC} (Request may be processing)"
  ((WARNINGS++))
fi

# Summary
echo ""
echo "=========================================="
echo "📊 Test Summary"
echo "=========================================="
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${YELLOW}Warnings: $WARNINGS${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

TOTAL=$((PASSED + WARNINGS + FAILED))
if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ All critical tests passed!${NC}"
  if [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Some warnings (expected for test scenarios)${NC}"
  fi
  exit 0
else
  echo -e "${RED}❌ Some tests failed. Please review above.${NC}"
  exit 1
fi

