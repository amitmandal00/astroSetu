#!/bin/bash

# AstroSetu vs AstroSage Accuracy Comparison Test
# Tests calculations and predictions against AstroSage.com

set -e

# Test User Data
TEST_NAME="Amit Kumar Mandal"
TEST_DOB="1984-11-26"
TEST_TOB="21:40:00"
TEST_PLACE="Noamundi, Jharkhand"
TEST_DAY=26
TEST_MONTH=11
TEST_YEAR=1984
TEST_HOURS=21
TEST_MINUTES=40

BASE_URL="${BASE_URL:-http://localhost:3001}"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "🔬 AstroSetu vs AstroSage Accuracy Test"
echo "========================================"
echo ""
echo "Test User: $TEST_NAME"
echo "DOB: $TEST_DOB"
echo "TOB: $TEST_TOB"
echo "Place: $TEST_PLACE"
echo ""
echo "Base URL: $BASE_URL"
echo ""

# Check if server is running
if ! curl -s "$BASE_URL/api/astrologers" > /dev/null 2>&1; then
    echo -e "${RED}❌ Server is not running on $BASE_URL${NC}"
    echo "   Please start it with: npm run dev"
    exit 1
fi

echo -e "${GREEN}✅ Server is running${NC}"
echo ""

# Test results
PASSED=0
FAILED=0
WARNINGS=0

# Function to test and compare
test_calculation() {
    local test_name="$1"
    local endpoint="$2"
    local data="$3"
    local expected_fields="$4"
    
    echo -e "${BLUE}Testing: $test_name${NC}"
    echo "----------------------------------------"
    
    # Call AstroSetu API
    response=$(curl -s -X POST "$BASE_URL$endpoint" \
        -H "Content-Type: application/json" \
        -d "$data" 2>/dev/null || echo '{"ok":false,"error":"Request failed"}')
    
    # Check if request was successful
    if echo "$response" | grep -q '"ok":true'; then
        echo -e "${GREEN}✓ API call successful${NC}"
        
        # Extract and display key fields
        echo "Response summary:"
        echo "$response" | jq -r '.data | to_entries[] | "  \(.key): \(.value)"' 2>/dev/null || echo "  (Unable to parse response)"
        
        # Check for expected fields
        if [ -n "$expected_fields" ]; then
            for field in $expected_fields; do
                if echo "$response" | grep -q "$field"; then
                    echo -e "  ${GREEN}✓ $field found${NC}"
                else
                    echo -e "  ${YELLOW}⚠ $field not found${NC}"
                    WARNINGS=$((WARNINGS + 1))
                fi
            done
        fi
        
        PASSED=$((PASSED + 1))
    else
        error=$(echo "$response" | jq -r '.error // "Unknown error"' 2>/dev/null || echo "Request failed")
        echo -e "${RED}✗ API call failed: $error${NC}"
        FAILED=$((FAILED + 1))
    fi
    
    echo ""
}

# Test 1: Kundli Generation
echo "📊 Test 1: Kundli Generation"
echo "=============================="
KUNDLI_DATA=$(cat <<EOF
{
  "name": "$TEST_NAME",
  "day": $TEST_DAY,
  "month": $TEST_MONTH,
  "year": $TEST_YEAR,
  "hours": "$TEST_HOURS",
  "minutes": "$TEST_MINUTES",
  "place": "$TEST_PLACE"
}
EOF
)

test_calculation "Kundli Generation" "/api/astrology/kundli" "$KUNDLI_DATA" "ascendant rashi nakshatra planets"

# Save Kundli result for other tests
KUNDLI_RESULT=$(curl -s -X POST "$BASE_URL/api/astrology/kundli" \
    -H "Content-Type: application/json" \
    -d "$KUNDLI_DATA")

echo "Key Kundli Data to Compare with AstroSage:"
echo "$KUNDLI_RESULT" | jq -r '.data | {
    "Ascendant (Lagna)": .ascendant,
    "Moon Sign (Rashi)": .rashi,
    "Nakshatra": .nakshatra,
    "Sun Sign": .sunSign,
    "Planetary Positions": [.planets[] | {planet: .name, sign: .sign, degree: .degree}]
}' 2>/dev/null || echo "  (Unable to parse)"

echo ""
echo "🔍 Compare with AstroSage:"
echo "   1. Go to https://www.astrosage.com/kundli/"
echo "   2. Enter the same birth details"
echo "   3. Compare:"
echo "      - Ascendant (Lagna)"
echo "      - Moon Sign (Rashi)"
echo "      - Nakshatra"
echo "      - Planetary positions (should match within ±1 degree)"
echo ""

# Test 2: Horoscope (Daily)
echo "📊 Test 2: Daily Horoscope"
echo "==========================="
HOROSCOPE_DATA=""
# Get sun sign from Kundli
SUN_SIGN=$(echo "$KUNDLI_RESULT" | jq -r '.data.sunSign // "Aries"' 2>/dev/null || echo "Aries")
echo "Using Sun Sign: $SUN_SIGN"

test_calculation "Daily Horoscope" "/api/astrology/horoscope?mode=daily&sign=$SUN_SIGN" "" "prediction"

echo ""

# Test 3: Panchang
echo "📊 Test 3: Panchang"
echo "===================="
PANCHANG_DATA="date=$(date +%Y-%m-%d)&place=$TEST_PLACE"
test_calculation "Panchang" "/api/astrology/panchang?$PANCHANG_DATA" "" "tithi nakshatra yoga"

echo ""

# Test 4: Numerology
echo "📊 Test 4: Numerology"
echo "====================="
NUMEROLOGY_DATA=$(cat <<EOF
{
  "name": "$TEST_NAME",
  "dob": "$TEST_DOB"
}
EOF
)

test_calculation "Numerology" "/api/astrology/numerology" "$NUMEROLOGY_DATA" "lifePath destiny soul"

echo ""

# Test 5: Dosha Analysis
echo "📊 Test 5: Dosha Analysis"
echo "========================="
DOSHA_DATA=$(cat <<EOF
{
  "day": $TEST_DAY,
  "month": $TEST_MONTH,
  "year": $TEST_YEAR,
  "hours": "$TEST_HOURS",
  "minutes": "$TEST_MINUTES",
  "place": "$TEST_PLACE"
}
EOF
)

test_calculation "Dosha Analysis" "/api/astrology/dosha" "$DOSHA_DATA" "manglik kaalSarp"

echo ""

# Test 6: Horoscope Matching (using same person for both)
echo "📊 Test 6: Horoscope Matching"
echo "=============================="
MATCH_DATA=$(cat <<EOF
{
  "a": {
    "day": $TEST_DAY,
    "month": $TEST_MONTH,
    "year": $TEST_YEAR,
    "hours": "$TEST_HOURS",
    "minutes": "$TEST_MINUTES",
    "place": "$TEST_PLACE"
  },
  "b": {
    "day": $TEST_DAY,
    "month": $TEST_MONTH,
    "year": $TEST_YEAR,
    "hours": "$TEST_HOURS",
    "minutes": "$TEST_MINUTES",
    "place": "$TEST_PLACE"
  }
}
EOF
)

test_calculation "Horoscope Matching" "/api/astrology/match" "$MATCH_DATA" "totalGuna gunaBreakdown"

echo ""

# Summary
echo "📊 Test Summary"
echo "==============="
echo "Total Tests: $((PASSED + FAILED))"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo -e "${YELLOW}Warnings: $WARNINGS${NC}"
echo ""

# Comparison Instructions
echo "📋 Manual Comparison Instructions"
echo "=================================="
echo ""
echo "For each test above, compare results with AstroSage:"
echo ""
echo "1. Kundli Generation:"
echo "   - Visit: https://www.astrosage.com/kundli/"
echo "   - Enter: $TEST_DOB, $TEST_TOB, $TEST_PLACE"
echo "   - Compare: Ascendant, Moon Sign, Nakshatra, Planetary Positions"
echo "   - Tolerance: ±1 degree for planetary positions"
echo ""
echo "2. Horoscope:"
echo "   - Visit: https://www.astrosage.com/horoscope/"
echo "   - Select: $SUN_SIGN, Daily"
echo "   - Compare: General predictions and trends"
echo ""
echo "3. Panchang:"
echo "   - Visit: https://www.astrosage.com/panchang/"
echo "   - Enter: Today's date, $TEST_PLACE"
echo "   - Compare: Tithi, Nakshatra, Yoga, Karana"
echo ""
echo "4. Numerology:"
echo "   - Visit: https://www.astrosage.com/numerology/"
echo "   - Enter: $TEST_NAME, $TEST_DOB"
echo "   - Compare: Life Path Number, Destiny Number, Soul Number"
echo ""
echo "5. Dosha Analysis:"
echo "   - Visit: https://www.astrosage.com/kundli/"
echo "   - Generate Kundli and check Dosha section"
echo "   - Compare: Manglik status, Kaal Sarp Dosha, Shani Dosha"
echo ""
echo "6. Horoscope Matching:"
echo "   - Visit: https://www.astrosage.com/match-making/"
echo "   - Enter: Same details for both (self-match test)"
echo "   - Compare: Total Guna, Guna breakdown"
echo "   - Tolerance: ±1 point for total Guna"
echo ""

# Expected Tolerances
echo "📏 Expected Tolerances"
echo "======================"
echo "✅ Planetary Positions: ±1 degree"
echo "✅ Time Calculations: ±5 minutes"
echo "✅ Guna Matching: ±1 point"
echo "✅ Numerology Numbers: Exact match"
echo "✅ Dosha Status: Exact match (Manglik/Non-Manglik)"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All API calls successful!${NC}"
    echo "   Please manually compare results with AstroSage using instructions above."
    exit 0
else
    echo -e "${RED}❌ Some API calls failed${NC}"
    echo "   Please check server logs and fix issues before comparing."
    exit 1
fi

