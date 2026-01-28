#!/bin/bash

# Comprehensive Retest Based on Previous Test Report
# Tests all fields from the original test observation report

set -e

BASE_URL="${BASE_URL:-http://localhost:3001}"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "🔬 AstroSetu vs AstroSage - Comprehensive Retest"
echo "================================================="
echo "Based on Previous Test Observation Report"
echo ""

# Test User Data (from report)
TEST_NAME="Amit Kumar Mandal"
TEST_DOB="1984-11-26"
TEST_TOB="21:40:00"
TEST_PLACE="Noamundi, Jharkhand, India"
TEST_LAT=22.1667
TEST_LON=85.5167
TEST_TIMEZONE="Asia/Kolkata"
TEST_AYANAMSA=1

echo "Test User: $TEST_NAME"
echo "DOB: $TEST_DOB"
echo "TOB: $TEST_TOB"
echo "Place: $TEST_PLACE"
echo "Coordinates: $TEST_LAT, $TEST_LON"
echo "Timezone: $TEST_TIMEZONE"
echo "Ayanamsa: $TEST_AYANAMSA (Lahiri)"
echo ""

# Test results
TIER1_PASS=0
TIER1_FAIL=0
TIER2_PASS=0
TIER2_FAIL=0
TIER3_PASS=0
TIER3_FAIL=0

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
    echo "   This test requires Prokerala to be configured"
    echo "   Add credentials to .env.local and restart server"
    exit 1
fi
echo ""

# Step 3: Generate Kundli
echo -e "${BLUE}Step 3: Generating Kundli with Prokerala API...${NC}"
echo "----------------------------------------"

KUNDLI_DATA=$(cat <<EOF
{
  "name": "$TEST_NAME",
  "dob": "$TEST_DOB",
  "tob": "$TEST_TOB",
  "place": "$TEST_PLACE",
  "latitude": $TEST_LAT,
  "longitude": $TEST_LON,
  "timezone": "$TEST_TIMEZONE",
  "ayanamsa": $TEST_AYANAMSA
}
EOF
)

response=$(curl -s -X POST "$BASE_URL/api/astrology/kundli" \
    -H "Content-Type: application/json" \
    -d "$KUNDLI_DATA")

if ! echo "$response" | grep -q '"ok":true'; then
    error=$(echo "$response" | jq -r '.error // "Unknown error"' 2>/dev/null || echo "Request failed")
    echo -e "${RED}❌ Kundli generation failed: $error${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Kundli generated successfully${NC}"
echo ""

# Extract results
ascendant=$(echo "$response" | jq -r '.data.ascendant // "Unknown"' 2>/dev/null || echo "Unknown")
rashi=$(echo "$response" | jq -r '.data.rashi // "Unknown"' 2>/dev/null || echo "Unknown")
nakshatra=$(echo "$response" | jq -r '.data.nakshatra // "Unknown"' 2>/dev/null || echo "Unknown")

# Extract planetary positions
sun_sign=$(echo "$response" | jq -r '.data.planets[]? | select(.name=="Sun") | .sign' 2>/dev/null || echo "Unknown")
moon_sign=$(echo "$response" | jq -r '.data.planets[]? | select(.name=="Moon") | .sign' 2>/dev/null || echo "Unknown")
mars_sign=$(echo "$response" | jq -r '.data.planets[]? | select(.name=="Mars") | .sign' 2>/dev/null || echo "Unknown")
mercury_sign=$(echo "$response" | jq -r '.data.planets[]? | select(.name=="Mercury") | .sign' 2>/dev/null || echo "Unknown")
jupiter_sign=$(echo "$response" | jq -r '.data.planets[]? | select(.name=="Jupiter") | .sign' 2>/dev/null || echo "Unknown")
venus_sign=$(echo "$response" | jq -r '.data.planets[]? | select(.name=="Venus") | .sign' 2>/dev/null || echo "Unknown")
saturn_sign=$(echo "$response" | jq -r '.data.planets[]? | select(.name=="Saturn") | .sign' 2>/dev/null || echo "Unknown")
rahu_sign=$(echo "$response" | jq -r '.data.planets[]? | select(.name=="Rahu") | .sign' 2>/dev/null || echo "Unknown")
ketu_sign=$(echo "$response" | jq -r '.data.planets[]? | select(.name=="Ketu") | .sign' 2>/dev/null || echo "Unknown")

# Extract degrees
ascendant_degree=$(echo "$response" | jq -r '.data.planets[]? | select(.name=="Ascendant" or .name=="Lagna") | .degree' 2>/dev/null || echo "0")
moon_degree=$(echo "$response" | jq -r '.data.planets[]? | select(.name=="Moon") | .degree' 2>/dev/null || echo "0")

# Get Dosha analysis
dosha_response=$(curl -s -X POST "$BASE_URL/api/astrology/dosha" \
    -H "Content-Type: application/json" \
    -d "$KUNDLI_DATA" 2>/dev/null || echo '{"ok":false}')

manglik_status="Unknown"
if echo "$dosha_response" | grep -q '"ok":true'; then
    manglik_status=$(echo "$dosha_response" | jq -r '.data.manglik.status // "Unknown"' 2>/dev/null || echo "Unknown")
fi

# Get Dasha
dasha_response=$(curl -s -X POST "$BASE_URL/api/astrology/dasha" \
    -H "Content-Type: application/json" \
    -d "$KUNDLI_DATA" 2>/dev/null || echo '{"ok":false}')

current_dasha="Unknown"
if echo "$dasha_response" | grep -q '"ok":true'; then
    current_dasha=$(echo "$dasha_response" | jq -r '.data.current.planet // "Unknown"' 2>/dev/null || echo "Unknown")
fi

# Print results
echo "📊 AstroSetu Results:"
echo "====================="
echo ""
echo "1️⃣ Core Kundli Identifiers (Tier-1):"
echo "   Ascendant: $ascendant"
echo "   Moon Sign (Rashi): $rashi"
echo "   Nakshatra: $nakshatra"
echo ""
echo "2️⃣ Planetary Positions (Tier-2):"
echo "   Sun: $sun_sign"
echo "   Moon: $moon_sign"
echo "   Mars: $mars_sign"
echo "   Mercury: $mercury_sign"
echo "   Jupiter: $jupiter_sign"
echo "   Venus: $venus_sign"
echo "   Saturn: $saturn_sign"
echo "   Rahu: $rahu_sign"
echo "   Ketu: $ketu_sign"
echo ""
echo "3️⃣ Dosha Analysis (Tier-3):"
echo "   Manglik: $manglik_status"
echo ""
echo "4️⃣ Dasha:"
echo "   Current Mahadasha: $current_dasha"
echo ""

# Compare with AstroSage (Expected)
echo "📊 AstroSage Expected (Benchmark):"
echo "=================================="
echo ""
echo "1️⃣ Core Kundli Identifiers:"
echo "   Ascendant: Aries (Mesha)"
echo "   Moon Sign: Cancer (Karka)"
echo "   Nakshatra: Ashlesha"
echo ""
echo "2️⃣ Planetary Positions:"
echo "   Sun: Scorpio"
echo "   Moon: Cancer"
echo "   Mars: Sagittarius"
echo "   Mercury: Scorpio"
echo "   Jupiter: Capricorn"
echo "   Venus: Libra"
echo "   Saturn: Scorpio"
echo "   Rahu: Taurus"
echo "   Ketu: Scorpio"
echo ""
echo "3️⃣ Dosha Analysis:"
echo "   Manglik: Yes (Moderate)"
echo ""
echo "4️⃣ Dasha:"
echo "   Birth Mahadasha: Mercury"
echo "   Current Mahadasha: Venus"
echo ""

# Detailed Comparison
echo "🔍 Detailed Comparison:"
echo "======================="
echo ""

# Tier-1 Comparison
echo "1️⃣ Tier-1: Core Kundli Identifiers"
echo "-----------------------------------"

if [ "$ascendant" = "Aries" ]; then
    echo -e "   ${GREEN}✅ Ascendant: PASS${NC} (Got: $ascendant, Expected: Aries)"
    TIER1_PASS=$((TIER1_PASS + 1))
else
    echo -e "   ${RED}❌ Ascendant: FAIL${NC} (Got: $ascendant, Expected: Aries)"
    TIER1_FAIL=$((TIER1_FAIL + 1))
fi

if [ "$rashi" = "Cancer" ]; then
    echo -e "   ${GREEN}✅ Moon Sign: PASS${NC} (Got: $rashi, Expected: Cancer)"
    TIER1_PASS=$((TIER1_PASS + 1))
else
    echo -e "   ${RED}❌ Moon Sign: FAIL${NC} (Got: $rashi, Expected: Cancer)"
    TIER1_FAIL=$((TIER1_FAIL + 1))
fi

if [ "$nakshatra" = "Ashlesha" ]; then
    echo -e "   ${GREEN}✅ Nakshatra: PASS${NC} (Got: $nakshatra, Expected: Ashlesha)"
    TIER1_PASS=$((TIER1_PASS + 1))
else
    echo -e "   ${RED}❌ Nakshatra: FAIL${NC} (Got: $nakshatra, Expected: Ashlesha)"
    TIER1_FAIL=$((TIER1_FAIL + 1))
fi

echo ""

# Tier-2 Comparison
echo "2️⃣ Tier-2: Planetary Positions"
echo "--------------------------------"

check_planet() {
    local planet_name=$1
    local got=$2
    local expected=$3
    
    if [ "$got" = "$expected" ]; then
        echo -e "   ${GREEN}✅ $planet_name: PASS${NC} (Got: $got, Expected: $expected)"
        TIER2_PASS=$((TIER2_PASS + 1))
    else
        echo -e "   ${RED}❌ $planet_name: FAIL${NC} (Got: $got, Expected: $expected)"
        TIER2_FAIL=$((TIER2_FAIL + 1))
    fi
}

check_planet "Sun" "$sun_sign" "Scorpio"
check_planet "Moon" "$moon_sign" "Cancer"
check_planet "Mars" "$mars_sign" "Sagittarius"
check_planet "Mercury" "$mercury_sign" "Scorpio"
check_planet "Jupiter" "$jupiter_sign" "Capricorn"
check_planet "Venus" "$venus_sign" "Libra"
check_planet "Saturn" "$saturn_sign" "Scorpio"
check_planet "Rahu" "$rahu_sign" "Taurus"
check_planet "Ketu" "$ketu_sign" "Scorpio"

echo ""

# Tier-3 Comparison
echo "3️⃣ Tier-3: Dosha & Dasha"
echo "-------------------------"

if [ "$manglik_status" = "Manglik" ] || [ "$manglik_status" = "Yes" ]; then
    echo -e "   ${GREEN}✅ Manglik: PASS${NC} (Got: $manglik_status, Expected: Yes/Moderate)"
    TIER3_PASS=$((TIER3_PASS + 1))
else
    echo -e "   ${RED}❌ Manglik: FAIL${NC} (Got: $manglik_status, Expected: Yes/Moderate)"
    TIER3_FAIL=$((TIER3_FAIL + 1))
fi

if [ "$current_dasha" = "Venus" ] || [ "$current_dasha" = "Mercury" ]; then
    echo -e "   ${GREEN}✅ Dasha: PASS${NC} (Got: $current_dasha, Expected: Venus/Mercury)"
    TIER3_PASS=$((TIER3_PASS + 1))
else
    echo -e "   ${YELLOW}⚠️  Dasha: CHECK${NC} (Got: $current_dasha, Expected: Venus/Mercury)"
    TIER3_FAIL=$((TIER3_FAIL + 1))
fi

echo ""

# Summary
echo "📊 Test Summary"
echo "==============="
echo ""
echo "Tier-1 (Core Identifiers):"
echo "   Pass: $TIER1_PASS"
echo "   Fail: $TIER1_FAIL"
if [ $TIER1_FAIL -eq 0 ]; then
    echo -e "   ${GREEN}✅ VERDICT: PASS${NC}"
else
    echo -e "   ${RED}❌ VERDICT: FAIL${NC}"
fi
echo ""

echo "Tier-2 (Planetary Positions):"
echo "   Pass: $TIER2_PASS"
echo "   Fail: $TIER2_FAIL"
if [ $TIER2_FAIL -eq 0 ]; then
    echo -e "   ${GREEN}✅ VERDICT: PASS${NC}"
elif [ $TIER2_FAIL -le 2 ]; then
    echo -e "   ${YELLOW}⚠️  VERDICT: PARTIAL PASS${NC}"
else
    echo -e "   ${RED}❌ VERDICT: FAIL${NC}"
fi
echo ""

echo "Tier-3 (Dosha & Dasha):"
echo "   Pass: $TIER3_PASS"
echo "   Fail: $TIER3_FAIL"
if [ $TIER3_FAIL -eq 0 ]; then
    echo -e "   ${GREEN}✅ VERDICT: PASS${NC}"
else
    echo -e "   ${YELLOW}⚠️  VERDICT: PARTIAL${NC}"
fi
echo ""

TOTAL_PASS=$((TIER1_PASS + TIER2_PASS + TIER3_PASS))
TOTAL_FAIL=$((TIER1_FAIL + TIER2_FAIL + TIER3_FAIL))
TOTAL_TESTS=$((TOTAL_PASS + TOTAL_FAIL))

echo "Overall:"
echo "   Total Tests: $TOTAL_TESTS"
echo "   Passed: $TOTAL_PASS"
echo "   Failed: $TOTAL_FAIL"
echo ""

if [ $TIER1_FAIL -eq 0 ] && [ $TIER2_FAIL -le 2 ]; then
    echo -e "${GREEN}✅ OVERALL VERDICT: PASS (within tolerance)${NC}"
elif [ $TIER1_FAIL -eq 0 ]; then
    echo -e "${YELLOW}⚠️  OVERALL VERDICT: PARTIAL PASS (Tier-1 matches, Tier-2 needs review)${NC}"
else
    echo -e "${RED}❌ OVERALL VERDICT: FAIL (Tier-1 mismatches)${NC}"
fi

echo ""
echo "📋 Full Response Data:"
echo "======================"
echo "$response" | jq '.data' 2>/dev/null || echo "$response"
echo ""

echo "📝 Next Steps:"
echo "   1. Review detailed comparison above"
echo "   2. Check any FAIL items"
echo "   3. Compare with AstroSage manually if needed"
echo "   4. Document any remaining discrepancies"
echo ""

