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

export const REPORT_PRICES: Record<ReportPrice["reportType"], ReportPrice> = {
  "marriage-timing": {
    reportType: "marriage-timing",
    amount: 2900, // $29.00
    currency: "usd",
    description: "Marriage Timing Report - Ideal marriage windows, compatibility, and remedies",
  },
  "career-money": {
    reportType: "career-money",
    amount: 2900, // $29.00
    currency: "usd",
    description: "Career & Money Path Report - Career direction, timing, and financial phases",
  },
  "full-life": {
    reportType: "full-life",
    amount: 4900, // $49.00
    currency: "usd",
    description: "Full Life Report - Comprehensive analysis covering all aspects of life",
  },
};

export const SUBSCRIPTION_PRICE = {
  amount: 999, // $9.99
  currency: "usd",
  interval: "month" as const,
  description: "Premium Subscription - Daily personalized guidance and insights",
};

/**
 * Check if Stripe is configured
 */
export function isStripeConfigured(): boolean {
  return !!(process.env.STRIPE_SECRET_KEY && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
}

