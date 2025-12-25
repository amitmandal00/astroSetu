#!/bin/bash

# Verify Mobile App Setup
# Run this after setup to verify everything is correct

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PARENT_DIR="$(dirname "$SCRIPT_DIR")"
PROJECT_DIR="$PARENT_DIR/AstroSetuMobile"

echo "🔍 Verifying AstroSetu Mobile App Setup"
echo "========================================"
echo ""

PASSED=0
FAILED=0

# Check if project exists
echo -e "${BLUE}Checking project directory...${NC}"
if [ -d "$PROJECT_DIR" ]; then
    echo -e "${GREEN}✅ Project directory exists: $PROJECT_DIR${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}❌ Project directory not found: $PROJECT_DIR${NC}"
    echo "   Run: ./setup-step-by-step.sh"
    FAILED=$((FAILED + 1))
    exit 1
fi

# Check key directories
echo ""
echo -e "${BLUE}Checking project structure...${NC}"

DIRS_TO_CHECK=("src" "android" "node_modules")
if [[ "$OSTYPE" == "darwin"* ]]; then
    DIRS_TO_CHECK+=("ios")
fi

for dir in "${DIRS_TO_CHECK[@]}"; do
    if [ -d "$PROJECT_DIR/$dir" ]; then
        echo -e "${GREEN}✅ $dir/ exists${NC}"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}❌ $dir/ not found${NC}"
        FAILED=$((FAILED + 1))
    fi
done

# Check key files
echo ""
echo -e "${BLUE}Checking key files...${NC}"

FILES_TO_CHECK=("App.tsx" "index.js" "package.json" "tsconfig.json" "babel.config.js" "metro.config.js")

for file in "${FILES_TO_CHECK[@]}"; do
    if [ -f "$PROJECT_DIR/$file" ]; then
        echo -e "${GREEN}✅ $file exists${NC}"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}❌ $file not found${NC}"
        FAILED=$((FAILED + 1))
    fi
done

# Check source structure
echo ""
echo -e "${BLUE}Checking source code structure...${NC}"

SRC_DIRS=("screens" "components" "navigation" "services" "theme" "context" "constants")

for dir in "${SRC_DIRS[@]}"; do
    if [ -d "$PROJECT_DIR/src/$dir" ]; then
        echo -e "${GREEN}✅ src/$dir/ exists${NC}"
        PASSED=$((PASSED + 1))
    else
        echo -e "${YELLOW}⚠️  src/$dir/ not found${NC}"
    fi
done

# Check dependencies
echo ""
echo -e "${BLUE}Checking dependencies...${NC}"

cd "$PROJECT_DIR" 2>/dev/null || {
    echo -e "${RED}❌ Cannot access project directory${NC}"
    exit 1
}

if [ -f "package.json" ]; then
    KEY_DEPS=("react-native" "@react-navigation/native" "@react-native-async-storage/async-storage" "react-native-gesture-handler" "axios")
    
    for dep in "${KEY_DEPS[@]}"; do
        if npm list "$dep" --depth=0 >/dev/null 2>&1; then
            echo -e "${GREEN}✅ $dep installed${NC}"
            PASSED=$((PASSED + 1))
        else
            echo -e "${RED}❌ $dep not installed${NC}"
            FAILED=$((FAILED + 1))
        fi
    done
fi

# Check iOS pods (macOS only)
if [[ "$OSTYPE" == "darwin"* ]] && [ -d "ios" ]; then
    echo ""
    echo -e "${BLUE}Checking iOS setup...${NC}"
    if [ -d "ios/Pods" ]; then
        echo -e "${GREEN}✅ iOS pods installed${NC}"
        PASSED=$((PASSED + 1))
    else
        echo -e "${YELLOW}⚠️  iOS pods not installed${NC}"
        echo "   Run: cd ios && pod install"
    fi
fi

# Summary
echo ""
echo "========================================"
echo "Verification Summary"
echo "========================================"
echo -e "${GREEN}Passed: $PASSED${NC}"
if [ $FAILED -gt 0 ]; then
    echo -e "${RED}Failed: $FAILED${NC}"
    echo ""
    echo "Some checks failed. Please review the errors above."
    exit 1
else
    echo -e "${GREEN}Failed: $FAILED${NC}"
    echo ""
    echo -e "${GREEN}✅ Setup verification passed!${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Start Metro: cd $PROJECT_DIR && npm start"
    echo "  2. Run Android: npm run android"
    echo "  3. Or run iOS: npm run ios"
fi

