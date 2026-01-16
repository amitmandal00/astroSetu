import { describe, it, expect } from "vitest";
import { __test_parseAIResponse } from "@/lib/ai-astrology/reportGenerator";

describe("life-summary parser robustness", () => {
  it("parses required life-summary headings even when they omit ':'", () => {
    const aiText = `
Executive Summary
You are steady and reflective.

Top Strengths
- Resilience
- Patience
- Practical thinking

Key Challenges
- Overthinking
- Delay in decisions

Relationships & Communication
You prefer calm, direct talk.

Career & Money Themes
Stable growth over time.

Health & Energy Themes
Consistency beats intensity.

Growth & Spiritual Themes
Learning through repetition.

Next 30 Days: Quick Wins
- Do one small commitment daily
`;

    const parsed = __test_parseAIResponse(aiText, "life-summary");
    const titles = (parsed.sections || []).map((s) => s.title);

    // Should not collapse into a single section.
    expect(titles.length).toBeGreaterThanOrEqual(8);

    // Must include key required headings.
    expect(titles).toEqual(expect.arrayContaining(["Executive Summary", "Top Strengths", "Key Challenges"]));
  });
});


