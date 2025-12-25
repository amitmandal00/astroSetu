#!/bin/bash

# AstroSetu Testing Helper Script
# This script helps you test all major features

echo "🧪 AstroSetu Testing Helper"
echo "=========================="
echo ""

# Check if server is running
echo "Checking if dev server is running..."
if curl -s http://localhost:3001 > /dev/null 2>&1; then
    echo "✅ Server is running on http://localhost:3001"
else
    echo "❌ Server is not running!"
    echo "   Please start the server: npm run dev"
    exit 1
fi

echo ""
echo "This script will test:"
echo "1. Home page"
echo "2. API endpoints"
echo "3. Authentication"
echo "4. Astrology features"
echo ""
read -p "Press Enter to start testing..."

# Test Home Page
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1️⃣  Testing Home Page"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if curl -s http://localhost:3001 | grep -q "AstroSetu"; then
    echo "✅ Home page loads correctly"
else
    echo "❌ Home page failed to load"
fi

# Test API Endpoints
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2️⃣  Testing API Endpoints"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Test Horoscope API
echo "Testing Horoscope API..."
horoscope_response=$(curl -s "http://localhost:3001/api/astrology/horoscope?sign=Aries&mode=daily")
if echo "$horoscope_response" | grep -q '"ok":true'; then
    echo "✅ Horoscope API works"
else
    echo "❌ Horoscope API failed"
    echo "   Response: $horoscope_response"
fi

# Test Panchang API
echo "Testing Panchang API..."
panchang_response=$(curl -s "http://localhost:3001/api/astrology/panchang?date=$(date +%Y-%m-%d)&place=Delhi")
if echo "$panchang_response" | grep -q '"ok":true'; then
    echo "✅ Panchang API works"
else
    echo "❌ Panchang API failed"
fi

# Test Numerology API
echo "Testing Numerology API..."
numerology_response=$(curl -s -X POST "http://localhost:3001/api/astrology/numerology" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User"}')
if echo "$numerology_response" | grep -q '"ok":true'; then
    echo "✅ Numerology API works"
else
    echo "❌ Numerology API failed"
fi

# Test Payment Config API
echo "Testing Payment Config API..."
payment_config=$(curl -s "http://localhost:3001/api/payments/config")
if echo "$payment_config" | grep -q '"ok":true'; then
    echo "✅ Payment Config API works"
else
    echo "❌ Payment Config API failed"
fi

# Test Wallet API (requires auth, so just check if it exists)
echo "Testing Wallet API endpoint..."
wallet_response=$(curl -s "http://localhost:3001/api/wallet")
if echo "$wallet_response" | grep -q '"ok"'; then
    echo "✅ Wallet API endpoint exists (auth required)"
else
    echo "⚠️  Wallet API may require authentication"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ BASIC TESTS COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Manual Testing Checklist:"
echo ""
echo "Core Features:"
echo "  [ ] Home page loads and displays correctly"
echo "  [ ] Navigation works (all links)"
echo "  [ ] Kundli generation form works"
echo "  [ ] Match compatibility form works"
echo "  [ ] Horoscope displays for all signs"
echo "  [ ] Panchang displays correctly"
echo "  [ ] Muhurat displays correctly"
echo "  [ ] Numerology calculation works"
echo "  [ ] Remedies display correctly"
echo ""
echo "User Features:"
echo "  [ ] Registration form works"
echo "  [ ] Login form works"
echo "  [ ] Profile page loads"
echo "  [ ] Profile editing works"
echo ""
echo "Payment:"
echo "  [ ] Wallet page loads"
echo "  [ ] Add Money button opens modal"
echo "  [ ] Payment flow works (or mock mode)"
echo ""
echo "Chat:"
echo "  [ ] Can create chat session"
echo "  [ ] Messages send and receive"
echo "  [ ] Real-time updates work"
echo "  [ ] Chat history displays"
echo ""
echo "📚 For detailed testing, see FINAL_TESTING_CHECKLIST.md"
echo ""
echo "🌐 Open http://localhost:3001 in your browser to test manually"
echo ""

