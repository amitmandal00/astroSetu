#!/bin/bash
# Test Vercel Deployment Script
# Creates a test commit and triggers Vercel deployment

set -e

echo "🚀 Vercel Test Deployment"
echo "========================"
echo ""

# Get current directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR" && pwd)"
cd "$PROJECT_ROOT"

# Check if we're in a git repo
if ! git rev-parse --git-dir > /dev/null 2>&1; then
  echo "❌ Error: Not in a git repository"
  exit 1
fi

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Current branch: $CURRENT_BRANCH"

# Check if we're on main or a test branch
if [ "$CURRENT_BRANCH" = "main" ]; then
  echo "⚠️  Warning: You're on 'main' branch"
  echo "   This will trigger a production deployment if auto-deploy is enabled"
  read -p "   Continue? (y/N): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cancelled"
    exit 1
  fi
fi

# Create test deployment marker file
TEST_FILE="astrosetu/src/app/test-deploy.txt"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
COMMIT_HASH=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")

echo "📝 Creating test deployment marker..."
echo "Test deployment - $(date)" > "$TEST_FILE"
echo "Commit: $COMMIT_HASH" >> "$TEST_FILE"
echo "Timestamp: $TIMESTAMP" >> "$TEST_FILE"
echo "" >> "$TEST_FILE"

# Stage the file
git add "$TEST_FILE"

# Create commit
COMMIT_MSG="test: trigger Vercel deployment - $(date +%s)"
echo "📦 Committing test deployment marker..."
git commit -m "$COMMIT_MSG" || {
  echo "⚠️  No changes to commit (file might already exist)"
  git reset HEAD "$TEST_FILE" 2>/dev/null || true
  rm -f "$TEST_FILE"
  exit 0
}

# Push to remote
echo "🚀 Pushing to remote..."
git push origin "$CURRENT_BRANCH" || {
  echo "❌ Error: Failed to push to remote"
  echo "   Check your git remote and permissions"
  exit 1
}

# Get commit hash
NEW_COMMIT=$(git rev-parse --short HEAD)
echo ""
echo "✅ Test deployment triggered!"
echo ""
echo "📋 Details:"
echo "   Commit: $NEW_COMMIT"
echo "   Branch: $CURRENT_BRANCH"
echo "   Message: $COMMIT_MSG"
echo ""
echo "🔍 Next steps:"
echo "   1. Go to Vercel Dashboard: https://vercel.com/dashboard"
echo "   2. Open your project"
echo "   3. Check 'Deployments' tab"
echo "   4. Look for commit: $NEW_COMMIT"
echo ""
echo "⏱️  Deployment should start within 1-2 minutes"
echo ""

