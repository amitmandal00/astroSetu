#!/bin/bash

# AstroSetu - E2E Testing Helper Script
# This script helps prepare the app for E2E testing

set -e

echo "🧪 AstroSetu - E2E Testing Setup"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Please run this script from the astrosetu directory.${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Pre-Testing Checklist${NC}"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  node_modules not found. Installing dependencies...${NC}"
    npm install
    echo ""
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️  .env.local not found. Creating template...${NC}"
    cat > .env.local << 'EOF'
# AstroSetu Environment Variables
# Copy this file and fill in your actual values

# Supabase (Optional - for authentication and database)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Razorpay (Optional - for payments)
NEXT_PUBLIC_RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

# Prokerala (Optional - for real astrology API)
PROKERALA_API_KEY=
PROKERALA_API_SECRET=

# App Configuration
NEXT_PUBLIC_APP_NAME=AstroSetu
NEXT_PUBLIC_APP_URL=http://localhost:3001
EOF
    echo -e "${GREEN}✅ Created .env.local template${NC}"
    echo -e "${YELLOW}⚠️  Please fill in your API keys in .env.local${NC}"
    echo ""
fi

# Check if dev server is running
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${GREEN}✅ Development server is running on port 3001${NC}"
else
    echo -e "${YELLOW}⚠️  Development server is not running${NC}"
    echo -e "${YELLOW}   Starting development server...${NC}"
    echo ""
    echo "   Run this command in a separate terminal:"
    echo "   npm run dev"
    echo ""
fi

echo ""
echo -e "${GREEN}📝 E2E Testing Guide${NC}"
echo "=================================="
echo ""
echo "1. Open the E2E testing guide:"
echo "   cat E2E_TESTING_GUIDE.md"
echo ""
echo "2. Start the dev server (if not running):"
echo "   npm run dev"
echo ""
echo "3. Open browser in incognito mode:"
echo "   http://localhost:3001"
echo ""
echo "4. Follow the customer journeys in E2E_TESTING_GUIDE.md"
echo ""
echo "5. Test all flows:"
echo "   - New user registration"
echo "   - Kundli generation"
echo "   - Match compatibility"
echo "   - Payment flows"
echo "   - Chat consultation"
echo "   - Report generation"
echo ""
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo ""
echo "Next Steps:"
echo "1. Review E2E_TESTING_GUIDE.md"
echo "2. Start dev server: npm run dev"
echo "3. Open http://localhost:3001 in incognito mode"
echo "4. Follow the test scenarios"
echo ""

