#!/bin/bash

echo "🧹 Clearing Next.js caches..."

# Stop any running dev servers
pkill -f "next dev" 2>/dev/null
sleep 1

# Remove build cache
rm -rf .next 2>/dev/null
echo "✅ Cleared .next cache"

# Remove node_modules cache
rm -rf node_modules/.cache 2>/dev/null
echo "✅ Cleared node_modules cache"

# Remove any webpack cache
find . -name ".webpack" -type d -exec rm -rf {} + 2>/dev/null
echo "✅ Cleared webpack cache"

echo ""
echo "✅ All caches cleared!"
echo ""
echo "🔄 Now restart the server:"
echo "   npm run dev"

