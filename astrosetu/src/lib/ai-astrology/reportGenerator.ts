/**
 * AI Report Generator
 * Generates astrology reports using AI prompts and astrology calculation data
 */

import type { AIAstrologyInput, ReportType, ReportContent } from "./types";
import { generateLifeSummaryPrompt, generateMarriageTimingPrompt, generateCareerMoneyPrompt, generateFullLifePrompt, generateYearAnalysisPrompt, generateMajorLifePhasePrompt, generateDecisionSupportPrompt } from "./prompts";
import { getKundli } from "../astrologyAPI";
import { generateKundliCacheKey, getCachedKundli, cacheKundli, getCachedDosha, cacheDosha } from "./kundliCache";
import type { KundliResult, DoshaAnalysis, KundliChart } from "@/types/astrology";

/**
 * Helper function to get Kundli with caching
 * Returns cached data if available, otherwise fetches kundli data and caches result
 */
async function getKundliWithCache(input: AIAstrologyInput): Promise<{
  kundli: KundliResult & { chart?: KundliChart };
  kundliTime: number;
  cacheKey: string;
}> {
  const cacheKey = generateKundliCacheKey({
    name: input.name,
    dob: input.dob,
    tob: input.tob,
    place: input.place,
    latitude: input.latitude,
    longitude: input.longitude,
    timezone: input.timezone || "Asia/Kolkata",
    ayanamsa: 1,
  });

  const cachedKundli = getCachedKundli(cacheKey);
  
  if (cachedKundli) {
    console.log(`[KundliCache] ✅ Cache HIT - using cached data (0ms)`);
    return {
      kundli: cachedKundli,
      kundliTime: 0,
      cacheKey,
    };
  }

  // Cache miss - fetch kundli data
  console.log(`[KundliCache] ❌ Cache MISS - fetching kundli data...`);
  const kundliStartTime = Date.now();
  const kundliResult = await getKundli({
    name: input.name,
    dob: input.dob,
    tob: input.tob,
    place: input.place,
    latitude: input.latitude,
    longitude: input.longitude,
    timezone: input.timezone || "Asia/Kolkata",
    ayanamsa: 1,
  });
  const kundliTime = Date.now() - kundliStartTime;
  console.log(`[KundliCache] Kundli fetch completed in ${kundliTime}ms, caching result...`);
  
  // Cache the result for future use
  cacheKundli(cacheKey, kundliResult);
  
  return {
    kundli: kundliResult,
    kundliTime,
    cacheKey,
  };
}

/**
 * Helper function to get Dosha analysis with caching
 */
async function getDoshaWithCache(
  input: AIAstrologyInput,
  cacheKey: string
): Promise<{
  dosha: DoshaAnalysis | null;
  doshaTime: number;
}> {
  const cachedDosha = getCachedDosha(cacheKey);
  
  if (cachedDosha !== undefined) {
    // Cache hit (can be null if explicitly cached as "no dosha")
    console.log(`[KundliCache] ✅ Dosha cache HIT - using cached data (0ms)`);
    return {
      dosha: cachedDosha,
      doshaTime: 0,
    };
  }

  // Cache miss - fetch dosha data
  console.log(`[KundliCache] ❌ Dosha cache MISS - fetching dosha data...`);
  const doshaStartTime = Date.now();
  
  try {
    const { getDoshaAnalysis } = await import("../astrologyAPI");
    const doshaAnalysis = await getDoshaAnalysis({
      name: input.name,
      dob: input.dob,
      tob: input.tob,
      place: input.place,
      latitude: input.latitude,
      longitude: input.longitude,
      timezone: input.timezone || "Asia/Kolkata",
      ayanamsa: 1,
    });
    const doshaTime = Date.now() - doshaStartTime;
    console.log(`[KundliCache] Dosha API call completed in ${doshaTime}ms, caching result...`);
    
    // Cache the result (even if null)
    cacheDosha(cacheKey, doshaAnalysis);
    
    return {
      dosha: doshaAnalysis,
      doshaTime,
    };
  } catch (e) {
    console.log(`[KundliCache] Dosha API call failed:`, e);
    // Cache the failure (null) to avoid repeated failed calls
    cacheDosha(cacheKey, null);
    const doshaTime = Date.now() - doshaStartTime;
    return {
      dosha: null,
      doshaTime,
    };
  }
}

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "";

// Check if AI is configured
export function isAIConfigured(): boolean {
  return !!(OPENAI_API_KEY || ANTHROPIC_API_KEY);
}

/**
 * Generate AI report using OpenAI or Anthropic
 */
async function generateAIContent(
  prompt: string, 
  reportType?: string,
  sessionKey?: string,
  input?: any
): Promise<string> {
  if (OPENAI_API_KEY) {
    // Reduced max retries to 3 for faster response (was 5)
    // Most requests succeed on first try, retries add significant delay
    return generateWithOpenAI(prompt, 0, 3, reportType, sessionKey, input);
  } else if (ANTHROPIC_API_KEY) {
    return generateWithAnthropic(prompt);
  } else {
    throw new Error("No AI API key configured. Set OPENAI_API_KEY or ANTHROPIC_API_KEY");
  }
}

/**
 * Generate content using OpenAI GPT-4
 * Includes retry logic with exponential backoff for rate limits
 */
async function generateWithOpenAI(
  prompt: string, 
  retryCount: number = 0, 
  maxRetries: number = 3, 
  reportType?: string,
  sessionKey?: string,
  input?: any
): Promise<string> {
  const callStartTime = Date.now();
  
  // Optimize token counts for faster generation while maintaining quality
  // Reduced tokens for faster responses:
  // Free reports: 1000 tokens (further reduced from 1200 for faster generation)
  // Regular paid reports: 1800 tokens - good balance, faster
  // Complex reports: 2200 tokens (optimized from 2500 for faster generation while maintaining quality)
  // Note: major-life-phase uses 2200 tokens for optimal speed/quality balance (was 2500, originally 3000)
  const isComplexReport = reportType === "full-life" || reportType === "major-life-phase";
  const isFreeReport = reportType === "life-summary";
  // Use 2200 tokens for complex reports to optimize speed while maintaining quality (reduced from 2500)
  // Free life-summary is the primary engagement surface; give it a bit more room to avoid "thin" output.
  const maxTokens = isComplexReport ? 2200 : (isFreeReport ? 1400 : 1800); // 1400 for free, 1800 for paid, 2200 for complex
  
  // Add explicit timeout to fetch (45 seconds max per request)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s timeout per request
  
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that generates astrology reports in a clear, structured format.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: maxTokens,
      }),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
    // Track failed OpenAI call (best-effort)
    if (sessionKey && typeof require !== "undefined") {
      try {
        const { trackOpenAICall } = require("./openAICallTracker");
        const callDuration = Date.now() - callStartTime;
        trackOpenAICall(sessionKey, reportType || "unknown", false, retryCount, callDuration);
      } catch {
        // ignore
      }
    }
    const errorText = await response.text();
    let errorData: any;
    
    try {
      errorData = JSON.parse(errorText);
    } catch {
      throw new Error(`OpenAI API error: ${errorText}`);
    }

    // Handle rate limit errors with retry
    if (response.status === 429 || errorData?.error?.code === "rate_limit_exceeded") {
      if (retryCount < maxRetries) {
        // Faster retry strategy for better user experience
        // Use shorter waits for free reports to avoid long delays
        const isFreeReportType = reportType === "life-summary";
        let waitTime = isFreeReportType ? 3000 : 5000; // 3s for free reports, 5s for paid (reduced from 10s)
        
        // Check Retry-After header first (this is the most reliable source)
        const retryAfterHeader = response.headers.get("retry-after");
        if (retryAfterHeader) {
          const retryAfterSeconds = parseInt(retryAfterHeader);
          if (!isNaN(retryAfterSeconds)) {
            waitTime = retryAfterSeconds * 1000; // Convert seconds to milliseconds
            // Cap at 15 seconds max per retry (was unbounded) for faster failure
            waitTime = Math.min(waitTime, 15000);
          }
        } else {
          // Try to parse retry-after from error message
          const errorMessage = errorData?.error?.message || "";
          const retryAfterMatch = errorMessage.match(/try again in (\d+)\s*(ms|seconds?|s)/i) || 
                                  errorMessage.match(/retry after (\d+)\s*(ms|seconds?|s)/i);
          if (retryAfterMatch) {
            const retryValue = parseInt(retryAfterMatch[1]);
            const unit = retryAfterMatch[2]?.toLowerCase() || "seconds";
            if (unit.includes("ms") || unit.includes("millisecond")) {
              waitTime = Math.max(retryValue, 3000); // Minimum 3 seconds (reduced from 5s)
            } else {
              // Seconds
              waitTime = Math.max(retryValue * 1000, 3000); // Minimum 3 seconds (reduced from 5s)
              waitTime = Math.min(waitTime, 15000); // Cap at 15s
            }
          } else {
            // Faster exponential backoff: 5s, 8s, 12s (was 10s, 20s, 30s, 40s, 50s)
            waitTime = 5000 + (retryCount * 3500); // 5s, 8.5s, 12s
          }
        }

        // Add jitter (random 0-2 seconds, reduced from 0-3s) to avoid thundering herd
        const jitter = Math.random() * 2000;
        const totalWait = Math.min(waitTime + jitter, 20000); // Cap at 20 seconds total (reduced from 60s)

        console.log(`[OpenAI] Rate limit hit for reportType=${reportType || "unknown"}, retrying after ${Math.round(totalWait / 1000)}s (attempt ${retryCount + 1}/${maxRetries})`);
        
        await new Promise(resolve => setTimeout(resolve, totalWait));
        return generateWithOpenAI(prompt, retryCount + 1, maxRetries, reportType, sessionKey, input);
      } else {
        const finalError = `OpenAI rate limit exceeded. Maximum retries (${maxRetries}) reached after ${maxRetries} attempts. Please try again in a few minutes.`;
        console.error(`[OpenAI] ${finalError} (reportType=${reportType || "unknown"})`);
        throw new Error(finalError);
      }
    }

    // Handle other errors
    throw new Error(`OpenAI API error: ${errorText}`);
    }

    // Log successful request (only on first attempt to reduce noise)
    if (retryCount === 0) {
      console.log(`[OpenAI] Successfully generated content for reportType=${reportType || "unknown"}`);
    } else {
      console.log(`[OpenAI] Successfully generated content after ${retryCount} retries (reportType=${reportType || "unknown"})`);
    }

    // Parse response with error handling and timeout protection
    try {
      const data = await response.json();
      const content = data.choices[0]?.message?.content || "";
      const tokensUsed = data.usage?.total_tokens;
      const callDuration = Date.now() - callStartTime;
      
      if (!content) {
        console.warn(`[OpenAI] Empty content in response for reportType=${reportType || "unknown"}`);
      }
      console.log(`[OpenAI] Response parsed successfully, content length: ${content.length} chars${tokensUsed ? `, tokens: ${tokensUsed}` : ""}`);
      
      // Track successful OpenAI call (if sessionKey provided)
      if (sessionKey && typeof require !== "undefined") {
        try {
          const { trackOpenAICall } = require("./openAICallTracker");
          trackOpenAICall(sessionKey, reportType || "unknown", true, retryCount, callDuration, tokensUsed);
        } catch (e) {
          // Ignore tracking errors
        }
      }
      
      return content;
    } catch (parseError: any) {
      console.error(`[OpenAI] Failed to parse response JSON for reportType=${reportType || "unknown"}`, {
        error: parseError.message,
        status: response.status,
        statusText: response.statusText,
      });
      // Track parse failure (best-effort)
      if (sessionKey && typeof require !== "undefined") {
        try {
          const { trackOpenAICall } = require("./openAICallTracker");
          const callDuration = Date.now() - callStartTime;
          trackOpenAICall(sessionKey, reportType || "unknown", false, retryCount, callDuration);
        } catch {
          // ignore
        }
      }
      throw new Error(`Failed to parse AI response: ${parseError.message}`);
    }
  } catch (fetchError: any) {
    clearTimeout(timeoutId);
    if (fetchError.name === 'AbortError') {
      // Track timeout failure (best-effort)
      if (sessionKey && typeof require !== "undefined") {
        try {
          const { trackOpenAICall } = require("./openAICallTracker");
          const callDuration = Date.now() - callStartTime;
          trackOpenAICall(sessionKey, reportType || "unknown", false, retryCount, callDuration);
        } catch {
          // ignore
        }
      }
      throw new Error("OpenAI API request timed out after 45 seconds. Please try again.");
    }
    // Track generic failure (best-effort)
    if (sessionKey && typeof require !== "undefined") {
      try {
        const { trackOpenAICall } = require("./openAICallTracker");
        const callDuration = Date.now() - callStartTime;
        trackOpenAICall(sessionKey, reportType || "unknown", false, retryCount, callDuration);
      } catch {
        // ignore
      }
    }
    throw fetchError;
  }
}

/**
 * Generate content using Anthropic Claude
 */
async function generateWithAnthropic(prompt: string): Promise<string> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-3-sonnet-20240229",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error: ${error}`);
  }

  const data = await response.json();
  // Handle Anthropic response structure
  if (!data.content || !Array.isArray(data.content) || data.content.length === 0) {
    console.error("[Anthropic] Invalid response structure:", data);
    throw new Error("Invalid response from Anthropic API");
  }
  return data.content[0]?.text || "";
}

/**
 * Generate unique report ID
 */
function generateReportId(): string {
  return `RPT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}

/**
 * Parse AI response into structured report content
 */
function parseAIResponse(response: string, reportType: ReportType, reportId?: string): ReportContent {
  // For MVP, return simple structured content
  // In production, use more sophisticated parsing (regex, markdown parsing, etc.)
  
  // Handle empty or invalid responses
  if (!response || typeof response !== "string" || response.trim().length === 0) {
    return {
      title: getReportTitle(reportType),
      sections: [{
        title: "Report",
        content: "Unable to generate report content. Please try again.",
      }],
      summary: "Report generation encountered an issue. Please try again.",
      // Don't include reportId in content - it's in the API response data
      generatedAt: new Date().toISOString(),
    };
  }
  
  const sections: ReportContent["sections"] = [];
  const lines = response.split("\n").filter(line => line.trim());
  
  let currentSection: { title: string; content: string; bullets?: string[] } | null = null;
  let executiveSummary: string | undefined = undefined;
  
  // Check for Executive Summary section (for Full Life Report)
  if (reportType === "full-life") {
    const execSummaryMatch = response.match(/(?:Executive Summary|Your Key Life Insights \(Summary\))[:]\s*(.*?)(?=\n\n|\n[A-Z#]|$)/is);
    if (execSummaryMatch && execSummaryMatch[1]) {
      executiveSummary = execSummaryMatch[1].trim().substring(0, 500);
    }
  }
  
  const lifeSummaryTitleSet =
    reportType === "life-summary"
      ? new Set(
          [
            "executive summary",
            "top strengths",
            "key challenges",
            "relationships & communication",
            "career & money themes",
            "health & energy themes",
            "growth & spiritual themes",
            "next 30 days: quick wins",
            "important information",
          ].map((s) => s.toLowerCase())
        )
      : null;

  for (const line of lines) {
    const trimmed = line.trim();
    const normalizedTitle = trimmed.replace(/^#{1,3}\s+/, "").replace(/:$/, "").trim().toLowerCase();

    // Life-summary robustness: LLMs sometimes output headings without ":" / "#" even when instructed.
    // If we fail to detect headings, the report collapses into 1 big section and feels "thin".
    if (lifeSummaryTitleSet && lifeSummaryTitleSet.has(normalizedTitle)) {
      if (currentSection) sections.push(currentSection);
      currentSection = { title: trimmed.replace(/:$/, "").trim(), content: "" };
      continue;
    }

    // Check if it's a section header (starts with # or number)
    if (line.match(/^#{1,3}\s+|^\d+\.\s+.*:|^[A-Z][^:]*:$/)) {
      // Save previous section
      if (currentSection) {
        sections.push(currentSection);
      }
      // Start new section
      const title = line.replace(/^#{1,3}\s+/, "").replace(/^\d+\.\s+/, "").replace(/\*+\s*/, "").replace(/:/, "").trim();
      currentSection = { title, content: "" };
    } else if (line.trim().startsWith("-") || line.trim().startsWith("•") || line.trim().match(/^\d+\)/)) {
      // Bullet point
      if (currentSection) {
        if (!currentSection.bullets) {
          currentSection.bullets = [];
        }
        const bullet = line.replace(/^[-•]\s+/, "").replace(/^\d+\)\s+/, "").trim();
        if (bullet && bullet.length <= 100) { // Limit bullet length
          currentSection.bullets.push(bullet);
        }
      }
    } else if (currentSection && line.trim()) {
      // Regular content
      currentSection.content += (currentSection.content ? "\n" : "") + line.trim();
    }
  }
  
  // Add last section
  if (currentSection) {
    sections.push(currentSection);
  }
  
  // CRITICAL FIX (2026-01-18 - ChatGPT Task 2): Fallback for empty/invalid AI response
  // If no sections were parsed or response is empty, create minimal report with 2-3 sections
  // This prevents blank screen when AI parsing fails completely
  if (sections.length === 0 || !response || response.trim().length === 0) {
    console.warn("[parseAIResponse] No sections parsed or empty response - creating fallback report", {
      reportType,
      responseLength: response?.length || 0,
      sectionsBeforeFallback: sections.length,
    });
    
    // Create minimal fallback report with 2-3 sections
    sections.push({
      title: "Overview",
      content: "We're preparing your personalized insights. This is a simplified view of your report.",
    });
    sections.push({
      title: "Next Steps",
      content: "For a complete analysis with detailed timing windows and guidance, please try generating the report again. Our system uses AI and astrological calculations to provide comprehensive insights.",
    });
  }

  // CRITICAL FIX (2026-01-19): Ensure minimum section count for comprehensive reports
  // Paid reports (career-money, major-life-phase, decision-support) should have at least 6-7 detailed sections
  // This prevents reports from being too short
  const paidReportTypes: ReportType[] = ["career-money", "major-life-phase", "decision-support", "year-analysis", "marriage-timing", "full-life"];
  // Higher minimum for individual paid reports to ensure comprehensive content
  const minSectionsForPaid = reportType === "decision-support" || reportType === "career-money" || reportType === "major-life-phase" ? 6 : 4;
  
  if (paidReportTypes.includes(reportType) && sections.length < minSectionsForPaid) {
    console.warn("[parseAIResponse] Paid report has fewer than minimum sections - adding fallback sections", {
      reportType,
      currentSections: sections.length,
      minimumRequired: minSectionsForPaid,
    });

    // Add fallback sections based on report type to ensure comprehensive content
    const existingTitles = new Set(sections.map(s => s.title.toLowerCase()));
    
    if (reportType === "career-money") {
      // Add comprehensive fallback sections for career-money reports
      if (!existingTitles.has("career momentum windows") && !existingTitles.has("career momentum") && !existingTitles.has("career phases")) {
        sections.push({
          title: "Career Momentum and Growth Phases",
          content: "Your career development follows distinct phases influenced by planetary cycles and Dasha periods. Growth phases favor skill building, networking, and taking on new challenges. Consolidation phases require focusing on stability, mastering current roles, and building long-term foundations. Understanding these phases helps you time major career decisions effectively.",
        });
      }
      if (!existingTitles.has("best career directions") && !existingTitles.has("career directions") && !existingTitles.has("ideal career")) {
        sections.push({
          title: "Best Career Directions",
          content: "Based on your birth chart analysis, certain career directions align better with your natural strengths and planetary influences. These directions leverage your core astrological traits and provide opportunities for growth. Consider roles that match your planetary strengths and allow for the expression of your natural talents.",
        });
      }
      if (!existingTitles.has("financial patterns") && !existingTitles.has("money growth") && !existingTitles.has("financial cycles")) {
        sections.push({
          title: "Financial Growth Patterns and Cycles",
          content: "Your financial growth patterns align with career development phases and planetary influences. During favorable periods, focus on strategic investments, skill development, and income-generating activities. During consolidation phases, prioritize stability, reserve building, and careful financial planning. Understanding these cycles helps optimize financial decisions.",
        });
      }
      if (!existingTitles.has("career challenges") && !existingTitles.has("navigating challenges")) {
        sections.push({
          title: "Career Challenges and How to Navigate Them",
          content: "Every career journey includes challenges that require strategic navigation. Understanding potential obstacles in advance helps you prepare and respond effectively. Some challenges relate to timing, while others involve skill development or relationship dynamics. Focus on building resilience and adaptability to overcome obstacles.",
        });
      }
      if (!existingTitles.has("long-term strategy") && !existingTitles.has("strategic career") && !existingTitles.has("career strategy")) {
        sections.push({
          title: "Long-Term Career Strategy",
          content: "A strategic approach to career development involves understanding your long-term path and making decisions that align with it. Consider your 5-year outlook, key milestones, and areas for development. Focus on building skills and experiences that support your long-term goals while taking advantage of favorable timing windows.",
        });
      }
      if (!existingTitles.has("strategic recommendations") && !existingTitles.has("action items") && !existingTitles.has("recommendations")) {
        sections.push({
          title: "Strategic Career and Financial Recommendations",
          content: "Based on your birth chart analysis, prioritize roles that allow growth and learning. Build skills during favorable periods. Network strategically during transition phases. Focus on long-term career development rather than short-term gains. For finances, automate savings, invest during favorable periods, and maintain reserves during challenging times.",
        });
      }
    } else if (reportType === "major-life-phase") {
      // Add comprehensive fallback sections for major-life-phase reports
      if (!existingTitles.has("strategic overview") && !existingTitles.has("phase overview") && !existingTitles.has("phase theme")) {
        sections.push({
          title: "Strategic Phase Overview",
          content: "The next 3-5 years represent a significant phase in your life journey. This period brings opportunities for growth, transitions, and major developments across multiple life areas. Understanding the overarching themes of this phase helps you navigate challenges and maximize opportunities effectively. This phase is characterized by specific planetary influences and Dasha periods that shape your experiences.",
        });
      }
      if (!existingTitles.has("year-by-year breakdown") && !existingTitles.has("year breakdown")) {
        sections.push({
          title: "Year-by-Year Strategic Breakdown",
          content: "Each year within this phase has distinct themes and focus areas. Year 1 typically involves foundation building and establishing new patterns. Year 2-3 often bring expansion and growth opportunities. Later years focus on consolidation and preparation for the next phase. Understanding the progression helps you align your actions with each year's energy.",
        });
      }
      if (!existingTitles.has("key opportunities") && !existingTitles.has("opportunities") && !existingTitles.has("long-term opportunities")) {
        sections.push({
          title: "Key Opportunities Ahead",
          content: "During this phase, several key opportunities may arise across different life areas including career advancement, relationship development, financial growth, and personal development. These opportunities align with favorable planetary transits and Dasha periods. Timing and preparation are essential to maximize these opportunities when they arise.",
        });
      }
      if (!existingTitles.has("major transitions") && !existingTitles.has("transitions")) {
        sections.push({
          title: "Major Life Transitions",
          content: "This phase includes significant transitions in various life areas. Career transitions may involve role changes, promotions, or shifts in direction. Relationship transitions could include marriage, partnerships, or family changes. Financial transitions involve income changes, investments, or major purchases. Understanding and preparing for these transitions helps you navigate them more smoothly.",
        });
      }
      if (!existingTitles.has("navigating challenges") && !existingTitles.has("challenges")) {
        sections.push({
          title: "Navigating Challenges and Obstacles",
          content: "This phase may also bring challenges that require attention and strategic navigation. These could include periods of uncertainty, required adjustments, or obstacles that test your resilience. Understanding potential challenges in advance helps you prepare and respond effectively. Focus on building resilience, maintaining flexibility, and seeking support when needed.",
        });
      }
      if (!existingTitles.has("strategic guidance") && !existingTitles.has("how to navigate") && !existingTitles.has("navigating this phase")) {
        sections.push({
          title: "How to Navigate This Phase Strategically",
          content: "Strategic navigation of this phase involves understanding when to take action versus when to wait, what to prioritize, and what principles to follow. Some periods favor decisive action, while others require patience and preparation. Key principles include maintaining balance, staying adaptable, and aligning actions with favorable timing windows.",
        });
      }
    } else if (reportType === "decision-support") {
      // Add comprehensive fallback sections for decision-support reports
      if (!existingTitles.has("decision framework") && !existingTitles.has("decision-making framework") && !existingTitles.has("current astrological climate")) {
        sections.push({
          title: "Current Astrological Climate for Decision-Making",
          content: "Your current Dasha period and planetary transits create a specific decision-making environment. Understanding these influences helps you align your choices with favorable timing. Some periods favor decisive action, while others require careful planning and gathering more information. The current astrological climate indicates whether this is a time for immediate action or strategic preparation.",
        });
      }
      if (!existingTitles.has("decision analysis") && !existingTitles.has("astrological perspective") && !existingTitles.has("options analysis")) {
        sections.push({
          title: "Astrological Analysis of Decision Options",
          content: "From an astrological perspective, different decision options have varying levels of alignment with your birth chart patterns. Options that align with your natural strengths and current planetary influences tend to have better outcomes. Consider how each option resonates with your core astrological traits and current life phase.",
        });
      }
      if (!existingTitles.has("timing considerations") && !existingTitles.has("decision timing") && !existingTitles.has("optimal timing")) {
        sections.push({
          title: "Optimal Timing for Decisions",
          content: "Timing is a critical factor in decision-making. Some periods are naturally more favorable for taking action, while others require patience and preparation. The alignment of planets and current Dasha period influences when decisions should be made. Understanding these timing windows helps you choose the most opportune moments for important choices.",
        });
      }
      if (!existingTitles.has("strategic approach") && !existingTitles.has("recommended approach") && !existingTitles.has("decision strategy")) {
        sections.push({
          title: "Strategic Decision-Making Approach",
          content: "A strategic approach to decision-making involves considering both astrological guidance and practical factors. Combine insights from your birth chart with real-world considerations, personal values, and professional advice when needed. This balanced approach ensures decisions are both aligned with astrological timing and grounded in reality.",
        });
      }
      if (!existingTitles.has("key considerations") && !existingTitles.has("factors to consider") && !existingTitles.has("important factors")) {
        sections.push({
          title: "Important Factors to Consider",
          content: "When making major decisions, several astrological factors should be considered. These include the current Dasha period, planetary transits affecting relevant houses, and the alignment of your decision with your natural strengths. Additionally, consider the long-term vs. short-term implications and how the decision fits into your overall life path.",
        });
      }
      if (!existingTitles.has("decision categories") && !existingTitles.has("types of decisions") && !existingTitles.has("decision guidance")) {
        sections.push({
          title: "Guidance for Different Types of Decisions",
          content: "Different types of decisions require different approaches based on astrological timing. Career decisions benefit from analyzing the 10th house and career-related planets. Relationship decisions involve the 7th house and Venus influences. Financial decisions relate to the 2nd and 11th houses. Understanding which astrological factors apply to your specific decision type provides more targeted guidance.",
        });
      }
    }
    
    // Ensure we have at least the minimum required sections
    while (sections.length < minSectionsForPaid) {
      sections.push({
        title: `Additional Insights - Section ${sections.length + 1}`,
        content: "This section contains additional astrological insights based on your birth chart analysis. For comprehensive guidance, consider reviewing all sections of this report together.",
      });
    }
  }
  
  // Add disclaimer section (static content, not generated by AI)
  // This reduces prompt tokens and ensures consistency
  // Note: Disclaimer is added post-processing, not in prompt
  sections.push({
    title: "Important Information",
    content: "**Disclaimer:** Educational guidance only • Fully automated • No live support\n\nThis report is generated using AI and traditional astrological calculations. It provides guidance based on planetary positions but should not replace professional advice.",
  });
  
  return {
    title: getReportTitle(reportType),
    sections,
    summary: extractSummary(response),
    executiveSummary: executiveSummary || (reportType === "full-life" ? extractSummary(response) : undefined),
    // CRITICAL: Don't include reportId here - it's generated by the API route and stored in data.reportId
    // This ensures a single canonical reportId (single source of truth)
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Test-only export: allows unit tests to validate parsing behavior without calling external astrology APIs.
 * Do not use in production code.
 */
export function __test_parseAIResponse(response: string, reportType: ReportType): ReportContent {
  return parseAIResponse(response, reportType);
}

function extractSummary(response: string): string {
  // Extract first paragraph or first few sentences as summary
  const paragraphs = response.split("\n\n").filter(p => p.trim());
  return paragraphs[0]?.substring(0, 300) || response.substring(0, 300);
}

function getReportTitle(reportType: ReportType): string {
  switch (reportType) {
    case "marriage-timing":
      return "Marriage Timing Report";
    case "career-money":
      return "Career & Money Path Report";
    case "full-life":
      return "Full Life Report";
    case "year-analysis":
      return "Year Analysis Report";
    case "major-life-phase":
      return "3-5 Year Strategic Life Phase Report";
    case "decision-support":
      return "Decision Support Report";
    default:
      return "Life Summary Report";
  }
}

/**
 * Generate Life Summary Report (Free)
 */
export async function generateLifeSummaryReport(input: AIAstrologyInput, sessionKey?: string): Promise<ReportContent> {
  const startTime = Date.now();
  try {
    console.log(`[generateLifeSummaryReport] Starting report generation for ${input.name}`);
    // Get astrology data with caching (optimized)
    const { kundli: kundliResult, kundliTime } = await getKundliWithCache(input);
    console.log(`[generateLifeSummaryReport] Kundli data ready (${kundliTime}ms), extracting planetary data...`);

    // Extract planetary data (handle missing planets array)
    const planets = (kundliResult.planets || []).map(p => ({
      name: p.name,
      sign: p.sign,
      house: p.house || 0,
      degrees: p.degree || 0,
    }));
    console.log(`[generateLifeSummaryReport] Planetary data extracted (${planets.length} planets)`);

    // Generate prompt
    const prompt = generateLifeSummaryPrompt(
      {
        name: input.name,
        dob: input.dob,
        tob: input.tob,
        place: input.place,
        gender: input.gender,
      },
      {
        ascendant: kundliResult.ascendant || "Unknown",
        moonSign: planets.find(p => p.name === "Moon")?.sign || "Unknown",
        sunSign: planets.find(p => p.name === "Sun")?.sign || "Unknown",
        nakshatra: kundliResult.nakshatra || "Unknown",
        planets,
      }
    );

    // Generate AI content (pass reportType for proper retry handling and logging)
    console.log(`[generateLifeSummaryReport] Generating AI content...`);
    const aiStartTime = Date.now();
    const aiResponse = await generateAIContent(prompt, "life-summary", sessionKey, input);
    const aiTime = Date.now() - aiStartTime;
    console.log(`[generateLifeSummaryReport] AI content generated in ${aiTime}ms, parsing response...`);
  
    // Parse and return
    const parsed = parseAIResponse(aiResponse, "life-summary");
    const totalTime = Date.now() - startTime;
    console.log(`[generateLifeSummaryReport] Report generation complete in ${totalTime}ms (Kundli: ${kundliTime}ms, AI: ${aiTime}ms)`);
    return parsed;
  } catch (error: any) {
    const totalTime = Date.now() - startTime;
    console.error(`[generateLifeSummaryReport] Error after ${totalTime}ms:`, error);
    throw error; // Re-throw to be handled by API route
  }
}

/**
 * Generate Marriage Timing Report (Paid)
 */
export async function generateMarriageTimingReport(input: AIAstrologyInput, sessionKey?: string): Promise<ReportContent> {
  const startTime = Date.now();
  try {
    console.log(`[generateMarriageTimingReport] Starting report generation for ${input.name}`);
    // Get astrology data with caching (optimized)
    const { kundli: kundliResult, kundliTime, cacheKey } = await getKundliWithCache(input);
    console.log(`[generateMarriageTimingReport] Kundli data ready (${kundliTime}ms)`);

    // PARALLELIZATION: Start dosha fetch and prompt preparation in parallel
    console.log(`[generateMarriageTimingReport] Starting parallel dosha fetch and prompt preparation...`);
    const parallelStartTime = Date.now();
    
    // Start both operations simultaneously
    const [doshaResult, timingWindows] = await Promise.all([
      // Dosha analysis (with caching)
      getDoshaWithCache(input, cacheKey).catch((e) => {
        console.warn(`[generateMarriageTimingReport] Dosha fetch failed, continuing without:`, e);
        return { dosha: null, doshaTime: 0 };
      }),
      // Date window calculation (no API call, just computation)
      import("./dateHelpers").then(m => m.getMarriageTimingWindows()),
    ]);
    
    const { dosha: doshaAnalysis, doshaTime } = doshaResult;
    const parallelTime = Date.now() - parallelStartTime;
    console.log(`[generateMarriageTimingReport] Parallel operations completed in ${parallelTime}ms (Dosha: ${doshaTime}ms, Windows: ${parallelTime - doshaTime}ms)`);

    // Extract relevant planetary data (handle missing planets array)
    const planets = kundliResult.planets || [];
    const venus = planets.find(p => p.name === "Venus");
    const jupiter = planets.find(p => p.name === "Jupiter");
    const mars = planets.find(p => p.name === "Mars");
    
    // Get 7th house (marriage house) - simplified, would need chart data
    const seventhHousePlanets = planets.filter(p => p.house === 7).map(p => p.name);

    // timingWindows already fetched in parallel above, use it here
    
    // Generate prompt
    const prompt = generateMarriageTimingPrompt(
      {
        name: input.name,
        dob: input.dob,
        tob: input.tob,
        place: input.place,
        gender: input.gender,
      },
      {
        ascendant: kundliResult.ascendant || "Unknown",
        moonSign: planets.find(p => p.name === "Moon")?.sign || "Unknown",
        venus: {
          sign: venus?.sign || "Unknown",
          house: venus?.house || 0,
          degrees: venus?.degree || 0,
        },
        jupiter: {
          sign: jupiter?.sign || "Unknown",
          house: jupiter?.house || 0,
          degrees: jupiter?.degree || 0,
        },
        mars: {
          sign: mars?.sign || "Unknown",
          house: mars?.house || 0,
          degrees: mars?.degree || 0,
        },
        seventhHouse: {
          sign: "Unknown", // Would need chart data
          planets: seventhHousePlanets,
        },
        currentDasha: kundliResult.chart?.dasha?.current || "Unknown",
        nextDasha: kundliResult.chart?.dasha?.next || "Unknown",
        manglik: doshaAnalysis?.manglik?.status === "Manglik",
        doshas: doshaAnalysis ? [
          ...(doshaAnalysis.manglik?.status === "Manglik" ? ["Manglik"] : []),
          ...(doshaAnalysis.kaalSarp?.present ? ["Kaal Sarp"] : []),
        ] : [],
      },
      timingWindows
    );

    // Generate AI content (pass reportType for proper retry handling and logging)
    console.log(`[generateMarriageTimingReport] Generating AI content...`);
    const aiStartTime = Date.now();
    const aiResponse = await generateAIContent(prompt, "marriage-timing", sessionKey, input);
    const aiTime = Date.now() - aiStartTime;
    console.log(`[generateMarriageTimingReport] AI content generated in ${aiTime}ms, parsing response...`);
    
    // Parse and return
    const parsed = parseAIResponse(aiResponse, "marriage-timing");
    const totalTime = Date.now() - startTime;
    console.log(`[generateMarriageTimingReport] Report generation complete in ${totalTime}ms (Kundli: ${kundliTime}ms, Dosha: ${doshaTime}ms, AI: ${aiTime}ms)`);
    return parsed;
  } catch (error: any) {
    const totalTime = Date.now() - startTime;
    console.error(`[generateMarriageTimingReport] Error after ${totalTime}ms:`, error);
    throw error; // Re-throw to be handled by API route
  }
}

/**
 * Generate Career & Money Report (Paid)
 */
export async function generateCareerMoneyReport(input: AIAstrologyInput, sessionKey?: string): Promise<ReportContent> {
  const startTime = Date.now();
  try {
    console.log(`[generateCareerMoneyReport] Starting report generation for ${input.name}`);
    // Get astrology data with caching (optimized)
    const { kundli: kundliResult, kundliTime } = await getKundliWithCache(input);
    console.log(`[generateCareerMoneyReport] Kundli data ready (${kundliTime}ms), extracting planetary data...`);

    // Extract relevant planetary data
    // 10th house = career, 2nd house = money
    const planets = kundliResult.planets || [];
    const tenthHousePlanets = planets.filter(p => p.house === 10).map(p => p.name);
    const secondHousePlanets = planets.filter(p => p.house === 2).map(p => p.name);
    
    // Career-related planets (Sun, Jupiter, Saturn, Mercury in 10th or strong)
    const careerPlanets = planets
      .filter(p => ["Sun", "Jupiter", "Saturn", "Mercury"].includes(p.name) || p.house === 10)
      .map(p => ({
        name: p.name,
        sign: p.sign,
        house: p.house || 0,
      }));

    // Get intelligent date windows for career timing (relative to current date)
    const { getCareerTimingWindows, getDateContext } = await import("./dateHelpers");
    const dateContext = getDateContext();
    const careerWindows = getCareerTimingWindows();
    
    // Generate prompt
    const prompt = generateCareerMoneyPrompt(
      {
        name: input.name,
        dob: input.dob,
        tob: input.tob,
        place: input.place,
        gender: input.gender,
      },
      {
        ascendant: kundliResult.ascendant || "Unknown",
        sunSign: planets.find(p => p.name === "Sun")?.sign || "Unknown",
        moonSign: planets.find(p => p.name === "Moon")?.sign || "Unknown",
        tenthHouse: {
          sign: "Unknown", // Would need chart data
          planets: tenthHousePlanets,
        },
        secondHouse: {
          sign: "Unknown", // Would need chart data
          planets: secondHousePlanets,
        },
        currentDasha: kundliResult.chart?.dasha?.current || "Unknown",
        nextDasha: kundliResult.chart?.dasha?.next || "Unknown",
        careerPlanets,
      },
      careerWindows
    );

    // Generate AI content (pass reportType for proper retry handling and logging)
    console.log(`[generateCareerMoneyReport] Generating AI content...`);
    const aiStartTime = Date.now();
    const aiResponse = await generateAIContent(prompt, "career-money", sessionKey, input);
    const aiTime = Date.now() - aiStartTime;
    console.log(`[generateCareerMoneyReport] AI content generated in ${aiTime}ms, parsing response...`);
    
    // Parse and return
    const parsed = parseAIResponse(aiResponse, "career-money");
    const totalTime = Date.now() - startTime;
    console.log(`[generateCareerMoneyReport] Report generation complete in ${totalTime}ms (Kundli: ${kundliTime}ms, AI: ${aiTime}ms)`);
    return parsed;
  } catch (error: any) {
    const totalTime = Date.now() - startTime;
    console.error(`[generateCareerMoneyReport] Error after ${totalTime}ms:`, error);
    throw error; // Re-throw to be handled by API route
  }
}

/**
 * Generate Full Life Report (Paid - comprehensive report)
 */
export async function generateFullLifeReport(input: AIAstrologyInput, sessionKey?: string): Promise<ReportContent> {
  const startTime = Date.now();
  try {
    console.log(`[generateFullLifeReport] Starting report generation for ${input.name}`);
    // Get astrology data with caching (optimized)
    const { kundli: kundliResult, kundliTime, cacheKey } = await getKundliWithCache(input);
    console.log(`[generateFullLifeReport] Kundli data ready (${kundliTime}ms)`);

    // Get dosha analysis with caching (optimized)
    const { dosha: doshaAnalysis, doshaTime } = await getDoshaWithCache(input, cacheKey);

    // Extract planetary data (handle missing planets array)
    const planets = (kundliResult.planets || []).map(p => ({
      name: p.name,
      sign: p.sign,
      house: p.house || 0,
      degrees: p.degree || 0,
    }));

    // Comprehensive planetary data for Full Life Report
    const comprehensivePlanetaryData = {
      ascendant: kundliResult.ascendant || "Unknown",
      moonSign: planets.find(p => p.name === "Moon")?.sign || "Unknown",
      sunSign: planets.find(p => p.name === "Sun")?.sign || "Unknown",
      nakshatra: kundliResult.nakshatra || "Unknown",
      planets,
      currentDasha: kundliResult.chart?.dasha?.current || "Unknown",
      nextDasha: kundliResult.chart?.dasha?.next || "Unknown",
      manglik: doshaAnalysis?.manglik?.status === "Manglik",
      doshas: doshaAnalysis ? [
        ...(doshaAnalysis.manglik?.status === "Manglik" ? ["Manglik"] : []),
        ...(doshaAnalysis.kaalSarp?.present ? ["Kaal Sarp"] : []),
      ] : [],
    };

    // Generate prompt using dedicated Full Life prompt
    const prompt = generateFullLifePrompt(
      {
        name: input.name,
        dob: input.dob,
        tob: input.tob,
        place: input.place,
        gender: input.gender,
      },
      comprehensivePlanetaryData
    );

    // Generate AI content (pass reportType for complex report handling)
    console.log(`[generateFullLifeReport] Generating AI content...`);
    const aiStartTime = Date.now();
    const aiResponse = await generateAIContent(prompt, "full-life", sessionKey, input);
    const aiTime = Date.now() - aiStartTime;
    console.log(`[generateFullLifeReport] AI content generated in ${aiTime}ms, parsing response...`);
    
    // Parse and return
    const parsed = parseAIResponse(aiResponse, "full-life");
    const totalTime = Date.now() - startTime;
    console.log(`[generateFullLifeReport] Report generation complete in ${totalTime}ms (Kundli: ${kundliTime}ms, Dosha: ${doshaTime}ms, AI: ${aiTime}ms)`);
    return parsed;
  } catch (error: any) {
    const totalTime = Date.now() - startTime;
    console.error(`[generateFullLifeReport] Error after ${totalTime}ms:`, error);
    // Fallback: If dedicated prompt fails, combine individual reports
    try {
      const [lifeSummary, marriageTiming, careerMoney] = await Promise.all([
        generateLifeSummaryReport(input),
        generateMarriageTimingReport(input),
        generateCareerMoneyReport(input),
      ]);

      return {
        title: "Full Life Report",
        sections: [
          ...lifeSummary.sections,
          ...marriageTiming.sections,
          ...careerMoney.sections,
        ],
        summary: `${lifeSummary.summary}\n\n${marriageTiming.summary}\n\n${careerMoney.summary}`,
        keyInsights: [
          ...(lifeSummary.keyInsights || []),
          ...(marriageTiming.keyInsights || []),
          ...(careerMoney.keyInsights || []),
        ],
      };
    } catch (fallbackError) {
      throw error; // Re-throw original error
    }
  }
}

/**
 * Generate Year Analysis Report (Paid - 12-month strategic guidance)
 * Uses intelligent date window: next 12 months from current date
 */
export async function generateYearAnalysisReport(
  input: AIAstrologyInput,
  sessionKey?: string,
  dateRange?: { startYear: number; startMonth: number; endYear: number; endMonth: number }
): Promise<ReportContent> {
  const startTime = Date.now();
  try {
    console.log(`[generateYearAnalysisReport] Starting report generation for ${input.name}`);
    // Get astrology data with caching (optimized)
    const { kundli: kundliResult, kundliTime } = await getKundliWithCache(input);
    console.log(`[generateYearAnalysisReport] Kundli data ready (${kundliTime}ms), extracting planetary data...`);

    // Extract planetary data (handle missing planets array)
    const planets = (kundliResult.planets || []).map(p => ({
      name: p.name,
      sign: p.sign,
      house: p.house || 0,
      degrees: p.degree || 0,
    }));

    // Planetary data for Year Analysis Report
    const planetaryData = {
      ascendant: kundliResult.ascendant || "Unknown",
      moonSign: planets.find(p => p.name === "Moon")?.sign || "Unknown",
      sunSign: planets.find(p => p.name === "Sun")?.sign || "Unknown",
      nakshatra: kundliResult.nakshatra || "Unknown",
      planets,
      currentDasha: kundliResult.chart?.dasha?.current || "Unknown",
      nextDasha: kundliResult.chart?.dasha?.next || "Unknown",
    };

    // Use date range if provided, otherwise calculate from current date (intelligent 12-month window)
    const { getYearAnalysisDateRange } = await import("./dateHelpers");
    const yearRange = dateRange || getYearAnalysisDateRange();
    
    // Generate prompt using Year Analysis prompt template
    console.log(`[generateYearAnalysisReport] Generating prompt...`);
    const prompt = generateYearAnalysisPrompt(
      {
        name: input.name,
        dob: input.dob,
        tob: input.tob,
        place: input.place,
        gender: input.gender,
      },
      planetaryData,
      yearRange.startYear,
      yearRange.startMonth,
      yearRange.endYear,
      yearRange.endMonth
    );

    // Generate AI content (pass reportType for proper retry handling and logging)
    console.log(`[generateYearAnalysisReport] Calling generateAIContent...`);
    const aiStartTime = Date.now();
    const aiResponse = await generateAIContent(prompt, "year-analysis", sessionKey, input);
    const aiTime = Date.now() - aiStartTime;
    console.log(`[generateYearAnalysisReport] AI content generated in ${aiTime}ms, parsing response...`);
    
    // Parse and return
    const parsed = parseAIResponse(aiResponse, "year-analysis");
    const totalTime = Date.now() - startTime;
    console.log(`[generateYearAnalysisReport] Report generation complete in ${totalTime}ms (Kundli: ${kundliTime}ms, AI: ${aiTime}ms)`);
    return parsed;
  } catch (error: any) {
    const totalTime = Date.now() - startTime;
    console.error(`[generateYearAnalysisReport] Error after ${totalTime}ms:`, error);
    throw error; // Re-throw to be handled by API route
  }
}

/**
 * Generate Major Life Phase Report (Paid - 3-5 year outlook)
 */
export async function generateMajorLifePhaseReport(input: AIAstrologyInput, sessionKey?: string): Promise<ReportContent> {
  const startTime = Date.now();
  try {
    console.log(`[generateMajorLifePhaseReport] Starting report generation for ${input.name}`);
    // Get astrology data with caching (optimized)
    const { kundli: kundliResult, kundliTime } = await getKundliWithCache(input);
    console.log(`[generateMajorLifePhaseReport] Kundli data ready (${kundliTime}ms), extracting planetary data...`);

    // Extract planetary data
    const planets = (kundliResult.planets || []).map(p => ({
      name: p.name,
      sign: p.sign,
      house: p.house || 0,
      degrees: p.degree || 0,
    }));

    const planetaryData = {
      ascendant: kundliResult.ascendant || "Unknown",
      moonSign: planets.find(p => p.name === "Moon")?.sign || "Unknown",
      sunSign: planets.find(p => p.name === "Sun")?.sign || "Unknown",
      nakshatra: kundliResult.nakshatra || "Unknown",
      planets,
      currentDasha: kundliResult.chart?.dasha?.current || "Unknown",
      nextDasha: kundliResult.chart?.dasha?.next || "Unknown",
    };

    // Get date windows for major life phase (3-5 years from current date)
    const { getMajorLifePhaseWindows } = await import("./dateHelpers");
    const dateWindows = getMajorLifePhaseWindows();
    
    // Generate prompt with dynamic date windows
    const prompt = generateMajorLifePhasePrompt(
      {
        name: input.name,
        dob: input.dob,
        tob: input.tob,
        place: input.place,
        gender: input.gender,
      },
      planetaryData,
      dateWindows
    );

    // Generate AI content (pass reportType for complex report handling)
    console.log(`[generateMajorLifePhaseReport] Generating AI content...`);
    const aiStartTime = Date.now();
    const aiResponse = await generateAIContent(prompt, "major-life-phase", sessionKey, input);
    const aiTime = Date.now() - aiStartTime;
    console.log(`[generateMajorLifePhaseReport] AI content generated in ${aiTime}ms, parsing response...`);
    
    // Parse and return
    const parsed = parseAIResponse(aiResponse, "major-life-phase");
    const totalTime = Date.now() - startTime;
    console.log(`[generateMajorLifePhaseReport] Report generation complete in ${totalTime}ms (Kundli: ${kundliTime}ms, AI: ${aiTime}ms)`);
    return parsed;
  } catch (error: any) {
    const totalTime = Date.now() - startTime;
    console.error(`[generateMajorLifePhaseReport] Error after ${totalTime}ms:`, error);
    throw error;
  }
}

/**
 * Generate Decision Support Report (Paid - decision guidance)
 */
export async function generateDecisionSupportReport(
  input: AIAstrologyInput,
  decisionContext?: string,
  sessionKey?: string
): Promise<ReportContent> {
  const startTime = Date.now();
  try {
    console.log(`[generateDecisionSupportReport] Starting report generation for ${input.name}`);
    // Get astrology data with caching (optimized)
    const { kundli: kundliResult, kundliTime } = await getKundliWithCache(input);
    console.log(`[generateDecisionSupportReport] Kundli data ready (${kundliTime}ms), extracting planetary data...`);

    // Extract planetary data
    const planets = (kundliResult.planets || []).map(p => ({
      name: p.name,
      sign: p.sign,
      house: p.house || 0,
      degrees: p.degree || 0,
    }));

    const planetaryData = {
      ascendant: kundliResult.ascendant || "Unknown",
      moonSign: planets.find(p => p.name === "Moon")?.sign || "Unknown",
      sunSign: planets.find(p => p.name === "Sun")?.sign || "Unknown",
      nakshatra: kundliResult.nakshatra || "Unknown",
      planets,
      currentDasha: kundliResult.chart?.dasha?.current || "Unknown",
      nextDasha: kundliResult.chart?.dasha?.next || "Unknown",
    };

    // Generate prompt
    const prompt = generateDecisionSupportPrompt(
      {
        name: input.name,
        dob: input.dob,
        tob: input.tob,
        place: input.place,
        gender: input.gender,
      },
      planetaryData,
      decisionContext
    );

    // Generate AI content (pass reportType for proper retry handling and logging)
    console.log(`[generateDecisionSupportReport] Generating AI content...`);
    const aiStartTime = Date.now();
    const aiResponse = await generateAIContent(prompt, "decision-support", sessionKey, input);
    const aiTime = Date.now() - aiStartTime;
    console.log(`[generateDecisionSupportReport] AI content generated in ${aiTime}ms, parsing response...`);
    
    // Parse and return
    const parsed = parseAIResponse(aiResponse, "decision-support");
    const totalTime = Date.now() - startTime;
    console.log(`[generateDecisionSupportReport] Report generation complete in ${totalTime}ms (Kundli: ${kundliTime}ms, AI: ${aiTime}ms)`);
    return parsed;
  } catch (error: any) {
    const totalTime = Date.now() - startTime;
    console.error(`[generateDecisionSupportReport] Error after ${totalTime}ms:`, error);
    throw error;
  }
}

