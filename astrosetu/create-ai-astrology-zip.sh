#!/bin/bash

# Script to create a comprehensive zip file of AI Astrology feature for ChatGPT testing
# This includes all pages, components, API routes, utilities, and related files

ZIP_NAME="ai-astrology-complete-testing-$(date +%Y%m%d-%H%M%S).zip"
TEMP_DIR=$(mktemp -d)
AI_DIR="$TEMP_DIR/ai-astrology-complete"

mkdir -p "$AI_DIR"

echo "📦 Creating comprehensive AI Astrology testing package..."
echo ""

# 1. AI Astrology Pages
echo "✅ Copying AI Astrology pages..."
mkdir -p "$AI_DIR/src/app/ai-astrology"
cp -r src/app/ai-astrology/* "$AI_DIR/src/app/ai-astrology/" 2>/dev/null || true

# 2. AI Astrology Components (including AIHeader, AIFooter, PWAInstallPrompt)
echo "✅ Copying AI Astrology components..."
mkdir -p "$AI_DIR/src/components/ai-astrology"
if [ -d "src/components/ai-astrology" ]; then
  cp -r src/components/ai-astrology/* "$AI_DIR/src/components/ai-astrology/" 2>/dev/null || true
fi

# 3. AI Astrology API Routes
echo "✅ Copying AI Astrology API routes..."
mkdir -p "$AI_DIR/src/app/api/ai-astrology"
cp -r src/app/api/ai-astrology/* "$AI_DIR/src/app/api/ai-astrology/" 2>/dev/null || true

# 4. AI Astrology Libraries/Utilities
echo "✅ Copying AI Astrology libraries and utilities..."
mkdir -p "$AI_DIR/src/lib/ai-astrology"
cp -r src/lib/ai-astrology/* "$AI_DIR/src/lib/ai-astrology/" 2>/dev/null || true

# 5. Shared Layout Files (affect AI astrology pages)
echo "✅ Copying shared layout and metadata files..."
mkdir -p "$AI_DIR/src/app"
cp src/app/layout.tsx "$AI_DIR/src/app/" 2>/dev/null || true
# Copy AI astrology layout
if [ -f "src/app/ai-astrology/layout.tsx" ]; then
  cp src/app/ai-astrology/layout.tsx "$AI_DIR/src/app/ai-astrology/" 2>/dev/null || true
fi

# 6. Layout Components (Shell, Footer, HeaderPattern, ConditionalShell - affect AI astrology pages)
echo "✅ Copying layout components (Shell, Footer, etc.)..."
mkdir -p "$AI_DIR/src/components/layout"
if [ -d "src/components/layout" ]; then
  cp -r src/components/layout/* "$AI_DIR/src/components/layout/" 2>/dev/null || true
fi
# Copy HeaderPattern if it exists separately
if [ -f "src/components/ui/HeaderPattern.tsx" ]; then
  mkdir -p "$AI_DIR/src/components/ui"
  cp src/components/ui/HeaderPattern.tsx "$AI_DIR/src/components/ui/" 2>/dev/null || true
fi
# Copy ErrorBoundary if it exists
if [ -f "src/components/ErrorBoundary.tsx" ]; then
  cp src/components/ErrorBoundary.tsx "$AI_DIR/src/components/" 2>/dev/null || true
fi

# 7. Shared Utilities (HTTP client, types, etc.)
echo "✅ Copying shared utilities..."
mkdir -p "$AI_DIR/src/lib"
# Copy essential shared libraries that AI astrology depends on
if [ -f "src/lib/http.ts" ]; then
  cp src/lib/http.ts "$AI_DIR/src/lib/" 2>/dev/null || true
fi
if [ -d "src/lib/access-restriction.ts" ] || [ -f "src/lib/access-restriction.ts" ]; then
  cp src/lib/access-restriction.ts "$AI_DIR/src/lib/" 2>/dev/null || true
fi

# 8. Types and Shared Types
echo "✅ Copying type definitions..."
if [ -f "src/types/ai-astrology.ts" ]; then
  mkdir -p "$AI_DIR/src/types"
  cp src/types/ai-astrology.ts "$AI_DIR/src/types/" 2>/dev/null || true
fi
# Copy shared types that might be used
if [ -d "src/types" ]; then
  mkdir -p "$AI_DIR/src/types"
  cp -r src/types/* "$AI_DIR/src/types/" 2>/dev/null || true
fi

# 9. Configuration and Documentation
echo "✅ Copying documentation and configuration files..."
mkdir -p "$AI_DIR/docs"
# Copy all relevant markdown files
find . -maxdepth 1 -name "*.md" -type f | while read file; do
  filename=$(basename "$file")
  if [[ "$filename" == *"AI"* ]] || [[ "$filename" == *"astrology"* ]] || [[ "$filename" == *"CHATGPT"* ]] || [[ "$filename" == *"REPORT"* ]] || [[ "$filename" == *"PAYMENT"* ]]; then
    cp "$file" "$AI_DIR/docs/" 2>/dev/null || true
  fi
done

# Copy specific documentation files
for doc in CHATGPT_FEEDBACK_FIXES.md BUILD_VERIFICATION_REPORT.md REPORT_GENERATION*.md PAYMENT*.md BUNDLE*.md; do
  if [ -f "$doc" ]; then
    cp "$doc" "$AI_DIR/docs/" 2>/dev/null || true
  fi
done

# 10. Environment variable template
echo "✅ Creating environment variables template..."
cat > "$AI_DIR/.env.example" << 'EOF'
# AI Astrology Configuration
NEXT_PUBLIC_APP_URL=https://www.mindveda.net
NEXT_PUBLIC_RESTRICT_ACCESS=false
BYPASS_PAYMENT_FOR_TEST_USERS=false

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# OpenAI Configuration
OPENAI_API_KEY=sk-...

# Prokerala API (Optional - has fallback)
PROKERALA_API_KEY=your_api_key
PROKERALA_API_SECRET=your_api_secret
EOF

# 11. Create README for ChatGPT
echo "✅ Creating README for ChatGPT..."
cat > "$AI_DIR/README.md" << 'EOF'
# AI Astrology Feature - Complete Testing Package

This package contains all files related to the AI Astrology feature for comprehensive testing.

## 📁 Directory Structure

```
ai-astrology-complete/
├── src/
│   ├── app/
│   │   ├── ai-astrology/          # All AI astrology pages
│   │   │   ├── page.tsx           # Landing page
│   │   │   ├── input/             # Input form page
│   │   │   ├── preview/           # Report preview page
│   │   │   ├── payment/           # Payment success/cancel pages
│   │   │   ├── bundle/            # Bundle selection page
│   │   │   ├── subscription/      # Subscription page
│   │   │   ├── faq/               # FAQ page
│   │   │   └── year-analysis-2026/ # SEO content page
│   │   ├── api/
│   │   │   └── ai-astrology/      # All API routes
│   │   │       ├── generate-report/    # Report generation endpoint
│   │   │       ├── create-checkout/    # Stripe checkout creation
│   │   │       ├── verify-payment/     # Payment verification
│   │   │       ├── capture-payment/    # Payment capture
│   │   │       ├── cancel-payment/     # Payment cancellation
│   │   │       └── daily-guidance/     # Daily guidance endpoint
│   │   └── layout.tsx             # Root layout (affects all pages)
│   ├── components/
│   │   └── ai-astrology/          # AI astrology components
│   │       ├── PostPurchaseUpsell.tsx
│   │       └── Testimonials.tsx
│   └── lib/
│       └── ai-astrology/          # Core logic and utilities
│           ├── reportGenerator.ts # AI report generation
│           ├── pdfGenerator.ts    # PDF generation
│           ├── types.ts           # TypeScript types
│           └── testimonials.ts    # Testimonial data
├── docs/                          # Documentation files
└── .env.example                   # Environment variables template
```

## 🎯 Key Features to Test

### 1. Payment Flow
- Stripe checkout creation
- Payment verification
- Manual payment capture (after report generation)
- Automatic payment cancellation/refund on failure

### 2. Report Generation
- Single report generation (7 report types)
- Bundle report generation (parallel processing)
- OpenAI API integration with retry logic
- Prokerala API integration with circuit breaker fallback

### 3. User Experience
- Input form validation
- Payment success → report generation flow
- Report preview and display
- PDF download (single and bundle)
- Post-purchase upsell modal

### 4. Error Handling
- Payment failures → automatic refund
- Report generation failures → payment cancellation
- Rate limit handling with exponential backoff
- Session storage fallback (URL parameters)

### 5. Navigation & Redirects
- Payment success → preview page redirect
- Report generation → preview page with reportId
- Session storage → URL parameter fallback

## 🔑 Key Technical Details

### Report ID Management
- **Single Canonical ID**: `data.reportId` is the only reportId (not in content)
- **Navigation**: Uses `redirectUrl` from API response directly
- **Storage**: Content stored in sessionStorage with canonical reportId

### Payment Flow
- **Manual Capture**: Payments authorized but not captured until report succeeds
- **Automatic Cancellation**: Failed reports → automatic payment cancellation
- **Idempotency**: Handles duplicate capture/cancel attempts gracefully

### Rate Limiting
- **OpenAI**: Exponential backoff with 60s minimum wait
- **Prokerala**: Circuit breaker with fallback to mock data

### Bundle Reports
- **Parallel Generation**: All reports generated simultaneously
- **Partial Success**: Shows successful reports even if some fail
- **Individual Timeouts**: Each report has its own timeout (95s)

## 🧪 Testing Scenarios

1. **Free Report Flow**: Life Summary (no payment)
2. **Paid Report Flow**: Single report → Payment → Generation → Preview
3. **Bundle Flow**: Bundle selection → Payment → Parallel generation → Preview
4. **Payment Failure**: Declined card → Error message → No charge
5. **Report Failure**: Payment succeeds → Generation fails → Auto refund
6. **Rate Limit**: OpenAI rate limit → Retry with backoff → Success
7. **Session Loss**: Mobile browser → sessionStorage lost → URL param recovery
8. **Bundle Partial Failure**: 3 reports → 2 succeed → Show successful ones

## 📝 Environment Variables Required

See `.env.example` for required environment variables.

## 🚀 Quick Test Checklist

- [ ] Landing page loads and displays correctly
- [ ] Input form validates and submits
- [ ] Payment checkout redirects to Stripe
- [ ] Payment success page verifies and redirects
- [ ] Report generates and displays correctly
- [ ] PDF downloads work (single and bundle)
- [ ] Error messages are user-friendly
- [ ] Payment is captured only after successful generation
- [ ] Failed generation triggers automatic refund
- [ ] Bundle reports show partial success correctly

## 📚 Additional Documentation

See `docs/` directory for:
- `CHATGPT_FEEDBACK_FIXES.md` - Recent fixes based on feedback
- `REPORT_GENERATION_*.md` - Report generation implementation details
- `PAYMENT_*.md` - Payment flow documentation
- `BUNDLE_*.md` - Bundle report documentation

---

**Generated**: $(date)
**Version**: Latest (includes ChatGPT feedback fixes)
EOF

# 12. Create a file list for reference
echo "✅ Creating file manifest..."
find "$AI_DIR" -type f | sort > "$AI_DIR/FILES_MANIFEST.txt"

# 13. Create the zip file
echo ""
echo "📦 Compressing files into zip..."
cd "$TEMP_DIR"
zip -r "$ZIP_NAME" ai-astrology-complete -q
mv "$ZIP_NAME" "$OLDPWD/"
cd "$OLDPWD"

# 14. Cleanup
rm -rf "$TEMP_DIR"

echo ""
echo "✅ Complete! Zip file created: $ZIP_NAME"
echo ""
echo "📊 Package Statistics:"
if [ -d "$AI_DIR" ]; then
  echo "   - Pages: $(find "$AI_DIR/src/app/ai-astrology" -type f \( -name "*.tsx" -o -name "*.ts" \) 2>/dev/null | wc -l | tr -d ' ')"
  echo "   - API Routes: $(find "$AI_DIR/src/app/api/ai-astrology" -type f -name "*.ts" 2>/dev/null | wc -l | tr -d ' ')"
  echo "   - Components: $(find "$AI_DIR/src/components/ai-astrology" -type f -name "*.tsx" 2>/dev/null | wc -l | tr -d ' ')"
  echo "   - Libraries: $(find "$AI_DIR/src/lib/ai-astrology" -type f -name "*.ts" 2>/dev/null | wc -l | tr -d ' ')"
  echo "   - Layout Components: $(find "$AI_DIR/src/components/layout" -type f 2>/dev/null | wc -l | tr -d ' ')"
  echo "   - Documentation: $(find "$AI_DIR/docs" -type f 2>/dev/null | wc -l | tr -d ' ')"
  echo "   - Total Files: $(find "$AI_DIR" -type f 2>/dev/null | wc -l | tr -d ' ')"
fi
echo ""
echo "📍 Zip file location: $(pwd)/$ZIP_NAME"
echo "📦 File size: $(du -h "$ZIP_NAME" 2>/dev/null | cut -f1 || echo 'N/A')"
echo ""
echo "🎯 Ready for ChatGPT comprehensive testing!"

