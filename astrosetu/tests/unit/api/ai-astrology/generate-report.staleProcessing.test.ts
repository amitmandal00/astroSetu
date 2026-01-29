import { describe, expect, it } from "vitest";
import { isProcessingStale } from "@/lib/ai-astrology/reportProcessing";

const TEN_MINUTES_MS = 10 * 60 * 1000;

describe("isProcessingStale", () => {
  it("returns true when processing has been running longer than ten minutes", () => {
    const updatedAt = new Date(Date.now() - TEN_MINUTES_MS - 3000).toISOString();
    expect(isProcessingStale({ updatedAtIso: updatedAt, reportType: "life-summary" })).toBe(true);
  });

  it("returns false for recent processing timestamps", () => {
    const updatedAt = new Date(Date.now() - 30 * 1000).toISOString();
    expect(isProcessingStale({ updatedAtIso: updatedAt, reportType: "life-summary" })).toBe(false);
  });
});

