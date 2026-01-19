#!/bin/bash

# Create Complete AI Astrology Feature Package (Latest) - FIXED VERSION
# Includes: full repo structure, feature slice, tests, docs, operational guides

set -e

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
PACKAGE_NAME="ai-astrology-complete-${TIMESTAMP}"
ZIP_FILE="${PACKAGE_NAME}.zip"
BASE_DIR="."
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCRIPT_DIR}"

echo "📦 Creating AI Astrology Complete Package: ${ZIP_FILE}"
echo "=========================================="
echo "Working directory: $(pwd)"
echo "Base directory: ${BASE_DIR}"

# Create temporary directory
TEMP_DIR=$(mktemp -d)
PACKAGE_DIR="${TEMP_DIR}/${PACKAGE_NAME}"
mkdir -p "${PACKAGE_DIR}"

echo "✅ Created temporary directory: ${PACKAGE_DIR}"

# Copy package files
echo "📁 Copying package files..."
if [ -f "package.json" ]; then
    cp "package.json" "${PACKAGE_DIR}/" || true
fi
if [ -f "package-lock.json" ]; then
    cp "package-lock.json" "${PACKAGE_DIR}/" || true
fi
if [ -f "tsconfig.json" ]; then
    cp "tsconfig.json" "${PACKAGE_DIR}/" || true
fi
if [ -f "next.config.js" ]; then
    cp "next.config.js" "${PACKAGE_DIR}/" || true
fi
if [ -f "next.config.mjs" ]; then
    cp "next.config.mjs" "${PACKAGE_DIR}/" || true
fi
if [ -f "vitest.config.ts" ]; then
    cp "vitest.config.ts" "${PACKAGE_DIR}/" || true
fi

# Copy AI Astrology Feature Slice - FIXED: Use proper source paths
echo "📁 Copying AI Astrology feature slice..."
if [ -d "src/app/ai-astrology" ]; then
    mkdir -p "${PACKAGE_DIR}/src/app/ai-astrology"
    cp -r src/app/ai-astrology/* "${PACKAGE_DIR}/src/app/ai-astrology/" 2>&1 || {
        echo "⚠️  Error copying ai-astrology pages, trying with find..."
        find src/app/ai-astrology -type f -exec cp --parents {} "${PACKAGE_DIR}/" \; 2>/dev/null || true
    }
fi

# Copy AI Astrology Libraries
echo "📁 Copying AI Astrology libraries..."
if [ -d "src/lib/ai-astrology" ]; then
    mkdir -p "${PACKAGE_DIR}/src/lib/ai-astrology"
    cp -r src/lib/ai-astrology/* "${PACKAGE_DIR}/src/lib/ai-astrology/" 2>&1 || {
        echo "⚠️  Error copying libraries, trying with find..."
        find src/lib/ai-astrology -type f -exec cp --parents {} "${PACKAGE_DIR}/" \; 2>/dev/null || true
    }
fi

# Copy AI Astrology Components
echo "📁 Copying AI Astrology components..."
if [ -d "src/components/ai-astrology" ]; then
    mkdir -p "${PACKAGE_DIR}/src/components/ai-astrology"
    cp -r src/components/ai-astrology/* "${PACKAGE_DIR}/src/components/ai-astrology/" 2>&1 || {
        echo "⚠️  Error copying components, trying with find..."
        find src/components/ai-astrology -type f -exec cp --parents {} "${PACKAGE_DIR}/" \; 2>/dev/null || true
    }
fi

# Copy API Routes
echo "📁 Copying AI Astrology API routes..."
if [ -d "src/app/api/ai-astrology" ]; then
    mkdir -p "${PACKAGE_DIR}/src/app/api/ai-astrology"
    cp -r src/app/api/ai-astrology/* "${PACKAGE_DIR}/src/app/api/ai-astrology/" 2>&1 || {
        echo "⚠️  Error copying API routes, trying with find..."
        find src/app/api/ai-astrology -type f -exec cp --parents {} "${PACKAGE_DIR}/" \; 2>/dev/null || true
    }
fi

# Copy Tests - FIXED: Use proper find commands
echo "📁 Copying test suite..."
if [ -d "tests" ]; then
    mkdir -p "${PACKAGE_DIR}/tests"
    
    # Copy all test files recursively
    find tests -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.md" -o -name "*.json" \) 2>/dev/null | while read file; do
        rel_dir=$(dirname "${file}")
        mkdir -p "${PACKAGE_DIR}/${rel_dir}"
        cp "${file}" "${PACKAGE_DIR}/${file}" 2>/dev/null || true
    done
fi

# Copy Documentation
echo "📁 Copying documentation..."
mkdir -p "${PACKAGE_DIR}/docs"

# SQL migrations
if [ -d "docs" ]; then
    find docs -name "AI_ASTROLOGY*.sql" -exec cp {} "${PACKAGE_DIR}/docs/" \; 2>/dev/null || true
fi

# Main documentation files (from astrosetu directory)
DOC_FILES=(
    "DEFECT_REGISTER.md"
    "SHORT_REPORTS_ISSUE_SUMMARY.md"
    "AI_ASTROLOGY_SETUP.md"
    "AI_ASTROLOGY_IMPLEMENTATION_PLAN.md"
    "AI_ASTROLOGY_TESTING_CHECKLIST.md"
    "AI_ASTROLOGY_PLATFORM_SUMMARY.md"
    "CURSOR_OPERATING_MANUAL.md"
    "CURSOR_WORKFLOW_CONTROL.md"
    "P0_P1_IMPLEMENTATION_SUMMARY.md"
    "AUTOMATIC_REFUND_REVIEW_ANALYSIS.md"
    "MOCK_CONTENT_STRIPPING_FIX_SUMMARY.md"
    "PDF_PREVIEW_MATCHING_FIX_SUMMARY.md"
    "REPORT_LENGTH_ANALYSIS.md"
    "ZIP_PACKAGE_SUMMARY.md"
)

for doc in "${DOC_FILES[@]}"; do
    if [ -f "${doc}" ]; then
        cp "${doc}" "${PACKAGE_DIR}/" || true
    fi
done

# Operational Guides (from parent directory)
if [ -f "../CURSOR_PROGRESS.md" ]; then
    cp "../CURSOR_PROGRESS.md" "${PACKAGE_DIR}/" || true
fi
if [ -f "../CURSOR_ACTIONS_REQUIRED.md" ]; then
    cp "../CURSOR_ACTIONS_REQUIRED.md" "${PACKAGE_DIR}/" || true
fi
if [ -f "../CURSOR_AUTOPILOT_PROMPT.md" ]; then
    cp "../CURSOR_AUTOPILOT_PROMPT.md" "${PACKAGE_DIR}/" || true
fi
if [ -f "../CURSOR_OPERATIONAL_GUIDE.md" ]; then
    cp "../CURSOR_OPERATIONAL_GUIDE.md" "${PACKAGE_DIR}/" || true
fi

# Copy scripts
echo "📁 Copying scripts..."
if [ -d "scripts" ]; then
    mkdir -p "${PACKAGE_DIR}/scripts"
    find scripts -name "*.mjs" -o -name "*.js" -o -name "*.sh" 2>/dev/null | while read file; do
        cp "${file}" "${PACKAGE_DIR}/${file}" 2>/dev/null || true
    done
fi

# Copy workflows
echo "📁 Copying workflows..."
if [ -d ".github/workflows" ]; then
    mkdir -p "${PACKAGE_DIR}/.github/workflows"
    cp -r .github/workflows/* "${PACKAGE_DIR}/.github/workflows/" 2>/dev/null || true
fi

# Create package manifest
echo "📝 Creating package manifest..."
cat > "${PACKAGE_DIR}/PACKAGE_MANIFEST.md" << EOF
# AI Astrology Complete Package Manifest

## Package Information
- **Created**: $(date)
- **Package Type**: Complete Feature Slice + Full Test Suite + Documentation
- **Scope**: AI Astrology feature (landing, input, generation, preview, payment, subscription)

## Contents

### 1. Feature Implementation
- \`/src/app/ai-astrology/\` - All pages (landing, input, preview, payment, subscription)
- \`/src/lib/ai-astrology/\` - Core libraries (generation, PDF, validation, stores)
- \`/src/components/ai-astrology/\` - React components
- \`/src/app/api/ai-astrology/\` - API routes

### 2. Test Suite
- \`/tests/unit/\` - Unit tests
- \`/tests/integration/\` - Integration tests
- \`/tests/e2e/\` - End-to-end tests
- \`/tests/contracts/\` - Contract tests
- \`/tests/regression/\` - Regression tests

### 3. Documentation
- \`DEFECT_REGISTER.md\` - Complete defect tracking
- \`SHORT_REPORTS_ISSUE_SUMMARY.md\` - Latest issue analysis
- \`AI_ASTROLOGY_*.md\` - Setup, implementation, testing guides
- \`CURSOR_*.md\` - Operational guides and workflows

### 4. Database Migrations
- \`/docs/AI_ASTROLOGY_*.sql\` - Supabase migration scripts

### 5. Configuration
- \`package.json\` - Dependencies
- \`tsconfig.json\` - TypeScript configuration
- \`.github/workflows/\` - CI/CD workflows

## Recent Fixes Included (2026-01-19)
1. ✅ Short Reports Issue - Enhanced fallback sections for mock reports
2. ✅ Mock Content Stripping - Comprehensive cleaning of all custom fields
3. ✅ PDF Matching - Custom fields now included in PDF generation
4. ✅ Report Validation - Strict validation before marking as completed
5. ✅ Automatic Refunds - Refund tracking and automation
6. ✅ Build Errors - Fixed TypeScript errors and ES module issues

## How to Use
1. Extract package
2. Review \`AI_ASTROLOGY_SETUP.md\` for setup instructions
3. Run \`npm install\` in package directory
4. Set up environment variables (see setup guide)
5. Run tests: \`npm run test\`
6. Review \`DEFECT_REGISTER.md\` for known issues

## Notes
- All files are from the main branch as of package creation time
- Test files may require environment setup
- Some configuration files may need adjustment for your environment
EOF

# Count files before zipping
echo ""
echo "📊 Package contents summary:"
echo "  Feature files: $(find "${PACKAGE_DIR}/src" -type f 2>/dev/null | wc -l | tr -d ' ')"
echo "  Test files: $(find "${PACKAGE_DIR}/tests" -type f 2>/dev/null | wc -l | tr -d ' ')"
echo "  Documentation: $(find "${PACKAGE_DIR}" -maxdepth 1 -name "*.md" 2>/dev/null | wc -l | tr -d ' ')"
echo "  Total files: $(find "${PACKAGE_DIR}" -type f 2>/dev/null | wc -l | tr -d ' ')"
echo ""

# Create ZIP file
echo "📦 Creating ZIP file..."
cd "${TEMP_DIR}"
zip -r "${ZIP_FILE}" "${PACKAGE_NAME}" -q

# Move ZIP to script directory
mv "${ZIP_FILE}" "${SCRIPT_DIR}/${ZIP_FILE}"

# Cleanup
rm -rf "${TEMP_DIR}"

echo ""
echo "✅ Package created successfully!"
echo "📦 File: ${ZIP_FILE}"
echo "📊 Size: $(du -h "${SCRIPT_DIR}/${ZIP_FILE}" | cut -f1)"
echo ""
echo "Package includes:"
echo "  ✅ Complete AI Astrology feature slice"
echo "  ✅ Full test suite (unit/integration/e2e)"
echo "  ✅ All documentation and operational guides"
echo "  ✅ Database migrations"
echo "  ✅ Configuration files"
echo "  ✅ Recent fixes and improvements"
echo ""

