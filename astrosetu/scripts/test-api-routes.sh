#!/bin/bash

# Quick API Route Test Script
# Tests all API routes to verify they return JSON (not HTML or 307 redirects)

BASE_URL="${1:-https://www.mindveda.net}"

echo "🔍 Testing API Routes on: $BASE_URL"
echo "=========================================="
echo ""

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

test_route() {
    local method=$1
    local path=$2
    local data=$3
    local description=$4
    
    echo -n "Testing $method $path ... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$BASE_URL$path" 2>&1)
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$BASE_URL$path" 2>&1)
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    # Check for 307 redirect
    if [ "$http_code" = "307" ] || [ "$http_code" = "308" ]; then
        echo -e "${RED}✗ FAILED${NC} - Status: $http_code (REDIRECT)"
        echo "  → This indicates a redirect, which means the route isn't being recognized correctly"
        return 1
    fi
    
    # Check if response is HTML (indicates error page)
    if echo "$body" | grep -q "<!DOCTYPE"; then
        echo -e "${RED}✗ FAILED${NC} - Status: $http_code (HTML Response)"
        echo "  → API returned HTML instead of JSON. Route may not be recognized as API route."
        return 1
    fi
    
    # Check if response is JSON (valid API response)
    if echo "$body" | grep -q "^{" || echo "$body" | grep -q "^\""; then
        echo -e "${GREEN}✓ OK${NC} - Status: $http_code (JSON Response)"
        return 0
    fi
    
    # Status 200/400/500 with non-JSON is suspicious but might be valid
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "${YELLOW}⚠ WARNING${NC} - Status: $http_code (Non-JSON Response)"
        echo "  → Response may be valid but isn't JSON format"
        return 0
    fi
    
    # Other status codes
    echo -e "${YELLOW}⚠ Status: $http_code${NC}"
    return 0
}

# Test billing routes
echo "📋 Billing API Routes"
echo "---------------------"
test_route "GET" "/api/billing/subscription" "" "Get subscription status"
test_route "POST" "/api/billing/subscription/verify-session" '{"session_id":"test"}' "Verify session"
echo ""

# Test notifications routes
echo "📬 Notifications API Routes"
echo "---------------------------"
test_route "GET" "/api/notifications/vapid-public-key" "" "Get VAPID public key"
echo ""

# Test other critical routes
echo "🔧 Other Critical Routes"
echo "------------------------"
test_route "GET" "/api/ai-astrology/input-session?token=test" "" "Get input session (with test token)"
test_route "GET" "/build.json" "" "Get build metadata"
test_route "GET" "/sw.js" "" "Get service worker"
test_route "GET" "/offline.html" "" "Get offline page"
echo ""

echo "=========================================="
echo "✅ Testing complete!"
echo ""
echo "Expected results:"
echo "  ✓ Green: Route working correctly (JSON response)"
echo "  ✗ Red: Route returning redirect or HTML (problem detected)"
echo "  ⚠ Yellow: Unexpected but potentially valid response"
echo ""
echo "If you see RED results, check:"
echo "  1. Vercel Functions tab - are routes listed?"
echo "  2. Deployment logs - were routes compiled?"
echo "  3. VERCEL_API_ROUTE_VERIFICATION_GUIDE.md - follow troubleshooting steps"

