#!/bin/bash

# AstroSetu Mobile App - Development Start Script
# This script starts Metro bundler and optionally runs the app

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PARENT_DIR="$(dirname "$SCRIPT_DIR")"
PROJECT_DIR="$PARENT_DIR/AstroSetuMobile"

echo "🚀 AstroSetu Mobile App - Development"
echo "======================================"
echo ""

# Check if project exists
if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${RED}❌ AstroSetuMobile project not found!${NC}"
    echo ""
    echo "Please run the initialization script first:"
    echo "  cd mobile"
    echo "  ./init-react-native.sh"
    echo ""
    exit 1
fi

cd "$PROJECT_DIR"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  node_modules not found. Installing dependencies...${NC}"
    npm install
    echo -e "${GREEN}✅ Dependencies installed${NC}"
    echo ""
fi

# Function to start Metro
start_metro() {
    echo -e "${BLUE}📦 Starting Metro bundler...${NC}"
    echo "   Metro will run on http://localhost:8081"
    echo "   Press Ctrl+C to stop"
    echo ""
    npm start
}

# Function to run Android
run_android() {
    echo -e "${GREEN}🤖 Running on Android...${NC}"
    echo ""
    
    # Check if Android emulator is running or device is connected
    if command -v adb &> /dev/null; then
        DEVICES=$(adb devices | grep -v "List" | grep "device" | wc -l)
        if [ "$DEVICES" -eq 0 ]; then
            echo -e "${YELLOW}⚠️  No Android device/emulator detected${NC}"
            echo "   Please start an emulator or connect a device"
            echo ""
        fi
    fi
    
    npm run android
}

# Function to run iOS
run_ios() {
    if [[ "$OSTYPE" != "darwin"* ]]; then
        echo -e "${RED}❌ iOS can only be run on macOS${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}🍎 Running on iOS...${NC}"
    echo ""
    
    # Check if pods are installed
    if [ -d "ios" ] && [ ! -d "ios/Pods" ]; then
        echo -e "${YELLOW}⚠️  iOS pods not installed. Installing...${NC}"
        cd ios
        pod install
        cd ..
    fi
    
    npm run ios
}

# Parse command line arguments
case "${1:-metro}" in
    metro)
        start_metro
        ;;
    android)
        # Start Metro in background if not running
        if ! lsof -Pi :8081 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
            echo -e "${BLUE}📦 Starting Metro bundler in background...${NC}"
            npm start > /dev/null 2>&1 &
            METRO_PID=$!
            echo "   Metro PID: $METRO_PID"
            sleep 5  # Wait for Metro to start
        else
            echo -e "${GREEN}✅ Metro bundler is already running${NC}"
        fi
        echo ""
        run_android
        ;;
    ios)
        # Start Metro in background if not running
        if ! lsof -Pi :8081 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
            echo -e "${BLUE}📦 Starting Metro bundler in background...${NC}"
            npm start > /dev/null 2>&1 &
            METRO_PID=$!
            echo "   Metro PID: $METRO_PID"
            sleep 5  # Wait for Metro to start
        else
            echo -e "${GREEN}✅ Metro bundler is already running${NC}"
        fi
        echo ""
        run_ios
        ;;
    *)
        echo "Usage: $0 [metro|android|ios]"
        echo ""
        echo "Commands:"
        echo "  metro   - Start Metro bundler only (default)"
        echo "  android - Start Metro and run on Android"
        echo "  ios     - Start Metro and run on iOS"
        exit 1
        ;;
esac

