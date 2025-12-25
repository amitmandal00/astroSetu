#!/bin/bash
echo "🔄 Restarting dev server..."
echo ""

# Kill existing processes
echo "Stopping existing servers..."
pkill -f "next dev" 2>/dev/null
sleep 2

# Clear cache
echo "Clearing caches..."
rm -rf .next
rm -rf node_modules/.cache
echo "✅ Caches cleared"
echo ""

# Start server
echo "Starting dev server..."
npm run dev
