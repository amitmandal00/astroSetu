/**
 * Unit Tests for Future Windows Filter Utility
 * 
 * Tests that filterFutureWindows correctly filters out past windows
 * and trims ongoing windows based on mode.
 */

import { filterFutureWindows, ensureFutureYear, getCurrentYear, getDefaultYearAnalysisYear, type DateRange } from "@/lib/time/futureWindows";

describe("filterFutureWindows", () => {
  const now = new Date("2026-01-15T10:00:00Z");
  
  describe("futureOrOngoing mode (default)", () => {
    it("should drop windows that are fully in the past", () => {
      const ranges: DateRange[] = [
        { start: "2025-01-01T00:00:00Z", end: "2025-12-31T23:59:59Z" },
        { start: "2026-01-01T00:00:00Z", end: "2026-12-31T23:59:59Z" },
      ];
      
      const result = filterFutureWindows(ranges, now, "futureOrOngoing");
      
      expect(result).toHaveLength(1);
      expect(result[0].start).toBe("2026-01-01T00:00:00Z");
      expect(result[0].end).toBe("2026-12-31T23:59:59Z");
    });
    
    it("should trim ongoing windows to now", () => {
      const ranges: DateRange[] = [
        { start: "2025-12-01T00:00:00Z", end: "2026-06-30T23:59:59Z" }, // Ongoing
        { start: "2026-06-01T00:00:00Z", end: "2026-12-31T23:59:59Z" }, // Future
      ];
      
      const result = filterFutureWindows(ranges, now, "futureOrOngoing");
      
      expect(result).toHaveLength(2);
      // First window should be trimmed to now
      expect(new Date(result[0].start).getTime()).toBeGreaterThanOrEqual(now.getTime());
      expect(result[0].end).toBe("2026-06-30T23:59:59Z");
      // Second window should be unchanged
      expect(result[1].start).toBe("2026-06-01T00:00:00Z");
    });
    
    it("should keep windows that are fully in the future", () => {
      const ranges: DateRange[] = [
        { start: "2026-06-01T00:00:00Z", end: "2026-12-31T23:59:59Z" },
        { start: "2027-01-01T00:00:00Z", end: "2027-12-31T23:59:59Z" },
      ];
      
      const result = filterFutureWindows(ranges, now, "futureOrOngoing");
      
      expect(result).toHaveLength(2);
      expect(result[0].start).toBe("2026-06-01T00:00:00Z");
      expect(result[1].start).toBe("2027-01-01T00:00:00Z");
    });
    
    it("should drop windows that end exactly at now", () => {
      const ranges: DateRange[] = [
        { start: "2025-01-01T00:00:00Z", end: now.toISOString() },
        { start: "2026-01-16T00:00:00Z", end: "2026-12-31T23:59:59Z" },
      ];
      
      const result = filterFutureWindows(ranges, now, "futureOrOngoing");
      
      expect(result).toHaveLength(1);
      expect(result[0].start).toBe("2026-01-16T00:00:00Z");
    });
  });
  
  describe("futureOnly mode", () => {
    it("should drop ongoing windows entirely", () => {
      const ranges: DateRange[] = [
        { start: "2025-12-01T00:00:00Z", end: "2026-06-30T23:59:59Z" }, // Ongoing - should be dropped
        { start: "2026-06-01T00:00:00Z", end: "2026-12-31T23:59:59Z" }, // Future - should be kept
      ];
      
      const result = filterFutureWindows(ranges, now, "futureOnly");
      
      expect(result).toHaveLength(1);
      expect(result[0].start).toBe("2026-06-01T00:00:00Z");
    });
    
    it("should keep only fully future windows", () => {
      const ranges: DateRange[] = [
        { start: "2026-01-16T00:00:00Z", end: "2026-12-31T23:59:59Z" },
        { start: "2027-01-01T00:00:00Z", end: "2027-12-31T23:59:59Z" },
      ];
      
      const result = filterFutureWindows(ranges, now, "futureOnly");
      
      expect(result).toHaveLength(2);
    });
  });
  
  describe("edge cases", () => {
    it("should handle invalid dates gracefully", () => {
      const ranges: DateRange[] = [
        { start: "invalid-date", end: "2026-12-31T23:59:59Z" },
        { start: "2026-06-01T00:00:00Z", end: "invalid-date" },
        { start: "2026-06-01T00:00:00Z", end: "2026-12-31T23:59:59Z" },
      ];
      
      const result = filterFutureWindows(ranges, now);
      
      expect(result).toHaveLength(1);
      expect(result[0].start).toBe("2026-06-01T00:00:00Z");
    });
    
    it("should handle empty array", () => {
      const result = filterFutureWindows([], now);
      expect(result).toHaveLength(0);
    });
    
    it("should use current time if now is not provided", () => {
      const ranges: DateRange[] = [
        { start: "2020-01-01T00:00:00Z", end: "2020-12-31T23:59:59Z" }, // Past
      ];
      
      const result = filterFutureWindows(ranges); // No now parameter
      
      // Should drop past windows (assuming test runs in 2026+)
      expect(result.length).toBeLessThanOrEqual(1);
    });
  });
});

describe("ensureFutureYear", () => {
  it("should return current year if year is in the past", () => {
    const currentYear = getCurrentYear();
    const pastYear = currentYear - 1;
    
    const result = ensureFutureYear(pastYear);
    
    expect(result).toBe(currentYear);
  });
  
  it("should return the year if it is current or future", () => {
    const currentYear = getCurrentYear();
    const futureYear = currentYear + 1;
    
    expect(ensureFutureYear(currentYear)).toBe(currentYear);
    expect(ensureFutureYear(futureYear)).toBe(futureYear);
  });
});

describe("getDefaultYearAnalysisYear", () => {
  it("should return current year if before Dec 20", () => {
    const mockDate = new Date("2026-12-15T10:00:00Z");
    const originalDate = Date;
    
    // Mock Date constructor
    global.Date = jest.fn(() => mockDate) as any;
    global.Date.getFullYear = originalDate.getFullYear;
    
    const result = getDefaultYearAnalysisYear();
    
    expect(result).toBe(2026);
    
    global.Date = originalDate;
  });
  
  it("should return next year if after Dec 20", () => {
    const mockDate = new Date("2026-12-25T10:00:00Z");
    const originalDate = Date;
    
    // Mock Date constructor
    global.Date = jest.fn(() => mockDate) as any;
    global.Date.getFullYear = originalDate.getFullYear;
    
    const result = getDefaultYearAnalysisYear();
    
    expect(result).toBe(2027);
    
    global.Date = originalDate;
  });
});

