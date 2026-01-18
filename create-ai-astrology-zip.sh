#!/bin/bash

# Script to create comprehensive AI Astrology complete package zip file
# Date: 2026-01-18

set -e

BASE_DIR="/Users/amitkumarmandal/Documents/astroCursor"
TEMP_DIR="${BASE_DIR}/ai-astrology-complete-package-temp"
ZIP_NAME="ai-astrology-complete-package-$(date +%Y%m%d-%H%M%S).zip"
OUTPUT_DIR="${BASE_DIR}"

cd "$BASE_DIR"

# Clean up temp directory
rm -rf "$TEMP_DIR"
mkdir -p "$TEMP_DIR"

echo "📦 Creating comprehensive AI Astrology package..."

# 1. AI Astrology Feature Slice (src/app/ai-astrology)
echo "📁 Copying AI Astrology feature slice..."
mkdir -p "$TEMP_DIR/astrosetu/src/app/ai-astrology"
cp -r astrosetu/src/app/ai-astrology/* "$TEMP_DIR/astrosetu/src/app/ai-astrology/"

# 2. Related APIs
echo "📁 Copying AI Astrology APIs..."
mkdir -p "$TEMP_DIR/astrosetu/src/app/api/ai-astrology"
cp -r astrosetu/src/app/api/ai-astrology/* "$TEMP_DIR/astrosetu/src/app/api/ai-astrology/"

# 3. Billing APIs (for subscriptions)
echo "📁 Copying Billing APIs..."
mkdir -p "$TEMP_DIR/astrosetu/src/app/api/billing"
cp -r astrosetu/src/app/api/billing/* "$TEMP_DIR/astrosetu/src/app/api/billing/" 2>/dev/null || true

# 4. Beta Access API
echo "📁 Copying Beta Access API..."
mkdir -p "$TEMP_DIR/astrosetu/src/app/api/beta-access"
cp -r astrosetu/src/app/api/beta-access/* "$TEMP_DIR/astrosetu/src/app/api/beta-access/" 2>/dev/null || true

# 5. Related Libraries
echo "📁 Copying AI Astrology libraries..."
mkdir -p "$TEMP_DIR/astrosetu/src/lib/ai-astrology"
cp -r astrosetu/src/lib/ai-astrology/* "$TEMP_DIR/astrosetu/src/lib/ai-astrology/" 2>/dev/null || true

mkdir -p "$TEMP_DIR/astrosetu/src/lib/billing"
cp -r astrosetu/src/lib/billing/* "$TEMP_DIR/astrosetu/src/lib/billing/" 2>/dev/null || true

# 6. Components (headers, footers, AI-specific)
echo "📁 Copying components..."
mkdir -p "$TEMP_DIR/astrosetu/src/components"
# Copy entire component directories that match
find astrosetu/src/components -type d \( -name "*ai*" -o -name "*footer*" -o -name "*header*" -o -name "*Astro*" \) | while read dir; do
  rel_path=${dir#astrosetu/}
  mkdir -p "$TEMP_DIR/astrosetu/$(dirname "$rel_path")"
  cp -r "$dir" "$TEMP_DIR/astrosetu/$rel_path" 2>/dev/null || true
done
# Copy individual component files
find astrosetu/src/components -type f \( -name "*ai*" -o -name "*footer*" -o -name "*header*" -o -name "*Astro*" \) | while read file; do
  rel_path=${file#astrosetu/}
  mkdir -p "$TEMP_DIR/astrosetu/$(dirname "$rel_path")"
  cp "$file" "$TEMP_DIR/astrosetu/$rel_path" 2>/dev/null || true
done

# 7. All Tests (Unit, Integration, E2E)
echo "📁 Copying tests..."
mkdir -p "$TEMP_DIR/astrosetu/tests"
cp -r astrosetu/tests/* "$TEMP_DIR/astrosetu/tests/" 2>/dev/null || true

# Copy test utilities
if [ -d "astrosetu/src/lib/test-utils" ]; then
  mkdir -p "$TEMP_DIR/astrosetu/src/lib/test-utils"
  cp -r astrosetu/src/lib/test-utils/* "$TEMP_DIR/astrosetu/src/lib/test-utils/"
fi

# 8. Middleware (for routing and access control)
echo "📁 Copying middleware..."
mkdir -p "$TEMP_DIR/astrosetu/src"
cp astrosetu/src/middleware.ts "$TEMP_DIR/astrosetu/src/" 2>/dev/null || true

# 9. Feature Flags
echo "📁 Copying feature flags..."
mkdir -p "$TEMP_DIR/astrosetu/src/lib"
cp astrosetu/src/lib/feature-flags.ts "$TEMP_DIR/astrosetu/src/lib/" 2>/dev/null || true

# 10. HTTP Client (apiGet, apiPost)
echo "📁 Copying HTTP utilities..."
cp astrosetu/src/lib/http.ts "$TEMP_DIR/astrosetu/src/lib/" 2>/dev/null || true
cp astrosetu/src/lib/apiHelpers.ts "$TEMP_DIR/astrosetu/src/lib/" 2>/dev/null || true

# 11. Defect Register and Documentation
echo "📁 Copying defect registers and documentation..."
cp astrosetu/DEFECT_REGISTER.md "$TEMP_DIR/" 2>/dev/null || true
cp astrosetu/DEFECT_STATUS_CURRENT.md "$TEMP_DIR/" 2>/dev/null || true
cp astrosetu/DEFECT_TO_TEST_MAPPING.md "$TEMP_DIR/" 2>/dev/null || true
cp DEFECT_REASSESSMENT_2026-01-18.md "$TEMP_DIR/" 2>/dev/null || true

# Copy all defect-related files
find astrosetu -name "*DEFECT*" -type f | while read file; do
  cp "$file" "$TEMP_DIR/$(basename "$file")" 2>/dev/null || true
done

# 12. Cursor Documentation
echo "📁 Copying Cursor documentation..."
cp CURSOR_PROGRESS.md "$TEMP_DIR/" 2>/dev/null || true
cp CURSOR_ACTIONS_REQUIRED.md "$TEMP_DIR/" 2>/dev/null || true
cp CURSOR_AUTOPILOT_PROMPT.md "$TEMP_DIR/" 2>/dev/null || true
cp CURSOR_OPERATIONAL_GUIDE.md "$TEMP_DIR/" 2>/dev/null || true

# Copy all CURSOR_* files
find . -maxdepth 1 -name "CURSOR_*" -type f | while read file; do
  cp "$file" "$TEMP_DIR/" 2>/dev/null || true
done

# 13. NON-NEGOTIABLES (search for any files with this name)
echo "📁 Copying NON-NEGOTIABLES..."
find . -maxdepth 2 -name "*NON-NEGOTIABLE*" -type f | while read file; do
  cp "$file" "$TEMP_DIR/" 2>/dev/null || true
done

# 14. .cursor/rules
echo "📁 Copying .cursor/rules..."
mkdir -p "$TEMP_DIR/.cursor"
cp .cursor/rules "$TEMP_DIR/.cursor/" 2>/dev/null || true

# 15. Workflows (if any)
echo "📁 Copying workflows..."
if [ -d ".github/workflows" ]; then
  mkdir -p "$TEMP_DIR/.github/workflows"
  cp -r .github/workflows/* "$TEMP_DIR/.github/workflows/" 2>/dev/null || true
fi

# 16. Package.json and TypeScript config (for context)
echo "📁 Copying build configuration..."
cp astrosetu/package.json "$TEMP_DIR/astrosetu/" 2>/dev/null || true
cp astrosetu/tsconfig.json "$TEMP_DIR/astrosetu/" 2>/dev/null || true
cp astrosetu/next.config.js "$TEMP_DIR/astrosetu/" 2>/dev/null || true
cp astrosetu/next.config.ts "$TEMP_DIR/astrosetu/" 2>/dev/null || true

# 17. Playwright config (for E2E tests)
echo "📁 Copying Playwright configuration..."
cp astrosetu/playwright.config.ts "$TEMP_DIR/astrosetu/" 2>/dev/null || true

# 18. Recent defect fix documents
echo "📁 Copying recent defect fix documents..."
find . -maxdepth 1 -name "*2026-01-18*" -type f | while read file; do
  cp "$file" "$TEMP_DIR/" 2>/dev/null || true
done

# 19. SEO and Production Readiness files
echo "📁 Copying SEO and production readiness files..."
find astrosetu -name "*seo*" -o -name "*SEO*" -o -name "*production*" -o -name "*PRODUCTION*" | grep -v node_modules | head -20 | while read file; do
  if [ -f "$file" ]; then
    rel_path=${file#astrosetu/}
    mkdir -p "$TEMP_DIR/astrosetu/$(dirname "$rel_path")"
    cp "$file" "$TEMP_DIR/astrosetu/$rel_path" 2>/dev/null || true
  fi
done

# 20. Create README for the package
cat > "$TEMP_DIR/README.md" << 'EOF'
# AI Astrology Complete Package
**Generated**: $(date +%Y-%m-%d %H:%M:%S)

## Package Contents

### Feature Slice
- `astrosetu/src/app/ai-astrology/` - All AI Astrology pages and components
- `astrosetu/src/app/api/ai-astrology/` - AI Astrology API routes
- `astrosetu/src/app/api/billing/` - Billing and subscription APIs
- `astrosetu/src/lib/ai-astrology/` - AI Astrology libraries and utilities

### Tests (Full Test Pyramid)
- `astrosetu/tests/unit/` - Unit tests
- `astrosetu/tests/integration/` - Integration tests
- `astrosetu/tests/e2e/` - End-to-end tests

### Documentation
- `DEFECT_REGISTER.md` - Current defect register
- `DEFECT_STATUS_CURRENT.md` - Latest defect status
- `DEFECT_REASSESSMENT_2026-01-18.md` - Recent defect reassessment
- `CURSOR_PROGRESS.md` - Cursor development progress
- `CURSOR_ACTIONS_REQUIRED.md` - Required actions for Cursor
- `CURSOR_AUTOPILOT_PROMPT.md` - Autopilot prompt
- `CURSOR_OPERATIONAL_GUIDE.md` - Operational guide

### Configuration
- `.cursor/rules` - Cursor rules
- `astrosetu/package.json` - Dependencies
- `astrosetu/tsconfig.json` - TypeScript configuration
- `astrosetu/playwright.config.ts` - Playwright E2E configuration

## Recent Fixes (2026-01-18)
- Fixed Free Life Summary loading loop
- Fixed subscription cancel test session error
- Fixed TypeScript build error (input possibly null)
- Added defensive JSON parsing
- Disabled web push service (feature flag)

## Usage
This package is designed for comprehensive testing and review by ChatGPT.
All files are organized to enable holistic analysis of the AI Astrology feature.
EOF

# 21. Create zip file
echo "📦 Creating zip file..."
cd "$TEMP_DIR"
zip -r "$OUTPUT_DIR/$ZIP_NAME" . -q

# Cleanup
cd "$BASE_DIR"
rm -rf "$TEMP_DIR"

echo "✅ Package created: $ZIP_NAME"
echo "📊 File size: $(du -h "$OUTPUT_DIR/$ZIP_NAME" | cut -f1)"
echo ""
echo "📦 Package location: $OUTPUT_DIR/$ZIP_NAME"

