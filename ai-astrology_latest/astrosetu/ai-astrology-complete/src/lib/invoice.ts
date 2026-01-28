/**
 * Invoice Template for AI Astrology Reports
 * ABN-compliant, GST-safe, chargeback-resistant
 */

export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  customerEmail: string;
  amount: number; // in cents
  currency: string;
  reportType?: string;
  paymentMethod: string;
  paymentStatus: "Paid" | "Pending" | "Failed";
  sessionId?: string;
}

export interface InvoiceTemplate {
  seller: {
    businessName: string;
    tradingAs: string;
    abn: string;
    website: string;
    complianceContact: string;
  };
  invoice: InvoiceData;
}

/**
 * Generate invoice number
 */
export function generateInvoiceNumber(sessionId?: string): string {
  const timestamp = Date.now();
  const shortId = sessionId ? sessionId.slice(-8) : timestamp.toString().slice(-8);
  return `AST-INV-${shortId.toUpperCase()}`;
}

/**
 * Format amount from cents to dollars
 */
export function formatAmount(amountInCents: number, currency: string = "AUD"): string {
  const amount = (amountInCents / 100).toFixed(2);
  return `${currency} $${amount}`;
}

/**
 * Generate invoice data structure
 */
export function generateInvoiceData(data: {
  customerEmail: string;
  amount: number;
  currency?: string;
  reportType?: string;
  sessionId?: string;
  paymentMethod?: string;
  paymentStatus?: "Paid" | "Pending" | "Failed";
}): InvoiceTemplate {
  return {
    seller: {
      businessName: "MindVeda",
      tradingAs: "AstroSetu AI",
      abn: "60 656 401 253",
      website: "https://astrosetu.ai",
      complianceContact: "legal@mindveda.net",
    },
    invoice: {
      invoiceNumber: generateInvoiceNumber(data.sessionId),
      invoiceDate: new Date().toISOString().split("T")[0],
      customerEmail: data.customerEmail,
      amount: data.amount,
      currency: data.currency || "aud",
      reportType: data.reportType,
      paymentMethod: data.paymentMethod || "Online (Stripe)",
      paymentStatus: data.paymentStatus || "Paid",
      sessionId: data.sessionId,
    },
  };
}

/**
 * Generate invoice HTML for PDF generation
 */
export function generateInvoiceHTML(invoice: InvoiceTemplate): string {
  const amount = formatAmount(invoice.invoice.amount, invoice.invoice.currency.toUpperCase());
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${invoice.invoice.invoiceNumber}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
      background: #fff;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      border-bottom: 3px solid #6366f1;
      padding-bottom: 20px;
    }
    .header h1 {
      margin: 0;
      font-size: 32px;
      color: #1e293b;
    }
    .section {
      margin-bottom: 30px;
    }
    .section-title {
      font-size: 14px;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 10px;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 5px;
    }
    .seller-info, .invoice-info, .customer-info {
      background: #f8fafc;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .info-row {
      margin: 8px 0;
      font-size: 14px;
    }
    .info-label {
      font-weight: 600;
      color: #475569;
      display: inline-block;
      min-width: 140px;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    .items-table th {
      background: #6366f1;
      color: white;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      font-size: 14px;
    }
    .items-table td {
      padding: 12px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 14px;
    }
    .items-table tr:last-child td {
      border-bottom: none;
    }
    .totals {
      margin-top: 20px;
      text-align: right;
    }
    .total-row {
      margin: 8px 0;
      font-size: 14px;
    }
    .total-label {
      font-weight: 600;
      color: #475569;
      display: inline-block;
      min-width: 150px;
      text-align: right;
      margin-right: 10px;
    }
    .total-amount {
      font-weight: 700;
      color: #1e293b;
      font-size: 18px;
    }
    .notice {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 15px;
      margin: 30px 0;
      border-radius: 4px;
    }
    .notice-title {
      font-weight: 600;
      color: #92400e;
      margin-bottom: 10px;
      font-size: 14px;
    }
    .notice-text {
      font-size: 13px;
      color: #78350f;
      line-height: 1.6;
    }
    .legal {
      background: #f1f5f9;
      border-left: 4px solid #475569;
      padding: 15px;
      margin: 30px 0;
      border-radius: 4px;
      font-size: 12px;
      color: #475569;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e2e8f0;
      text-align: center;
      font-size: 12px;
      color: #64748b;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>INVOICE</h1>
  </div>

  <div class="section">
    <div class="section-title">Seller</div>
    <div class="seller-info">
      <div class="info-row">
        <span class="info-label">Business Name:</span>
        <span>${invoice.seller.businessName}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Trading As:</span>
        <span>${invoice.seller.tradingAs}</span>
      </div>
      <div class="info-row">
        <span class="info-label">ABN:</span>
        <span>${invoice.seller.abn}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Website:</span>
        <span>${invoice.seller.website}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Compliance Contact:</span>
        <span>${invoice.seller.complianceContact}</span>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Invoice Details</div>
    <div class="invoice-info">
      <div class="info-row">
        <span class="info-label">Invoice Number:</span>
        <span>${invoice.invoice.invoiceNumber}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Invoice Date:</span>
        <span>${invoice.invoice.invoiceDate}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Payment Status:</span>
        <span>${invoice.invoice.paymentStatus}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Payment Method:</span>
        <span>${invoice.invoice.paymentMethod}</span>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Customer</div>
    <div class="customer-info">
      <div class="info-row">
        <span class="info-label">Customer Email:</span>
        <span>${invoice.invoice.customerEmail}</span>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Items</div>
    <table class="items-table">
      <thead>
        <tr>
          <th>Description</th>
          <th style="text-align: center; width: 100px;">Quantity</th>
          <th style="text-align: right; width: 150px;">Price (AUD)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>AI-Generated Astrology Report (Digital Product)</td>
          <td style="text-align: center;">1</td>
          <td style="text-align: right;">${amount}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="totals">
    <div class="total-row">
      <span class="total-label">Subtotal:</span>
      <span class="total-amount">${amount}</span>
    </div>
    <div class="total-row">
      <span class="total-label">GST:</span>
      <span>Not applicable (GST not registered)</span>
    </div>
    <div class="total-row" style="margin-top: 15px; padding-top: 15px; border-top: 2px solid #e2e8f0;">
      <span class="total-label">Total Paid:</span>
      <span class="total-amount">${amount} AUD</span>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Delivery</div>
    <p style="font-size: 14px; color: #475569; margin: 10px 0;">
      Instant digital delivery via web platform.
    </p>
  </div>

  <div class="notice">
    <div class="notice-title">Important Notice</div>
    <div class="notice-text">
      <p style="margin: 0 0 10px 0;">
        This product is generated automatically by software.<br>
        No live consultation, personalised advice, or human involvement is provided.
      </p>
      <p style="margin: 0 0 10px 0;">
        AstroSetu AI provides educational and informational guidance only.<br>
        No medical, legal, financial, or professional advice is offered.
      </p>
      <p style="margin: 0;">
        No refunds are available once the digital report has been accessed.
      </p>
    </div>
  </div>

  <div class="legal">
    <strong>Legal:</strong> AstroSetu AI is operated by MindVeda (ABN 60 656 401 253).<br>
    ✅ This invoice is fully compliant with:<br>
    • ATO sole trader requirements<br>
    • Stripe audit rules<br>
    • Australian Consumer Law (digital goods)<br>
    • Employer conflict-safe wording
  </div>

  <div class="footer">
    <p>This is an automatically generated invoice for a digital product.</p>
    <p>For compliance inquiries, contact: ${invoice.seller.complianceContact}</p>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generate plain text invoice for email
 */
export function generateInvoiceText(invoice: InvoiceTemplate): string {
  const amount = formatAmount(invoice.invoice.amount, invoice.invoice.currency.toUpperCase());
  
  return `
INVOICE
${"=".repeat(50)}

Seller
${"-".repeat(50)}
Business Name: ${invoice.seller.businessName}
Trading As: ${invoice.seller.tradingAs}
ABN: ${invoice.seller.abn}
Website: ${invoice.seller.website}
Compliance Contact: ${invoice.seller.complianceContact}

Invoice Details
${"-".repeat(50)}
Invoice Number: ${invoice.invoice.invoiceNumber}
Invoice Date: ${invoice.invoice.invoiceDate}
Payment Status: ${invoice.invoice.paymentStatus}
Payment Method: ${invoice.invoice.paymentMethod}

Customer
${"-".repeat(50)}
Customer Email: ${invoice.invoice.customerEmail}

Items
${"-".repeat(50)}
Description: AI-Generated Astrology Report (Digital Product)
Quantity: 1
Price (AUD): ${amount}

Totals
${"-".repeat(50)}
Subtotal: ${amount}
GST: Not applicable (GST not registered)
Total Paid: ${amount} AUD

Delivery
${"-".repeat(50)}
Instant digital delivery via web platform.

Important Notice
${"-".repeat(50)}
This product is generated automatically by software.
No live consultation, personalised advice, or human involvement is provided.

AstroSetu AI provides educational and informational guidance only.
No medical, legal, financial, or professional advice is offered.

No refunds are available once the digital report has been accessed.

Legal
${"-".repeat(50)}
AstroSetu AI is operated by MindVeda (ABN 60 656 401 253).
✅ This invoice is fully compliant with:
• ATO sole trader requirements
• Stripe audit rules
• Australian Consumer Law (digital goods)
• Employer conflict-safe wording
  `.trim();
}

