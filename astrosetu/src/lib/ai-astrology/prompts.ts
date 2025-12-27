/**
 * AI Prompt Templates for Astrology Reports
 * Versioned prompts for consistent AI responses
 */

export const AI_PROMPT_SYSTEM_MESSAGE = `
You are a calm, experienced Vedic astrologer.
Explain in plain English.
Avoid fear language.
Focus on guidance and timing.
Provide clear, actionable insights.
`;

export const AI_PROMPT_TEMPLATES = {
  "v1.0": {
    lifeSummary: (birthDetails: any, planetaryData: any) => `
      ${AI_PROMPT_SYSTEM_MESSAGE}

      INPUT:
      Here are the birth details: ${JSON.stringify(birthDetails, null, 2)}
      Here is the planetary data: ${JSON.stringify(planetaryData, null, 2)}

      OUTPUT:
      Generate a "Life Summary" report. Focus on personality traits, strengths, weaknesses, and major life themes.
      Use clear sections and bullet points.
      `,

    marriageTiming: (birthDetails: any, planetaryData: any) => `
      ${AI_PROMPT_SYSTEM_MESSAGE}

      INPUT:
      Here are the birth details: ${JSON.stringify(birthDetails, null, 2)}
      Here is the planetary data: ${JSON.stringify(planetaryData, null, 2)}

      OUTPUT:
      Generate a "Marriage Timing Report". Focus on ideal marriage windows, potential delay causes (explained simply), compatibility indicators, and non-religious/spiritual remedies.
      Use clear sections and bullet points.
      `,

    careerMoney: (birthDetails: any, planetaryData: any) => `
      ${AI_PROMPT_SYSTEM_MESSAGE}

      INPUT:
      Here are the birth details: ${JSON.stringify(birthDetails, null, 2)}
      Here is the planetary data: ${JSON.stringify(planetaryData, null, 2)}

      OUTPUT:
      Generate a "Career & Money Path Report". Focus on best career directions, job change timings, and money growth phases.
      Use clear sections and bullet points.
      `,

    dailyGuidance: (birthDetails: any, planetaryData: any, currentTransits: any) => `
      ${AI_PROMPT_SYSTEM_MESSAGE}

      INPUT:
      Here are the birth details: ${JSON.stringify(birthDetails, null, 2)}
      Here is the planetary data: ${JSON.stringify(planetaryData, null, 2)}
      Here are today's planetary transits: ${JSON.stringify(currentTransits, null, 2)}

      OUTPUT:
      Generate a "Daily Guidance" report for today. Include "Today is good for..." and "Avoid today..." sections with simple actions.
      Use clear sections and bullet points.
      `,
  },
};

/**
 * Generate prompt for Life Summary report
 */
export function generateLifeSummaryPrompt(birthDetails: any, planetaryData: any): string {
  return AI_PROMPT_TEMPLATES["v1.0"].lifeSummary(birthDetails, planetaryData);
}

/**
 * Generate prompt for Marriage Timing report
 */
export function generateMarriageTimingPrompt(birthDetails: any, planetaryData: any): string {
  return AI_PROMPT_TEMPLATES["v1.0"].marriageTiming(birthDetails, planetaryData);
}

/**
 * Generate prompt for Career & Money report
 */
export function generateCareerMoneyPrompt(birthDetails: any, planetaryData: any): string {
  return AI_PROMPT_TEMPLATES["v1.0"].careerMoney(birthDetails, planetaryData);
}

/**
 * Generate prompt for Daily Guidance report
 */
export function generateDailyGuidancePrompt(
  birthDetails: any,
  planetaryData: any,
  currentTransits: any
): string {
  return AI_PROMPT_TEMPLATES["v1.0"].dailyGuidance(birthDetails, planetaryData, currentTransits);
}
