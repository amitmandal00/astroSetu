# Invoice & Stripe Receipt Setup Guide

This guide covers the production-ready invoice templates and Stripe receipt configuration for AstroSetu AI.

## ✅ What's Already Implemented

### 1. Stripe Statement Descriptor
- **Set to:** `ASTROSETU AI`
- **Location:** Automatically added to all Stripe checkout sessions
- **File:** `src/app/api/ai-astrology/create-checkout/route.ts`
- **Purpose:** Reduces chargebacks by showing a recognizable name on customer statements

### 2. Stripe Product Descriptions
- **Format:** "AI-generated digital astrology report. Instant delivery. Educational guidance only. No refunds after access."
- **Location:** All checkout sessions use this description
- **Purpose:** Chargeback-resistant, clear about digital product nature

### 3. Invoice Generation API
- **Endpoint:** `POST /api/ai-astrology/invoice`
- **Formats:** HTML, Text, JSON
- **Location:** `src/app/api/ai-astrology/invoice/route.ts`
- **Template:** `src/lib/ai-astrology/invoice.ts`

## 📋 Manual Stripe Configuration Required

### 1. Stripe Receipt Email Templates

Go to **Stripe Dashboard → Settings → Customer emails → Receipts**

#### Receipt Subject Line:
```
Your AstroSetu AI report is ready
```

#### Receipt Header:
```
Thank you for your purchase from AstroSetu AI
```

#### Receipt Body:
```
This email confirms your successful payment.

Product:
AI-Generated Astrology Report (Digital)

Delivery:
Instant digital access via AstroSetu AI

Amount Paid:
AUD ${{amount}}

Business Details:
Operated by MindVeda
ABN: 60 656 401 253
```

#### Receipt Footer (IMPORTANT - Add this):
```
This is an automatically generated digital product.

AstroSetu AI is a fully automated, self-service platform.
No live consultations, personalised support, or human astrologers are provided.

All content is for educational and informational purposes only and does not constitute professional advice.

GST not applicable.
No refunds once the digital report has been accessed.
```

### 2. Stripe Statement Descriptor

**Already configured in code** ✅

The statement descriptor is automatically set to `ASTROSETU AI` in all checkout sessions via:
```typescript
payment_intent_data: {
  statement_descriptor: "ASTROSETU AI",
}
```

**Note:** Stripe has a 22-character limit. `ASTROSETU AI` is 13 characters, which is perfect.

### 3. Stripe Product Description (In Dashboard)

If you create products manually in Stripe Dashboard, use this description:

```
AI-generated digital astrology report.
Instant delivery.
Educational guidance only.
No refunds after access.
```

## 📄 Invoice Template Usage

### Generate Invoice via API

```typescript
// Example: Generate invoice after successful payment
const response = await fetch('/api/ai-astrology/invoice', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    customerEmail: 'customer@example.com',
    amount: 1900, // in cents (AU$19.00)
    currency: 'aud',
    reportType: 'year-analysis',
    sessionId: 'cs_test_...',
    paymentMethod: 'Online (Stripe)',
    paymentStatus: 'Paid',
    format: 'html' // or 'text' or 'json'
  })
});

// HTML format: Returns HTML invoice (can be converted to PDF)
// Text format: Returns plain text invoice
// JSON format: Returns structured invoice data
```

### Invoice Features

✅ **ABN-Compliant**
- Business Name: MindVeda
- Trading As: AstroSetu AI
- ABN: 60 656 401 253
- GST: Not applicable (clearly stated)

✅ **Chargeback-Resistant**
- Clear "No refunds after access" notice
- Digital product clearly identified
- Automated generation disclaimer

✅ **Employer-Safe**
- No mention of "consultation" or "personalized advice"
- Educational/informational only
- Fully automated platform

✅ **Legal Compliance**
- Australian Consumer Law compliant
- ATO sole trader requirements met
- Stripe audit rules satisfied

## 📧 Email Integration (Future Enhancement)

To automatically send invoices via email after payment:

1. **After successful payment verification:**
   ```typescript
   // In verify-payment route, after payment confirmed
   const invoiceResponse = await fetch('/api/ai-astrology/invoice', {
     method: 'POST',
     body: JSON.stringify({
       customerEmail: customerEmail,
       amount: amount,
       sessionId: sessionId,
       format: 'html'
     })
   });
   
   // Send invoice via email (using your email service)
   await sendEmail({
     to: customerEmail,
     subject: `Invoice ${invoiceNumber} - AstroSetu AI`,
     html: invoiceHTML,
     attachments: [/* PDF if generated */]
   });
   ```

2. **Or use Stripe's built-in receipt emails:**
   - Stripe automatically sends receipts if configured
   - Add invoice as attachment or link in receipt email

## 🔍 Verification Checklist

- [x] Stripe statement descriptor set to "ASTROSETU AI"
- [x] Product descriptions updated in checkout sessions
- [x] Invoice template created with ABN compliance
- [x] Invoice API endpoint created
- [ ] Stripe receipt email templates configured (manual step)
- [ ] Test invoice generation
- [ ] Test Stripe receipt emails
- [ ] Verify statement descriptor appears on customer statements

## 📝 Notes

1. **Statement Descriptor:** Already implemented in code. No manual configuration needed.

2. **Receipt Emails:** Must be configured manually in Stripe Dashboard. The code doesn't control these templates.

3. **Invoice Generation:** Available via API. Can be integrated into payment success flow.

4. **PDF Generation:** HTML invoices can be converted to PDF using:
   - Browser print-to-PDF
   - Server-side libraries (puppeteer, pdfkit)
   - Third-party services

5. **GST:** Currently not registered. If revenue exceeds $75,000 AUD/year, GST registration may be required.

## 🚀 Next Steps

1. Configure Stripe receipt email templates (manual)
2. Test invoice generation via API
3. Integrate invoice generation into payment success flow
4. Test end-to-end payment + invoice flow
5. Verify statement descriptor on test transactions

---

**Last Updated:** 2025-01-29
**Status:** ✅ Code implementation complete, manual Stripe configuration pending

