#!/bin/bash

# AstroSetu Production Deployment Script
# This script helps you deploy to Vercel or Netlify

set -e

echo "🚀 AstroSetu Production Deployment"
echo "=================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found${NC}"
    echo "Please run this script from the astrosetu directory"
    exit 1
fi

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Pre-deployment checks
echo "📋 Pre-Deployment Checks"
echo "-----------------------"

# Check Node.js version
if command_exists node; then
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        echo -e "${YELLOW}⚠️  Warning: Node.js 18+ recommended (found v$NODE_VERSION)${NC}"
    else
        echo -e "${GREEN}✅ Node.js version: $(node -v)${NC}"
    fi
else
    echo -e "${RED}❌ Node.js not found. Please install Node.js 18+${NC}"
    exit 1
fi

# Check if .env.local exists (for reference)
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✅ .env.local found (for reference)${NC}"
else
    echo -e "${YELLOW}⚠️  .env.local not found (this is okay, use hosting platform env vars)${NC}"
fi

# Check if dependencies are installed
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅ Dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠️  Installing dependencies...${NC}"
    npm ci
fi

# Test build
echo ""
echo "🔨 Testing Production Build"
echo "---------------------------"
if npm run build; then
    echo -e "${GREEN}✅ Build successful!${NC}"
else
    echo -e "${RED}❌ Build failed. Please fix errors before deploying.${NC}"
    exit 1
fi

echo ""
echo "📦 Deployment Options"
echo "-------------------"
echo "1. Deploy to Vercel"
echo "2. Deploy to Netlify"
echo "3. Just verify build (no deployment)"
echo ""
read -p "Select option (1-3): " choice

case $choice in
    1)
        echo ""
        echo "🚀 Deploying to Vercel"
        echo "---------------------"
        
        if ! command_exists vercel; then
            echo -e "${YELLOW}⚠️  Vercel CLI not found. Installing...${NC}"
            npm install -g vercel
        fi
        
        echo ""
        echo "📝 Important: Make sure you've set environment variables in Vercel Dashboard"
        echo "   Go to: Project → Settings → Environment Variables"
        echo ""
        read -p "Press Enter to continue with deployment..."
        
        vercel --prod
        ;;
        
    2)
        echo ""
        echo "🚀 Deploying to Netlify"
        echo "----------------------"
        
        if ! command_exists netlify; then
            echo -e "${YELLOW}⚠️  Netlify CLI not found. Installing...${NC}"
            npm install -g netlify-cli
        fi
        
        echo ""
        echo "📝 Important: Make sure you've set environment variables in Netlify Dashboard"
        echo "   Go to: Site Settings → Environment Variables"
        echo ""
        read -p "Press Enter to continue with deployment..."
        
        netlify deploy --prod
        ;;
        
    3)
        echo ""
        echo -e "${GREEN}✅ Build verification complete!${NC}"
        echo ""
        echo "Next steps:"
        echo "1. Set environment variables in your hosting platform"
        echo "2. Deploy using: vercel --prod (Vercel) or netlify deploy --prod (Netlify)"
        echo "3. See DEPLOY_NOW.md for detailed instructions"
        ;;
        
    *)
        echo -e "${RED}❌ Invalid option${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}✅ Deployment process completed!${NC}"
echo ""
echo "📋 Post-Deployment Checklist:"
echo "  [ ] Verify production URL loads"
echo "  [ ] Test user registration"
echo "  [ ] Test user login"
echo "  [ ] Test Kundli generation"
echo "  [ ] Test payments (test mode)"
echo "  [ ] Check error logs"
echo "  [ ] Monitor performance"
echo ""
echo "📚 Documentation:"
echo "  - DEPLOY_NOW.md - Quick deployment guide"
echo "  - PRODUCTION_DEPLOYMENT_GUIDE.md - Detailed guide"
echo "  - GO_LIVE_CHECKLIST.md - Complete checklist"
echo ""
