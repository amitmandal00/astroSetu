#!/bin/bash

echo "🔧 Fixing Next.js Server Issues..."
echo "=================================="
echo ""

# Kill any running Next.js processes
echo "1. Stopping any running Next.js servers..."
pkill -f "next dev" 2>/dev/null
sleep 2

# Clear all caches
echo "2. Clearing build cache..."
rm -rf .next
rm -rf node_modules/.cache 2>/dev/null
rm -rf .next/cache 2>/dev/null

echo "3. Cache cleared!"
echo ""
echo "✅ Ready to start server!"
echo ""
echo "Now run: npm run dev"
echo ""

