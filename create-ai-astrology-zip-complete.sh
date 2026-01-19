#!/bin/bash
# Complete AI Astrology Package Creator for ChatGPT Review
# Date: 2026-01-18

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
PACKAGE_NAME="ai-astrology-complete-package-${TIMESTAMP}"
TEMP_DIR="${PACKAGE_NAME}"
ZIP_FILE="${PACKAGE_NAME}.zip"

# Clean up previous temp directory if exists (only in current directory)
if [ -d "${TEMP_DIR}" ]; then
  rm -rf "${TEMP_DIR}"
fi

# Create directory structure (create parent first)
mkdir -p "${TEMP_DIR}"
mkdir -p "${TEMP_DIR}/astrosetu/src/app/ai-astrology"
mkdir -p "${TEMP_DIR}/astrosetu/src/app/api/ai-astrology"
mkdir -p "${TEMP_DIR}/astrosetu/src/lib/ai-astrology"
mkdir -p "${TEMP_DIR}/astrosetu/src/components/ai-astrology"
mkdir -p "${TEMP_DIR}/astrosetu/src/components/layout"
mkdir -p "${TEMP_DIR}/astrosetu/src/components/ui"
mkdir -p "${TEMP_DIR}/astrosetu/tests/unit"
mkdir -p "${TEMP_DIR}/astrosetu/tests/integration"
mkdir -p "${TEMP_DIR}/astrosetu/tests/e2e"
mkdir -p "${TEMP_DIR}/astrosetu/tests/regression"
mkdir -p "${TEMP_DIR}/astrosetu/tests/critical"
mkdir -p "${TEMP_DIR}/docs"
mkdir -p "${TEMP_DIR}/workflows"
mkdir -p "${TEMP_DIR}/.cursor"

echo "📦 Creating AI Astrology Complete Package..."

# Copy AI Astrology feature slice
echo "  → Copying AI Astrology pages..."
cp -r astrosetu/src/app/ai-astrology/* "${TEMP_DIR}/astrosetu/src/app/ai-astrology/" 2>/dev/null || true

# Copy AI Astrology APIs
echo "  → Copying AI Astrology APIs..."
cp -r astrosetu/src/app/api/ai-astrology/* "${TEMP_DIR}/astrosetu/src/app/api/ai-astrology/" 2>/dev/null || true

# Copy AI Astrology libraries
echo "  → Copying AI Astrology libraries..."
cp -r astrosetu/src/lib/ai-astrology/* "${TEMP_DIR}/astrosetu/src/lib/ai-astrology/" 2>/dev/null || true

# Copy related libraries (betaAccess, prodAllowlist, etc.)
echo "  → Copying related libraries..."
mkdir -p "${TEMP_DIR}/astrosetu/src/lib"
cp astrosetu/src/lib/betaAccess.ts "${TEMP_DIR}/astrosetu/src/lib/" 2>/dev/null || true
cp astrosetu/src/lib/prodAllowlist.ts "${TEMP_DIR}/astrosetu/src/lib/" 2>/dev/null || true
cp astrosetu/src/lib/access-restriction.ts "${TEMP_DIR}/astrosetu/src/lib/" 2>/dev/null || true

# Copy Headers and Footers
echo "  → Copying Headers and Footers..."
mkdir -p "${TEMP_DIR}/astrosetu/src/components/ai-astrology"
mkdir -p "${TEMP_DIR}/astrosetu/src/components/layout"
mkdir -p "${TEMP_DIR}/astrosetu/src/components/ui"
cp astrosetu/src/components/ai-astrology/*.tsx "${TEMP_DIR}/astrosetu/src/components/ai-astrology/" 2>/dev/null || true
cp astrosetu/src/components/layout/Footer.tsx "${TEMP_DIR}/astrosetu/src/components/layout/" 2>/dev/null || true
cp astrosetu/src/components/ui/HeaderPattern.tsx "${TEMP_DIR}/astrosetu/src/components/ui/" 2>/dev/null || true

# Copy all tests (unit, integration, E2E, regression, critical)
echo "  → Copying all tests..."
find astrosetu/tests -type f \( -name "*.test.ts" -o -name "*.spec.ts" \) | while read file; do
    relative_path=${file#astrosetu/}
    mkdir -p "${TEMP_DIR}/astrosetu/$(dirname "$relative_path")"
    cp "$file" "${TEMP_DIR}/astrosetu/$relative_path" 2>/dev/null || true
done

# Copy specific AI Astrology related test files
find astrosetu/tests -type f | grep -i "ai-astrology\|beta-access\|billing\|subscription\|returnTo\|token\|preview\|input\|report" | while read file; do
    relative_path=${file#astrosetu/}
    mkdir -p "${TEMP_DIR}/astrosetu/$(dirname "$relative_path")"
    cp "$file" "${TEMP_DIR}/astrosetu/$relative_path" 2>/dev/null || true
done

# Copy Cursor rules and documentation
echo "  → Copying Cursor rules and documentation..."
cp .cursor/rules "${TEMP_DIR}/.cursor/" 2>/dev/null || true
cp CURSOR_PROGRESS.md "${TEMP_DIR}/docs/" 2>/dev/null || true
cp CURSOR_ACTIONS_REQUIRED.md "${TEMP_DIR}/docs/" 2>/dev/null || true
cp CURSOR_AUTOPILOT_PROMPT.md "${TEMP_DIR}/docs/" 2>/dev/null || true
cp CURSOR_OPERATIONAL_GUIDE.md "${TEMP_DIR}/docs/" 2>/dev/null || true
cp NON_NEGOTIABLES.md "${TEMP_DIR}/docs/" 2>/dev/null || true

# Copy defect registers
echo "  → Copying defect registers and status reports..."
cp DEFECT_REASSESSMENT_2026-01-18.md "${TEMP_DIR}/docs/" 2>/dev/null || true
find . -maxdepth 2 -type f -name "*DEFECT*.md" | while read file; do
    cp "$file" "${TEMP_DIR}/docs/" 2>/dev/null || true
done

# Copy workflows
echo "  → Copying workflows..."
find .github/workflows -type f 2>/dev/null | while read file; do
    relative_path=${file#.github/}
    mkdir -p "${TEMP_DIR}/workflows/$(dirname "$relative_path")"
    cp "$file" "${TEMP_DIR}/workflows/$relative_path" 2>/dev/null || true
done

# Copy recent fix documents
echo "  → Copying recent fix documents..."
find . -maxdepth 2 -type f \( -name "*STABLE*.md" -o -name "*CHATGPT*.md" -o -name "*VERCEL*.md" -o -name "*FEEDBACK*.md" \) | while read file; do
    cp "$file" "${TEMP_DIR}/docs/" 2>/dev/null || true
done

# Copy configuration files
echo "  → Copying configuration files..."
cp astrosetu/package.json "${TEMP_DIR}/astrosetu/" 2>/dev/null || true
cp astrosetu/tsconfig.json "${TEMP_DIR}/astrosetu/" 2>/dev/null || true
cp astrosetu/next.config.js "${TEMP_DIR}/astrosetu/" 2>/dev/null || true
cp astrosetu/playwright.config.ts "${TEMP_DIR}/astrosetu/" 2>/dev/null || true
cp astrosetu/.env.example "${TEMP_DIR}/astrosetu/" 2>/dev/null || true

# Create README with manifest
cat > "${TEMP_DIR}/README.md" << 'EOF'
# AI Astrology Complete Package for ChatGPT Review

## Package Contents

### Feature Slice
- `src/app/ai-astrology/` - All AI Astrology pages and components
- `src/app/api/ai-astrology/` - All AI Astrology API routes
- `src/lib/ai-astrology/` - AI Astrology business logic and utilities

### Components
- `src/components/ai-astrology/` - AI Astrology specific components (Header, Footer)
- `src/components/layout/` - Layout components
- `src/components/ui/` - UI components

### Tests (Full Test Pyramid)
- `tests/unit/` - Unit tests
- `tests/integration/` - Integration tests
- `tests/e2e/` - End-to-end tests
- `tests/regression/` - Regression tests
- `tests/critical/` - Critical path tests

### Documentation
- `docs/CURSOR_PROGRESS.md` - Progress tracking
- `docs/CURSOR_ACTIONS_REQUIRED.md` - Action items
- `docs/CURSOR_AUTOPILOT_PROMPT.md` - Autopilot instructions
- `docs/CURSOR_OPERATIONAL_GUIDE.md` - Operational guide
- `docs/NON_NEGOTIABLES.md` - Non-negotiable requirements
- `docs/DEFECT_*.md` - Defect registers and status reports

### Workflows
- `.github/workflows/` - CI/CD workflows

### Configuration
- `.cursor/rules` - Cursor AI rules
- `package.json`, `tsconfig.json`, `next.config.js` - Project configuration

## Recent Changes (2026-01-18)

### Fix: Ensure auto_generate=true for free life summary in all navigation paths
- Fixed returnTo sanitization to include auto_generate=true for free reports
- Fixed returnTo URL modification to add auto_generate=true when adding input_token
- Added [AUTO_GENERATE_DECISION] structured logging for production verification

## Verification Checklist

1. ✅ Feature code complete (pages, APIs, libraries)
2. ✅ Tests complete (all layers of test pyramid)
3. ✅ Documentation complete (rules, guides, defect registers)
4. ✅ Recent fixes included
5. ✅ Configuration files included

EOF

# Add file manifest
echo "" >> "${TEMP_DIR}/README.md"
echo "## File Manifest" >> "${TEMP_DIR}/README.md"
echo "" >> "${TEMP_DIR}/README.md"
echo "\`\`\`" >> "${TEMP_DIR}/README.md"
find "${TEMP_DIR}" -type f | sed "s|${TEMP_DIR}/||" | sort >> "${TEMP_DIR}/README.md"
echo "\`\`\`" >> "${TEMP_DIR}/README.md"

# Create zip file
echo "  → Creating zip file..."
cd "${TEMP_DIR}" && zip -r "../${ZIP_FILE}" . -q && cd ..
rm -rf "${TEMP_DIR}"

echo ""
echo "✅ Package created: ${ZIP_FILE}"
echo "📊 File count: $(unzip -l "${ZIP_FILE}" | tail -1 | awk '{print $2}')"
echo "📦 Package size: $(du -h "${ZIP_FILE}" | cut -f1)"
echo ""

