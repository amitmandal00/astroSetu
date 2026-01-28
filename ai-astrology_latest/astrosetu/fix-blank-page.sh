#!/bin/bash

echo "🔧 Fixing Blank Page Issue"
echo "=========================="
echo ""

# Check if dev server is running
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "✅ Dev server is running on port 3001"
else
    echo "⚠️  Dev server is NOT running"
    echo "   Please run: npm run dev"
    echo ""
fi

# Clear Next.js cache
echo "🧹 Clearing Next.js cache..."
rm -rf .next
echo "✅ Cache cleared"
echo ""

# Clear node_modules/.cache if exists
if [ -d "node_modules/.cache" ]; then
    echo "🧹 Clearing node_modules cache..."
    rm -rf node_modules/.cache
    echo "✅ Node modules cache cleared"
    echo ""
fi

echo "📋 Next Steps:"
echo "1. Clear browser cache (Ctrl+Shift+Delete or Cmd+Shift+Delete)"
echo "2. Open browser DevTools (F12) and check Console for errors"
echo "3. Check Network tab for failed requests"
echo "4. Restart dev server: npm run dev"
echo "5. Open http://localhost:3001 in incognito mode"
echo ""
echo "✅ Fix script completed!"
