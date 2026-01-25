#!/bin/bash

# Comprehensive Report Generation Test Script
# Tests all report types end-to-end

set -e

BASE_URL="${NEXT_PUBLIC_APP_URL:-https://www.mindveda.net}"
TEST_USER_NAME="Amit Kumar Mandal"
TEST_USER_DOB="1984-11-28"
TEST_USER_TOB="21:40"
TEST_USER_PLACE="Noamundi, Jharkhand, India"
TEST_USER_LAT="22.1569"
TEST_USER_LON="85.5042"
TEST_USER_GENDER="Male"

echo "=========================================="
echo "Report Generation E2E Test Suite"
echo "=========================================="
echo "Base URL: $BASE_URL"
echo "Test User: $TEST_USER_NAME"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to test a report type
test_report_type() {
    local report_type=$1
    local is_paid=$2
    local expected_timeout=$3
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo ""
    echo "----------------------------------------"
    echo "Testing: $report_type"
    echo "----------------------------------------"
    
    # Step 1: Create checkout session (for paid reports)
    if [ "$is_paid" = "true" ]; then
        echo "Step 1: Creating checkout session..."
        CHECKOUT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/ai-astrology/create-checkout" \
            -H "Content-Type: application/json" \
            -d "{
                \"reportType\": \"$report_type\",
                \"input\": {
                    \"name\": \"$TEST_USER_NAME\",
                    \"dob\": \"$TEST_USER_DOB\",
                    \"tob\": \"$TEST_USER_TOB\",
                    \"place\": \"$TEST_USER_PLACE\",
                    \"latitude\": $TEST_USER_LAT,
                    \"longitude\": $TEST_USER_LON,
                    \"gender\": \"$TEST_USER_GENDER\"
                }
            }")
        
        CHECKOUT_OK=$(echo "$CHECKOUT_RESPONSE" | jq -r '.ok // false')
        SESSION_ID=$(echo "$CHECKOUT_RESPONSE" | jq -r '.data.sessionId // empty')
        
        if [ "$CHECKOUT_OK" != "true" ] || [ -z "$SESSION_ID" ]; then
            echo -e "${RED}❌ FAILED: Checkout session creation${NC}"
            echo "Response: $CHECKOUT_RESPONSE"
            FAILED_TESTS=$((FAILED_TESTS + 1))
            return 1
        fi
        
        echo -e "${GREEN}✅ Checkout session created: $SESSION_ID${NC}"
        
        # Step 2: Verify payment (for paid reports)
        echo "Step 2: Verifying payment..."
        VERIFY_RESPONSE=$(curl -s -X GET "$BASE_URL/api/ai-astrology/verify-payment?session_id=$SESSION_ID")
        VERIFY_OK=$(echo "$VERIFY_RESPONSE" | jq -r '.ok // false')
        PAYMENT_TOKEN=$(echo "$VERIFY_RESPONSE" | jq -r '.data.paymentToken // empty')
        
        if [ "$VERIFY_OK" != "true" ]; then
            echo -e "${RED}❌ FAILED: Payment verification${NC}"
            echo "Response: $VERIFY_RESPONSE"
            FAILED_TESTS=$((FAILED_TESTS + 1))
            return 1
        fi
        
        echo -e "${GREEN}✅ Payment verified${NC}"
    else
        PAYMENT_TOKEN=""
        SESSION_ID=""
    fi
    
    # Step 3: Generate report
    echo "Step 3: Generating report..."
    START_TIME=$(date +%s)
    
    GENERATE_PAYLOAD="{
        \"reportType\": \"$report_type\",
        \"input\": {
            \"name\": \"$TEST_USER_NAME\",
            \"dob\": \"$TEST_USER_DOB\",
            \"tob\": \"$TEST_USER_TOB\",
            \"place\": \"$TEST_USER_PLACE\",
            \"latitude\": $TEST_USER_LAT,
            \"longitude\": $TEST_USER_LON,
            \"gender\": \"$TEST_USER_GENDER\"
        }"
    
    if [ -n "$PAYMENT_TOKEN" ]; then
        GENERATE_PAYLOAD="$GENERATE_PAYLOAD,
        \"paymentToken\": \"$PAYMENT_TOKEN\""
    fi
    
    if [ -n "$SESSION_ID" ]; then
        GENERATE_PAYLOAD="$GENERATE_PAYLOAD,
        \"sessionId\": \"$SESSION_ID\""
    fi
    
    GENERATE_PAYLOAD="$GENERATE_PAYLOAD
    }"
    
    GENERATE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/ai-astrology/generate-report" \
        -H "Content-Type: application/json" \
        -d "$GENERATE_PAYLOAD" \
        --max-time $expected_timeout)
    
    END_TIME=$(date +%s)
    ELAPSED=$((END_TIME - START_TIME))
    
    GENERATE_OK=$(echo "$GENERATE_RESPONSE" | jq -r '.ok // false')
    REPORT_ID=$(echo "$GENERATE_RESPONSE" | jq -r '.data.reportId // empty')
    HAS_CONTENT=$(echo "$GENERATE_RESPONSE" | jq -r '.data.content // empty')
    
    if [ "$GENERATE_OK" != "true" ]; then
        echo -e "${RED}❌ FAILED: Report generation${NC}"
        echo "Response: $GENERATE_RESPONSE"
        echo "Elapsed time: ${ELAPSED}s"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
    
    if [ -z "$REPORT_ID" ]; then
        echo -e "${RED}❌ FAILED: No report ID returned${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
    
    if [ -z "$HAS_CONTENT" ]; then
        echo -e "${YELLOW}⚠️  WARNING: Report generated but no content returned${NC}"
    fi
    
    echo -e "${GREEN}✅ Report generated successfully${NC}"
    echo "   Report ID: $REPORT_ID"
    echo "   Elapsed time: ${ELAPSED}s"
    echo "   Expected timeout: ${expected_timeout}s"
    
    PASSED_TESTS=$((PASSED_TESTS + 1))
    return 0
}

# Test all report types
echo "Starting comprehensive tests..."
echo ""

# Free report
test_report_type "life-summary" "false" "90"

# Paid reports (regular)
test_report_type "marriage-timing" "true" "90"
test_report_type "career-money" "true" "90"
test_report_type "year-analysis" "true" "90"

# Paid reports (complex - longer timeout)
test_report_type "full-life" "true" "120"
test_report_type "major-life-phase" "true" "120"

# Decision support (with context)
echo ""
echo "----------------------------------------"
echo "Testing: decision-support (with context)"
echo "----------------------------------------"
TOTAL_TESTS=$((TOTAL_TESTS + 1))

CHECKOUT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/ai-astrology/create-checkout" \
    -H "Content-Type: application/json" \
    -d "{
        \"reportType\": \"decision-support\",
        \"input\": {
            \"name\": \"$TEST_USER_NAME\",
            \"dob\": \"$TEST_USER_DOB\",
            \"tob\": \"$TEST_USER_TOB\",
            \"place\": \"$TEST_USER_PLACE\",
            \"latitude\": $TEST_USER_LAT,
            \"longitude\": $TEST_USER_LON,
            \"gender\": \"$TEST_USER_GENDER\"
        }
    }")

SESSION_ID=$(echo "$CHECKOUT_RESPONSE" | jq -r '.data.sessionId // empty')
VERIFY_RESPONSE=$(curl -s -X GET "$BASE_URL/api/ai-astrology/verify-payment?session_id=$SESSION_ID")
PAYMENT_TOKEN=$(echo "$VERIFY_RESPONSE" | jq -r '.data.paymentToken // empty')

START_TIME=$(date +%s)
GENERATE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/ai-astrology/generate-report" \
    -H "Content-Type: application/json" \
    -d "{
        \"reportType\": \"decision-support\",
        \"input\": {
            \"name\": \"$TEST_USER_NAME\",
            \"dob\": \"$TEST_USER_DOB\",
            \"tob\": \"$TEST_USER_TOB\",
            \"place\": \"$TEST_USER_PLACE\",
            \"latitude\": $TEST_USER_LAT,
            \"longitude\": $TEST_USER_LON,
            \"gender\": \"$TEST_USER_GENDER\"
        },
        \"paymentToken\": \"$PAYMENT_TOKEN\",
        \"sessionId\": \"$SESSION_ID\",
        \"decisionContext\": \"Should I change my job in the next 6 months?\"
    }" \
    --max-time 90)

END_TIME=$(date +%s)
ELAPSED=$((END_TIME - START_TIME))
GENERATE_OK=$(echo "$GENERATE_RESPONSE" | jq -r '.ok // false')

if [ "$GENERATE_OK" = "true" ]; then
    echo -e "${GREEN}✅ Decision support report generated${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}❌ FAILED: Decision support report${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

# Summary
echo ""
echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo "Total tests: $TOTAL_TESTS"
echo -e "${GREEN}Passed: $PASSED_TESTS${NC}"
echo -e "${RED}Failed: $FAILED_TESTS${NC}"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed${NC}"
    exit 1
fi

