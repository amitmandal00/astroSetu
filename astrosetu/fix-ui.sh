#!/bin/bash
echo "🔧 Fixing UI compilation issues..."
echo ""

# Kill any running Next.js processes
pkill -f "next dev" 2>/dev/null
sleep 2

# Clear all caches
echo "Clearing caches..."
rm -rf .next
rm -rf node_modules/.cache
echo "✅ Caches cleared"
echo ""

# Check for syntax errors
echo "Checking for syntax errors..."
npx next lint --dir src/app --file src/app/layout.tsx 2>&1 | head -20 || echo "Lint check complete"
echo ""

echo "✅ Ready to restart server"
echo "Run: npm run dev"
