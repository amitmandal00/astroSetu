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
      max_tokens: 2000, // Increased for enhanced structure (300-450 words)
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
        // CRITICAL: Default to 60 seconds minimum for rate limits (OpenAI rate limits are typically per-minute)
        let waitTime = 60000; // Default to 60 seconds (more conservative for rate limits)
        
        // Try to parse retry-after from error message first
        const errorMessage = errorData?.error?.message || "";
        const retryAfterMatch = errorMessage.match(/try again in (\d+)\s*(ms|seconds?|s)/i) || 
                                errorMessage.match(/retry after (\d+)\s*(ms|seconds?|s)/i);
        if (retryAfterMatch) {
          const retryValue = parseInt(retryAfterMatch[1]);
          const unit = retryAfterMatch[2]?.toLowerCase() || "seconds";
          if (unit.includes("ms") || unit.includes("millisecond")) {
            waitTime = Math.max(retryValue, 60000); // Minimum 60 seconds even if header says less
          } else {
            // Seconds
            waitTime = Math.max(retryValue * 1000, 60000); // Minimum 60 seconds
          }
        } else {
          // Check Retry-After header (this is the most reliable source)
          const retryAfterHeader = response.headers.get("retry-after");
          if (retryAfterHeader) {
            const retryAfterSeconds = parseInt(retryAfterHeader);
            if (!isNaN(retryAfterSeconds)) {
              waitTime = retryAfterSeconds * 1000; // Convert seconds to milliseconds
              // Ensure minimum 60 seconds for rate limits
              waitTime = Math.max(waitTime, 60000);
              // Add buffer (20% extra) to retry-after header value
              waitTime = Math.round(waitTime * 1.2);
            }
          } else {
            // No Retry-After header - use aggressive exponential backoff with 60s minimum
            // Enhanced exponential backoff: 60s, 90s, 120s (minimum 60 seconds)
            waitTime = Math.max(60000 + (retryCount * 30000), 60000); // 60s, 90s, 120s, 150s, 180s
          }
        }

        // Add jitter (random 0-5 seconds) to avoid thundering herd
        const jitter = Math.random() * 5000;
        const totalWait = Math.min(waitTime + jitter, 180000); // Cap at 3 minutes total

        console.log(`[OpenAI] Rate limit hit for daily-guidance, retrying after ${Math.round(totalWait / 1000)}s (attempt ${retryCount + 1}/${maxRetries})`);
        
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
      max_tokens: 2000, // Increased for enhanced structure (300-450 words)
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
 * Parse AI response into structured monthly outlook guidance
 */
function parseDailyGuidance(response: string, date: string): DailyGuidance {
  // Extract Monthly Theme (main guidance content)
  const themeMatch = response.match(/MONTHLY THEME:?\s*(.*?)(?=\n\s*(?:FOCUS AREAS|HELPFUL|BE MINDFUL|REFLECTION)|$)/is);
  const guidance = themeMatch
    ? themeMatch[1].trim()
    : response
        .split(/\n\n+/)
        .map((para) => para.trim())
        .filter((para) => {
          // Filter out headings, lists, and very short paragraphs
          return para.length > 50 && 
                 !para.match(/^(Today|Avoid|Good|Actions|Guidance|Theme|Focus|FOCUS AREAS|HELPFUL|BE MINDFUL|REFLECTION):/i) &&
                 !para.startsWith('#') &&
                 !para.startsWith('•') &&
                 !para.startsWith('-');
        })[0] || response.substring(0, 500).trim();

  // Extract Focus Areas
  const focusAreasMatch = response.match(/FOCUS AREAS:?\s*(.*?)(?=\n\s*(?:HELPFUL|BE MINDFUL|REFLECTION)|$)/is);
  let focusAreas: { mindset: string; work: string; relationships: string; energy: string } | undefined;
  if (focusAreasMatch) {
    const focusText = focusAreasMatch[1];
    const mindsetMatch = focusText.match(/Mindset[^:]*:\s*(.*?)(?=\n\s*[-•]|\n\s*(?:Work|Relationships|Energy)|$)/is);
    const workMatch = focusText.match(/Work[^:]*:\s*(.*?)(?=\n\s*[-•]|\n\s*(?:Relationships|Energy|Mindset)|$)/is);
    const relationshipsMatch = focusText.match(/Relationships[^:]*:\s*(.*?)(?=\n\s*[-•]|\n\s*(?:Energy|Mindset|Work)|$)/is);
    const energyMatch = focusText.match(/Energy[^:]*:\s*(.*?)(?=\n\s*[-•]|\n\s*(?:Mindset|Work|Relationships)|$)/is);
    
    focusAreas = {
      mindset: mindsetMatch ? mindsetMatch[1].trim().replace(/^[-•]\s*/, '') : "",
      work: workMatch ? workMatch[1].trim().replace(/^[-•]\s*/, '') : "",
      relationships: relationshipsMatch ? relationshipsMatch[1].trim().replace(/^[-•]\s*/, '') : "",
      energy: energyMatch ? energyMatch[1].trim().replace(/^[-•]\s*/, '') : "",
    };
    
    // If any area is empty, don't include focusAreas
    if (!focusAreas.mindset || !focusAreas.work || !focusAreas.relationships || !focusAreas.energy) {
      focusAreas = undefined;
    }
  }

  // Extract Helpful This Month (Do items)
  const helpfulMatch = response.match(/HELPFUL THIS MONTH:?\s*(.*?)(?=\n\s*(?:BE MINDFUL|REFLECTION)|$)/is);
  const helpfulThisMonth = helpfulMatch
    ? helpfulMatch[1]
        .split(/\n/)
        .map((line) => line.trim())
        .filter((line) => line.match(/^[-•]\s*Do:/i))
        .map((line) => line.replace(/^[-•]\s*Do:\s*/i, '').trim())
        .filter((item) => item.length > 10 && item.length < 200)
        .slice(0, 3)
    : undefined;

  // Extract Be Mindful Of (Avoid items)
  const mindfulMatch = response.match(/BE MINDFUL OF:?\s*(.*?)(?=\n\s*(?:REFLECTION|$)|$)/is);
  const beMindfulOf = mindfulMatch
    ? mindfulMatch[1]
        .split(/\n/)
        .map((line) => line.trim())
        .filter((line) => line.match(/^[-•]\s*Avoid:/i))
        .map((line) => line.replace(/^[-•]\s*Avoid:\s*/i, '').trim())
        .filter((item) => item.length > 10 && item.length < 200)
        .slice(0, 3)
    : undefined;

  // Extract Reflection Prompt
  const reflectionMatch = response.match(/REFLECTION PROMPT:?\s*(.*?)(?=\n\n|$)/is);
  const reflectionPrompt = reflectionMatch
    ? reflectionMatch[1].trim().replace(/^[-•]\s*/, '')
    : undefined;

  // Use defaults if parsing failed
  return {
    date,
    input: {} as AIAstrologyInput, // Will be filled by caller
    todayGoodFor: [], // Deprecated - kept for type compatibility
    avoidToday: [], // Deprecated - kept for type compatibility
    actions: [], // Deprecated - kept for type compatibility
    planetaryInfluence: "", // Deprecated - kept for type compatibility
    guidance: guidance || "This period favors thoughtful action and steady progress. Maintain balance between action and rest, and avoid rushing decisions.",
    focusAreas,
    helpfulThisMonth: helpfulThisMonth && helpfulThisMonth.length > 0 ? helpfulThisMonth : undefined,
    beMindfulOf: beMindfulOf && beMindfulOf.length > 0 ? beMindfulOf : undefined,
    reflectionPrompt: reflectionPrompt && reflectionPrompt.length > 10 ? reflectionPrompt : undefined,
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

