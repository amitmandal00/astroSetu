#!/bin/bash

# Quick Start Script - Initialize React Native Project and Start Development

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PARENT_DIR="$(dirname "$SCRIPT_DIR")"

echo ""
echo -e "${BLUE}🚀 AstroSetu Mobile - Quick Start${NC}"
echo ""

# Check if iOS/Android folders exist
if [ -d "ios" ] || [ -d "android" ]; then
    echo -e "${GREEN}✅ React Native project already initialized${NC}"
    echo ""
    echo "Starting Metro bundler..."
    npm start
else
    echo -e "${YELLOW}⚠️  React Native project not initialized${NC}"
    echo ""
    echo "Options:"
    echo "  1) Use Expo (easier, no native setup needed)"
    echo "  2) Initialize React Native CLI project"
    echo ""
    read -p "Choose option (1/2): " choice
    
    if [ "$choice" = "1" ]; then
        echo ""
        echo -e "${BLUE}Setting up with Expo...${NC}"
        
        # Check if Expo is installed
        if ! command -v expo &> /dev/null; then
            echo "Installing Expo CLI..."
            npm install -g expo-cli
        fi
        
        # Initialize Expo if needed
        if [ ! -f "app.json" ]; then
            echo "Creating Expo app.json..."
            cat > app.json << EOF
{
  "expo": {
    "name": "AstroSetu",
    "slug": "astrosetu-mobile",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#F97316"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.astrosetu.mobile"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#F97316"
      },
      "package": "com.astrosetu.mobile"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    }
  }
}
EOF
        fi
        
        echo ""
        echo -e "${GREEN}✅ Expo setup complete${NC}"
        echo ""
        echo "Starting Expo..."
        npx expo start
    else
        echo ""
        echo -e "${BLUE}Initializing React Native CLI project...${NC}"
        echo ""
        echo "This will create a new React Native project and copy your code."
        echo ""
        read -p "Press Enter to continue..."
        
        # Go to parent directory
        cd "$PARENT_DIR"
        
        # Create new React Native project
        echo "Creating React Native project..."
        npx react-native@latest init AstroSetuMobile --skip-install
        
        # Copy our code
        echo "Copying source code..."
        cp -r mobile/src AstroSetuMobile/
        cp mobile/App.tsx AstroSetuMobile/ 2>/dev/null || true
        cp mobile/index.js AstroSetuMobile/ 2>/dev/null || true
        cp mobile/package.json AstroSetuMobile/
        cp mobile/tsconfig.json AstroSetuMobile/ 2>/dev/null || true
        cp mobile/babel.config.js AstroSetuMobile/ 2>/dev/null || true
        cp mobile/metro.config.js AstroSetuMobile/ 2>/dev/null || true
        
        # Install dependencies
        cd AstroSetuMobile
        echo "Installing dependencies..."
        npm install
        
        # iOS setup
        if [[ "$OSTYPE" == "darwin"* ]]; then
            echo "Setting up iOS..."
            cd ios && pod install && cd ..
        fi
        
        echo ""
        echo -e "${GREEN}✅ React Native project initialized${NC}"
        echo ""
        echo "Starting Metro bundler..."
        npm start
    fi
fi

