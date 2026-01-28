/**
 * Future Windows Filter Utility
 * 
 * Ensures all displayed prediction windows are future-only relative to the user's current local time.
 * 
 * CRITICAL: All report types that output date ranges must use this utility to filter out past windows.
 * 
 * Product Contract:
 * - All displayed "prediction windows" must be future-only relative to the user's current local time
 * - If a window ends before now → drop it
 * - If a window overlaps now → trim start to now or label as "ongoing"
 * - If a report asks for "Year Analysis" → use current year and forward, not previous year
 */

export type DateRange = { start: string; end: string }; // ISO strings

export type FilterMode = "futureOnly" | "futureOrOngoing";

/**
 * Filters date ranges to only include future windows relative to the user's current local time.
 * 
 * @param ranges - Array of date ranges to filter
 * @param now - Current date/time (defaults to browser local time)
 * @param mode - "futureOnly" drops ongoing windows, "futureOrOngoing" trims them to now
 * @returns Filtered array of future-only date ranges
 * 
 * @example
 * ```ts
 * const future = filterFutureWindows(rawWindows, new Date(), "futureOrOngoing");
 * ```
 */
export function filterFutureWindows(
  ranges: DateRange[],
  now: Date = new Date(),
  mode: FilterMode = "futureOrOngoing"
): DateRange[] {
  const nowMs = now.getTime();

  return ranges
    .map(r => {
      const s = new Date(r.start).getTime();
      const e = new Date(r.end).getTime();

      // Skip invalid dates
      if (Number.isNaN(s) || Number.isNaN(e)) {
        return null;
      }

      // Drop windows that are fully in the past
      if (e <= nowMs) {
        return null;
      }

      // Handle ongoing windows based on mode
      if (mode === "futureOnly" && s < nowMs) {
        // Drop ongoing windows entirely
        return null;
      }

      // futureOrOngoing: trim ongoing windows to "now"
      if (s < nowMs) {
        return {
          start: now.toISOString(),
          end: r.end
        };
      }

      // Window is fully in the future
      return r;
    })
    .filter((r): r is DateRange => r !== null);
}

/**
 * Gets the current year in the user's local timezone.
 * 
 * @returns Current year as a number
 */
export function getCurrentYear(): number {
  return new Date().getFullYear();
}

/**
 * Ensures a year is not in the past relative to the current year.
 * 
 * @param year - Year to validate
 * @returns Year that is at least the current year
 * 
 * @example
 * ```ts
 * const analysisYear = ensureFutureYear(requestedYear); // max(requestedYear, currentYear)
 * ```
 */
export function ensureFutureYear(year: number): number {
  const currentYear = getCurrentYear();
  return Math.max(year, currentYear);
}

/**
 * Gets the default year for year analysis reports.
 * 
 * If it's late December (after Dec 20), defaults to next year for forward-looking analysis.
 * Otherwise defaults to current year.
 * 
 * @returns Default year for year analysis
 */
export function getDefaultYearAnalysisYear(): number {
  const now = new Date();
  const month = now.getMonth(); // 0-11 (Jan = 0, Dec = 11)
  const day = now.getDate();
  
  // If it's late December (after Dec 20), default to next year for forward-looking analysis
  if (month === 11 && day > 20) {
    return now.getFullYear() + 1;
  }
  
  return now.getFullYear();
}

