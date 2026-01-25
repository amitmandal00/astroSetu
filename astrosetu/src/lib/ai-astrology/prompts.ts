/**
 * AI Prompt Templates for Astrology Reports
 * Versioned prompts for consistent AI responses
 * 
 * Note: Static content (disclaimers, formatting) has been moved to staticContent.ts
 * to reduce prompt tokens and improve consistency.
 */

// CRITICAL FIX (ChatGPT): Import futureWindows at top level to avoid build-time module resolution issues
// Previous: Used require() inside functions which can cause build failures
import { getCurrentYear, ensureFutureYear } from "../time/futureWindows";

/**
 * CRITICAL FIX (Priority 2): Add JSON schema instruction to prompts
 * This ensures model outputs valid JSON that can be parsed reliably
 */
const JSON_SCHEMA_INSTRUCTION = `

CRITICAL OUTPUT FORMAT:
You MUST output valid JSON only, following this exact schema:
{
  "title": "Report Title",
  "sections": [
    {
      "title": "Section Title",
      "content": "Section content text...",
      "bullets": ["bullet 1", "bullet 2"]
    }
  ],
  "summary": "Overall summary text",
  "executiveSummary": "Executive summary (for full-life reports)",
  "keyInsights": ["insight 1", "insight 2"]
}

OUTPUT RULES:
- Output ONLY valid JSON, no markdown code blocks, no explanations
- Ensure all sections have both "title" and "content" fields
- Minimum 4-6 sections for comprehensive reports
- Each section content should be 150-300 words
- Total word count must meet minimum requirements (800+ words for most reports, 1300+ for full-life)
`;

export const AI_PROMPT_SYSTEM_MESSAGE = `
You are a calm, experienced Vedic astrologer.
Explain in plain English.
Avoid fear language.
Focus on guidance and timing.
Provide clear, actionable insights.
${JSON_SCHEMA_INSTRUCTION}

TIME WINDOW GUARDRail (NON-NEGOTIABLE):
- You will be given NOW_ISO (today) and CURRENT_YEAR.
- ALL timing windows / years / date ranges MUST be in the FUTURE relative to NOW_ISO.
- Do NOT mention past years in "best timing windows", "recommended timing", "timeframe", or "periods to avoid".

CRITICAL REPETITION RULES:
- Reduce repetition across sections - keep content unique and non-redundant
- Allow repetition ONLY in:
  * Executive Summary section
  * Final "What This Means For You" summary
- All other sections must provide NEW information, not repeat what was already covered
- Avoid repeating similar ideas across Summary, Breakdown, and Conclusion sections

REPORT-SPECIFIC INTELLIGENCE LAYERS (CRITICAL - Use different approaches per report type):
- Full Life Report: Integrated, coherent narrative covering all major life areas. Focus on life patterns and integration. Single coherent report, not stitched sub-reports. Target: ~1100-1300 words (MVP streamlined).
- Year Analysis Report: Tactical, calendar-based guidance. Focus on quarterly breakdowns and actionable timing. MVP structure: 4-6 core sections only. Target: ~800-900 words.
- Life Phase Report: Strategic, directional guidance. Focus on 3-5 year transitions, major opportunities, and directional shifts. Avoid repeating year-by-year details.
- Monthly Outlook: Lightweight, reflective guidance. Focus on current themes, gentle awareness, and mindset shifts. Avoid deep analysis or predictions.
- Marriage Timing Report: Precise & narrow focus. Focus on specific date ranges, timing windows, and marriage-specific factors. Avoid general life guidance.
- Decision Support Report: Context-specific guidance. Focus on decision options, timing for decisions, and decision-specific factors. Avoid general life themes.

REPORT STRUCTURE RULES:
FORMATTING RULES:
- Use bullet points for lists (max 20 words per bullet)
- Start each major section with a 1-2 line summary
- After technical terms, always explain: "What this means in daily life"
- Use clear section headers and subsections
- Keep paragraphs concise (3-4 sentences max)
- Use bold text for emphasis on key points only

LANGUAGE RULES:
- Use calm, non-absolute language ("tends to", "favors", "may benefit from")
- Avoid fear language and absolute statements
- Use ranges and probabilities, not guarantees
- After predictions, add context: "These are favorable periods, not guarantees"
- Focus on guidance and timing, not definitive outcomes

CRITICAL:
- Begin every major section with a 1-2 line summary (key takeaway)
- Avoid repeating similar traits
- End each section with "What this means for you" in plain English (ONLY in main sections, not subsections)
- Prioritize clarity over completeness
- Compress text by ~20% - be concise and impactful
`;

export const AI_PROMPT_TEMPLATES = {
  "v1.0": {
    lifeSummary: (birthDetails: any, planetaryData: any) => `
      ${AI_PROMPT_SYSTEM_MESSAGE}

      NOW_ISO: ${new Date().toISOString().split("T")[0]}
      CURRENT_YEAR: ${new Date().getFullYear()}

      INPUT:
      Here are the birth details: ${JSON.stringify(birthDetails, null, 2)}
      Here is the planetary data: ${JSON.stringify(planetaryData, null, 2)}

      OUTPUT:
      Generate a "Life Summary" report.
      
      STRUCTURE REQUIREMENTS:
      1. Start each major section with a 1-2 line key takeaway
      2. Focus on personality traits, strengths, weaknesses, and major life themes
      3. After technical terms (Ascendant, Nakshatra, etc.), explain what they mean in daily life
      4. Use short bullet points (max 20 words each)
      5. End each major section with "What this means for you" summary
      6. Use clear sections and bullet points
      7. MINIMUM DEPTH: Create **at least 8 sections** (avoid short/empty reports)

      REQUIRED SECTIONS (use these titles or very close):
      - Executive Summary
      - Top Strengths (5 bullets)
      - Key Challenges (3 bullets)
      - Relationships & Communication
      - Career & Money Themes
      - Health & Energy Themes
      - Growth & Spiritual Themes
      - Next 30 Days: Quick Wins (3 specific actions)

      IMPORTANT:
      - This is the free report; it must feel valuable and engaging.
      - Do NOT include paid timing windows or date-range predictions here.
      `,

    marriageTiming: (birthDetails: any, planetaryData: any, timingWindows?: any) => {
      const primaryDesc = timingWindows?.primaryDescription || "Late 2026 – Early 2027";
      const secondaryDesc = timingWindows?.secondaryDescription || "Mid 2028 – Early 2029";
      // CRITICAL FIX: Use future years only - never use past years
      // CRITICAL FIX (ChatGPT): Import moved to top level to avoid build-time module resolution issues
      // Previous: Used require() inside function which can cause build failures
      // Now: Uses top-level import (see line ~12)
      const currentYear = getCurrentYear();
      // CRITICAL: timelineStart must be >= currentYear (never use past years)
      const timelineStart = timingWindows?.timelineStart 
        ? ensureFutureYear(timingWindows.timelineStart) 
        : currentYear; // Default to current year, not currentYear - 1
      const timelineEnd = timingWindows?.timelineEnd || currentYear + 3;
      const timelineYears: number[] = [];
      for (let year = timelineStart; year <= timelineEnd; year++) {
        timelineYears.push(year);
      }
      const timelineVisual = timelineYears.map((year, idx) => {
        const isPrimary = year >= (timingWindows?.primaryWindowStart || timelineStart) && year <= (timingWindows?.primaryWindowEnd || timelineEnd);
        const isSecondary = year >= (timingWindows?.secondaryWindowStart || timelineStart + 2) && year <= (timingWindows?.secondaryWindowEnd || timelineEnd);
        return isPrimary || isSecondary ? `${year} ⭐` : `${year}`;
      }).join(' ──── ');
      
      return `
      ${AI_PROMPT_SYSTEM_MESSAGE}

      INPUT:
      Here are the birth details: ${JSON.stringify(birthDetails, null, 2)}
      Here is the planetary data: ${JSON.stringify(planetaryData, null, 2)}
      NOW_ISO: ${new Date().toISOString().split("T")[0]}
      CURRENT_YEAR: ${new Date().getFullYear()}
      Current date context: Analysis is based on timing windows relative to current date (${new Date().toISOString().split("T")[0]})
      Primary marriage window: ${primaryDesc}
      Secondary marriage window: ${secondaryDesc}

      OUTPUT:
      Generate a "Marriage Timing Report" that provides clear timing guidance with date ranges.
      
      CRITICAL REQUIREMENTS:
      1. DECISION ANCHOR BOX (MANDATORY - add immediately after data source label):
         Create a prominent box titled "Decision Anchor (Read This First)" with:
         "Based on this report, the most productive focus for you right now is: [Single clear statement about what to prioritize for marriage readiness/timing]"
         This does NOT make predictions - it gives users closure and direction.
         Example: "Based on this report, the most productive focus for you right now is: Building emotional clarity and readiness, as your strongest marriage windows open in ${primaryDesc}."
         TOKEN BUDGET: ≤ 120 words (2-3 sentences max)
      
      2. YOU MUST PROVIDE DATE RANGES - Never say "cannot determine timing" or "when data becomes available"
         - Provide primary window: ${primaryDesc}
         - Provide secondary window: ${secondaryDesc}
         - Always add: "These are favorable periods, not guarantees"
      
      3. PERSONALIZE EVERYTHING - Use the user's birth details throughout:
         - Instead of "As a Sagittarius ascendant, you may..."
         - Use "For you, as a ${planetaryData.ascendant || 'your ascendant'} ascendant born on ${birthDetails.dob || 'your birth date'}..."
         - Always reference their name (${birthDetails.name}), birth date (${birthDetails.dob}), and specific planetary positions
         - Make every section feel personal, not generic
      
      4. CONFIDENCE LEVEL (add early, after Decision Anchor):
         Include: "Confidence Level: [X]/10 (Strong for strategic planning, weaker for exact dates)"
         Where X is 6-8. Always add the strategic context in parentheses.
         This prevents disputes before they happen.
      
      5. STRUCTURE REQUIREMENTS:
         a) DATA SOURCE LABEL (at the very beginning):
            "Based on: Ascendant + Moon Sign + Transit Sequencing + Dasha Analysis (refined timing analysis)"
         
         b) DECISION ANCHOR BOX (immediately after data source - see requirement #1)
         
         c) CONFIDENCE LEVEL (after Decision Anchor - see requirement #4)
         
         d) "Marriage Timing Summary" section with real insights:
            • Marriage is more favorable after [specific period/condition]
            • Stronger windows open [date range]
            • Delays are more about [explanation] than denial
            • Preparation and clarity now improve outcomes later
            TOKEN BUDGET: ≤ 200 words (4-5 bullets max)
         
         e) "Marriage Timing - Key Insight" section: 1-2 line summary (e.g., "Your strongest marriage window opens after a period of emotional stabilization, with favorable alignment in ${primaryDesc}.")
            TOKEN BUDGET: ≤ 50 words (1-2 sentences max)
         
         f) "Ideal Marriage Windows" section:
            - Primary window: ${primaryDesc}
            - Secondary window: ${secondaryDesc}
            - TIMELINE VISUALIZATION (mandatory): Include ASCII-style visual timeline:
              "Timeline: ${timelineVisual}"
              (Where ⭐ marks the primary/secondary windows)
            - Explanation of why these periods are favorable
            TOKEN BUDGET: ≤ 250 words (including timeline)
         
         g) "If You're Already in a Relationship" section (NEW - MANDATORY):
            Add a note explaining how this report applies if the user is already in a relationship:
            - If in relationship: These windows indicate favorable periods for commitment, engagement, or marriage
            - If single: These windows indicate favorable periods for meeting potential partners
            - This prevents confusion and expands audience
            TOKEN BUDGET: ≤ 100 words (2-3 bullets max)
         
         h) "Potential Delay Factors" section:
            - Plain English explanations
            - Not about denial, but timing alignment
            TOKEN BUDGET: ≤ 150 words (3-4 bullets max)
         
         i) "Compatibility Indicators" section
            TOKEN BUDGET: ≤ 180 words (4-5 bullets max)
         
         j) "Non-Religious Remedies" section (SHORTENED):
            - MAXIMUM 3 actionable remedies/actions
            - Keep it non-religious and practical
            - Focus only on the most impactful actions
            TOKEN BUDGET: ≤ 150 words (3 bullets max)
         
         k) "What You Should Focus on Now" section (Decision Guidance):
            - Prioritize [action]
            - Strengthen [aspect]
            - Avoid [behavior]
            - Practical, actionable guidance
            TOKEN BUDGET: ≤ 200 words (4-5 bullets max)
         
         l) TIMING HIERARCHY EXPLANATION (add after Ideal Marriage Windows section):
            Include a box/note:
            "Why this timing may differ from other reports:
             Earlier life summaries provide broad possibilities based on major planetary periods. This report uses refined 
             transit sequencing and readiness indicators, resulting in more precise but potentially later windows. 
             Both perspectives are valid—this report focuses on optimal alignment timing."
         
         m) End with "What This Means For You" summary (ONLY place where repetition from summary is allowed)
      
      6. LANGUAGE RULES:
         - Keep bullets to 12-15 words max
         - Reduce astrology theory, increase actionable conclusions
         - Use calm, non-absolute language
         - After technical terms, add "What this means in daily life"
         - Compress text - avoid repetition except in Executive Summary and final "What This Means For You"
      `;
    },

    careerMoney: (birthDetails: any, planetaryData: any, careerWindows?: any) => {
      const currentYear = new Date().getFullYear();
      return `
      ${AI_PROMPT_SYSTEM_MESSAGE}

      INPUT:
      NOW_ISO: ${new Date().toISOString().split("T")[0]}
      CURRENT_YEAR: ${currentYear}
      Here are the birth details: ${JSON.stringify(birthDetails, null, 2)}
      Here is the planetary data: ${JSON.stringify(planetaryData, null, 2)}
      Current date context: Analysis uses intelligent date windows relative to current date (${new Date().toISOString().split('T')[0]})
      Career timing windows: Next 12–18 months (${currentYear}–${currentYear + 1}), Following 2–3 years (${currentYear + 1}–${currentYear + 3})

      OUTPUT:
      Generate a "Career & Money Path Report" that provides clear timing guidance and actionable direction.
      
      CRITICAL REQUIREMENTS:
      1. DECISION ANCHOR BOX (MANDATORY - add immediately after data source label):
         Create a prominent box titled "Decision Anchor (Read This First)" with:
         "Based on this report, the most productive focus for you right now is: [Single clear statement about career/money focus]"
         This does NOT make predictions - it gives users closure and direction.
         Example: "Based on this report, the most productive focus for you right now is: Building skills in [specific area] over the next 12-18 months, as major career momentum windows open in the coming years."
      
      2. AVOID PERSONALITY STEREOTYPES - Focus on career phases and timing, not personality traits
         - Instead of "Sagittarius people are adventurous..."
         - Use "During your mid-career phase, roles that allow autonomy and learning tend to be more financially rewarding for you"
         - Shift from identity → timing and application
      
      2. PROVIDE CAREER TIMING WINDOWS - Always include time-based guidance (use relative dates from current date):
         Career Momentum Windows:
         - Next 12–18 months (${currentYear}–${currentYear + 1}): [specific focus: skill building, positioning, etc.]
         - Following 2–3 years (${currentYear + 1}–${currentYear + 3}): [specific focus: role expansion, transition, etc.]
         - Long-term (${currentYear + 3}+): [specific focus: stability, consolidation, etc.]
         Always add: "These are favorable phases, not guarantees"
         Never say "when planetary periods are unknown"
      
      3. TIE MONEY ADVICE TO LIFE PATTERNS - Not generic tactics:
         - Instead of "Save more, diversify income, upskill"
         - Use "Your financial growth improves when income is aligned with [specific role type or approach], rather than purely transactional work"
         - Make it feel pattern-based, not generic blog advice
      
      4. PERSONALIZE EVERYTHING - Use the user's birth details throughout:
         - Reference their name (${birthDetails.name}), birth date (${birthDetails.dob})
         - Use their specific planetary positions
         - Make every section feel personal, not generic
      
      5. STRUCTURE REQUIREMENTS - MINIMUM DEPTH: Create **at least 6-8 detailed sections** (avoid short/empty reports):
         a) Start with "Career & Money Summary" section with real insights (NOT just the title):
            • Career growth improves through [specific role characteristics]
            • Major gains come from [specific approach] before transitions
            • Money growth is [description: gradual/stable/etc.], not sudden
            • Long-term success favors [specific approach] over risk-taking
            MINIMUM: 150-200 words of detailed content
         
         b) "Career & Money - Key Insight" section: 1-2 line summary
         
         c) "Best Career Directions" section (MANDATORY - DETAILED):
            - Focus on role characteristics that align with user's phases
            - Avoid generic "adventurous" or personality-based descriptions
            - Emphasize timing and application
            - Include 4-5 specific career directions with explanations
            - Each direction should have 2-3 sentences explaining why it aligns
            MINIMUM: 200-250 words
         
         d) "Career Momentum Windows" section (MANDATORY - DETAILED):
            - Growth phase: [Use next 12–18 months from current date: ${currentYear}–${currentYear + 1}] - [specific focus: skill building, positioning, etc.]
            - Consolidation phase: [Use following 2–3 years: ${currentYear + 1}–${currentYear + 3}] - [specific focus: stability, mastery, etc.]
            - Transition phase: [date range if applicable, relative to current date] - [specific focus]
            - Explanation of why these periods are favorable (detailed, 3-4 sentences per phase)
            - Add simple timeline relative to current date (${currentYear}): "Timeline: ${currentYear - 1} ──── ${currentYear} ⭐ ──── ${currentYear + 1} ⭐ ──── ${currentYear + 2} ⭐ ──── ${currentYear + 3}"
            MINIMUM: 250-300 words
         
         e) "Money Growth Phases" section (MANDATORY - DETAILED):
            - Growth periods: [date range] - [description: when income growth is favorable]
            - Consolidation periods: [date range] - [description: when to stabilize, not expand]
            - Risk periods: [date range] - "Avoid speculative investments during this phase"
            - Pattern-based financial guidance tied to career phases
            - NOT generic saving/investing advice - must be pattern-based
            - Include 3-4 specific financial patterns with detailed explanations
            MINIMUM: 200-250 words
         
         f) "Financial Cycle Clarity" section (MANDATORY - DETAILED):
            - Income peaks: [when money flow is strongest] - detailed explanation
            - Consolidation phases: [when to build reserves, not spend] - detailed explanation
            - Caution periods: [when to avoid major financial decisions] - detailed explanation
            - Include specific guidance for each phase
            MINIMUM: 150-200 words
         
         g) "Career Challenges and How to Navigate Them" section (NEW - MANDATORY):
            - Identify 3-4 specific career challenges based on chart
            - For each challenge, provide 2-3 strategies to navigate
            - Focus on actionable guidance, not just warnings
            MINIMUM: 200-250 words
         
         h) "Long-term Career Strategy" section (NEW - MANDATORY):
            - 5-year career outlook with specific milestones
            - Strategic approach for career growth
            - Key areas to develop for long-term success
            MINIMUM: 200-250 words
         
         i) "What You Should Focus on Now" section (MANDATORY - Decision Guidance):
            • Strengthen [specific skill] over the next 6–12 months
            • Avoid [specific behavior] without preparation
            • Prioritize [specific role type] that align with learning and long-term growth
            • Best for [specific action] - NOT generic "good for anyone"
            • Not ideal for [specific action] - concrete guidance
            - Practical, actionable guidance
            - Include 5-7 specific action items with timelines
            MINIMUM: 150-200 words
         
         j) End with "What This Means For You" summary (ONLY place where repetition from summary is allowed)
         
         TOTAL REPORT LENGTH: Minimum 1500-2000 words across all sections (excluding custom fields which are parsed separately)
      
      8. LANGUAGE RULES:
         - Keep bullets to 12-15 words max
         - Reduce astrology theory, increase actionable conclusions
         - Focus on phases, timing, and patterns - not personality traits
         - Use calm, non-absolute language
         - After technical terms, add "What this means in daily life"
         - Compress text - avoid repetition except in Executive Summary and final "What This Means For You"
      
      9. CONFIDENCE INDICATORS (add per section):
         Include indicators like:
         "Career Direction Clarity: Moderate to Strong (Confidence: ★★★★☆ - 6-7/10)"
         "Money Growth Stability: Steady (Confidence: ★★★☆☆ - 5-6/10)"
         Avoid numbers tied to income - just directional confidence
         
         Add confidence to:
         - Career Momentum Windows: "Confidence: ★★★★☆ (Medium-High)"
         - Money Growth Phases: "Confidence: ★★★☆☆ (Medium)"
         - Financial Cycles: "Confidence: ★★★☆☆ (Medium)"
      `;
    },

    dailyGuidance: (birthDetails: any, planetaryData: any, currentTransits: any) => `
      ${AI_PROMPT_SYSTEM_MESSAGE}

      INPUT:
      Here are the birth details: ${JSON.stringify(birthDetails, null, 2)}
      Here is the planetary data: ${JSON.stringify(planetaryData, null, 2)}
      Here are current planetary transits: ${JSON.stringify(currentTransits, null, 2)}

      OUTPUT:
      Generate a "Monthly AI Astrology Outlook" that is structured, reflective, and educational - NOT predictive or prescriptive.
      Total content should be ~300-450 words maximum.
      
      CRITICAL REQUIREMENTS:
      1. NO DAILY PRESCRIPTIONS:
         - Do NOT say "Today is good for..."
         - Do NOT say "Avoid today..."
         - Do NOT provide daily-specific actions
         - Do NOT include dates, timelines, "good/bad days"
         - Do NOT include remedies or rituals
      
      2. STRUCTURE (VERY IMPORTANT - generate ALL sections):
         
         SECTION 1: Monthly Theme
         - 2-3 lines summary + 1 short paragraph (keep existing guidance field format)
         - Focus on current period/phase themes
         - Use language like "This month emphasizes..." or "Current themes suggest..."
         
         SECTION 2: Focus Areas (REQUIRED - generate all 4 areas)
         Generate exactly 4 focus areas, each with 1-2 sentences:
         - Mindset & thinking style: [1-2 sentences about mental approach, thinking patterns]
         - Work & productivity: [1-2 sentences about professional focus, work style]
         - Relationships & communication: [1-2 sentences about interpersonal dynamics]
         - Energy & balance: [1-2 sentences about energy levels, work-life balance]
         
         SECTION 3: Helpful This Month (REQUIRED - generate 2-3 items)
         Generate 2-3 "Do" items (1-2 sentences each):
         - Do: [action or approach that may be helpful]
         - Do: [another helpful action or approach]
         
         SECTION 4: Be Mindful Of (REQUIRED - generate 2-3 items)
         Generate 2-3 "Avoid" items (1-2 sentences each):
         - Avoid: [pattern or approach to be mindful of]
         - Avoid: [another pattern to be mindful of]
         
         SECTION 5: Reflection Prompt (REQUIRED - generate 1 question)
         Generate 1 reflective question (not predictive):
         - Format: "What [conversation/decision/area] deserves more clarity this month?"
         - Example: "What conversation or decision deserves more clarity this month?"
      
      3. LANGUAGE RULES:
         - Use: "favors", "suggests", "tends to", "may benefit from", "consider"
         - Avoid: "must", "should", "avoid today", "good for today", "do this", predictions
         - Keep tone calm, reflective, and educational
         - No fear language
         - No guarantees or predictions
         - "Avoid" items should be gentle awareness, not prohibitions
      
      4. OUTPUT FORMAT:
         Structure the response as follows (use clear section headers):
         
         MONTHLY THEME:
         [2-3 lines summary + 1 short paragraph]
         
         FOCUS AREAS:
         - Mindset & thinking style: [1-2 sentences]
         - Work & productivity: [1-2 sentences]
         - Relationships & communication: [1-2 sentences]
         - Energy & balance: [1-2 sentences]
         
         HELPFUL THIS MONTH:
         - Do: [1-2 sentences]
         - Do: [1-2 sentences]
         - Do: [1-2 sentences] (optional third item)
         
         BE MINDFUL OF:
         - Avoid: [1-2 sentences]
         - Avoid: [1-2 sentences]
         - Avoid: [1-2 sentences] (optional third item)
         
         REFLECTION PROMPT:
         [1 question]
      `,

    fullLife: (birthDetails: any, planetaryData: any) => `
      ${AI_PROMPT_SYSTEM_MESSAGE}

      INPUT:
      Here are the birth details: ${JSON.stringify(birthDetails, null, 2)}
      Here is the planetary data: ${JSON.stringify(planetaryData, null, 2)}

      OUTPUT:
      Generate a comprehensive "Full Life Report" that provides a coherent narrative covering all major life areas.
      This is a SINGLE COHERENT REPORT - not stitched sub-reports. Focus on integration and life patterns.
      
      CRITICAL STRUCTURE REQUIREMENTS (MVP - Streamlined):
      1. THIS IS STRATEGIC GUIDANCE, NOT PREDICTIONS:
         - Focus on themes, tendencies, and strategic guidance
         - NO specific dates or event predictions
         - NO guarantees or certainties
         - Use language: "favors", "tends to", "more favorable for"
         - NEVER say: "will happen", "must do", "will fail"
      
      2. PERSONALIZE EVERYTHING:
         - Reference ${birthDetails.name}, birth date ${birthDetails.dob}
         - Use specific planetary positions from the data
         - Make every section feel personal and integrated
      
      3. MVP STRUCTURE (6-8 core sections - follow exactly):
         
         a) DATA SOURCE LABEL (at the very beginning):
            "Based on: Ascendant + Moon Sign + Dasha overview (comprehensive life analysis)"
         
         b) LIFE PATH OVERVIEW (MANDATORY - ~200 words):
            Title: "Life Path Overview"
            Include:
            - Core life themes: 2-3 sentences describing main life patterns
            - Key strengths: 2-3 sentences on natural abilities
            - Life direction: 2-3 sentences on overall trajectory
            Keep integrated and strategic, not verbose.
         
         c) CAREER & MONEY (MANDATORY - ~200 words):
            Title: "Career & Money"
            Include:
            - Career patterns: Brief description of career phases and patterns (3-4 sentences)
            - Financial patterns: Brief description of money flow patterns (2-3 sentences)
            - Best approaches: 3-4 bullet points on career/money strategies
            - Timing guidance: Brief mention of favorable periods (1-2 sentences)
            Keep focused on patterns, not detailed timing windows.
         
         d) RELATIONSHIPS (MANDATORY - ~200 words):
            Title: "Relationships & Personal Life"
            Include:
            - Relationship patterns: Brief description of how you relate to others (3-4 sentences)
            - Marriage timing: High-level overview (e.g., "favorable periods in coming years") with 2-3 sentences
            - Family dynamics: Brief description (2-3 sentences)
            - Strengthening relationships: 3-4 bullet points
            Keep strategic, not detailed timing.
         
         e) HEALTH & ENERGY (MANDATORY - ~150 words):
            Title: "Health & Energy"
            Include:
            - Health patterns: Brief description of health themes (2-3 sentences)
            - Areas to focus on: 3-4 bullet points
            - Preventive care: 2-3 bullet points
            Keep practical and actionable.
         
         f) SPIRITUAL GROWTH (MANDATORY - ~150 words):
            Title: "Spiritual Growth & Life Purpose"
            Include:
            - Life purpose themes: Brief description (2-3 sentences)
            - Growth opportunities: 3-4 bullet points
            - Inner development: 2-3 sentences
            Keep meaningful but concise.
         
         g) ACTION PLAN (MANDATORY - ~200 words):
            Title: "Action Plan"
            Include:
            - Priority actions: 5-7 specific action items with brief explanations
            - Focus areas: What to prioritize now (3-4 bullet points)
            - Strategic approach: How to approach the next 2-3 years (2-3 sentences)
            Keep actionable and integrated across all life areas.
      
      4. LANGUAGE RULES:
         - Keep bullets to 12-15 words max
         - Use calm, strategic language
         - NO fear-based language
         - NO absolute statements
         - Focus on guidance and themes
         - Compress text - avoid repetition
         - Total target: ~1100-1300 words (meets validation requirement)
      
      5. DISCLAIMER (include at end):
         "This report provides comprehensive life guidance based on astrological patterns. 
         These are themes and tendencies, not predictions. Use this guidance to plan thoughtfully, 
         not as definitive outcomes. Your actions and circumstances always play a role in outcomes."
      `,

    yearAnalysis: (birthDetails: any, planetaryData: any, targetYear: number, startMonth?: number, endYear?: number, endMonth?: number, dateDescription?: string) => {
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      
      const startMonthName = startMonth ? monthNames[startMonth - 1] : 'January';
      const endMonthName = endMonth ? monthNames[endMonth - 1] : 'December';
      const endYearValue = endYear || targetYear;
      const periodDescription = dateDescription || `${startMonthName} ${targetYear} - ${endMonthName} ${endYearValue}`;
      
      return `
      ${AI_PROMPT_SYSTEM_MESSAGE}

      INPUT:
      NOW_ISO: ${new Date().toISOString().split("T")[0]}
      CURRENT_YEAR: ${new Date().getFullYear()}
      Here are the birth details: ${JSON.stringify(birthDetails, null, 2)}
      Here is the planetary data: ${JSON.stringify(planetaryData, null, 2)}
      Analysis period: ${periodDescription}
      Target year for analysis: ${targetYear}
      Analysis window: ${startMonthName} ${targetYear} to ${endMonthName} ${endYearValue}

      OUTPUT:
      Generate a "Year Analysis Report" for ${periodDescription} that provides strategic 12-month guidance with quarterly breakdowns.
      
      CRITICAL REQUIREMENTS (MVP - Simplified Structure):
      1. THIS IS STRATEGIC GUIDANCE, NOT PREDICTIONS:
         - Focus on themes, tendencies, and strategic guidance
         - NO specific dates or event predictions
         - NO guarantees or certainties
         - Use language: "favors", "best used for", "tends to", "more favorable for"
         - NEVER say: "will happen", "don't do", "must avoid", "will fail"
      
      2. PERSONALIZE EVERYTHING:
         - Reference ${birthDetails.name}, birth date ${birthDetails.dob}
         - Use specific planetary positions from the data
         - Make every section feel personal, not generic
      
      3. MVP STRUCTURE (4-6 core sections only - follow exactly):
         
         a) DATA SOURCE LABEL (at the very beginning):
            "Based on: Ascendant + Moon Sign + Dasha + Transit Analysis for ${periodDescription} (strategic year guidance)"
         
         b) YEAR THEME & PLANETARY DRIVERS (MANDATORY - ~150 words):
            Title: "Year Theme & Planetary Drivers"
            Include:
            - Overall theme: One clear sentence describing the main strategic theme for ${periodDescription}
            - Key planetary influences: Brief explanation of major planetary drivers (2-3 sentences)
            - Strategic focus: What areas to prioritize this year (1-2 sentences)
            Keep concise and strategic, not verbose.
         
         c) QUARTER-BY-QUARTER BREAKDOWN (MANDATORY - ~400 words total):
            Title: "Quarter-by-Quarter Breakdown"
            For EACH quarter (Q1, Q2, Q3, Q4), include:
            - Quarter name: "Q1: [Jan-Mar]", "Q2: [Apr-Jun]", "Q3: [Jul-Sep]", "Q4: [Oct-Dec]"
            - Focus theme: One line describing the theme
            - Career & money tone: Brief description (e.g., "planning & preparation", "momentum begins")
            - Relationship / personal focus: Brief description
            - Energy level: "low", "moderate", or "high"
            Format as clear subsections for each quarter.
            TOKEN BUDGET: ~100 words per quarter (4 quarters × 100 words = ~400 words total)
            Keep concise - focus on key themes, not detailed prose.
         
         d) BEST PERIODS (MANDATORY - ~150 words):
            Title: "Best Periods"
            Include three consolidated subsections:
            - Best months for action: List months (e.g., "March, July, November") with brief 1-line description
            - Best months for relationships: List months with brief 1-line description
            - Best months for finances: List months with brief 1-line description
            Use strategic language, not predictions.
            TOKEN BUDGET: ~50 words per subsection (3 subsections × 50 words = ~150 words total)
         
         e) RISKS & CAUTIONS (MANDATORY - ~100 words):
            Title: "Risks & Cautions"
            Include:
            - Periods requiring extra care: List months and brief description (1 line each)
            - Areas to be mindful of: Brief strategic guidance (2-3 sentences)
            Frame as "more challenging for" and "lower return on investment" - NOT "avoid" or "will fail".
            Use strategic, less fear-based language.
            TOKEN BUDGET: ~100 words total
         
         f) ACTIONABLE GUIDANCE (MANDATORY - ~200 words):
            Title: "Actionable Guidance"
            Clear bullet actions:
            • Strengthen [specific area] over the next 6-12 months
            • Focus on [specific approach] during favorable periods
            • Best used for [specific actions] - NOT generic "good for anyone"
            • Favors [specific behaviors] - concrete guidance
            Include 5-7 specific action items with brief explanations.
            Use "favors" and "best used for" language, NOT "must do" or "don't do".
            TOKEN BUDGET: ~200 words total
      
      4. LANGUAGE RULES:
         - Keep bullets to 12-15 words max
         - Use calm, strategic language
         - NO fear-based language
         - NO absolute statements
         - Focus on guidance and themes
         - Compress text - avoid repetition
         - Total target: ~800-900 words (meets validation requirement)
      
      5. DISCLAIMER (include at end):
         "This report provides strategic guidance for ${periodDescription} based on astrological patterns. 
         These are themes and tendencies, not predictions. Use this guidance to plan thoughtfully, 
         not as definitive outcomes. Your actions and circumstances always play a role in outcomes."
      `;
    },

    majorLifePhase: (birthDetails: any, planetaryData: any) => `
      ${AI_PROMPT_SYSTEM_MESSAGE}

      INPUT:
      NOW_ISO: ${new Date().toISOString().split("T")[0]}
      CURRENT_YEAR: ${new Date().getFullYear()}
      Here are the birth details: ${JSON.stringify(birthDetails, null, 2)}
      Here is the planetary data: ${JSON.stringify(planetaryData, null, 2)}

      OUTPUT:
      Generate a "3-5 Year Strategic Life Phase Report" (RENAMED - sounds higher value, less mystical, more executive) that provides a 3-5 year outlook with major transitions and opportunities.
      
      CRITICAL REQUIREMENTS:
      1. DECISION ANCHOR BOX (MANDATORY - add immediately after data source label):
         Create a prominent box titled "Decision Anchor (Read This First)" with:
         "Based on this report, the most productive focus for you right now is: [Single clear statement about strategic focus for the next 3-5 years]"
         This does NOT make predictions - it gives users closure and direction.
         Example: "Based on this report, the most productive focus for you right now is: Building career foundation in Years 1-2, then leveraging relationship opportunities in Years 3-4."
      
      2. THIS IS STRATEGIC GUIDANCE FOR 3-5 YEARS:
         - Focus on major life themes, transitions, and opportunities
         - NO specific dates or event predictions
         - NO guarantees or certainties
         - Use language: "tends to favor", "periods of", "likely phases", "opportunities may arise"
         - NEVER say: "will happen", "must do", "will fail"
      
      3. PERSONALIZE EVERYTHING:
         - Reference ${birthDetails.name}, birth date ${birthDetails.dob}
         - Use specific planetary positions and Dasha periods from the data
         - Make every section feel personal and relevant
      
      4. CONFIDENCE LEVEL (add early, after Decision Anchor):
         Include: "Confidence Level: [X]/10 (Strong for strategic planning, weaker for exact dates)"
         Where X is 6-8 (for 3-5 year outlook). Always add the strategic context in parentheses.
         Add note: "This reflects guidance strength for longer-term patterns, not certainty."
      
      5. MANDATORY STRUCTURE - MINIMUM DEPTH: Create **at least 7-9 detailed sections** (avoid short/empty reports):
         
         a) DATA SOURCE LABEL (at the very beginning):
            "Based on: Ascendant + Moon Sign + Dasha Analysis + Long-term Transit Patterns (3-5 year strategic guidance)"
         
         b) DECISION ANCHOR BOX (immediately after data source - see requirement #1)
         
         c) CONFIDENCE LEVEL (after Decision Anchor - see requirement #4)
         
         d) WHO THIS REPORT IS BEST FOR (NEW - MANDATORY):
            Title: "Who This Report Is Best For"
            Include 1 paragraph explaining:
            - Who would benefit most from this report
            - When this report is most useful (life situations, planning needs)
            - What users can expect to gain
            This filters wrong buyers and increases satisfaction.
            Example: "This report is ideal for those making major life decisions, planning career transitions, or seeking clarity on long-term opportunities. It's most valuable when you're ready to think strategically about the next 3-5 years rather than immediate actions. If you're looking for day-to-day guidance or precise timing, other reports may be more suitable."
            MINIMUM: 100-150 words
         
         e) PHASE THEME (MANDATORY - DETAILED):
            Title: "3-5 Year Strategic Life Phase Theme"
            Content: Detailed paragraph (not just one sentence) describing the overall theme of the next 3-5 years
            Include:
            - Overall phase description (3-4 sentences)
            - Key characteristics of this phase
            - How this phase differs from previous/next phases
            Example: "The next 3-5 years represent a phase of transformation and career advancement for you. This period is characterized by [specific traits]. During this phase, you'll experience [key changes]. This differs from [previous phase] in that [differences]."
            CRITICAL: Include the timeframe using FUTURE YEARS ONLY from current date. Use the calculated date range provided in the prompt context.
            MINIMUM: 150-200 words
         
         f) EXECUTIVE SUMMARY (MANDATORY - DETAILED):
            Title: "Phase-at-a-Glance Summary"
            Include:
            • Overall phase theme (2-3 sentences)
            • Major transitions expected (2-3 transitions with brief explanations)
            • Key opportunity areas (2-3 areas with context)
            • Areas requiring attention (1-2 areas with guidance)
            • Strategic approach (2-3 sentences)
            Format as clear bullet points, but provide DETAILED content (not just one-line bullets).
            MINIMUM: 200-250 words
         
         g) YEAR-BY-YEAR BREAKDOWN (MANDATORY - DETAILED):
            Title: "Year-by-Year Breakdown"
            CRITICAL: Use ONLY FUTURE YEARS from the current date. The year labels are provided in the prompt context.
            For EACH year (Year 1, Year 2, Year 3, Year 4, Year 5):
            - Year label: Use the year labels provided (e.g., "Year 1 (2026)", "Year 2 (2027)", etc. - based on current date)
            - Theme: 2-3 sentences describing the year's theme (not just one line)
            - Focus areas: 3-4 bullets per year with explanations (not just bullet titles)
            - Key activities: 2-3 specific activities/approaches for this year
            Format as clear, detailed subsections. Each year should have substantial content.
            IMPORTANT: Year 1 should be the CURRENT YEAR (starting from today), Year 2 should be CURRENT YEAR + 1, etc.
            MINIMUM: 400-500 words total across all years
         
         h) MAJOR TRANSITIONS (MANDATORY - DETAILED):
            Title: "Major Transitions Ahead"
            Identify 4-6 major transitions (not just 3-5) in:
            - Career (job changes, promotions, career shifts)
            - Relationships (marriage, partnerships, family changes)
            - Finances (income changes, investments, financial milestones)
            - Health (wellness phases, lifestyle changes)
            - Education (learning phases, skill development)
            - Other significant life changes
            For each transition:
            - Type of transition (with 2-3 sentence description)
            - Approximate timeframe: Use FUTURE YEARS ONLY from current date (e.g., if current year is 2026, use "2026-2027", "late 2027", etc.)
            - Description of what the transition may involve (3-4 sentences)
            - Preparation steps (3-4 actionable items, not just 2-3)
            - What to expect during this transition
            Frame as "phases when" not "will happen".
            CRITICAL: All timeframes must be in the FUTURE relative to the current date.
            MINIMUM: 400-500 words
         
         i) LONG-TERM OPPORTUNITIES (MANDATORY - DETAILED):
            Title: "Long-Term Opportunities"
            Identify 5-7 major opportunities (not just 4-6) across:
            - Career growth
            - Financial accumulation
            - Relationship development
            - Personal growth
            - Health and wellness
            - Education and skills
            - Other significant areas
            For each opportunity:
            - Category (with 2-3 sentence explanation)
            - Timeframe (which years this opportunity is most relevant) - detailed
            - Description of the opportunity (3-4 sentences)
            - Action items (3-4 specific steps to maximize this opportunity, not just 2-3)
            - How to recognize when this opportunity is approaching
            Frame as "windows when" and "periods that favor".
            MINIMUM: 400-500 words
         
         j) CHALLENGES AND HOW TO NAVIGATE THEM (NEW - MANDATORY):
            Title: "Challenges and How to Navigate Them"
            Identify 3-4 major challenges or areas requiring attention during this phase
            For each challenge:
            - Challenge description (2-3 sentences)
            - Why it's relevant during this phase
            - Strategies to navigate (3-4 strategies)
            - When to be most aware of this challenge
            MINIMUM: 250-300 words
         
         k) STRATEGIC GUIDANCE (MANDATORY - DETAILED):
            Title: "How to Navigate This Phase"
            Provide:
            • Overall strategy (4-5 sentences, not just 2-3 lines)
            • When to take action vs. when to wait (detailed guidance with examples)
            • Key principles to follow (4-5 principles with explanations, not just 3-4)
            • What to prioritize (3-4 priorities with reasoning)
            • What to avoid over-emphasizing (3-4 warnings with context)
            • Long-term planning considerations
            Use "tends to favor" and "may be best for" language.
            MINIMUM: 300-350 words
         
         l) End with "What This Means For You" summary (ONLY place where repetition from summary is allowed)
         
         TOTAL REPORT LENGTH: Minimum 2000-2500 words across all sections (excluding custom fields which are parsed separately)
      
      6. LANGUAGE RULES:
         - Keep bullets to 15-20 words max
         - Use calm, strategic language
         - NO fear-based language
         - NO absolute statements
         - Focus on themes, patterns, and tendencies
         - After technical terms, explain what they mean in daily life
         - Compress text - avoid repetition except in Executive Summary and final "What This Means For You"
         - Reduce year-by-year text - max 3 bullets per year to avoid fatigue
      
      7. DISCLAIMER (include at end):
         "This report provides strategic guidance for the next 3-5 years based on astrological patterns. 
         These are long-term themes and tendencies, not specific predictions. Life circumstances and personal choices 
         significantly influence outcomes. Use this guidance to plan strategically and prepare for opportunities, 
         not as definitive outcomes."
      `,

    decisionSupport: (birthDetails: any, planetaryData: any, decisionContext?: string) => `
      ${AI_PROMPT_SYSTEM_MESSAGE}

      INPUT:
      NOW_ISO: ${new Date().toISOString().split("T")[0]}
      CURRENT_YEAR: ${new Date().getFullYear()}
      Here are the birth details: ${JSON.stringify(birthDetails, null, 2)}
      Here is the planetary data: ${JSON.stringify(planetaryData, null, 2)}
      ${decisionContext ? `Decision Context: ${decisionContext}` : "General decision support requested"}

      OUTPUT:
      Generate a "Decision Support Report" that provides astrological guidance for making major life decisions.
      
      CRITICAL REQUIREMENTS:
      1. DECISION ANCHOR BOX (MANDATORY - add immediately after data source label):
         Create a prominent box titled "Decision Anchor (Read This First)" with:
         "Based on this report, the most productive focus for you right now is: [Single clear statement about decision-making focus]"
         This does NOT make predictions - it gives users closure and direction.
         Example: "Based on this report, the most productive focus for you right now is: Gathering information and preparing for decisions in [specific area], with best timing for action in [timeframe]."
      
      2. THIS IS DECISION GUIDANCE, NOT PREDICTIONS:
         - Focus on timing, alignment, and considerations
         - NO guarantees about outcomes
         - NO absolute "yes" or "no" answers
         - Use language: "favors", "may be favorable", "aligns better with", "tends to support"
         - NEVER say: "you must do this", "this will fail", "don't do that"
      
      2. PERSONALIZE EVERYTHING:
         - Reference ${birthDetails.name}, birth date ${birthDetails.dob}
         - Use specific planetary positions and current Dasha from the data
         - Address the decision context if provided
      
      3. MANDATORY STRUCTURE - MINIMUM DEPTH: Create **at least 7-9 detailed sections** (avoid short/empty reports):
         
         a) DECISION CONTEXT (first section - DETAILED):
            Title: "Decision Context"
            Content: If decision context provided, summarize it in detail (3-4 sentences). Otherwise, provide comprehensive general guidance framework (4-5 sentences explaining the report's purpose).
            Example: "This report provides astrological guidance to support your decision-making process. It considers your birth chart, current planetary influences, and timing factors to help you make informed choices. The guidance focuses on alignment, timing, and considerations rather than definitive answers."
            MINIMUM: 150-200 words
         
         b) CURRENT ASTROLOGICAL CLIMATE (MANDATORY - DETAILED):
            Title: "Current Astrological Climate for Decision-Making"
            Include:
            • Current Dasha period and its influence on decision-making (3-4 sentences)
            • Current planetary influences affecting major decisions (detailed explanation)
            • Overall energy and momentum level (2-3 sentences)
            • Whether this is a time for action, planning, or waiting (with detailed reasoning)
            • Specific planetary transits affecting decision-making (2-3 transits with explanations)
            Format as clear subsections with substantial content in each.
            MINIMUM: 300-350 words
         
         c) DECISION OPTIONS ANALYSIS (if context provided) OR GENERAL GUIDANCE (if no context):
            Title: ${decisionContext ? "Analysis of Your Options" : "General Decision-Making Guidance"}
            ${decisionContext 
              ? `For each option mentioned in the decision context:
                 - Option name with 2-3 sentence description
                 - Astrological alignment: "High", "Medium", or "Low" (with detailed explanation)
                 - Timeframe when this option may be most favorable (with specific dates/years)
                 - Key considerations (4-5 points with explanations, not just 2-3)
                 - Planetary factors supporting or challenging this option (detailed)
                 - Potential outcomes based on timing (2-3 scenarios)
                 Frame as guidance, not directives.
                 MINIMUM: 400-500 words for all options combined`
              : `Provide detailed guidance on:
                 - Career decisions (job changes, promotions, career shifts) - 100-150 words per category
                 - Financial decisions (investments, major purchases) - 100-150 words
                 - Relationship decisions (marriage, partnerships) - 100-150 words
                 - Education decisions (courses, certifications) - 100-150 words
                 - Location decisions (moving, relocating) - 100-150 words
                 - Health decisions (treatment options, lifestyle changes) - 100-150 words
                 For each category, provide:
                 - Current alignment level (High/Medium/Low) with explanation
                 - Best timing windows (with specific timeframes)
                 - Key considerations (3-4 points each)
                 - Action steps (2-3 steps)
                 MINIMUM: 600-700 words total`
            }
         
         d) TIMING GUIDANCE (MANDATORY - DETAILED):
            Title: "Recommended Timing"
            Include:
            • Best periods to make decisions (approximate months/years) - with detailed explanations (3-4 periods)
            • Periods to avoid major decisions (with reasons and alternatives) - 2-3 periods
            • When to take action vs. when to gather more information (detailed guidance with examples)
            • How current planetary influences affect decision timing (3-4 sentences)
            • Short-term vs. long-term decision timing (comparison)
            Frame as "tends to favor" not "must do now".
            MINIMUM: 300-350 words
         
         e) FACTORS TO CONSIDER (MANDATORY - DETAILED):
            Title: "Key Factors to Consider"
            List 6-8 important factors (not just 5-7) based on the astrological chart:
            • Planetary influences relevant to the decision (detailed explanation per planet)
            • Dasha period implications (comprehensive explanation)
            • House influences (if relevant) - detailed
            • Long-term vs. short-term considerations (comparison with examples)
            • Personal strengths and challenges to consider (detailed)
            • External factors to monitor (2-3 factors)
            • Timing-related factors (2-3 factors)
            Format as clear bullets with 2-3 sentences per factor (not just one-line bullets).
            MINIMUM: 400-450 words
         
         f) STRATEGIC APPROACH (MANDATORY - DETAILED):
            Title: "Recommended Approach"
            Provide:
            • Overall strategy for decision-making (4-5 sentences, not just 2-3 lines)
            • Steps to take before deciding (4-5 steps with explanations, not just 3-4)
            • How to maximize favorable timing (detailed guidance)
            • How to mitigate challenges (3-4 strategies)
            • When to seek additional guidance (specific scenarios)
            • Decision-making framework based on chart (2-3 principles)
            Use "may be beneficial" and "consider" language.
            MINIMUM: 350-400 words
         
         g) DECISION-MAKING CHECKLIST (NEW - MANDATORY):
            Title: "Decision-Making Checklist"
            Provide a practical checklist with 6-8 items based on astrological guidance:
            - Items to evaluate before deciding
            - Timing considerations
            - Alignment factors to assess
            - Warning signs to watch for
            Each item should have a brief explanation (1-2 sentences).
            MINIMUM: 200-250 words
         
         h) CONFIDENCE LEVEL (mandatory):
            Include: "Confidence Level: [X]/10"
            Where X is between 6-8 (decision support requires multiple factors).
            Add note: "This reflects the strength of astrological guidance. Always combine with practical considerations."
         
         TOTAL REPORT LENGTH: Minimum 2000-2500 words across all sections (excluding custom fields which are parsed separately)
      
      6. LANGUAGE RULES:
         - Keep bullets to 15-20 words max
         - Use supportive, non-directive language
         - NO fear-based language
         - NO absolute statements
         - Focus on considerations and timing
         - Empower the user to make informed decisions
         - Compress text - avoid repetition except in Executive Summary and final "What This Means For You"
      
      7. DISCLAIMER (include at end):
         "This report provides astrological guidance to support your decision-making process. It offers insights into timing, 
         alignment, and considerations based on your birth chart. However, decisions should always combine astrological 
         guidance with practical considerations, personal values, and professional advice when appropriate. This report is 
         not a substitute for professional consultation in specific areas (legal, financial, medical)."
      `,
  },
};

/**
 * Generate prompt for Full Life Report
 */
export function generateFullLifePrompt(birthDetails: any, planetaryData: any): string {
  return AI_PROMPT_TEMPLATES["v1.0"].fullLife(birthDetails, planetaryData);
}

/**
 * Generate prompt for Life Summary report
 */
export function generateLifeSummaryPrompt(birthDetails: any, planetaryData: any): string {
  return AI_PROMPT_TEMPLATES["v1.0"].lifeSummary(birthDetails, planetaryData);
}

/**
 * Generate prompt for Marriage Timing report
 */
export function generateMarriageTimingPrompt(birthDetails: any, planetaryData: any, timingWindows?: any): string {
  return AI_PROMPT_TEMPLATES["v1.0"].marriageTiming(birthDetails, planetaryData, timingWindows);
}

/**
 * Generate prompt for Career & Money report
 */
export function generateCareerMoneyPrompt(birthDetails: any, planetaryData: any, careerWindows?: any): string {
  return AI_PROMPT_TEMPLATES["v1.0"].careerMoney(birthDetails, planetaryData, careerWindows);
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

/**
 * Generate prompt for Year Analysis report
 */
export function generateYearAnalysisPrompt(
  birthDetails: any,
  planetaryData: any,
  startYear?: number,
  startMonth?: number,
  endYear?: number,
  endMonth?: number
): string {
  // Use provided date range or calculate intelligent 12-month window from current date
  let finalStartYear: number;
  let finalStartMonth: number;
  let finalEndYear: number;
  let finalEndMonth: number;
  
  if (!startYear || !startMonth || !endYear || !endMonth) {
    const { getYearAnalysisDateRange } = require("./dateHelpers");
    const range = getYearAnalysisDateRange();
    finalStartYear = range.startYear;
    finalStartMonth = range.startMonth;
    finalEndYear = range.endYear;
    finalEndMonth = range.endMonth;
  } else {
    // CRITICAL FIX: Ensure years are not in the past
    // CRITICAL FIX (ChatGPT): Import moved to top level to avoid build-time module resolution issues
    // Previous: Used require() inside function which can cause build failures
    // Now: Uses top-level import (see line ~12)
    finalStartYear = ensureFutureYear(startYear);
    finalStartMonth = startMonth;
    finalEndYear = ensureFutureYear(endYear);
    finalEndMonth = endMonth;
    
    // If start year was adjusted, ensure end year is still >= start year
    if (finalEndYear < finalStartYear) {
      finalEndYear = finalStartYear;
    }
  }
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const dateDescription = `${monthNames[finalStartMonth - 1]} ${finalStartYear} - ${monthNames[finalEndMonth - 1]} ${finalEndYear}`;
  const targetYear = finalStartYear; // Use start year as primary reference
  
  return AI_PROMPT_TEMPLATES["v1.0"].yearAnalysis(
    birthDetails, 
    planetaryData, 
    targetYear,
    finalStartMonth,
    finalEndYear,
    finalEndMonth,
    dateDescription
  );
}

/**
 * Generate prompt for Major Life Phase report (3-5 year outlook)
 */
export function generateMajorLifePhasePrompt(birthDetails: any, planetaryData: any, dateWindows?: any): string {
  // Get date windows if not provided
  if (!dateWindows) {
    const { getMajorLifePhaseWindows } = require("./dateHelpers");
    dateWindows = getMajorLifePhaseWindows();
  }
  
  // Calculate current date for context
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
  
  // Get year-by-year labels
  const yearLabels = dateWindows.yearByYear.map((year: number, index: number) => 
    `Year ${index + 1} (${year})`
  ).join(', ');
  
  // Create timeframe description
  const timeframeDescription = `${dateWindows.startYear}–${dateWindows.endYear}`;
  
  // Update the prompt template with actual dates
  const prompt = AI_PROMPT_TEMPLATES["v1.0"].majorLifePhase(birthDetails, planetaryData);
  
  // Replace hardcoded examples with dynamic dates and inject date context
  let updatedPrompt = prompt
    .replace(/2024-2028/g, timeframeDescription)
    .replace(/current year \+ 3 to current year \+ 5/g, timeframeDescription)
    .replace(/"Year 1 \(2024\)", "Year 2 \(2025\)", etc\./g, `${yearLabels}`)
    .replace(/2025-2026/g, `${dateWindows.yearByYear[1]}-${dateWindows.yearByYear[2]}`)
    .replace(/late 2026/g, `late ${dateWindows.yearByYear[1] || dateWindows.yearByYear[0] + 1}`);
  
  // Inject current date context after INPUT section
  const dateContextNote = `
      
      CRITICAL DATE CONTEXT FOR THIS REPORT:
      Current Date: ${currentDate}
      Current Year: ${currentYear}
      Report covers years: ${yearLabels}
      Timeframe: ${timeframeDescription}
      
      MANDATORY: Use ONLY FUTURE YEARS from the current date. Year 1 = ${dateWindows.yearByYear[0]} (current year), Year 2 = ${dateWindows.yearByYear[1]}, etc.
      DO NOT reference past years or years before ${dateWindows.startYear}.
      All year references in examples should use the years: ${yearLabels}`;
  
  // Insert date context after INPUT section
  updatedPrompt = updatedPrompt.replace(
    /Here is the planetary data:.*?\n\n/,
    `Here is the planetary data: ${JSON.stringify(planetaryData, null, 2)}${dateContextNote}\n\n`
  );
  
  return updatedPrompt;
}

/**
 * Generate prompt for Decision Support report
 */
export function generateDecisionSupportPrompt(
  birthDetails: any,
  planetaryData: any,
  decisionContext?: string
): string {
  return AI_PROMPT_TEMPLATES["v1.0"].decisionSupport(birthDetails, planetaryData, decisionContext);
}
