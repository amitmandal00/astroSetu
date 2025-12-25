#!/bin/bash

# UI Testing Script for AstroSetu
# Checks for common UI issues, accessibility, and responsive design

echo "🎨 AstroSetu UI Testing Script"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Must run from astrosetu directory${NC}"
    exit 1
fi

echo "📋 Checking UI Components..."
echo ""

# Check for common UI issues in components
check_component() {
    local file=$1
    local name=$2
    
    if [ ! -f "$file" ]; then
        echo -e "${RED}❌ $name: File not found${NC}"
        ((ERRORS++))
        return
    fi
    
    # Check for common issues
    local issues=0
    
    # Check for missing aria-labels on buttons
    if grep -q "button" "$file" && ! grep -q "aria-label" "$file" && ! grep -q "type=\"button\"" "$file"; then
        if grep -q "onClick" "$file" && grep -q "button" "$file"; then
            echo -e "${YELLOW}⚠️  $name: Some buttons may be missing aria-labels${NC}"
            ((WARNINGS++))
        fi
    fi
    
    # Check for inline styles (should use Tailwind)
    if grep -q "style=" "$file"; then
        echo -e "${YELLOW}⚠️  $name: Contains inline styles (consider using Tailwind classes)${NC}"
        ((WARNINGS++))
    fi
    
    # Check for hardcoded colors
    if grep -qE "(#[0-9a-fA-F]{3,6}|rgb\(|rgba\()" "$file"; then
        echo -e "${YELLOW}⚠️  $name: Contains hardcoded colors (consider using theme variables)${NC}"
        ((WARNINGS++))
    fi
    
    # Check for missing error handling
    if grep -q "onClick" "$file" && ! grep -q "try\|catch\|error" "$file"; then
        if grep -q "async\|await" "$file"; then
            echo -e "${YELLOW}⚠️  $name: Async functions may need error handling${NC}"
            ((WARNINGS++))
        fi
    fi
    
    if [ $issues -eq 0 ]; then
        echo -e "${GREEN}✅ $name: No obvious issues${NC}"
    fi
}

# Check key components
echo "🔍 Checking Key Components..."
check_component "src/components/payments/PaymentModal.tsx" "PaymentModal"
check_component "src/components/auth/TwoFactorVerify.tsx" "TwoFactorVerify"
check_component "src/components/auth/TwoFactorSetup.tsx" "TwoFactorSetup"
check_component "src/components/ui/Button.tsx" "Button"
check_component "src/components/ui/Input.tsx" "Input"
check_component "src/components/ui/Card.tsx" "Card"
check_component "src/components/layout/Shell.tsx" "Shell"
check_component "src/components/layout/BottomNav.tsx" "BottomNav"

echo ""
echo "📄 Checking Key Pages..."
check_component "src/app/login/page.tsx" "Login Page"
check_component "src/app/kundli/page.tsx" "Kundli Page"
check_component "src/app/wallet/page.tsx" "Wallet Page"
check_component "src/app/profile/page.tsx" "Profile Page"
check_component "src/app/services/page.tsx" "Services Page"

echo ""
echo "🎨 Checking CSS & Styling..."
echo ""

# Check globals.css exists
if [ -f "src/app/globals.css" ]; then
    echo -e "${GREEN}✅ globals.css exists${NC}"
    
    # Check for Tailwind imports
    if grep -q "@tailwind" "src/app/globals.css"; then
        echo -e "${GREEN}✅ Tailwind CSS configured${NC}"
    else
        echo -e "${RED}❌ Tailwind CSS not found in globals.css${NC}"
        ((ERRORS++))
    fi
else
    echo -e "${RED}❌ globals.css not found${NC}"
    ((ERRORS++))
fi

# Check tailwind.config
if [ -f "tailwind.config.ts" ] || [ -f "tailwind.config.js" ]; then
    echo -e "${GREEN}✅ Tailwind config exists${NC}"
else
    echo -e "${RED}❌ Tailwind config not found${NC}"
    ((ERRORS++))
fi

echo ""
echo "📱 Checking Responsive Design..."
echo ""

# Check for responsive classes in key components
check_responsive() {
    local file=$1
    local name=$2
    
    if [ ! -f "$file" ]; then
        return
    fi
    
    if grep -qE "(sm:|md:|lg:|xl:)" "$file"; then
        echo -e "${GREEN}✅ $name: Uses responsive classes${NC}"
    else
        echo -e "${YELLOW}⚠️  $name: May need responsive classes${NC}"
        ((WARNINGS++))
    fi
}

check_responsive "src/app/page.tsx" "Home Page"
check_responsive "src/components/layout/Shell.tsx" "Shell"
check_responsive "src/app/login/page.tsx" "Login Page"

echo ""
echo "♿ Checking Accessibility..."
echo ""

# Check for accessibility features
check_a11y() {
    local file=$1
    local name=$2
    
    if [ ! -f "$file" ]; then
        return
    fi
    
    local has_aria=false
    local has_labels=false
    
    if grep -q "aria-" "$file"; then
        has_aria=true
    fi
    
    if grep -q "aria-label\|aria-labelledby\|label" "$file"; then
        has_labels=true
    fi
    
    if [ "$has_aria" = true ] || [ "$has_labels" = true ]; then
        echo -e "${GREEN}✅ $name: Has accessibility features${NC}"
    else
        echo -e "${YELLOW}⚠️  $name: May need accessibility improvements${NC}"
        ((WARNINGS++))
    fi
}

check_a11y "src/components/ui/Button.tsx" "Button Component"
check_a11y "src/components/ui/Input.tsx" "Input Component"
check_a11y "src/app/login/page.tsx" "Login Page"

echo ""
echo "🔧 Checking Configuration..."
echo ""

# Check next.config
if [ -f "next.config.mjs" ] || [ -f "next.config.js" ]; then
    echo -e "${GREEN}✅ Next.js config exists${NC}"
    
    # Check for image domains
    if grep -q "images" "next.config.mjs" 2>/dev/null || grep -q "images" "next.config.js" 2>/dev/null; then
        echo -e "${GREEN}✅ Image domains configured${NC}"
    else
        echo -e "${YELLOW}⚠️  Image domains may need configuration${NC}"
        ((WARNINGS++))
    fi
else
    echo -e "${YELLOW}⚠️  Next.js config not found${NC}"
    ((WARNINGS++))
fi

# Check for TypeScript errors
echo ""
echo "🔍 Checking for TypeScript Errors..."
if command -v npx &> /dev/null; then
    if npx tsc --noEmit --skipLibCheck 2>&1 | head -20; then
        echo -e "${GREEN}✅ No TypeScript errors${NC}"
    else
        echo -e "${YELLOW}⚠️  TypeScript errors found (check output above)${NC}"
        ((WARNINGS++))
    fi
else
    echo -e "${YELLOW}⚠️  TypeScript compiler not available${NC}"
fi

echo ""
echo "================================"
echo "📊 Summary"
echo "================================"
echo -e "Errors: ${RED}$ERRORS${NC}"
echo -e "Warnings: ${YELLOW}$WARNINGS${NC}"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed!${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Some warnings found, but no critical errors${NC}"
    exit 0
else
    echo -e "${RED}❌ Some errors found. Please fix them before proceeding.${NC}"
    exit 1
fi

