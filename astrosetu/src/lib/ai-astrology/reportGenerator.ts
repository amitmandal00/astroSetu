/**
 * AI Report Generator
 * Generates astrology reports using AI prompts and Prokerala data
 */

import type { AIAstrologyInput, ReportType, ReportContent } from "./types";
import { generateLifeSummaryPrompt, generateMarriageTimingPrompt, generateCareerMoneyPrompt, generateFullLifePrompt, generateYearAnalysisPrompt, generateMajorLifePhasePrompt, generateDecisionSupportPrompt } from "./prompts";
import { getKundli } from "../astrologyAPI";
import type { KundliResult, DoshaAnalysis } from "@/types/astrology";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "";

// Check if AI is configured
export function isAIConfigured(): boolean {
  return !!(OPENAI_API_KEY || ANTHROPIC_API_KEY);
}

/**
 * Generate AI report using OpenAI or Anthropic
 */
async function generateAIContent(prompt: string, reportType?: string): Promise<string> {
  if (OPENAI_API_KEY) {
    // Increase max retries to 5 for better resilience against rate limits
    return generateWithOpenAI(prompt, 0, 5, reportType);
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
async function generateWithOpenAI(prompt: string, retryCount: number = 0, maxRetries: number = 5, reportType?: string): Promise<string> {
  // Optimize token counts for faster generation while maintaining quality
  // Free reports: 1500 tokens (faster, still comprehensive)
  // Regular paid reports: 2000 tokens (good balance)
  // Complex reports: 4000 tokens (comprehensive analysis)
  const isComplexReport = reportType === "full-life" || reportType === "major-life-phase";
  const isFreeReport = reportType === "life-summary";
  const maxTokens = isComplexReport ? 4000 : (isFreeReport ? 1500 : 2000); // Optimized: 1500 for free, 2000 for paid, 4000 for complex
  
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
  });

  if (!response.ok) {
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
        // Extract retry-after from error message or header
        let waitTime = 5000; // Increased default wait: 5 seconds (more conservative for rate limits)
        
        // Try to parse retry-after from error message
        const errorMessage = errorData?.error?.message || "";
        const retryAfterMatch = errorMessage.match(/try again in (\d+)ms/i) || errorMessage.match(/retry after (\d+) seconds/i);
        if (retryAfterMatch) {
          const retryValue = parseInt(retryAfterMatch[1]);
          if (retryValue < 60000) {
            waitTime = retryValue; // Use milliseconds
          } else {
            waitTime = retryValue * 1000; // Convert seconds to milliseconds
          }
        } else {
          // Check Retry-After header
          const retryAfterHeader = response.headers.get("retry-after");
          if (retryAfterHeader) {
            const retryAfterSeconds = parseInt(retryAfterHeader);
            waitTime = retryAfterSeconds * 1000; // Convert seconds to milliseconds
            // Add small buffer to retry-after header value (10% extra)
            waitTime = Math.round(waitTime * 1.1);
          } else {
            // Enhanced exponential backoff: 5s, 10s, 20s, 40s, 60s (with cap at 60s)
            waitTime = Math.min(5000 * Math.pow(2, retryCount), 60000); // Cap at 60 seconds
          }
        }

        // Add jitter (random 0-1000ms) to avoid thundering herd
        const jitter = Math.random() * 1000;
        const totalWait = Math.min(waitTime + jitter, 90000); // Cap at 90 seconds total for very aggressive rate limits

        console.log(`[OpenAI] Rate limit hit for reportType=${reportType || "unknown"}, retrying after ${Math.round(totalWait)}ms (attempt ${retryCount + 1}/${maxRetries})`);
        
        await new Promise(resolve => setTimeout(resolve, totalWait));
        return generateWithOpenAI(prompt, retryCount + 1, maxRetries, reportType);
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

  const data = await response.json();
  return data.choices[0]?.message?.content || "";
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
function parseAIResponse(response: string, reportType: ReportType): ReportContent {
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
      reportId: generateReportId(),
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
  
  for (const line of lines) {
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
  
  // If no sections were parsed, create a simple content structure
  if (sections.length === 0) {
    sections.push({
      title: "Report",
      content: response,
    });
  }
  
  return {
    title: getReportTitle(reportType),
    sections,
    summary: extractSummary(response),
    executiveSummary: executiveSummary || (reportType === "full-life" ? extractSummary(response) : undefined),
    reportId: generateReportId(),
    generatedAt: new Date().toISOString(),
  };
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
export async function generateLifeSummaryReport(input: AIAstrologyInput): Promise<ReportContent> {
  try {
    // Get astrology data from Prokerala API
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

    // Extract planetary data (handle missing planets array)
    const planets = (kundliResult.planets || []).map(p => ({
      name: p.name,
      sign: p.sign,
      house: p.house || 0,
      degrees: p.degree || 0,
    }));

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
    const aiResponse = await generateAIContent(prompt, "life-summary");
  
    // Parse and return
    return parseAIResponse(aiResponse, "life-summary");
  } catch (error: any) {
    console.error("[generateLifeSummaryReport] Error:", error);
    throw error; // Re-throw to be handled by API route
  }
}

/**
 * Generate Marriage Timing Report (Paid)
 */
export async function generateMarriageTimingReport(input: AIAstrologyInput): Promise<ReportContent> {
  try {
    // Get astrology data
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

    // Get dosha analysis
    let doshaAnalysis: DoshaAnalysis | null = null;
    try {
      const { getDoshaAnalysis } = await import("../astrologyAPI");
      doshaAnalysis = await getDoshaAnalysis({
        name: input.name,
        dob: input.dob,
        tob: input.tob,
        place: input.place,
        latitude: input.latitude,
        longitude: input.longitude,
        timezone: input.timezone || "Asia/Kolkata",
        ayanamsa: 1,
      });
    } catch (e) {
      console.log("Could not fetch dosha analysis:", e);
    }

    // Extract relevant planetary data (handle missing planets array)
    const planets = kundliResult.planets || [];
    const venus = planets.find(p => p.name === "Venus");
    const jupiter = planets.find(p => p.name === "Jupiter");
    const mars = planets.find(p => p.name === "Mars");
    
    // Get 7th house (marriage house) - simplified, would need chart data
    const seventhHousePlanets = planets.filter(p => p.house === 7).map(p => p.name);

    // Get intelligent date windows for marriage timing (relative to current date)
    const { getMarriageTimingWindows, getDateContext } = await import("./dateHelpers");
    const dateContext = getDateContext();
    const timingWindows = getMarriageTimingWindows();
    
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
    const aiResponse = await generateAIContent(prompt, "marriage-timing");
    
    // Parse and return
    return parseAIResponse(aiResponse, "marriage-timing");
  } catch (error: any) {
    console.error("[generateMarriageTimingReport] Error:", error);
    throw error; // Re-throw to be handled by API route
  }
}

/**
 * Generate Career & Money Report (Paid)
 */
export async function generateCareerMoneyReport(input: AIAstrologyInput): Promise<ReportContent> {
  try {
    // Get astrology data
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
    const aiResponse = await generateAIContent(prompt, "career-money");
    
    // Parse and return
    return parseAIResponse(aiResponse, "career-money");
  } catch (error: any) {
    console.error("[generateCareerMoneyReport] Error:", error);
    throw error; // Re-throw to be handled by API route
  }
}

/**
 * Generate Full Life Report (Paid - comprehensive report)
 */
export async function generateFullLifeReport(input: AIAstrologyInput): Promise<ReportContent> {
  try {
    // Get astrology data from Prokerala API
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

    // Get dosha analysis for comprehensive report
    let doshaAnalysis: DoshaAnalysis | null = null;
    try {
      const { getDoshaAnalysis } = await import("../astrologyAPI");
      doshaAnalysis = await getDoshaAnalysis({
        name: input.name,
        dob: input.dob,
        tob: input.tob,
        place: input.place,
        latitude: input.latitude,
        longitude: input.longitude,
        timezone: input.timezone || "Asia/Kolkata",
        ayanamsa: 1,
      });
    } catch (e) {
      console.log("Could not fetch dosha analysis:", e);
    }

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
    const aiResponse = await generateAIContent(prompt, "full-life");
    
    // Parse and return
    return parseAIResponse(aiResponse, "full-life");
  } catch (error: any) {
    console.error("[generateFullLifeReport] Error:", error);
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
  dateRange?: { startYear: number; startMonth: number; endYear: number; endMonth: number }
): Promise<ReportContent> {
  try {
    // Get astrology data from Prokerala API
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
    const aiResponse = await generateAIContent(prompt, "year-analysis");
    
    // Parse and return
    return parseAIResponse(aiResponse, "year-analysis");
  } catch (error: any) {
    console.error("[generateYearAnalysisReport] Error:", error);
    throw error; // Re-throw to be handled by API route
  }
}

/**
 * Generate Major Life Phase Report (Paid - 3-5 year outlook)
 */
export async function generateMajorLifePhaseReport(input: AIAstrologyInput): Promise<ReportContent> {
  try {
    // Get astrology data from Prokerala API
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
    const prompt = generateMajorLifePhasePrompt(
      {
        name: input.name,
        dob: input.dob,
        tob: input.tob,
        place: input.place,
        gender: input.gender,
      },
      planetaryData
    );

    // Generate AI content (pass reportType for complex report handling)
    const aiResponse = await generateAIContent(prompt, "major-life-phase");
    
    // Parse and return
    return parseAIResponse(aiResponse, "major-life-phase");
  } catch (error: any) {
    console.error("[generateMajorLifePhaseReport] Error:", error);
    throw error;
  }
}

/**
 * Generate Decision Support Report (Paid - decision guidance)
 */
export async function generateDecisionSupportReport(
  input: AIAstrologyInput,
  decisionContext?: string
): Promise<ReportContent> {
  try {
    // Get astrology data from Prokerala API
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
    const aiResponse = await generateAIContent(prompt, "decision-support");
    
    // Parse and return
    return parseAIResponse(aiResponse, "decision-support");
  } catch (error: any) {
    console.error("[generateDecisionSupportReport] Error:", error);
    throw error;
  }
}

