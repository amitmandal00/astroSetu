/**
 * Chargeback Defense Text for Stripe Disputes
 * Production-ready, copy-paste ready evidence text
 * Use in Stripe Dashboard → Disputes → Evidence
 */

export interface ChargebackEvidence {
  productDescription: string;
  refundPolicy: string;
  serviceModelDisclosure: string;
  proofOfDelivery: string;
  termsAcceptance: string;
}

/**
 * Get complete chargeback defense evidence text
 */
export function getChargebackEvidence(): ChargebackEvidence {
  return {
    productDescription: `The customer purchased a digital, AI-generated astrology report.
Delivery was instant and completed automatically upon payment.

This is a self-service digital product.
No physical goods or live services are provided.`,

    refundPolicy: `As clearly stated before purchase, refunds are not available once the digital report has been accessed or delivered.

The customer agreed to the refund policy at checkout.`,

    serviceModelDisclosure: `AstroSetu AI is a fully automated platform.
No personalised consultations or human involvement are offered.
The product is provided for educational purposes only.`,

    proofOfDelivery: `System logs confirm successful generation and delivery of the digital report to the customer account/email immediately after payment.`,

    termsAcceptance: `The customer accepted the Terms & Conditions and Refund Policy via a required checkbox prior to completing payment.`,
  };
}

/**
 * Get formatted chargeback evidence for copy-paste into Stripe
 * Returns a formatted string ready to paste into Stripe's evidence fields
 */
export function getFormattedChargebackEvidence(customerEmail?: string, sessionId?: string, reportType?: string): string {
  const evidence = getChargebackEvidence();
  
  let formatted = `🛡️ CHARGEBACK EVIDENCE - PRODUCT DESCRIPTION\n\n${evidence.productDescription}\n\n`;
  formatted += `🛡️ REFUND POLICY\n\n${evidence.refundPolicy}\n\n`;
  formatted += `🛡️ SERVICE MODEL DISCLOSURE\n\n${evidence.serviceModelDisclosure}\n\n`;
  formatted += `🛡️ PROOF OF DELIVERY\n\n${evidence.proofOfDelivery}`;
  
  if (customerEmail) {
    formatted += `\n\nCustomer Email: ${customerEmail}`;
  }
  
  if (sessionId) {
    formatted += `\n\nStripe Session ID: ${sessionId}`;
  }
  
  if (reportType) {
    formatted += `\n\nReport Type: ${reportType}`;
  }
  
  formatted += `\n\n🛡️ TERMS ACCEPTANCE\n\n${evidence.termsAcceptance}`;
  
  return formatted;
}

/**
 * Get chargeback evidence as structured object for API responses
 */
export function getChargebackEvidenceStructured(): {
  sections: Array<{
    title: string;
    content: string;
  }>;
  formatted: string;
} {
  const evidence = getChargebackEvidence();
  
  return {
    sections: [
      {
        title: "Product Description",
        content: evidence.productDescription,
      },
      {
        title: "Refund Policy",
        content: evidence.refundPolicy,
      },
      {
        title: "Service Model Disclosure",
        content: evidence.serviceModelDisclosure,
      },
      {
        title: "Proof of Delivery",
        content: evidence.proofOfDelivery,
      },
      {
        title: "Terms Acceptance",
        content: evidence.termsAcceptance,
      },
    ],
    formatted: getFormattedChargebackEvidence(),
  };
}

/**
 * Get chargeback evidence with customer-specific details
 */
export function getChargebackEvidenceForDispute(params: {
  customerEmail: string;
  sessionId: string;
  reportType?: string;
  paymentDate?: string;
  amount?: number;
  currency?: string;
}): {
  evidence: ChargebackEvidence;
  formatted: string;
  customerDetails: {
    email: string;
    sessionId: string;
    reportType?: string;
    paymentDate?: string;
    amount?: string;
  };
} {
  const evidence = getChargebackEvidence();
  const formatted = getFormattedChargebackEvidence(
    params.customerEmail,
    params.sessionId,
    params.reportType
  );
  
  let amountStr = "";
  if (params.amount && params.currency) {
    const amount = (params.amount / 100).toFixed(2);
    amountStr = `${params.currency.toUpperCase()} $${amount}`;
  }
  
  return {
    evidence,
    formatted,
    customerDetails: {
      email: params.customerEmail,
      sessionId: params.sessionId,
      reportType: params.reportType,
      paymentDate: params.paymentDate,
      amount: amountStr,
    },
  };
}

