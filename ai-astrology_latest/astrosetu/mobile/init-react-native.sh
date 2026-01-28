#!/bin/bash

# AstroSetu Mobile App - React Native Initialization Script
# Run this script to set up the React Native project with our code

set -e

echo "🚀 AstroSetu Mobile App - React Native Setup"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PARENT_DIR="$(dirname "$SCRIPT_DIR")"
MOBILE_DIR="$SCRIPT_DIR"
PROJECT_NAME="AstroSetuMobile"
PROJECT_DIR="$PARENT_DIR/$PROJECT_NAME"

echo "📁 Script directory: $SCRIPT_DIR"
echo "📁 Parent directory: $PARENT_DIR"
echo "📁 Project will be created at: $PROJECT_DIR"
echo ""

# Check if project already exists
if [ -d "$PROJECT_DIR" ]; then
    echo -e "${YELLOW}⚠️  Project directory already exists: $PROJECT_DIR${NC}"
    read -p "Do you want to remove it and create a new one? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🗑️  Removing existing project..."
        rm -rf "$PROJECT_DIR"
    else
        echo "❌ Aborted. Please remove the directory manually or choose a different name."
        exit 1
    fi
fi

# Step 1: Create React Native project
echo ""
echo -e "${GREEN}Step 1: Creating React Native project...${NC}"
echo "This may take a few minutes..."
cd "$PARENT_DIR"

# Try with explicit version first, fallback to latest
echo "   Attempting to create project with TypeScript template..."
if ! npx @react-native-community/cli@latest init "$PROJECT_NAME" --template react-native-template-typescript --skip-install --version 0.73.0 2>/dev/null; then
    echo -e "   ${YELLOW}⚠️  Template version failed, trying latest...${NC}"
    if ! npx @react-native-community/cli@latest init "$PROJECT_NAME" --skip-install 2>/dev/null; then
        echo -e "   ${YELLOW}⚠️  Standard init failed, trying without template...${NC}"
        npx @react-native-community/cli@latest init "$PROJECT_NAME" --skip-install --skip-git-init
    fi
fi

if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${RED}❌ Failed to create React Native project${NC}"
    exit 1
fi

echo -e "${GREEN}✅ React Native project created${NC}"

# Step 2: Copy our code
echo ""
echo -e "${GREEN}Step 2: Copying our code...${NC}"

# Copy source code
if [ -d "$MOBILE_DIR/src" ]; then
    echo "   Copying src/ directory..."
    cp -r "$MOBILE_DIR/src" "$PROJECT_DIR/"
    echo -e "   ${GREEN}✅ src/ copied${NC}"
else
    echo -e "   ${YELLOW}⚠️  src/ directory not found${NC}"
fi

# Copy configuration files
echo "   Copying configuration files..."
FILES_TO_COPY=(
    "App.tsx"
    "index.js"
    "package.json"
    "tsconfig.json"
    "babel.config.js"
    "metro.config.js"
    ".eslintrc.js"
)

for file in "${FILES_TO_COPY[@]}"; do
    if [ -f "$MOBILE_DIR/$file" ]; then
        cp "$MOBILE_DIR/$file" "$PROJECT_DIR/"
        echo -e "   ${GREEN}✅ $file copied${NC}"
    else
        echo -e "   ${YELLOW}⚠️  $file not found${NC}"
    fi
done

echo -e "${GREEN}✅ Code copied successfully${NC}"

# Step 3: Install dependencies
echo ""
echo -e "${GREEN}Step 3: Installing dependencies...${NC}"
cd "$PROJECT_DIR"

echo "   Installing base dependencies..."
npm install

echo "   Installing React Navigation..."
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/stack @react-navigation/native-stack

echo "   Installing storage..."
npm install @react-native-async-storage/async-storage

echo "   Installing gesture handler and animations..."
npm install react-native-gesture-handler react-native-reanimated react-native-safe-area-context react-native-screens

echo "   Installing UI libraries..."
npm install react-native-vector-icons react-native-linear-gradient react-native-shimmer-placeholder

echo "   Installing utilities..."
npm install axios date-fns

echo "   Installing payment..."
npm install react-native-razorpay

echo "   Installing other features..."
npm install react-native-image-picker react-native-push-notification react-native-localize i18n-js

echo -e "${GREEN}✅ Dependencies installed${NC}"

# Step 4: iOS setup
echo ""
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo -e "${GREEN}Step 4: Setting up iOS...${NC}"
    if [ -d "$PROJECT_DIR/ios" ]; then
        cd "$PROJECT_DIR/ios"
        if command -v pod &> /dev/null; then
            pod install
            echo -e "${GREEN}✅ iOS pods installed${NC}"
        else
            echo -e "${YELLOW}⚠️  CocoaPods not found. Install with: sudo gem install cocoapods${NC}"
        fi
        cd ..
    else
        echo -e "${YELLOW}⚠️  iOS directory not found${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Skipping iOS setup (not on macOS)${NC}"
fi

# Step 5: Summary
echo ""
echo "=============================================="
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo "=============================================="
echo ""
echo "📁 Project location: $PROJECT_DIR"
echo ""
echo "🚀 Next Steps:"
echo ""
echo "1. Navigate to project:"
echo "   cd $PROJECT_DIR"
echo ""
echo "2. Start Metro bundler:"
echo "   npm start"
echo ""
echo "3. Run on Android (in another terminal):"
echo "   cd $PROJECT_DIR"
echo "   npm run android"
echo ""
echo "4. Or run on iOS (macOS only):"
echo "   cd $PROJECT_DIR"
echo "   npm run ios"
echo ""
echo "📚 Documentation:"
echo "   - See mobile/README_SETUP.md for detailed guide"
echo "   - See mobile/QUICK_START.md for quick reference"
echo ""
echo -e "${GREEN}Happy coding! 🎉${NC}"

