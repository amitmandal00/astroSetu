#!/bin/bash

# Comprehensive script to create a complete zip file of AI Astrology feature
# This includes ALL dependencies: pages, components, layouts, headers, footers, API routes, utilities, middleware, and types

ZIP_NAME="ai-astrology-complete-$(date +%Y%m%d-%H%M%S).zip"
TEMP_DIR=$(mktemp -d)
AI_DIR="$TEMP_DIR/ai-astrology-complete"

mkdir -p "$AI_DIR"

echo "📦 Creating COMPREHENSIVE AI Astrology testing package (including headers, footers, and all dependencies)..."
echo ""

# 1. AI Astrology Pages (all pages)
echo "✅ Copying AI Astrology pages..."
mkdir -p "$AI_DIR/src/app/ai-astrology"
cp -r src/app/ai-astrology/* "$AI_DIR/src/app/ai-astrology/" 2>/dev/null || true

# 2. Root Layout (affects all pages - includes ConditionalShell logic)
echo "✅ Copying root layout..."
mkdir -p "$AI_DIR/src/app"
cp src/app/layout.tsx "$AI_DIR/src/app/" 2>/dev/null || true
cp src/app/globals.css "$AI_DIR/src/app/" 2>/dev/null || true

# 3. Middleware (critical for AI route detection and ConditionalShell)
echo "✅ Copying middleware..."
cp src/middleware.ts "$AI_DIR/src/" 2>/dev/null || true

# 4. Layout Components (Shell, Footer, ConditionalShell, HeaderPattern - ALL used by AI pages)
echo "✅ Copying layout components..."
mkdir -p "$AI_DIR/src/components/layout"
if [ -d "src/components/layout" ]; then
  cp -r src/components/layout/* "$AI_DIR/src/components/layout/" 2>/dev/null || true
fi

# 5. AI Astrology Components (AIHeader, AIFooter, PostPurchaseUpsell, Testimonials, PWAInstallPrompt)
echo "✅ Copying AI Astrology components..."
mkdir -p "$AI_DIR/src/components/ai-astrology"
if [ -d "src/components/ai-astrology" ]; then
  cp -r src/components/ai-astrology/* "$AI_DIR/src/components/ai-astrology/" 2>/dev/null || true
fi

# 6. UI Components (used by AI astrology pages)
echo "✅ Copying UI components (Button, Card, Input, etc.)..."
mkdir -p "$AI_DIR/src/components/ui"
# Copy essential UI components used by AI astrology
for component in Button Card Input Select Badge AutocompleteInput Logo HeaderPattern LoadingSpinner; do
  if [ -f "src/components/ui/${component}.tsx" ]; then
    cp "src/components/ui/${component}.tsx" "$AI_DIR/src/components/ui/" 2>/dev/null || true
  fi
done

# Copy additional UI components that might be used
if [ -d "src/components/ui" ]; then
  # Copy all UI components to be safe
  cp -r src/components/ui/* "$AI_DIR/src/components/ui/" 2>/dev/null || true
fi

# 7. AI Chatbot (used in Shell/layout)
echo "✅ Copying AI components..."
mkdir -p "$AI_DIR/src/components/ai"
if [ -d "src/components/ai" ]; then
  cp -r src/components/ai/* "$AI_DIR/src/components/ai/" 2>/dev/null || true
fi

# 8. AI Astrology API Routes
echo "✅ Copying AI Astrology API routes..."
mkdir -p "$AI_DIR/src/app/api/ai-astrology"
cp -r src/app/api/ai-astrology/* "$AI_DIR/src/app/api/ai-astrology/" 2>/dev/null || true

# 9. AI Astrology Libraries/Utilities
echo "✅ Copying AI Astrology libraries and utilities..."
mkdir -p "$AI_DIR/src/lib/ai-astrology"
cp -r src/lib/ai-astrology/* "$AI_DIR/src/lib/ai-astrology/" 2>/dev/null || true

# 10. Shared Utilities (HTTP client, access restriction, feature flags, etc.)
echo "✅ Copying shared utilities..."
mkdir -p "$AI_DIR/src/lib"
# Essential shared libraries
for lib in http.ts access-restriction.ts feature-flags.ts circuitBreaker.ts astrologyAPI.ts reportCache.ts; do
  if [ -f "src/lib/${lib}" ]; then
    cp "src/lib/${lib}" "$AI_DIR/src/lib/" 2>/dev/null || true
  fi
done

# Copy SEO utilities if used
if [ -f "src/lib/seo.ts" ]; then
  cp "src/lib/seo.ts" "$AI_DIR/src/lib/" 2>/dev/null || true
fi

# Copy Indian cities utility if used
if [ -f "src/lib/indianCities.ts" ]; then
  cp "src/lib/indianCities.ts" "$AI_DIR/src/lib/" 2>/dev/null || true
fi

# 11. Types and Type Definitions
echo "✅ Copying type definitions..."
mkdir -p "$AI_DIR/src/lib/ai-astrology"
# Types are in lib/ai-astrology/types.ts, already copied above

# Copy shared types if they exist
if [ -d "src/types" ]; then
  mkdir -p "$AI_DIR/src/types"
  cp -r src/types/* "$AI_DIR/src/types/" 2>/dev/null || true
fi

# 12. Feature Flags (used by middleware and ConditionalShell)
echo "✅ Copying feature flag configuration..."
if [ -f "src/lib/feature-flags.ts" ]; then
  cp "src/lib/feature-flags.ts" "$AI_DIR/src/lib/" 2>/dev/null || true
fi

# 13. Configuration Files
echo "✅ Copying configuration files..."
# Next.js config (if it has AI-specific settings)
if [ -f "next.config.js" ] || [ -f "next.config.mjs" ] || [ -f "next.config.ts" ]; then
  cp next.config.* "$AI_DIR/" 2>/dev/null || true
fi

# TypeScript config
if [ -f "tsconfig.json" ]; then
  cp tsconfig.json "$AI_DIR/" 2>/dev/null || true
fi

# Package.json (for dependency reference)
if [ -f "package.json" ]; then
  cp package.json "$AI_DIR/" 2>/dev/null || true
fi

# 14. Documentation Files
echo "✅ Copying documentation files..."
mkdir -p "$AI_DIR/docs"
# Copy all relevant markdown files
find . -maxdepth 1 -name "*.md" -type f | while read file; do
  filename=$(basename "$file")
  if [[ "$filename" == *"AI"* ]] || [[ "$filename" == *"astrology"* ]] || [[ "$filename" == *"CHATGPT"* ]] || \
     [[ "$filename" == *"REPORT"* ]] || [[ "$filename" == *"PAYMENT"* ]] || [[ "$filename" == *"BUNDLE"* ]] || \
     [[ "$filename" == *"LOADING"* ]] || [[ "$filename" == *"TIMEOUT"* ]]; then
    cp "$file" "$AI_DIR/docs/" 2>/dev/null || true
  fi
done

# Copy specific documentation files
for doc in CHATGPT_FEEDBACK*.md BUILD_VERIFICATION*.md REPORT_GENERATION*.md PAYMENT*.md BUNDLE*.md \
           LOADING*.md TIMEOUT*.md API_USAGE*.md IDEMPOTENCY*.md; do
  if [ -f "$doc" ]; then
    cp "$doc" "$AI_DIR/docs/" 2>/dev/null || true
  fi
done

# 15. Environment Variables Template
echo "✅ Creating environment variables template..."
cat > "$AI_DIR/.env.example" << 'EOF'
# AI Astrology Configuration
NEXT_PUBLIC_APP_URL=https://www.mindveda.net
NEXT_PUBLIC_RESTRICT_ACCESS=false
BYPASS_PAYMENT_FOR_TEST_USERS=false
AI_ASTROLOGY_DEMO_MODE=false
DISABLE_REPORT_GENERATION=false

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# OpenAI Configuration
OPENAI_API_KEY=sk-...

# Prokerala API (Optional - has fallback)
PROKERALA_API_KEY=your_api_key
PROKERALA_API_SECRET=your_api_secret

# Feature Flags
AI_ONLY_MODE=false

# Google Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
EOF

# 16. Create Comprehensive README for ChatGPT
echo "✅ Creating comprehensive README for ChatGPT..."
cat > "$AI_DIR/README.md" << 'EOF'
# AI Astrology Feature - Complete Testing Package

This is a **COMPREHENSIVE** package containing ALL files related to the AI Astrology feature, including headers, footers, layouts, middleware, and all dependencies for holistic testing.

## 📁 Complete Directory Structure

```
ai-astrology-complete/
├── src/
│   ├── app/
│   │   ├── ai-astrology/          # All AI astrology pages
│   │   │   ├── page.tsx           # Landing page
│   │   │   ├── input/             # Input form page
│   │   │   ├── preview/           # Report preview page (MAIN - most complex)
│   │   │   ├── payment/           # Payment success/cancel pages
│   │   │   ├── bundle/            # Bundle selection page
│   │   │   ├── subscription/      # Subscription page
│   │   │   ├── faq/               # FAQ page
│   │   │   └── year-analysis-2026/ # SEO content page
│   │   ├── api/
│   │   │   └── ai-astrology/      # All API routes
│   │   │       ├── generate-report/    # Report generation (CORE)
│   │   │       ├── create-checkout/    # Stripe checkout creation
│   │   │       ├── verify-payment/     # Payment verification
│   │   │       ├── capture-payment/    # Payment capture
│   │   │       ├── cancel-payment/     # Payment cancellation
│   │   │       ├── daily-guidance/     # Daily guidance endpoint
│   │   │       ├── invoice/            # Invoice generation
│   │   │       └── chargeback-evidence/ # Chargeback handling
│   │   ├── layout.tsx             # Root layout (ConditionalShell logic)
│   │   └── globals.css            # Global styles
│   ├── components/
│   │   ├── ai-astrology/          # AI-specific components
│   │   │   ├── AIHeader.tsx       # AI astrology header
│   │   │   ├── AIFooter.tsx       # AI astrology footer
│   │   │   ├── PostPurchaseUpsell.tsx
│   │   │   ├── Testimonials.tsx
│   │   │   └── PWAInstallPrompt.tsx
│   │   ├── layout/                # Layout components (USED BY ALL PAGES)
│   │   │   ├── Shell.tsx          # Main shell with header/footer
│   │   │   ├── ConditionalShell.tsx # Conditional shell logic
│   │   │   ├── Footer.tsx         # Global footer
│   │   │   └── BottomNav.tsx      # Mobile bottom nav
│   │   ├── ui/                    # UI components (Button, Card, Input, etc.)
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Logo.tsx
│   │   │   ├── HeaderPattern.tsx
│   │   │   └── ... (all UI components)
│   │   └── ai/                    # AI chatbot (used in Shell)
│   │       └── AIChatbot.tsx
│   ├── lib/
│   │   ├── ai-astrology/          # Core AI astrology logic
│   │   │   ├── reportGenerator.ts # AI report generation (OpenAI)
│   │   │   ├── pdfGenerator.ts    # PDF generation (jsPDF)
│   │   │   ├── types.ts           # TypeScript types
│   │   │   ├── testimonials.ts    # Testimonial data
│   │   │   ├── reportCache.ts     # Idempotency cache
│   │   │   └── dailyGuidance.ts   # Daily guidance logic
│   │   ├── http.ts                # HTTP client
│   │   ├── access-restriction.ts  # Access control
│   │   ├── feature-flags.ts       # Feature flags
│   │   ├── circuitBreaker.ts      # Circuit breaker pattern
│   │   ├── astrologyAPI.ts        # Prokerala API wrapper
│   │   ├── seo.ts                 # SEO utilities
│   │   └── indianCities.ts        # City/coordinate lookup
│   └── middleware.ts              # Route detection (critical!)
├── docs/                          # Documentation files
├── .env.example                   # Environment variables template
├── package.json                   # Dependencies reference
├── tsconfig.json                  # TypeScript config
└── README.md                      # This file
```

## 🎯 Key Components & Their Roles

### Layout System (Critical for Understanding)

1. **`src/app/layout.tsx`** - Root layout that:
   - Uses `ConditionalShell` to conditionally render headers/footers
   - Detects AI routes via middleware header (`x-pathname`)
   - Applies `data-ai-route="true"` attribute for styling

2. **`src/middleware.ts`** - Middleware that:
   - Detects AI astrology routes
   - Sets `x-pathname` header for server-side detection
   - Handles route restrictions and feature flags

3. **`src/components/layout/ConditionalShell.tsx`** - Conditional shell that:
   - Checks if route is an AI route
   - For AI routes: Uses `AIHeader` and `AIFooter` (no orange header)
   - For non-AI routes: Uses `Shell` with orange header/footer

4. **`src/components/layout/Shell.tsx`** - Standard shell with:
   - Orange header (saffron gradient)
   - Global navigation
   - `Footer` component
   - AI Chatbot
   - Bottom navigation

5. **`src/components/ai-astrology/AIHeader.tsx`** - AI-specific header:
   - Clean, modern design
   - AI Astrology branding
   - No orange styling

6. **`src/components/ai-astrology/AIFooter.tsx`** - AI-specific footer:
   - Matches AI header design
   - Relevant links for AI astrology

### Core Functionality

1. **Report Generation** (`src/app/api/ai-astrology/generate-report/route.ts`):
   - Handles payment verification
   - Calls OpenAI API with retry logic
   - Implements idempotency (prevents duplicate calls)
   - Captures payment after successful generation
   - Cancels payment on failure

2. **Preview Page** (`src/app/ai-astrology/preview/page.tsx`):
   - Most complex component
   - Handles payment verification recovery
   - Report generation triggering
   - Bundle report handling
   - Loading states with timeout detection
   - Error handling with automatic refund messaging

3. **Payment Flow**:
   - `create-checkout`: Creates Stripe session with manual capture
   - `verify-payment`: Verifies payment status
   - `capture-payment`: Captures authorized payment (non-blocking)
   - `cancel-payment`: Cancels/refunds payment (non-blocking)

## 🔑 Critical Technical Details

### Layout Detection Flow

```
User visits /ai-astrology/preview
  ↓
middleware.ts detects AI route
  ↓
Sets x-pathname header
  ↓
layout.tsx reads header
  ↓
ConditionalShell checks if AI route
  ↓
Renders AIHeader + AIFooter (no orange header)
```

### Payment Flow

```
1. User fills input form → Creates checkout session (manual capture)
2. User completes payment → Redirected to /payment/success
3. Payment success page → Verifies payment → Redirects to /preview?auto_generate=true
4. Preview page → Detects auto_generate → Verifies payment → Triggers report generation
5. Report generation succeeds → Captures payment (fire-and-forget)
6. Report generation fails → Cancels payment (fire-and-forget)
```

### Report Generation Flow

```
1. Client calls generate-report API with payment token
2. API verifies payment token
3. API checks idempotency cache (prevents duplicate OpenAI calls)
4. API calls OpenAI (with retry logic for rate limits)
5. API generates report content
6. API captures payment (non-blocking)
7. API returns reportId + redirectUrl
8. Client navigates to redirectUrl
9. Preview page loads report from sessionStorage
```

### Error Handling

- **Payment failures**: Automatic cancellation/refund
- **Report generation failures**: Automatic payment cancellation
- **Rate limits**: Exponential backoff with 60s minimum wait
- **Timeouts**: Client-side timeout detection (30s/100s/120s)
- **Session loss**: URL parameter fallback (`session_id`, `reportId`)

## 🧪 Comprehensive Testing Scenarios

### 1. Layout & UI Testing
- [ ] AI routes show AIHeader/AIFooter (no orange header)
- [ ] Non-AI routes show Shell with orange header
- [ ] Header/footer navigation works correctly
- [ ] Mobile responsive design works
- [ ] Bottom navigation appears on mobile

### 2. Payment Flow Testing
- [ ] Free report (life-summary) works without payment
- [ ] Paid report → Checkout → Payment → Success redirect
- [ ] Payment success page verifies and auto-generates
- [ ] Payment capture happens after successful generation
- [ ] Payment cancellation happens on generation failure
- [ ] Duplicate capture/cancel attempts handled gracefully

### 3. Report Generation Testing
- [ ] Single report generation (all 7 types)
- [ ] Bundle report generation (parallel processing)
- [ ] Idempotency prevents duplicate OpenAI calls
- [ ] Cache returns existing reports
- [ ] Rate limit retry logic works
- [ ] Timeout detection works (30s/100s/120s)
- [ ] Loading states show progress and elapsed time

### 4. Error Handling Testing
- [ ] Payment verification failure → Recovery option
- [ ] Report generation failure → Auto refund message
- [ ] Rate limit → Retry with backoff
- [ ] Timeout → Error message with refund info
- [ ] Session storage loss → URL parameter recovery
- [ ] Prokerala credit exhaustion → Fallback data

### 5. Edge Cases
- [ ] Multiple rapid clicks → Request locking prevents duplicates
- [ ] Page refresh during generation → Recovery option
- [ ] Browser back button → Handles gracefully
- [ ] Mobile session storage loss → URL param fallback
- [ ] Bundle partial failure → Shows successful reports
- [ ] Concurrent bundle generation → Proper locking

## 📊 Key Metrics to Monitor

1. **Payment Capture Rate**: Should be 100% after successful generation
2. **Refund Rate**: Should match failure rate (automatic)
3. **Report Generation Success Rate**: Monitor OpenAI API success
4. **Timeout Rate**: Should be < 5% (client-side timeout detection)
5. **Duplicate API Calls**: Should be 0% (idempotency)
6. **Rate Limit Hits**: Monitor and adjust retry logic if needed

## 🔧 Environment Variables

See `.env.example` for required variables. Key ones:
- `NEXT_PUBLIC_APP_URL`: Domain-only URL (no path)
- `BYPASS_PAYMENT_FOR_TEST_USERS`: Set to `false` for production testing
- `DISABLE_REPORT_GENERATION`: Kill switch for emergencies

## 🚨 Known Issues & Fixes

See `docs/` directory for:
- `CHATGPT_FEEDBACK_FIXES.md` - Recent fixes
- `REPORT_GENERATION_*.md` - Generation implementation
- `PAYMENT_*.md` - Payment flow details
- `LOADING_*.md` - Loading state improvements
- `API_USAGE_*.md` - Idempotency and caching

## 📝 Testing Checklist

### Critical Paths
- [ ] Free report generation (no payment)
- [ ] Paid report generation (full flow)
- [ ] Bundle report generation (parallel)
- [ ] Payment failure handling
- [ ] Report generation failure handling
- [ ] Timeout detection and handling
- [ ] Session storage recovery
- [ ] Layout switching (AI vs non-AI routes)

### UI/UX
- [ ] Loading states are informative
- [ ] Error messages are clear
- [ ] Payment protection messaging is visible
- [ ] Progress indicators work correctly
- [ ] Mobile experience is smooth

### Performance
- [ ] Idempotency prevents duplicate calls
- [ ] Caching works correctly
- [ ] Timeouts are appropriate
- [ ] Bundle generation is parallel

---

**Generated**: $(date)
**Version**: Complete package with all dependencies
**Includes**: Headers, footers, layouts, middleware, API routes, components, utilities, types, documentation

EOF

# 17. Create a file manifest
echo "✅ Creating comprehensive file manifest..."
find "$AI_DIR" -type f | sort > "$AI_DIR/FILES_MANIFEST.txt"

# 18. Create dependency list
echo "✅ Creating dependency reference..."
if [ -f "package.json" ]; then
  cat package.json | grep -A 100 '"dependencies"' | head -50 > "$AI_DIR/DEPENDENCIES_REFERENCE.txt" 2>/dev/null || true
fi

# 19. Create the zip file
echo ""
echo "📦 Compressing files into zip..."
cd "$TEMP_DIR"
zip -r "$ZIP_NAME" ai-astrology-complete -q
mv "$ZIP_NAME" "$OLDPWD/"
cd "$OLDPWD"

# 20. Cleanup
rm -rf "$TEMP_DIR"

echo ""
echo "✅ Complete! Comprehensive zip file created: $ZIP_NAME"
echo ""
echo "📊 Package Statistics:"
if [ -d "$AI_DIR" ]; then
  echo "   - Pages: $(find "$AI_DIR/src/app/ai-astrology" -type f \( -name "*.tsx" -o -name "*.ts" \) 2>/dev/null | wc -l | tr -d ' ')"
  echo "   - API Routes: $(find "$AI_DIR/src/app/api/ai-astrology" -type f -name "*.ts" 2>/dev/null | wc -l | tr -d ' ')"
  echo "   - Components: $(find "$AI_DIR/src/components" -type f \( -name "*.tsx" -o -name "*.ts" \) 2>/dev/null | wc -l | tr -d ' ')"
  echo "   - Libraries: $(find "$AI_DIR/src/lib" -type f -name "*.ts" 2>/dev/null | wc -l | tr -d ' ')"
  echo "   - Layout Components: $(find "$AI_DIR/src/components/layout" -type f 2>/dev/null | wc -l | tr -d ' ')"
  echo "   - UI Components: $(find "$AI_DIR/src/components/ui" -type f 2>/dev/null | wc -l | tr -d ' ')"
  echo "   - Documentation: $(find "$AI_DIR/docs" -type f 2>/dev/null | wc -l | tr -d ' ')"
  echo "   - Total Files: $(find "$AI_DIR" -type f 2>/dev/null | wc -l | tr -d ' ')"
fi
echo ""
echo "📍 Zip file location: $(pwd)/$ZIP_NAME"
echo "📦 File size: $(du -h "$ZIP_NAME" 2>/dev/null | cut -f1 || echo 'N/A')"
echo ""
echo "🎯 Ready for ChatGPT comprehensive holistic testing!"
echo ""
echo "📋 What's Included:"
echo "   ✅ All AI Astrology pages"
echo "   ✅ All API routes"
echo "   ✅ Headers & Footers (AIHeader, AIFooter, Shell, Footer)"
echo "   ✅ Layout system (ConditionalShell, middleware)"
echo "   ✅ All UI components"
echo "   ✅ Core libraries and utilities"
echo "   ✅ Type definitions"
echo "   ✅ Documentation"
echo "   ✅ Configuration files"
echo ""

