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
// TESTING PRICE: All reports set to AU$0.01 for production testing
export const REPORT_PRICES: Record<ReportPrice["reportType"], ReportPrice> = {
  "marriage-timing": {
    reportType: "marriage-timing",
    amount: 1, // AU$0.01 (includes GST) - Testing price
    currency: "aud",
    description: "Marriage Timing Report - Ideal marriage windows, compatibility, and remedies",
  },
  "career-money": {
    reportType: "career-money",
    amount: 1, // AU$0.01 (includes GST) - Testing price
    currency: "aud",
    description: "Career & Money Path Report - Career direction, timing, and financial phases",
  },
  "full-life": {
    reportType: "full-life",
    amount: 1, // AU$0.01 (includes GST) - Testing price
    currency: "aud",
    description: "Full Life Report - Comprehensive analysis covering all aspects of life",
  },
};

// Bundle pricing
// TESTING PRICE: All bundles set to AU$0.01 for production testing
export const BUNDLE_PRICES = {
  "any-2": {
    amount: 1, // AU$0.01 - Testing price
    currency: "aud",
    description: "Any 2 Reports Bundle - Choose any 2 reports and save",
  },
  "all-3": {
    amount: 1, // AU$0.01 - Testing price
    currency: "aud",
    description: "All 3 Reports Bundle - Get all reports and save",
  },
};

export const SUBSCRIPTION_PRICE = {
  amount: 1, // AU$0.01/month (includes GST) - Testing price
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

