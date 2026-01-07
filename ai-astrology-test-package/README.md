# AstroSetu AI Section - Test Package

This package contains all files related to the AI Astrology section and footer/legal pages for ChatGPT testing.

## 📁 Package Structure

```
ai-astrology-test-package/
├── app/                   # Next.js App Router pages
│   ├── page.tsx           # Main AI landing page (/ai-astrology)
│   ├── layout.tsx         # AI section layout
│   ├── input/             # Birth details input form
│   ├── preview/           # Report preview page
│   ├── bundle/            # Bundle selection page
│   ├── subscription/      # Subscription page
│   ├── faq/               # FAQ page
│   ├── payment/           # Payment success/cancel pages
│   └── api/               # API routes (Next.js App Router)
│       ├── ai-astrology/  # AI section API endpoints
│       │   ├── create-checkout/route.ts
│       │   ├── verify-payment/route.ts
│       │   ├── generate-report/route.ts
│       │   ├── daily-guidance/route.ts
│       │   ├── invoice/route.ts
│       │   └── chargeback-evidence/route.ts
│       └── contact/       # Contact form API
│           └── route.ts  # POST /api/contact handler ✅
├── components/            # AI-specific components
│   ├── AIHeader.tsx       # AI section header
│   ├── AIFooter.tsx       # AI section footer
│   ├── PWAInstallPrompt.tsx  # PWA install prompt
│   └── ConditionalShell.tsx  # Conditional shell component
├── lib/                   # AI section libraries
│   ├── payments.ts        # Pricing and payment config
│   ├── reportGenerator.ts # Report generation logic
│   ├── pdfGenerator.ts    # PDF generation
│   ├── prompts.ts         # AI prompts
│   ├── types.ts          # TypeScript types
│   ├── invoice.ts        # Invoice generation
│   ├── chargeback-defense.ts  # Chargeback defense
│   ├── dailyGuidance.ts  # Daily guidance
│   ├── paymentToken.ts   # Payment token handling
│   └── contactConfig.ts  # Contact configuration
├── footer-pages/         # Legal/compliance pages
│   ├── privacy.tsx       # Privacy policy
│   ├── terms.tsx          # Terms & conditions
│   ├── compliance.tsx     # Compliance page
│   ├── contact.tsx        # Contact page (frontend)
│   ├── disputes.tsx       # Disputes page
│   ├── data-breach.tsx    # Data breach notification
│   ├── disclaimer.tsx     # Legal disclaimer
│   ├── refund.tsx         # Refund policy
│   └── cookies.tsx        # Cookie policy
└── Documentation/         # Setup and configuration docs
    ├── RESEND_SENDER_LOCK.md
    ├── INVOICE_AND_STRIPE_SETUP.md
    ├── CHARGEBACK_DEFENSE.md
    └── PAYMENT_FLOW_ENHANCEMENT.md
```

## ✅ API Route Structure (Fixed)

### Contact Form API Route
**✅ CORRECT STRUCTURE:**
```
app/api/contact/route.ts  →  POST /api/contact
```

**❌ WRONG (old structure):**
```
api/contact-route.ts  →  Does NOT map to /api/contact
```

### Next.js App Router Convention
In Next.js App Router (used by Vercel), API routes must follow this structure:
- Route: `/api/contact`
- File: `app/api/contact/route.ts` ✅

The file must be named `route.ts` inside a folder matching the URL path.

## 🔑 Key Features

### AI Astrology Section
- **Landing Page**: Hero section with Year Analysis Report, bundles, and individual reports
- **Input Form**: Birth details collection (name, DOB, time, location)
- **Preview Page**: Content-gated report preview (35% free, rest requires payment)
- **Bundle Selection**: Choose reports for bundle purchases
- **Payment Flow**: Stripe integration with 50 cent testing prices
- **PWA Support**: Service worker, offline support, install prompt

### Payment System
- **Stripe Integration**: Checkout sessions with locked currency (AUD)
- **Pricing**: All reports and bundles set to 50 cents for testing
- **Metadata**: Comprehensive payment metadata (report_type, user_id, timestamp)
- **Statement Descriptor**: "ASTROSETU AI"

### Email System
- **Resend Only**: All emails sent via Resend API (SMTP removed)
- **Locked Sender Identity**:
  - From: "AstroSetu AI" <no-reply@mindveda.net>
  - Reply-To: privacy@mindveda.net
- **Contact Form**: Regulatory request form with database storage
- **API Route**: `app/api/contact/route.ts` → `/api/contact` ✅

### Legal Pages
- **Privacy Policy**: GDPR/CCPA compliant
- **Terms & Conditions**: Service terms
- **Compliance**: Regulatory compliance information
- **Contact**: Regulatory request form (frontend: `footer-pages/contact.tsx`)
- **Disputes**: Dispute resolution process
- **Data Breach**: Data breach notification procedures
- **Disclaimer**: Legal disclaimer for AI-generated content
- **Refund Policy**: No-refund policy for digital products
- **Cookie Policy**: Cookie usage information

## 🚀 Testing Checklist

### API Route Verification
- [x] Contact API route: `app/api/contact/route.ts` → `/api/contact` ✅
- [x] Frontend calls: `/api/contact` ✅
- [x] Route structure matches Next.js App Router convention ✅

### AI Section Pages
- [ ] `/ai-astrology` - Landing page loads correctly
- [ ] `/ai-astrology/input` - Form validation works
- [ ] `/ai-astrology/preview` - Content gating (35% free)
- [ ] `/ai-astrology/bundle` - Bundle selection works
- [ ] `/ai-astrology/payment/success` - Success page
- [ ] `/ai-astrology/payment/cancel` - Cancel page
- [ ] `/ai-astrology/faq` - FAQ page loads

### Payment Flow
- [ ] Stripe checkout creation
- [ ] Payment verification
- [ ] Report generation after payment
- [ ] Invoice generation
- [ ] Chargeback evidence generation

### Email System
- [ ] Contact form submission to `/api/contact`
- [ ] Email sending via Resend
- [ ] Sender identity locked correctly
- [ ] Reply-To set to privacy@mindveda.net

### Legal Pages
- [ ] All footer pages load correctly
- [ ] Links work properly
- [ ] Email addresses correct (@mindveda.net)
- [ ] ABN displayed (60 656 401 253)
- [ ] Business structure (Sole Trader)

## 📝 Environment Variables Required

**For Local Development (.env.local):**
```env
# Resend Email (Required)
RESEND_API_KEY=re_your_api_key_here

# Optional (uses defaults if not set)
RESEND_FROM_EMAIL=no-reply@mindveda.net
RESEND_FROM_NAME=AstroSetu AI
RESEND_REPLY_TO=privacy@mindveda.net
```

# Stripe
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx

# Supabase (for contact form storage)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

## 🔧 Key Configuration Files

### Pricing (`lib/payments.ts`)
- All individual reports: 50 cents AUD
- All bundles: 50 cents AUD
- Currency: Hardcoded to "aud"
- Description format: "AstroSetu AI – {Report Name}"

### Email Sender (`app/api/contact/route.ts`)
- **Route**: POST `/api/contact` ✅
- **File Location**: `app/api/contact/route.ts` ✅
- Locked sender: "AstroSetu AI" <no-reply@mindveda.net>
- Locked reply-to: privacy@mindveda.net
- Only Resend API (SMTP removed)

### Stripe Checkout (`app/api/ai-astrology/create-checkout/route.ts`)
- Currency: Hardcoded to "aud"
- Statement descriptor: "ASTROSETU AI"
- Metadata: report_type, user_id, timestamp

## 📚 Documentation

See included markdown files for:
- **RESEND_SENDER_LOCK.md**: Email sender identity configuration
- **INVOICE_AND_STRIPE_SETUP.md**: Invoice and Stripe receipt setup
- **CHARGEBACK_DEFENSE.md**: Chargeback defense procedures
- **PAYMENT_FLOW_ENHANCEMENT.md**: Payment flow details

## 🎯 Business Information

- **Business Name**: MindVeda
- **ABN**: 60 656 401 253
- **Business Structure**: Sole Trader
- **Jurisdiction**: Australia (Primary). India (Operational support only). All legal matters are governed by Australian law.
- **Email Domain**: @mindveda.net
  - privacy@mindveda.net
  - legal@mindveda.net
  - support@mindveda.net
  - security@mindveda.net

## ⚠️ Important Notes

1. **API Route Structure**: Must use Next.js App Router convention
   - ✅ `app/api/contact/route.ts` → `/api/contact`
   - ❌ `api/contact-route.ts` → Does NOT work
2. **Pricing**: All prices set to 50 cents AUD for testing
3. **Email**: Domain `mindveda.net` must be verified in Resend
4. **Stripe**: Test mode keys required for testing
5. **Content Gating**: Preview shows 35% of content before payment
6. **No Refunds**: Digital products - no refunds after access

## 🔍 Verification

### Step 1: Frontend
- ✅ Contact form (`footer-pages/contact.tsx`) sends to: `/api/contact`

### Step 2: Backend
- ✅ API handler located at: `app/api/contact/route.ts`
- ✅ File structure matches Next.js App Router: `app/api/contact/route.ts` → `/api/contact`
- ✅ Route exports `POST` handler correctly

### Step 3: Email Configuration
- ✅ Sender locked: "AstroSetu AI" <no-reply@mindveda.net>
- ✅ Reply-To locked: privacy@mindveda.net
- ✅ Only Resend API (no SMTP)

---

**Last Updated**: 2025-01-29
**Package Version**: 1.1.0
**Status**: ✅ API Route Structure Fixed

