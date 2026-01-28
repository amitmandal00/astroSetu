#!/bin/bash

echo "🚀 AstroSetu - API Configuration Setup"
echo "========================================"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
  echo "📝 Creating .env.local file..."
  cat > .env.local << 'EOF'
# Supabase Configuration
# Get these from: https://supabase.com → Your Project → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Razorpay Configuration
# Get these from: https://razorpay.com → Settings → API Keys
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your-secret-key-here

# Prokerala API (Optional)
# Get from: https://www.prokerala.com/api/
PROKERALA_API_KEY=your-api-key-here

# App Configuration
NEXT_PUBLIC_APP_NAME=AstroSetu
NEXT_PUBLIC_APP_URL=http://localhost:3001
EOF
  echo "✅ Created .env.local file"
else
  echo "✅ .env.local already exists"
fi

echo ""
echo "📋 Next Steps:"
echo "=============="
echo ""
echo "1. SUPABASE SETUP:"
echo "   • Go to https://supabase.com"
echo "   • Create a new project"
echo "   • Get URL and keys from Settings → API"
echo "   • Run the SQL from SUPABASE_SETUP.md in SQL Editor"
echo "   • Update .env.local with your Supabase credentials"
echo ""
echo "2. RAZORPAY SETUP:"
echo "   • Go to https://razorpay.com"
echo "   • Sign up / Log in"
echo "   • Go to Settings → API Keys"
echo "   • Generate Test Key"
echo "   • Update .env.local with your Razorpay credentials"
echo ""
echo "3. PROKERALA API (Optional):"
echo "   • Go to https://www.prokerala.com/api/"
echo "   • Sign up for free account"
echo "   • Get API key from dashboard"
echo "   • Update .env.local (or leave blank to use mock data)"
echo ""
echo "4. RESTART SERVER:"
echo "   • Stop current server (Ctrl+C)"
echo "   • Run: npm run dev"
echo ""
echo "📖 For detailed instructions, see: QUICK_SETUP_GUIDE.md"
echo ""
