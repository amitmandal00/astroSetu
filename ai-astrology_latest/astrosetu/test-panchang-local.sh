#!/bin/bash

# Test script to verify panchang API locally
# This helps verify the fix before deploying

echo "🧪 Testing Panchang API Locally"
echo "================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: Must run from astrosetu directory"
  exit 1
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
  echo "⚠️  Warning: .env.local not found. Make sure PROKERALA_CLIENT_ID and PROKERALA_CLIENT_SECRET are set."
fi

echo "📋 Checking environment variables..."
if [ -z "$PROKERALA_CLIENT_ID" ] && [ -z "$(grep PROKERALA_CLIENT_ID .env.local 2>/dev/null)" ]; then
  echo "⚠️  Warning: PROKERALA_CLIENT_ID not found"
fi

if [ -z "$PROKERALA_CLIENT_SECRET" ] && [ -z "$(grep PROKERALA_CLIENT_SECRET .env.local 2>/dev/null)" ]; then
  echo "⚠️  Warning: PROKERALA_CLIENT_SECRET not found"
fi

echo ""
echo "🚀 Starting Next.js dev server..."
echo "   (This will start in the background)"
echo ""

# Start dev server in background
npm run dev > /tmp/nextjs-dev.log 2>&1 &
DEV_PID=$!

# Wait for server to start
echo "⏳ Waiting for server to start..."
sleep 10

# Check if server is running
if ! curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
  echo "❌ Error: Server didn't start. Check /tmp/nextjs-dev.log"
  kill $DEV_PID 2>/dev/null
  exit 1
fi

echo "✅ Server started"
echo ""
echo "🧪 Testing diagnostic endpoint..."
echo ""

# Test diagnostic endpoint
DIAGNOSTIC_RESPONSE=$(curl -s http://localhost:3000/api/astrology/diagnostic)
echo "$DIAGNOSTIC_RESPONSE" | jq '.' 2>/dev/null || echo "$DIAGNOSTIC_RESPONSE"

echo ""
echo "📊 Checking for debug info..."
DEBUG_INFO=$(echo "$DIAGNOSTIC_RESPONSE" | jq -r '.data.prokeralaTest.debug // "null"' 2>/dev/null)
if [ "$DEBUG_INFO" != "null" ] && [ -n "$DEBUG_INFO" ]; then
  echo "✅ Debug info found:"
  echo "$DEBUG_INFO" | jq '.' 2>/dev/null || echo "$DEBUG_INFO"
else
  echo "⚠️  No debug info found (this might be expected if test passed)"
fi

echo ""
echo "🧹 Cleaning up..."
kill $DEV_PID 2>/dev/null
echo "✅ Done"

