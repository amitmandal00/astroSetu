#!/bin/bash

# Start server and run AstroSage comparison tests

set -e

echo "🚀 Starting AstroSetu Server and Running Tests"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if server is already running
if curl -s http://localhost:3001 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Server is already running${NC}"
    echo ""
    ./test-astrosage-comprehensive.sh
else
    echo -e "${YELLOW}⚠️  Server is not running${NC}"
    echo ""
    echo -e "${BLUE}📋 Please start the server manually:${NC}"
    echo ""
    echo "   In a separate terminal, run:"
    echo "   cd astrosetu"
    echo "   npm run dev"
    echo ""
    echo "   Then wait for the server to start (you'll see 'Ready on http://localhost:3001')"
    echo ""
    echo -e "${YELLOW}Once the server is running, you can:${NC}"
    echo "   1. Run the test script: ./test-astrosage-comprehensive.sh"
    echo "   2. Or follow the manual guide: MANUAL_COMPARISON_GUIDE.md"
    echo ""
    echo -e "${BLUE}💡 Alternative: Test manually by opening:${NC}"
    echo "   - AstroSage: https://www.astrosage.com/"
    echo "   - AstroSetu: http://localhost:3001"
    echo ""
    echo "   Use test data:"
    echo "   Name: Amit Kumar Mandal"
    echo "   Date: 26/11/1984"
    echo "   Time: 21:40:00"
    echo "   Place: Noamundi, Jharkhand, India"
fi

