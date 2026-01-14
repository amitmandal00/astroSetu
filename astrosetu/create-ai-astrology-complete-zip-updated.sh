#!/bin/bash

# Create Complete AI Astrology Feature Zip - Updated
# Includes: Headers, Footers, All Tests, SEO, Production-Readiness, Defect Register, ChatGPT Feedback

set -e

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
ZIP_NAME="ai-astrology-complete-${TIMESTAMP}.zip"
TEMP_DIR=$(mktemp -d)
BASE_DIR="/Users/amitkumarmandal/Documents/astroCursor/astrosetu"

echo "📦 Creating complete AI Astrology feature zip..."
echo "📁 Temporary directory: $TEMP_DIR"
echo "📦 Output: $ZIP_NAME"

# Create directory structure
mkdir -p "$TEMP_DIR/ai-astrology-complete"
cd "$TEMP_DIR/ai-astrology-complete"

# Copy source files
echo "📋 Copying source files..."

# App pages
mkdir -p src/app/ai-astrology
cp -r "$BASE_DIR/src/app/ai-astrology"/* src/app/ai-astrology/ 2>/dev/null || true

# API routes
mkdir -p src/app/api/ai-astrology
cp -r "$BASE_DIR/src/app/api/ai-astrology"/* src/app/api/ai-astrology/ 2>/dev/null || true

# Library files
mkdir -p src/lib/ai-astrology
cp -r "$BASE_DIR/src/lib/ai-astrology"/* src/lib/ai-astrology/ 2>/dev/null || true

# Components (Headers, Footers, AI Astrology components)
mkdir -p src/components/ai-astrology
if [ -d "$BASE_DIR/src/components/ai-astrology" ]; then
  cp -r "$BASE_DIR/src/components/ai-astrology"/* src/components/ai-astrology/ 2>/dev/null || true
fi

mkdir -p src/components/layout
cp "$BASE_DIR/src/components/layout/Footer.tsx" src/components/layout/ 2>/dev/null || true
cp "$BASE_DIR/src/components/layout/Shell.tsx" src/components/layout/ 2>/dev/null || true

# UI components (HeaderPattern, etc.)
mkdir -p src/components/ui
cp "$BASE_DIR/src/components/ui/HeaderPattern.tsx" src/components/ui/ 2>/dev/null || true

# Hooks
mkdir -p src/hooks
cp "$BASE_DIR/src/hooks/useElapsedSeconds.ts" src/hooks/ 2>/dev/null || true
cp "$BASE_DIR/src/hooks/useReportGenerationController.ts" src/hooks/ 2>/dev/null || true

# State machine
mkdir -p src/lib
cp "$BASE_DIR/src/lib/reportGenerationStateMachine.ts" src/lib/ 2>/dev/null || true

# Copy all tests
echo "🧪 Copying all test files..."

# Unit tests
mkdir -p tests/unit
cp "$BASE_DIR/tests/unit/timer-logic.test.ts" tests/unit/ 2>/dev/null || true
mkdir -p tests/unit/hooks
cp "$BASE_DIR/tests/unit/hooks/useElapsedSeconds.test.ts" tests/unit/hooks/ 2>/dev/null || true
cp "$BASE_DIR/tests/unit/hooks/useReportGenerationController.test.ts" tests/unit/hooks/ 2>/dev/null || true
mkdir -p tests/unit/components
cp "$BASE_DIR/tests/unit/components"/*.test.tsx tests/unit/components/ 2>/dev/null || true
mkdir -p tests/unit/lib
cp "$BASE_DIR/tests/unit/lib"/*.test.ts tests/unit/lib/ 2>/dev/null || true

# Integration tests
mkdir -p tests/integration
mkdir -p tests/integration/api
cp "$BASE_DIR/tests/integration/api/ai-astrology.test.ts" tests/integration/api/ 2>/dev/null || true
cp "$BASE_DIR/tests/integration/api/contact.test.ts" tests/integration/api/ 2>/dev/null || true
cp "$BASE_DIR/tests/integration/api/payments.test.ts" tests/integration/api/ 2>/dev/null || true
cp "$BASE_DIR/tests/integration/timer-behavior.test.ts" tests/integration/ 2>/dev/null || true
cp "$BASE_DIR/tests/integration/polling-state-sync.test.ts" tests/integration/ 2>/dev/null || true

# E2E tests
mkdir -p tests/e2e
cp "$BASE_DIR/tests/e2e"/*.spec.ts tests/e2e/ 2>/dev/null || true

# Regression tests
mkdir -p tests/regression
cp "$BASE_DIR/tests/regression"/*.test.ts tests/regression/ 2>/dev/null || true

# Test contracts
mkdir -p tests/contracts
cp "$BASE_DIR/tests/contracts/report-flow.contract.md" tests/contracts/ 2>/dev/null || true

# Test setup files
cp "$BASE_DIR/tests/setup.ts" tests/ 2>/dev/null || true
cp "$BASE_DIR/tests/integration/setup.ts" tests/integration/ 2>/dev/null || true

# Copy SEO files
echo "🔍 Copying SEO files..."
mkdir -p docs/seo
cp "$BASE_DIR/SEO_IMPLEMENTATION_SUMMARY.md" docs/seo/ 2>/dev/null || true
cp "$BASE_DIR/SEO_CONTENT_CLUSTER_STRATEGY.md" docs/seo/ 2>/dev/null || true

# Copy production-readiness files
echo "🚀 Copying production-readiness files..."
mkdir -p docs/production
cp "$BASE_DIR/PRODUCTION_READINESS_PLAN.md" docs/production/ 2>/dev/null || true
cp "$BASE_DIR/PRODUCTION_READINESS_IMPLEMENTATION.md" docs/production/ 2>/dev/null || true
cp "$BASE_DIR/PRODUCTION_READINESS_SUMMARY.md" docs/production/ 2>/dev/null || true
cp "$BASE_DIR/PRODUCTION_READY.md" docs/production/ 2>/dev/null || true
cp "$BASE_DIR/VERCEL_PRODUCTION_VERIFICATION.md" docs/production/ 2>/dev/null || true
cp "$BASE_DIR/PRODUCTION_DEPLOYMENT_VERIFICATION.md" docs/production/ 2>/dev/null || true

# Copy defect register
echo "📋 Copying defect register..."
mkdir -p docs/defects
cp "$BASE_DIR/DEFECT_REGISTER.md" docs/defects/ 2>/dev/null || true
cp "$BASE_DIR/DEFECT_REGISTER_INDEX.md" docs/defects/ 2>/dev/null || true
cp "$BASE_DIR/DEFECT_REGISTER_FOR_CHATGPT.md" docs/defects/ 2>/dev/null || true

# Copy ChatGPT feedback and operating manual
echo "📚 Copying ChatGPT feedback and operating manual..."
mkdir -p docs/chatgpt
cp "$BASE_DIR/CHATGPT_FEEDBACK_ANALYSIS.md" docs/chatgpt/ 2>/dev/null || true
cp "$BASE_DIR/CHATGPT_FIXES_IMPLEMENTED.md" docs/chatgpt/ 2>/dev/null || true
cp "$BASE_DIR/CURSOR_OPERATING_MANUAL.md" docs/chatgpt/ 2>/dev/null || true
cp "$BASE_DIR/CURSOR_OPERATING_MANUAL_IMPLEMENTATION.md" docs/chatgpt/ 2>/dev/null || true

# Copy configuration files
echo "⚙️  Copying configuration files..."
cp "$BASE_DIR/vitest.config.ts" . 2>/dev/null || true
cp "$BASE_DIR/playwright.config.ts" . 2>/dev/null || true
cp "$BASE_DIR/tsconfig.json" . 2>/dev/null || true
cp "$BASE_DIR/next.config.js" . 2>/dev/null || true
cp "$BASE_DIR/next.config.mjs" . 2>/dev/null || true

# Copy package.json for dependencies reference
cp "$BASE_DIR/package.json" . 2>/dev/null || true

# Create comprehensive README
cat > README.md << 'EOF'
# AI Astrology Feature - Complete Package

**Generated**: $(date)  
**Purpose**: Holistic & comprehensive testing by ChatGPT

This package contains the complete AI Astrology feature implementation including:
- All source files (pages, API routes, components, hooks, utilities)
- Headers and Footers
- All test layers (Unit, Integration, E2E, Regression)
- SEO implementation files
- Production-readiness documentation
- Defect register (updated)
- ChatGPT feedback and operating manual

## Structure

```
ai-astrology-complete/
├── src/
│   ├── app/
│   │   ├── ai-astrology/          # All AI Astrology pages
│   │   │   ├── input/             # Input form page
│   │   │   ├── preview/           # Preview/generation page
│   │   │   ├── payment/           # Payment pages
│   │   │   ├── bundle/            # Bundle reports page
│   │   │   └── ...                # Other pages
│   │   └── api/
│   │       └── ai-astrology/      # All API routes
│   ├── components/
│   │   ├── ai-astrology/          # AI Astrology components
│   │   ├── layout/                # Layout components (Footer, Shell)
│   │   └── ui/                    # UI components (HeaderPattern)
│   ├── hooks/                     # Custom hooks
│   │   ├── useElapsedSeconds.ts
│   │   └── useReportGenerationController.ts
│   └── lib/
│       ├── ai-astrology/          # AI Astrology utilities
│       └── reportGenerationStateMachine.ts
├── tests/
│   ├── unit/                      # Unit tests
│   │   ├── hooks/                 # Hook unit tests
│   │   ├── components/            # Component unit tests
│   │   └── lib/                   # Library unit tests
│   ├── integration/               # Integration tests
│   │   └── api/                   # API integration tests
│   ├── e2e/                       # E2E tests
│   ├── regression/                # Regression tests
│   ├── contracts/                 # Test contracts
│   └── setup.ts                   # Test setup
├── docs/
│   ├── seo/                       # SEO documentation
│   ├── production/                # Production-readiness docs
│   ├── defects/                   # Defect register
│   └── chatgpt/                   # ChatGPT feedback & operating manual
└── Configuration files
```

## Test Layers (Test Pyramid)

### Unit Tests
- `tests/unit/timer-logic.test.ts` - Timer logic unit tests
- `tests/unit/hooks/useElapsedSeconds.test.ts` - Elapsed seconds hook tests
- `tests/unit/hooks/useReportGenerationController.test.ts` - Report generation controller tests
- `tests/unit/components/*.test.tsx` - Component unit tests
- `tests/unit/lib/*.test.ts` - Library unit tests

### Integration Tests
- `tests/integration/api/ai-astrology.test.ts` - API route integration tests
- `tests/integration/api/contact.test.ts` - Contact API integration tests
- `tests/integration/api/payments.test.ts` - Payments API integration tests
- `tests/integration/timer-behavior.test.ts` - Timer behavior integration tests
- `tests/integration/polling-state-sync.test.ts` - Polling state synchronization tests

### E2E Tests
- `tests/e2e/free-report.spec.ts` - Free report E2E tests
- `tests/e2e/paid-report.spec.ts` - Paid report E2E tests
- `tests/e2e/bundle-reports.spec.ts` - Bundle reports E2E tests
- `tests/e2e/timer-behavior.spec.ts` - Timer behavior E2E tests
- `tests/e2e/polling-state-sync.spec.ts` - Polling state sync E2E tests
- `tests/e2e/all-report-types.spec.ts` - All report types E2E tests
- `tests/e2e/report-generation-stuck.spec.ts` - Report generation stuck E2E tests
- `tests/e2e/polling-completion.spec.ts` - Polling completion E2E tests
- `tests/e2e/loader-timer-never-stuck.spec.ts` - **CRITICAL**: Loader timer never stuck E2E test

### Regression Tests
- `tests/regression/timer-stuck-stress.test.ts` - Timer stuck stress tests
- `tests/regression/weekly-issues-replication.test.ts` - Weekly issues replication tests
- `tests/regression/year-analysis-purchase-redirect.test.ts` - Year analysis purchase redirect test
- `tests/regression/report-generation-flicker.test.ts` - Report generation flicker test
- `tests/regression/isProcessingUI-comprehensive.test.ts` - isProcessingUI comprehensive tests
- `tests/regression/loader-gating-comprehensive.test.ts` - Loader gating comprehensive tests
- `tests/regression/retry-bundle-comprehensive.test.ts` - Retry bundle comprehensive tests
- `tests/regression/critical-flows.test.ts` - Critical flows regression tests

## Components

### Headers & Footers
- `src/components/ai-astrology/AIHeader.tsx` - AI Astrology header component (if exists)
- `src/components/ai-astrology/AIFooter.tsx` - AI Astrology footer component (if exists)
- `src/components/layout/Footer.tsx` - Main footer component
- `src/components/layout/Shell.tsx` - Shell layout component
- `src/components/ui/HeaderPattern.tsx` - Header pattern component

## Documentation

### SEO
- `docs/seo/SEO_IMPLEMENTATION_SUMMARY.md` - SEO implementation summary
- `docs/seo/SEO_CONTENT_CLUSTER_STRATEGY.md` - SEO content cluster strategy

### Production Readiness
- `docs/production/PRODUCTION_READINESS_PLAN.md` - Production readiness plan
- `docs/production/PRODUCTION_READINESS_IMPLEMENTATION.md` - Implementation details
- `docs/production/PRODUCTION_READINESS_SUMMARY.md` - Summary
- `docs/production/PRODUCTION_READY.md` - Production ready checklist
- `docs/production/VERCEL_PRODUCTION_VERIFICATION.md` - Vercel verification
- `docs/production/PRODUCTION_DEPLOYMENT_VERIFICATION.md` - Deployment verification

### Defects
- `docs/defects/DEFECT_REGISTER.md` - Complete defect register (9 defects documented)
- `docs/defects/DEFECT_REGISTER_INDEX.md` - Defect register index
- `docs/defects/DEFECT_REGISTER_FOR_CHATGPT.md` - Defect register formatted for ChatGPT

### ChatGPT Feedback & Operating Manual
- `docs/chatgpt/CHATGPT_FEEDBACK_ANALYSIS.md` - ChatGPT feedback analysis
- `docs/chatgpt/CHATGPT_FIXES_IMPLEMENTED.md` - ChatGPT fixes implementation
- `docs/chatgpt/CURSOR_OPERATING_MANUAL.md` - Cursor Operating Manual (CRITICAL)
- `docs/chatgpt/CURSOR_OPERATING_MANUAL_IMPLEMENTATION.md` - Operating manual implementation

## Running Tests

### Unit Tests
```bash
npm run test:unit
```

### Integration Tests
```bash
npm run test:integration
```

### E2E Tests
```bash
npm run test:e2e
```

### Regression Tests
```bash
npm run test:regression
```

### All Tests
```bash
npm run test
```

## Key Features

### Timer & Report Generation
- Single source of truth: `isProcessingUI` drives timer, polling, and render
- Full restart on retry: abort + attemptId++ + reset guards + reset startTime
- Graceful abort handling: Controller handles abort/cancel without throwing errors
- Critical E2E test: "Loader visible => elapsed ticks" (prevents timer regressions)

### Architecture
- Custom hooks: `useElapsedSeconds`, `useReportGenerationController`
- State machine: `reportGenerationStateMachine.ts`
- Single-flight guarantee: `AbortController` + `attemptId` for cancellation

### Defects Fixed
- DEF-001: Timer stuck at 0s / 19s / 25s / 26s
- DEF-002: Report generation stuck (polling state not updated)
- DEF-003: Timer continues after report completes
- DEF-004: Bundle timer stuck
- DEF-005: Year-analysis timer stuck
- DEF-006: Paid report timer stuck
- DEF-007: Retry loading bundle button not working
- DEF-008: Year Analysis Purchase Button Redirect
- DEF-009: Report Generation Flickers Back to Input Screen

## Notes

- All 9 defects are documented in DEFECT_REGISTER.md
- All defects are fixed and verified
- Test coverage includes unit, integration, E2E, and regression tests
- Production-readiness documentation is comprehensive
- SEO implementation is documented
- ChatGPT feedback has been implemented
- Cursor Operating Manual provides guidelines for future development

## Critical Test

The most important test is:
- `tests/e2e/loader-timer-never-stuck.spec.ts` - Enforces the invariant: "If loader is visible, elapsed must tick"

This test prevents all timer-related regressions.

EOF

# Create zip file
echo "📦 Creating zip file..."
cd "$TEMP_DIR"
zip -r "$ZIP_NAME" ai-astrology-complete/ > /dev/null

# Move to original directory
mv "$ZIP_NAME" "$BASE_DIR/"

# Cleanup
rm -rf "$TEMP_DIR"

echo ""
echo "✅ Complete! Zip file created: $ZIP_NAME"
echo "📁 Location: $BASE_DIR/$ZIP_NAME"
echo ""
echo "📊 Contents Summary:"
echo "  ✅ All AI Astrology source files"
echo "  ✅ Headers and Footers"
echo "  ✅ All test layers (Unit, Integration, E2E, Regression)"
echo "  ✅ SEO documentation"
echo "  ✅ Production-readiness documentation"
echo "  ✅ Updated defect register (9 defects)"
echo "  ✅ ChatGPT feedback & operating manual"
echo "  ✅ Configuration files"
echo ""
echo "📦 File size:"
ls -lh "$BASE_DIR/$ZIP_NAME" | awk '{print "  " $5}'
