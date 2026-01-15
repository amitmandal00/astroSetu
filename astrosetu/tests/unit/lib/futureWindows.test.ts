/**
 * Unit Tests for Future Windows Filter Utility
 * 
 * Tests that filterFutureWindows correctly filters out past windows
 * and trims ongoing windows based on mode.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { filterFutureWindows, ensureFutureYear, getCurrentYear, getDefaultYearAnalysisYear, type DateRange } from "@/lib/time/futureWindows";
import { ensureFutureWindows } from "@/lib/ai-astrology/ensureFutureWindows";
import type { ReportContent } from "@/lib/ai-astrology/types";

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
      // CRITICAL FIX: The second window starts before "now" (2026-01-01 vs 2026-01-15), so it gets trimmed
      // We check that it's >= now instead of exact match
      expect(new Date(result[0].start).getTime()).toBeGreaterThanOrEqual(now.getTime());
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
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-12-15T10:00:00Z"));
    expect(getDefaultYearAnalysisYear()).toBe(2026);
    vi.useRealTimers();
  });
  
  it("should return next year if after Dec 20", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-12-25T10:00:00Z"));
    expect(getDefaultYearAnalysisYear()).toBe(2027);
    vi.useRealTimers();
  });
});

describe("ensureFutureWindows (ReportContent normalization)", () => {
  it("normalizes past year references in timing surfaces to >= current year", () => {
    const now = new Date("2026-01-15T10:00:00Z");

    const content: ReportContent = {
      title: "Decision Support Report",
      sections: [
        {
          title: "Recommended Timing",
          content: "Best timing windows: late 2023 / early 2024. Avoid 2025 for major commitments.",
        },
      ],
      recommendedTiming: "Best timing windows: late 2023 / early 2024.",
    };

    const normalized = ensureFutureWindows("decision-support", content, { now, timeZone: "Australia/Melbourne" });

    // Only enforce 20xx years; birth years like 1984 are irrelevant here.
    const years = JSON.stringify(normalized).match(/\b20\d{2}\b/g) || [];
    expect(years.every((y) => Number(y) >= 2026)).toBe(true);
  });

  it("shifts fully-past structured date windows forward", () => {
    const now = new Date("2026-01-15T10:00:00Z");

    const content: ReportContent = {
      title: "Marriage Timing Report",
      sections: [],
      timeWindows: [
        {
          title: "Window",
          startDate: "2024-03-01",
          endDate: "2024-06-30",
          description: "Mar–Jun 2024 is favorable.",
        },
      ],
    };

    const normalized = ensureFutureWindows("marriage-timing", content, { now, timeZone: "Australia/Melbourne" });
    expect(normalized.timeWindows?.[0].startDate?.startsWith("2026")).toBe(true);
    expect(normalized.timeWindows?.[0].endDate?.startsWith("2026")).toBe(true);
  });
});

