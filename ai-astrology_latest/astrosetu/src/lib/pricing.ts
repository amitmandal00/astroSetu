/**
 * Country-based pricing configuration for AstroSetu Plus
 */

export type CountryCode = "IN" | "US" | "GB" | "AU" | "CA" | "AE" | "SG" | "OTHER";

export interface PricingPlan {
  name: string;
  period: "week" | "month" | "year";
  price: number;
  currency: string;
  priceInINR: number; // For comparison
}

export interface CountryPricing {
  country: string;
  countryCode: CountryCode;
  currency: string;
  currencySymbol: string;
  plans: {
    weekly: PricingPlan;
    yearly: PricingPlan;
  };
}

// Base pricing in INR (India)
const BASE_PRICING = {
  weekly: { price: 149, period: "week" as const },
  yearly: { price: 999, period: "year" as const },
};

// Currency conversion rates (approximate, should be updated from real API)
const CURRENCY_RATES: Record<string, number> = {
  INR: 1,
  USD: 0.012, // 1 INR = 0.012 USD
  GBP: 0.0095, // 1 INR = 0.0095 GBP
  AUD: 0.018, // 1 INR = 0.018 AUD
  CAD: 0.016, // 1 INR = 0.016 CAD
  AED: 0.044, // 1 INR = 0.044 AED
  SGD: 0.016, // 1 INR = 0.016 SGD
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: "₹",
  USD: "$",
  GBP: "£",
  AUD: "A$",
  CAD: "C$",
  AED: "د.إ",
  SGD: "S$",
};

/**
 * Get pricing for a specific country
 */
export function getCountryPricing(countryCode: CountryCode = "IN"): CountryPricing {
  const countryMap: Record<CountryCode, { country: string; currency: string }> = {
    IN: { country: "India", currency: "INR" },
    US: { country: "United States", currency: "USD" },
    GB: { country: "United Kingdom", currency: "GBP" },
    AU: { country: "Australia", currency: "AUD" },
    CA: { country: "Canada", currency: "CAD" },
    AE: { country: "UAE", currency: "AED" },
    SG: { country: "Singapore", currency: "SGD" },
    OTHER: { country: "Other", currency: "USD" },
  };

  const country = countryMap[countryCode];
  const rate = CURRENCY_RATES[country.currency] || CURRENCY_RATES.USD;
  const symbol = CURRENCY_SYMBOLS[country.currency] || "$";

  // Convert from INR base price
  const weeklyPrice = Math.round(BASE_PRICING.weekly.price / rate);
  const yearlyPrice = Math.round(BASE_PRICING.yearly.price / rate);

  return {
    country: country.country,
    countryCode,
    currency: country.currency,
    currencySymbol: symbol,
    plans: {
      weekly: {
        name: "Weekly",
        period: "week",
        price: weeklyPrice,
        currency: country.currency,
        priceInINR: BASE_PRICING.weekly.price,
      },
      yearly: {
        name: "Yearly",
        period: "year",
        price: yearlyPrice,
        currency: country.currency,
        priceInINR: BASE_PRICING.yearly.price,
      },
    },
  };
}

/**
 * Detect country from request headers or locale
 */
export function detectCountry(req?: Request): CountryCode {
  // Try to get from Accept-Language header or other headers
  if (typeof window !== "undefined") {
    // Client-side: use browser locale
    const locale = navigator.language || navigator.languages?.[0] || "en-IN";
    if (locale.includes("IN")) return "IN";
    if (locale.includes("US")) return "US";
    if (locale.includes("GB")) return "GB";
    if (locale.includes("AU")) return "AU";
    if (locale.includes("CA")) return "CA";
    if (locale.includes("AE")) return "AE";
    if (locale.includes("SG")) return "SG";
  }

  if (req) {
    // Server-side: check headers
    const countryHeader = req.headers.get("cf-ipcountry") || req.headers.get("x-country-code");
    if (countryHeader) {
      const upper = countryHeader.toUpperCase();
      if (["IN", "US", "GB", "AU", "CA", "AE", "SG"].includes(upper)) {
        return upper as CountryCode;
      }
    }
  }

  // Default to India
  return "IN";
}

/**
 * Get pricing for current user's country
 */
export function getCurrentPricing(): CountryPricing {
  if (typeof window !== "undefined") {
    // Try to get from localStorage (user preference)
    const saved = localStorage.getItem("astrosetu_country");
    if (saved && ["IN", "US", "GB", "AU", "CA", "AE", "SG", "OTHER"].includes(saved)) {
      return getCountryPricing(saved as CountryCode);
    }
  }
  return getCountryPricing(detectCountry());
}
