#!/bin/bash

# Quick Fix for iOS Simulator Issue
# Run this script to set up iOS Simulator for Expo

echo "🔧 Fixing iOS Simulator Setup..."
echo ""

# Check if Xcode is installed
if ! command -v xcodebuild &> /dev/null; then
    echo "❌ Xcode is not installed. Please install Xcode from App Store first."
    exit 1
fi

echo "✅ Xcode is installed"
echo ""

# Open Simulator app
echo "📱 Opening Simulator app..."
open -a Simulator

echo ""
echo "⏳ Waiting for Simulator to open..."
sleep 3

# List available devices
echo ""
echo "📋 Available iOS Simulators:"
xcrun simctl list devices available | grep -E "iPhone|iPad" | head -10

echo ""
echo "✅ Simulator should now be open!"
echo ""
echo "📝 Next steps:"
echo "   1. In Simulator: File → New Simulator (if needed)"
echo "   2. Choose: iPhone 15 or iPhone 14"
echo "   3. Choose: Latest iOS version"
echo "   4. Go back to Expo terminal and press 'i'"
echo ""
echo "💡 Alternative: Use physical device with Expo Go app"
echo "   - Install Expo Go from App Store"
echo "   - Scan QR code from Expo terminal"
echo ""

