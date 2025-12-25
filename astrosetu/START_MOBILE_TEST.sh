#!/bin/bash

# Mobile App Testing Startup Script
# Run this script to start both backend and mobile app

set -e

echo "🚀 Starting Mobile App Testing Environment..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the astrosetu directory"
    exit 1
fi

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        return 0
    else
        return 1
    fi
}

# Check if backend is already running
if check_port 3000; then
    echo -e "${YELLOW}⚠️  Backend is already running on port 3000${NC}"
    echo "   Skipping backend startup..."
else
    echo -e "${BLUE}📦 Starting Backend Server...${NC}"
    echo "   Running: npm run dev"
    echo ""
    
    # Start backend in background
    npm run dev > backend.log 2>&1 &
    BACKEND_PID=$!
    echo "   Backend started with PID: $BACKEND_PID"
    echo "   Logs: backend.log"
    
    # Wait for backend to start
    echo -e "${YELLOW}⏳ Waiting for backend to start...${NC}"
    for i in {1..30}; do
        if curl -s http://localhost:3000/api > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Backend is ready!${NC}"
            break
        fi
        if [ $i -eq 30 ]; then
            echo -e "${YELLOW}⚠️  Backend may still be starting...${NC}"
        fi
        sleep 1
    done
    echo ""
fi

# Navigate to mobile directory
if [ ! -d "mobile" ]; then
    echo "❌ Error: mobile directory not found"
    exit 1
fi

cd mobile

# Check if mobile dependencies are installed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing mobile app dependencies...${NC}"
    npm install
    echo ""
fi

# Check if Expo is installed
if ! command -v expo &> /dev/null && ! command -v npx &> /dev/null; then
    echo "❌ Error: npm/npx not found. Please install Node.js first."
    exit 1
fi

echo -e "${BLUE}📱 Starting Mobile App (Expo)...${NC}"
echo ""
echo "   Options:"
echo "   - Press 'i' to open iOS Simulator"
echo "   - Press 'a' to open Android Emulator"
echo "   - Scan QR code with Expo Go app on your phone"
echo ""
echo -e "${YELLOW}💡 Tip: If iOS Simulator shows 'No devices available':${NC}"
echo "   1. Run: open -a Simulator"
echo "   2. File → New Simulator"
echo "   3. Choose iPhone 15 or iPhone 14"
echo "   4. Then press 'i' in Expo terminal"
echo ""

# Start Expo
npx expo start

