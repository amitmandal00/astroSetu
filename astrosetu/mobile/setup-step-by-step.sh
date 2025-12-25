#!/bin/bash

# Step-by-step React Native setup with error handling
# This script will guide you through the setup process

set -e

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

echo "🚀 AstroSetu Mobile App - Step-by-Step Setup"
echo "============================================"
echo ""

# Step 1: Clear caches
echo -e "${BLUE}Step 1: Clearing caches...${NC}"
npm cache clean --force 2>/dev/null || true
rm -rf /tmp/rncli-* 2>/dev/null || true
rm -rf ~/.npm/_cacache 2>/dev/null || true
echo -e "${GREEN}✅ Caches cleared${NC}"
echo ""

# Step 2: Check if project exists
if [ -d "$PROJECT_DIR" ]; then
    echo -e "${YELLOW}⚠️  Project already exists: $PROJECT_DIR${NC}"
    read -p "Remove and recreate? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -rf "$PROJECT_DIR"
        echo -e "${GREEN}✅ Removed existing project${NC}"
    else
        echo "Using existing project..."
    fi
    echo ""
fi

# Step 3: Try creating project with different methods
cd "$PARENT_DIR"

echo -e "${BLUE}Step 2: Creating React Native project...${NC}"
echo ""

# Method 1: Try with latest version (no specific version)
echo "   Attempting Method 1: Latest React Native with TypeScript..."
if npx @react-native-community/cli@latest init "$PROJECT_NAME" --template react-native-template-typescript --skip-install --skip-git-init 2>&1 | tee /tmp/rn-init.log; then
    echo -e "${GREEN}✅ Project created successfully with Method 1${NC}"
    METHOD=1
else
    echo -e "${YELLOW}⚠️  Method 1 failed, trying Method 2...${NC}"
    
    # Method 2: Try without template
    echo "   Attempting Method 2: Without TypeScript template..."
    if npx @react-native-community/cli@latest init "$PROJECT_NAME" --skip-install --skip-git-init 2>&1 | tee -a /tmp/rn-init.log; then
        echo -e "${GREEN}✅ Project created successfully with Method 2${NC}"
        METHOD=2
    else
        echo -e "${YELLOW}⚠️  Method 2 failed, trying Method 3 (Expo)...${NC}"
        
        # Method 3: Use Expo (most reliable)
        echo "   Attempting Method 3: Using Expo..."
        if command -v npx &> /dev/null; then
            if npx create-expo-app@latest "$PROJECT_NAME" --template blank-typescript --no-install 2>&1 | tee -a /tmp/rn-init.log; then
                echo -e "${GREEN}✅ Project created with Expo${NC}"
                METHOD=3
            else
                echo -e "${RED}❌ All methods failed${NC}"
                METHOD=0
            fi
        else
            echo -e "${RED}❌ npx not available${NC}"
            METHOD=0
        fi
    fi
fi

if [ ! -d "$PROJECT_DIR" ] || [ "$METHOD" = "0" ]; then
    echo -e "${RED}❌ Failed to create project${NC}"
    echo ""
    echo "Error log saved to: /tmp/rn-init.log"
    echo ""
    echo -e "${YELLOW}Recommended: Use Expo setup instead${NC}"
    echo "  cd mobile"
    echo "  ./init-react-native-alternative.sh"
    echo "  (Choose option 1 - Expo)"
    echo ""
    echo "Expo is more reliable and doesn't have template issues."
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Project created!${NC}"
echo ""

# Step 4: Copy our code
echo -e "${BLUE}Step 3: Copying our code...${NC}"
cd "$PROJECT_DIR"

# Copy source code
if [ -d "$SCRIPT_DIR/src" ]; then
    cp -r "$SCRIPT_DIR/src" .
    echo -e "   ${GREEN}✅ src/ copied${NC}"
fi

# Copy configuration files
FILES_TO_COPY=(
    "App.tsx:App.tsx"
    "index.js:index.js"
    "package.json:package.json"
    "tsconfig.json:tsconfig.json"
    "babel.config.js:babel.config.js"
    "metro.config.js:metro.config.js"
    ".eslintrc.js:.eslintrc.js"
)

for file_pair in "${FILES_TO_COPY[@]}"; do
    IFS=':' read -r src_file dest_file <<< "$file_pair"
    if [ -f "$SCRIPT_DIR/$src_file" ]; then
        cp "$SCRIPT_DIR/$src_file" "./$dest_file"
        echo -e "   ${GREEN}✅ $dest_file copied${NC}"
    fi
done

echo -e "${GREEN}✅ Code copied${NC}"
echo ""

# Step 5: Install dependencies
echo -e "${BLUE}Step 4: Installing dependencies...${NC}"

# Merge package.json dependencies
if [ -f "package.json" ] && [ -f "$SCRIPT_DIR/package.json" ]; then
    echo "   Merging package.json dependencies..."
    node -e "
        const ourPkg = require('$SCRIPT_DIR/package.json');
        const projPkg = require('./package.json');
        projPkg.dependencies = {...projPkg.dependencies, ...ourPkg.dependencies};
        projPkg.devDependencies = {...projPkg.devDependencies, ...ourPkg.devDependencies};
        require('fs').writeFileSync('./package.json', JSON.stringify(projPkg, null, 2));
    " 2>/dev/null || echo "   (Manual merge may be needed)"
fi

echo "   Installing npm packages..."
npm install

echo "   Installing additional packages..."
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/stack @react-navigation/native-stack
npm install @react-native-async-storage/async-storage
npm install react-native-gesture-handler react-native-reanimated react-native-safe-area-context react-native-screens
npm install react-native-vector-icons react-native-linear-gradient react-native-shimmer-placeholder
npm install axios date-fns
npm install react-native-razorpay
npm install react-native-image-picker react-native-push-notification react-native-localize i18n-js

echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Step 6: iOS setup
if [[ "$OSTYPE" == "darwin"* ]] && [ -d "ios" ]; then
    echo -e "${BLUE}Step 5: Setting up iOS...${NC}"
    if command -v pod &> /dev/null; then
        cd ios
        pod install
        cd ..
        echo -e "${GREEN}✅ iOS pods installed${NC}"
    else
        echo -e "${YELLOW}⚠️  CocoaPods not found. Install with: sudo gem install cocoapods${NC}"
    fi
    echo ""
fi

# Step 7: Summary
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
echo -e "${GREEN}Happy coding! 🎉${NC}"

