#!/bin/bash
# Create complete AI Astrology zip file for ChatGPT testing

set -e

ZIP_DIR="/tmp/ai-astrology-complete-$(date +%Y%m%d-%H%M%S)"
BASE_DIR="/Users/amitkumarmandal/Documents/astroCursor/astrosetu"

echo "Creating zip directory: $ZIP_DIR"
mkdir -p "$ZIP_DIR"

# Create directory structure
mkdir -p "$ZIP_DIR/src/app/ai-astrology"
mkdir -p "$ZIP_DIR/src/components/ai-astrology"
mkdir -p "$ZIP_DIR/src/lib/ai-astrology"
mkdir -p "$ZIP_DIR/src/app/api/ai-astrology"
mkdir -p "$ZIP_DIR/src/hooks"
mkdir -p "$ZIP_DIR/tests/unit"
mkdir -p "$ZIP_DIR/tests/integration"
mkdir -p "$ZIP_DIR/tests/e2e"
mkdir -p "$ZIP_DIR/tests/regression"
mkdir -p "$ZIP_DIR/tests/contracts"
mkdir -p "$ZIP_DIR/docs"

echo "Copying source files..."

# Copy AI Astrology source files
cp -r "$BASE_DIR/src/app/ai-astrology"/* "$ZIP_DIR/src/app/ai-astrology/" 2>/dev/null || true
cp -r "$BASE_DIR/src/components/ai-astrology"/* "$ZIP_DIR/src/components/ai-astrology/" 2>/dev/null || true
cp -r "$BASE_DIR/src/lib/ai-astrology"/* "$ZIP_DIR/src/lib/ai-astrology/" 2>/dev/null || true
cp -r "$BASE_DIR/src/app/api/ai-astrology"/* "$ZIP_DIR/src/app/api/ai-astrology/" 2>/dev/null || true

# Copy hooks
cp "$BASE_DIR/src/hooks/useReportGenerationController.ts" "$ZIP_DIR/src/hooks/" 2>/dev/null || true
cp "$BASE_DIR/src/hooks/useElapsedSeconds.ts" "$ZIP_DIR/src/hooks/" 2>/dev/null || true

# Copy all test files
echo "Copying test files..."
cp -r "$BASE_DIR/tests/unit"/* "$ZIP_DIR/tests/unit/" 2>/dev/null || true
cp -r "$BASE_DIR/tests/integration"/* "$ZIP_DIR/tests/integration/" 2>/dev/null || true
cp -r "$BASE_DIR/tests/e2e"/* "$ZIP_DIR/tests/e2e/" 2>/dev/null || true
cp -r "$BASE_DIR/tests/regression"/* "$ZIP_DIR/tests/regression/" 2>/dev/null || true
cp -r "$BASE_DIR/tests/contracts"/* "$ZIP_DIR/tests/contracts/" 2>/dev/null || true
cp "$BASE_DIR/tests/setup.ts" "$ZIP_DIR/tests/" 2>/dev/null || true
cp "$BASE_DIR/tests/run-all-tests.sh" "$ZIP_DIR/tests/" 2>/dev/null || true

# Copy defect registers
echo "Copying defect registers..."
cp "$BASE_DIR/DEFECT_REGISTER.md" "$ZIP_DIR/" 2>/dev/null || true
cp "$BASE_DIR/DEFECT_REGISTER_FOR_CHATGPT.md" "$ZIP_DIR/" 2>/dev/null || true
cp "$BASE_DIR/DEFECT_REGISTER_VERIFICATION.md" "$ZIP_DIR/" 2>/dev/null || true
cp "$BASE_DIR/DEFECT_REGISTER_INDEX.md" "$ZIP_DIR/" 2>/dev/null || true

# Copy SEO documentation
echo "Copying SEO documentation..."
cp "$BASE_DIR/SEO_CONTENT_CLUSTER_STRATEGY.md" "$ZIP_DIR/docs/" 2>/dev/null || true
cp "$BASE_DIR/SEO_IMPLEMENTATION_SUMMARY.md" "$ZIP_DIR/docs/" 2>/dev/null || true
cp "$BASE_DIR/SEO_AND_TRAFFIC_ANALYSIS.md" "$ZIP_DIR/docs/" 2>/dev/null || true

# Copy production readiness documentation
echo "Copying production readiness documentation..."
cp "$BASE_DIR/PRODUCTION_READINESS_SUMMARY.md" "$ZIP_DIR/docs/" 2>/dev/null || true
cp "$BASE_DIR/PRODUCTION_READINESS_IMPLEMENTATION.md" "$ZIP_DIR/docs/" 2>/dev/null || true
cp "$BASE_DIR/PRODUCTION_READINESS_PLAN.md" "$ZIP_DIR/docs/" 2>/dev/null || true

# Copy Cursor workflow documentation
echo "Copying Cursor workflow documentation..."
cp "$BASE_DIR/CURSOR_OPERATING_MANUAL.md" "$ZIP_DIR/docs/" 2>/dev/null || true
cp "$BASE_DIR/CURSOR_WORKFLOW_CONTROL.md" "$ZIP_DIR/docs/" 2>/dev/null || true
cp "$BASE_DIR/COMPLETE_IMPLEMENTATION_SUMMARY.md" "$ZIP_DIR/docs/" 2>/dev/null || true
cp "$BASE_DIR/COMPLETE_WORKFLOW_CONTROL_SUMMARY.md" "$ZIP_DIR/docs/" 2>/dev/null || true
cp "$BASE_DIR/CONTROLLER_MIGRATION_COMPLETE.md" "$ZIP_DIR/docs/" 2>/dev/null || true

# Create README
cat > "$ZIP_DIR/README.md" << 'EOF'
# AI Astrology Complete Package

**Date**: 2026-01-14  
**Purpose**: Complete package for holistic & comprehensive testing by ChatGPT

## 📁 Directory Structure

### Source Code
- `src/app/ai-astrology/` - All AI Astrology pages (input, preview, bundle, payment, etc.)
- `src/components/ai-astrology/` - Header, Footer, and other components
- `src/lib/ai-astrology/` - Core libraries (report generation, payments, prompts, etc.)
- `src/app/api/ai-astrology/` - API routes (generate-report, verify-payment, etc.)
- `src/hooks/` - Custom hooks (useReportGenerationController, useElapsedSeconds)

### Tests (Test Pyramid)
- `tests/unit/` - Unit tests (components, hooks, lib functions)
- `tests/integration/` - Integration tests (API routes, polling, timer behavior)
- `tests/e2e/` - End-to-end tests (Playwright - all user journeys)
- `tests/regression/` - Regression tests (critical flows, edge cases)
- `tests/contracts/` - Contract tests (state machine, invariants)

### Documentation
- `DEFECT_REGISTER*.md` - All defect registers
- `docs/SEO*.md` - SEO documentation
- `docs/PRODUCTION_READINESS*.md` - Production readiness documentation
- `docs/CURSOR*.md` - Cursor workflow and operating manual

## 🎯 Key Features

### Headers & Footers
- `src/components/ai-astrology/AIHeader.tsx` - Premium header with context-aware navigation
- `src/components/ai-astrology/AIFooter.tsx` - Three-column footer with legal links and disclaimers

### Report Types
- Free: Life Summary
- Paid: Year Analysis, Marriage Timing, Career & Money, Full Life, Major Life Phase, Decision Support
- Bundles: Any 2, Any 3, Any 4, Any 5, All 6

### Test Coverage
- **Unit Tests**: Components, hooks, lib functions
- **Integration Tests**: API routes, polling, timer behavior
- **E2E Tests**: All user journeys (free, paid, bundle, payment flows)
- **Regression Tests**: Critical flows, edge cases, timer stuck issues

## 🔍 Testing Focus Areas

1. **Timer Behavior**: Loader visible ⇒ timer must tick
2. **Report Generation**: Single-flight guarantee, proper cancellation
3. **Payment Flow**: Verification, capture, retry
4. **Bundle Generation**: Multiple reports, progress tracking
5. **Session Resume**: session_id handling, startTime initialization
6. **Retry Mechanism**: Full restart (abort + reset + start)

## 📋 Critical Tests

- `tests/e2e/critical-invariants.spec.ts` - 4 critical invariant tests
- `tests/e2e/loader-timer-never-stuck.spec.ts` - Timer behavior tests
- `tests/regression/timer-stuck-stress.test.ts` - Timer stress tests

## 🚀 Running Tests

```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Critical tests (must pass)
npm run test:critical

# All tests
npm run test
```

## 📚 Documentation

- See `docs/` directory for complete documentation
- See `DEFECT_REGISTER_FOR_CHATGPT.md` for all defects and fixes
- See `docs/CURSOR_OPERATING_MANUAL.md` for development guidelines

## ✅ Status

- ✅ All report types migrated to controller
- ✅ Timer initialization fixed
- ✅ Critical tests added
- ✅ Workflow control complete
- ✅ Production-ready

---

**Last Updated**: 2026-01-14
EOF

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
ZIP_FILE="/tmp/ai-astrology-complete-${TIMESTAMP}.zip"

echo "Creating zip file..."
cd /tmp
zip -r "$ZIP_FILE" "$(basename $ZIP_DIR)" -q

echo ""
echo "✅ Zip file created: $ZIP_FILE"
echo "📦 Size: $(du -h "$ZIP_FILE" | cut -f1)"
echo ""
echo "Files included:"
find "$ZIP_DIR" -type f | wc -l | xargs echo "  Total files:"
echo ""
echo "📍 Location: $ZIP_FILE"
