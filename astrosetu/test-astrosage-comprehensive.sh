#!/bin/bash

# Comprehensive AstroSage Comparison Testing Script
# This script helps automate the comparison testing process

set -e

echo "🔍 AstroSage Comprehensive Comparison Testing"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test data
TEST_NAME="Amit Kumar Mandal"
TEST_DATE="26/11/1984"
TEST_TIME="21:40:00"
TEST_PLACE="Noamundi, Jharkhand, India"
TEST_COORDS="22.15,85.50"

# Check if server is running
echo -e "${BLUE}📡 Checking if AstroSetu server is running...${NC}"
if curl -s http://localhost:3001 > /dev/null; then
    echo -e "${GREEN}✅ Server is running${NC}"
else
    echo -e "${RED}❌ Server is not running. Please start it with: npm run dev${NC}"
    exit 1
fi

# Check Prokerala API configuration
echo ""
echo -e "${BLUE}🔑 Checking Prokerala API configuration...${NC}"
if [ -f .env.local ]; then
    if grep -q "PROKERALA" .env.local; then
        echo -e "${GREEN}✅ Prokerala API configuration found${NC}"
        if grep -q "PROKERALA_API_KEY" .env.local || (grep -q "PROKERALA_CLIENT_ID" .env.local && grep -q "PROKERALA_CLIENT_SECRET" .env.local); then
            echo -e "${GREEN}✅ Prokerala API credentials configured${NC}"
        else
            echo -e "${YELLOW}⚠️  Prokerala API credentials may not be fully configured${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Prokerala API not configured - will use mock data${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  .env.local not found - will use mock data${NC}"
fi

# Create test results directory
RESULTS_DIR="test-results/astrosage-comparison-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$RESULTS_DIR"
echo ""
echo -e "${BLUE}📁 Test results will be saved to: $RESULTS_DIR${NC}"

# Test endpoints
echo ""
echo -e "${BLUE}🧪 Testing AstroSetu Endpoints...${NC}"
echo ""

# Test 1: Kundli Generation
echo -e "${YELLOW}Test 1: Kundli Generation${NC}"
KUNDLI_RESPONSE=$(curl -s -X POST http://localhost:3001/api/astrology/kundli \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"$TEST_NAME\",
    \"gender\": \"male\",
    \"dob\": \"1984-11-26\",
    \"tob\": \"21:40:00\",
    \"place\": \"$TEST_PLACE\",
    \"latitude\": 22.15,
    \"longitude\": 85.50,
    \"timezone\": \"Asia/Kolkata\"
  }")

if [ $? -eq 0 ]; then
    echo "$KUNDLI_RESPONSE" | jq '.' > "$RESULTS_DIR/kundli-response.json" 2>/dev/null || echo "$KUNDLI_RESPONSE" > "$RESULTS_DIR/kundli-response.json"
    echo -e "${GREEN}✅ Kundli API responded${NC}"
    echo "   Response saved to: $RESULTS_DIR/kundli-response.json"
    
    # Extract key values
    ASCENDANT=$(echo "$KUNDLI_RESPONSE" | jq -r '.ascendant // "N/A"' 2>/dev/null || echo "N/A")
    RASHI=$(echo "$KUNDLI_RESPONSE" | jq -r '.rashi // "N/A"' 2>/dev/null || echo "N/A")
    NAKSHATRA=$(echo "$KUNDLI_RESPONSE" | jq -r '.nakshatra // "N/A"' 2>/dev/null || echo "N/A")
    
    echo "   Ascendant: $ASCENDANT"
    echo "   Moon Sign: $RASHI"
    echo "   Nakshatra: $NAKSHATRA"
else
    echo -e "${RED}❌ Kundli API failed${NC}"
fi

echo ""

# Test 2: Panchang
echo -e "${YELLOW}Test 2: Panchang${NC}"
TODAY=$(date +%Y-%m-%d)
PANCHANG_RESPONSE=$(curl -s -X POST http://localhost:3001/api/astrology/panchang \
  -H "Content-Type: application/json" \
  -d "{
    \"date\": \"$TODAY\",
    \"place\": \"New Delhi, India\",
    \"latitude\": 28.6139,
    \"longitude\": 77.2090,
    \"timezone\": \"Asia/Kolkata\"
  }")

if [ $? -eq 0 ]; then
    echo "$PANCHANG_RESPONSE" | jq '.' > "$RESULTS_DIR/panchang-response.json" 2>/dev/null || echo "$PANCHANG_RESPONSE" > "$RESULTS_DIR/panchang-response.json"
    echo -e "${GREEN}✅ Panchang API responded${NC}"
    echo "   Response saved to: $RESULTS_DIR/panchang-response.json"
    
    # Extract key values
    TITHI=$(echo "$PANCHANG_RESPONSE" | jq -r '.tithi // "N/A"' 2>/dev/null || echo "N/A")
    NAKSHATRA_P=$(echo "$PANCHANG_RESPONSE" | jq -r '.nakshatra // "N/A"' 2>/dev/null || echo "N/A")
    
    echo "   Tithi: $TITHI"
    echo "   Nakshatra: $NAKSHATRA_P"
else
    echo -e "${RED}❌ Panchang API failed${NC}"
fi

echo ""

# Test 3: Numerology
echo -e "${YELLOW}Test 3: Numerology${NC}"
NUMEROLOGY_RESPONSE=$(curl -s -X POST http://localhost:3001/api/astrology/numerology \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"$TEST_NAME\",
    \"dob\": \"1984-11-26\"
  }")

if [ $? -eq 0 ]; then
    echo "$NUMEROLOGY_RESPONSE" | jq '.' > "$RESULTS_DIR/numerology-response.json" 2>/dev/null || echo "$NUMEROLOGY_RESPONSE" > "$RESULTS_DIR/numerology-response.json"
    echo -e "${GREEN}✅ Numerology API responded${NC}"
    echo "   Response saved to: $RESULTS_DIR/numerology-response.json"
    
    # Extract key values
    LIFE_PATH=$(echo "$NUMEROLOGY_RESPONSE" | jq -r '.lifePathNumber // "N/A"' 2>/dev/null || echo "N/A")
    DESTINY=$(echo "$NUMEROLOGY_RESPONSE" | jq -r '.destinyNumber // "N/A"' 2>/dev/null || echo "N/A")
    
    echo "   Life Path Number: $LIFE_PATH"
    echo "   Destiny Number: $DESTINY"
else
    echo -e "${RED}❌ Numerology API failed${NC}"
fi

echo ""

# Generate comparison report template
echo -e "${BLUE}📝 Generating comparison report template...${NC}"
cat > "$RESULTS_DIR/comparison-report.md" << EOF
# AstroSage vs AstroSetu Comparison Report

**Test Date**: $(date)
**Test User**: $TEST_NAME
**Birth Details**: $TEST_DATE, $TEST_TIME, $TEST_PLACE

---

## Test Results Summary

### 1. Kundli Generation

#### AstroSetu Results:
- Ascendant: $ASCENDANT
- Moon Sign: $RASHI
- Nakshatra: $NAKSHATRA

#### AstroSage Results:
- Ascendant: [Fill in from AstroSage]
- Moon Sign: [Fill in from AstroSage]
- Nakshatra: [Fill in from AstroSage]

#### Comparison:
- [ ] Ascendant matches
- [ ] Moon Sign matches
- [ ] Nakshatra matches

---

### 2. Panchang

#### AstroSetu Results:
- Tithi: $TITHI
- Nakshatra: $NAKSHATRA_P

#### AstroSage Results:
- Tithi: [Fill in from AstroSage]
- Nakshatra: [Fill in from AstroSage]

#### Comparison:
- [ ] Tithi matches
- [ ] Nakshatra matches

---

### 3. Numerology

#### AstroSetu Results:
- Life Path Number: $LIFE_PATH
- Destiny Number: $DESTINY

#### AstroSage Results:
- Life Path Number: [Fill in from AstroSage]
- Destiny Number: [Fill in from AstroSage]

#### Comparison:
- [ ] Life Path Number matches
- [ ] Destiny Number matches

---

## Next Steps

1. Visit https://www.astrosage.com/ and generate Kundli with same test data
2. Compare results side-by-side
3. Fill in AstroSage results in this report
4. Mark comparison checkboxes
5. Document any differences

---

## Files Generated

- Kundli Response: kundli-response.json
- Panchang Response: panchang-response.json
- Numerology Response: numerology-response.json
- This Report: comparison-report.md

EOF

echo -e "${GREEN}✅ Comparison report template created${NC}"
echo "   Report: $RESULTS_DIR/comparison-report.md"

echo ""
echo -e "${GREEN}✅ Automated Testing Complete!${NC}"
echo ""
echo -e "${BLUE}📋 Next Steps:${NC}"
echo "1. Review test results in: $RESULTS_DIR"
echo "2. Visit https://www.astrosage.com/ and test with same data"
echo "3. Fill in comparison report: $RESULTS_DIR/comparison-report.md"
echo "4. Compare results side-by-side"
echo "5. Document any differences"
echo ""
echo -e "${YELLOW}💡 Tip: Open both AstroSage and AstroSetu side-by-side for easy comparison${NC}"

