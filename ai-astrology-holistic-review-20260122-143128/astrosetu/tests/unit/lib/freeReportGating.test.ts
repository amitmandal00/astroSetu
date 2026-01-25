import { describe, it, expect } from "vitest";
import { getFreeLifeSummaryGateAfterSection } from "@/lib/ai-astrology/freeReportGating";

describe("freeReportGating", () => {
  describe("getFreeLifeSummaryGateAfterSection", () => {
    it("returns 0 for non-positive or invalid lengths", () => {
      expect(getFreeLifeSummaryGateAfterSection(0)).toBe(0);
      expect(getFreeLifeSummaryGateAfterSection(-1)).toBe(0);
      expect(getFreeLifeSummaryGateAfterSection(Number.NaN)).toBe(0);
    });

    it("shows at least 5 sections when possible", () => {
      expect(getFreeLifeSummaryGateAfterSection(5)).toBe(5);
      expect(getFreeLifeSummaryGateAfterSection(6)).toBe(5);
      expect(getFreeLifeSummaryGateAfterSection(7)).toBe(5);
    });

    it("uses ~75% gate for larger reports", () => {
      expect(getFreeLifeSummaryGateAfterSection(8)).toBe(6); // floor(8*0.75)=6
      expect(getFreeLifeSummaryGateAfterSection(12)).toBe(9); // floor(12*0.75)=9
      expect(getFreeLifeSummaryGateAfterSection(20)).toBe(15); // floor(20*0.75)=15
    });

    it("never exceeds totalSections", () => {
      expect(getFreeLifeSummaryGateAfterSection(1)).toBe(1);
      expect(getFreeLifeSummaryGateAfterSection(4)).toBe(4);
    });
  });
});




