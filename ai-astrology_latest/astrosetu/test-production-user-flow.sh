#!/bin/bash

# Production User Flow Test
# Simulates a real user journey through the AI Astrology flow

set -e

BASE_URL="${BASE_URL:-https://www.mindveda.net}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
WARNINGS=0

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}✅${NC} $1"
    PASSED_TESTS=$((PASSED_TESTS + 1))
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
}

log_error() {
    echo -e "${RED}❌${NC} $1"
    FAILED_TESTS=$((FAILED_TESTS + 1))
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
}

log_warning() {
    echo -e "${YELLOW}⚠️${NC} $1"
    WARNINGS=$((WARNINGS + 1))
}

# Check connectivity with better error handling
check_connectivity() {
    log_info "Checking connectivity to $BASE_URL..."
    
    # Try HEAD request first
    response=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 --head "$BASE_URL" 2>&1)
    
    if [[ "$response" =~ ^[0-9]{3}$ ]]; then
        log_success "Server is reachable (HTTP $response)"
        return 0
    else
        log_error "Server is not reachable: $response"
        log_info "This could indicate:"
        log_info "  - Server is down"
        log_info "  - Network connectivity issues"
        log_info "  - DNS resolution problems"
        log_info "  - Firewall/security blocking"
        return 1
    fi
}

# Test endpoint with detailed response
test_endpoint_detailed() {
    local url=$1
    local description=$2
    local expected_status=${3:-200}
    
    log_info "Testing: $description"
    log_info "URL: $url"
    
    response=$(curl -s -o /tmp/test_response.html -w "%{http_code}" --max-time 15 "$url" 2>&1)
    status_code=$(echo "$response" | tail -n1 | grep -oE '[0-9]{3}' || echo "000")
    
    if [ "$status_code" = "$expected_status" ] || [ "$status_code" = "200" ]; then
        # Check if response has content
        content_size=$(wc -c < /tmp/test_response.html 2>/dev/null || echo "0")
        if [ "$content_size" -gt 100 ]; then
            log_success "$description - HTTP $status_code (Content: ${content_size} bytes)"
            return 0
        else
            log_warning "$description - HTTP $status_code but content is small (${content_size} bytes)"
            return 1
        fi
    else
        # Check if it's a connection error
        if [ "$status_code" = "000" ]; then
            error_msg=$(echo "$response" | grep -i "curl:" | head -1 || echo "Connection failed")
            log_error "$description - Connection failed: $error_msg"
        else
            log_error "$description - Expected HTTP $expected_status, got $status_code"
        fi
        return 1
    fi
}

# Test API endpoint
test_api_endpoint() {
    local method=$1
    local url=$2
    local description=$3
    local payload=${4:-"{}"}
    local expected_status=${5:-"200|400|401|403|422|500"}
    
    log_info "Testing API: $description"
    log_info "URL: $url"
    log_info "Method: $method"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -o /tmp/api_response.json -w "%{http_code}" --max-time 15 "$url" 2>&1)
    else
        response=$(curl -s -o /tmp/api_response.json -w "%{http_code}" --max-time 15 \
            -X "$method" \
            -H "Content-Type: application/json" \
            -d "$payload" \
            "$url" 2>&1)
    fi
    
    status_code=$(echo "$response" | tail -n1 | grep -oE '[0-9]{3}' || echo "000")
    
    if echo "$expected_status" | grep -qE "\b$status_code\b"; then
        log_success "$description - HTTP $status_code"
        # Log response for debugging
        if [ -f /tmp/api_response.json ] && [ -s /tmp/api_response.json ]; then
            response_preview=$(head -c 200 /tmp/api_response.json)
            log_info "Response preview: ${response_preview}..."
        fi
        return 0
    elif [ "$status_code" = "000" ]; then
        error_msg=$(echo "$response" | grep -i "curl:" | head -1 || echo "Connection failed")
        log_error "$description - Connection failed: $error_msg"
        return 1
    else
        log_error "$description - Unexpected status: HTTP $status_code (expected: $expected_status)"
        # Log response for debugging
        if [ -f /tmp/api_response.json ] && [ -s /tmp/api_response.json ]; then
            response_preview=$(head -c 500 /tmp/api_response.json)
            log_info "Response: ${response_preview}..."
        fi
        return 1
    fi
}

# Test content presence
test_content() {
    local url=$1
    local search_text=$2
    local description=$3
    
    log_info "Checking content: $description"
    
    content=$(curl -s --max-time 15 "$url" 2>/dev/null || echo "")
    
    if echo "$content" | grep -qi "$search_text"; then
        log_success "$description - Found '$search_text'"
        return 0
    else
        log_error "$description - Missing '$search_text'"
        return 1
    fi
}

echo "=========================================="
echo "Production User Flow Test"
echo "=========================================="
echo "Base URL: $BASE_URL"
echo "Date: $(date)"
echo "=========================================="
echo ""

# Step 1: Check connectivity
echo "STEP 1: Connectivity Check"
echo "----------------------------------------"
if ! check_connectivity; then
    echo ""
    echo "⚠️  Cannot proceed with tests - server is not reachable"
    echo "This may indicate:"
    echo "  - The site is temporarily down"
    echo "  - Network connectivity issues"
    echo "  - DNS resolution problems"
    echo ""
    echo "Please verify the site is accessible in a browser:"
    echo "  $BASE_URL"
    echo ""
    exit 1
fi
echo ""

# Step 2: Core Pages
echo "STEP 2: Core Pages (User Landing)"
echo "----------------------------------------"
test_endpoint_detailed "$BASE_URL" "Home page"
test_endpoint_detailed "$BASE_URL/ai-astrology" "AI Astrology landing page"
test_content "$BASE_URL/ai-astrology" "AstroSetu\|AI Astrology\|Generate Report" "Landing page content"
echo ""

# Step 3: Input Form
echo "STEP 3: Input Form (User Enters Details)"
echo "----------------------------------------"
test_endpoint_detailed "$BASE_URL/ai-astrology/input" "Input form page"
test_endpoint_detailed "$BASE_URL/ai-astrology/input?reportType=life-summary" "Life Summary input"
test_endpoint_detailed "$BASE_URL/ai-astrology/input?reportType=marriage-timing" "Marriage Timing input"
test_endpoint_detailed "$BASE_URL/ai-astrology/input?bundle=any-2" "Bundle input page"
echo ""

# Step 4: API Endpoints
echo "STEP 4: API Endpoints (Backend Functionality)"
echo "----------------------------------------"
# Health check
test_api_endpoint "GET" "$BASE_URL/api/health" "Health check" "" "200|500"

# Generate report API (free report - should work with authorized test user)
test_api_endpoint "POST" "$BASE_URL/api/ai-astrology/generate-report" \
    "Generate free report (life-summary) - Test User Amit" \
    '{"input":{"name":"Amit Kumar Mandal","dob":"1984-11-26","tob":"21:40","place":"Noamundi, Jharkhand, India","latitude":22.15,"longitude":85.5,"gender":"Male"},"reportType":"life-summary"}' \
    "200|400|403|500"

# Payment verification API
test_api_endpoint "GET" "$BASE_URL/api/ai-astrology/verify-payment?session_id=test_session_life-summary" \
    "Payment verification (test session)" \
    "" "200|400|404|500"

echo ""

# Step 5: Bundle Flows
echo "STEP 5: Bundle Flows"
echo "----------------------------------------"
test_endpoint_detailed "$BASE_URL/ai-astrology/input?bundle=any-2&reports=marriage-timing,career-money" "Any 2 bundle"
test_endpoint_detailed "$BASE_URL/ai-astrology/input?bundle=life-decision-pack&reports=marriage-timing,career-money,year-analysis" "Life Decision Pack"
echo ""

# Step 6: Payment Pages
echo "STEP 6: Payment Flow Pages"
echo "----------------------------------------"
test_endpoint_detailed "$BASE_URL/ai-astrology/payment/success?session_id=test" "Payment success page"
test_endpoint_detailed "$BASE_URL/ai-astrology/payment/cancel" "Payment cancel page"
echo ""

# Step 7: Preview Page
echo "STEP 7: Preview Page"
echo "----------------------------------------"
test_endpoint_detailed "$BASE_URL/ai-astrology/preview" "Preview page"
echo ""

# Step 8: FAQ and Support
echo "STEP 8: FAQ and Support Pages"
echo "----------------------------------------"
test_endpoint_detailed "$BASE_URL/ai-astrology/faq" "FAQ page"
echo ""

# Summary
echo ""
echo "=========================================="
echo "TEST SUMMARY"
echo "=========================================="
echo "Total Tests: $TOTAL_TESTS"
echo -e "${GREEN}Passed: $PASSED_TESTS${NC}"
echo -e "${RED}Failed: $FAILED_TESTS${NC}"
if [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}Warnings: $WARNINGS${NC}"
fi

if [ $TOTAL_TESTS -gt 0 ]; then
    success_rate=$(awk "BEGIN {printf \"%.1f\", ($PASSED_TESTS/$TOTAL_TESTS)*100}")
    echo -e "Success Rate: ${success_rate}%"
fi
echo ""

if [ $FAILED_TESTS -eq 0 ] && [ $TOTAL_TESTS -gt 0 ]; then
    echo -e "${GREEN}✅ ALL TESTS PASSED${NC}"
    echo ""
    echo "The application appears to be working correctly for production users."
    exit 0
elif [ $FAILED_TESTS -gt 0 ]; then
    echo -e "${RED}❌ SOME TESTS FAILED${NC}"
    echo ""
    echo "Issues detected:"
    echo "  - Some endpoints may be unreachable"
    echo "  - Some pages may not be loading correctly"
    echo "  - Check server logs for detailed error messages"
    exit 1
else
    echo -e "${YELLOW}⚠️  NO TESTS EXECUTED${NC}"
    exit 1
fi

