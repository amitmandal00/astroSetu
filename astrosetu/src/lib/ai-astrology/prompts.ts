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

CRITICAL REPETITION RULES:
- Reduce repetition across sections - keep content unique and non-redundant
- Allow repetition ONLY in:
  * Executive Summary section
  * Final "What This Means For You" summary
- All other sections must provide NEW information, not repeat what was already covered
- Avoid repeating similar ideas across Summary, Breakdown, and Conclusion sections

REPORT-SPECIFIC INTELLIGENCE LAYERS (CRITICAL - Use different approaches per report type):
- Full Life Report: Deep, foundational, timeless insights. Focus on core personality, life themes, and long-term patterns. Avoid calendar-specific details. This is a COMPREHENSIVE report - be detailed, thorough, and cover all major life areas extensively (2500-3500 words total).
- Year Analysis Report: Tactical, calendar-based guidance. Focus on quarterly breakdowns, specific months, and actionable timing. Avoid repeating life phase themes.
- Life Phase Report: Strategic, directional guidance. Focus on 3-5 year transitions, major opportunities, and directional shifts. Avoid repeating year-by-year details.
- Monthly Outlook: Lightweight, reflective guidance. Focus on current themes, gentle awareness, and mindset shifts. Avoid deep analysis or predictions.
- Marriage Timing Report: Precise & narrow focus. Focus on specific date ranges, timing windows, and marriage-specific factors. Avoid general life guidance.
- Decision Support Report: Context-specific guidance. Focus on decision options, timing for decisions, and decision-specific factors. Avoid general life themes.

REPORT STRUCTURE RULES:
- Begin every major section with a 1-2 line summary (key takeaway)
- Use short bullet points (max 20 words per bullet)
- Avoid repeating similar traits
- End each section with "What this means for you" in plain English (ONLY in main sections, not subsections)
- Prioritize clarity over completeness
- After technical terms (like Ascendant, Nakshatra), always explain what they mean in daily life
- Compress text by ~20% - be concise and impactful
`;

export const AI_PROMPT_TEMPLATES = {
  "v1.0": {
    lifeSummary: (birthDetails: any, planetaryData: any) => `
      ${AI_PROMPT_SYSTEM_MESSAGE}

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
      `,

    marriageTiming: (birthDetails: any, planetaryData: any, timingWindows?: any) => {
      const primaryDesc = timingWindows?.primaryDescription || "Late 2026 – Early 2027";
      const secondaryDesc = timingWindows?.secondaryDescription || "Mid 2028 – Early 2029";
      const timelineStart = timingWindows?.timelineStart || new Date().getFullYear() - 1;
      const timelineEnd = timingWindows?.timelineEnd || new Date().getFullYear() + 3;
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
      Current date context: Analysis is based on timing windows relative to current date (${new Date().toISOString().split('T')[0]})
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
         
         e) "Marriage Timing - Key Insight" section: 1-2 line summary (e.g., "Your strongest marriage window opens after a period of emotional stabilization, with favorable alignment in ${primaryDesc}.")
         
         f) "Ideal Marriage Windows" section:
            - Primary window: ${primaryDesc}
            - Secondary window: ${secondaryDesc}
            - TIMELINE VISUALIZATION (mandatory): Include ASCII-style visual timeline:
              "Timeline: ${timelineVisual}"
              (Where ⭐ marks the primary/secondary windows)
            - Explanation of why these periods are favorable
         
         g) "If You're Already in a Relationship" section (NEW - MANDATORY):
            Add a note explaining how this report applies if the user is already in a relationship:
            - If in relationship: These windows indicate favorable periods for commitment, engagement, or marriage
            - If single: These windows indicate favorable periods for meeting potential partners
            - This prevents confusion and expands audience
         
         h) "Potential Delay Factors" section:
            - Plain English explanations
            - Not about denial, but timing alignment
         
         i) "Compatibility Indicators" section
         
         j) "Non-Religious Remedies" section (SHORTENED):
            - MAXIMUM 3 actionable remedies/actions
            - Keep it non-religious and practical
            - Focus only on the most impactful actions
         
         k) "What You Should Focus on Now" section (Decision Guidance):
            - Prioritize [action]
            - Strengthen [aspect]
            - Avoid [behavior]
            - Practical, actionable guidance
         
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
         Example: "Based on this report, the most productive focus for you right now is: Building skills in [specific area] over the next 12-18 months, as major career momentum windows open in 2026-2027."
      
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
      
      5. STRUCTURE REQUIREMENTS:
         a) Start with "Career & Money Summary" section with real insights (NOT just the title):
            • Career growth improves through [specific role characteristics]
            • Major gains come from [specific approach] before transitions
            • Money growth is [description: gradual/stable/etc.], not sudden
            • Long-term success favors [specific approach] over risk-taking
         
         b) "Career & Money - Key Insight" section: 1-2 line summary
         
         c) "Best Career Directions" section:
            - Focus on role characteristics that align with user's phases
            - Avoid generic "adventurous" or personality-based descriptions
            - Emphasize timing and application
         
         d) "Career Momentum Windows" section (MANDATORY):
            - Growth phase: [Use next 12–18 months from current date: ${currentYear}–${currentYear + 1}] - [specific focus: skill building, positioning, etc.]
            - Consolidation phase: [Use following 2–3 years: ${currentYear + 1}–${currentYear + 3}] - [specific focus: stability, mastery, etc.]
            - Transition phase: [date range if applicable, relative to current date] - [specific focus]
            - Explanation of why these periods are favorable
            - Add simple timeline relative to current date (${currentYear}): "Timeline: ${currentYear - 1} ──── ${currentYear} ⭐ ──── ${currentYear + 1} ⭐ ──── ${currentYear + 2} ⭐ ──── ${currentYear + 3}"
         
         e) "Money Growth Phases" section (MANDATORY):
            - Growth periods: [date range] - [description: when income growth is favorable]
            - Consolidation periods: [date range] - [description: when to stabilize, not expand]
            - Risk periods: [date range] - "Avoid speculative investments during this phase"
            - Pattern-based financial guidance tied to career phases
            - NOT generic saving/investing advice - must be pattern-based
         
         f) "Financial Cycle Clarity" (new mandatory section):
            - Income peaks: [when money flow is strongest]
            - Consolidation phases: [when to build reserves, not spend]
            - Caution periods: [when to avoid major financial decisions]
         
         g) "What You Should Focus on Now" section (MANDATORY - Decision Guidance):
            • Strengthen [specific skill] over the next 6–12 months
            • Avoid [specific behavior] without preparation
            • Prioritize [specific role type] that align with learning and long-term growth
            • Best for [specific action] - NOT generic "good for anyone"
            • Not ideal for [specific action] - concrete guidance
            - Practical, actionable guidance
         
         i) End with "What This Means For You" summary (ONLY place where repetition from summary is allowed)
      
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
      `,

    dailyGuidance: (birthDetails: any, planetaryData: any, currentTransits: any) => `
      ${AI_PROMPT_SYSTEM_MESSAGE}

      INPUT:
      Here are the birth details: ${JSON.stringify(birthDetails, null, 2)}
      Here is the planetary data: ${JSON.stringify(planetaryData, null, 2)}
      Here are current planetary transits: ${JSON.stringify(currentTransits, null, 2)}

      OUTPUT:
      Generate a "Current Theme & Focus" guidance that is general, reflective, and educational - NOT predictive or prescriptive.
      
      CRITICAL REQUIREMENTS:
      1. NO DAILY PRESCRIPTIONS:
         - Do NOT say "Today is good for..."
         - Do NOT say "Avoid today..."
         - Do NOT provide daily-specific actions
      
      2. THEME-BASED APPROACH:
         - Focus on current period/phase themes
         - Provide reflective, general guidance
         - Use language like "This period favors..." or "Current themes suggest..."
      
      3. STRUCTURE:
         Generate a single calm guidance block that includes:
         - A general theme or focus area for the current period
         - Reflective observations (not prescriptions)
         - Calm, non-absolute language
         - Emphasis on balance and thoughtful action
      
      4. LANGUAGE RULES:
         - Use: "favors", "suggests", "tends to", "may benefit from"
         - Avoid: "must", "should", "avoid today", "good for today", "do this"
         - Keep tone calm, reflective, and educational
         - No fear language
         - No guarantees or predictions
      
      5. LENGTH:
         Keep guidance concise - 2-4 sentences that provide a general theme.
         Example: "This period favors thoughtful action and steady progress. Emphasis on clarity and communication tends to support better outcomes. Maintain balance between action and rest, and avoid rushing decisions."
      `,

    fullLife: (birthDetails: any, planetaryData: any) => `
      ${AI_PROMPT_SYSTEM_MESSAGE}

      INPUT:
      Here are the birth details: ${JSON.stringify(birthDetails, null, 2)}
      Here is the planetary data: ${JSON.stringify(planetaryData, null, 2)}

      OUTPUT:
      Generate a comprehensive "Full Life Report" that combines personality, marriage timing, career, and finances.
      This is a COMPREHENSIVE report - it should be detailed, thorough, and cover all major life areas extensively.
      
      CRITICAL STRUCTURE REQUIREMENTS:
      1. DECISION ANCHOR BOX (MANDATORY - add immediately after data source label):
         Create a prominent box titled "Decision Anchor (Read This First)" with:
         "Based on this report, the most productive focus for you right now is: [Single clear statement about overall life focus]"
         This does NOT make predictions - it gives users closure and direction.
         Example: "Based on this report, the most productive focus for you right now is: Strengthening career foundations while preparing for relationship opportunities in the 2025-2027 timeframe."
      
      2. DATA SOURCE LABEL (add at the very beginning):
         "Based on: Ascendant + Moon Sign + Dasha overview (high-level analysis)"
      
      3. DECISION ANCHOR BOX (immediately after data source - see requirement #1)
      
      4. CONFIDENCE LEVEL (add early, after Decision Anchor):
         Include: "Confidence Level: [X]/10 (Strong for strategic planning, weaker for exact dates)"
         Where X is 5-6 (high-level overview). Always add the strategic context in parentheses.
      
      5. TIMING HIERARCHY DISCLAIMER (add after Executive Summary):
         "Note: This report provides a high-level overview. Timing-specific insights are refined in dedicated reports. 
          For precise marriage timing windows, see the Marriage Timing Report. For detailed career phases, see the Career & Money Report."
      
      6. EXECUTIVE SUMMARY (must be first section - make this DETAILED):
         Create a section titled "Your Key Life Insights (Summary)" with:
         - Marriage: Best window between [specific date range - use BROAD range like "2024-2027"] with 2-3 sentences of context
         - Career: Major growth phase [description] with 2-3 sentences explaining the phase
         - Money: [Description] over next 3-5 years with 2-3 sentences on financial patterns
         - Health: [Overview] with 1-2 sentences on health themes
         - Family & Relationships: [Overview] with 1-2 sentences
         - Focus: [Key action items] - provide 3-4 specific action items
         This should be comprehensive (200-300 words), not just brief bullets.
         IMPORTANT: Use broader ranges here (high-level), not precise windows.
      
      7. COMPREHENSIVE SECTION REQUIREMENTS (each section should be DETAILED):
         For EVERY major section (Personality, Marriage Timing, Career, Money, Health, Family, Education, Spiritual Growth):
         - Start with section name followed by "- Key Insight"
         - Add confidence indicator: "Confidence: ★★★★☆ (High)" or "Confidence: ★★★☆☆ (Medium)"
         - Provide 2-3 line summary at the top (not just 1-2 lines)
         - Then provide DETAILED content with:
           * Multiple subsections (3-5 subsections per major section)
           * Each subsection should have 4-6 bullet points
           * Each bullet point can be up to 25 words (not just 20)
           * Include specific examples and practical applications
         - Use PERSONAL ANCHORS: Reference ${birthDetails.name}, birth date ${birthDetails.dob}, specific planetary positions throughout
         - End with "What this means for you" in plain English (2-3 sentences, not just 1)
      
      8. Marriage Timing Section (make this COMPREHENSIVE):
         - Start with: "High-level marriage timing overview (for precise windows, see dedicated Marriage Timing Report)"
         - Provide BROAD window (e.g., "2024-2027 timeframe") with detailed explanation
         - Include subsections:
           * Favorable periods (2-3 periods with explanations)
           * Factors influencing timing (3-4 factors)
           * Readiness indicators (3-4 indicators)
           * What to focus on now (3-4 action items)
         - Explain: "This overview considers major planetary periods. For refined timing based on transit sequencing, 
                    the dedicated Marriage Timing Report provides more precise windows."
         - Add confidence: "Confidence: ★★★☆☆ (Medium - high-level overview)"
         - Total length: 300-400 words minimum
      
      9. Career Section (make this COMPREHENSIVE):
         - Start with: "Career growth phases (for detailed momentum windows, see Career & Money Report)"
         - Include subsections:
           * Career strengths and natural talents (4-5 points)
           * Career phases over next 5 years (3-4 phases with descriptions)
           * Best career directions (3-4 directions with explanations)
           * Challenges and how to navigate them (3-4 challenges)
           * Action items for career growth (4-5 specific actions)
         - Focus on phases and patterns, not exact timing
         - Add confidence: "Confidence: ★★★☆☆ (Medium - phase-based guidance)"
         - Total length: 400-500 words minimum
      
      10. Money & Finance Section (make this COMPREHENSIVE):
          - Include subsections:
            * Financial patterns and tendencies (4-5 points)
            * Money growth phases (3-4 phases)
            * Investment guidance (3-4 recommendations)
            * Financial challenges and remedies (3-4 challenges)
            * Action items for financial growth (4-5 specific actions)
          - Total length: 300-400 words minimum
      
      11. Personality & Core Traits Section (make this COMPREHENSIVE):
          - Include subsections:
            * Core personality traits (5-6 traits with explanations)
            * Strengths and natural abilities (4-5 strengths)
            * Areas for growth (3-4 areas)
            * How you relate to others (3-4 points)
            * Life themes and patterns (3-4 themes)
          - Total length: 400-500 words minimum
      
      12. Health Section (add this - make it COMPREHENSIVE):
          - Include subsections:
            * Health patterns and tendencies (3-4 points)
            * Areas to focus on (3-4 areas)
            * Preventive care guidance (3-4 recommendations)
          - Total length: 200-300 words minimum
      
      13. Family & Relationships Section (add this - make it COMPREHENSIVE):
          - Include subsections:
            * Family dynamics (3-4 points)
            * Relationship patterns (3-4 patterns)
            * How to strengthen relationships (3-4 actions)
          - Total length: 200-300 words minimum
      
      14. Education & Learning Section (add this if relevant):
          - Include learning styles, educational opportunities, knowledge areas to focus on
          - Total length: 150-200 words
      
      15. Spiritual Growth & Life Purpose Section (add this):
          - Include life purpose themes, spiritual growth opportunities, inner development
          - Total length: 200-300 words
      
      16. Remedies & Guidance Section (make this COMPREHENSIVE):
          - Include 5-7 practical, non-religious remedies
          - Each remedy should have 2-3 sentences of explanation
          - Total length: 300-400 words minimum
      
      17. Language guidelines:
          - After every technical term (Ascendant, Nakshatra, etc.), add "What this means in daily life" explanation
          - Use bullet points (15-25 words each - allow more length for comprehensive content)
          - Avoid repeating similar traits
          - Use ranges, tendencies, and probabilities (not guarantees)
          - AVOID generic phrases like "focus on personal development" - use specific dates/phases/anchors
          - Be DETAILED and THOROUGH - this is a comprehensive report, not a summary
      
      18. Section organization (COMPREHENSIVE structure):
          - Executive Summary (200-300 words)
          - Personality & Core Traits (400-500 words with 4-5 subsections)
          - Marriage Timing (300-400 words with 4-5 subsections)
          - Career & Professional Life (400-500 words with 5-6 subsections)
          - Money & Finance (300-400 words with 4-5 subsections)
          - Health & Wellbeing (200-300 words with 3-4 subsections)
          - Family & Relationships (200-300 words with 3-4 subsections)
          - Education & Learning (150-200 words, if relevant)
          - Spiritual Growth & Life Purpose (200-300 words)
          - Remedies & Practical Guidance (300-400 words with 5-7 remedies)
          - Final Summary: "What This Means For You" (100-150 words)
      
      19. TOTAL REPORT LENGTH:
          This report should be COMPREHENSIVE - aim for 2500-3500 words total.
          Each major section should be substantial and detailed, not brief.
          This is a "Full Life Report" - it should feel complete and thorough.
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
      Here are the birth details: ${JSON.stringify(birthDetails, null, 2)}
      Here is the planetary data: ${JSON.stringify(planetaryData, null, 2)}
      Analysis period: ${periodDescription}
      Target year for analysis: ${targetYear}
      Analysis window: ${startMonthName} ${targetYear} to ${endMonthName} ${endYearValue}

      OUTPUT:
      Generate a "Year Analysis Report" for ${periodDescription} that provides strategic 12-month guidance with quarterly breakdowns.
      
      CRITICAL REQUIREMENTS:
      1. DECISION ANCHOR BOX (MANDATORY - add immediately after data source label):
         Create a prominent box titled "Decision Anchor (Read This First)" with:
         "Based on this report, the most productive focus for you right now is: [Single clear statement about strategic focus for ${periodDescription}]"
         This does NOT make predictions - it gives users closure and direction.
         Example: "Based on this report, the most productive focus for you right now is: Building career momentum in Q2-Q3 while strengthening relationships in Q4."
      
      2. THIS IS STRATEGIC GUIDANCE, NOT PREDICTIONS:
         - Focus on themes, tendencies, and strategic guidance
         - NO specific dates or event predictions
         - NO guarantees or certainties
         - Use language: "favors", "best used for", "tends to", "more favorable for"
         - NEVER say: "will happen", "don't do", "must avoid", "will fail"
      
      3. PERSONALIZE EVERYTHING:
         - Reference ${birthDetails.name}, birth date ${birthDetails.dob}
         - Use specific planetary positions from the data
         - Make every section feel personal, not generic
      
      4. MANDATORY STRUCTURE (follow exactly):
         
         a) DATA SOURCE LABEL (at the very beginning):
            "Based on: Ascendant + Moon Sign + Dasha + Transit Analysis for ${periodDescription} (strategic year guidance)"
         
         b) DECISION ANCHOR BOX (immediately after data source - see requirement #1)
         
         c) YEAR STRATEGY BLOCK (NEW - add immediately after Decision Anchor, before detailed breakdown):
            Title: "Year Strategy"
            Include EXACTLY 3 bullets only:
            • What to push: [Specific area/action to focus energy on]
            • What to avoid: [Specific area/action to minimize]
            • What to prepare for: [Specific area/opportunity coming later in year]
            Keep each bullet to 12-15 words max. This sets strategic direction early.
         
         d) CONFIDENCE LEVEL (add right after Year Strategy, BEFORE detailed breakdown):
            Include: "Confidence Level: [X]/10 (Strong for strategic planning, weaker for exact dates)"
            Where X is between 6-9 (never 10, never below 6 for strategic guidance).
            Always add the strategic context in parentheses. Move this HIGHER than before.
         
         e) YEAR THEME:
            Title: "Year Theme"
            Content: One clear sentence describing the overall theme of ${periodDescription}
            Example: "${periodDescription} is a period of consolidation and relationship alignment for you."
            This should be the main strategic theme, not detailed predictions.
         
         f) YEAR-AT-A-GLANCE SUMMARY (MANDATORY - one screen only):
            Title: "Year-at-a-Glance Summary"
            Include:
            • Overall theme of the year (1 line)
            • Main opportunity area (1 line)
            • Main challenge area (1 line)
            • Where to be cautious (1 line)
            • Where to invest energy (1 line)
            Format as clear bullet points, max 15 words each.
         
         g) QUARTER-BY-QUARTER BREAKDOWN (MANDATORY - users LOVE quarters):
            Title: "Quarter-by-Quarter Breakdown"
            For EACH quarter (Q1, Q2, Q3, Q4), include:
            - Quarter name: "Q1: [Jan-Mar]", "Q2: [Apr-Jun]", "Q3: [Jul-Sep]", "Q4: [Oct-Dec]"
            - Focus theme: One line describing the theme
            - Career & money tone: Description (e.g., "planning & preparation", "momentum begins")
            - Relationship / personal focus: Description
            - Energy level: "low", "moderate", or "high"
            Format as clear subsections for each quarter.
         
         h) BEST PERIODS (MANDATORY):
            Title: "Best Periods"
            Include three subsections:
            - Best months for action: List months (e.g., "March, July, November")
            - Best months for relationships: List months
            - Best months for finances: List months
            For each, provide brief description (1 line) of why these periods are favorable.
            Use strategic language, not predictions.
         
         i) LOW-RETURN PERIODS (RENAMED - was "Caution Periods"):
            Title: "Low-Return Periods" (NOT "Caution Periods" - sounds less negative, more strategic)
            Include:
            - Emotional volatility periods: Months and brief description
            - Financial risk periods: Months and brief description  
            - Decision fatigue periods: Months and brief description
            Frame as "more challenging for" and "lower return on investment" - NOT "avoid" or "will fail".
            Use strategic, less fear-based language.
         
         j) FOCUS AREAS BY MONTH (optional but valuable):
            Title: "Focus Areas by Month"
            Create a simple table/list format:
            Month | Focus
            Jan   | Planning
            Mar   | Action
            Jul   | Lower activity
            Nov   | Consolidate
            Keep to 2-4 words per month focus.
         
         k) YEAR SCORECARD (visual indicator):
            Title: "Year Scorecard"
            Rate on 1-5 star scale (use ★ symbols):
            • Career: ★★★★☆ (4/5) - Brief explanation
            • Relationships: ★★★☆☆ (3/5) - Brief explanation
            • Money: ★★★★☆ (4/5) - Brief explanation
            Frame as "favorability" not "guaranteed success".
         
         l) WHAT TO DO THIS YEAR (actionable guidance):
            Title: "What to Do This Year"
            Clear bullet actions:
            • Strengthen [specific area]
            • Focus on [specific approach]
            • Best used for [specific actions]
            • Favors [specific behaviors]
            • Avoid over-emphasizing [specific areas]
            Use "favors" and "best used for" language, NOT "must do" or "don't do".
         
         m) YEAR-END OUTLOOK (closing section):
            Title: "Year-End Outlook"
            Include:
            • What improves by year-end (1-2 lines)
            • What carries forward into next year (1-2 lines)
            Frame as themes and tendencies, not predictions.
         
         n) End with "What This Means For You" summary (ONLY place where repetition from summary is allowed)
      
      5. LANGUAGE RULES:
         - Keep bullets to 12-15 words max
         - Use calm, strategic language
         - NO fear-based language
         - NO absolute statements
         - Focus on guidance and themes
         - After technical terms, explain what they mean in daily life
         - Compress text - avoid repetition except in Executive Summary and final "What This Means For You"
      
      6. DISCLAIMER (include at end):
         "This report provides strategic guidance for ${periodDescription} based on astrological patterns. 
         These are themes and tendencies, not predictions. Use this guidance to plan thoughtfully, 
         not as definitive outcomes. Your actions and circumstances always play a role in outcomes."
      `,

    majorLifePhase: (birthDetails: any, planetaryData: any) => `
      ${AI_PROMPT_SYSTEM_MESSAGE}

      INPUT:
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
      
      5. MANDATORY STRUCTURE (follow exactly):
         
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
         
         e) PHASE THEME:
            Title: "3-5 Year Strategic Life Phase Theme"
            Content: One clear sentence describing the overall theme of the next 3-5 years
            Example: "The next 3-5 years represent a phase of transformation and career advancement for you."
            Include the timeframe: "2024-2028" (or current year + 3 to current year + 5)
         
         f) EXECUTIVE SUMMARY (MANDATORY):
            Title: "Phase-at-a-Glance Summary"
            Include:
            • Overall phase theme (1 line)
            • Major transitions expected (2-3 transitions)
            • Key opportunity areas (2-3 areas)
            • Areas requiring attention (1-2 areas)
            • Strategic approach (1 line)
            Format as clear bullet points, max 20 words each.
         
         g) YEAR-BY-YEAR BREAKDOWN (MANDATORY - REDUCED TEXT):
            Title: "Year-by-Year Breakdown"
            For EACH year (Year 1, Year 2, Year 3, Year 4, Year 5):
            - Year label: "Year 1 (2024)", "Year 2 (2025)", etc.
            - Theme: One line describing the year's theme
            - Focus areas: MAXIMUM 3 bullets per year (not paragraphs) - avoid fatigue
            Format as clear, concise subsections. Keep each year to essentials only.
         
         h) MAJOR TRANSITIONS (MANDATORY):
            Title: "Major Transitions Ahead"
            Identify 3-5 major transitions in:
            - Career (job changes, promotions, career shifts)
            - Relationships (marriage, partnerships, family changes)
            - Finances (income changes, investments, financial milestones)
            - Health (wellness phases, lifestyle changes)
            - Education (learning phases, skill development)
            - Other significant life changes
            For each transition:
            - Type of transition
            - Approximate timeframe (e.g., "2025-2026", "late 2026")
            - Description of what the transition may involve
            - Preparation steps (2-3 actionable items)
            Frame as "phases when" not "will happen".
         
         i) LONG-TERM OPPORTUNITIES (MANDATORY):
            Title: "Long-Term Opportunities"
            Identify 4-6 major opportunities across:
            - Career growth
            - Financial accumulation
            - Relationship development
            - Personal growth
            - Health and wellness
            - Education and skills
            For each opportunity:
            - Category
            - Timeframe (which years this opportunity is most relevant)
            - Description of the opportunity
            - Action items (2-3 specific steps to maximize this opportunity)
            Frame as "windows when" and "periods that favor".
         
         j) STRATEGIC GUIDANCE (MANDATORY):
            Title: "How to Navigate This Phase"
            Provide:
            • Overall strategy (2-3 lines)
            • When to take action vs. when to wait (guidance)
            • Key principles to follow (3-4 principles)
            • What to prioritize (2-3 priorities)
            • What to avoid over-emphasizing (2-3 warnings)
            Use "tends to favor" and "may be best for" language.
         
         k) End with "What This Means For You" summary (ONLY place where repetition from summary is allowed)
      
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
      
      3. MANDATORY STRUCTURE (follow exactly):
         
         a) DECISION CONTEXT (first section):
            Title: "Decision Context"
            Content: If decision context provided, summarize it. Otherwise, provide general guidance framework.
            Example: "This report provides astrological guidance to support your decision-making process."
         
         b) CURRENT ASTROLOGICAL CLIMATE (MANDATORY):
            Title: "Current Astrological Climate for Decision-Making"
            Include:
            • Current Dasha period and its influence on decision-making
            • Current planetary influences affecting major decisions
            • Overall energy and momentum level
            • Whether this is a time for action, planning, or waiting
            Format as clear subsections.
         
         c) DECISION OPTIONS ANALYSIS (if context provided) OR GENERAL GUIDANCE (if no context):
            Title: ${decisionContext ? "Analysis of Your Options" : "General Decision-Making Guidance"}
            ${decisionContext 
              ? `For each option mentioned in the decision context:
                 - Option name
                 - Astrological alignment: "High", "Medium", or "Low"
                 - Timeframe when this option may be most favorable
                 - Key considerations (2-3 points)
                 - Planetary factors supporting or challenging this option
                 Frame as guidance, not directives.`
              : `Provide guidance on:
                 - Career decisions (job changes, promotions, career shifts)
                 - Financial decisions (investments, major purchases)
                 - Relationship decisions (marriage, partnerships)
                 - Education decisions (courses, certifications)
                 - Location decisions (moving, relocating)
                 - Health decisions (treatment options, lifestyle changes)
                 For each category, provide:
                 - Current alignment level (High/Medium/Low)
                 - Best timing windows
                 - Key considerations`
            }
         
         d) TIMING GUIDANCE (MANDATORY):
            Title: "Recommended Timing"
            Include:
            • Best periods to make decisions (approximate months/years)
            • Periods to avoid major decisions (with reasons)
            • When to take action vs. when to gather more information
            • How current planetary influences affect decision timing
            Frame as "tends to favor" not "must do now".
         
         e) FACTORS TO CONSIDER (MANDATORY):
            Title: "Key Factors to Consider"
            List 5-7 important factors based on the astrological chart:
            • Planetary influences relevant to the decision
            • Dasha period implications
            • House influences (if relevant)
            • Long-term vs. short-term considerations
            • Personal strengths and challenges to consider
            Format as clear bullets.
         
         f) STRATEGIC APPROACH (MANDATORY):
            Title: "Recommended Approach"
            Provide:
            • Overall strategy for decision-making (2-3 lines)
            • Steps to take before deciding (3-4 steps)
            • How to maximize favorable timing
            • How to mitigate challenges
            • When to seek additional guidance
            Use "may be beneficial" and "consider" language.
         
         g) CONFIDENCE LEVEL (mandatory):
            Include: "Confidence Level: [X]/10"
            Where X is between 6-8 (decision support requires multiple factors).
            Add note: "This reflects the strength of astrological guidance. Always combine with practical considerations."
      
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
  if (!startYear || !startMonth || !endYear || !endMonth) {
    const { getYearAnalysisDateRange } = require("./dateHelpers");
    const range = getYearAnalysisDateRange();
    startYear = range.startYear;
    startMonth = range.startMonth;
    endYear = range.endYear;
    endMonth = range.endMonth;
  }
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const dateDescription = `${monthNames[startMonth - 1]} ${startYear} - ${monthNames[endMonth - 1]} ${endYear}`;
  const targetYear = startYear; // Use start year as primary reference
  
  return AI_PROMPT_TEMPLATES["v1.0"].yearAnalysis(
    birthDetails, 
    planetaryData, 
    targetYear,
    startMonth,
    endYear,
    endMonth,
    dateDescription
  );
}

/**
 * Generate prompt for Major Life Phase report (3-5 year outlook)
 */
export function generateMajorLifePhasePrompt(birthDetails: any, planetaryData: any): string {
  return AI_PROMPT_TEMPLATES["v1.0"].majorLifePhase(birthDetails, planetaryData);
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
