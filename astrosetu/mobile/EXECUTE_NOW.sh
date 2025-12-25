#!/bin/bash

# Execute Now - One Command to Set Everything Up
# This is the main entry point for mobile app setup

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

clear
echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                                                          ║${NC}"
echo -e "${CYAN}║     🚀 AstroSetu Mobile App - Setup & Launch            ║${NC}"
echo -e "${CYAN}║                                                          ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PARENT_DIR="$(dirname "$SCRIPT_DIR")"
PROJECT_DIR="$PARENT_DIR/AstroSetuMobile"

# Check if project already exists
if [ -d "$PROJECT_DIR" ]; then
    echo -e "${YELLOW}⚠️  Project already exists at: $PROJECT_DIR${NC}"
    echo ""
    echo "Choose an option:"
    echo "  1) Verify existing setup"
    echo "  2) Remove and recreate"
    echo "  3) Just run the app (skip setup)"
    echo ""
    read -p "Enter choice (1/2/3): " choice
    
    case $choice in
        1)
            echo ""
            echo -e "${BLUE}Verifying existing setup...${NC}"
            "$SCRIPT_DIR/VERIFY_SETUP.sh"
            exit 0
            ;;
        2)
            echo ""
            echo -e "${YELLOW}Removing existing project...${NC}"
            rm -rf "$PROJECT_DIR"
            echo -e "${GREEN}✅ Removed${NC}"
            echo ""
            ;;
        3)
            echo ""
            echo -e "${BLUE}Starting development...${NC}"
            cd "$PROJECT_DIR"
            "$SCRIPT_DIR/start-dev.sh" "${1:-android}"
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid choice${NC}"
            exit 1
            ;;
    esac
fi

# Main setup
echo -e "${BLUE}Starting automated setup...${NC}"
echo ""
echo "This will:"
echo "  ✅ Clear caches"
echo "  ✅ Create React Native project"
echo "  ✅ Copy all our code"
echo "  ✅ Install dependencies"
echo "  ✅ Set up iOS (if macOS)"
echo ""
echo -e "${YELLOW}This may take 5-10 minutes...${NC}"
echo ""
read -p "Press Enter to continue or Ctrl+C to cancel..."

# Run the setup script
"$SCRIPT_DIR/setup-step-by-step.sh"

# Verify setup
echo ""
echo -e "${BLUE}Verifying setup...${NC}"
"$SCRIPT_DIR/VERIFY_SETUP.sh"

# Ask if user wants to run the app
echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
read -p "Do you want to start the app now? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${BLUE}Starting development environment...${NC}"
    cd "$PROJECT_DIR"
    "$SCRIPT_DIR/start-dev.sh" "${1:-android}"
else
    echo ""
    echo "To run the app later:"
    echo "  cd $PROJECT_DIR"
    echo "  npm start"
    echo "  npm run android  # or npm run ios"
    echo ""
    echo "Or use the helper script:"
    echo "  cd mobile"
    echo "  ./start-dev.sh android  # or ios"
fi

