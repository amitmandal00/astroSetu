/**
 * Integration: report output post-processing blocks past years
 *
 * This test simulates a parsed LLM output that contains past timing windows
 * and asserts our centralized post-processor never allows past years through.
 */

import { describe, it, expect } from "vitest";
import { ensureFutureWindows } from "@/lib/ai-astrology/ensureFutureWindows";
import type { ReportContent } from "@/lib/ai-astrology/types";

describe("report output future-only timing (integration)", () => {
  it("removes/normalizes past years in timing fields before rendering", () => {
    const now = new Date("2026-01-15T10:00:00Z");
    const currentYear = 2026;

    const llmLike: ReportContent = {
      title: "Year Analysis Report",
      sections: [
        {
          title: "Best Timing Windows",
          content: "Best windows: late 2023 / early 2024. Secondary: Mar–Jun 2024.",
        },
        {
          title: "Other Section",
          content: "Your birth year 1984 is part of input; ignore.",
        },
      ],
      bestPeriods: [
        { months: ["March", "April"], focus: "Career", description: "Mar–Apr 2024 is strong." },
      ],
      cautionPeriods: [
        { months: ["September"], focus: "Avoid", description: "Sep 2023 can be volatile." },
      ],
    };

    const normalized = ensureFutureWindows("year-analysis", llmLike, { now, timeZone: "Australia/Melbourne" });

    // Scan only 20xx years and enforce future-only.
    const years = JSON.stringify(normalized).match(/\b20\d{2}\b/g) || [];
    expect(years.length).toBeGreaterThan(0);
    expect(years.every((y) => Number(y) >= currentYear)).toBe(true);
  });
});


