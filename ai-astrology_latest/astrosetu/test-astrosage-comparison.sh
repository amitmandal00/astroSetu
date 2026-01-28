#!/bin/bash

# AstroSage Comparison Testing Script
# Compares AstroSetu calculations with AstroSage.com results

echo "🔍 AstroSage Comparison Testing"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test data
TEST_NAME="Amit Kumar Mandal"
TEST_DATE="26/11/1984"
TEST_TIME="21:40:00"
TEST_PLACE="Noamundi, Jharkhand, India"

echo "📋 Test Data:"
echo "  Name: $TEST_NAME"
echo "  Date: $TEST_DATE"
echo "  Time: $TEST_TIME"
echo "  Place: $TEST_PLACE"
echo ""

# Check if server is running
echo "🔍 Checking if dev server is running..."
if curl -s http://localhost:3001 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Dev server is running${NC}"
else
    echo -e "${RED}❌ Dev server is not running${NC}"
    echo "   Please start it with: npm run dev"
    exit 1
fi

echo ""
echo "📊 Testing Kundli Generation..."
echo ""

# Test Kundli API
echo "Testing: POST /api/astrology/kundli"
RESPONSE=$(curl -s -X POST http://localhost:3001/api/astrology/kundli \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"$TEST_NAME\",
    \"gender\": \"Male\",
    \"day\": 26,
    \"month\": 11,
    \"year\": 1984,
    \"hours\": 21,
    \"minutes\": 40,
    \"seconds\": 0,
    \"place\": \"$TEST_PLACE\"
  }")

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ API responded successfully${NC}"
    
    # Extract key values
    ASCENDANT=$(echo $RESPONSE | grep -o '"ascendant":"[^"]*"' | cut -d'"' -f4)
    RASHI=$(echo $RESPONSE | grep -o '"rashi":"[^"]*"' | cut -d'"' -f4)
    NAKSHATRA=$(echo $RESPONSE | grep -o '"nakshatra":"[^"]*"' | cut -d'"' -f4)
    
    echo ""
    echo "📊 AstroSetu Results:"
    echo "  Ascendant: ${ASCENDANT:-N/A}"
    echo "  Rashi (Moon Sign): ${RASHI:-N/A}"
    echo "  Nakshatra: ${NAKSHATRA:-N/A}"
    echo ""
    echo -e "${YELLOW}⚠️  Manual Comparison Required:${NC}"
    echo "  1. Go to https://www.astrosage.com/"
    echo "  2. Enter the same test data"
    echo "  3. Compare results with above"
    echo "  4. Fill in ASTROSAGE_COMPARISON_TEST.md"
else
    echo -e "${RED}❌ API request failed${NC}"
fi

echo ""
echo "📊 Testing Panchang..."
echo ""

# Test Panchang API
PANCHANG_RESPONSE=$(curl -s -X POST http://localhost:3001/api/astrology/panchang \
  -H "Content-Type: application/json" \
  -d "{
    \"date\": \"$(date +%Y-%m-%d)\",
    \"place\": \"New Delhi, India\"
  }")

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Panchang API responded${NC}"
    
    TITHI=$(echo $PANCHANG_RESPONSE | grep -o '"tithi":"[^"]*"' | cut -d'"' -f4)
    NAKSHATRA_P=$(echo $PANCHANG_RESPONSE | grep -o '"nakshatra":"[^"]*"' | cut -d'"' -f4)
    
    echo "  Tithi: ${TITHI:-N/A}"
    echo "  Nakshatra: ${NAKSHATRA_P:-N/A}"
    echo ""
    echo -e "${YELLOW}⚠️  Compare with AstroSage Panchang${NC}"
else
    echo -e "${RED}❌ Panchang API request failed${NC}"
fi

echo ""
echo "📊 Testing Numerology..."
echo ""

# Test Numerology API
NUMEROLOGY_RESPONSE=$(curl -s -X POST http://localhost:3001/api/astrology/numerology \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"$TEST_NAME\",
    \"dob\": \"1984-11-26\"
  }")

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Numerology API responded${NC}"
    
    LIFE_PATH=$(echo $NUMEROLOGY_RESPONSE | grep -o '"lifePathNumber":[0-9]*' | cut -d':' -f2)
    DESTINY=$(echo $NUMEROLOGY_RESPONSE | grep -o '"destinyNumber":[0-9]*' | cut -d':' -f2)
    
    echo "  Life Path Number: ${LIFE_PATH:-N/A}"
    echo "  Destiny Number: ${DESTINY:-N/A}"
    echo ""
    echo -e "${YELLOW}⚠️  Compare with AstroSage Numerology Calculator${NC}"
else
    echo -e "${RED}❌ Numerology API request failed${NC}"
fi

echo ""
echo "================================"
echo "📝 Next Steps:"
echo "================================"
echo ""
echo "1. Open ASTROSAGE_COMPARISON_TEST.md"
echo "2. Fill in AstroSage results for each test case"
echo "3. Compare with AstroSetu results"
echo "4. Document any differences"
echo "5. Fix calculation issues if found"
echo ""
echo -e "${BLUE}💡 Tip: Use browser DevTools to inspect API responses${NC}"
echo ""

