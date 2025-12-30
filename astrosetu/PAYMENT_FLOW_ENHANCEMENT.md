# Payment Flow Enhancement - Code-Driven Rules

This document outlines the implementation of code-driven payment rules for the AI Astrology section.

## ✅ Implementation Complete

### 1. Default Currency & Pricing Rules (Code-Driven)

#### Stripe Dashboard Configuration (One-Time Setup)
- **Location:** Stripe Dashboard → Settings → Payments
- **Default Currency:** AUD (Australian Dollars)
- **Payment Methods:** Cards + Wallets enabled

#### Code Implementation
All payment requests now follow these rules:

**Currency:**
- Always uses `currency: "aud"` (hardcoded in code)
- No currency selection - AUD is the only option

**Amount:**
- Always in cents (e.g., 1 cent = $0.01 AUD)
- Stored in `amount` field as integer

**Description Format:**
- Format: `"AstroSetu AI – {Report Name}"`
- Examples:
  - `"AstroSetu AI – Marriage Timing Report"`
  - `"AstroSetu AI – Career & Money Path Report"`
  - `"AstroSetu AI – Year Analysis Report"`

**Metadata (Required):**
- `report_type`: The report type identifier (e.g., "marriage-timing", "year-analysis")
- `user_id`: User identifier (extracted from session or input hash)
- `timestamp`: ISO timestamp of checkout creation
- `requestId`: Unique request identifier for tracking

### 2. Payment Flow Implementation

#### Frontend Flow
1. **User selects report** → Clicks "Generate Report" or "Purchase"
2. **Calls backend** → `POST /api/ai-astrology/create-checkout`
3. **Receives Stripe URL** → Redirects to Stripe checkout

#### Backend Flow
1. **Validates report type** → Ensures valid report type provided
2. **Calculates price** → Gets price from `REPORT_PRICES` (in cents)
3. **Creates Checkout Session** → Stripe API call with:
   - Currency: `"aud"` (always)
   - Amount: Price in cents
   - Description: `"AstroSetu AI – {Report Name}"`
   - Metadata: `report_type`, `user_id`, `timestamp`
4. **Returns Stripe URL** → Frontend redirects user

#### Stripe Flow
1. **Handles payment** → User completes payment
2. **Shows receipt** → Stripe displays receipt
3. **Redirects success** → Returns to success URL with session ID

#### Webhook Flow (Future Enhancement)
1. **Confirms payment** → Webhook receives payment confirmation
2. **Unlocks report** → Marks report as paid in database
3. **Logs transaction** → Records transaction details

## 📋 Code Changes

### Updated Files

#### 1. `src/lib/ai-astrology/payments.ts`
- Added `displayName` field to `ReportPrice` type
- Updated all `REPORT_PRICES` entries with display names:
  - "Marriage Timing Report"
  - "Career & Money Path Report"
  - "Full Life Report"
  - "Year Analysis Report"
  - "3-5 Year Strategic Life Phase Report"
  - "Decision Support Report"

#### 2. `src/app/api/ai-astrology/create-checkout/route.ts`
- **Currency:** Always uses `"aud"` (hardcoded)
- **Description:** Format changed to `"AstroSetu AI – {Report Name}"`
- **Metadata:** Enhanced with:
  - `report_type` (instead of `reportType`)
  - `user_id` (extracted from headers or input hash)
  - `timestamp` (ISO format)
  - `requestId` (existing)

### Key Implementation Details

```typescript
// Currency is always AUD
const currency = "aud";

// Amount is always in cents
const amount = priceData.amount; // Already in cents

// Description format: "AstroSetu AI – {Report Name}"
const productDescription = `AstroSetu AI – ${reportDisplayName}`;

// Metadata includes all required fields
const metadata = {
  report_type: reportType,
  user_id: userId,
  timestamp: new Date().toISOString(),
  requestId: requestId,
};
```

## 🔍 Verification Checklist

- [x] Currency always set to "aud"
- [x] Amount always in cents
- [x] Description format: "AstroSetu AI – {Report Name}"
- [x] Metadata includes `report_type`
- [x] Metadata includes `user_id`
- [x] Metadata includes `timestamp`
- [x] Frontend calls `/api/ai-astrology/create-checkout`
- [x] Backend validates report type
- [x] Backend calculates price correctly
- [x] Backend creates Stripe checkout session
- [x] Backend returns Stripe URL
- [x] Stripe redirects to success page

## 📝 Stripe Dashboard Configuration

### Required Settings (One-Time)
1. **Default Currency:** AUD
   - Go to: Stripe Dashboard → Settings → Payments
   - Set default currency to AUD

2. **Payment Methods:** Enable Cards + Wallets
   - Go to: Stripe Dashboard → Settings → Payment methods
   - Enable: Cards, Apple Pay, Google Pay, etc.

3. **Statement Descriptor:** Already configured in code
   - Set to: "ASTROSETU AI" (22 char limit, we use 13 chars)

## 🚀 Testing

### Test Payment Flow
1. Navigate to `/ai-astrology/input`
2. Fill in birth details
3. Select a report type
4. Click "Generate Report"
5. On preview page, click "Purchase"
6. Verify Stripe checkout shows:
   - Currency: AUD
   - Description: "AstroSetu AI – {Report Name}"
   - Amount: Correct price in AUD

### Test Metadata
After successful payment, check Stripe Dashboard:
- Go to: Payments → Select payment
- Check metadata section:
  - `report_type`: Should match report type
  - `user_id`: Should be present
  - `timestamp`: Should be ISO format
  - `requestId`: Should be present

## 🔄 Future Enhancements

### Webhook Implementation (Recommended)
1. Create webhook endpoint: `/api/ai-astrology/webhook`
2. Verify Stripe signature
3. Handle payment confirmation
4. Unlock report access
5. Log transaction to database

### Example Webhook Handler
```typescript
// Future implementation
export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  // Verify signature
  const event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const reportType = session.metadata.report_type;
    const userId = session.metadata.user_id;
    
    // Unlock report access
    // Log transaction
  }
}
```

## ✅ Status

**Implementation:** ✅ Complete
**Build:** ✅ Successful
**Lint:** ✅ No errors
**TypeScript:** ✅ No errors

All code-driven payment rules are now implemented and enforced.

---

**Last Updated:** 2025-01-29
**Version:** 1.0.0

