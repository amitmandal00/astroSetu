# Complete Navigation Map - AI Section

## 🗺️ Route Structure

```
/ai-astrology (Landing Page)
├── /ai-astrology/input (Input Form)
│   ├── ?reportType=life-summary
│   ├── ?reportType=marriage-timing
│   ├── ?reportType=career-money
│   ├── ?reportType=full-life
│   ├── ?reportType=year-analysis
│   ├── ?reportType=major-life-phase
│   ├── ?reportType=decision-support
│   └── ?bundle=<type>&reports=<types>
├── /ai-astrology/preview (Preview Page)
│   └── ?reportType=<type>
├── /ai-astrology/bundle (Bundle Selection)
│   ├── ?type=any-2
│   ├── ?type=all-3
│   └── ?type=life-decision-pack
├── /ai-astrology/faq (FAQ Page)
├── /ai-astrology/subscription (Subscription Page)
└── /ai-astrology/payment
    ├── /success (Payment Success)
    └── /cancel (Payment Cancel)
```

## 🔗 Header Links

### Main Header
- **Logo**: `/ai-astrology` (home)
- **"Generate Report" Button**: `/ai-astrology/input?reportType=life-summary`

## 🔗 Footer Links

### Left Column (Brand)
- **Logo**: `/ai-astrology` (home)

### Right Column (Legal Links)

#### Main Legal Links
1. **FAQ**: `/ai-astrology/faq`
2. **Privacy Policy**: `/privacy`
3. **Terms of Use**: `/terms`
4. **Disclaimer**: `/disclaimer`
5. **Refund Policy**: `/refund`
6. **Cookie Policy**: `/cookies`

#### Additional Information (Desktop)
1. **Contact & Legal Info**: `/contact`
2. **Data Breach Policy**: `/data-breach`
3. **Dispute Resolution**: `/disputes`

#### Contact Emails
- **Privacy & Data Protection**: `privacy@mindveda.net`
- **Legal & Compliance**: `legal@mindveda.net`
- **Security Reporting**: `security@mindveda.net`

## 🎯 Landing Page Links

### Hero Section
- **"Get My Year Analysis" Button**: `/ai-astrology/input?reportType=year-analysis`

### Report Cards
- **Life Summary (Free)**: `/ai-astrology/input?reportType=life-summary`
- **Marriage Timing**: `/ai-astrology/input?reportType=marriage-timing`
- **Career & Money**: `/ai-astrology/input?reportType=career-money`
- **Full Life**: `/ai-astrology/input?reportType=full-life`
- **Year Analysis**: `/ai-astrology/input?reportType=year-analysis`
- **Major Life Phase**: `/ai-astrology/input?reportType=major-life-phase`
- **Decision Support**: `/ai-astrology/input?reportType=decision-support`

### Bundle Cards
- **Life Decision Pack**: `/ai-astrology/bundle?type=life-decision-pack`
- **All 3 Reports**: `/ai-astrology/bundle?type=all-3`
- **Any 2 Reports**: `/ai-astrology/bundle?type=any-2`

### Final CTA
- **"Get Started with a Free Summary"**: `/ai-astrology/input?reportType=life-summary`
- **"Monthly Astrology Outlook" (Subscription)**: `/ai-astrology/subscription`

## 🔄 Navigation Flows

### Flow 1: Single Report Purchase
```
/ai-astrology 
  → /ai-astrology/input?reportType=<type>
    → /ai-astrology/preview?reportType=<type>
      → Stripe Checkout
        → /ai-astrology/payment/success
```

### Flow 2: Bundle Purchase
```
/ai-astrology
  → /ai-astrology/bundle?type=<bundle-type>
    → /ai-astrology/input?bundle=<type>&reports=<types>
      → /ai-astrology/preview?reportType=<type>
        → Stripe Checkout
          → /ai-astrology/payment/success
```

### Flow 3: Free Report
```
/ai-astrology
  → /ai-astrology/input?reportType=life-summary
    → /ai-astrology/preview?reportType=life-summary
      → Download PDF (no payment)
```

## 📍 Query Parameters

### Input Form Parameters
- `reportType`: Report type to generate
  - `life-summary` (Free)
  - `marriage-timing`
  - `career-money`
  - `full-life`
  - `year-analysis`
  - `major-life-phase`
  - `decision-support`
- `bundle`: Bundle type (if bundle purchase)
  - `any-2`
  - `all-3`
  - `life-decision-pack`
- `reports`: Comma-separated report types (for bundles)
  - Example: `reports=marriage-timing,career-money`

### Preview Parameters
- `reportType`: Type of report to preview
- `paymentId`: Stripe payment intent ID (after payment)

### Bundle Parameters
- `type`: Bundle type
  - `any-2`: Any 2 reports bundle
  - `all-3`: All 3 reports bundle
  - `life-decision-pack`: Life Decision Pack bundle

### Payment Success Parameters
- `payment_intent`: Stripe payment intent ID
- `payment_intent_client_secret`: Stripe client secret

## 🔐 Protected Routes

### Routes That Require Payment
- `/ai-astrology/preview` (paid reports only)
- `/ai-astrology/payment/success` (after successful payment)

### Routes That Are Public
- `/ai-astrology` (landing)
- `/ai-astrology/input`
- `/ai-astrology/bundle`
- `/ai-astrology/faq`
- `/ai-astrology/subscription`
- All legal pages (`/privacy`, `/terms`, etc.)

## 🔄 Redirect Rules

### From Root
- `/` → Should not show Shell header (uses AI layout logic)

### From Non-AI Routes
- Any route that starts with `/ai-astrology` uses AI layout
- Legal pages (`/privacy`, `/terms`, etc.) use AI layout

### Payment Redirects
- Successful payment → `/ai-astrology/payment/success`
- Cancelled payment → `/ai-astrology/payment/cancel`
- Failed payment → `/ai-astrology/preview?error=payment_failed`

## 📱 Mobile-Specific Navigation

### Mobile Footer
- Legal links section is **collapsible**
- Click "Legal & Policies" to expand/collapse
- Shows "+" when closed, "−" when open

### Mobile Header
- Logo and button remain visible
- Sub-header banner stacks vertically

## 🧪 Test Navigation Paths

### Quick Smoke Test Paths
1. `/ai-astrology` → Click "Generate Report" → Fill form → Preview
2. `/ai-astrology` → Click any report card → Fill form → Preview
3. `/ai-astrology` → Click bundle → Select reports → Fill form
4. `/ai-astrology` → Footer → FAQ → Back
5. `/ai-astrology` → Footer → Privacy → Back

### Complete User Journey
1. Land on `/ai-astrology`
2. Browse reports and bundles
3. Select "Year Analysis Report"
4. Click "Get My Year Analysis"
5. Fill input form
6. Submit → Preview
7. Click "Purchase Report"
8. Complete Stripe checkout
9. Redirect to success page
10. Download PDF

---

**Last Updated**: January 2025

