import { describe, it, expect } from "vitest";
import { AI_PROMPT_TEMPLATES } from "@/lib/ai-astrology/prompts";
import { getMockReport } from "@/lib/ai-astrology/mocks/fixtures";

describe("Life Summary engagement guardrails", () => {
  it("prompt must require a minimum number of sections", () => {
    const prompt = AI_PROMPT_TEMPLATES["v1.0"].lifeSummary(
      { name: "Test", dob: "2000-01-01" },
      { ascendant: "Aries" }
    );
    expect(prompt).toMatch(/at least 8 sections/i);
    expect(prompt).toMatch(/Next 30 Days/i);
  });

  it("MOCK_MODE life-summary must contain enough sections to feel valuable", () => {
    const report = getMockReport("life-summary");
    expect(report.sections?.length || 0).toBeGreaterThanOrEqual(8);
  });
});


