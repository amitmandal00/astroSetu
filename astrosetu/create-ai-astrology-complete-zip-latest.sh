#!/bin/bash

# Create Complete AI Astrology Feature Package (Latest)
# Includes: full repo structure, feature slice, tests, docs, operational guides

set -e

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
PACKAGE_NAME="ai-astrology-complete-${TIMESTAMP}"
ZIP_FILE="${PACKAGE_NAME}.zip"
BASE_DIR="astrosetu"

echo "📦 Creating AI Astrology Complete Package: ${ZIP_FILE}"
echo "=========================================="

# Create temporary directory
TEMP_DIR=$(mktemp -d)
PACKAGE_DIR="${TEMP_DIR}/${PACKAGE_NAME}"
mkdir -p "${PACKAGE_DIR}"

echo "✅ Created temporary directory: ${PACKAGE_DIR}"

# Copy main repo structure
echo "📁 Copying repository structure..."
mkdir -p "${PACKAGE_DIR}/astrosetu"

# Copy package.json and dependencies
cp "${BASE_DIR}/package.json" "${PACKAGE_DIR}/astrosetu/" 2>/dev/null || true
cp "${BASE_DIR}/package-lock.json" "${PACKAGE_DIR}/astrosetu/" 2>/dev/null || true
cp "${BASE_DIR}/tsconfig.json" "${PACKAGE_DIR}/astrosetu/" 2>/dev/null || true
cp "${BASE_DIR}/next.config.js" "${PACKAGE_DIR}/astrosetu/" 2>/dev/null || true
cp "${BASE_DIR}/next.config.mjs" "${PACKAGE_DIR}/astrosetu/" 2>/dev/null || true
cp "${BASE_DIR}/vitest.config.ts" "${PACKAGE_DIR}/astrosetu/" 2>/dev/null || true

# Copy AI Astrology Feature Slice
echo "📁 Copying AI Astrology feature slice..."
mkdir -p "${PACKAGE_DIR}/astrosetu/src/app/ai-astrology"
cp -r "${BASE_DIR}/src/app/ai-astrology/"* "${PACKAGE_DIR}/astrosetu/src/app/ai-astrology/" 2>/dev/null || true

# Copy AI Astrology Libraries
echo "📁 Copying AI Astrology libraries..."
mkdir -p "${PACKAGE_DIR}/astrosetu/src/lib/ai-astrology"
cp -r "${BASE_DIR}/src/lib/ai-astrology/"* "${PACKAGE_DIR}/astrosetu/src/lib/ai-astrology/" 2>/dev/null || true

# Copy AI Astrology Components
echo "📁 Copying AI Astrology components..."
mkdir -p "${PACKAGE_DIR}/astrosetu/src/components/ai-astrology"
cp -r "${BASE_DIR}/src/components/ai-astrology/"* "${PACKAGE_DIR}/astrosetu/src/components/ai-astrology/" 2>/dev/null || true

# Copy API Routes
echo "📁 Copying AI Astrology API routes..."
mkdir -p "${PACKAGE_DIR}/astrosetu/src/app/api/ai-astrology"
cp -r "${BASE_DIR}/src/app/api/ai-astrology/"* "${PACKAGE_DIR}/astrosetu/src/app/api/ai-astrology/" 2>/dev/null || true

# Copy Tests (Unit, Integration, E2E)
echo "📁 Copying test suite..."
mkdir -p "${PACKAGE_DIR}/astrosetu/tests"
# Unit tests
find "${BASE_DIR}/tests/unit" -path "*/ai-astrology/*" -o -path "*/hooks/*useReportGenerationController*" -o -path "*/lib/*freeReportGating*" 2>/dev/null | while read file; do
    rel_path=${file#${BASE_DIR}/}
    mkdir -p "${PACKAGE_DIR}/astrosetu/$(dirname "$rel_path")"
    cp "$file" "${PACKAGE_DIR}/astrosetu/$rel_path" 2>/dev/null || true
done

# Integration tests
find "${BASE_DIR}/tests/integration" -path "*/ai-astrology/*" -o -path "*/api/*ai-astrology*" -o -path "*/report*" 2>/dev/null | while read file; do
    rel_path=${file#${BASE_DIR}/}
    mkdir -p "${PACKAGE_DIR}/astrosetu/$(dirname "$rel_path")"
    cp "$file" "${PACKAGE_DIR}/astrosetu/$rel_path" 2>/dev/null || true
done

# E2E tests
find "${BASE_DIR}/tests/e2e" -name "*report*" -o -name "*ai-astrology*" 2>/dev/null | while read file; do
    rel_path=${file#${BASE_DIR}/}
    mkdir -p "${PACKAGE_DIR}/astrosetu/$(dirname "$rel_path")"
    cp "$file" "${PACKAGE_DIR}/astrosetu/$rel_path" 2>/dev/null || true
done

# Copy contract tests
find "${BASE_DIR}/tests/contracts" -name "*report*" 2>/dev/null | while read file; do
    rel_path=${file#${BASE_DIR}/}
    mkdir -p "${PACKAGE_DIR}/astrosetu/$(dirname "$rel_path")"
    cp "$file" "${PACKAGE_DIR}/astrosetu/$rel_path" 2>/dev/null || true
done

# Copy regression tests
find "${BASE_DIR}/tests/regression" -name "*report*" 2>/dev/null | while read file; do
    rel_path=${file#${BASE_DIR}/}
    mkdir -p "${PACKAGE_DIR}/astrosetu/$(dirname "$rel_path")"
    cp "$file" "${PACKAGE_DIR}/astrosetu/$rel_path" 2>/dev/null || true
done

# Copy Documentation
echo "📁 Copying documentation..."
mkdir -p "${PACKAGE_DIR}/docs"

# SQL migrations
cp "${BASE_DIR}/docs/AI_ASTROLOGY_REPORTS_REFUND_TRACKING_MIGRATION.sql" "${PACKAGE_DIR}/docs/" 2>/dev/null || true
cp "${BASE_DIR}/docs/AI_ASTROLOGY_REPORT_STORE_SUPABASE.sql" "${PACKAGE_DIR}/docs/" 2>/dev/null || true
cp "${BASE_DIR}/docs/AI_ASTROLOGY_SUBSCRIPTIONS_SUPABASE.sql" "${PACKAGE_DIR}/docs/" 2>/dev/null || true

# Main documentation files
cp "${BASE_DIR}/DEFECT_REGISTER.md" "${PACKAGE_DIR}/" 2>/dev/null || true
cp "${BASE_DIR}/SHORT_REPORTS_ISSUE_SUMMARY.md" "${PACKAGE_DIR}/" 2>/dev/null || true
cp "${BASE_DIR}/AI_ASTROLOGY_SETUP.md" "${PACKAGE_DIR}/" 2>/dev/null || true
cp "${BASE_DIR}/AI_ASTROLOGY_IMPLEMENTATION_PLAN.md" "${PACKAGE_DIR}/" 2>/dev/null || true
cp "${BASE_DIR}/AI_ASTROLOGY_TESTING_CHECKLIST.md" "${PACKAGE_DIR}/" 2>/dev/null || true
cp "${BASE_DIR}/AI_ASTROLOGY_PLATFORM_SUMMARY.md" "${PACKAGE_DIR}/" 2>/dev/null || true
cp "${BASE_DIR}/CURSOR_OPERATING_MANUAL.md" "${PACKAGE_DIR}/" 2>/dev/null || true
cp "${BASE_DIR}/CURSOR_WORKFLOW_CONTROL.md" "${PACKAGE_DIR}/" 2>/dev/null || true

# Operational Guides
cp "../CURSOR_PROGRESS.md" "${PACKAGE_DIR}/" 2>/dev/null || true
cp "../CURSOR_ACTIONS_REQUIRED.md" "${PACKAGE_DIR}/" 2>/dev/null || true
cp "../CURSOR_AUTOPILOT_PROMPT.md" "${PACKAGE_DIR}/" 2>/dev/null || true
cp "../CURSOR_OPERATIONAL_GUIDE.md" "${PACKAGE_DIR}/" 2>/dev/null || true
cp "${BASE_DIR}/CURSOR_OPERATING_MANUAL.md" "${PACKAGE_DIR}/" 2>/dev/null || true

# Fix summaries and recent changes
cp "${BASE_DIR}/P0_P1_IMPLEMENTATION_SUMMARY.md" "${PACKAGE_DIR}/" 2>/dev/null || true
cp "${BASE_DIR}/AUTOMATIC_REFUND_REVIEW_ANALYSIS.md" "${PACKAGE_DIR}/" 2>/dev/null || true
cp "${BASE_DIR}/MOCK_CONTENT_STRIPPING_FIX_SUMMARY.md" "${PACKAGE_DIR}/" 2>/dev/null || true
cp "${BASE_DIR}/PDF_PREVIEW_MATCHING_FIX_SUMMARY.md" "${PACKAGE_DIR}/" 2>/dev/null || true
cp "${BASE_DIR}/REPORT_LENGTH_ANALYSIS.md" "${PACKAGE_DIR}/" 2>/dev/null || true

# Copy Headers/Footers if they exist
echo "📁 Copying headers/footers..."
if [ -d "${BASE_DIR}/src/components/ai-astrology" ]; then
    find "${BASE_DIR}/src/components/ai-astrology" -name "*Header*" -o -name "*Footer*" | while read file; do
        rel_path=${file#${BASE_DIR}/}
        mkdir -p "${PACKAGE_DIR}/astrosetu/$(dirname "$rel_path")"
        cp "$file" "${PACKAGE_DIR}/astrosetu/$rel_path" 2>/dev/null || true
    done
fi

# Copy .cursor rules if they exist
echo "📁 Copying .cursor configuration..."
if [ -d ".cursor" ]; then
    mkdir -p "${PACKAGE_DIR}/.cursor"
    cp -r .cursor/* "${PACKAGE_DIR}/.cursor/" 2>/dev/null || echo "⚠️  Skipped .cursor (permission issue)" || true
fi

# Copy workflow files
echo "📁 Copying workflows..."
mkdir -p "${PACKAGE_DIR}/.github/workflows"
if [ -d "${BASE_DIR}/.github/workflows" ]; then
    cp -r "${BASE_DIR}/.github/workflows/"* "${PACKAGE_DIR}/.github/workflows/" 2>/dev/null || true
fi

# Copy scripts
echo "📁 Copying scripts..."
mkdir -p "${PACKAGE_DIR}/scripts"
if [ -d "${BASE_DIR}/scripts" ]; then
    cp -r "${BASE_DIR}/scripts/"* "${PACKAGE_DIR}/scripts/" 2>/dev/null || true
fi

# Create package manifest
echo "📝 Creating package manifest..."
cat > "${PACKAGE_DIR}/PACKAGE_MANIFEST.md" << 'EOF'
# AI Astrology Complete Package Manifest

## Package Information
- **Created**: $(date)
- **Package Type**: Complete Feature Slice + Full Test Suite + Documentation
- **Scope**: AI Astrology feature (landing, input, generation, preview, payment, subscription)

## Contents

### 1. Feature Implementation
- `/src/app/ai-astrology/` - All pages (landing, input, preview, payment, subscription)
- `/src/lib/ai-astrology/` - Core libraries (generation, PDF, validation, stores)
- `/src/components/ai-astrology/` - React components
- `/src/app/api/ai-astrology/` - API routes

### 2. Test Suite
- `/tests/unit/` - Unit tests
- `/tests/integration/` - Integration tests
- `/tests/e2e/` - End-to-end tests
- `/tests/contracts/` - Contract tests
- `/tests/regression/` - Regression tests

### 3. Documentation
- `DEFECT_REGISTER.md` - Complete defect tracking
- `SHORT_REPORTS_ISSUE_SUMMARY.md` - Latest issue analysis
- `AI_ASTROLOGY_*.md` - Setup, implementation, testing guides
- `CURSOR_*.md` - Operational guides and workflows

### 4. Database Migrations
- `/docs/AI_ASTROLOGY_*.sql` - Supabase migration scripts

### 5. Configuration
- `package.json` - Dependencies
- `tsconfig.json` - TypeScript configuration
- `.cursor/` - Cursor IDE rules
- `.github/workflows/` - CI/CD workflows

## Recent Fixes Included (2026-01-19)
1. ✅ Short Reports Issue - Enhanced fallback sections for mock reports
2. ✅ Mock Content Stripping - Comprehensive cleaning of all custom fields
3. ✅ PDF Matching - Custom fields now included in PDF generation
4. ✅ Report Validation - Strict validation before marking as completed
5. ✅ Automatic Refunds - Refund tracking and automation
6. ✅ Build Errors - Fixed TypeScript errors and ES module issues

## How to Use
1. Extract package
2. Review `AI_ASTROLOGY_SETUP.md` for setup instructions
3. Run `npm install` in `astrosetu/` directory
4. Set up environment variables (see setup guide)
5. Run tests: `npm run test`
6. Review `DEFECT_REGISTER.md` for known issues

## Notes
- All files are from the main branch as of package creation time
- Test files may require environment setup
- Some configuration files may need adjustment for your environment
EOF

# Replace date in manifest
sed -i.bak "s/\$(date)/$(date)/" "${PACKAGE_DIR}/PACKAGE_MANIFEST.md" && rm "${PACKAGE_DIR}/PACKAGE_MANIFEST.md.bak" 2>/dev/null || true

# Create ZIP file
echo "📦 Creating ZIP file..."
cd "${TEMP_DIR}"
zip -r "${ZIP_FILE}" "${PACKAGE_NAME}" -q

# Move ZIP to current directory
mv "${ZIP_FILE}" "${OLDPWD}/${ZIP_FILE}"

# Cleanup
rm -rf "${TEMP_DIR}"

echo ""
echo "✅ Package created successfully!"
echo "📦 File: ${ZIP_FILE}"
echo "📊 Size: $(du -h ${ZIP_FILE} | cut -f1)"
echo ""
echo "Package includes:"
echo "  ✅ Complete AI Astrology feature slice"
echo "  ✅ Full test suite (unit/integration/e2e)"
echo "  ✅ All documentation and operational guides"
echo "  ✅ Database migrations"
echo "  ✅ Configuration files"
echo "  ✅ Recent fixes and improvements"
echo ""

