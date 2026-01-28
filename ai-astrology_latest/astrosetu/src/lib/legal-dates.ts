/**
 * Central configuration for legal document dates
 * Update these dates when policies are created or modified
 */

export const LEGAL_DATES = {
  // When policies first became effective
  EFFECTIVE_DATE: "December 26, 2024",
  
  // When policies were last updated
  // Update this whenever you modify any policy
  LAST_UPDATED: "December 26, 2024",
  
  // Copyright year (will be made dynamic, but keeping for reference)
  COPYRIGHT_YEAR: new Date().getFullYear(),
} as const;

