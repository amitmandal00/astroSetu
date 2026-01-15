/**
 * Free Life Summary gating rules.
 *
 * Goal: the free report must feel valuable/engaging while still leaving room to upsell deeper reports.
 * We gate by section count (not words) to keep logic deterministic.
 */
export function getFreeLifeSummaryGateAfterSection(totalSections: number): number {
  if (!Number.isFinite(totalSections) || totalSections <= 0) return 0;

  // Show a meaningful slice: at least 5 sections or ~75% of sections, whichever is higher (capped at total).
  return Math.min(totalSections, Math.max(5, Math.floor(totalSections * 0.75)));
}



