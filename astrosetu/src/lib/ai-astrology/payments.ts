/**
 * Payment handling for AI Astrology reports
 * Stripe integration for secure payment processing
 */

export type ReportPrice = {
  reportType: "marriage-timing" | "career-money" | "full-life";
  amount: number; // in cents
  currency: string;
  description: string;
};

// Prices in AUD (Australian Dollars) with GST included
export const REPORT_PRICES: Record<ReportPrice["reportType"], ReportPrice> = {
  "marriage-timing": {
    reportType: "marriage-timing",
    amount: 4200, // AU$42.00 (includes GST)
    currency: "aud",
    description: "Marriage Timing Report - Ideal marriage windows, compatibility, and remedies",
  },
  "career-money": {
    reportType: "career-money",
    amount: 4200, // AU$42.00 (includes GST)
    currency: "aud",
    description: "Career & Money Path Report - Career direction, timing, and financial phases",
  },
  "full-life": {
    reportType: "full-life",
    amount: 6900, // AU$69.00 (includes GST)
    currency: "aud",
    description: "Full Life Report - Comprehensive analysis covering all aspects of life",
  },
};

// Bundle pricing
export const BUNDLE_PRICES = {
  "any-2": {
    amount: 6900, // AU$69.00 (save $15)
    currency: "aud",
    description: "Any 2 Reports Bundle - Choose any 2 reports and save",
  },
  "all-3": {
    amount: 9900, // AU$99.00 (save $27)
    currency: "aud",
    description: "All 3 Reports Bundle - Get all reports and save",
  },
};

export const SUBSCRIPTION_PRICE = {
  amount: 1499, // AU$14.99/month (includes GST)
  currency: "aud",
  interval: "month" as const,
  description: "Premium Subscription - Daily personalized guidance and insights",
};

/**
 * Check if Stripe is configured
 */
export function isStripeConfigured(): boolean {
  return !!(process.env.STRIPE_SECRET_KEY && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
}

