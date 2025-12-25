#!/bin/bash

echo "🔍 AstroSetu - Configuration Verification"
echo "=========================================="
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
  echo "❌ .env.local file not found!"
  echo "   Run: ./setup-apis.sh"
  exit 1
fi

echo "✅ .env.local file exists"
echo ""

# Load environment variables
source .env.local 2>/dev/null || true

# Check Supabase
echo "📊 Checking Supabase Configuration..."
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ "$NEXT_PUBLIC_SUPABASE_URL" = "https://your-project.supabase.co" ]; then
  echo "   ❌ NEXT_PUBLIC_SUPABASE_URL not configured"
else
  echo "   ✅ NEXT_PUBLIC_SUPABASE_URL: ${NEXT_PUBLIC_SUPABASE_URL:0:30}..."
fi

if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ] || [ "$NEXT_PUBLIC_SUPABASE_ANON_KEY" = "your-anon-key-here" ]; then
  echo "   ❌ NEXT_PUBLIC_SUPABASE_ANON_KEY not configured"
else
  echo "   ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: ${NEXT_PUBLIC_SUPABASE_ANON_KEY:0:30}..."
fi

echo ""

# Check Razorpay
echo "💳 Checking Razorpay Configuration..."
if [ -z "$NEXT_PUBLIC_RAZORPAY_KEY_ID" ] || [ "$NEXT_PUBLIC_RAZORPAY_KEY_ID" = "rzp_test_xxxxx" ]; then
  echo "   ⚠️  NEXT_PUBLIC_RAZORPAY_KEY_ID not configured (will use mock mode)"
else
  echo "   ✅ NEXT_PUBLIC_RAZORPAY_KEY_ID: ${NEXT_PUBLIC_RAZORPAY_KEY_ID:0:20}..."
fi

if [ -z "$RAZORPAY_KEY_SECRET" ] || [ "$RAZORPAY_KEY_SECRET" = "your-secret-key-here" ]; then
  echo "   ⚠️  RAZORPAY_KEY_SECRET not configured (will use mock mode)"
else
  echo "   ✅ RAZORPAY_KEY_SECRET: configured"
fi

echo ""

# Check Prokerala
echo "🔮 Checking Prokerala API Configuration..."
if [ -z "$PROKERALA_API_KEY" ] || [ "$PROKERALA_API_KEY" = "your-api-key-here" ]; then
  echo "   ⚠️  PROKERALA_API_KEY not configured (will use mock data)"
else
  echo "   ✅ PROKERALA_API_KEY: configured"
fi

echo ""

# Summary
echo "📋 Summary:"
echo "==========="
echo ""
echo "✅ Required for MVP:"
echo "   • Supabase (Database & Auth)"
echo ""
echo "⚠️  Optional but Recommended:"
echo "   • Razorpay (Payments)"
echo "   • Prokerala (Real Astrology Data)"
echo ""
echo "📖 Next Steps:"
echo "   1. Configure missing services (see QUICK_SETUP_GUIDE.md)"
echo "   2. Run: npm run dev"
echo "   3. Test all features"
echo ""

