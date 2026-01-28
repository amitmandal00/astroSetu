#!/bin/bash

# Start Full Stack - Web Backend + Mobile App
# This script starts both the Next.js backend and mobile app

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo ""
echo -e "${BLUE}🚀 Starting AstroSetu Full Stack${NC}"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Not in astrosetu directory${NC}"
    echo "Please run from: /Users/amitkumarmandal/Documents/astroCursor/astrosetu"
    exit 1
fi

# Start Backend (Next.js)
echo -e "${BLUE}📡 Starting Backend Server (Port 3001)...${NC}"
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️  Warning: .env.local not found${NC}"
    echo "Creating template .env.local..."
    cat > .env.local << EOF
# Prokerala API
PROKERALA_CLIENT_ID=your_client_id
PROKERALA_CLIENT_SECRET=your_client_secret

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key

# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key

# App
APP_VERSION=1.0.0
EOF
    echo -e "${YELLOW}⚠️  Please configure .env.local with your API keys${NC}"
    echo ""
fi

# Start backend in background
echo "Starting Next.js backend..."
npm run dev > /tmp/astrosetu-backend.log 2>&1 &
BACKEND_PID=$!

echo -e "${GREEN}✅ Backend started (PID: $BACKEND_PID)${NC}"
echo "   Logs: /tmp/astrosetu-backend.log"
echo "   URL: http://localhost:3001"
echo ""

# Wait a bit for backend to start
sleep 3

# Check if backend is running
if ! curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Backend may still be starting...${NC}"
else
    echo -e "${GREEN}✅ Backend is responding${NC}"
fi

echo ""
echo -e "${BLUE}📱 Starting Mobile App...${NC}"
echo ""

# Start mobile app
cd mobile

# Check if React Native project is initialized
if [ ! -d "ios" ] && [ ! -d "android" ]; then
    echo -e "${YELLOW}⚠️  React Native project not initialized${NC}"
    echo ""
    echo "Quick setup options:"
    echo "  1) Use Expo (recommended for quick testing)"
    echo "  2) Initialize React Native CLI"
    echo ""
    read -p "Choose (1/2): " choice
    
    if [ "$choice" = "1" ]; then
        echo ""
        echo "Setting up Expo..."
        if ! command -v expo &> /dev/null; then
            npm install -g expo-cli
        fi
        npx expo start
    else
        echo ""
        echo "Please run: ./mobile/quick-start.sh"
        echo "Then come back and run this script again"
        exit 0
    fi
else
    echo "Starting Metro bundler..."
    npm start
fi

# Cleanup function
cleanup() {
    echo ""
    echo -e "${YELLOW}Stopping services...${NC}"
    kill $BACKEND_PID 2>/dev/null || true
    exit 0
}

trap cleanup SIGINT SIGTERM

echo ""
echo -e "${GREEN}✅ Full stack running!${NC}"
echo ""
echo "Backend: http://localhost:3001"
echo "Mobile: Check Metro bundler output above"
echo ""
echo "Press Ctrl+C to stop all services"

# Keep script running
wait

