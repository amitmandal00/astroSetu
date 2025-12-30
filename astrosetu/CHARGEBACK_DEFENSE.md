# Chargeback Defense Guide for Stripe Disputes

This guide provides production-ready chargeback defense text for use in Stripe dispute evidence submissions.

## 🛡️ Quick Access

### API Endpoint
- **GET** `/api/ai-astrology/chargeback-evidence` - Get general template
- **POST** `/api/ai-astrology/chargeback-evidence` - Get personalized evidence with customer details

### Code Location
- **Utility:** `src/lib/ai-astrology/chargeback-defense.ts`
- **API:** `src/app/api/ai-astrology/chargeback-evidence/route.ts`

## 📋 Copy-Paste Ready Evidence Text

### 🛡️ Product Description

```
The customer purchased a digital, AI-generated astrology report.
Delivery was instant and completed automatically upon payment.

This is a self-service digital product.
No physical goods or live services are provided.
```

**Stripe Field:** Product description

---

### 🛡️ Refund Policy

```
As clearly stated before purchase, refunds are not available once the digital report has been accessed or delivered.

The customer agreed to the refund policy at checkout.
```

**Stripe Field:** Refund policy

---

### 🛡️ Service Model Disclosure

```
AstroSetu AI is a fully automated platform.
No personalised consultations or human involvement are offered.
The product is provided for educational purposes only.
```

**Stripe Field:** Service documentation

---

### 🛡️ Proof of Delivery

```
System logs confirm successful generation and delivery of the digital report to the customer account/email immediately after payment.
```

**Stripe Field:** Proof of delivery

**Additional Details to Include:**
- Customer Email: `[customer@example.com]`
- Stripe Session ID: `[cs_test_...]`
- Report Type: `[year-analysis]`
- Payment Date: `[YYYY-MM-DD]`
- Amount: `[AUD $XX.XX]`

---

### 🛡️ Terms Acceptance

```
The customer accepted the Terms & Conditions and Refund Policy via a required checkbox prior to completing payment.
```

**Stripe Field:** Terms acceptance

---

## 🔧 How to Use in Stripe Dashboard

### Step-by-Step Process

1. **Navigate to Dispute**
   - Go to Stripe Dashboard → **Disputes**
   - Find and click on the disputed payment

2. **Submit Evidence**
   - Click **"Submit Evidence"** button
   - You'll see multiple evidence fields

3. **Fill Evidence Fields**
   - **Product description:** Use "Product Description" text above
   - **Refund policy:** Use "Refund Policy" text above
   - **Service documentation:** Use "Service Model Disclosure" text above
   - **Proof of delivery:** Use "Proof of Delivery" text + customer details
   - **Terms acceptance:** Use "Terms Acceptance" text above

4. **Add Customer-Specific Details**
   - Include customer email
   - Include Stripe session ID
   - Include payment date and amount
   - Include report type (if applicable)

5. **Submit Evidence**
   - Review all fields
   - Click **"Submit Evidence"**
   - Stripe will review and make a decision

## 📡 Using the API

### Get General Template

```bash
curl https://your-domain.com/api/ai-astrology/chargeback-evidence
```

### Get Personalized Evidence

```bash
curl -X POST https://your-domain.com/api/ai-astrology/chargeback-evidence \
  -H "Content-Type: application/json" \
  -d '{
    "customerEmail": "customer@example.com",
    "sessionId": "cs_test_abc123",
    "reportType": "year-analysis",
    "paymentDate": "2025-01-29",
    "amount": 1900,
    "currency": "aud",
    "format": "formatted"
  }'
```

### Response Formats

- **`formatted`** (default): Plain text ready to copy-paste
- **`structured`**: JSON object with all sections
- **`sections`**: Array of sections with Stripe field mappings

## 💡 Best Practices

### 1. Act Quickly
- Submit evidence within **7 days** of dispute notification
- Stripe gives you limited time to respond

### 2. Be Specific
- Always include customer email and session ID
- Include payment date and amount
- Reference specific report type if applicable

### 3. Use All Fields
- Don't leave any evidence fields empty
- Each field strengthens your case
- More evidence = better chance of winning

### 4. Keep Records
- Save dispute evidence submissions
- Document all customer interactions
- Keep system logs showing delivery

### 5. Monitor Patterns
- Track which disputes you win/lose
- Identify common dispute reasons
- Adjust product descriptions if needed

## 🎯 Evidence Strength Factors

### ✅ Strong Evidence
- Clear refund policy stated before purchase
- Terms acceptance checkbox required
- Instant digital delivery confirmed
- Automated product (no service claims)
- Educational/informational only

### ⚠️ Weak Evidence
- Vague product descriptions
- No clear refund policy
- Claims of "consultation" or "personalized advice"
- Physical goods claims
- Service delivery delays

## 📊 Dispute Statistics to Track

- **Dispute Rate:** Target < 0.5% of transactions
- **Win Rate:** Target > 60% of disputes
- **Common Reasons:**
  - Product not received
  - Product not as described
  - Unauthorized transaction

## 🔍 Additional Evidence to Collect

### System Logs
- Payment confirmation timestamp
- Report generation timestamp
- Email delivery confirmation
- Customer account access logs

### Customer Communication
- Pre-purchase emails
- Post-purchase confirmation emails
- Support ticket history (if any)
- Terms acceptance records

### Product Documentation
- Terms & Conditions URL
- Refund Policy URL
- Product description from checkout
- Screenshots of checkout process

## 🚨 Common Dispute Scenarios

### Scenario 1: "Product Not Received"
**Response:**
- Use "Proof of Delivery" evidence
- Include system logs showing instant delivery
- Reference email confirmation sent to customer

### Scenario 2: "Product Not As Described"
**Response:**
- Use "Service Model Disclosure" evidence
- Reference product description from checkout
- Emphasize "educational purposes only"

### Scenario 3: "Unauthorized Transaction"
**Response:**
- Provide IP address and device information
- Show customer account history
- Reference email confirmation sent to registered email

### Scenario 4: "Refund Request Denied"
**Response:**
- Use "Refund Policy" evidence
- Show terms acceptance checkbox
- Reference clear "no refunds" policy stated before purchase

## 📝 Template for Manual Use

If you need to manually fill out Stripe evidence forms, use this template:

```
PRODUCT DESCRIPTION:
[Paste Product Description text]

REFUND POLICY:
[Paste Refund Policy text]

SERVICE DOCUMENTATION:
[Paste Service Model Disclosure text]

PROOF OF DELIVERY:
[Paste Proof of Delivery text]
Customer Email: [customer@example.com]
Stripe Session ID: [cs_test_...]
Payment Date: [YYYY-MM-DD]
Amount: [AUD $XX.XX]

TERMS ACCEPTANCE:
[Paste Terms Acceptance text]
```

## ✅ Verification Checklist

Before submitting evidence:
- [ ] All evidence fields filled
- [ ] Customer email included
- [ ] Session ID included
- [ ] Payment date and amount included
- [ ] Report type included (if applicable)
- [ ] System logs referenced (if available)
- [ ] Terms acceptance confirmed
- [ ] Refund policy clearly stated
- [ ] No claims of "consultation" or "personalized advice"
- [ ] Educational/informational purpose emphasized

---

**Last Updated:** 2025-01-29
**Status:** ✅ Production-ready, copy-paste ready

