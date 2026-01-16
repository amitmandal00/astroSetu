/**
 * Integration Test: Future Windows Validation
 * 
 * Asserts that no displayed window ends before now for all report types.
 * This test validates that the filterFutureWindows utility is applied correctly.
 */

import { filterFutureWindows, ensureFutureYear, getCurrentYear, type DateRange } from "@/lib/time/futureWindows";
import { getMarriageTimingWindows, getCareerTimingWindows, getMajorLifePhaseWindows, getYearAnalysisDateRange } from "@/lib/ai-astrology/dateHelpers";

describe("Future Windows Integration - All Report Types", () => {
  const now = new Date();
  
  describe("Marriage Timing Windows", () => {
    it("should not include past years in timeline", () => {
      const windows = getMarriageTimingWindows();
      
      // CRITICAL: timelineStart must be >= currentYear
      expect(windows.timelineStart).toBeGreaterThanOrEqual(getCurrentYear());
      expect(windows.timelineEnd).toBeGreaterThan(windows.timelineStart);
      
      // Primary and secondary windows must be in the future
      expect(windows.primaryWindowStart).toBeGreaterThanOrEqual(getCurrentYear());
      expect(windows.secondaryWindowStart).toBeGreaterThanOrEqual(getCurrentYear());
    });
  });
  
  describe("Career Timing Windows", () => {
    it("should not include past years in timeline", () => {
      const windows = getCareerTimingWindows();
      
      // CRITICAL: timelineStart must be >= currentYear
      expect(windows.timelineStart).toBeGreaterThanOrEqual(getCurrentYear());
      expect(windows.timelineEnd).toBeGreaterThan(windows.timelineStart);
      
      // All windows must start in current year or future
      expect(windows.next12to18Months.startYear).toBeGreaterThanOrEqual(getCurrentYear());
      expect(windows.following2to3Years.startYear).toBeGreaterThanOrEqual(getCurrentYear());
      expect(windows.longTerm.startYear).toBeGreaterThanOrEqual(getCurrentYear());
    });
  });
  
  describe("Major Life Phase Windows", () => {
    it("should start from current year", () => {
      const windows = getMajorLifePhaseWindows();
      
      // CRITICAL: startYear must be >= currentYear
      expect(windows.startYear).toBeGreaterThanOrEqual(getCurrentYear());
      expect(windows.endYear).toBeGreaterThan(windows.startYear);
      
      // All years in yearByYear must be >= currentYear
      windows.yearByYear.forEach(year => {
        expect(year).toBeGreaterThanOrEqual(getCurrentYear());
      });
    });
  });
  
  describe("Year Analysis Date Range", () => {
    it("should start from current date", () => {
      const range = getYearAnalysisDateRange();
      const currentYear = getCurrentYear();
      
      // CRITICAL: startYear must be >= currentYear
      expect(range.startYear).toBeGreaterThanOrEqual(currentYear);
      expect(range.endYear).toBeGreaterThanOrEqual(range.startYear);
      
      // Contract: range should cover "now" and point forward (it may start at month-begin).
      const startDate = new Date(range.startDate);
      const endDate = new Date(range.endDate);
      // End must be in the future relative to now.
      expect(endDate.getTime()).toBeGreaterThan(now.getTime());
      // Now should be within [start, end] with small tolerance for clock skew.
      expect(startDate.getTime()).toBeLessThanOrEqual(now.getTime() + 60_000);
      expect(endDate.getTime()).toBeGreaterThanOrEqual(now.getTime() - 60_000);
    });
  });
  
  describe("filterFutureWindows applied to sample windows", () => {
    it("should filter out past windows from marriage timing", () => {
      // Simulate windows that might include past dates
      const ranges: DateRange[] = [
        { start: "2025-01-01T00:00:00Z", end: "2025-12-31T23:59:59Z" }, // Past
        { start: now.toISOString(), end: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString() }, // Future
      ];
      
      const filtered = filterFutureWindows(ranges, now, "futureOrOngoing");
      
      // Should only keep future windows
      filtered.forEach(range => {
        const endTime = new Date(range.end).getTime();
        expect(endTime).toBeGreaterThan(now.getTime());
      });
    });
    
    it("should filter out past windows from career timing", () => {
      const ranges: DateRange[] = [
        { start: "2024-01-01T00:00:00Z", end: "2024-12-31T23:59:59Z" }, // Past
        { start: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(), end: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString() }, // Future
      ];
      
      const filtered = filterFutureWindows(ranges, now, "futureOrOngoing");
      
      // Should only keep future windows
      expect(filtered.length).toBeGreaterThan(0);
      filtered.forEach(range => {
        const endTime = new Date(range.end).getTime();
        expect(endTime).toBeGreaterThan(now.getTime());
      });
    });
  });
  
  describe("ensureFutureYear applied to year calculations", () => {
    it("should ensure all years are future", () => {
      const currentYear = getCurrentYear();
      const pastYear = currentYear - 1;
      
      // Should return current year if past year is provided
      expect(ensureFutureYear(pastYear)).toBe(currentYear);
      expect(ensureFutureYear(currentYear)).toBe(currentYear);
      expect(ensureFutureYear(currentYear + 1)).toBe(currentYear + 1);
    });
  });
});

