#!/bin/bash

# Test Bundle Report Generation - End-to-End Production User Flow
# Tests bundle report generation with real production-like scenarios

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="${BASE_URL:-https://www.mindveda.net}"
TEST_USER_NAME="Amit Kumar Mandal"
TEST_USER_DOB="26/11/1984"
TEST_USER_TOB="21:40"
TEST_USER_PLACE="Noamundi, Jharkhand, India"
TEST_USER_LAT="22.15"
TEST_USER_LON="85.50"
TEST_USER_GENDER="Male"

# Test bundles to test
BUNDLES=(
  "any-2:marriage-timing,career-money"
  "any-2:full-life,decision-support"
  "life-decision-pack:marriage-timing,career-money,year-analysis"
)

# Counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
WARNINGS=0

# Logging functions
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

log_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
    WARNINGS=$((WARNINGS + 1))
}

# Test helper functions
test_endpoint() {
    local endpoint=$1
    local description=$2
    local expected_status=${3:-200}
    
    log_info "Testing: $description"
    log_info "Endpoint: $BASE_URL$endpoint"
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$endpoint" || echo "000")
    
    if [ "$response" = "$expected_status" ]; then
        log_success "$description - HTTP $response"
        return 0
    else
        log_error "$description - Expected HTTP $expected_status, got $response"
        return 1
    fi
}

test_page_loads() {
    local url=$1
    local description=$2
    
    log_info "Testing page load: $description"
    
    # Check if page loads (not 404/500)
    status=$(curl -s -o /dev/null -w "%{http_code}" "$url" || echo "000")
    
    if [ "$status" = "200" ]; then
        log_success "$description - Page loads successfully"
        return 0
    else
        log_error "$description - Page failed to load (HTTP $status)"
        return 1
    fi
}

# Check if server is accessible
check_server() {
    log_info "Checking if server is accessible at $BASE_URL"
    
    if curl -s --max-time 10 "$BASE_URL" > /dev/null; then
        log_success "Server is accessible"
        return 0
    else
        log_error "Server is not accessible at $BASE_URL"
        return 1
    fi
}

# Test bundle input page
test_bundle_input_page() {
    local bundle_type=$1
    local reports=$2
    local bundle_name="${bundle_type//-/ }"
    
    log_info "Testing bundle input page for: $bundle_name"
    
    url="$BASE_URL/ai-astrology/input?bundle=$bundle_type&reports=$reports"
    test_page_loads "$url" "Bundle Input Page ($bundle_name)"
}

# Test bundle report generation (simulate API call)
test_bundle_generation() {
    local bundle_type=$1
    local reports=$2
    
    log_info "Testing bundle generation API for: $bundle_type"
    
    # Create a test payload (simulating what the frontend would send)
    payload=$(cat <<EOF
{
  "input": {
    "name": "$TEST_USER_NAME",
    "dob": "$TEST_USER_DOB",
    "tob": "$TEST_USER_TOB",
    "place": "$TEST_USER_PLACE",
    "latitude": $TEST_USER_LAT,
    "longitude": $TEST_USER_LON,
    "gender": "$TEST_USER_GENDER"
  },
  "reportType": "$(echo $reports | cut -d',' -f1)",
  "bundleType": "$bundle_type",
  "bundleReports": [$(echo $reports | sed 's/,/","/g' | sed 's/^/"/;s/$/"/')]
}
EOF
)
    
    log_info "Sending bundle generation request..."
    
    # Note: This would need actual authentication/payment tokens in production
    # For now, we're just checking if the endpoint exists and responds
    response=$(curl -s -w "\n%{http_code}" -X POST \
        -H "Content-Type: application/json" \
        -d "$payload" \
        "$BASE_URL/api/ai-astrology/generate-report" 2>&1)
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "200" ] || [ "$http_code" = "403" ] || [ "$http_code" = "401" ]; then
        # 200 = success, 403/401 = needs auth/payment (expected for test user)
        log_success "Bundle generation endpoint responds (HTTP $http_code)"
        
        if [ "$http_code" = "403" ] || [ "$http_code" = "401" ]; then
            log_warning "Endpoint requires authentication/payment (expected for production)"
        fi
        return 0
    elif [ "$http_code" = "000" ]; then
        log_error "Bundle generation endpoint not accessible (network error)"
        return 1
    else
        log_error "Bundle generation endpoint returned unexpected status: HTTP $http_code"
        echo "Response body: $body" | head -20
        return 1
    fi
}

# Test bundle preview page structure
test_bundle_preview_structure() {
    log_info "Testing bundle preview page structure"
    
    # Check if preview page loads
    test_page_loads "$BASE_URL/ai-astrology/preview" "Bundle Preview Page"
}

# Test bundle PDF generation endpoint
test_bundle_pdf_endpoint() {
    log_info "Testing bundle PDF generation logic"
    
    # Check if PDF generation endpoint exists
    # Note: PDF generation is client-side, but we can check if the route exists
    test_endpoint "/api/reports/pdf" "PDF Generation Endpoint" 200
}

# Main test execution
main() {
    echo "=========================================="
    echo "Bundle Report Generation E2E Test Suite"
    echo "=========================================="
    echo "Base URL: $BASE_URL"
    echo "Test User: $TEST_USER_NAME"
    echo "Date: $(date)"
    echo "=========================================="
    echo ""
    
    # Prerequisites
    log_info "Running prerequisite checks..."
    if ! check_server; then
        echo ""
        echo "=========================================="
        echo "TEST SUITE FAILED - Server not accessible"
        echo "=========================================="
        exit 1
    fi
    echo ""
    
    # Test basic pages
    log_info "Testing basic pages..."
    test_page_loads "$BASE_URL/ai-astrology" "AI Astrology Landing Page"
    test_page_loads "$BASE_URL/ai-astrology/input" "AI Astrology Input Page"
    test_bundle_preview_structure
    echo ""
    
    # Test each bundle type
    log_info "Testing bundle types..."
    for bundle_config in "${BUNDLES[@]}"; do
        bundle_type=$(echo "$bundle_config" | cut -d':' -f1)
        reports=$(echo "$bundle_config" | cut -d':' -f2)
        
        echo ""
        log_info "--- Testing Bundle: $bundle_type ---"
        
        # Test input page with bundle params
        test_bundle_input_page "$bundle_type" "$reports"
        
        # Test generation endpoint (may fail due to auth, but should exist)
        test_bundle_generation "$bundle_type" "$reports"
    done
    echo ""
    
    # Test PDF functionality
    log_info "Testing PDF functionality..."
    test_bundle_pdf_endpoint
    echo ""
    
    # Summary
    echo "=========================================="
    echo "TEST SUMMARY"
    echo "=========================================="
    echo "Total Tests: $TOTAL_TESTS"
    echo -e "${GREEN}Passed: $PASSED_TESTS${NC}"
    echo -e "${RED}Failed: $FAILED_TESTS${NC}"
    echo -e "${YELLOW}Warnings: $WARNINGS${NC}"
    echo ""
    
    if [ $FAILED_TESTS -eq 0 ]; then
        success_rate=$(awk "BEGIN {printf \"%.1f\", ($PASSED_TESTS/$TOTAL_TESTS)*100}")
        echo -e "${GREEN}Success Rate: ${success_rate}%${NC}"
        echo ""
        echo "=========================================="
        echo -e "${GREEN}ALL TESTS PASSED${NC}"
        echo "=========================================="
        exit 0
    else
        success_rate=$(awk "BEGIN {printf \"%.1f\", ($PASSED_TESTS/$TOTAL_TESTS)*100}")
        echo -e "${YELLOW}Success Rate: ${success_rate}%${NC}"
        echo ""
        echo "=========================================="
        echo -e "${RED}SOME TESTS FAILED${NC}"
        echo "=========================================="
        exit 1
    fi
}

# Run tests
main

