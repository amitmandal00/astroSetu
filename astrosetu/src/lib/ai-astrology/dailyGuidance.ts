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
    // Increase max retries to 5 for better resilience against rate limits
    return generateWithOpenAI(prompt, 0, 5);
  } else if (ANTHROPIC_API_KEY) {
    return generateWithAnthropic(prompt);
  } else {
    throw new Error("No AI API key configured");
  }
}

async function generateWithOpenAI(prompt: string, retryCount: number = 0, maxRetries: number = 5): Promise<string> {
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

        console.log(`[OpenAI] Rate limit hit for daily-guidance, retrying after ${Math.round(totalWait)}ms (attempt ${retryCount + 1}/${maxRetries})`);
        
        await new Promise(resolve => setTimeout(resolve, totalWait));
        return generateWithOpenAI(prompt, retryCount + 1, maxRetries);
      } else {
        const finalError = `OpenAI rate limit exceeded. Maximum retries (${maxRetries}) reached after ${maxRetries} attempts. Please try again in a few minutes.`;
        console.error(`[OpenAI] ${finalError} (daily-guidance)`);
        throw new Error(finalError);
      }
    }

    // Handle other errors
    throw new Error(`OpenAI API error: ${errorText}`);
  }

  // Log successful request (only on first attempt to reduce noise)
  if (retryCount === 0) {
    console.log(`[OpenAI] Successfully generated daily guidance content`);
  } else {
    console.log(`[OpenAI] Successfully generated daily guidance content after ${retryCount} retries`);
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
 * Parse AI response into structured theme-based guidance
 */
function parseDailyGuidance(response: string, date: string): DailyGuidance {
  // Extract theme-based guidance (main content)
  // Look for the core guidance message - typically the first substantial paragraph
  const guidance = response
    .split(/\n\n+/)
    .map((para) => para.trim())
    .filter((para) => {
      // Filter out headings, lists, and very short paragraphs
      return para.length > 50 && 
             !para.match(/^(Today|Avoid|Good|Actions|Guidance|Theme|Focus):/i) &&
             !para.startsWith('#') &&
             !para.startsWith('•') &&
             !para.startsWith('-');
    })[0] || response.substring(0, 500).trim();

  // Extract optional reflective observations (not prescriptions)
  const observationsMatch = response.match(/(?:Observations|Reflective notes|Themes):\s*(.*?)(?:\n\n|$)/is);
  const observations = observationsMatch
    ? observationsMatch[1]
        .split(/\n|•|-/)
        .map((item) => item.trim())
        .filter((item) => item.length > 10 && item.length < 150)
        .slice(0, 5)
    : [];

  // Use minimal defaults - guidance is the main content
  return {
    date,
    input: {} as AIAstrologyInput, // Will be filled by caller
    todayGoodFor: [], // No longer used - kept for type compatibility
    avoidToday: [], // No longer used - kept for type compatibility
    actions: observations.length > 0 ? observations : [], // Used for optional reflective observations only
    planetaryInfluence: "", // No longer shown separately
    guidance: guidance || "This period favors thoughtful action and steady progress. Maintain balance between action and rest, and avoid rushing decisions.",
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

