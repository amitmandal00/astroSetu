#!/bin/bash
echo "Checking dev server status..."
if lsof -ti:3001 > /dev/null 2>&1; then
  echo "✅ Server is running on port 3001"
else
  echo "❌ No server running on port 3001"
  echo "Starting server..."
  npm run dev &
  sleep 3
  echo "Server should be starting..."
fi
