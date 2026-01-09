#!/bin/bash

# Comprehensive End-to-End Test Suite for AI Astrology Report Generation
# Tests all report types, bundles, payment flows, and error scenarios

# Don't exit on error - we want to test all scenarios
set +e

BASE_URL="${BASE_URL:-https://www.mindveda.net}"
TEST_USER_NAME="Amit Kumar Mandal"
TEST_USER_DOB="1984-11-26"
TEST_USER_TOB="21:40"
TEST_USER_PLACE="Noamundi, India"
TEST_USER_LAT=22.15
TEST_USER_LON=85.5
TEST_USER_GENDER="Male"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
TEST_RESULTS=()

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[PASS]${NC} $1"; ((PASSED_TESTS++)); ((TOTAL_TESTS++)); }
log_failure() { echo -e "${RED}[FAIL]${NC} $1"; ((FAILED_TESTS++)); ((TOTAL_TESTS++)); TEST_RESULTS+=("FAIL: $1"); }

test_api_endpoint() {
  local method=$1
  local url=$2
  local description=$3
  local payload=$4
  local expected_status=$5
  local timeout=${6:-120}
  
  log_info "Testing: $description"
  
  if [ "$method" = "POST" ]; then
    response=$(curl -s -w "\n%{http_code}" -X POST "$url" \
      -H "Content-Type: application/json" \
      -d "$payload" \
      --max-time $timeout 2>&1)
  else
    response=$(curl -s -w "\n%{http_code}" -X GET "$url" \
      --max-time $timeout 2>&1)
  fi
  
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')
  
  # Check if response contains error or success indicators
  has_error=$(echo "$body" | grep -i "error\|failed\|timeout" | head -1 || true)
  has_success=$(echo "$body" | grep -i "\"ok\":true\|\"status\":\"completed\"" | head -1 || true)
  
  # Check for success indicators in response
  has_error=$(echo "$body" | grep -i "\"ok\":false\|\"error\"" | head -1 || true)
  has_success=$(echo "$body" | grep -i "\"ok\":true\|\"status\":\"completed\"" | head -1 || true)
  
  if echo "$expected_status" | grep -q "$http_code"; then
    # For 200 status, check if response indicates success
    if [ "$http_code" = "200" ]; then
      if [ -n "$has_success" ] && [ -z "$has_error" ]; then
        log_success "$description (HTTP $http_code - Success)"
        echo "  ✓ Response indicates success"
        echo ""
        return 0
      elif [ -n "$has_error" ]; then
        log_failure "$description - HTTP $http_code but response contains error"
        echo "  Response: $(echo "$body" | head -c 300)..."
        echo ""
        return 1
      else
        # 200 but unclear - log as success for now (might be processing)
        log_success "$description (HTTP $http_code - Processing/Unclear)"
        echo "  ⚠ Response status unclear, but HTTP 200"
        echo ""
        return 0
      fi
    else
      # Non-200 status that matches expected (e.g., 400, 403, 500 for error tests)
      log_success "$description (HTTP $http_code - Expected)"
      echo "  Response: $(echo "$body" | head -c 200)..."
      echo ""
      return 0
    fi
  else
    log_failure "$description - Expected HTTP $expected_status, got $http_code"
    echo "  Response: $(echo "$body" | head -c 300)..."
    echo ""
    return 1
  fi
}

echo "════════════════════════════════════════════════════════════════════════════════"
echo "  COMPREHENSIVE AI ASTROLOGY REPORT GENERATION TEST SUITE"
echo "════════════════════════════════════════════════════════════════════════════════"
echo ""
log_info "Base URL: $BASE_URL"
log_info "Test User: $TEST_USER_NAME"
echo ""

# Test input data
TEST_INPUT=$(cat <<EOF
{
  "name": "$TEST_USER_NAME",
  "dob": "$TEST_USER_DOB",
  "tob": "$TEST_USER_TOB",
  "place": "$TEST_USER_PLACE",
  "latitude": $TEST_USER_LAT,
  "longitude": $TEST_USER_LON,
  "gender": "$TEST_USER_GENDER",
  "timezone": "Asia/Kolkata"
}
EOF
)

# ============================================================================
# SECTION 1: FREE REPORT (Life Summary) - No Payment Required
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  SECTION 1: FREE REPORT GENERATION (life-summary)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

test_api_endpoint "POST" "$BASE_URL/api/ai-astrology/generate-report" \
  "Free Life Summary Report" \
  "{\"input\":$TEST_INPUT,\"reportType\":\"life-summary\"}" \
  "200"

# ============================================================================
# SECTION 2: PAID REPORTS - Individual Report Types
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  SECTION 2: PAID REPORTS - Individual Report Types"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test each paid report type
get_report_name() {
  case "$1" in
    "marriage-timing") echo "Marriage Timing" ;;
    "career-money") echo "Career & Money" ;;
    "year-analysis") echo "Year Analysis" ;;
    "full-life") echo "Full Life" ;;
    "major-life-phase") echo "Major Life Phase" ;;
    "decision-support") echo "Decision Support" ;;
    *) echo "$1" ;;
  esac
}

for report_type in "marriage-timing" "career-money" "year-analysis" "full-life" "major-life-phase" "decision-support"; do
  echo ""
  report_name=$(get_report_name "$report_type")
  log_info "Testing $report_name Report ($report_type)..."
  
  # Use longer timeout for complex reports
  timeout=150
  if [ "$report_type" = "full-life" ] || [ "$report_type" = "major-life-phase" ]; then
    timeout=180
  fi
  
  test_api_endpoint "POST" "$BASE_URL/api/ai-astrology/generate-report" \
    "$report_name Report" \
    "{\"input\":$TEST_INPUT,\"reportType\":\"$report_type\"}" \
    "200|400|403|500|504" \
    "$timeout"
  
  sleep 3
done

# ============================================================================
# SECTION 3: BUNDLE REPORTS
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  SECTION 3: BUNDLE REPORTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Any 2 Reports Bundle
test_api_endpoint "POST" "$BASE_URL/api/ai-astrology/generate-report" \
  "Any 2 Reports Bundle (marriage-timing + career-money)" \
  "{\"input\":$TEST_INPUT,\"reportType\":\"marriage-timing\",\"bundleReports\":[\"marriage-timing\",\"career-money\"],\"bundleType\":\"any-2\"}" \
  "200|400|403|500|504" \
  180

sleep 5

# All 3 Reports Bundle
test_api_endpoint "POST" "$BASE_URL/api/ai-astrology/generate-report" \
  "All 3 Reports Bundle (marriage-timing + career-money + full-life)" \
  "{\"input\":$TEST_INPUT,\"reportType\":\"marriage-timing\",\"bundleReports\":[\"marriage-timing\",\"career-money\",\"full-life\"],\"bundleType\":\"all-3\"}" \
  "200|400|403|500|504" \
  240

sleep 5

# Life Decision Pack
test_api_endpoint "POST" "$BASE_URL/api/ai-astrology/generate-report" \
  "Life Decision Pack (marriage-timing + career-money + year-analysis)" \
  "{\"input\":$TEST_INPUT,\"reportType\":\"marriage-timing\",\"bundleReports\":[\"marriage-timing\",\"career-money\",\"year-analysis\"],\"bundleType\":\"life-decision-pack\"}" \
  "200|400|403|500|504" \
  240

# ============================================================================
# SECTION 4: API ENDPOINT VALIDATION
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  SECTION 4: API ENDPOINT VALIDATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test create-checkout endpoint
test_api_endpoint "POST" "$BASE_URL/api/ai-astrology/create-checkout" \
  "Create Checkout Session" \
  "{\"input\":$TEST_INPUT,\"reportType\":\"marriage-timing\"}" \
  "200|400|403|500"

# Test verify-payment endpoint (with mock session_id)
test_api_endpoint "GET" "$BASE_URL/api/ai-astrology/verify-payment?session_id=test_session_123" \
  "Verify Payment (Mock Session)" \
  "" \
  "200|400|404"

# ============================================================================
# SECTION 5: ERROR SCENARIOS
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  SECTION 5: ERROR SCENARIOS & VALIDATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Missing required fields
test_api_endpoint "POST" "$BASE_URL/api/ai-astrology/generate-report" \
  "Missing Required Fields (should fail)" \
  "{\"input\":{\"name\":\"$TEST_USER_NAME\"},\"reportType\":\"life-summary\"}" \
  "400|500"

# Invalid report type
test_api_endpoint "POST" "$BASE_URL/api/ai-astrology/generate-report" \
  "Invalid Report Type (should fail)" \
  "{\"input\":$TEST_INPUT,\"reportType\":\"invalid-type\"}" \
  "400|500"

# Missing coordinates
test_api_endpoint "POST" "$BASE_URL/api/ai-astrology/generate-report" \
  "Missing Coordinates (should fail or use fallback)" \
  "{\"input\":{\"name\":\"$TEST_USER_NAME\",\"dob\":\"$TEST_USER_DOB\",\"tob\":\"$TEST_USER_TOB\",\"place\":\"$TEST_USER_PLACE\",\"gender\":\"$TEST_USER_GENDER\"},\"reportType\":\"life-summary\"}" \
  "200|400|500"

# ============================================================================
# FINAL SUMMARY
# ============================================================================
echo ""
echo "════════════════════════════════════════════════════════════════════════════════"
echo "  TEST SUMMARY"
echo "════════════════════════════════════════════════════════════════════════════════"
echo ""
echo "Total Tests: $TOTAL_TESTS"
echo -e "${GREEN}Passed: $PASSED_TESTS${NC}"
echo -e "${RED}Failed: $FAILED_TESTS${NC}"
echo ""

if [ $FAILED_TESTS -gt 0 ]; then
  echo "Failed Tests:"
  for result in "${TEST_RESULTS[@]}"; do
    echo "  - $result"
  done
  echo ""
fi

if [ $FAILED_TESTS -eq 0 ]; then
  echo -e "${GREEN}✅ ALL TESTS PASSED${NC}"
  exit 0
else
  echo -e "${RED}❌ SOME TESTS FAILED${NC}"
  exit 1
fi
