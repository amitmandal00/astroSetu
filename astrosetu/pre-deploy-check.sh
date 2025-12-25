#!/bin/bash

# Pre-Deployment Verification Script
# Checks if everything is ready for production deployment

set -e

echo "🔍 AstroSetu Pre-Deployment Verification"
echo "========================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0
WARNINGS=0

# Function to check
check() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $1${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}❌ $1${NC}"
        ((FAILED++))
        return 1
    fi
}

warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    ((WARNINGS++))
}

info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if in correct directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Must run from astrosetu directory${NC}"
    exit 1
fi

echo "📦 Package & Dependencies"
echo "------------------------"
[ -f "package.json" ] && check "package.json exists" || warn "package.json missing"
[ -d "node_modules" ] && check "Dependencies installed" || warn "Run 'npm install' first"

echo ""
echo "🔧 Build Configuration"
echo "---------------------"
[ -f "next.config.mjs" ] && check "next.config.mjs exists" || [ -f "next.config.js" ] && check "next.config.js exists" || warn "Next.js config missing"
[ -f "tsconfig.json" ] && check "TypeScript config exists" || warn "TypeScript config missing"
[ -f "tailwind.config.js" ] && check "Tailwind config exists" || warn "Tailwind config missing"

echo ""
echo "📁 Key Files & Directories"
echo "-------------------------"
[ -d "src" ] && check "src/ directory exists" || warn "src/ directory missing"
[ -d "src/app" ] && check "src/app/ directory exists" || warn "src/app/ missing"
[ -d "src/components" ] && check "src/components/ exists" || warn "src/components/ missing"
[ -d "src/lib" ] && check "src/lib/ exists" || warn "src/lib/ missing"
[ -f "public/sw.js" ] && check "Service worker exists" || warn "Service worker missing (push notifications won't work)"

echo ""
echo "🔐 Environment Variables (Checklist)"
echo "------------------------------------"
info "Required for production (set in hosting platform):"
echo "  [ ] NODE_ENV=production"
echo "  [ ] NEXT_PUBLIC_APP_URL"
echo "  [ ] NEXT_PUBLIC_SUPABASE_URL"
echo "  [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "  [ ] SUPABASE_SERVICE_ROLE_KEY"
echo "  [ ] PROKERALA_CLIENT_ID"
echo "  [ ] PROKERALA_CLIENT_SECRET"
echo "  [ ] VAPID_PUBLIC_KEY"
echo "  [ ] VAPID_PRIVATE_KEY"
echo "  [ ] NEXT_PUBLIC_RAZORPAY_KEY_ID"
echo "  [ ] RAZORPAY_KEY_SECRET"
echo "  [ ] RAZORPAY_WEBHOOK_SECRET"

echo ""
echo "🏗️  Build Test"
echo "-------------"
if npm run build > /tmp/build.log 2>&1; then
    check "Production build succeeds"
    BUILD_SIZE=$(du -sh .next 2>/dev/null | cut -f1 || echo "unknown")
    info "Build size: $BUILD_SIZE"
else
    warn "Build failed - check /tmp/build.log for details"
    echo "Last 20 lines of build log:"
    tail -20 /tmp/build.log
fi

echo ""
echo "📋 Deployment Configuration"
echo "--------------------------"
[ -f "vercel.json" ] && check "Vercel config exists" || info "Vercel config optional"
[ -f "netlify.toml" ] && check "Netlify config exists" || info "Netlify config optional"

echo ""
echo "📚 Documentation"
echo "---------------"
[ -f "../DEPLOY_NOW.md" ] && check "DEPLOY_NOW.md exists" || [ -f "DEPLOY_NOW.md" ] && check "DEPLOY_NOW.md exists"
[ -f "../PRODUCTION_DEPLOYMENT_GUIDE.md" ] && check "Production guide exists" || [ -f "PRODUCTION_DEPLOYMENT_GUIDE.md" ] && check "Production guide exists"
[ -f "PRODUCTION_ENV_TEMPLATE.md" ] && check "Env template exists"

echo ""
echo "🔒 Security Checks"
echo "-----------------"
[ -f ".gitignore" ] && grep -q ".env.local" .gitignore && check ".env.local in .gitignore" || warn ".env.local should be in .gitignore"
[ ! -f ".env.local" ] || warn ".env.local exists (make sure it's not committed)"

echo ""
echo "📊 Summary"
echo "---------"
echo -e "${GREEN}✅ Passed: $PASSED${NC}"
echo -e "${YELLOW}⚠️  Warnings: $WARNINGS${NC}"
echo -e "${RED}❌ Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ Ready for deployment!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Set environment variables in hosting platform"
    echo "2. Run: ./deploy.sh (or follow DEPLOY_NOW.md)"
    echo "3. Verify deployment after going live"
    exit 0
else
    echo -e "${RED}❌ Please fix issues before deploying${NC}"
    exit 1
fi
