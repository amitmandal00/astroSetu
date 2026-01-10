/**
 * Static Content Constants
 * Precomputed text blocks that don't need AI generation
 * Reduces prompt tokens and improves consistency
 */

export const STATIC_DISCLAIMERS = {
  educational: "Educational guidance only",
  automated: "Fully automated",
  noSupport: "No live support",
};

export const STATIC_FORMATTING_GUIDE = {
  bulletPointMaxWords: 20,
  sectionSummaryMaxLines: 2,
  technicalTermExplanation: "What this means in daily life",
};

export const STATIC_METHODOLOGY_BLURB = {
  dataSource: "Based on: Ascendant + Moon Sign + Planetary Analysis",
  confidenceNote: "(Strong for strategic planning, weaker for exact dates)",
};

export const STATIC_REPORT_INTRO = {
  lifeSummary: "This report provides a personalized life summary based on your birth chart.",
  marriageTiming: "This report analyzes your birth chart to identify favorable marriage timing windows.",
  careerMoney: "This report examines your birth chart for career and financial guidance.",
  fullLife: "This comprehensive report covers all major life areas based on your birth chart.",
  yearAnalysis: "This report provides strategic guidance for the upcoming year based on your birth chart.",
  majorLifePhase: "This report analyzes your birth chart for major life phase transitions.",
  decisionSupport: "This report provides astrological guidance for your decision-making process.",
};

export const STATIC_CONCLUSION_TEMPLATES = {
  whatThisMeans: "What This Means For You",
  nextSteps: "What You Should Focus on Now",
  keyTakeaways: "Key Takeaways",
};

/**
 * Formatting instructions that can be reused across prompts
 * Reduces token usage by not repeating in every prompt
 */
export const FORMATTING_INSTRUCTIONS = `
FORMATTING RULES:
- Use bullet points for lists (max ${STATIC_FORMATTING_GUIDE.bulletPointMaxWords} words per bullet)
- Start each major section with a 1-2 line summary
- After technical terms, always explain: "${STATIC_FORMATTING_GUIDE.technicalTermExplanation}"
- Use clear section headers and subsections
- Keep paragraphs concise (3-4 sentences max)
- Use bold text for emphasis on key points only
`;

/**
 * Language guidelines that don't need to be generated
 */
export const LANGUAGE_GUIDELINES = `
LANGUAGE RULES:
- Use calm, non-absolute language ("tends to", "favors", "may benefit from")
- Avoid fear language and absolute statements
- Use ranges and probabilities, not guarantees
- After predictions, add context: "These are favorable periods, not guarantees"
- Focus on guidance and timing, not definitive outcomes
`;

/**
 * Report structure templates (can be referenced instead of fully generating)
 */
export const REPORT_STRUCTURE_TEMPLATES = {
  sectionHeader: (title: string) => `## ${title}`,
  subsectionHeader: (title: string) => `### ${title}`,
  bulletPoint: (text: string) => `• ${text}`,
  keyTakeaway: (text: string) => `**Key Takeaway:** ${text}`,
  whatThisMeans: (text: string) => `${STATIC_CONCLUSION_TEMPLATES.whatThisMeans}: ${text}`,
};

/**
 * Get static disclaimer text (to be appended post-generation, not in prompt)
 */
export const getDisclaimerText = (): string => {
  return `
---
**Disclaimer:** ${STATIC_DISCLAIMERS.educational} • ${STATIC_DISCLAIMERS.automated} • ${STATIC_DISCLAIMERS.noSupport}
This report is generated using AI and traditional astrological calculations. 
It provides guidance based on planetary positions but should not replace professional advice.
`;
};

/**
 * Get methodology note (can be reused across reports)
 */
export const getMethodologyNote = (dataSource: string): string => {
  return `${STATIC_METHODOLOGY_BLURB.dataSource}: ${dataSource}`;
};

