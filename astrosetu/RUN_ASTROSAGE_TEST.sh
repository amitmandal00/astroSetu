#!/bin/bash

# Complete AstroSage Retest Script
# Tests AstroSetu against AstroSage with test user data

set -e

BASE_URL="${BASE_URL:-http://localhost:3001}"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "🔬 AstroSetu vs AstroSage Retest"
echo "================================="
echo ""

# Test User Data
TEST_NAME="Amit Kumar Mandal"
TEST_DOB="1984-11-26"
TEST_TOB="21:40:00"
TEST_PLACE="Noamundi, Jharkhand"
TEST_LAT=22.1667
TEST_LON=85.5167

echo "Test User: $TEST_NAME"
echo "DOB: $TEST_DOB"
echo "TOB: $TEST_TOB"
echo "Place: $TEST_PLACE"
echo "Coordinates: $TEST_LAT, $TEST_LON"
echo ""

# Step 1: Check server
echo -e "${BLUE}Step 1: Checking server status...${NC}"
if ! curl -s "$BASE_URL/api/astrologers" > /dev/null 2>&1; then
    echo -e "${RED}❌ Server is not running on $BASE_URL${NC}"
    echo "   Please start it with: npm run dev"
    exit 1
fi
echo -e "${GREEN}✅ Server is running${NC}"
echo ""

# Step 2: Check Prokerala configuration
echo -e "${BLUE}Step 2: Checking Prokerala configuration...${NC}"
config_response=$(curl -s "$BASE_URL/api/astrology/config")
configured=$(echo "$config_response" | jq -r '.data.configured // false' 2>/dev/null || echo "false")

if [ "$configured" = "true" ]; then
    echo -e "${GREEN}✅ Prokerala API is configured${NC}"
else
    echo -e "${RED}❌ Prokerala API is NOT configured${NC}"
    echo "   Add credentials to .env.local and restart server"
    exit 1
fi
echo ""

# Step 3: Test Kundli Generation
echo -e "${BLUE}Step 3: Testing Kundli Generation...${NC}"
echo "----------------------------------------"

KUNDLI_DATA=$(cat <<EOF
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

response=$(curl -s -X POST "$BASE_URL/api/astrology/kundli" \
    -H "Content-Type: application/json" \
    -d "$KUNDLI_DATA")

if echo "$response" | grep -q '"ok":true'; then
    echo -e "${GREEN}✅ Kundli generated successfully${NC}"
    echo ""
    
    # Extract key fields
    ascendant=$(echo "$response" | jq -r '.data.ascendant // "Unknown"' 2>/dev/null || echo "Unknown")
    rashi=$(echo "$response" | jq -r '.data.rashi // "Unknown"' 2>/dev/null || echo "Unknown")
    nakshatra=$(echo "$response" | jq -r '.data.nakshatra // "Unknown"' 2>/dev/null || echo "Unknown")
    
    echo "📊 AstroSetu Results:"
    echo "   Ascendant: $ascendant"
    echo "   Moon Sign (Rashi): $rashi"
    echo "   Nakshatra: $nakshatra"
    echo ""
    
    # Extract planetary positions
    echo "Planetary Positions:"
    echo "$response" | jq -r '.data.planets[]? | "   \(.name): \(.sign) \(.degree)°"' 2>/dev/null || echo "   (Unable to parse)"
    echo ""
    
    # Compare with expected (AstroSage)
    echo "📊 Expected (AstroSage):"
    echo "   Ascendant: Aries (Mesha)"
    echo "   Moon Sign: Cancer (Karka)"
    echo "   Nakshatra: Ashlesha"
    echo ""
    
    # Check matches
    echo "🔍 Comparison:"
    if [ "$ascendant" = "Aries" ]; then
        echo -e "   ${GREEN}✅ Ascendant matches (Aries)${NC}"
    else
        echo -e "   ${RED}❌ Ascendant mismatch: Got $ascendant, Expected Aries${NC}"
    fi
    
    if [ "$rashi" = "Cancer" ]; then
        echo -e "   ${GREEN}✅ Moon Sign matches (Cancer)${NC}"
    else
        echo -e "   ${RED}❌ Moon Sign mismatch: Got $rashi, Expected Cancer${NC}"
    fi
    
    if [ "$nakshatra" = "Ashlesha" ]; then
        echo -e "   ${GREEN}✅ Nakshatra matches (Ashlesha)${NC}"
    else
        echo -e "   ${RED}❌ Nakshatra mismatch: Got $nakshatra, Expected Ashlesha${NC}"
    fi
    
    echo ""
    echo "📋 Full Response (for detailed comparison):"
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
    
else
    error=$(echo "$response" | jq -r '.error // "Unknown error"' 2>/dev/null || echo "Request failed")
    echo -e "${RED}❌ Kundli generation failed: $error${NC}"
    echo ""
    echo "Response:"
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
    exit 1
fi

echo ""
echo "📝 Next Steps:"
echo "   1. Compare these results with AstroSage:"
echo "      Visit: https://www.astrosage.com/kundli/"
echo "   2. Enter the same test user data"
echo "   3. Compare field by field"
echo ""
echo "✅ Test complete!"

