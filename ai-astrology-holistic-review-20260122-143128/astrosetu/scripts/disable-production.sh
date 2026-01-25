#!/bin/bash

# Script to disable Vercel production deployments
# This script helps configure Vercel for preview-only deployments

set -e

echo "🔒 Vercel Production Deployment Disabler"
echo "========================================"
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "⚠️  Vercel CLI not found. Installing..."
    npm install -g vercel
fi

echo "✅ Vercel CLI found"
echo ""

# Check if logged in
if ! vercel whoami &> /dev/null; then
    echo "⚠️  Not logged in to Vercel. Please login:"
    vercel login
fi

echo "✅ Logged in to Vercel"
echo ""

echo "📋 Current Configuration:"
echo "   - Production deployments: DISABLED (via vercel.json)"
echo "   - Preview deployments: ENABLED"
echo ""

echo "🔍 To complete the setup, please:"
echo "   1. Go to https://vercel.com/dashboard"
echo "   2. Select your project"
echo "   3. Go to Settings → Git"
echo "   4. Disable automatic deployments for 'main' branch"
echo "   5. (Optional) Remove production domain from Settings → Domains"
echo ""

echo "📝 Preview Deployment Commands:"
echo "   # Deploy as preview (not production)"
echo "   vercel --preview"
echo ""
echo "   # List preview deployments"
echo "   vercel ls --preview"
echo ""

echo "✅ Configuration script complete!"
echo "   See VERCEL_PREVIEW_CONFIG.md for detailed instructions."

