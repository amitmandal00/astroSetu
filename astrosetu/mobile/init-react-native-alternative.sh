#!/bin/bash

# Alternative React Native Setup - Using Expo or Manual Setup
# Use this if the standard init fails

set -e

echo "🚀 AstroSetu Mobile App - Alternative Setup"
echo "============================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PARENT_DIR="$(dirname "$SCRIPT_DIR")"
PROJECT_NAME="AstroSetuMobile"
PROJECT_DIR="$PARENT_DIR/$PROJECT_NAME"

echo "Choose setup method:"
echo "1. Expo (Recommended - Easier setup)"
echo "2. React Native CLI (Manual template fix)"
echo ""
read -p "Enter choice (1 or 2): " choice

case $choice in
    1)
        echo ""
        echo -e "${GREEN}Setting up with Expo...${NC}"
        echo ""
        echo "Using npx (no global installation needed)..."
        
        cd "$PARENT_DIR"
        npx create-expo-app@latest "$PROJECT_NAME" --template blank-typescript
        
        echo ""
        echo -e "${GREEN}✅ Expo project created${NC}"
        echo ""
        echo "Next steps:"
        echo "1. Copy our code: cp -r mobile/src $PROJECT_NAME/"
        echo "2. Install dependencies: cd $PROJECT_NAME && npm install"
        echo "3. Run: npm start"
        ;;
    2)
        echo ""
        echo -e "${GREEN}Manual React Native setup...${NC}"
        echo ""
        echo "Creating project directory..."
        mkdir -p "$PROJECT_DIR"
        cd "$PROJECT_DIR"
        
        echo "Initializing npm project..."
        npm init -y
        
        echo "Installing React Native..."
        npm install react-native@0.73.0 react@18.2.0
        
        echo "Creating basic structure..."
        mkdir -p src android ios
        
        echo ""
        echo -e "${YELLOW}⚠️  Manual setup requires additional configuration${NC}"
        echo "You'll need to:"
        echo "1. Set up Android project manually"
        echo "2. Set up iOS project manually"
        echo "3. Configure build files"
        echo ""
        echo "Consider using Expo instead (option 1) for easier setup."
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}Setup initiated!${NC}"

