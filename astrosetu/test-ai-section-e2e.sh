#!/bin/bash

# Comprehensive End-to-End Test for AI Astrology Section
# Tests: Header, Footer, Forms, Routing, Deep Links, Emails

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
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  AI Section E2E Test Suite${NC}"
echo -e "${BLUE}  Testing: ${BASE_URL}${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Test helper function
test_check() {
  TEST_COUNT=$((TEST_COUNT + 1))
  local name="$1"
  local result="$2"
  
  if [ "$result" = "0" ] || [ -z "$result" ]; then
    PASS_COUNT=$((PASS_COUNT + 1))
    echo -e "${GREEN}✅ PASS${NC}: $name"
    return 0
  else
    FAIL_COUNT=$((FAIL_COUNT + 1))
    echo -e "${RED}❌ FAIL${NC}: $name"
    ISSUES+=("$name")
    return 1
  fi
}

# Check if server is running
echo -e "${YELLOW}Checking server availability...${NC}"
if ! curl -s -f "${BASE_URL}" > /dev/null 2>&1; then
  echo -e "${RED}❌ Server is not running at ${BASE_URL}${NC}"
  echo -e "${YELLOW}Please start the server with: npm run dev${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Server is running${NC}\n"

# ============================================
# 1. HEADER TESTS
# ============================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}1. HEADER TESTS${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Test 1.1: Header exists and loads
echo "Testing header presence..."
HEADER_CHECK=$(curl -s "${BASE_URL}/ai-astrology" | grep -c "AIHeader\|AstroSetu AI" || echo "0")
test_check "Header component renders" "$HEADER_CHECK"

# Test 1.2: Logo link works
echo "Testing logo link..."
LOGO_LINK=$(curl -s "${BASE_URL}/ai-astrology" | grep -c 'href="/ai-astrology"' || echo "0")
test_check "Logo link present" "$LOGO_LINK"

# Test 1.3: CTA button exists
echo "Testing CTA button..."
CTA_BUTTON=$(curl -s "${BASE_URL}/ai-astrology" | grep -c 'Generate Report\|Start' || echo "0")
test_check "CTA button present" "$CTA_BUTTON"

# Test 1.4: Header navigation works
echo "Testing header navigation..."
HEADER_NAV=$(curl -s "${BASE_URL}/ai-astrology" | grep -c 'href="/ai-astrology/input' || echo "0")
test_check "Header navigation link works" "$HEADER_NAV"

# ============================================
# 2. FOOTER TESTS
# ============================================
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}2. FOOTER TESTS${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Test 2.1: Footer exists
echo "Testing footer presence..."
FOOTER_CHECK=$(curl -s "${BASE_URL}/ai-astrology" | grep -c "AIFooter\|©.*AstroSetu AI\|MindVeda" || echo "0")
test_check "Footer component renders" "$FOOTER_CHECK"

# Test 2.2: Footer links - FAQ
echo "Testing FAQ link..."
FAQ_LINK=$(curl -s "${BASE_URL}/ai-astrology" | grep -c 'href="/ai-astrology/faq"' || echo "0")
test_check "FAQ link present" "$FAQ_LINK"

# Test 2.3: Footer links - Privacy
echo "Testing Privacy Policy link..."
PRIVACY_LINK=$(curl -s "${BASE_URL}/ai-astrology" | grep -c 'href="/privacy"' || echo "0")
test_check "Privacy Policy link present" "$PRIVACY_LINK"

# Test 2.4: Footer links - Terms
echo "Testing Terms link..."
TERMS_LINK=$(curl -s "${BASE_URL}/ai-astrology" | grep -c 'href="/terms"' || echo "0")
test_check "Terms link present" "$TERMS_LINK"

# Test 2.5: Footer links - Disclaimer
echo "Testing Disclaimer link..."
DISCLAIMER_LINK=$(curl -s "${BASE_URL}/ai-astrology" | grep -c 'href="/disclaimer"' || echo "0")
test_check "Disclaimer link present" "$DISCLAIMER_LINK"

# Test 2.6: Footer links - Refund
echo "Testing Refund Policy link..."
REFUND_LINK=$(curl -s "${BASE_URL}/ai-astrology" | grep -c 'href="/refund"' || echo "0")
test_check "Refund Policy link present" "$REFUND_LINK"

# Test 2.7: Footer links - Cookies
echo "Testing Cookie Policy link..."
COOKIES_LINK=$(curl -s "${BASE_URL}/ai-astrology" | grep -c 'href="/cookies"' || echo "0")
test_check "Cookie Policy link present" "$COOKIES_LINK"

# Test 2.8: Footer links - Contact
echo "Testing Contact link..."
CONTACT_LINK=$(curl -s "${BASE_URL}/ai-astrology" | grep -c 'href="/contact"' || echo "0")
test_check "Contact link present" "$CONTACT_LINK"

# Test 2.9: Footer links - Data Breach
echo "Testing Data Breach link..."
DATA_BREACH_LINK=$(curl -s "${BASE_URL}/ai-astrology" | grep -c 'href="/data-breach"' || echo "0")
test_check "Data Breach Policy link present" "$DATA_BREACH_LINK"

# Test 2.10: Footer links - Disputes
echo "Testing Disputes link..."
DISPUTES_LINK=$(curl -s "${BASE_URL}/ai-astrology" | grep -c 'href="/disputes"' || echo "0")
test_check "Dispute Resolution link present" "$DISPUTES_LINK"

# Test 2.11: Footer contact emails
echo "Testing footer contact emails..."
EMAIL_LINKS=$(curl -s "${BASE_URL}/ai-astrology" | grep -c 'mailto:privacy@mindveda.net\|mailto:legal@mindveda.net\|mailto:security@mindveda.net' || echo "0")
test_check "Contact email links present" "$EMAIL_LINKS"

# ============================================
# 3. ROUTING TESTS
# ============================================
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}3. ROUTING TESTS${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Test 3.1: Main landing page
echo "Testing main AI astrology page..."
LANDING_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/ai-astrology")
test_check "Landing page loads (${LANDING_STATUS})" "$([ "$LANDING_STATUS" = "200" ] && echo "" || echo "1")"

# Test 3.2: Input form page
echo "Testing input form page..."
INPUT_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/ai-astrology/input")
test_check "Input form page loads (${INPUT_STATUS})" "$([ "$INPUT_STATUS" = "200" ] && echo "" || echo "1")"

# Test 3.3: FAQ page
echo "Testing FAQ page..."
FAQ_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/ai-astrology/faq")
test_check "FAQ page loads (${FAQ_STATUS})" "$([ "$FAQ_STATUS" = "200" ] && echo "" || echo "1")"

# Test 3.4: Bundle page
echo "Testing bundle page..."
BUNDLE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/ai-astrology/bundle")
test_check "Bundle page loads (${BUNDLE_STATUS})" "$([ "$BUNDLE_STATUS" = "200" ] && echo "" || echo "1")"

# Test 3.5: Subscription page
echo "Testing subscription page..."
SUBSCRIPTION_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/ai-astrology/subscription")
test_check "Subscription page loads (${SUBSCRIPTION_STATUS})" "$([ "$SUBSCRIPTION_STATUS" = "200" ] && echo "" || echo "1")"

# Test 3.6: Privacy page (footer link)
echo "Testing Privacy Policy page..."
PRIVACY_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/privacy")
test_check "Privacy Policy page loads (${PRIVACY_STATUS})" "$([ "$PRIVACY_STATUS" = "200" ] && echo "" || echo "1")"

# Test 3.7: Terms page
echo "Testing Terms page..."
TERMS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/terms")
test_check "Terms page loads (${TERMS_STATUS})" "$([ "$TERMS_STATUS" = "200" ] && echo "" || echo "1")"

# Test 3.8: Disclaimer page
echo "Testing Disclaimer page..."
DISCLAIMER_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/disclaimer")
test_check "Disclaimer page loads (${DISCLAIMER_STATUS})" "$([ "$DISCLAIMER_STATUS" = "200" ] && echo "" || echo "1")"

# Test 3.9: Refund page
echo "Testing Refund Policy page..."
REFUND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/refund")
test_check "Refund Policy page loads (${REFUND_STATUS})" "$([ "$REFUND_STATUS" = "200" ] && echo "" || echo "1")"

# Test 3.10: Cookies page
echo "Testing Cookie Policy page..."
COOKIES_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/cookies")
test_check "Cookie Policy page loads (${COOKIES_STATUS})" "$([ "$COOKIES_STATUS" = "200" ] && echo "" || echo "1")"

# Test 3.11: Contact page
echo "Testing Contact page..."
CONTACT_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/contact")
test_check "Contact page loads (${CONTACT_STATUS})" "$([ "$CONTACT_STATUS" = "200" ] && echo "" || echo "1")"

# Test 3.12: Data Breach page
echo "Testing Data Breach Policy page..."
DATA_BREACH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/data-breach")
test_check "Data Breach Policy page loads (${DATA_BREACH_STATUS})" "$([ "$DATA_BREACH_STATUS" = "200" ] && echo "" || echo "1")"

# Test 3.13: Disputes page
echo "Testing Dispute Resolution page..."
DISPUTES_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/disputes")
test_check "Dispute Resolution page loads (${DISPUTES_STATUS})" "$([ "$DISPUTES_STATUS" = "200" ] && echo "" || echo "1")"

# ============================================
# 4. DEEP LINK TESTS
# ============================================
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}4. DEEP LINK TESTS${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Test 4.1: Report type deep link - life-summary
echo "Testing deep link: life-summary..."
LIFE_SUMMARY_CHECK=$(curl -s "${BASE_URL}/ai-astrology/input?reportType=life-summary" | grep -c "life-summary\|Life Summary" || echo "0")
test_check "Deep link: reportType=life-summary" "$LIFE_SUMMARY_CHECK"

# Test 4.2: Report type deep link - year-analysis
echo "Testing deep link: year-analysis..."
YEAR_ANALYSIS_CHECK=$(curl -s "${BASE_URL}/ai-astrology/input?reportType=year-analysis" | grep -c "year-analysis\|Year Analysis" || echo "0")
test_check "Deep link: reportType=year-analysis" "$YEAR_ANALYSIS_CHECK"

# Test 4.3: Report type deep link - marriage-timing
echo "Testing deep link: marriage-timing..."
MARRIAGE_CHECK=$(curl -s "${BASE_URL}/ai-astrology/input?reportType=marriage-timing" | grep -c "marriage-timing\|Marriage" || echo "0")
test_check "Deep link: reportType=marriage-timing" "$MARRIAGE_CHECK"

# Test 4.4: Report type deep link - career-money
echo "Testing deep link: career-money..."
CAREER_CHECK=$(curl -s "${BASE_URL}/ai-astrology/input?reportType=career-money" | grep -c "career-money\|Career" || echo "0")
test_check "Deep link: reportType=career-money" "$CAREER_CHECK"

# Test 4.5: Bundle deep link - any-2
echo "Testing deep link: bundle any-2..."
BUNDLE_ANY2_CHECK=$(curl -s "${BASE_URL}/ai-astrology/input?bundle=any-2" | grep -c "bundle\|any-2" || echo "0")
test_check "Deep link: bundle=any-2" "$BUNDLE_ANY2_CHECK"

# Test 4.6: Bundle deep link - all-3
echo "Testing deep link: bundle all-3..."
BUNDLE_ALL3_CHECK=$(curl -s "${BASE_URL}/ai-astrology/input?bundle=all-3" | grep -c "bundle\|all-3" || echo "0")
test_check "Deep link: bundle=all-3" "$BUNDLE_ALL3_CHECK"

# ============================================
# 5. FORM TESTS
# ============================================
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}5. FORM TESTS${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Test 5.1: Input form fields exist
echo "Testing input form fields..."
INPUT_FORM_FIELDS=$(curl -s "${BASE_URL}/ai-astrology/input" | grep -c 'name\|dob\|tob\|place\|gender' || echo "0")
test_check "Input form fields present" "$INPUT_FORM_FIELDS"

# Test 5.2: Contact form exists
echo "Testing contact form..."
CONTACT_FORM=$(curl -s "${BASE_URL}/contact" | grep -c 'name\|email\|message\|subject' || echo "0")
test_check "Contact form present" "$CONTACT_FORM"

# Test 5.3: Contact form API endpoint exists
echo "Testing contact form API endpoint..."
CONTACT_API=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${BASE_URL}/api/contact" -H "Content-Type: application/json" -d '{}')
test_check "Contact API endpoint exists (${CONTACT_API})" "$([ "$CONTACT_API" != "404" ] && echo "" || echo "1")"

# ============================================
# 6. EMAIL TESTS (API Level)
# ============================================
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}6. EMAIL API TESTS${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Test 6.1: Contact API accepts valid payload
echo "Testing contact API with valid payload..."
CONTACT_API_VALID=$(curl -s -X POST "${BASE_URL}/api/contact" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","message":"Test message","subject":"Test"}' | grep -c 'ok\|error' || echo "0")
test_check "Contact API accepts valid payload" "$CONTACT_API_VALID"

# Test 6.2: Contact API validates required fields
echo "Testing contact API validation..."
CONTACT_API_VALIDATION=$(curl -s -X POST "${BASE_URL}/api/contact" \
  -H "Content-Type: application/json" \
  -d '{}' | grep -c 'required\|error' || echo "0")
test_check "Contact API validates required fields" "$CONTACT_API_VALIDATION"

# ============================================
# 7. PAGE CONTENT TESTS
# ============================================
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}7. PAGE CONTENT TESTS${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Test 7.1: Landing page has report cards
echo "Testing landing page content..."
LANDING_CONTENT=$(curl -s "${BASE_URL}/ai-astrology" | grep -c 'Year Analysis\|Life Summary\|Marriage\|Career' || echo "0")
test_check "Landing page has report content" "$LANDING_CONTENT"

# Test 7.2: FAQ page has content
echo "Testing FAQ page content..."
FAQ_CONTENT=$(curl -s "${BASE_URL}/ai-astrology/faq" | grep -c 'FAQ\|question\|answer' || echo "0")
test_check "FAQ page has content" "$FAQ_CONTENT"

# ============================================
# 8. NO ORANGE HEADER/FOOTER TEST
# ============================================
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}8. ORANGE HEADER/FOOTER FIX VERIFICATION${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Test 8.1: No old orange header on AI section
echo "Testing no orange header flash..."
ORANGE_HEADER=$(curl -s "${BASE_URL}/ai-astrology" | grep -c 'data-shell-content\|Shell' || echo "0")
test_check "No orange header on AI section" "$([ "$ORANGE_HEADER" = "0" ] && echo "" || echo "1")"

# Test 8.2: data-ai-route attribute present
echo "Testing data-ai-route attribute..."
AI_ROUTE_ATTR=$(curl -s "${BASE_URL}/ai-astrology" | grep -c 'data-ai-route="true"' || echo "0")
test_check "data-ai-route attribute set correctly" "$AI_ROUTE_ATTR"

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
  echo -e "\n${GREEN}✅ All tests passed!${NC}"
  exit 0
fi

