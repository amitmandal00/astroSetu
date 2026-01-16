#!/bin/bash

# Test Pyramid Runner
# Runs all test layers: Unit (70%), Integration (20%), E2E (10%)

set -e

echo "🧪 Running Complete Test Suite"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to run tests and capture results
run_test_suite() {
    local suite_name=$1
    local command=$2
    
    echo -e "${BLUE}📦 Running ${suite_name}...${NC}"
    echo ""
    
    if eval "$command"; then
        echo -e "${GREEN}✅ ${suite_name} passed${NC}"
        echo ""
        return 0
    else
        echo -e "${RED}❌ ${suite_name} failed${NC}"
        echo ""
        return 1
    fi
}

# Layer 1: Unit Tests (70% of pyramid)
echo -e "${YELLOW}═══════════════════════════════════════${NC}"
echo -e "${YELLOW}Layer 1: Unit Tests (70% of pyramid)${NC}"
echo -e "${YELLOW}═══════════════════════════════════════${NC}"
echo ""

if run_test_suite "Unit Tests" "npm run test:unit"; then
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# Layer 2: Integration Tests (20% of pyramid)
echo -e "${YELLOW}═══════════════════════════════════════${NC}"
echo -e "${YELLOW}Layer 2: Integration Tests (20% of pyramid)${NC}"
echo -e "${YELLOW}═══════════════════════════════════════${NC}"
echo ""

if run_test_suite "Integration Tests" "npm run test:integration"; then
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# Layer 3: E2E Tests (10% of pyramid)
echo -e "${YELLOW}═══════════════════════════════════════${NC}"
echo -e "${YELLOW}Layer 3: E2E Tests (10% of pyramid)${NC}"
echo -e "${YELLOW}═══════════════════════════════════════${NC}"
echo ""

if run_test_suite "E2E Tests" "npm run test:e2e"; then
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# Summary
echo ""
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}Test Suite Summary${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}✅ All test layers passed!${NC}"
    echo -e "${GREEN}   Unit Tests: ✅${NC}"
    echo -e "${GREEN}   Integration Tests: ✅${NC}"
    echo -e "${GREEN}   E2E Tests: ✅${NC}"
    echo ""
    exit 0
else
    echo -e "${RED}❌ Some test layers failed${NC}"
    echo -e "${RED}   Failed: ${FAILED_TESTS}/${TOTAL_TESTS}${NC}"
    echo ""
    exit 1
fi

