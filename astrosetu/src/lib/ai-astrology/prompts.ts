/**
 * AI Prompt Templates for Astrology Reports
 * Versioned prompts to ensure consistency and never break old reports
 */

const SYSTEM_PROMPT_BASE = `You are a calm, experienced Vedic astrologer who explains complex astrological concepts in plain, simple English. 
Your role is to provide guidance and clarity, not fear or uncertainty.

Guidelines:
- Use clear, conversational language
- Avoid technical jargon unless explaining it simply
- Focus on actionable guidance and timing
- Never use fear-based language
- Always provide context for predictions
- Include practical remedies when relevant
- Be honest about uncertainties
- Frame everything as guidance, not absolute truth

Format your responses with clear sections, bullet points, and time windows when applicable.`;

export type PromptVersion = "v1.0";

export const PROMPT_VERSIONS: Record<PromptVersion, string> = {
  "v1.0": SYSTEM_PROMPT_BASE,
};

/**
 * Generate Life Summary Prompt
 */
export function generateLifeSummaryPrompt(
  birthDetails: {
    name: string;
    dob: string;
    tob: string;
    place: string;
    gender?: string;
  },
  astrologyData: {
    ascendant: string;
    moonSign: string;
    sunSign: string;
    nakshatra: string;
    planets: Array<{
      name: string;
      sign: string;
      house: number;
      degrees: number;
    }>;
  }
): string {
  return `${SYSTEM_PROMPT_BASE}

Generate a Life Summary report for ${birthDetails.name}.

Birth Details:
- Date: ${birthDetails.dob}
- Time: ${birthDetails.tob}
- Place: ${birthDetails.place}
${birthDetails.gender ? `- Gender: ${birthDetails.gender}` : ""}

Astrological Data:
- Ascendant (Rising Sign): ${astrologyData.ascendant}
- Sun Sign: ${astrologyData.sunSign}
- Moon Sign: ${astrologyData.moonSign}
- Nakshatra: ${astrologyData.nakshatra}

Planetary Positions:
${astrologyData.planets.map((p) => `- ${p.name}: ${p.sign} (House ${p.house}, ${p.degrees}°)`).join("\n")}

Generate a comprehensive Life Summary report with the following structure:

1. **Personality Overview** (2-3 paragraphs)
   - Core personality traits based on ascendant, sun, and moon signs
   - Natural strengths and talents
   - Communication style and approach to life

2. **Strengths** (bullet points, 5-7 items)
   - Natural abilities and positive traits
   - Areas where the person excels

3. **Areas for Growth** (bullet points, 3-5 items)
   - Challenges or weaknesses to be aware of
   - Opportunities for personal development

4. **Major Life Themes** (2-3 paragraphs)
   - Key life lessons and themes based on planetary positions
   - Overall life direction and purpose indicators

5. **Key Insights** (bullet points, 4-6 items)
   - Important patterns or combinations in the chart
   - Notable planetary placements and their meanings

Keep the tone warm, encouraging, and empowering. This is a free preview to help the person understand their chart.`;
}

/**
 * Generate Marriage Timing Prompt
 */
export function generateMarriageTimingPrompt(
  birthDetails: {
    name: string;
    dob: string;
    tob: string;
    place: string;
    gender?: string;
  },
  astrologyData: {
    ascendant: string;
    moonSign: string;
    venus: { sign: string; house: number; degrees: number };
    jupiter: { sign: string; house: number; degrees: number };
    mars: { sign: string; house: number; degrees: number };
    seventhHouse: { sign: string; planets: string[] };
    currentDasha: string;
    nextDasha: string;
    manglik?: boolean;
    doshas?: string[];
  }
): string {
  return `${SYSTEM_PROMPT_BASE}

Generate a Marriage Timing Report for ${birthDetails.name}.

Birth Details:
- Date: ${birthDetails.dob}
- Time: ${birthDetails.tob}
- Place: ${birthDetails.place}
${birthDetails.gender ? `- Gender: ${birthDetails.gender}` : ""}

Astrological Data:
- Ascendant: ${astrologyData.ascendant}
- Moon Sign: ${astrologyData.moonSign}
- Current Dasha: ${astrologyData.currentDasha}
- Next Dasha: ${astrologyData.nextDasha}
- Venus (Love/Marriage): ${astrologyData.venus.sign} (House ${astrologyData.venus.house})
- Jupiter (Spouse/Blessings): ${astrologyData.jupiter.sign} (House ${astrologyData.jupiter.house})
- Mars (Passion/Challenges): ${astrologyData.mars.sign} (House ${astrologyData.mars.house})
- 7th House (Marriage): ${astrologyData.seventhHouse.sign} with planets: ${astrologyData.seventhHouse.planets.join(", ") || "None"}
${astrologyData.manglik ? "- Manglik Dosha: Present" : ""}
${astrologyData.doshas && astrologyData.doshas.length > 0 ? `- Other Doshas: ${astrologyData.doshas.join(", ")}` : ""}

Generate a comprehensive Marriage Timing Report with the following structure:

1. **Marriage Timing Overview** (2-3 paragraphs)
   - Analysis of ideal marriage windows based on Dasha periods
   - Current planetary influences on marriage prospects
   - Timing indicators from Venus and Jupiter positions

2. **Ideal Marriage Windows** (specific time periods)
   - Best periods for marriage based on Dasha and transits
   - Include approximate dates/years when possible
   - Explain why these periods are favorable

3. **Delay Factors** (if applicable)
   - Any doshas or challenging planetary placements
   - Explain causes of delays in simple terms
   - Don't use fear language, frame as timing rather than problems

4. **Compatibility Indicators** (bullet points, 5-7 items)
   - Ideal partner qualities based on 7th house
   - Signs of good compatibility
   - Areas to consider in a partner

5. **Remedies & Guidance** (bullet points, 4-6 items)
   - Simple, practical remedies (spiritual and non-religious)
   - Actions to take during favorable periods
   - Ways to strengthen marriage prospects

Keep the tone supportive and clear. Focus on timing and guidance, not fear or worry.`;
}

/**
 * Generate Career & Money Path Prompt
 */
export function generateCareerMoneyPrompt(
  birthDetails: {
    name: string;
    dob: string;
    tob: string;
    place: string;
    gender?: string;
  },
  astrologyData: {
    ascendant: string;
    sunSign: string;
    moonSign: string;
    tenthHouse: { sign: string; planets: string[] }; // Career house
    secondHouse: { sign: string; planets: string[] }; // Money house
    currentDasha: string;
    nextDasha: string;
    careerPlanets: Array<{ name: string; sign: string; house: number }>;
  }
): string {
  return `${SYSTEM_PROMPT_BASE}

Generate a Career & Money Path Report for ${birthDetails.name}.

Birth Details:
- Date: ${birthDetails.dob}
- Time: ${birthDetails.tob}
- Place: ${birthDetails.place}
${birthDetails.gender ? `- Gender: ${birthDetails.gender}` : ""}

Astrological Data:
- Ascendant: ${astrologyData.ascendant}
- Sun Sign: ${astrologyData.sunSign}
- Moon Sign: ${astrologyData.moonSign}
- Current Dasha: ${astrologyData.currentDasha}
- Next Dasha: ${astrologyData.nextDasha}
- 10th House (Career): ${astrologyData.tenthHouse.sign} with planets: ${astrologyData.tenthHouse.planets.join(", ") || "None"}
- 2nd House (Money): ${astrologyData.secondHouse.sign} with planets: ${astrologyData.secondHouse.planets.join(", ") || "None"}
- Career Planets: ${astrologyData.careerPlanets.map((p) => `${p.name} in ${p.sign} (House ${p.house})`).join(", ")}

Generate a comprehensive Career & Money Path Report with the following structure:

1. **Career Direction Overview** (2-3 paragraphs)
   - Best career paths based on 10th house and career planets
   - Natural talents and professional strengths
   - Work style and approach to career

2. **Ideal Career Fields** (bullet points, 5-7 items)
   - Specific industries or fields that align with the chart
   - Roles and professions that would be fulfilling
   - Skills to develop or leverage

3. **Money & Financial Phases** (2-3 paragraphs)
   - Financial patterns based on 2nd house and related planets
   - Money growth phases in life
   - Best periods for financial planning and investment

4. **Career Timing** (specific periods)
   - Best times for job changes or career moves
   - Favorable periods based on Dasha and transits
   - Include approximate dates/years when possible

5. **Financial Guidance** (bullet points, 4-6 items)
   - Money management tips
   - Investment timing
   - Ways to improve financial stability

6. **Action Steps** (bullet points, 5-7 items)
   - Immediate actions to take
   - Long-term career development
   - Financial planning recommendations

Keep the tone practical and empowering. Focus on opportunities and actionable guidance.`;
}

/**
 * Generate Daily Guidance Prompt
 */
export function generateDailyGuidancePrompt(
  birthDetails: {
    name: string;
    dob: string;
    tob: string;
    place: string;
  },
  dailyAstrology: {
    tithi: string;
    nakshatra: string;
    currentTransits: string[];
    planetaryDay: string;
  }
): string {
  return `${SYSTEM_PROMPT_BASE}

Generate Daily Guidance for ${birthDetails.name} for today.

Birth Details:
- Date: ${birthDetails.dob}
- Time: ${birthDetails.tob}
- Place: ${birthDetails.place}

Today's Astrological Influences:
- Tithi: ${dailyAstrology.tithi}
- Nakshatra: ${dailyAstrology.nakshatra}
- Planetary Day: ${dailyAstrology.planetaryDay}
- Current Transits: ${dailyAstrology.currentTransits.join(", ")}

Generate concise daily guidance with the following structure:

1. **Today is Good For** (bullet points, 3-5 items)
   - Specific activities that are favored today
   - Actions to take advantage of positive influences

2. **Avoid Today** (bullet points, 2-4 items)
   - Activities to postpone
   - Things to be cautious about

3. **Key Actions** (bullet points, 3-5 items)
   - Important actions to take today
   - Priorities for the day

4. **Planetary Influence** (1 paragraph)
   - Brief explanation of today's astrological energy
   - How it affects the person based on their chart

5. **Guidance** (1-2 paragraphs)
   - Overall guidance for the day
   - Things to keep in mind

Keep it concise, practical, and actionable. Limit to 200-300 words total.`;
}

