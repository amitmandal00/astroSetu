/**
 * Auspicious Period Calculator API
 * Finds best dates for events over a date range
 */

import type { AuspiciousPeriodCalculator, AuspiciousPeriod, Panchang, Choghadiya } from "@/types/astrology";
import { getPanchangAPI, getChoghadiyaAPI, isAPIConfigured } from "./astrologyAPI";

/**
 * Get Auspicious Periods (Find best dates for events over a date range)
 */
export async function getAuspiciousPeriods(input: {
  eventType: AuspiciousPeriodCalculator["eventType"];
  startDate: string;
  endDate: string;
  place: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
}): Promise<AuspiciousPeriodCalculator> {
  const { eventType, startDate, endDate, place, latitude, longitude, timezone } = input;
  
  // Calculate date range
  const start = new Date(startDate);
  const end = new Date(endDate);
  const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  // If API not configured or coordinates missing, generate mock data
  if (!isAPIConfigured() || !latitude || !longitude) {
    console.warn("[AstroSetu] Auspicious Period: API not configured or coordinates missing - using mock data");
    return generateMockAuspiciousPeriods(input, totalDays);
  }

  try {
    // For each day in range, get panchang and choghadiya to find auspicious periods
    const periods: AuspiciousPeriod[] = [];
    const currentDate = new Date(start);
    
    // Process up to 30 days at a time to avoid rate limits
    const maxDaysPerCall = 30;
    const daysToProcess = Math.min(totalDays, maxDaysPerCall);
    
    for (let i = 0; i < daysToProcess; i++) {
      const dateStr = currentDate.toISOString().slice(0, 10);
      
      try {
        // Get panchang for this date
        const panchang = await getPanchangAPI(dateStr, place, latitude, longitude);
        
        // Get choghadiya for this date
        const choghadiya = await getChoghadiyaAPI(dateStr, place, latitude, longitude);
        
        // Find best auspicious periods for this event type
        const dayPeriods = findAuspiciousPeriodsForEvent(
          dateStr,
          eventType,
          panchang,
          choghadiya
        );
        
        periods.push(...dayPeriods);
      } catch (error) {
        console.warn(`[AstroSetu] Failed to get data for ${dateStr}:`, error);
        // Continue with next date
      }
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Sort periods by score (highest first)
    periods.sort((a, b) => b.score - a.score);
    
    // Get top 5 best periods
    const bestPeriods = periods.slice(0, 5).filter(p => p.quality !== "Avoid");
    
    // Generate summary
    const summary = generateAuspiciousPeriodSummary(eventType, bestPeriods, totalDays);
    
    // Generate suggestions
    const suggestions = generateAuspiciousPeriodSuggestions(eventType, bestPeriods);
    
    return {
      eventType,
      startDate,
      endDate,
      place,
      latitude,
      longitude,
      timezone: timezone || "Asia/Kolkata",
      periods,
      bestPeriods,
      summary,
      totalDays,
      totalPeriods: periods.length,
      suggestions,
    };
  } catch (error: any) {
    console.warn("[AstroSetu] API error, using mock:", error?.message || error);
    return generateMockAuspiciousPeriods(input, totalDays);
  }
}

/**
 * Find auspicious periods for a specific event type on a given date
 */
function findAuspiciousPeriodsForEvent(
  date: string,
  eventType: AuspiciousPeriodCalculator["eventType"],
  panchang: Panchang,
  choghadiya: Choghadiya
): AuspiciousPeriod[] {
  const periods: AuspiciousPeriod[] = [];
  
  // Combine day and night periods
  const allPeriods = [...choghadiya.dayPeriods, ...choghadiya.nightPeriods];
  
  // Rate each period based on event type and panchang factors
  for (const period of allPeriods) {
    if (period.quality === "Inauspicious") continue;
    
    let score = 50; // Base score
    
    // Quality bonus
    if (period.quality === "Auspicious") score += 30;
    else if (period.quality === "Moderate") score += 10;
    
    // Event-specific scoring
    score += getEventTypeScore(eventType, period.type);
    
    // Panchang factors
    score += getPanchangScore(panchang, eventType);
    
    // Time of day bonus (mornings and evenings are generally better)
    const hour = parseInt(period.start.split(":")[0]);
    if (hour >= 6 && hour <= 10) score += 10; // Morning
    else if (hour >= 18 && hour <= 20) score += 5; // Evening
    
    // Clamp score
    score = Math.max(0, Math.min(100, score));
    
    const quality: AuspiciousPeriod["quality"] = 
      score >= 80 ? "Excellent" :
      score >= 60 ? "Good" :
      score >= 40 ? "Moderate" : "Avoid";
    
    periods.push({
      date,
      startTime: period.start,
      endTime: period.end,
      quality,
      score,
      reason: getPeriodReason(period, panchang, eventType),
      recommendations: getEventRecommendations(eventType, period.type),
      avoidReasons: period.quality === "Inauspicious" ? ["Inauspicious Choghadiya period"] : undefined,
    });
  }
  
  return periods.filter(p => p.quality !== "Avoid");
}

/**
 * Get score based on event type and choghadiya type
 */
function getEventTypeScore(eventType: AuspiciousPeriodCalculator["eventType"], choghadiyaType: string): number {
  const eventScores: Record<string, Record<string, number>> = {
    marriage: { Shubh: 20, Labh: 15, Amrit: 25, Chal: 5 },
    business: { Shubh: 15, Labh: 20, Amrit: 10, Chal: 5 },
    travel: { Shubh: 10, Labh: 5, Amrit: 5, Chal: 15 },
    education: { Shubh: 10, Labh: 5, Amrit: 20, Chal: 5 },
    health: { Shubh: 5, Labh: 5, Amrit: 25, Chal: 0 },
    housewarming: { Shubh: 20, Labh: 15, Amrit: 20, Chal: 5 },
    naming: { Shubh: 15, Labh: 10, Amrit: 20, Chal: 5 },
    other: { Shubh: 15, Labh: 15, Amrit: 15, Chal: 5 },
  };
  
  return eventScores[eventType]?.[choghadiyaType] || 10;
}

/**
 * Get score based on panchang factors
 */
function getPanchangScore(panchang: Panchang, eventType: AuspiciousPeriodCalculator["eventType"]): number {
  let score = 0;
  
  // Abhijit Muhurat bonus
  if (panchang.abhijitMuhurat) score += 5;
  
  // Avoid Rahu Kaal (negative score if in Rahu Kaal)
  if (panchang.rahuKaal) score -= 10;
  
  // Tithi factors (some tithis are more auspicious)
  const goodTithis = ["Ekadashi", "Purnima", "Amavasya", "Chaturdashi"];
  if (goodTithis.some(t => panchang.tithi.includes(t))) score += 5;
  
  // Nakshatra factors (some nakshatras are more auspicious)
  const goodNakshatras = ["Rohini", "Uttara Phalguni", "Uttara Ashadha", "Uttara Bhadrapada", "Revati"];
  if (goodNakshatras.includes(panchang.nakshatra)) score += 5;
  
  return score;
}

/**
 * Get reason for period quality
 */
function getPeriodReason(
  period: Choghadiya["dayPeriods"][0],
  panchang: Panchang,
  eventType: AuspiciousPeriodCalculator["eventType"]
): string {
  const reasons: string[] = [];
  
  if (period.quality === "Auspicious") {
    reasons.push(`${period.name} Choghadiya is auspicious for ${eventType}`);
  }
  
  if (panchang.abhijitMuhurat) {
    reasons.push("Abhijit Muhurat is highly auspicious");
  }
  
  const goodTithis = ["Ekadashi", "Purnima", "Amavasya"];
  if (goodTithis.some(t => panchang.tithi.includes(t))) {
    reasons.push(`Favorable Tithi: ${panchang.tithi}`);
  }
  
  return reasons.join(". ") || "Moderately auspicious period";
}

/**
 * Get event-specific recommendations
 */
function getEventRecommendations(
  eventType: AuspiciousPeriodCalculator["eventType"],
  choghadiyaType: string
): string[] {
  const recommendations: Record<string, string[]> = {
    marriage: [
      "Perform the ceremony during the auspicious time",
      "Start with Ganapati puja",
      "Avoid inauspicious periods",
    ],
    business: [
      "Begin business activities at the start time",
      "Perform small puja for success",
      "Avoid important decisions during inauspicious periods",
    ],
    travel: [
      "Start journey during the auspicious time",
      "Seek blessings before departure",
    ],
    education: [
      "Begin studies or exams during this time",
      "Offer prayers to Goddess Saraswati",
    ],
    health: [
      "Schedule medical procedures during this time",
      "Start new health regimens",
    ],
    housewarming: [
      "Perform Griha Pravesh ceremony",
      "Light diya and offer prayers",
    ],
    naming: [
      "Perform naming ceremony",
      "Seek blessings from elders",
    ],
  };
  
  return recommendations[eventType] || ["Use this time for important activities"];
}

/**
 * Generate summary text
 */
function generateAuspiciousPeriodSummary(
  eventType: AuspiciousPeriodCalculator["eventType"],
  bestPeriods: AuspiciousPeriod[],
  totalDays: number
): string {
  if (bestPeriods.length === 0) {
    return `No highly auspicious periods found for ${eventType} in the selected date range. Consider expanding the range or consulting an astrologer.`;
  }
  
  const eventTypeNames: Record<string, string> = {
    marriage: "marriage",
    business: "business launch",
    travel: "travel",
    education: "educational activities",
    health: "health-related activities",
    housewarming: "housewarming",
    naming: "naming ceremony",
    other: "important events",
  };
  
  return `Found ${bestPeriods.length} highly auspicious periods for ${eventTypeNames[eventType]} over ${totalDays} days. The best times are listed below with detailed recommendations.`;
}

/**
 * Generate suggestions
 */
function generateAuspiciousPeriodSuggestions(
  eventType: AuspiciousPeriodCalculator["eventType"],
  bestPeriods: AuspiciousPeriod[]
): string[] {
  const suggestions: string[] = [];
  
  if (bestPeriods.length > 0) {
    suggestions.push(`Best date: ${bestPeriods[0].date} from ${bestPeriods[0].startTime} to ${bestPeriods[0].endTime}`);
  }
  
  suggestions.push("Consult an astrologer for personalized muhurat selection");
  suggestions.push("Consider both partners' birth charts for marriage events");
  suggestions.push("Avoid periods marked as 'Avoid' or 'Inauspicious'");
  
  return suggestions;
}

/**
 * Generate mock auspicious periods data
 */
function generateMockAuspiciousPeriods(
  input: {
    eventType: AuspiciousPeriodCalculator["eventType"];
    startDate: string;
    endDate: string;
    place: string;
  },
  totalDays: number
): AuspiciousPeriodCalculator {
  const periods: AuspiciousPeriod[] = [];
  const start = new Date(input.startDate);
  
  // Generate 2-3 periods per day
  for (let i = 0; i < Math.min(totalDays, 30); i++) {
    const date = new Date(start);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().slice(0, 10);
    
    // Morning period
    periods.push({
      date: dateStr,
      startTime: "09:00",
      endTime: "10:30",
      quality: i % 3 === 0 ? "Excellent" : i % 3 === 1 ? "Good" : "Moderate",
      score: i % 3 === 0 ? 85 : i % 3 === 1 ? 70 : 55,
      reason: "Auspicious Choghadiya period",
      recommendations: getEventRecommendations(input.eventType, "Shubh"),
    });
    
    // Evening period
    if (i % 2 === 0) {
      periods.push({
        date: dateStr,
        startTime: "18:00",
        endTime: "19:30",
        quality: "Good",
        score: 65,
        reason: "Evening auspicious period",
        recommendations: getEventRecommendations(input.eventType, "Labh"),
      });
    }
  }
  
  periods.sort((a, b) => b.score - a.score);
  const bestPeriods = periods.slice(0, 5);
  
  return {
    eventType: input.eventType,
    startDate: input.startDate,
    endDate: input.endDate,
    place: input.place,
    periods,
    bestPeriods,
    summary: generateAuspiciousPeriodSummary(input.eventType, bestPeriods, totalDays),
    totalDays,
    totalPeriods: periods.length,
    suggestions: generateAuspiciousPeriodSuggestions(input.eventType, bestPeriods),
  };
}

