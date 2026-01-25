#!/bin/bash

# Production User Testing Script
# Simulates real user behavior and reports issues

set -e

BASE_URL="${1:-http://localhost:3001}"
TEST_COUNT=0
PASS_COUNT=0
FAIL_COUNT=0
ISSUES=()

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Production User Testing${NC}"
echo -e "${BLUE}  Testing: ${BASE_URL}${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Test helper
test_check() {
  TEST_COUNT=$((TEST_COUNT + 1))
  local name="$1"
  local result="$2"
  local details="$3"
  
  if [ "$result" = "0" ] || [ -z "$result" ]; then
    PASS_COUNT=$((PASS_COUNT + 1))
    echo -e "${GREEN}✅ PASS${NC}: $name"
    [ -n "$details" ] && echo -e "   ${details}"
    return 0
  else
    FAIL_COUNT=$((FAIL_COUNT + 1))
    echo -e "${RED}❌ FAIL${NC}: $name"
    [ -n "$details" ] && echo -e "   ${details}"
    ISSUES+=("$name")
    return 1
  fi
}

# Check server
echo -e "${YELLOW}Checking server...${NC}"
if ! curl -s -f "${BASE_URL}" > /dev/null 2>&1; then
  echo -e "${RED}❌ Server is not running at ${BASE_URL}${NC}"
  echo -e "${YELLOW}Please start the server with: npm run dev${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Server is running${NC}\n"

# ============================================
# USER JOURNEY 1: Landing Page → Report Selection
# ============================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}USER JOURNEY 1: Landing Page → Report Selection${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Test 1.1: Access AI Astrology landing page
echo "Test: User visits AI Astrology landing page..."
LANDING_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/ai-astrology")
test_check "Landing page accessible" "$([ "$LANDING_STATUS" = "200" ] && echo "" || echo "1")" "Status: ${LANDING_STATUS}"

# Test 1.2: Check for orange header/footer flash
echo "Test: No orange header/footer flash on landing..."
ORANGE_CHECK=$(curl -s "${BASE_URL}/ai-astrology" | grep -c 'data-ai-route="true"' || echo "0")
test_check "Orange header/footer fix working" "$ORANGE_CHECK" "data-ai-route attribute present"

# Test 1.3: Verify header displays correctly
echo "Test: Header displays correctly..."
HEADER_CHECK=$(curl -s "${BASE_URL}/ai-astrology" | grep -c "AstroSetu AI\|Generate Report" || echo "0")
test_check "Header visible" "$HEADER_CHECK" "Header content found"

# Test 1.4: Verify footer displays correctly
echo "Test: Footer displays correctly..."
FOOTER_CHECK=$(curl -s "${BASE_URL}/ai-astrology" | grep -c "Privacy Policy\|Terms of Use\|©.*AstroSetu AI" || echo "0")
test_check "Footer visible" "$FOOTER_CHECK" "Footer content found"

# Test 1.5: Click on "Get My Year Analysis" button
echo "Test: Year Analysis CTA button link..."
YEAR_ANALYSIS_LINK=$(curl -s "${BASE_URL}/ai-astrology" | grep -o 'href="/ai-astrology/input?reportType=year-analysis"' || echo "")
test_check "Year Analysis CTA link present" "$([ -n "$YEAR_ANALYSIS_LINK" ] && echo "" || echo "1")" "Link: ${YEAR_ANALYSIS_LINK}"

# ============================================
# USER JOURNEY 2: Form Input → Report Generation
# ============================================
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}USER JOURNEY 2: Form Input → Report Generation${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Test 2.1: Access input form via deep link
echo "Test: Access input form with reportType parameter..."
INPUT_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/ai-astrology/input?reportType=year-analysis")
test_check "Input form accessible via deep link" "$([ "$INPUT_STATUS" = "200" ] && echo "" || echo "1")" "Status: ${INPUT_STATUS}"

# Test 2.2: Form fields present
echo "Test: Form fields are present..."
FORM_FIELDS=$(curl -s "${BASE_URL}/ai-astrology/input?reportType=year-analysis" | grep -c 'name\|dob\|tob\|place\|gender' || echo "0")
test_check "Form fields present" "$FORM_FIELDS" "Found ${FORM_FIELDS} form fields"

# Test 2.3: Test form submission (API endpoint)
echo "Test: Form submission API endpoint..."
API_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/ai-astrology/generate-report" \
  -H "Content-Type: application/json" \
  -d '{
    "reportType": "year-analysis",
    "name": "Test User",
    "dob": "1990-01-15",
    "tob": "10:30:00",
    "place": "Mumbai",
    "gender": "Male"
  }' | grep -c 'ok\|error\|requestId' || echo "0")
test_check "Report generation API responds" "$API_RESPONSE" "API returned response"

# ============================================
# USER JOURNEY 3: Navigation & Deep Links
# ============================================
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}USER JOURNEY 3: Navigation & Deep Links${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Test 3.1: Deep link - Life Summary
echo "Test: Deep link - Life Summary report..."
LIFE_SUMMARY=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/ai-astrology/input?reportType=life-summary")
test_check "Life Summary deep link works" "$([ "$LIFE_SUMMARY" = "200" ] && echo "" || echo "1")" "Status: ${LIFE_SUMMARY}"

# Test 3.2: Deep link - Marriage Timing
echo "Test: Deep link - Marriage Timing report..."
MARRIAGE=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/ai-astrology/input?reportType=marriage-timing")
test_check "Marriage Timing deep link works" "$([ "$MARRIAGE" = "200" ] && echo "" || echo "1")" "Status: ${MARRIAGE}"

# Test 3.3: Deep link - Career & Money
echo "Test: Deep link - Career & Money report..."
CAREER=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/ai-astrology/input?reportType=career-money")
test_check "Career & Money deep link works" "$([ "$CAREER" = "200" ] && echo "" || echo "1")" "Status: ${CAREER}"

# Test 3.4: Logo click navigation
echo "Test: Logo navigation to home..."
LOGO_NAV=$(curl -s "${BASE_URL}/ai-astrology" | grep -c 'href="/ai-astrology"' || echo "0")
test_check "Logo navigation link present" "$LOGO_NAV" "Logo link found"

# ============================================
# USER JOURNEY 4: Footer Links & Legal Pages
# ============================================
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}USER JOURNEY 4: Footer Links & Legal Pages${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Test 4.1: Privacy Policy link
echo "Test: Privacy Policy page..."
PRIVACY_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/privacy")
test_check "Privacy Policy accessible" "$([ "$PRIVACY_STATUS" = "200" ] && echo "" || echo "1")" "Status: ${PRIVACY_STATUS}"

# Test 4.2: Terms of Use link
echo "Test: Terms of Use page..."
TERMS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/terms")
test_check "Terms of Use accessible" "$([ "$TERMS_STATUS" = "200" ] && echo "" || echo "1")" "Status: ${TERMS_STATUS}"

# Test 4.3: FAQ link
echo "Test: FAQ page..."
FAQ_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/ai-astrology/faq")
test_check "FAQ accessible" "$([ "$FAQ_STATUS" = "200" ] && echo "" || echo "1")" "Status: ${FAQ_STATUS}"

# Test 4.4: Contact page
echo "Test: Contact page..."
CONTACT_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/contact")
test_check "Contact page accessible" "$([ "$CONTACT_STATUS" = "200" ] && echo "" || echo "1")" "Status: ${CONTACT_STATUS}"

# Test 4.5: Contact form present
echo "Test: Contact form on contact page..."
CONTACT_FORM=$(curl -s "${BASE_URL}/contact" | grep -c 'name\|email\|message\|subject' || echo "0")
test_check "Contact form present" "$CONTACT_FORM" "Found ${CONTACT_FORM} form fields"

# ============================================
# USER JOURNEY 5: Contact Form Submission
# ============================================
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}USER JOURNEY 5: Contact Form Submission${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Test 5.1: Contact API accepts submission
echo "Test: Contact form API accepts submission..."
CONTACT_API=$(curl -s -X POST "${BASE_URL}/api/contact" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "subject": "Test Inquiry",
    "message": "This is a test message",
    "category": "general"
  }' | grep -c 'ok\|error\|submissionId' || echo "0")
test_check "Contact API accepts submission" "$CONTACT_API" "API responded"

# Test 5.2: Contact API validates required fields
echo "Test: Contact API validates required fields..."
CONTACT_VALIDATION=$(curl -s -X POST "${BASE_URL}/api/contact" \
  -H "Content-Type: application/json" \
  -d '{}' | grep -c 'required\|error\|missing' || echo "0")
test_check "Contact API validates fields" "$CONTACT_VALIDATION" "Validation working"

# ============================================
# USER JOURNEY 6: Root Landing Page
# ============================================
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}USER JOURNEY 6: Root Landing Page${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Test 6.1: Root page accessible
echo "Test: Root landing page accessible..."
ROOT_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/")
test_check "Root page accessible" "$([ "$ROOT_STATUS" = "200" ] && echo "" || echo "1")" "Status: ${ROOT_STATUS}"

# Test 6.2: No orange header on root
echo "Test: No orange header on root page..."
ROOT_ORANGE=$(curl -s "${BASE_URL}/" | grep -c 'data-ai-route="true"' || echo "0")
test_check "Root page orange header fix" "$ROOT_ORANGE" "data-ai-route attribute present"

# ============================================
# USER JOURNEY 7: Error Handling
# ============================================
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}USER JOURNEY 7: Error Handling${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Test 7.1: 404 page for invalid route
echo "Test: 404 handling for invalid route..."
NOT_FOUND=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/invalid-route-12345")
test_check "404 page for invalid routes" "$([ "$NOT_FOUND" = "404" ] && echo "" || echo "1")" "Status: ${NOT_FOUND}"

# Test 7.2: Invalid report type handling
echo "Test: Invalid report type handling..."
INVALID_REPORT=$(curl -s "${BASE_URL}/ai-astrology/input?reportType=invalid-type" | grep -c 'error\|not found\|invalid' || echo "0")
test_check "Invalid report type handled gracefully" "$([ "$INVALID_REPORT" = "0" ] && echo "" || echo "1")" "Page loads without error"

# ============================================
# SUMMARY
# ============================================
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}TEST SUMMARY${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

echo -e "Total Tests: ${TEST_COUNT}"
echo -e "${GREEN}Passed: ${PASS_COUNT}${NC}"
echo -e "${RED}Failed: ${FAIL_COUNT}${NC}"

if [ ${FAIL_COUNT} -gt 0 ]; then
  echo -e "\n${YELLOW}Issues Found:${NC}"
  for issue in "${ISSUES[@]}"; do
    echo -e "  ❌ $issue"
  done
  echo -e "\n${RED}❌ Some tests failed. Please review the issues above.${NC}"
  exit 1
else
  echo -e "\n${GREEN}✅ All production user tests passed!${NC}"
  exit 0
fi

