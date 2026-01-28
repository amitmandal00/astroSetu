#!/bin/bash

# Create Complete AI Astrology Feature Zip
# Includes: Headers, Footers, All Tests, SEO, Production-Readiness

set -e

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
ZIP_NAME="ai-astrology-complete-${TIMESTAMP}.zip"
TEMP_DIR=$(mktemp -d)

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
cp -r /Users/amitkumarmandal/Documents/astroCursor/astrosetu/src/app/ai-astrology/* src/app/ai-astrology/ 2>/dev/null || true

# API routes
mkdir -p src/app/api/ai-astrology
cp -r /Users/amitkumarmandal/Documents/astroCursor/astrosetu/src/app/api/ai-astrology/* src/app/api/ai-astrology/ 2>/dev/null || true

# Library files
mkdir -p src/lib/ai-astrology
cp -r /Users/amitkumarmandal/Documents/astroCursor/astrosetu/src/lib/ai-astrology/* src/lib/ai-astrology/ 2>/dev/null || true

# Components (Headers, Footers, AI Astrology components)
mkdir -p src/components/ai-astrology
cp -r /Users/amitkumarmandal/Documents/astroCursor/astrosetu/src/components/ai-astrology/* src/components/ai-astrology/ 2>/dev/null || true

mkdir -p src/components/layout
cp /Users/amitkumarmandal/Documents/astroCursor/astrosetu/src/components/layout/Footer.tsx src/components/layout/ 2>/dev/null || true
cp /Users/amitkumarmandal/Documents/astroCursor/astrosetu/src/components/layout/Shell.tsx src/components/layout/ 2>/dev/null || true

# Hooks
mkdir -p src/hooks
cp /Users/amitkumarmandal/Documents/astroCursor/astrosetu/src/hooks/useElapsedSeconds.ts src/hooks/ 2>/dev/null || true
cp /Users/amitkumarmandal/Documents/astroCursor/astrosetu/src/hooks/useReportGenerationController.ts src/hooks/ 2>/dev/null || true

# State machine
mkdir -p src/lib
cp /Users/amitkumarmandal/Documents/astroCursor/astrosetu/src/lib/reportGenerationStateMachine.ts src/lib/ 2>/dev/null || true

# Copy all tests
echo "🧪 Copying all test files..."

# Unit tests
mkdir -p tests/unit
cp /Users/amitkumarmandal/Documents/astroCursor/astrosetu/tests/unit/timer-logic.test.ts tests/unit/ 2>/dev/null || true
cp /Users/amitkumarmandal/Documents/astroCursor/astrosetu/tests/unit/hooks/useElapsedSeconds.test.ts tests/unit/ 2>/dev/null || true
cp /Users/amitkumarmandal/Documents/astroCursor/astrosetu/tests/unit/hooks/useReportGenerationController.test.ts tests/unit/ 2>/dev/null || true

# Integration tests
mkdir -p tests/integration
cp /Users/amitkumarmandal/Documents/astroCursor/astrosetu/tests/integration/api/ai-astrology.test.ts tests/integration/ 2>/dev/null || true
cp /Users/amitkumarmandal/Documents/astroCursor/astrosetu/tests/integration/timer-behavior.test.ts tests/integration/ 2>/dev/null || true
cp /Users/amitkumarmandal/Documents/astroCursor/astrosetu/tests/integration/polling-state-sync.test.ts tests/integration/ 2>/dev/null || true

# E2E tests
mkdir -p tests/e2e
cp /Users/amitkumarmandal/Documents/astroCursor/astrosetu/tests/e2e/*.spec.ts tests/e2e/ 2>/dev/null || true

# Regression tests
mkdir -p tests/regression
cp /Users/amitkumarmandal/Documents/astroCursor/astrosetu/tests/regression/timer-stuck-stress.test.ts tests/regression/ 2>/dev/null || true
cp /Users/amitkumarmandal/Documents/astroCursor/astrosetu/tests/regression/weekly-issues-replication.test.ts tests/regression/ 2>/dev/null || true

# Test contracts
mkdir -p tests/contracts
cp /Users/amitkumarmandal/Documents/astroCursor/astrosetu/tests/contracts/report-flow.contract.md tests/contracts/ 2>/dev/null || true

# Test setup files
cp /Users/amitkumarmandal/Documents/astroCursor/astrosetu/tests/setup.ts tests/ 2>/dev/null || true
cp /Users/amitkumarmandal/Documents/astroCursor/astrosetu/tests/integration/setup.ts tests/integration/ 2>/dev/null || true

# Copy SEO files
echo "🔍 Copying SEO files..."
mkdir -p docs/seo
cp /Users/amitkumarmandal/Documents/astroCursor/astrosetu/SEO_IMPLEMENTATION_SUMMARY.md docs/seo/ 2>/dev/null || true
cp /Users/amitkumarmandal/Documents/astroCursor/astrosetu/SEO_CONTENT_CLUSTER_STRATEGY.md docs/seo/ 2>/dev/null || true

# Copy production-readiness files
echo "🚀 Copying production-readiness files..."
mkdir -p docs/production
cp /Users/amitkumarmandal/Documents/astroCursor/astrosetu/PRODUCTION_READINESS_PLAN.md docs/production/ 2>/dev/null || true
cp /Users/amitkumarmandal/Documents/astroCursor/astrosetu/PRODUCTION_READINESS_IMPLEMENTATION.md docs/production/ 2>/dev/null || true
cp /Users/amitkumarmandal/Documents/astroCursor/astrosetu/PRODUCTION_READINESS_SUMMARY.md docs/production/ 2>/dev/null || true
cp /Users/amitkumarmandal/Documents/astroCursor/astrosetu/PRODUCTION_READY.md docs/production/ 2>/dev/null || true
cp /Users/amitkumarmandal/Documents/astroCursor/astrosetu/VERCEL_PRODUCTION_VERIFICATION.md docs/production/ 2>/dev/null || true
cp /Users/amitkumarmandal/Documents/astroCursor/astrosetu/PRODUCTION_DEPLOYMENT_VERIFICATION.md docs/production/ 2>/dev/null || true

# Copy defect register
echo "📋 Copying defect register..."
mkdir -p docs
cp /Users/amitkumarmandal/Documents/astroCursor/astrosetu/DEFECT_REGISTER.md docs/ 2>/dev/null || true
cp /Users/amitkumarmandal/Documents/astroCursor/astrosetu/DEFECT_REGISTER_INDEX.md docs/ 2>/dev/null || true

# Copy configuration files
echo "⚙️  Copying configuration files..."
cp /Users/amitkumarmandal/Documents/astroCursor/astrosetu/vitest.config.ts . 2>/dev/null || true
cp /Users/amitkumarmandal/Documents/astroCursor/astrosetu/playwright.config.ts . 2>/dev/null || true
cp /Users/amitkumarmandal/Documents/astroCursor/astrosetu/tsconfig.json . 2>/dev/null || true
cp /Users/amitkumarmandal/Documents/astroCursor/astrosetu/next.config.js . 2>/dev/null || true
cp /Users/amitkumarmandal/Documents/astroCursor/astrosetu/next.config.mjs . 2>/dev/null || true

# Copy package.json for dependencies reference
cp /Users/amitkumarmandal/Documents/astroCursor/astrosetu/package.json . 2>/dev/null || true

# Create README
cat > README.md << 'EOF'
# AI Astrology Feature - Complete Package

This package contains the complete AI Astrology feature implementation including:
- All source files (pages, API routes, components, hooks, utilities)
- Headers and Footers
- All test layers (Unit, Integration, E2E, Regression)
- SEO implementation files
- Production-readiness documentation
- Defect register

## Structure

```
ai-astrology-complete/
├── src/
│   ├── app/
│   │   ├── ai-astrology/          # All AI Astrology pages
│   │   └── api/
│   │       └── ai-astrology/       # All API routes
│   ├── components/
│   │   ├── ai-astrology/          # AI Astrology components (Headers, Footers, etc.)
│   │   └── layout/                # Layout components (Footer, Shell)
│   ├── hooks/                     # Custom hooks (useElapsedSeconds, useReportGenerationController)
│   └── lib/
│       ├── ai-astrology/          # AI Astrology utilities
│       └── reportGenerationStateMachine.ts
├── tests/
│   ├── unit/                      # Unit tests
│   ├── integration/               # Integration tests
│   ├── e2e/                       # E2E tests
│   ├── regression/                # Regression tests
│   └── contracts/                 # Test contracts
├── docs/
│   ├── seo/                       # SEO documentation
│   ├── production/                # Production-readiness docs
│   └── DEFECT_REGISTER.md         # Defect register
└── Configuration files (vitest.config.ts, playwright.config.ts, etc.)
```

## Test Layers

### Unit Tests
- `tests/unit/timer-logic.test.ts` - Timer logic unit tests
- `tests/unit/hooks/useElapsedSeconds.test.ts` - Elapsed seconds hook tests
- `tests/unit/hooks/useReportGenerationController.test.ts` - Report generation controller tests

### Integration Tests
- `tests/integration/api/ai-astrology.test.ts` - API route integration tests
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

### Regression Tests
- `tests/regression/timer-stuck-stress.test.ts` - Timer stuck stress tests
- `tests/regression/weekly-issues-replication.test.ts` - Weekly issues replication tests

## Components

### Headers & Footers
- `src/components/ai-astrology/AIHeader.tsx` - AI Astrology header component
- `src/components/ai-astrology/AIFooter.tsx` - AI Astrology footer component
- `src/components/layout/Footer.tsx` - Main footer component
- `src/components/layout/Shell.tsx` - Shell layout component

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
- `docs/DEFECT_REGISTER.md` - Complete defect register (7 defects documented)
- `docs/DEFECT_REGISTER_INDEX.md` - Defect register index

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

### All Tests
```bash
npm run test
```

## Notes

- All 7 defects from the weekly report are documented in DEFECT_REGISTER.md
- All defects are fixed and verified
- Test coverage includes unit, integration, E2E, and regression tests
- Production-readiness documentation is comprehensive
- SEO implementation is documented

EOF

# Create zip file
echo "📦 Creating zip file..."
cd "$TEMP_DIR"
zip -r "$ZIP_NAME" ai-astrology-complete/ > /dev/null

# Move to original directory
mv "$ZIP_NAME" /Users/amitkumarmandal/Documents/astroCursor/astrosetu/

# Cleanup
rm -rf "$TEMP_DIR"

echo "✅ Complete! Zip file created: $ZIP_NAME"
echo "📁 Location: /Users/amitkumarmandal/Documents/astroCursor/astrosetu/$ZIP_NAME"
echo ""
echo "📊 Contents:"
echo "  - All AI Astrology source files"
echo "  - Headers and Footers"
echo "  - All test layers (Unit, Integration, E2E, Regression)"
echo "  - SEO documentation"
echo "  - Production-readiness documentation"
echo "  - Defect register"
echo "  - Configuration files"
