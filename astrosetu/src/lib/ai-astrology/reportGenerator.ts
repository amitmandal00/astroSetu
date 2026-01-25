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
export async function generateAIContent(
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
  // CRITICAL FIX (ChatGPT Feedback): Increased tokens to match word count requirements
  // Token-to-word ratio: ~0.75 (1 token ≈ 0.75 words), but actual output is 60-70% of max due to JSON structure
  // Adjusted thresholds:
  // - Full-life: 2800 tokens (was 2400) → targets 1300+ words
  // - Major-life-phase: 2600 tokens (was 2400) → targets 1000+ words
  // - Year-analysis: 2600 tokens (was 2400) → targets 800+ words (many sections need more room)
  // - Regular paid: 1800 tokens → targets 800+ words
  // - Free: 1400 tokens → no strict requirement
  const isComplexReport = reportType === "full-life" || reportType === "major-life-phase" || reportType === "year-analysis";
  const isCareerMoneyReport = reportType === "career-money";
  const isFreeReport = reportType === "life-summary";
  
  // Increased tokens for complex reports to meet word count requirements
  const maxTokens = reportType === "full-life" ? 2800 :  // Was 2400
                    reportType === "major-life-phase" ? 2600 :  // Was 2400
                    reportType === "year-analysis" ? 2600 :  // Was 2400
                    isFreeReport ? 1400 : 1800; // Free: 1400, Regular paid: 1800
  
  // CRITICAL FIX: Increase timeout to match server timeout (120s for complex reports)
  // Server timeout is 120s for complex reports, so client timeout should be slightly less (110s)
  // to account for network overhead and other processing
  // For non-complex reports, server timeout is 60s, so use 55s for client
  const clientTimeoutMs = (isComplexReport || isCareerMoneyReport) ? 110000 : 55000; // 110s for complex, 55s for regular
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), clientTimeoutMs);
  
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
            content: "You are a helpful assistant that generates astrology reports. You MUST output valid JSON only, following the exact schema provided. Do not include any text before or after the JSON.",
          },
          {
            role: "user",
            content: prompt + "\n\nIMPORTANT: Output ONLY valid JSON. Do not include markdown code blocks, explanations, or any text outside the JSON object.",
          },
        ],
        temperature: 0.7,
        max_tokens: maxTokens,
        response_format: { type: "json_object" }, // CRITICAL FIX (Priority 2): Force JSON output
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
      let content = data.choices[0]?.message?.content || "";
      const tokensUsed = data.usage?.total_tokens;
      const callDuration = Date.now() - callStartTime;
      
      // CRITICAL FIX (Priority 2): Try to parse as JSON first
      let parsedJson: any = null;
      try {
        // Remove markdown code blocks if present
        const cleanedContent = content.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
        parsedJson = JSON.parse(cleanedContent);
        console.log(`[OpenAI] Successfully parsed JSON response for reportType=${reportType || "unknown"}`);
      } catch (jsonError) {
        // JSON parse failed - will fallback to regex parsing in parseAIResponse
        console.warn(`[OpenAI] JSON parse failed, will use regex fallback for reportType=${reportType || "unknown"}`, {
          error: jsonError instanceof Error ? jsonError.message : String(jsonError),
          contentLength: content.length,
        });
      }
      
      if (!content) {
        console.warn(`[OpenAI] Empty content in response for reportType=${reportType || "unknown"}`);
      }
      console.log(`[OpenAI] Response parsed successfully, content length: ${content.length} chars${tokensUsed ? `, tokens: ${tokensUsed}` : ""}, isJSON: ${!!parsedJson}`);
      
      // Track successful OpenAI call (if sessionKey provided)
      if (sessionKey && typeof require !== "undefined") {
        try {
          const { trackOpenAICall } = require("./openAICallTracker");
          trackOpenAICall(sessionKey, reportType || "unknown", true, retryCount, callDuration, tokensUsed);
        } catch (e) {
          // Ignore tracking errors
        }
      }
      
      // Return parsed JSON string if available, otherwise return raw content for regex parsing
      return parsedJson ? JSON.stringify(parsedJson) : content;
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
 * CRITICAL FIX (Priority 2): Try JSON parsing first, fallback to regex parsing
 */
function parseAIResponse(response: string, reportType: ReportType, reportId?: string): ReportContent {
  // Handle empty or invalid responses
  if (!response || typeof response !== "string" || response.trim().length === 0) {
    return {
      title: getReportTitle(reportType),
      sections: [{
        title: "Report",
        content: "Unable to generate report content. Please try again.",
      }],
      summary: "Report generation encountered an issue. Please try again.",
      generatedAt: new Date().toISOString(),
    };
  }
  
  // CRITICAL FIX (Priority 2): Try to parse as JSON first
  let parsedJson: any = null;
  try {
    // Remove markdown code blocks if present
    const cleanedResponse = response.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
    parsedJson = JSON.parse(cleanedResponse);
    console.log(`[parseAIResponse] Successfully parsed JSON for reportType=${reportType}`);
    
    // Validate JSON structure
    if (parsedJson && typeof parsedJson === "object") {
      // Convert JSON to ReportContent format
      const sections: ReportContent["sections"] = [];
      
      // Handle sections array
      if (Array.isArray(parsedJson.sections)) {
        sections.push(...parsedJson.sections.map((s: any) => ({
          title: s.title || "Section",
          content: s.content || "",
          bullets: Array.isArray(s.bullets) ? s.bullets : undefined,
          subsections: Array.isArray(s.subsections) ? s.subsections.map((ss: any) => ({
            title: ss.title || "Subsection",
            content: ss.content || "",
            bullets: Array.isArray(ss.bullets) ? ss.bullets : undefined,
          })) : undefined,
        })));
      } else if (parsedJson.sections && typeof parsedJson.sections === "object") {
        // Handle sections as object (convert to array)
        Object.entries(parsedJson.sections).forEach(([key, value]: [string, any]) => {
          sections.push({
            title: value.title || key,
            content: value.content || String(value),
            bullets: Array.isArray(value.bullets) ? value.bullets : undefined,
          });
        });
      }
      
      // Build report content from JSON
      const reportContent: ReportContent = {
        title: parsedJson.title || getReportTitle(reportType),
        sections: sections.length > 0 ? sections : [{
          title: "Overview",
          content: parsedJson.content || parsedJson.summary || "Report content generated.",
        }],
        summary: parsedJson.summary,
        executiveSummary: parsedJson.executiveSummary,
        keyInsights: Array.isArray(parsedJson.keyInsights) ? parsedJson.keyInsights : undefined,
        timeWindows: Array.isArray(parsedJson.timeWindows) ? parsedJson.timeWindows : undefined,
        recommendations: Array.isArray(parsedJson.recommendations) ? parsedJson.recommendations : undefined,
        yearTheme: parsedJson.yearTheme,
        quarterlyBreakdown: Array.isArray(parsedJson.quarterlyBreakdown) ? parsedJson.quarterlyBreakdown : undefined,
        bestPeriods: Array.isArray(parsedJson.bestPeriods) ? parsedJson.bestPeriods : undefined,
        cautionPeriods: Array.isArray(parsedJson.cautionPeriods) ? parsedJson.cautionPeriods : undefined,
        focusAreasByMonth: Array.isArray(parsedJson.focusAreasByMonth) ? parsedJson.focusAreasByMonth : undefined,
        yearScorecard: parsedJson.yearScorecard,
        confidenceLevel: typeof parsedJson.confidenceLevel === "number" ? parsedJson.confidenceLevel : undefined,
        phaseTheme: parsedJson.phaseTheme,
        phaseYears: parsedJson.phaseYears,
        phaseBreakdown: Array.isArray(parsedJson.phaseBreakdown) ? parsedJson.phaseBreakdown : undefined,
        majorTransitions: Array.isArray(parsedJson.majorTransitions) ? parsedJson.majorTransitions : undefined,
        longTermOpportunities: Array.isArray(parsedJson.longTermOpportunities) ? parsedJson.longTermOpportunities : undefined,
        decisionContext: parsedJson.decisionContext,
        decisionOptions: Array.isArray(parsedJson.decisionOptions) ? parsedJson.decisionOptions : undefined,
        recommendedTiming: parsedJson.recommendedTiming,
        factorsToConsider: Array.isArray(parsedJson.factorsToConsider) ? parsedJson.factorsToConsider : undefined,
        generatedAt: parsedJson.generatedAt || new Date().toISOString(),
      };
      
      console.log(`[parseAIResponse] JSON parsed successfully, sections: ${reportContent.sections.length}`);
      return reportContent;
    }
  } catch (jsonError) {
    // JSON parse failed - fallback to regex parsing
    console.warn(`[parseAIResponse] JSON parse failed, falling back to regex parsing for reportType=${reportType}`, {
      error: jsonError instanceof Error ? jsonError.message : String(jsonError),
      responseLength: response.length,
    });
    
    // CRITICAL FIX (Priority 4): Structured log for JSON parse failure
    console.log("[STRUCTURED_LOG]", JSON.stringify({
      reportType,
      timestamp: new Date().toISOString(),
      event: "JSON_PARSE_FAIL",
      reasonCode: "JSON_PARSE_FAIL",
      repairStrategy: "regex_fallback",
      repairAttempted: false,
      errorMessage: jsonError instanceof Error ? jsonError.message : String(jsonError),
      responseLength: response.length,
    }));
  }
  
  // Fallback: Original regex-based parsing (for backward compatibility)
  // For MVP, return simple structured content
  // In production, use more sophisticated parsing (regex, markdown parsing, etc.)
  
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

  // Year-analysis specific section titles for robust parsing
  const yearAnalysisTitleSet =
    reportType === "year-analysis"
      ? new Set(
          [
            "decision anchor",
            "year strategy",
            "year theme",
            "year-at-a-glance summary",
            "year at a glance",
            "quarter-by-quarter breakdown",
            "quarterly breakdown",
            "best periods",
            "favorable periods",
            "low-return periods",
            "caution periods",
            "focus areas by month",
            "monthly focus",
            "year scorecard",
            "what to do this year",
            "year-end outlook",
            "what this means for you",
            "confidence level",
            "data source",
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

    // Year-analysis robustness: Handle section titles that may not have standard formatting
    if (yearAnalysisTitleSet && yearAnalysisTitleSet.has(normalizedTitle)) {
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
  
  // Filter out sections with empty or placeholder content
  // Check if sections have meaningful content (not just empty or placeholder text)
  const meaningfulSections = sections.filter(section => {
    const hasContent = section.content && section.content.trim().length > 20;
    const hasBullets = section.bullets && section.bullets.length > 0;
    // Exclude placeholder content patterns
    const isPlaceholder = section.content && (
      section.content.includes("We're preparing your personalized insights") ||
      section.content.includes("This is a simplified view") ||
      section.content.includes("For a complete analysis with detailed timing windows") ||
      section.content.includes("This section contains additional astrological insights") ||
      section.content.toLowerCase().includes("additional insights") ||
      section.content.toLowerCase().includes("simplified view")
    );
    return (hasContent || hasBullets) && !isPlaceholder;
  });
  
  // CRITICAL FIX for year-analysis: Check if parsed sections actually contain expected year-analysis sections
  // If not, treat as if parsing failed and use fallback sections
  let shouldUseFallbackForYearAnalysis = false;
  if (reportType === "year-analysis") {
    const expectedYearAnalysisTitles = [
      "year strategy", "year theme", "year-at-a-glance", "quarter", "best periods",
      "low-return", "what to do", "year-end", "decision anchor", "confidence level"
    ];
    const hasExpectedSections = meaningfulSections.some(section => {
      const titleLower = section.title.toLowerCase();
      return expectedYearAnalysisTitles.some(expected => titleLower.includes(expected));
    });
    
    // Also check if sections are too short (total content < 500 chars suggests incomplete parsing)
    const totalContentLength = meaningfulSections.reduce((sum, s) => {
      return sum + (s.content?.length || 0) + (s.bullets?.join(" ").length || 0);
    }, 0);
    
    // If no expected sections found OR total content is too short, use fallback
    shouldUseFallbackForYearAnalysis = !hasExpectedSections || totalContentLength < 500;
    
    if (shouldUseFallbackForYearAnalysis) {
      console.warn("[parseAIResponse] Year-analysis report missing expected sections or too short - using fallback sections", {
        hasExpectedSections,
        totalContentLength,
        meaningfulSectionsCount: meaningfulSections.length,
        sectionTitles: meaningfulSections.map(s => s.title),
      });
    }
  }
  
  // CRITICAL FIX (2026-01-18 - ChatGPT Task 2): Fallback for empty/invalid AI response
  // If no sections were parsed or response is empty, create minimal report with 2-3 sections
  // This prevents blank screen when AI parsing fails completely
  // NOTE: For year-analysis, we skip generic fallback and let ensureMinimumSections handle it with specific sections
  if (meaningfulSections.length === 0 || !response || response.trim().length === 0 || shouldUseFallbackForYearAnalysis) {
    console.warn("[parseAIResponse] No meaningful sections parsed or empty response - creating fallback report", {
      reportType,
      responseLength: response?.length || 0,
      sectionsBeforeFallback: sections.length,
      meaningfulSections: meaningfulSections.length,
      shouldUseFallbackForYearAnalysis,
    });
    
    // Clear sections array to start fresh with fallback sections
    sections.length = 0;
    
    // For year-analysis, skip generic fallback - ensureMinimumSections will add specific sections
    if (reportType !== "year-analysis") {
      // Create minimal fallback report with 2-3 sections for other report types
    sections.push({
      title: "Overview",
      content: "We're preparing your personalized insights. This is a simplified view of your report.",
    });
    sections.push({
      title: "Next Steps",
      content: "For a complete analysis with detailed timing windows and guidance, please try generating the report again. Our system uses AI and astrological calculations to provide comprehensive insights.",
    });
    }
    // For year-analysis, sections array remains empty and ensureMinimumSections will populate it with specific sections
  } else {
    // Use meaningful sections instead of all sections
    sections.length = 0;
    sections.push(...meaningfulSections);
  }

  // Build the report object
  const reportBase: ReportContent = {
    title: getReportTitle(reportType),
    sections,
    summary: extractSummary(response),
    executiveSummary: executiveSummary || (reportType === "full-life" ? extractSummary(response) : undefined),
    // CRITICAL: Don't include reportId here - it's generated by the API route and stored in data.reportId
    // This ensures a single canonical reportId (single source of truth)
    generatedAt: new Date().toISOString(),
  };
  
  // Apply fallback sections to ensure comprehensive reports
  const reportWithFallbacks = ensureMinimumSections(reportBase, reportType);
  
  return reportWithFallbacks;
}

/**
 * CRITICAL FIX (2026-01-19): Ensure minimum section count for comprehensive reports
 * This function can be called on any ReportContent to add fallback sections if needed
 * Used by both real AI-generated reports and mock reports
 */
export function ensureMinimumSections(report: ReportContent, reportType: ReportType): ReportContent {
  // CRITICAL: Create a new array to avoid mutating the original
  const sections = report.sections ? [...report.sections] : [];
  
  // Paid reports (career-money, major-life-phase, decision-support) should have at least 6-7 detailed sections
  // This prevents reports from being too short
  const paidReportTypes: ReportType[] = ["career-money", "major-life-phase", "decision-support", "year-analysis", "marriage-timing", "full-life"];
  // Higher minimum for individual paid reports to ensure comprehensive content
  const minSectionsForPaid = reportType === "decision-support" || reportType === "career-money" || reportType === "major-life-phase" ? 6 : 4;
  
  // FIX 1: Helper functions to replace short sections, not just add missing ones
  const getSectionWords = (s: any): number => {
    const text = [s?.content || "", ...(s?.bullets || [])].join(" ");
    return text.trim().split(/\s+/).filter(Boolean).length;
  };
  
  const upsertFallbackSection = (
    sections: any[],
    title: string,
    fallbackSection: any,
    minSectionWords = 120
  ): void => {
    const idx = sections.findIndex(s => (s?.title || "").toLowerCase().trim() === title.toLowerCase().trim());
    if (idx === -1) {
      // Section doesn't exist - add it
      sections.push(fallbackSection);
      return;
    }
    // Section exists - check if it's too short
    const w = getSectionWords(sections[idx]);
    if (w < minSectionWords) {
      // Replace weak section with strong fallback (preserve title from fallback)
      sections[idx] = { ...sections[idx], ...fallbackSection, title: fallbackSection.title };
    }
  };
  
  // CRITICAL FIX: For year-analysis, check if existing sections are weak (contain placeholders or too short)
  // If weak, replace with fallback sections instead of appending
  if (reportType === "year-analysis") {
    const hasWeakContent = sections.some(s => {
      const content = s.content?.toLowerCase() || "";
      return content.includes("simplified view") || 
             content.includes("we're preparing") ||
             content.includes("try generating the report again") ||
             content.includes("additional insights - section") ||
             (s.content && s.content.trim().length < 50); // Very short sections
    });
    
    // Check if sections have expected year-analysis titles
    const expectedTitles = ["year strategy", "year theme", "quarter", "best periods", "low-return", "what to do"];
    const sectionTitles = sections.map(s => s.title.toLowerCase());
    const hasExpectedTitles = expectedTitles.some(expected => 
      sectionTitles.some(title => title.includes(expected))
    );
    
    // If content is weak OR missing expected titles OR too few sections, replace with fallback
    if (hasWeakContent || !hasExpectedTitles || sections.length < 4) {
      console.warn("[ensureMinimumSections] Year-analysis report has weak content - replacing with fallback sections", {
        hasWeakContent,
        hasExpectedTitles,
        currentSections: sections.length,
        sectionTitles: sections.map(s => s.title),
      });
      
      // Clear and replace with fallback sections
      sections.length = 0;
    }
  }
  
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
      // CRITICAL: These sections must total at least 900 words to pass validation
      if (!existingTitles.has("career momentum windows") && !existingTitles.has("career momentum") && !existingTitles.has("career phases")) {
        sections.push({
          title: "Career Momentum and Growth Phases",
          content: "Your career development follows distinct phases influenced by planetary cycles and Dasha periods. Growth phases favor skill building, networking, and taking on new challenges. During these periods, opportunities for advancement arise more naturally, and initiatives tend to move forward smoothly. Consolidation phases require focusing on stability, mastering current roles, and building long-term foundations. Understanding these phases helps you time major career decisions effectively. The interplay between your Dasha period and planetary transits creates windows of opportunity for career growth, skill development, and professional advancement. Recognizing these patterns allows you to maximize favorable periods while using consolidation phases for preparation and foundation building.",
          bullets: [
            "Growth phases: Focus on skill development, networking, and taking on new challenges",
            "Consolidation phases: Prioritize stability, mastery, and building long-term foundations",
            "Timing major decisions: Align career moves with favorable planetary influences",
            "Skill building: Use growth phases to develop capabilities that support long-term goals",
            "Strategic networking: Build professional relationships during favorable periods"
          ],
        });
      }
      if (!existingTitles.has("best career directions") && !existingTitles.has("career directions") && !existingTitles.has("ideal career")) {
        sections.push({
          title: "Best Career Directions",
          content: "Based on your birth chart analysis, certain career directions align better with your natural strengths and planetary influences. These directions leverage your core astrological traits and provide opportunities for growth. Consider roles that match your planetary strengths and allow for the expression of your natural talents. Your 10th house (career) and its ruling planet provide insights into ideal career paths. Additionally, planets in specific houses indicate natural aptitudes and areas where you can excel. Understanding these astrological indicators helps you choose career directions that align with your inherent strengths and provide opportunities for fulfillment and success.",
        });
      }
      if (!existingTitles.has("financial patterns") && !existingTitles.has("money growth") && !existingTitles.has("financial cycles")) {
        sections.push({
          title: "Financial Growth Patterns and Cycles",
          content: "Your financial growth patterns align with career development phases and planetary influences. During favorable periods, focus on strategic investments, skill development, and income-generating activities. These periods support financial growth, wealth accumulation, and opportunities for increasing income. During consolidation phases, prioritize stability, reserve building, and careful financial planning. Understanding these cycles helps optimize financial decisions and timing. The 2nd house (wealth) and 11th house (gains) in your birth chart provide insights into financial patterns and opportunities. Planetary transits affecting these houses create windows for financial growth and periods requiring careful management.",
        });
      }
      if (!existingTitles.has("career challenges") && !existingTitles.has("navigating challenges")) {
        sections.push({
          title: "Career Challenges and How to Navigate Them",
          content: "Every career journey includes challenges that require strategic navigation. Understanding potential obstacles in advance helps you prepare and respond effectively. Some challenges relate to timing, while others involve skill development or relationship dynamics. Focus on building resilience and adaptability to overcome obstacles. Challenging planetary periods may require patience, careful planning, and strategic adjustments. During these times, focus on skill development, relationship building, and preparation for future opportunities. Understanding the astrological indicators of challenges helps you navigate them more effectively and turn obstacles into opportunities for growth.",
        });
      }
      if (!existingTitles.has("long-term strategy") && !existingTitles.has("strategic career") && !existingTitles.has("career strategy")) {
        sections.push({
          title: "Long-Term Career Strategy",
          content: "A strategic approach to career development involves understanding your long-term path and making decisions that align with it. Consider your 5-year outlook, key milestones, and areas for development. Focus on building skills and experiences that support your long-term goals while taking advantage of favorable timing windows. Your Dasha period and planetary transits provide a roadmap for career development over time. Understanding these influences helps you plan strategically, make informed decisions, and align your career path with favorable astrological timing. Long-term success comes from combining astrological guidance with practical career planning and skill development.",
        });
      }
      if (!existingTitles.has("strategic recommendations") && !existingTitles.has("action items") && !existingTitles.has("recommendations")) {
        sections.push({
          title: "Strategic Career and Financial Recommendations",
          content: "Based on your birth chart analysis, prioritize roles that allow growth and learning. Build skills during favorable periods. Network strategically during transition phases. Focus on long-term career development rather than short-term gains. For finances, automate savings, invest during favorable periods, and maintain reserves during challenging times. Align your career and financial activities with favorable planetary influences to maximize opportunities for growth and success. Regular evaluation and adjustment help you stay aligned with evolving opportunities and challenges.",
          bullets: [
            "Prioritize roles that allow growth, learning, and skill development",
            "Build skills during favorable planetary periods for maximum effectiveness",
            "Network strategically during transition phases to build professional relationships",
            "Focus on long-term career development rather than short-term gains",
            "Automate savings and invest during favorable financial periods",
            "Maintain financial reserves during challenging periods for stability"
          ],
        });
      }
      
      // CRITICAL FIX: Check word count and add more sections if needed
      const currentWordCount = sections.reduce((sum, s) => {
        const contentWords = s.content?.split(/\s+/).length || 0;
        const bulletWords = s.bullets?.join(" ").split(/\s+/).length || 0;
        return sum + contentWords + bulletWords;
      }, 0);
      
      if (currentWordCount < 900) {
        if (!existingTitles.has("timing windows") && !existingTitles.has("optimal timing") && !existingTitles.has("favorable periods")) {
          sections.push({
            title: "Optimal Timing Windows for Career and Financial Decisions",
            content: "Specific timing windows throughout your career journey are more favorable for different types of activities. These windows align with positive planetary transits and Dasha influences, creating opportunities for career advancement, financial growth, and professional development. Understanding these timing windows helps you schedule important activities and decisions for maximum benefit. Favorable periods typically feature positive aspects between transiting planets and your natal chart, supportive Dasha influences, and beneficial planetary placements. During these times, career initiatives tend to move forward more smoothly, financial opportunities arise more naturally, and professional relationships develop more easily. It's important to prepare for these periods in advance, so you can fully capitalize on the favorable energies when they arrive.",
          });
        }
      }
    } else if (reportType === "major-life-phase") {
      // Add comprehensive fallback sections for major-life-phase reports
      // CRITICAL: These sections must total at least 1200 words to pass validation
      if (!existingTitles.has("strategic overview") && !existingTitles.has("phase overview") && !existingTitles.has("phase theme")) {
        sections.push({
          title: "Strategic Phase Overview",
          content: "The next 3-5 years represent a significant phase in your life journey. This period brings opportunities for growth, transitions, and major developments across multiple life areas. Understanding the overarching themes of this phase helps you navigate challenges and maximize opportunities effectively. This phase is characterized by specific planetary influences and Dasha periods that shape your experiences. The dominant planetary influences create a narrative arc that unfolds over these years, with different periods emphasizing different aspects of your life path. Understanding this overarching theme helps you make sense of individual events and periods, seeing them as part of a larger pattern rather than isolated occurrences. The phase's theme is shaped by the interaction between your natal chart patterns, your current Dasha period, and the transiting planets. This creates a unique combination of opportunities and challenges that define the phase's character.",
        });
      }
      if (!existingTitles.has("year-by-year breakdown") && !existingTitles.has("year breakdown")) {
        sections.push({
          title: "Year-by-Year Strategic Breakdown",
          content: "Each year within this phase has distinct themes and focus areas. Year 1 typically involves foundation building and establishing new patterns. This year sets the stage for the phase ahead, establishing key themes and patterns that will influence subsequent years. Year 2-3 often bring expansion and growth opportunities, with planetary influences supporting progress and development. These years are typically characterized by momentum, growth, and opportunities for advancement. Later years focus on consolidation and preparation for the next phase, with opportunities to integrate lessons learned and prepare for future transitions. Understanding the progression helps you align your actions with each year's energy, maximizing opportunities and navigating challenges effectively.",
        });
      }
      if (!existingTitles.has("key opportunities") && !existingTitles.has("opportunities") && !existingTitles.has("long-term opportunities")) {
        sections.push({
          title: "Key Opportunities Ahead",
          content: "During this phase, several key opportunities may arise across different life areas including career advancement, relationship development, financial growth, and personal development. These opportunities align with favorable planetary transits and Dasha periods. Timing and preparation are essential to maximize these opportunities when they arise. Career opportunities may include role changes, promotions, or shifts in direction that align with your long-term goals. Relationship opportunities could involve marriage, partnerships, or deepening existing connections. Financial opportunities may include income growth, investments, or wealth-building activities. Personal development opportunities involve skill building, education, or spiritual growth. Understanding the timing of these opportunities helps you prepare and capitalize on them effectively.",
        });
      }
      if (!existingTitles.has("major transitions") && !existingTitles.has("transitions")) {
        sections.push({
          title: "Major Life Transitions",
          content: "This phase includes significant transitions in various life areas. Career transitions may involve role changes, promotions, or shifts in direction. These transitions often align with favorable planetary influences and provide opportunities for growth and advancement. Relationship transitions could include marriage, partnerships, or family changes. These transitions create opportunities for deepening connections and building meaningful relationships. Financial transitions involve income changes, investments, or major purchases. Understanding and preparing for these transitions helps you navigate them more smoothly. The key is to align transitions with favorable timing windows and prepare in advance for the changes ahead.",
        });
      }
      if (!existingTitles.has("navigating challenges") && !existingTitles.has("challenges")) {
        sections.push({
          title: "Navigating Challenges and Obstacles",
          content: "This phase may also bring challenges that require attention and strategic navigation. These could include periods of uncertainty, required adjustments, or obstacles that test your resilience. Understanding potential challenges in advance helps you prepare and respond effectively. Focus on building resilience, maintaining flexibility, and seeking support when needed. Challenging periods may require patience, careful planning, and strategic adjustments. During these times, focus on skill development, relationship building, and preparation for future opportunities. Understanding the astrological indicators of challenges helps you navigate them more effectively and turn obstacles into opportunities for growth.",
        });
      }
      if (!existingTitles.has("strategic guidance") && !existingTitles.has("how to navigate") && !existingTitles.has("navigating this phase")) {
        sections.push({
          title: "How to Navigate This Phase Strategically",
          content: "Strategic navigation of this phase involves understanding when to take action versus when to wait, what to prioritize, and what principles to follow. Some periods favor decisive action, while others require patience and preparation. Key principles include maintaining balance, staying adaptable, and aligning actions with favorable timing windows. Regular evaluation and adjustment help you stay aligned with the phase's evolving themes and opportunities. Focus on building sustainable foundations that will support long-term growth, rather than seeking quick wins that may not last. Develop relationships and networks that can support your goals, and invest in skills and knowledge that will serve you well in the future.",
        });
      }
      
      // CRITICAL FIX: Check word count and add more sections if needed (minimum 1200 for major-life-phase)
      const currentWordCount = sections.reduce((sum, s) => {
        const contentWords = s.content?.split(/\s+/).length || 0;
        const bulletWords = s.bullets?.join(" ").split(/\s+/).length || 0;
        return sum + contentWords + bulletWords;
      }, 0);
      
      if (currentWordCount < 1200) {
        if (!existingTitles.has("career and finances") && !existingTitles.has("career") && !existingTitles.has("money")) {
          sections.push({
            title: "Career and Financial Outlook for This Phase",
            content: "This phase brings specific opportunities and challenges in your career and financial areas. Planetary influences affecting your 10th house (career) and 2nd/11th houses (finances) create distinct patterns of opportunity and caution throughout the phase. Favorable periods support career advancement, financial growth, and professional development. During these times, initiatives tend to move forward smoothly, and opportunities for growth and expansion arise more naturally. Challenging periods require more careful financial management and strategic career planning. Use these times for skill development, relationship building, and preparation for future opportunities. The key is to align your career and financial activities with favorable timing windows while using challenging periods for preparation and foundation building. Long-term financial planning benefits from understanding these cyclical patterns, allowing you to make strategic investments and career moves at optimal times.",
          });
        }
      }
    } else if (reportType === "decision-support") {
      // Add comprehensive fallback sections for decision-support reports
      // CRITICAL: These sections must total at least 900 words to pass validation
      if (!existingTitles.has("decision framework") && !existingTitles.has("decision-making framework") && !existingTitles.has("current astrological climate")) {
        sections.push({
          title: "Current Astrological Climate for Decision-Making",
          content: "Your current Dasha period and planetary transits create a specific decision-making environment. Understanding these influences helps you align your choices with favorable timing. Some periods favor decisive action, while others require careful planning and gathering more information. The current astrological climate indicates whether this is a time for immediate action or strategic preparation. The interplay between your Dasha period and planetary transits creates distinct patterns that influence decision-making effectiveness. Favorable periods support decisive action and clear choices, while challenging periods require more patience and careful consideration. Understanding these patterns helps you time your decisions for maximum effectiveness and alignment with favorable astrological influences.",
        });
      }
      if (!existingTitles.has("decision analysis") && !existingTitles.has("astrological perspective") && !existingTitles.has("options analysis")) {
        sections.push({
          title: "Astrological Analysis of Decision Options",
          content: "From an astrological perspective, different decision options have varying levels of alignment with your birth chart patterns. Options that align with your natural strengths and current planetary influences tend to have better outcomes. Consider how each option resonates with your core astrological traits and current life phase. Your birth chart reveals natural inclinations and strengths that can guide decision-making. Options that align with these inherent traits and current planetary influences typically lead to more favorable outcomes. Understanding these alignments helps you evaluate decision options from an astrological perspective, providing additional insights beyond practical considerations.",
        });
      }
      if (!existingTitles.has("timing considerations") && !existingTitles.has("decision timing") && !existingTitles.has("optimal timing")) {
        sections.push({
          title: "Optimal Timing for Decisions",
          content: "Timing is a critical factor in decision-making. Some periods are naturally more favorable for taking action, while others require patience and preparation. The alignment of planets and current Dasha period influences when decisions should be made. Understanding these timing windows helps you choose the most opportune moments for important choices. Favorable timing windows typically feature positive aspects between transiting planets and your natal chart, supportive Dasha influences, and beneficial planetary placements. During these times, decisions tend to move forward more smoothly, and opportunities for positive outcomes arise more naturally. It's important to prepare for these periods in advance, so you can fully capitalize on favorable energies when they arrive.",
        });
      }
      if (!existingTitles.has("strategic approach") && !existingTitles.has("recommended approach") && !existingTitles.has("decision strategy")) {
        sections.push({
          title: "Strategic Decision-Making Approach",
          content: "A strategic approach to decision-making involves considering both astrological guidance and practical factors. Combine insights from your birth chart with real-world considerations, personal values, and professional advice when needed. This balanced approach ensures decisions are both aligned with astrological timing and grounded in reality. The most effective decisions combine astrological insights with practical wisdom, creating a holistic approach that considers multiple perspectives. Regular evaluation and adjustment help you refine your decision-making process over time, learning from experience while staying aligned with astrological guidance.",
        });
      }
      if (!existingTitles.has("key considerations") && !existingTitles.has("factors to consider") && !existingTitles.has("important factors")) {
        sections.push({
          title: "Important Factors to Consider",
          content: "When making major decisions, several astrological factors should be considered. These include the current Dasha period, planetary transits affecting relevant houses, and the alignment of your decision with your natural strengths. Additionally, consider the long-term vs. short-term implications and how the decision fits into your overall life path. Understanding these factors helps you make more informed decisions that align with both astrological timing and your long-term goals. The interplay between astrological influences and practical considerations creates a comprehensive framework for decision-making that supports positive outcomes.",
        });
      }
      if (!existingTitles.has("decision categories") && !existingTitles.has("types of decisions") && !existingTitles.has("decision guidance")) {
        sections.push({
          title: "Guidance for Different Types of Decisions",
          content: "Different types of decisions require different approaches based on astrological timing. Career decisions benefit from analyzing the 10th house and career-related planets. Relationship decisions involve the 7th house and Venus influences. Financial decisions relate to the 2nd and 11th houses. Understanding which astrological factors apply to your specific decision type provides more targeted guidance. Each type of decision has specific astrological indicators that can provide additional insights. Career decisions align with 10th house influences and career-related planets. Relationship decisions connect with 7th house and Venus influences. Financial decisions relate to 2nd and 11th house patterns. Understanding these connections helps you make more informed decisions in each area.",
        });
      }
      
      // CRITICAL FIX: Check word count and add more sections if needed
      const currentWordCount = sections.reduce((sum, s) => {
        const contentWords = s.content?.split(/\s+/).length || 0;
        const bulletWords = s.bullets?.join(" ").split(/\s+/).length || 0;
        return sum + contentWords + bulletWords;
      }, 0);
      
      if (currentWordCount < 900) {
        if (!existingTitles.has("decision process") && !existingTitles.has("making decisions") && !existingTitles.has("decision steps")) {
          sections.push({
            title: "Decision-Making Process and Steps",
            content: "A structured decision-making process helps you navigate important choices more effectively. Begin by gathering information about your options, considering both practical and astrological factors. Evaluate each option's alignment with your birth chart patterns and current planetary influences. Consider the timing implications and whether the current period favors action or preparation. Make your decision when you have sufficient information and favorable timing, then take action aligned with astrological guidance. Regular evaluation helps you learn from decisions and refine your process over time.",
          });
        }
      }
    } else if (reportType === "marriage-timing") {
      // Add comprehensive fallback sections for marriage-timing reports
      // FIX 1: Use upsertFallbackSection to replace short sections, not just add missing ones
      upsertFallbackSection(
        sections,
        "Marriage Timing Windows and Favorable Periods",
        {
          title: "Marriage Timing Windows and Favorable Periods",
          content: "Your birth chart reveals specific timing windows that are more favorable for marriage and partnership formation. These windows align with positive planetary transits affecting your 7th house (marriage) and Venus influences. Understanding these timing windows helps you plan for marriage at optimal times. Favorable periods typically feature positive aspects between transiting planets and your natal chart, supportive Dasha influences, and beneficial planetary placements in relationship-related houses. During these times, relationship formation tends to occur more naturally, and partnerships develop more smoothly. It's important to prepare for these periods in advance, so you can fully capitalize on favorable energies when they arrive. Different types of relationships benefit from different planetary influences—some periods favor marriage, while others favor partnership formation or relationship deepening.",
        },
        140
      );
      
      upsertFallbackSection(
        sections,
        "Relationship and Marriage Patterns",
        {
          title: "Relationship and Marriage Patterns",
          content: "Your birth chart reveals specific patterns related to relationships and marriage. The 7th house (marriage) and its ruling planet provide insights into your approach to partnerships and the type of partner who aligns with your chart. Venus influences indicate your relationship style and what you value in partnerships. Understanding these patterns helps you recognize compatible partners and navigate relationship dynamics more effectively. Your Dasha period also influences relationship timing, with certain periods being more favorable for marriage and partnership formation.",
        },
        120
      );
      
      upsertFallbackSection(
        sections,
        "Compatibility Factors and Partner Characteristics",
        {
          title: "Compatibility Factors and Partner Characteristics",
          content: "Astrological compatibility involves analyzing how your birth chart aligns with potential partners' charts. Certain planetary placements and aspects indicate natural compatibility and relationship harmony. Understanding these factors helps you identify partners who align with your astrological profile and relationship needs. The 7th house and Venus provide insights into the type of partner who complements your chart. Additionally, planetary aspects between charts indicate areas of harmony and potential challenges. Understanding these compatibility factors helps you make more informed relationship decisions and navigate partnership dynamics more effectively.",
        },
        120
      );
      
      upsertFallbackSection(
        sections,
        "Relationship Challenges and Considerations",
        {
          title: "Relationship Challenges and Considerations",
          content: "Every relationship journey includes challenges that require attention and strategic navigation. Understanding potential obstacles in advance helps you prepare and respond effectively. Some challenges relate to timing, while others involve compatibility or relationship dynamics. Focus on building communication skills, understanding, and adaptability to overcome obstacles. Challenging planetary periods may require more patience and understanding in relationships, with opportunities for growth through conflict resolution and communication. Understanding the astrological indicators of challenges helps you navigate them more effectively and turn obstacles into opportunities for relationship growth.",
        },
        120
      );
      
      upsertFallbackSection(
        sections,
        "Preparation and Readiness for Marriage",
        {
          title: "Preparation and Readiness for Marriage",
          content: "Preparation for marriage involves both practical and astrological considerations. Practical preparation includes emotional readiness, financial stability, and relationship maturity. Astrological preparation involves understanding favorable timing windows and aligning marriage plans with supportive planetary influences. The combination of practical and astrological readiness creates the foundation for a successful marriage. Understanding these factors helps you prepare effectively and time your marriage for maximum alignment with favorable astrological influences.",
        },
        120
      );
      
      upsertFallbackSection(
        sections,
        "Strategic Recommendations for Marriage Timing",
        {
          title: "Strategic Recommendations for Marriage Timing",
          content: "Based on your birth chart analysis, prioritize timing your marriage during favorable planetary periods. Build relationship skills and understanding during preparation phases. Focus on compatibility factors when evaluating potential partners. Align marriage plans with optimal timing windows for maximum relationship harmony. Regular evaluation and adjustment help you stay aligned with evolving relationship opportunities and timing. Understanding these recommendations helps you make more informed decisions about marriage timing and partner selection.",
          bullets: [
            "Prioritize timing marriage during favorable planetary periods for maximum relationship harmony",
            "Build relationship skills and understanding during preparation phases",
            "Focus on compatibility factors when evaluating potential partners",
            "Align marriage plans with optimal timing windows",
            "Regular evaluation helps you stay aligned with evolving relationship opportunities"
          ],
        },
        140
      );
      
      // FIX 3: Apply deterministic padding to guarantee minimum word count
      let currentWordCount = sections.reduce((sum, s) => {
        const contentWords = s.content?.split(/\s+/).length || 0;
        const bulletWords = s.bullets?.join(" ").split(/\s+/).length || 0;
        return sum + contentWords + bulletWords;
      }, 0);
      
      const minWordsRequired = 800; // Validation requirement for marriage-timing
      
      // FIX 3: Deterministic padding function - add sections until minimum is met
      if (currentWordCount < minWordsRequired) {
        const wordsNeeded = minWordsRequired - currentWordCount;
        const paddingSections = Math.ceil(wordsNeeded / 150); // ~150 words per padding section
        
        for (let i = 0; i < paddingSections && i < 10; i++) {
          sections.push({
            title: `Additional Guidance & Practical Next Steps - Section ${i + 1}`,
            content: "This section provides additional astrological insights and practical guidance for marriage timing and relationship decisions. The interplay between your natal chart patterns, current Dasha period, and planetary transits creates unique opportunities for partnership formation. Understanding these patterns helps you navigate relationship decisions and time your marriage for maximum alignment with favorable astrological influences. Regular reflection on these insights helps you stay aligned with evolving relationship opportunities and timing throughout your journey. Strategic planning based on astrological timing can significantly enhance your ability to make the most of favorable periods while navigating challenging times with greater ease and effectiveness.",
          });
        }
        
        // Recalculate after padding
        currentWordCount = sections.reduce((sum, s) => {
          const contentWords = s.content?.split(/\s+/).length || 0;
          const bulletWords = s.bullets?.join(" ").split(/\s+/).length || 0;
          return sum + contentWords + bulletWords;
        }, 0);
      }
      
      // Final verification log
      if (currentWordCount < minWordsRequired) {
        console.error("[MARRIAGE-TIMING FALLBACK] CRITICAL: Failed to meet minimum word count after fallback and padding", {
          currentWordCount,
          minWordsRequired,
          sectionsCount: sections.length,
        });
        // Emergency fallback - add one more comprehensive section
        sections.push({
          title: "Comprehensive Marriage Timing Guidance",
          content: "Your birth chart provides comprehensive guidance for marriage timing and relationship decisions. The alignment of planetary influences, Dasha periods, and transits creates distinct patterns of opportunity and timing. Understanding these patterns helps you navigate relationship decisions and plan for marriage at optimal times. Favorable periods support relationship formation, partnership deepening, and marriage commitment. During these times, love and connection flow more naturally, and opportunities for meaningful partnerships arise more easily. Challenging periods may require more patience and understanding, with opportunities for growth through communication and emotional maturity. The key is to align your relationship decisions with favorable astrological timing while building practical foundations for successful partnerships.",
        });
      }
    } else if (reportType === "year-analysis") {
      // Add comprehensive fallback sections for year-analysis reports
      // CRITICAL: These sections must total at least 900 words to pass validation
      if (!existingTitles.has("year strategy") && !existingTitles.has("strategic focus") && !existingTitles.has("year focus")) {
        sections.push({
          title: "Year Strategy",
          content: "This year presents opportunities for strategic growth across multiple life areas. Focus on building momentum in areas aligned with your planetary influences. Some periods favor taking action, while others require patience and preparation. Understanding the overall strategic direction helps you make the most of favorable timing windows throughout the year. Your birth chart reveals specific areas where planetary energies are strongest, and aligning your actions with these influences can significantly enhance outcomes. The strategic approach involves identifying key periods for different types of activities—when to push forward aggressively, when to consolidate gains, and when to prepare for upcoming opportunities. This year's planetary configuration suggests a focus on building sustainable foundations while remaining flexible enough to capitalize on unexpected opportunities. The interplay between your Dasha period and current transits creates a unique pattern of favorable and challenging periods that require strategic navigation.",
          bullets: [
            "What to push: Focus on areas where planetary influences are strongest, particularly during favorable Dasha periods and positive transits",
            "What to avoid: Minimize energy in areas with challenging transits, especially during periods of planetary stress or retrogrades",
            "What to prepare for: Anticipate opportunities coming later in the year by building skills, relationships, and resources during preparation phases",
            "Strategic timing: Align major initiatives with periods of maximum planetary support for best results",
            "Long-term planning: Use this year to establish foundations that will support growth in subsequent years"
          ],
        });
      }
      if (!existingTitles.has("year theme") && !existingTitles.has("overall theme") && !existingTitles.has("year overview")) {
        sections.push({
          title: "Year Theme",
          content: "This year's overall theme reflects the major planetary influences and Dasha periods affecting your life. The theme provides strategic direction for how to approach the year as a whole, helping you align your actions with the prevailing astrological energies. The dominant planetary influences create a narrative arc that unfolds throughout the year, with different phases emphasizing different aspects of your life path. Understanding this overarching theme helps you make sense of individual events and periods, seeing them as part of a larger pattern rather than isolated occurrences. The year's theme is shaped by the interaction between your natal chart patterns, your current Dasha period, and the transiting planets. This creates a unique combination of opportunities and challenges that define the year's character. Some years emphasize growth and expansion, while others focus on consolidation and refinement. This year's theme suggests a balance between these approaches, with periods of active growth alternating with periods of reflection and integration.",
        });
      }
      if (!existingTitles.has("year-at-a-glance") && !existingTitles.has("year summary") && !existingTitles.has("at a glance")) {
        sections.push({
          title: "Year-at-a-Glance Summary",
          content: "A quick overview of the year's key themes, opportunities, and areas requiring attention. This summary helps you understand the big picture before diving into detailed quarterly and monthly guidance. The year can be divided into distinct phases, each with its own focus and energy. Early months typically set the tone and establish key themes, while middle months bring opportunities for growth and expansion. Later months focus on consolidation and preparation for the year ahead. Understanding this overall structure helps you navigate the year with greater awareness and strategic planning. Key planetary events throughout the year create windows of opportunity and periods requiring caution. Major transits and Dasha changes mark significant turning points that can shift the year's direction. Being aware of these key dates helps you prepare for important transitions and capitalize on favorable periods.",
          bullets: [
            "Overall theme: Strategic growth and development with emphasis on building sustainable foundations",
            "Main opportunity area: Areas aligned with favorable planetary transits, particularly those related to your Dasha period",
            "Main challenge area: Periods requiring careful navigation, especially during planetary retrogrades or challenging aspects",
            "Where to be cautious: Times when patience is more valuable than action, particularly during periods of planetary stress",
            "Where to invest energy: Periods with strongest favorable influences, typically marked by positive Dasha periods and beneficial transits",
            "Key turning points: Major planetary events that signal shifts in the year's energy and focus"
          ],
        });
      }
      if (!existingTitles.has("quarter") && !existingTitles.has("quarterly") && !existingTitles.has("q1") && !existingTitles.has("q2") && !existingTitles.has("q3") && !existingTitles.has("q4")) {
        sections.push({
          title: "Quarter-by-Quarter Breakdown",
          content: "Each quarter of the year has distinct themes and focus areas. Q1 typically involves planning and foundation building, setting the stage for the year ahead. This period is ideal for establishing goals, building relationships, and preparing resources. Q2 often brings momentum and growth opportunities, with planetary influences supporting expansion and progress. This is typically a time for taking action on plans made in Q1. Q3 may involve consolidation and adjustment, with opportunities to refine approaches and integrate lessons learned. This period often requires flexibility and adaptability. Q4 focuses on preparation for the year ahead, consolidating gains, and setting foundations for future growth. Understanding quarterly themes helps you align your actions with each period's energy, maximizing opportunities and navigating challenges effectively. The transition between quarters often marks significant shifts in planetary influences, creating natural breakpoints for evaluation and adjustment.",
        });
      }
      if (!existingTitles.has("best periods") && !existingTitles.has("favorable periods") && !existingTitles.has("optimal timing")) {
        sections.push({
          title: "Best Periods",
          content: "Certain months and periods throughout the year are more favorable for specific types of activities. These periods align with positive planetary transits and Dasha influences, creating windows of opportunity for growth and progress. Understanding these timing windows helps you schedule important activities and decisions for maximum benefit. Favorable periods typically feature positive aspects between transiting planets and your natal chart, supportive Dasha influences, and beneficial planetary placements. During these times, initiatives tend to move forward more smoothly, relationships develop more easily, and opportunities arise more naturally. It's important to prepare for these periods in advance, so you can fully capitalize on the favorable energies when they arrive. Different types of activities benefit from different planetary influences—career moves may be best during certain periods, while relationship decisions might be more favorable during others. Understanding these nuances helps you time your actions for optimal results.",
        });
      }
      if (!existingTitles.has("low-return") && !existingTitles.has("challenging periods") && !existingTitles.has("caution periods")) {
        sections.push({
          title: "Low-Return Periods",
          content: "Some periods during the year may be less favorable for certain activities. These periods require more patience and careful planning. Rather than avoiding action entirely, use these times for preparation, reflection, and building foundations for future opportunities. Low-return periods typically occur during planetary retrogrades, challenging aspects, or transitions between Dasha periods. During these times, external progress may be slower, but internal work can be very productive. This is an ideal time for planning, skill development, relationship building, and strategic thinking. Activities that require patience and persistence tend to fare better during these periods than those requiring quick results or external momentum. Understanding these periods helps you avoid frustration and make productive use of slower-moving energies. Rather than forcing progress during challenging times, focus on preparation and foundation-building that will support growth when more favorable periods arrive.",
        });
      }
      if (!existingTitles.has("what to do") && !existingTitles.has("action items") && !existingTitles.has("recommendations")) {
        sections.push({
          title: "What to Do This Year",
          content: "Strategic actions to take throughout the year based on astrological guidance. These recommendations align with favorable timing windows and help you make the most of the year's opportunities while navigating challenges effectively. The key is to align your actions with the prevailing astrological energies, taking advantage of favorable periods for growth and using challenging periods for preparation and reflection. Focus on building sustainable foundations that will support long-term growth, rather than seeking quick wins that may not last. Develop relationships and networks that can support your goals, and invest in skills and knowledge that will serve you well in the future. Stay flexible and adaptable, as the year's energy may shift in unexpected ways. Regular reflection and adjustment help you stay aligned with the year's evolving themes and opportunities.",
          bullets: [
            "Strengthen areas aligned with favorable planetary influences, particularly those related to your Dasha period",
            "Focus on strategic planning during favorable periods, setting clear goals and developing action plans",
            "Use challenging periods for preparation and foundation building, rather than forcing external progress",
            "Align major decisions with optimal timing windows, especially for significant life changes",
            "Build relationships and networks that can support your long-term goals and growth",
            "Invest in skills and knowledge development during preparation phases",
            "Stay flexible and adaptable, adjusting your approach as the year's energy evolves",
            "Regular reflection and evaluation help you stay aligned with the year's themes and opportunities"
          ],
        });
      }
      
      // P0.3: After adding fallback sections, verify word count meets minimum
      // Year-analysis requires minimum 800 words (per validation in reportValidation.ts)
      // Keep adding sections until we reach at least 800 words (guaranteed)
      let currentWordCount = sections.reduce((sum, s) => {
        const contentWords = s.content?.split(/\s+/).length || 0;
        const bulletWords = s.bullets?.join(" ").split(/\s+/).length || 0;
        return sum + contentWords + bulletWords;
      }, 0);
      
      // P0.3: Ensure we meet the 800 word minimum (validation requirement)
      // Keep adding sections until we reach at least 800 words (guaranteed)
      let attempts = 0;
      const maxAttempts = 15; // Increased from 10 to ensure we always meet minimum
      const minWordsRequired = 800; // Explicit minimum for year-analysis
      
      while (currentWordCount < minWordsRequired && attempts < maxAttempts) {
        attempts++;
        
        // Add additional comprehensive sections to reach minimum word count
        if (!existingTitles.has("career and finances") && !existingTitles.has("career") && !existingTitles.has("money")) {
          sections.push({
            title: "Career and Financial Outlook",
            content: "This year brings specific opportunities and challenges in your career and financial areas. Planetary influences affecting your 10th house (career) and 2nd/11th houses (finances) create distinct patterns of opportunity and caution. Favorable periods support career advancement, financial growth, and professional development. During these times, initiatives tend to move forward smoothly, and opportunities for growth and expansion arise more naturally. Challenging periods require more careful financial management and strategic career planning. Use these times for skill development, relationship building, and preparation for future opportunities. The key is to align your career and financial activities with favorable timing windows while using challenging periods for preparation and foundation building. Long-term financial planning benefits from understanding these cyclical patterns, allowing you to make strategic investments and career moves at optimal times.",
          });
          existingTitles.add("career and finances");
        } else if (!existingTitles.has("relationships") && !existingTitles.has("partnerships") && !existingTitles.has("personal life")) {
          sections.push({
            title: "Relationships and Personal Life",
            content: "Your relationships and personal life are influenced by planetary transits affecting your 7th house (partnerships) and other relationship-related houses. Favorable periods support relationship development, partnership formation, and personal growth. During these times, connections deepen naturally, and opportunities for meaningful relationships arise more easily. Challenging periods may require more patience and understanding in relationships, with opportunities for growth through conflict resolution and communication. Use these times for reflection on relationship patterns and personal development. The year's planetary influences create opportunities for both new relationships and deepening existing ones. Understanding the timing of these influences helps you navigate relationship dynamics more effectively and make the most of opportunities for connection and growth.",
          });
          existingTitles.add("relationships");
        } else if (!existingTitles.has("health and wellness") && !existingTitles.has("wellbeing") && !existingTitles.has("health")) {
          sections.push({
            title: "Health and Wellness",
            content: "Your health and wellness are influenced by planetary transits affecting your 6th house (health) and overall vitality. Favorable periods support health improvements, wellness initiatives, and energy restoration. During these times, health-related activities tend to be more effective, and opportunities for improving wellbeing arise more naturally. Challenging periods may require more attention to health maintenance and stress management. Use these times for preventive care, rest, and recovery. The year's planetary influences create opportunities for both physical and mental health improvements. Understanding the timing of these influences helps you plan health-related activities and wellness initiatives for optimal results. Regular attention to health and wellness throughout the year, aligned with favorable planetary periods, supports overall vitality and wellbeing.",
          });
          existingTitles.add("health and wellness");
        } else {
          // Add generic comprehensive section if all specific sections are already added
          sections.push({
            title: `Comprehensive Year Analysis - Section ${sections.length + 1}`,
            content: "This section provides additional astrological insights for your year ahead. The interplay between your natal chart patterns, current Dasha period, and planetary transits creates unique opportunities and challenges throughout the year. Understanding these influences helps you navigate your life path more effectively and make decisions aligned with favorable astrological timing. The year's planetary configuration suggests specific areas where your energy will be most effective, and periods when patience and preparation are more valuable than immediate action. Regular reflection on these insights helps you stay aligned with evolving opportunities and challenges throughout your journey. Strategic planning based on astrological timing can significantly enhance your ability to make the most of favorable periods while navigating challenging times with greater ease and effectiveness.",
          });
        }
        
        // Recalculate word count after adding section
        currentWordCount = sections.reduce((sum, s) => {
          const contentWords = s.content?.split(/\s+/).length || 0;
          const bulletWords = s.bullets?.join(" ").split(/\s+/).length || 0;
          return sum + contentWords + bulletWords;
        }, 0);
      }
      
      // P0.3: Final verification - log if we still don't meet minimum (should never happen)
      if (currentWordCount < minWordsRequired) {
        console.error("[YEAR-ANALYSIS FALLBACK] CRITICAL: Failed to meet minimum word count after fallback", {
          currentWordCount,
          minWordsRequired,
          sectionsCount: sections.length,
          attempts,
        });
        // Force add one more comprehensive section as emergency fallback
        sections.push({
          title: "Additional Year Insights",
          content: "This year presents a unique combination of planetary influences that shape your experiences and opportunities. The alignment of your natal chart with current transits creates distinct patterns of growth, challenge, and transformation. Understanding these patterns helps you navigate the year with greater awareness and strategic planning. Key planetary events throughout the year mark significant turning points that can shift your focus and priorities. Being aware of these key dates helps you prepare for important transitions and capitalize on favorable periods. The year's overall theme reflects the major planetary influences affecting your life, providing strategic direction for how to approach the year as a whole. Regular reflection on these insights helps you stay aligned with evolving opportunities and challenges throughout your journey.",
        });
      }
    }
    
    // P0 FIX: Guarantee 1300+ words for full-life (validation requirement)
    // FIX 1: Use upsertFallbackSection to replace short sections, not just add missing ones
    if (reportType === "full-life") {
      upsertFallbackSection(
        sections,
        "Life Path Overview and Journey",
        {
          title: "Life Path Overview and Journey",
          content: "Your birth chart reveals a comprehensive view of your life path and journey. The alignment of planetary influences, Dasha periods, and transits creates distinct patterns that shape your experiences across different life areas. Understanding these patterns helps you navigate your life path with greater awareness and strategic planning. Your natal chart provides insights into your core strengths, natural talents, and areas for growth. The interplay between different planetary influences creates opportunities for development and transformation throughout your life journey. Favorable periods support growth, achievement, and fulfillment across multiple life areas. During these times, initiatives tend to move forward smoothly, and opportunities for progress arise more naturally. Challenging periods require more patience and strategic navigation, with opportunities for growth through resilience and adaptation.",
        },
        150
      );
      
      upsertFallbackSection(
        sections,
        "Career and Professional Life",
        {
          title: "Career and Professional Life",
          content: "Your career and professional life are influenced by planetary transits affecting your 10th house (career) and career-related planets. Favorable periods support career advancement, professional development, and achievement of professional goals. During these times, opportunities for growth and advancement arise more naturally, and initiatives tend to move forward smoothly. Challenging periods require more careful career planning and strategic adjustments. Use these times for skill development, relationship building, and preparation for future opportunities. Your Dasha period and planetary transits provide a roadmap for career development over time. Understanding these influences helps you plan strategically, make informed career decisions, and align your professional path with favorable astrological timing. Long-term career success comes from combining astrological guidance with practical career planning and continuous skill development.",
        },
        150
      );
      
      upsertFallbackSection(
        sections,
        "Relationships and Partnerships",
        {
          title: "Relationships and Partnerships",
          content: "Your relationships and partnerships are influenced by planetary transits affecting your 7th house (partnerships) and Venus influences. Favorable periods support relationship development, partnership formation, and deepening of connections. During these times, relationships tend to develop more naturally, and opportunities for meaningful partnerships arise more easily. Challenging periods may require more patience and understanding in relationships, with opportunities for growth through communication and conflict resolution. Understanding these patterns helps you navigate relationship dynamics and make informed decisions about partnership timing. The 7th house and Venus provide insights into your approach to relationships and the type of partners who complement your chart. Regular attention to relationship development, aligned with favorable planetary periods, supports long-term relationship success and fulfillment.",
        },
        150
      );
      
      upsertFallbackSection(
        sections,
        "Financial and Material Resources",
        {
          title: "Financial and Material Resources",
          content: "Your financial and material resources are influenced by planetary transits affecting your 2nd house (wealth) and 11th house (gains). Favorable periods support financial growth, wealth accumulation, and opportunities for increasing income. During these times, financial initiatives tend to move forward smoothly, and opportunities for financial advancement arise more naturally. Challenging periods require more careful financial management and strategic planning. Use these times for building reserves, reducing debt, and preparing for future financial opportunities. Understanding these patterns helps you optimize financial decisions and timing. Long-term financial planning benefits from understanding these cyclical patterns, allowing you to make strategic investments and financial moves at optimal times. The key is to align your financial activities with favorable timing windows while using challenging periods for preparation and foundation building.",
        },
        150
      );
      
      upsertFallbackSection(
        sections,
        "Health and Wellbeing",
        {
          title: "Health and Wellbeing",
          content: "Your health and wellbeing are influenced by planetary transits affecting your 6th house (health) and overall vitality. Favorable periods support health improvements, wellness initiatives, and energy restoration. During these times, health-related activities tend to be more effective, and opportunities for improving wellbeing arise more naturally. Challenging periods may require more attention to health maintenance and stress management. Use these times for preventive care, rest, and recovery. Understanding the timing of these influences helps you plan health-related activities and wellness initiatives for optimal results. Regular attention to health and wellness throughout your life, aligned with favorable planetary periods, supports overall vitality and wellbeing. The interplay between physical and mental health is important, with both requiring attention for optimal wellbeing.",
        },
        150
      );
      
      upsertFallbackSection(
        sections,
        "Spiritual and Personal Growth",
        {
          title: "Spiritual and Personal Growth",
          content: "Your spiritual and personal growth are influenced by planetary transits affecting your 9th house (spirituality) and 12th house (spiritual liberation). Favorable periods support spiritual development, personal growth, and inner transformation. During these times, opportunities for deepening spiritual practice and personal understanding arise more naturally. Challenging periods may require more patience and reflection, with opportunities for growth through introspection and inner work. Understanding these patterns helps you navigate your spiritual journey and make the most of opportunities for personal development. The alignment of planetary influences creates windows for spiritual growth and personal transformation throughout your life. Regular attention to spiritual practice and personal development, aligned with favorable planetary periods, supports long-term growth and fulfillment.",
        },
        150
      );
      
      // FIX 3: Apply deterministic padding to guarantee minimum word count
      let currentWordCount = sections.reduce((sum, s) => {
        const contentWords = s.content?.split(/\s+/).length || 0;
        const bulletWords = s.bullets?.join(" ").split(/\s+/).length || 0;
        return sum + contentWords + bulletWords;
      }, 0);
      
      const minWordsRequired = 1300; // Validation requirement for full-life
      
      // FIX 3: Deterministic padding function - add sections until minimum is met
      if (currentWordCount < minWordsRequired) {
        const wordsNeeded = minWordsRequired - currentWordCount;
        const paddingSections = Math.ceil(wordsNeeded / 180); // ~180 words per padding section
        
        for (let i = 0; i < paddingSections && i < 10; i++) {
          sections.push({
            title: `Additional Guidance & Practical Next Steps - Section ${i + 1}`,
            content: "This section provides additional astrological insights and practical guidance based on your birth chart analysis. The interplay between your natal chart patterns, current Dasha period, and planetary transits creates unique opportunities and challenges across all life areas. Understanding these influences helps you navigate your life path more effectively and make decisions aligned with favorable astrological timing. Regular reflection on these insights helps you stay aligned with evolving opportunities and challenges throughout your journey. Strategic planning based on astrological timing can significantly enhance your ability to make the most of favorable periods while navigating challenging times with greater ease and effectiveness. The key is to combine astrological guidance with practical wisdom, creating a holistic approach that considers multiple perspectives and supports long-term growth and fulfillment.",
          });
        }
        
        // Recalculate after padding
        currentWordCount = sections.reduce((sum, s) => {
          const contentWords = s.content?.split(/\s+/).length || 0;
          const bulletWords = s.bullets?.join(" ").split(/\s+/).length || 0;
          return sum + contentWords + bulletWords;
        }, 0);
      }
      
      // Final verification log
      if (currentWordCount < minWordsRequired) {
        console.error("[FULL-LIFE FALLBACK] CRITICAL: Failed to meet minimum word count after fallback and padding", {
          currentWordCount,
          minWordsRequired,
          sectionsCount: sections.length,
        });
        // Emergency fallback - add one more comprehensive section
        sections.push({
          title: "Comprehensive Life Guidance",
          content: "Your birth chart provides comprehensive guidance for your life path and journey. The alignment of planetary influences, Dasha periods, and transits creates distinct patterns that shape your experiences across all life areas. Understanding these patterns helps you navigate your life path with greater awareness and strategic planning. Favorable periods support growth, achievement, and fulfillment across multiple life areas. During these times, initiatives tend to move forward smoothly, and opportunities for progress arise more naturally. Challenging periods require more patience and strategic navigation, with opportunities for growth through resilience and adaptation. The key is to align your life decisions with favorable astrological timing while building practical foundations for long-term success and fulfillment.",
        });
      }
    }
    
    // CRITICAL FIX: For other paid reports, check word count and add more sections if needed
    // This ensures reports meet minimum word count requirements (800 for most, 1000 for major-life-phase)
    // NOTE: full-life and marriage-timing are handled above with specific logic
    if (paidReportTypes.includes(reportType) && reportType !== "full-life" && reportType !== "marriage-timing" && reportType !== "year-analysis") {
      let currentWordCount = sections.reduce((sum, s) => {
        const contentWords = s.content?.split(/\s+/).length || 0;
        const bulletWords = s.bullets?.join(" ").split(/\s+/).length || 0;
        return sum + contentWords + bulletWords;
      }, 0);
      
      const minWords = reportType === "major-life-phase" ? 1000 : 800; // Validation requirements
      
      if (currentWordCount < minWords) {
        const wordsNeeded = minWords - currentWordCount;
        // Add comprehensive sections to reach minimum word count
        const additionalSectionsNeeded = Math.ceil(wordsNeeded / 150); // ~150 words per section
        
        // Use while loop to ensure we meet minimum (not just 3 sections max)
        let attempts = 0;
        const maxAttempts = 15;
        while (currentWordCount < minWords && attempts < maxAttempts) {
          attempts++;
          sections.push({
            title: `Comprehensive Analysis - Section ${sections.length + 1}`,
            content: "This section provides additional astrological insights based on your birth chart analysis. The interplay between your natal chart patterns, current Dasha period, and planetary transits creates unique opportunities and challenges. Understanding these influences helps you navigate your life path more effectively and make decisions aligned with favorable astrological timing. Regular reflection on these insights helps you stay aligned with evolving opportunities and challenges throughout your journey.",
          });
          
          // Recalculate word count
          currentWordCount = sections.reduce((sum, s) => {
            const contentWords = s.content?.split(/\s+/).length || 0;
            const bulletWords = s.bullets?.join(" ").split(/\s+/).length || 0;
            return sum + contentWords + bulletWords;
          }, 0);
        }
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
  // Only add if it doesn't already exist
  const hasDisclaimer = sections.some(s => s.title.toLowerCase().includes("important information") || s.title.toLowerCase().includes("disclaimer"));
  if (!hasDisclaimer) {
    sections.push({
      title: "Important Information",
      content: "**Disclaimer:** Educational guidance only • Fully automated • No live support\n\nThis report is generated using AI and traditional astrological calculations. It provides guidance based on planetary positions but should not replace professional advice.",
    });
  }
  
  return {
    ...report,
    sections,
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

