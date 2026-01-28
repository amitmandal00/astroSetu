#!/bin/bash

# Cursor Checkpoint Script
# Runs: typecheck → build → critical tests
# Writes output + next steps into CURSOR_PROGRESS.md
# If failure: writes "what to do next" into CURSOR_ACTIONS_REQUIRED.md

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
PROGRESS_FILE="$PROJECT_ROOT/CURSOR_PROGRESS.md"
ACTIONS_FILE="$PROJECT_ROOT/CURSOR_ACTIONS_REQUIRED.md"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

cd "$PROJECT_ROOT/astrosetu" || exit 1

echo "🔍 Running Cursor checkpoint: typecheck → build → critical tests"
echo "Timestamp: $TIMESTAMP"
echo ""

# Track results
TYPE_CHECK_PASSED=false
BUILD_PASSED=false
TESTS_PASSED=false
ERRORS=""

# 1. Type check
echo "📝 Step 1/3: Type check..."
if npm run type-check > /tmp/cursor-checkpoint-typecheck.log 2>&1; then
  TYPE_CHECK_PASSED=true
  echo "✅ Type check: PASSED"
else
  ERRORS="${ERRORS}Type check: FAILED\n"
  echo "❌ Type check: FAILED"
  cat /tmp/cursor-checkpoint-typecheck.log | tail -20
fi
echo ""

# 2. Build
echo "🔨 Step 2/3: Build..."
if npm run build > /tmp/cursor-checkpoint-build.log 2>&1; then
  BUILD_PASSED=true
  echo "✅ Build: PASSED"
else
  ERRORS="${ERRORS}Build: FAILED\n"
  echo "❌ Build: FAILED"
  cat /tmp/cursor-checkpoint-build.log | tail -20
fi
echo ""

# 3. Critical tests
echo "🧪 Step 3/3: Critical tests..."
if npm run test:critical > /tmp/cursor-checkpoint-tests.log 2>&1; then
  TESTS_PASSED=true
  echo "✅ Critical tests: PASSED"
else
  ERRORS="${ERRORS}Critical tests: FAILED\n"
  echo "❌ Critical tests: FAILED"
  cat /tmp/cursor-checkpoint-tests.log | tail -30
fi
echo ""

# Determine overall status
if [ "$TYPE_CHECK_PASSED" = true ] && [ "$BUILD_PASSED" = true ] && [ "$TESTS_PASSED" = true ]; then
  STATUS="✅ ALL CHECKS PASSED"
  echo "$STATUS"
  echo ""
  
  # Update CURSOR_PROGRESS.md with success
  {
    echo ""
    echo "## Checkpoint: $TIMESTAMP"
    echo "- **Status**: ✅ ALL CHECKS PASSED"
    echo "- Type check: ✅ PASSED"
    echo "- Build: ✅ PASSED"
    echo "- Critical tests: ✅ PASSED"
    echo "- **Next steps**: Continue with next change set."
  } >> "$PROGRESS_FILE"
  
  exit 0
else
  STATUS="❌ CHECKPOINT FAILED"
  echo "$STATUS"
  echo ""
  echo "Errors:"
  echo -e "$ERRORS"
  
  # Write to CURSOR_ACTIONS_REQUIRED.md
  {
    echo ""
    echo "## Checkpoint Failed: $TIMESTAMP"
    echo ""
    echo "### Status"
    echo "- Type check: $([ "$TYPE_CHECK_PASSED" = true ] && echo '✅ PASSED' || echo '❌ FAILED')"
    echo "- Build: $([ "$BUILD_PASSED" = true ] && echo '✅ PASSED' || echo '❌ FAILED')"
    echo "- Critical tests: $([ "$TESTS_PASSED" = true ] && echo '✅ PASSED' || echo '❌ FAILED')"
    echo ""
    echo "### What to do next"
    if [ "$TYPE_CHECK_PASSED" = false ]; then
      echo "1. Fix TypeScript errors (see /tmp/cursor-checkpoint-typecheck.log)"
    fi
    if [ "$BUILD_PASSED" = false ]; then
      echo "2. Fix build errors (see /tmp/cursor-checkpoint-build.log)"
    fi
    if [ "$TESTS_PASSED" = false ]; then
      echo "3. Fix failing tests (see /tmp/cursor-checkpoint-tests.log)"
    fi
    echo ""
    echo "### Log files"
    echo "- Type check: \`/tmp/cursor-checkpoint-typecheck.log\`"
    echo "- Build: \`/tmp/cursor-checkpoint-build.log\`"
    echo "- Tests: \`/tmp/cursor-checkpoint-tests.log\`"
    echo ""
    echo "### After fixing"
    echo "1. Re-run: \`bash scripts/cursor-checkpoint.sh\`"
    echo "2. Once all checks pass, continue with next change set."
  } >> "$ACTIONS_FILE"
  
  # Update CURSOR_PROGRESS.md with failure
  {
    echo ""
    echo "## Checkpoint: $TIMESTAMP"
    echo "- **Status**: ❌ CHECKPOINT FAILED"
    echo "- Type check: $([ "$TYPE_CHECK_PASSED" = true ] && echo '✅ PASSED' || echo '❌ FAILED')"
    echo "- Build: $([ "$BUILD_PASSED" = true ] && echo '✅ PASSED' || echo '❌ FAILED')"
    echo "- Critical tests: $([ "$TESTS_PASSED" = true ] && echo '✅ PASSED' || echo '❌ FAILED')"
    echo "- **Actions required**: See \`CURSOR_ACTIONS_REQUIRED.md\`"
  } >> "$PROGRESS_FILE"
  
  exit 1
fi

