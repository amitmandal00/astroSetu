#!/bin/bash

# AstroSetu Mobile App Setup Script

set -e

echo "🚀 Setting up AstroSetu Mobile App..."
echo ""

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo ""
echo "✅ Dependencies installed!"
echo ""

# Check if React Native CLI is installed
if ! command -v react-native &> /dev/null; then
    echo "📦 Installing React Native CLI globally..."
    npm install -g react-native-cli
fi

echo ""
echo "📋 Setup Instructions:"
echo ""
echo "For Android:"
echo "  1. Make sure Android Studio is installed"
echo "  2. Set up Android SDK and emulator"
echo "  3. Run: npm run android"
echo ""
echo "For iOS (macOS only):"
echo "  1. Install CocoaPods: sudo gem install cocoapods"
echo "  2. Install pods: cd ios && pod install && cd .."
echo "  3. Run: npm run ios"
echo ""
echo "Start Metro bundler:"
echo "  npm start"
echo ""
echo "✅ Setup complete!"
echo ""

