/**
 * Enhanced Prokerala API Integration
 * Optimized usage patterns inspired by AstroSage/AstroTalk
 * Includes additional endpoints and efficient request handling
 */

import { prokeralaRequest } from "./astrologyAPI";
import type { BirthDetails } from "@/types/astrology";

/**
 * Get detailed Dasha periods from Prokerala
 * Enhanced with multiple dasha systems (Vimshottari, Ashtottari, etc.)
 */
export async function getDashaPeriods(
  input: BirthDetails,
  dashaType: "vimshottari" | "ashtottari" | "yogini" = "vimshottari"
) {
  if (!input.latitude || !input.longitude) {
    throw new Error("Coordinates required for dasha calculation");
  }

  try {
    const [year, month, day] = input.dob.split("-").map(Number);
    const [hours, minutes, seconds = 0] = input.tob.split(":").map(Number);

    const response = await prokeralaRequest("/dasha-periods", {
      ayanamsa: input.ayanamsa || 1,
      coordinates: `${input.latitude},${input.longitude}`,
      datetime: {
        year,
        month,
        day,
        hour: hours,
        minute: minutes,
        second: seconds || 0,
      },
      timezone: input.timezone || "Asia/Kolkata",
      dasha: dashaType,
    }, 2, "GET" as const);

    // Transform Prokerala response (same format as in astrologyAPI.ts)
    const data = response.data || response;
    const dasha = data.dasha || data.vimshottari || data;
    const periods = dasha.periods || [];

    const current = periods[0] || {};
    const next = periods[1] || {};

    return {
      current: {
        planet: current.planet?.name || current.planet || "Unknown",
        period: current.period || "Unknown",
        startDate: current.start?.datetime || current.startDate || "",
        endDate: current.end?.datetime || current.endDate || "",
        description: current.description || "",
      },
      next: {
        planet: next.planet?.name || next.planet || "Unknown",
        period: next.period || "Unknown",
        startDate: next.start?.datetime || next.startDate || "",
        endDate: next.end?.datetime || next.endDate || "",
        description: next.description || "",
      },
      major: periods || [],
      sub: current.antardashas || current.subPeriods || [],
      upcoming: periods.slice(1) || [],
      type: dashaType,
    };
  } catch (error: any) {
    console.warn("[Enhanced] Dasha endpoint not available:", error?.message);
    return null;
  }
}

/**
 * Get detailed Nakshatra information
 * Includes pada, lord, deity, symbol, and characteristics
 */
export async function getNakshatraDetails(
  input: BirthDetails
) {
  if (!input.latitude || !input.longitude) {
    throw new Error("Coordinates required for nakshatra calculation");
  }

  try {
    const [year, month, day] = input.dob.split("-").map(Number);
    const [hours, minutes, seconds = 0] = input.tob.split(":").map(Number);

    // Try dedicated nakshatra endpoint
    try {
      const response = await prokeralaRequest("/nakshatra", {
        ayanamsa: input.ayanamsa || 1,
        coordinates: `${input.latitude},${input.longitude}`,
        datetime: {
          year,
          month,
          day,
          hour: hours,
          minute: minutes,
          second: seconds || 0,
        },
        timezone: input.timezone || "Asia/Kolkata",
      }, 1, "GET" as const);

      const data = response.data || response;
      return {
        name: data.name || data.nakshatra?.name,
        pada: data.pada || data.nakshatra?.pada,
        lord: data.lord || data.nakshatra?.lord,
        deity: data.deity || data.nakshatra?.deity,
        symbol: data.symbol || data.nakshatra?.symbol,
        characteristics: data.characteristics || data.nakshatra?.characteristics || [],
        compatibility: data.compatibility || [],
      };
    } catch {
      // If dedicated endpoint doesn't exist, extract from kundli
      const kundliResponse = await prokeralaRequest("/kundli", {
        ayanamsa: input.ayanamsa || 1,
        coordinates: `${input.latitude},${input.longitude}`,
        datetime: {
          year,
          month,
          day,
          hour: hours,
          minute: minutes,
          second: seconds || 0,
        },
        timezone: input.timezone || "Asia/Kolkata",
      }, 1, "GET" as const);

      const kundliData = kundliResponse.data || kundliResponse;
      const nakshatraData = kundliData.nakshatra_details || kundliData.nakshatra || {};
      
      return {
        name: nakshatraData.name || nakshatraData.nakshatra?.name,
        pada: nakshatraData.pada,
        lord: nakshatraData.lord,
        deity: nakshatraData.deity,
        symbol: nakshatraData.symbol,
        characteristics: [],
        compatibility: [],
      };
    }
  } catch (error: any) {
    console.warn("[Enhanced] Nakshatra details not available:", error?.message);
    return null;
  }
}

/**
 * Get Yogas (Planetary Combinations)
 * Identifies important yogas in the birth chart
 */
export async function getYogas(input: BirthDetails) {
  if (!input.latitude || !input.longitude) {
    throw new Error("Coordinates required for yoga calculation");
  }

  try {
    const [year, month, day] = input.dob.split("-").map(Number);
    const [hours, minutes, seconds = 0] = input.tob.split(":").map(Number);

    // Try yoga endpoint
    try {
      const response = await prokeralaRequest("/yoga", {
        ayanamsa: input.ayanamsa || 1,
        coordinates: `${input.latitude},${input.longitude}`,
        datetime: {
          year,
          month,
          day,
          hour: hours,
          minute: minutes,
          second: seconds || 0,
        },
        timezone: input.timezone || "Asia/Kolkata",
      }, 1, "GET" as const);

      const data = response.data || response;
      return data.yogas || data.yoga || [];
    } catch {
      // Extract from kundli if yoga endpoint doesn't exist
      const kundliResponse = await prokeralaRequest("/kundli", {
        ayanamsa: input.ayanamsa || 1,
        coordinates: `${input.latitude},${input.longitude}`,
        datetime: {
          year,
          month,
          day,
          hour: hours,
          minute: minutes,
          second: seconds || 0,
        },
        timezone: input.timezone || "Asia/Kolkata",
      }, 1, "GET" as const);

      const kundliData = kundliResponse.data || kundliResponse;
      return kundliData.yogas || kundliData.yoga || [];
    }
  } catch (error: any) {
    console.warn("[Enhanced] Yogas not available:", error?.message);
    return [];
  }
}

/**
 * Get Solar Return Chart (Varshphal)
 * Annual predictions based on solar return
 */
export async function getSolarReturn(
  input: BirthDetails,
  targetYear?: number
) {
  if (!input.latitude || !input.longitude) {
    throw new Error("Coordinates required for solar return calculation");
  }

  try {
    const [year, month, day] = input.dob.split("-").map(Number);
    const [hours, minutes, seconds = 0] = input.tob.split(":").map(Number);
    const solarReturnYear = targetYear || new Date().getFullYear();

    // Try solar return endpoint
    try {
      const response = await prokeralaRequest("/solar-return", {
        ayanamsa: input.ayanamsa || 1,
        coordinates: `${input.latitude},${input.longitude}`,
        datetime: {
          year,
          month,
          day,
          hour: hours,
          minute: minutes,
          second: seconds || 0,
        },
        timezone: input.timezone || "Asia/Kolkata",
        target_year: solarReturnYear,
      }, 2, "GET" as const);

      const data = response.data || response;
      return {
        year: solarReturnYear,
        ascendant: data.ascendant || data.lagna,
        chart: data.chart || data,
        predictions: data.predictions || data.prediction || [],
      };
    } catch {
      // Fallback: Calculate solar return date and generate chart
      // Solar return occurs when Sun returns to exact birth position
      return null;
    }
  } catch (error: any) {
    console.warn("[Enhanced] Solar return not available:", error?.message);
    return null;
  }
}

/**
 * Get Planetary Transits
 * Current and upcoming planetary transits affecting the birth chart
 */
export async function getPlanetaryTransits(
  input: BirthDetails,
  targetDate?: string
) {
  if (!input.latitude || !input.longitude) {
    throw new Error("Coordinates required for transit calculation");
  }

  try {
    const [year, month, day] = input.dob.split("-").map(Number);
    const [hours, minutes, seconds = 0] = input.tob.split(":").map(Number);
    
    const transitDate = targetDate ? new Date(targetDate) : new Date();
    const [transitYear, transitMonth, transitDay] = [
      transitDate.getFullYear(),
      transitDate.getMonth() + 1,
      transitDate.getDate(),
    ];

    // Try transit endpoint
    try {
      const response = await prokeralaRequest("/transit", {
        ayanamsa: input.ayanamsa || 1,
        coordinates: `${input.latitude},${input.longitude}`,
        birth_datetime: {
          year,
          month,
          day,
          hour: hours,
          minute: minutes,
          second: seconds || 0,
        },
        transit_datetime: {
          year: transitYear,
          month: transitMonth,
          day: transitDay,
        },
        timezone: input.timezone || "Asia/Kolkata",
      }, 2, "GET" as const);

      const data = response.data || response;
      return {
        date: targetDate || new Date().toISOString().split("T")[0],
        planets: data.planets || data.transits || [],
        aspects: data.aspects || [],
        effects: data.effects || data.prediction || [],
      };
    } catch {
      return null;
    }
  } catch (error: any) {
    console.warn("[Enhanced] Planetary transits not available:", error?.message);
    return null;
  }
}

/**
 * Batch multiple API calls efficiently
 * Fetches multiple related data points in parallel where safe
 */
export async function getEnhancedKundliData(input: BirthDetails) {
  const results = {
    dasha: null as any,
    nakshatra: null as any,
    yogas: [] as any[],
    transits: null as any,
  };

  try {
    // Execute parallel requests where safe (all use same birth data)
    const [dashaResult, nakshatraResult, yogasResult] = await Promise.allSettled([
      getDashaPeriods(input).catch(() => null),
      getNakshatraDetails(input).catch(() => null),
      getYogas(input).catch(() => []),
    ]);

    results.dasha = dashaResult.status === "fulfilled" ? dashaResult.value : null;
    results.nakshatra = nakshatraResult.status === "fulfilled" ? nakshatraResult.value : null;
    results.yogas = yogasResult.status === "fulfilled" ? yogasResult.value : [];

    // Transits require current date, can be fetched separately if needed
    // (not included in parallel batch as it's less critical)

    return results;
  } catch (error: any) {
    console.warn("[Enhanced] Batch fetch failed:", error?.message);
    return results;
  }
}

/**
 * Get compatibility analysis (Nakshatra Porutham)
 * Detailed compatibility beyond basic guna milan
 */
export async function getNakshatraPorutham(
  inputA: BirthDetails,
  inputB: BirthDetails
) {
  if (!inputA.latitude || !inputA.longitude || !inputB.latitude || !inputB.longitude) {
    throw new Error("Coordinates required for both persons");
  }

  try {
    const parseDate = (dob: string, tob: string) => {
      const [year, month, day] = dob.split("-").map(Number);
      const [hours, minutes, seconds = 0] = tob.split(":").map(Number);
      return { year, month, day, hour: hours, minute: minutes, second: seconds || 0 };
    };

    // Try nakshatra porutham endpoint
    try {
      const response = await prokeralaRequest("/nakshatra-porutham", {
        ayanamsa: 1,
        girl: {
          coordinates: `${inputA.latitude},${inputA.longitude}`,
          datetime: parseDate(inputA.dob, inputA.tob),
          timezone: inputA.timezone || "Asia/Kolkata",
        },
        boy: {
          coordinates: `${inputB.latitude},${inputB.longitude}`,
          datetime: parseDate(inputB.dob, inputB.tob),
          timezone: inputB.timezone || "Asia/Kolkata",
        },
      }, 2, "GET" as const);

      const data = response.data || response;
      return {
        poruthams: data.poruthams || data.compatibility || [],
        totalScore: data.total_score || data.totalScore || 0,
        maxScore: data.max_score || data.maxScore || 36,
        verdict: data.verdict || data.result || "Compatible",
      };
    } catch {
      return null;
    }
  } catch (error: any) {
    console.warn("[Enhanced] Nakshatra porutham not available:", error?.message);
    return null;
  }
}

/**
 * Get Papa Dosham (Papa Dosha) analysis
 * Analysis of malefic planetary influences
 */
export async function getPapaDosham(input: BirthDetails) {
  if (!input.latitude || !input.longitude) {
    throw new Error("Coordinates required for dosha calculation");
  }

  try {
    const [year, month, day] = input.dob.split("-").map(Number);
    const [hours, minutes, seconds = 0] = input.tob.split(":").map(Number);

    const response = await prokeralaRequest("/dosha/papa", {
      ayanamsa: input.ayanamsa || 1,
      coordinates: `${input.latitude},${input.longitude}`,
      datetime: {
        year,
        month,
        day,
        hour: hours,
        minute: minutes,
        second: seconds || 0,
      },
      timezone: input.timezone || "Asia/Kolkata",
    }, 2, "GET" as const);

    const data = response.data || response;
    return {
      hasPapaDosham: data.has_papa_dosham || data.hasPapaDosham || false,
      planets: data.afflicted_planets || data.planets || [],
      explanation: data.explanation || data.description || "",
      effects: data.effects || data.impact || [],
      remedies: data.remedies || data.solutions || [],
      severity: data.severity || "Unknown",
    };
  } catch (error: any) {
    console.warn("[Enhanced] Papa dosham not available:", error?.message);
    return null;
  }
}

/**
 * Get Navamsa Chart (D9 Chart)
 * Divisional chart for marriage and relationships
 */
export async function getNavamsaChart(input: BirthDetails) {
  if (!input.latitude || !input.longitude) {
    throw new Error("Coordinates required for chart calculation");
  }

  try {
    const [year, month, day] = input.dob.split("-").map(Number);
    const [hours, minutes, seconds = 0] = input.tob.split(":").map(Number);

    const response = await prokeralaRequest("/chart/navamsa", {
      ayanamsa: input.ayanamsa || 1,
      coordinates: `${input.latitude},${input.longitude}`,
      datetime: {
        year,
        month,
        day,
        hour: hours,
        minute: minutes,
        second: seconds || 0,
      },
      timezone: input.timezone || "Asia/Kolkata",
    }, 2, "GET" as const);

    const data = response.data || response;
    return {
      chart: data.chart || data.navamsa_chart || data,
      planets: data.planets || data.planet_positions || [],
      houses: data.houses || data.house_positions || [],
      ascendant: data.ascendant || data.lagna || null,
    };
  } catch (error: any) {
    console.warn("[Enhanced] Navamsa chart not available:", error?.message);
    return null;
  }
}

/**
 * Get Inauspicious Periods
 * Rahu Kalam, Yamagandam, Gulika Kalam, etc.
 */
export async function getInauspiciousPeriod(
  location: { latitude: number; longitude: number },
  date: string
) {
  try {
    const response = await prokeralaRequest("/inauspicious-period", {
      coordinates: `${location.latitude},${location.longitude}`,
      date: date, // Format: YYYY-MM-DD
    }, 2, "GET" as const);

    const data = response.data || response;
    return {
      periods: data.periods || data.inauspicious_periods || [],
      rahuKalam: data.rahu_kalam || data.rahukalam || null,
      yamagandam: data.yamagandam || data.yamaganda || null,
      gulikaKalam: data.gulika_kalam || data.gulikakalam || null,
      durmuhurat: data.durmuhurat || data.durmuhurtham || null,
      recommendations: data.recommendations || [],
    };
  } catch (error: any) {
    console.warn("[Enhanced] Inauspicious period not available:", error?.message);
    return null;
  }
}

