/**
 * AI Report Generator
 * Generates astrology reports using AI prompts and Prokerala data
 */

import type { AIAstrologyInput, ReportType, ReportContent } from "./types";
import { generateLifeSummaryPrompt, generateMarriageTimingPrompt, generateCareerMoneyPrompt } from "./prompts";
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
async function generateAIContent(prompt: string): Promise<string> {
  if (OPENAI_API_KEY) {
    return generateWithOpenAI(prompt);
  } else if (ANTHROPIC_API_KEY) {
    return generateWithAnthropic(prompt);
  } else {
    throw new Error("No AI API key configured. Set OPENAI_API_KEY or ANTHROPIC_API_KEY");
  }
}

/**
 * Generate content using OpenAI GPT-4
 */
async function generateWithOpenAI(prompt: string): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4-turbo-preview",
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
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
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
  return data.content[0]?.text || "";
}

/**
 * Parse AI response into structured report content
 */
function parseAIResponse(response: string, reportType: ReportType): ReportContent {
  // For MVP, return simple structured content
  // In production, use more sophisticated parsing (regex, markdown parsing, etc.)
  
  const sections: ReportContent["sections"] = [];
  const lines = response.split("\n").filter(line => line.trim());
  
  let currentSection: { title: string; content: string; bullets?: string[] } | null = null;
  
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
        if (bullet) {
          currentSection.bullets.push(bullet);
        }
      }
    } else if (currentSection && line.trim()) {
      // Regular content
      currentSection.content += (currentSection.content ? " " : "") + line.trim();
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
    default:
      return "Life Summary Report";
  }
}

/**
 * Generate Life Summary Report (Free)
 */
export async function generateLifeSummaryReport(input: AIAstrologyInput): Promise<ReportContent> {
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
  const planets = kundliResult.planets.map(p => ({
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
      moonSign: kundliResult.planets.find(p => p.name === "Moon")?.sign || "Unknown",
      sunSign: kundliResult.planets.find(p => p.name === "Sun")?.sign || "Unknown",
      nakshatra: kundliResult.nakshatra || "Unknown",
      planets,
    }
  );

  // Generate AI content
  const aiResponse = await generateAIContent(prompt);
  
  // Parse and return
  return parseAIResponse(aiResponse, "life-summary");
}

/**
 * Generate Marriage Timing Report (Paid)
 */
export async function generateMarriageTimingReport(input: AIAstrologyInput): Promise<ReportContent> {
  // Get astrology data
  const kundliResult = await getKundliAPI({
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

  // Extract relevant planetary data
  const venus = kundliResult.planets.find(p => p.name === "Venus");
  const jupiter = kundliResult.planets.find(p => p.name === "Jupiter");
  const mars = kundliResult.planets.find(p => p.name === "Mars");
  
  // Get 7th house (marriage house) - simplified, would need chart data
  const seventhHousePlanets = kundliResult.planets.filter(p => p.house === 7).map(p => p.name);

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
      moonSign: kundliResult.planets.find(p => p.name === "Moon")?.sign || "Unknown",
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
    }
  );

  // Generate AI content
  const aiResponse = await generateAIContent(prompt);
  
  // Parse and return
  return parseAIResponse(aiResponse, "marriage-timing");
}

/**
 * Generate Career & Money Report (Paid)
 */
export async function generateCareerMoneyReport(input: AIAstrologyInput): Promise<ReportContent> {
  // Get astrology data
  const kundliResult = await getKundliAPI({
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
  const tenthHousePlanets = kundliResult.planets.filter(p => p.house === 10).map(p => p.name);
  const secondHousePlanets = kundliResult.planets.filter(p => p.house === 2).map(p => p.name);
  
  // Career-related planets (Sun, Jupiter, Saturn, Mercury in 10th or strong)
  const careerPlanets = kundliResult.planets
    .filter(p => ["Sun", "Jupiter", "Saturn", "Mercury"].includes(p.name) || p.house === 10)
    .map(p => ({
      name: p.name,
      sign: p.sign,
      house: p.house || 0,
    }));

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
      sunSign: kundliResult.planets.find(p => p.name === "Sun")?.sign || "Unknown",
      moonSign: kundliResult.planets.find(p => p.name === "Moon")?.sign || "Unknown",
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
    }
  );

  // Generate AI content
  const aiResponse = await generateAIContent(prompt);
  
  // Parse and return
  return parseAIResponse(aiResponse, "career-money");
}

/**
 * Generate Full Life Report (Paid - combines all reports)
 */
export async function generateFullLifeReport(input: AIAstrologyInput): Promise<ReportContent> {
  // Generate all reports and combine
  const [lifeSummary, marriageTiming, careerMoney] = await Promise.all([
    generateLifeSummaryReport(input),
    generateMarriageTimingReport(input),
    generateCareerMoneyReport(input),
  ]);

  // Combine all sections
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
}

