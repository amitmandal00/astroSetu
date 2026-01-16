#!/bin/bash

# Cursor Stabilization Mode Script
# Runs all tests in order, identifies failures, and guides fix loop
# Follows PHASE 0 → PHASE 4 exactly

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
PROGRESS_FILE="$PROJECT_ROOT/CURSOR_PROGRESS.md"
ACTIONS_FILE="$PROJECT_ROOT/CURSOR_ACTIONS_REQUIRED.md"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

cd "$PROJECT_ROOT/astrosetu" || exit 1

echo "🔒 CURSOR STABILIZATION MODE — NON-NEGOTIABLE"
echo "Timestamp: $TIMESTAMP"
echo ""
echo "PHASE 0 — Freeze Scope: Only fix what is required to pass tests"
echo "PHASE 1 — Full Test Execution: Running all tests in order"
echo ""

# Track overall status
ALL_PASSED=false
FAILURES=()

# Phase 1: Full Test Execution (Mandatory)
echo "📋 PHASE 1 — Full Test Execution (Mandatory)"
echo "=========================================="
echo ""

# 1. Type check
echo "1/5: Type check..."
if npm run type-check > /tmp/stabilize-typecheck.log 2>&1; then
  echo "✅ Type check: PASSED"
else
  echo "❌ Type check: FAILED"
  FAILURES+=("type-check")
  cat /tmp/stabilize-typecheck.log | tail -30
fi
echo ""

# 2. Build
echo "2/5: Build..."
if npm run build > /tmp/stabilize-build.log 2>&1; then
  echo "✅ Build: PASSED"
else
  echo "❌ Build: FAILED"
  FAILURES+=("build")
  cat /tmp/stabilize-build.log | tail -30
fi
echo ""

# 3. All tests
echo "3/5: All tests (npm run test)..."
if npm run test > /tmp/stabilize-test.log 2>&1; then
  echo "✅ All tests: PASSED"
else
  echo "❌ All tests: FAILED"
  FAILURES+=("test")
  cat /tmp/stabilize-test.log | tail -40
fi
echo ""

# 4. Critical tests
echo "4/5: Critical tests (npm run test:critical)..."
if npm run test:critical > /tmp/stabilize-critical.log 2>&1; then
  echo "✅ Critical tests: PASSED"
else
  echo "❌ Critical tests: FAILED"
  FAILURES+=("test:critical")
  cat /tmp/stabilize-critical.log | tail -40
fi
echo ""

# 5. CI critical
echo "5/5: CI critical (npm run ci:critical)..."
if npm run ci:critical > /tmp/stabilize-ci.log 2>&1; then
  echo "✅ CI critical: PASSED"
else
  echo "❌ CI critical: FAILED"
  FAILURES+=("ci:critical")
  cat /tmp/stabilize-ci.log | tail -40
fi
echo ""

# Determine overall status
if [ ${#FAILURES[@]} -eq 0 ]; then
  ALL_PASSED=true
  echo "✅ ALL TESTS PASSED"
  echo ""
  echo "PHASE 3 — Runtime Stability Verification"
  echo "========================================="
  echo ""
  echo "📋 Manual verification checklist:"
  echo "- [ ] First-load report generation (no infinite loading)"
  echo "- [ ] Polling convergence (processing → complete/failed)"
  echo "- [ ] Subscription create → verify → cancel"
  echo "- [ ] No infinite loops"
  echo "- [ ] No timer resets"
  echo "- [ ] No silent exits"
  echo ""
  echo "PHASE 4 — Lock the Win"
  echo "======================"
  echo "✅ All tests passing"
  echo "✅ Ready to update CURSOR_PROGRESS.md"
  echo ""
  
  # Update CURSOR_PROGRESS.md
  {
    echo ""
    echo "## Stabilization Mode: $TIMESTAMP"
    echo "- **Status**: ✅ ALL TESTS PASSED"
    echo "- Type check: ✅ PASSED"
    echo "- Build: ✅ PASSED"
    echo "- All tests: ✅ PASSED"
    echo "- Critical tests: ✅ PASSED"
    echo "- CI critical: ✅ PASSED"
    echo "- **Success condition**: ✅ `npm run ci:critical` passes AND no infinite loading states possible"
    echo "- **Next steps**: Runtime stability verification (manual checklist in script output)"
  } >> "$PROGRESS_FILE"
  
  exit 0
else
  echo "❌ STABILIZATION FAILED"
  echo ""
  echo "PHASE 2 — Failure-Driven Fix Loop"
  echo "==================================="
  echo ""
  echo "Failures detected: ${FAILURES[*]}"
  echo ""
  echo "For each failure:"
  echo "1. Identify: Is the test wrong? Or is the code wrong?"
  echo "2. Apply minimal fix: Change ≤ 5 files, touch only files directly involved"
  echo "3. If test failed to catch real bug: Enhance test, never weaken assertions"
  echo "4. Re-run all tests from Phase 1"
  echo ""
  echo "Repeat until everything passes."
  echo ""
  
  # Write to CURSOR_ACTIONS_REQUIRED.md
  {
    echo ""
    echo "## Stabilization Mode Failed: $TIMESTAMP"
    echo ""
    echo "### Failures Detected"
    for failure in "${FAILURES[@]}"; do
      echo "- ❌ $failure"
    done
    echo ""
    echo "### What to do next"
    echo "1. For each failure, identify:"
    echo "   - ❓ Is the test wrong? (flaky, outdated, missing invariant)"
    echo "   - ❓ Or is the code wrong? (regression, race condition, broken contract)"
    echo ""
    echo "2. Apply minimal fix:"
    echo "   - Change ≤ 5 files"
    echo "   - Touch only files directly involved in the failure"
    echo ""
    echo "3. If test failed to catch real bug:"
    echo "   - Enhance test to cover real user-journey invariant"
    echo "   - Never weaken assertions"
    echo ""
    echo "4. Re-run stabilization: \`bash scripts/cursor-stabilize.sh\`"
    echo ""
    echo "### Log files"
    for failure in "${FAILURES[@]}"; do
      case "$failure" in
        "type-check")
          echo "- Type check: \`/tmp/stabilize-typecheck.log\`"
          ;;
        "build")
          echo "- Build: \`/tmp/stabilize-build.log\`"
          ;;
        "test")
          echo "- All tests: \`/tmp/stabilize-test.log\`"
          ;;
        "test:critical")
          echo "- Critical tests: \`/tmp/stabilize-critical.log\`"
          ;;
        "ci:critical")
          echo "- CI critical: \`/tmp/stabilize-ci.log\`"
          ;;
      esac
    done
    echo ""
    echo "### Absolute Non-Negotiable Rules"
    echo "- If any test fails → you are NOT done"
    echo "- If build fails → revert and fix"
    echo "- If a fix breaks another test → revert and re-iterate"
    echo "- Never silence errors"
    echo "- Never bypass CI gates"
    echo "- Never assume \"second load works\" is acceptable"
    echo ""
    echo "### Success Condition"
    echo "\`npm run ci:critical\` passes AND no infinite loading states are possible"
  } >> "$ACTIONS_FILE"
  
  # Update CURSOR_PROGRESS.md
  {
    echo ""
    echo "## Stabilization Mode: $TIMESTAMP"
    echo "- **Status**: ❌ FAILED"
    echo "- Failures: ${FAILURES[*]}"
    echo "- **Actions required**: See \`CURSOR_ACTIONS_REQUIRED.md\`"
    echo "- **Next steps**: Enter PHASE 2 — Failure-Driven Fix Loop"
  } >> "$PROGRESS_FILE"
  
  exit 1
fi

