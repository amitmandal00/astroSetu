/**
 * Prokerala API Response Transformers
 * Transforms Prokerala API responses to AstroSetu format
 */

import type { KundliResult, MatchResult, Panchang, DoshaAnalysis, KundliChart } from "@/types/astrology";

/**
 * Transform Prokerala Kundli response to AstroSetu format
 */
export function transformKundliResponse(prokeralaData: any, input: any): KundliResult {
  // Log the raw response for debugging
  console.log("[Transform] Raw ProKerala response:", JSON.stringify(prokeralaData).substring(0, 500));
  
  // Prokerala API response structure can vary, handle multiple formats
  const data = prokeralaData.data || prokeralaData;
  const result = data.result || data;
  
  console.log("[Transform] Extracted data structure:", {
    dataKeys: data ? Object.keys(data) : [],
    resultKeys: result ? Object.keys(result) : [],
    hasNakshatraDetails: !!data.nakshatra_details,
    hasAscendant: !!(result?.ascendant || result?.lagna || data?.ascendant || data?.lagna),
    hasMoon: !!(result?.moon || data?.moon),
  });
  
  // Extract ascendant (Lagna) - Prokerala returns in different formats
  let ascendant = "Unknown";
  let ascendantDegree = 0;
  
  // Try multiple paths for ascendant
  // New structure: data.ascendant or data.lagna
  if (data.ascendant) {
    const asc = data.ascendant;
    ascendant = asc.name || asc.rashi?.name || asc.sign?.name || asc.sign || asc;
    if (asc.longitude) {
      ascendantDegree = typeof asc.longitude === 'number' 
        ? asc.longitude 
        : (asc.longitude.degrees || 0) + (asc.longitude.minutes || 0) / 60;
    }
  } else if (data.lagna) {
    const lagna = data.lagna;
    ascendant = lagna.name || lagna.rashi?.name || lagna.sign?.name || lagna.sign || lagna;
    if (lagna.longitude) {
      ascendantDegree = typeof lagna.longitude === 'number'
        ? lagna.longitude
        : (lagna.longitude.degrees || 0) + (lagna.longitude.minutes || 0) / 60;
    }
  } else if (result.ascendant) {
    const asc = result.ascendant;
    ascendant = asc.name || asc.rashi?.name || asc.sign?.name || asc.sign || asc;
    if (asc.longitude) {
      ascendantDegree = typeof asc.longitude === 'number' 
        ? asc.longitude 
        : (asc.longitude.degrees || 0) + (asc.longitude.minutes || 0) / 60;
    }
  } else if (result.lagna) {
    const lagna = result.lagna;
    ascendant = lagna.name || lagna.rashi?.name || lagna.sign?.name || lagna.sign || lagna;
    if (lagna.longitude) {
      ascendantDegree = typeof lagna.longitude === 'number'
        ? lagna.longitude
        : (lagna.longitude.degrees || 0) + (lagna.longitude.minutes || 0) / 60;
    }
  }
  
  // Map sign names to standard format (handle both English and Sanskrit)
  const signMap: Record<string, string> = {
    'Aries': 'Aries', 'Mesha': 'Aries', '1': 'Aries',
    'Taurus': 'Taurus', 'Vrishabha': 'Taurus', 'Vrisha': 'Taurus', '2': 'Taurus',
    'Gemini': 'Gemini', 'Mithuna': 'Gemini', 'Mithun': 'Gemini', '3': 'Gemini',
    'Cancer': 'Cancer', 'Karka': 'Cancer', 'Karkata': 'Cancer', 'Kark': 'Cancer', '4': 'Cancer',
    'Leo': 'Leo', 'Simha': 'Leo', 'Singh': 'Leo', '5': 'Leo',
    'Virgo': 'Virgo', 'Kanya': 'Virgo', 'Kanya Rashi': 'Virgo', '6': 'Virgo',
    'Libra': 'Libra', 'Tula': 'Libra', 'Tula Rashi': 'Libra', '7': 'Libra',
    'Scorpio': 'Scorpio', 'Vrishchika': 'Scorpio', 'Vrischika': 'Scorpio', 'Vrischik': 'Scorpio', '8': 'Scorpio',
    'Sagittarius': 'Sagittarius', 'Dhanu': 'Sagittarius', 'Dhan': 'Sagittarius', '9': 'Sagittarius',
    'Capricorn': 'Capricorn', 'Makara': 'Capricorn', 'Makar': 'Capricorn', '10': 'Capricorn',
    'Aquarius': 'Aquarius', 'Kumbha': 'Aquarius', 'Kumbh': 'Aquarius', '11': 'Aquarius',
    'Pisces': 'Pisces', 'Meena': 'Pisces', 'Meen': 'Pisces', '12': 'Pisces',
  };
  
  if (ascendant && signMap[ascendant]) {
    ascendant = signMap[ascendant];
  }
  
  // Extract moon sign (rashi) - Moon's rashi
  // Try new structure first: data.nakshatra_details.chandra_rasi (moon sign)
  let rashi = "Unknown";
  
  if (data.nakshatra_details?.chandra_rasi) {
    const chandraRasi = data.nakshatra_details.chandra_rasi;
    rashi = chandraRasi.name || chandraRasi;
    console.log("[Transform] Found rashi from nakshatra_details.chandra_rasi:", rashi);
  } else {
    const moonData = result.moon || data.moon || {};
    
    if (moonData.rashi) {
      const moonRashi = moonData.rashi;
      rashi = moonRashi.name || moonRashi;
    } else if (moonData.sign) {
      const moonSign = moonData.sign;
      rashi = moonSign.name || moonSign;
    } else if (moonData.longitude) {
      // Calculate sign from longitude if available
      const moonLong = typeof moonData.longitude === 'number'
        ? moonData.longitude
        : (moonData.longitude.degrees || 0) + (moonData.longitude.minutes || 0) / 60;
      const signIndex = Math.floor(moonLong / 30);
      const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
      rashi = signs[signIndex] || "Unknown";
    } else if (data.moonSign) {
      rashi = data.moonSign;
    }
  }
  
  if (rashi && signMap[rashi]) {
    rashi = signMap[rashi];
  }
  
  // Extract nakshatra - Moon's nakshatra
  // Try new structure first: data.nakshatra_details.nakshatra
  let nakshatra = "Unknown";
  
  if (data.nakshatra_details?.nakshatra) {
    const nakData = data.nakshatra_details.nakshatra;
    nakshatra = nakData.name || nakData;
    console.log("[Transform] Found nakshatra from nakshatra_details.nakshatra:", nakshatra);
  } else {
    const moonData = result.moon || data.moon || {};
    const nakshatraData = result.nakshatra || data.nakshatra || moonData.nakshatra || {};
    
    if (moonData.nakshatra) {
      const moonNak = moonData.nakshatra;
      nakshatra = moonNak.name || moonNak;
    } else if (nakshatraData.name) {
      nakshatra = nakshatraData.name;
    } else if (typeof nakshatraData === 'string') {
      nakshatra = nakshatraData;
    } else if (data.nakshatra) {
      nakshatra = typeof data.nakshatra === 'string' ? data.nakshatra : data.nakshatra.name || "Unknown";
    }
  }
  
  // Map nakshatra names to standard format
  const nakshatraMap: Record<string, string> = {
    'Ashlesha': 'Ashlesha', 'Ashlesha Nakshatra': 'Ashlesha',
    'Ardra': 'Ardra', 'Ardra Nakshatra': 'Ardra',
    'Ashwini': 'Ashwini', 'Bharani': 'Bharani', 'Krittika': 'Krittika',
    'Rohini': 'Rohini', 'Mrigashirsha': 'Mrigashirsha',
    'Punarvasu': 'Punarvasu', 'Pushya': 'Pushya', 'Magha': 'Magha',
    'Purva Phalguni': 'Purva Phalguni', 'Uttara Phalguni': 'Uttara Phalguni',
    'Hasta': 'Hasta', 'Chitra': 'Chitra', 'Swati': 'Swati',
    'Vishakha': 'Vishakha', 'Anuradha': 'Anuradha', 'Jyeshtha': 'Jyeshtha',
    'Mula': 'Mula', 'Purva Ashadha': 'Purva Ashadha', 'Uttara Ashadha': 'Uttara Ashadha',
    'Shravana': 'Shravana', 'Dhanishta': 'Dhanishta', 'Shatabhisha': 'Shatabhisha',
    'Purva Bhadrapada': 'Purva Bhadrapada', 'Uttara Bhadrapada': 'Uttara Bhadrapada',
    'Revati': 'Revati',
  };
  
  if (nakshatra && nakshatraMap[nakshatra]) {
    nakshatra = nakshatraMap[nakshatra];
  }
  
  // Extract tithi
  const tithi = data.tithi?.name || data.tithi || "Unknown";
  
  // Get moon data for planet map (defined here for scope)
  const moonDataForPlanets = result.moon || data.moon || {};
  
  // Extract planetary positions - Prokerala returns planets in different structures
  const planetMap: Record<string, any> = {
    sun: result.sun || data.sun,
    moon: result.moon || data.moon || moonDataForPlanets,
    mars: result.mars || data.mars,
    mercury: result.mercury || data.mercury,
    jupiter: result.jupiter || data.jupiter,
    venus: result.venus || data.venus,
    saturn: result.saturn || data.saturn,
    rahu: result.rahu || result.rahuNode || data.rahu || data.rahuNode,
    ketu: result.ketu || result.ketuNode || data.ketu || data.ketuNode,
  };
  
  const planets = Object.entries(planetMap)
    .filter(([_, planet]) => planet)
    .map(([planetName, planet]: [string, any]) => {
      // Handle different Prokerala response formats
      const name = planet.name || planetName.charAt(0).toUpperCase() + planetName.slice(1);
      
      // Extract sign - try multiple paths
      let sign = "Unknown";
      if (planet.rashi) {
        const rashi = planet.rashi;
        sign = rashi.name || rashi;
      } else if (planet.sign) {
        const signObj = planet.sign;
        sign = signObj.name || signObj;
      } else if (planet.longitude) {
        // Calculate sign from longitude
        const long = typeof planet.longitude === 'number'
          ? planet.longitude
          : (planet.longitude.degrees || 0) + (planet.longitude.minutes || 0) / 60;
        const signIndex = Math.floor(long / 30);
        const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
        sign = signs[signIndex] || "Unknown";
      }
      
      // Map to standard sign name
      if (sign && signMap[sign]) {
        sign = signMap[sign];
      }
      
      // Extract degree - Prokerala may return longitude object with degrees, minutes, seconds
      let degree = 0;
      if (planet.longitude) {
        if (typeof planet.longitude === 'number') {
          degree = planet.longitude;
        } else if (planet.longitude.degrees !== undefined) {
          degree = planet.longitude.degrees + (planet.longitude.minutes || 0) / 60 + (planet.longitude.seconds || 0) / 3600;
        } else if (planet.longitude.totalDegrees !== undefined) {
          degree = planet.longitude.totalDegrees;
        }
      } else if (planet.degree !== undefined) {
        degree = planet.degree;
      }
      
      // Calculate degree within sign (0-30)
      const degreeInSign = degree % 30;
      
      // Extract house
      let house = 0;
      if (planet.house) {
        house = typeof planet.house === 'number' ? planet.house : (planet.house.number || 0);
      }
      
      const retrograde = planet.isRetrograde || planet.retrograde || false;
      
      return { 
        name, 
        sign, 
        degree: Math.round(degreeInSign * 100) / 100, 
        house, 
        retrograde 
      };
    });

  // Generate summary
  const summary = [
    `Ascendant in ${ascendant} suggests how you approach life, opportunities, and challenges.`,
    `Moon sign ${rashi} reflects emotional needs and relationship patterns.`,
    `Nakshatra ${nakshatra} highlights deeper traits and repeating life themes.`,
  ];

  return {
    ascendant,
    rashi,
    nakshatra,
    tithi,
    planets,
    summary,
  };
}

/**
 * Transform Prokerala Matching response to AstroSetu format
 */
export function transformMatchResponse(prokeralaData: any, inputA: any, inputB: any): MatchResult {
  const data = prokeralaData.data || prokeralaData;
  const match = data.match || data.matching || {};
  
  // Extract guna scores
  const guna = match.guna || match.gunaMilan || {};
  const totalGuna = guna.total || match.totalGuna || 0;
  
  // Extract individual guna scores and convert to breakdown array
  const gunaScores = {
    varna: guna.varna?.score || 0,
    vashya: guna.vashya?.score || 0,
    tara: guna.tara?.score || 0,
    yoni: guna.yoni?.score || 0,
    grahaMaitri: guna.grahaMaitri?.score || guna.grahaMaitri || 0,
    gana: guna.gana?.score || 0,
    bhakoot: guna.bhakoot?.score || 0,
    nadi: guna.nadi?.score || 0,
  };
  
  const breakdown: Array<{ category: string; max: number; score: number; note: string }> = [
    { category: "Varna", max: 1, score: gunaScores.varna, note: guna.varna?.note || "" },
    { category: "Vashya", max: 2, score: gunaScores.vashya, note: guna.vashya?.note || "" },
    { category: "Tara", max: 3, score: gunaScores.tara, note: guna.tara?.note || "" },
    { category: "Yoni", max: 4, score: gunaScores.yoni, note: guna.yoni?.note || "" },
    { category: "Graha Maitri", max: 5, score: gunaScores.grahaMaitri, note: guna.grahaMaitri?.note || "" },
    { category: "Gana", max: 6, score: gunaScores.gana, note: guna.gana?.note || "" },
    { category: "Bhakoot", max: 7, score: gunaScores.bhakoot, note: guna.bhakoot?.note || "" },
    { category: "Nadi", max: 8, score: gunaScores.nadi, note: guna.nadi?.note || "" },
  ];
  
  // Determine verdict (mapped to MatchResult type)
  let verdict: "Excellent" | "Good" | "Average" | "Challenging" = "Average";
  if (totalGuna >= 32) verdict = "Excellent";
  else if (totalGuna >= 28) verdict = "Good"; // "Very Good" mapped to "Good"
  else if (totalGuna >= 24) verdict = "Good";
  else if (totalGuna >= 18) verdict = "Average";
  else verdict = "Challenging"; // "Poor" mapped to "Challenging"
  
  // Extract manglik status
  const manglikA = data.girl?.manglik || data.personA?.manglik || false;
  const manglikB = data.boy?.manglik || data.personB?.manglik || false;
  
  return {
    totalGuna,
    maxGuna: 36,
    breakdown,
    verdict,
    manglik: {
      a: manglikA ? "Manglik" : "Non-Manglik",
      b: manglikB ? "Manglik" : "Non-Manglik",
      note: manglikA || manglikB ? "One or both partners have Manglik dosha" : "Both partners are Non-Manglik"
    },
    guidance: [`Total Guna Score: ${totalGuna}/36. ${verdict} match.`],
  };
}

/**
 * Transform Prokerala Panchang response to AstroSetu format
 */
export function transformPanchangResponse(prokeralaData: any, date: string, place: string): Panchang {
  const data = prokeralaData.data || prokeralaData;
  const panchang = data.panchang || data;
  
  // Helper to format time from Prokerala datetime object
  const formatTime = (timeObj: any): string => {
    if (!timeObj) return "00:00";
    if (typeof timeObj === 'string') {
      // If already formatted, extract time part
      const match = timeObj.match(/(\d{2}):(\d{2})/);
      return match ? `${match[1]}:${match[2]}` : timeObj;
    }
    if (timeObj.datetime) {
      const match = timeObj.datetime.match(/(\d{2}):(\d{2})/);
      return match ? `${match[1]}:${match[2]}` : "00:00";
    }
    if (timeObj.hour !== undefined && timeObj.minute !== undefined) {
      return `${String(timeObj.hour).padStart(2, '0')}:${String(timeObj.minute).padStart(2, '0')}`;
    }
    return "00:00";
  };
  
  // Helper to format time range (start and end)
  const formatTimeRange = (timeRangeObj: any): { start: string; end: string } => {
    if (!timeRangeObj) {
      return { start: "00:00", end: "00:00" };
    }
    if (timeRangeObj.start && timeRangeObj.end) {
      return {
        start: formatTime(timeRangeObj.start),
        end: formatTime(timeRangeObj.end)
      };
    }
    // If it's a single time, use it for both start and end
    const time = formatTime(timeRangeObj);
    return { start: time, end: time };
  };
  
  return {
    date,
    tithi: panchang.tithi?.name || data.tithi?.name || panchang.tithi || "Unknown",
    nakshatra: panchang.nakshatra?.name || data.nakshatra?.name || panchang.nakshatra || "Unknown",
    yoga: panchang.yoga?.name || data.yoga?.name || panchang.yoga || "Unknown",
    karana: panchang.karana?.name || data.karana?.name || panchang.karana || "Unknown",
    sunrise: formatTime(panchang.sunrise || data.sunrise),
    sunset: formatTime(panchang.sunset || data.sunset),
    moonrise: formatTime(panchang.moonrise || data.moonrise),
    moonset: formatTime(panchang.moonset || data.moonset),
    rahuKaal: formatTimeRange(panchang.rahuKaal || data.rahuKaal),
    abhijitMuhurat: formatTimeRange(panchang.abhijitMuhurat || data.abhijitMuhurat),
    auspiciousTimings: [],
  };
}

/**
 * Transform Prokerala Dosha response
 */
export function transformDoshaResponse(prokeralaData: any): DoshaAnalysis {
  const data = prokeralaData.data || prokeralaData;
  
  // Manglik Dosha
  const manglik = data.manglik || data.mangalDosha || {};
  const manglikStatus = manglik.present || manglik.hasDosha ? "Manglik" : "Non-Manglik";
  const manglikSeverity = manglik.severity || (manglikStatus === "Manglik" ? "Medium" : "Low");
  
  // Kaal Sarp Dosha
  const kaalSarp = data.kaalSarp || data.kaalSarpDosha || {};
  const kaalSarpPresent = kaalSarp.present || kaalSarp.hasDosha || false;
  const kaalSarpType = kaalSarp.type || kaalSarp.doshaType;
  
  // Shani Dosha
  const shani = data.shani || data.sadeSati || {};
  const shaniEffects = shani.effects || (shani.active ? ["Sade Sati period may be active"] : []);
  
  // Rahu-Ketu Dosha
  const rahuKetu = data.rahuKetu || {};
  const rahuKetuEffects = rahuKetu.effects || ["Rahu-Ketu axis affects life areas"];
  
  return {
    manglik: {
      status: manglikStatus as "Manglik" | "Non-Manglik",
      severity: manglikSeverity as "High" | "Medium" | "Low",
      remedies: manglik.remedies || [],
    },
    kaalSarp: {
      present: kaalSarpPresent,
      type: kaalSarpType,
      remedies: kaalSarp.remedies || [],
    },
    shani: {
      effects: shaniEffects,
      remedies: shani.remedies || [],
    },
    rahuKetu: {
      effects: rahuKetuEffects,
      remedies: rahuKetu.remedies || [],
    },
    overall: manglikStatus === "Manglik" || kaalSarpPresent
      ? "Some doshas are present. Consult an astrologer for detailed remedies and timing."
      : "Overall chart is balanced. Minor remedies may be beneficial for specific goals.",
  };
}

