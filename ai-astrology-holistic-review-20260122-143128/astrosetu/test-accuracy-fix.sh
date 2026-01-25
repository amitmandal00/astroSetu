#!/bin/bash

# Test Accuracy Fix Verification Script
# Tests the fixes for test observations

set -e

BASE_URL="${BASE_URL:-http://localhost:3001}"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "🔬 Test Observations Fix Verification"
echo "====================================="
echo ""

# Test User Data
TEST_NAME="Amit Kumar Mandal"
TEST_DOB="1984-11-26"
TEST_TOB="21:40:00"
TEST_PLACE="Noamundi, Jharkhand"
# Approximate coordinates for Noamundi, Jharkhand
TEST_LAT=22.1667
TEST_LON=85.5167

echo "Test User: $TEST_NAME"
echo "DOB: $TEST_DOB"
echo "TOB: $TEST_TOB"
echo "Place: $TEST_PLACE"
echo "Coordinates: $TEST_LAT, $TEST_LON"
echo ""

# Check server
if ! curl -s "$BASE_URL/api/astrologers" > /dev/null 2>&1; then
    echo -e "${RED}❌ Server is not running${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Server is running${NC}"
echo ""

# Test 1: Check Prokerala Configuration
echo -e "${BLUE}Test 1: Prokerala Configuration${NC}"
echo "----------------------------------------"
config_response=$(curl -s "$BASE_URL/api/astrology/config")
configured=$(echo "$config_response" | jq -r '.data.configured // false' 2>/dev/null || echo "false")

if [ "$configured" = "true" ]; then
    echo -e "${GREEN}✅ Prokerala API is configured${NC}"
else
    echo -e "${RED}❌ Prokerala API is NOT configured${NC}"
    echo "   Add PROKERALA_CLIENT_ID and PROKERALA_CLIENT_SECRET to .env.local"
    echo ""
fi
echo ""

# Test 2: Diagnostic Endpoint
echo -e "${BLUE}Test 2: Diagnostic Endpoint${NC}"
echo "----------------------------------------"
diagnostic_response=$(curl -s "$BASE_URL/api/astrology/diagnostic")
echo "$diagnostic_response" | jq '.' 2>/dev/null || echo "$diagnostic_response"
echo ""

# Test 3: Test Kundli with Coordinates
echo -e "${BLUE}Test 3: Kundli Generation with Coordinates${NC}"
echo "----------------------------------------"
kundli_data=$(cat <<EOF
{
  "name": "$TEST_NAME",
  "dob": "$TEST_DOB",
  "tob": "$TEST_TOB",
  "place": "$TEST_PLACE",
  "latitude": $TEST_LAT,
  "longitude": $TEST_LON,
  "timezone": "Asia/Kolkata",
  "ayanamsa": 1
}
EOF
)

kundli_response=$(curl -s -X POST "$BASE_URL/api/astrology/kundli" \
    -H "Content-Type: application/json" \
    -d "$kundli_data")

echo "Response:"
echo "$kundli_response" | jq '.' 2>/dev/null || echo "$kundli_response"
echo ""

# Extract key fields
if echo "$kundli_response" | grep -q '"ok":true'; then
    ascendant=$(echo "$kundli_response" | jq -r '.data.ascendant // "Unknown"' 2>/dev/null || echo "Unknown")
    rashi=$(echo "$kundli_response" | jq -r '.data.rashi // "Unknown"' 2>/dev/null || echo "Unknown")
    nakshatra=$(echo "$kundli_response" | jq -r '.data.nakshatra // "Unknown"' 2>/dev/null || echo "Unknown")
    
    echo "Key Results:"
    echo "  Ascendant: $ascendant"
    echo "  Moon Sign (Rashi): $rashi"
    echo "  Nakshatra: $nakshatra"
    echo ""
    
    # Compare with expected (AstroSage)
    echo "Expected (AstroSage):"
    echo "  Ascendant: Aries (Mesha)"
    echo "  Moon Sign: Cancer (Karka)"
    echo "  Nakshatra: Ashlesha"
    echo ""
    
    # Check matches
    if [ "$ascendant" = "Aries" ]; then
        echo -e "${GREEN}✅ Ascendant matches${NC}"
    else
        echo -e "${RED}❌ Ascendant mismatch: Got $ascendant, Expected Aries${NC}"
    fi
    
    if [ "$rashi" = "Cancer" ]; then
        echo -e "${GREEN}✅ Moon Sign matches${NC}"
    else
        echo -e "${RED}❌ Moon Sign mismatch: Got $rashi, Expected Cancer${NC}"
    fi
    
    if [ "$nakshatra" = "Ashlesha" ]; then
        echo -e "${GREEN}✅ Nakshatra matches${NC}"
    else
        echo -e "${RED}❌ Nakshatra mismatch: Got $nakshatra, Expected Ashlesha${NC}"
    fi
else
    error=$(echo "$kundli_response" | jq -r '.error // "Unknown error"' 2>/dev/null || echo "Request failed")
    echo -e "${RED}❌ Kundli generation failed: $error${NC}"
fi

echo ""
echo "📋 Summary"
echo "=========="
echo "If all tests pass, the fixes are working correctly."
echo "If tests fail, check:"
echo "  1. Prokerala credentials are configured"
echo "  2. Coordinates are being passed correctly"
echo "  3. Prokerala API is responding correctly"
echo "  4. Response transformation is working"

