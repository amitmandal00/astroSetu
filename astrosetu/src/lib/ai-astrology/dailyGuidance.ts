/**
 * Daily Guidance Generator
 * Generates personalized daily guidance reports for subscribers
 */

import type { AIAstrologyInput, DailyGuidance } from "./types";
import { generateDailyGuidancePrompt } from "./prompts";
import { getKundli } from "../astrologyAPI";
import type { KundliResult } from "@/types/astrology";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "";

/**
 * Check if AI is configured
 */
function isAIConfigured(): boolean {
  return !!(OPENAI_API_KEY || ANTHROPIC_API_KEY);
}

/**
 * Generate AI content using OpenAI or Anthropic
 */
async function generateAIContent(prompt: string): Promise<string> {
  if (OPENAI_API_KEY) {
    return generateWithOpenAI(prompt);
  } else if (ANTHROPIC_API_KEY) {
    return generateWithAnthropic(prompt);
  } else {
    throw new Error("No AI API key configured");
  }
}

async function generateWithOpenAI(prompt: string): Promise<string> {
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
          content: "You are a helpful assistant that generates daily astrology guidance in a clear, structured format.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "";
}

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
      max_tokens: 1500,
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
 * Parse AI response into structured daily guidance
 */
function parseDailyGuidance(response: string, date: string): DailyGuidance {
  // Extract "Today is good for..." items
  const goodForMatch = response.match(/(?:Today is good for|Good for today|Favorable activities):\s*(.*?)(?:\n\n|\n[^•\n]|$)/is);
  const goodForItems = goodForMatch
    ? goodForMatch[1]
        .split(/\n|•|-/)
        .map((item) => item.trim())
        .filter((item) => item.length > 0 && !item.match(/^(Today|Good|Favorable)/i))
        .slice(0, 10)
    : [];

  // Extract "Avoid today..." items
  const avoidMatch = response.match(/(?:Avoid today|Avoid|Not recommended):\s*(.*?)(?:\n\n|\n[^•\n]|$)/is);
  const avoidItems = avoidMatch
    ? avoidMatch[1]
        .split(/\n|•|-/)
        .map((item) => item.trim())
        .filter((item) => item.length > 0 && !item.match(/^(Avoid|Not)/i))
        .slice(0, 10)
    : [];

  // Extract actions
  const actionsMatch = response.match(/(?:Actions|Recommended actions|What to do):\s*(.*?)(?:\n\n|\n[^•\n]|$)/is);
  const actions = actionsMatch
    ? actionsMatch[1]
        .split(/\n|•|-/)
        .map((item) => item.trim())
        .filter((item) => item.length > 0 && !item.match(/^(Actions|Recommended|What)/i))
        .slice(0, 10)
    : [];

  // Extract planetary influence
  const planetaryMatch = response.match(/(?:Planetary influence|Planets|Astrological influence):\s*(.*?)(?:\n\n|$)/is);
  const planetaryInfluence = planetaryMatch
    ? planetaryMatch[1].trim().substring(0, 300)
    : "Current planetary positions suggest a balanced day ahead.";

  // Extract general guidance
  const guidanceMatch = response.match(/(?:Guidance|Advice|Summary):\s*(.*?)(?:\n\n|$)/is);
  const guidance = guidanceMatch
    ? guidanceMatch[1].trim().substring(0, 500)
    : response.substring(0, 500);

  return {
    date,
    input: {} as AIAstrologyInput, // Will be filled by caller
    todayGoodFor: goodForItems.length > 0 ? goodForItems : ["Taking action on important matters", "Making decisions", "Social interactions"],
    avoidToday: avoidItems.length > 0 ? avoidItems : ["Rash decisions", "Impulsive actions"],
    actions: actions.length > 0 ? actions : ["Stay focused", "Take breaks when needed"],
    planetaryInfluence,
    guidance,
  };
}

/**
 * Generate daily guidance for a subscriber
 */
export async function generateDailyGuidance(
  input: AIAstrologyInput,
  date: string = new Date().toISOString().split("T")[0]
): Promise<DailyGuidance> {
  if (!isAIConfigured()) {
    throw new Error("AI service not configured");
  }

  // Get current astrology data
  const kundliResult = await getKundli({
    name: input.name,
    dob: input.dob,
    tob: input.tob,
    place: input.place,
    latitude: input.latitude || 0,
    longitude: input.longitude || 0,
    timezone: input.timezone || "Asia/Kolkata",
    ayanamsa: 1,
  });

  // Get current transits (simplified - would use transit API in production)
  const currentDate = new Date(date);
  const planets = kundliResult.planets || [];
  const moonSign = planets.find((p) => p.name === "Moon")?.sign || "Unknown";
  const sunSign = planets.find((p) => p.name === "Sun")?.sign || "Unknown";

  // Prepare data for prompt generation
  const birthDetails = {
    name: input.name,
    dob: input.dob,
    tob: input.tob,
    place: input.place,
  };

  const planetaryData = {
    tithi: "Current",
    nakshatra: kundliResult.nakshatra || "Unknown",
    planetaryDay: currentDate.toLocaleDateString("en-US", { weekday: "long" }),
  };

  const currentTransits = [`Moon in ${moonSign}`, `Sun in ${sunSign}`];

  // Generate prompt - using simplified format that matches the prompt template
  const prompt = generateDailyGuidancePrompt(birthDetails, planetaryData, currentTransits);

  // Generate AI content
  const aiResponse = await generateAIContent(prompt);

  // Parse and return
  const guidance = parseDailyGuidance(aiResponse, date);
  guidance.input = input;

  return guidance;
}

