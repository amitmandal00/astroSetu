/**
 * Payment handling for AI Astrology reports
 * Stripe integration for secure payment processing
 */

export type ReportPrice = {
  reportType: "marriage-timing" | "career-money" | "full-life" | "year-analysis" | "major-life-phase" | "decision-support";
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
    description: "AI-generated digital astrology report. Instant delivery. No refunds after access. Educational guidance only.",
  },
  "career-money": {
    reportType: "career-money",
    amount: 1, // AU$0.01 (includes GST) - Testing price
    currency: "aud",
    description: "AI-generated digital astrology report. Instant delivery. No refunds after access. Educational guidance only.",
  },
  "full-life": {
    reportType: "full-life",
    amount: 1, // AU$0.01 (includes GST) - Testing price
    currency: "aud",
    description: "AI-generated digital astrology report. Instant delivery. No refunds after access. Educational guidance only.",
  },
  "year-analysis": {
    reportType: "year-analysis",
    amount: 1, // AU$0.01 (includes GST) - Testing price (production: 1900-2900 = AU$19-29)
    currency: "aud",
    description: "AI-generated digital astrology report. Instant delivery. No refunds after access. Educational guidance only.",
  },
  "major-life-phase": {
    reportType: "major-life-phase",
    amount: 1, // AU$0.01 (includes GST) - Testing price (production: 2900-3900 = AU$29-39)
    currency: "aud",
    description: "AI-generated digital astrology report. Instant delivery. No refunds after access. Educational guidance only.",
  },
  "decision-support": {
    reportType: "decision-support",
    amount: 1, // AU$0.01 (includes GST) - Testing price (production: 1900-2900 = AU$19-29)
    currency: "aud",
    description: "AI-generated digital astrology report. Instant delivery. No refunds after access. Educational guidance only.",
  },
};

// Bundle pricing
// Calculate bundle prices with clear savings
// Note: Full Life Report already includes Marriage + Career content, so bundles are:
// - Any 2: Marriage + Career (15% discount)
// - All 3: Marriage + Career + Full Life (25% discount, though Full Life overlaps)
const calculateBundlePrice = (reportCount: number): number => {
  const marriagePrice = REPORT_PRICES["marriage-timing"].amount;
  const careerPrice = REPORT_PRICES["career-money"].amount;
  const fullLifePrice = REPORT_PRICES["full-life"].amount;
  
  if (reportCount === 2) {
    // Any 2 reports: Marriage + Career with 15% discount
    const total = marriagePrice + careerPrice;
    return Math.round(total * 0.85); // 15% off
  } else if (reportCount === 3) {
    // All 3 reports: Marriage + Career + Full Life with 25% discount
    // Note: Full Life includes Marriage + Career content, but this bundle gives all separate reports
    const total = marriagePrice + careerPrice + fullLifePrice;
    return Math.round(total * 0.75); // 25% off
  }
  return 0;
};

const marriageCareerTotal = REPORT_PRICES["marriage-timing"].amount + REPORT_PRICES["career-money"].amount;
const allThreeTotal = REPORT_PRICES["marriage-timing"].amount + REPORT_PRICES["career-money"].amount + REPORT_PRICES["full-life"].amount;

const lifeDecisionPackTotal = REPORT_PRICES["marriage-timing"].amount + REPORT_PRICES["career-money"].amount + REPORT_PRICES["year-analysis"].amount;

export const BUNDLE_PRICES = {
  "any-2": {
    amount: calculateBundlePrice(2),
    currency: "aud",
    description: "Any 2 Reports Bundle - Marriage Timing + Career & Money, save 15%",
    savings: Math.round(marriageCareerTotal * 0.15),
    individualTotal: marriageCareerTotal,
  },
  "all-3": {
    amount: calculateBundlePrice(3),
    currency: "aud",
    description: "All 3 Reports Bundle - Get all reports and save 25%",
    savings: Math.round(allThreeTotal * 0.25),
    individualTotal: allThreeTotal,
  },
  "life-decision-pack": {
    amount: Math.round(lifeDecisionPackTotal * 0.75), // 25% off
    currency: "aud",
    description: "Life Decision Pack - Marriage + Career + Year Analysis, save 25%",
    savings: Math.round(lifeDecisionPackTotal * 0.25),
    individualTotal: lifeDecisionPackTotal,
  },
};

/**
 * Calculate bundle savings for display
 */
export function getBundleSavings(reportTypes: ReportPrice["reportType"][]): number {
  const totalIndividual = reportTypes.reduce((sum, type) => sum + REPORT_PRICES[type].amount, 0);
  if (reportTypes.length === 2) {
    const bundlePrice = BUNDLE_PRICES["any-2"].amount;
    return totalIndividual - bundlePrice;
  } else if (reportTypes.length === 3) {
    const bundlePrice = BUNDLE_PRICES["all-3"].amount;
    return totalIndividual - bundlePrice;
  }
  return 0;
}

export const SUBSCRIPTION_PRICE = {
  amount: 1, // AU$0.01/month (includes GST) - Testing price
  // TODO: Update to AU$9.99/month minimum when ready for production
  // The feedback recommends AU$9.99/month minimum or AU$79/year
  // $0.01 pricing is toxic even for testing - creates loss of perceived value
  currency: "aud",
  interval: "month" as const,
  description: "Monthly AI Astrology Outlook - Monthly personalized outlook and guidance",
};

/**
 * Check if Stripe is configured
 */
export function isStripeConfigured(): boolean {
  return !!(process.env.STRIPE_SECRET_KEY && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
}

