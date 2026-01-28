/**
 * Price formatting utilities
 * Centralized price formatting for consistency across the application
 */

/**
 * Format a price amount (in cents) to a display string
 * @param amount - Price in cents (e.g., 50 for AU$0.50)
 * @param currency - Currency code (default: "aud")
 * @param includeGst - Whether to include "(incl. GST)" suffix (default: true for AUD)
 * @returns Formatted price string (e.g., "AU$0.50 (incl. GST)")
 */
export function formatPrice(
  amount: number,
  currency: string = "aud",
  includeGst: boolean = true
): string {
  // Convert cents to dollars
  const dollars = amount / 100;
  
  // Format currency symbol
  const currencySymbol = currency.toUpperCase() === "AUD" ? "AU$" : "$";
  
  // Format to 2 decimal places
  const formattedAmount = dollars.toFixed(2);
  
  // Build result
  let result = `${currencySymbol}${formattedAmount}`;
  
  // Add GST suffix for AUD
  if (includeGst && currency.toUpperCase() === "AUD") {
    result += " (incl. GST)";
  }
  
  return result;
}

/**
 * Format price without GST suffix
 * @param amount - Price in cents
 * @param currency - Currency code (default: "aud")
 * @returns Formatted price string (e.g., "AU$0.50")
 */
export function formatPriceWithoutGst(amount: number, currency: string = "aud"): string {
  return formatPrice(amount, currency, false);
}

/**
 * Format price with custom description
 * @param amount - Price in cents
 * @param currency - Currency code (default: "aud")
 * @param description - Additional description to append
 * @returns Formatted price string (e.g., "AU$0.50 (incl. GST) • One-time")
 */
export function formatPriceWithDescription(
  amount: number,
  currency: string = "aud",
  description?: string
): string {
  const basePrice = formatPrice(amount, currency, true);
  
  if (description) {
    return `${basePrice} • ${description}`;
  }
  
  return basePrice;
}

