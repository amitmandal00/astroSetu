/**
 * Enhanced Chart Transformation from Prokerala API
 * Extracts comprehensive chart data including houses, aspects, and detailed planetary information
 */

import type { KundliChart, PlanetPosition } from "@/types/astrology";

/**
 * Generate comprehensive chart from Prokerala response
 */
export function generateChartFromProkerala(
  prokeralaData: any,
  planets: PlanetPosition[]
): KundliChart {
  const data = prokeralaData.data || prokeralaData;
  const result = data.result || data;
  
  // Extract houses from Prokerala response
  const housesData = data.houses || [];
  const houses = Array.from({ length: 12 }, (_, i) => {
    const houseNum = i + 1;
    
    // Find house data from Prokerala
    const houseData = housesData.find((h: any) => 
      h.house === houseNum || 
      h.houseNumber === houseNum || 
      h.number === houseNum ||
      (Array.isArray(housesData) && housesData[i])
    ) || housesData[i];
    
    // Extract sign
    let sign = "Unknown";
    if (houseData) {
      if (typeof houseData.sign === 'string') {
        sign = houseData.sign;
      } else if (houseData.sign?.name) {
        sign = houseData.sign.name;
      } else if (houseData.rashi) {
        sign = typeof houseData.rashi === 'string' ? houseData.rashi : houseData.rashi.name;
      } else if (houseData.zodiac) {
        sign = typeof houseData.zodiac === 'string' ? houseData.zodiac : houseData.zodiac.name;
      }
      
      // Calculate sign from longitude if sign not found
      if (sign === "Unknown" && houseData.longitude) {
        const long = typeof houseData.longitude === 'number'
          ? houseData.longitude
          : (houseData.longitude.degrees || 0) + (houseData.longitude.minutes || 0) / 60;
        const signIndex = Math.floor(long / 30);
        const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
          'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
        sign = signs[signIndex % 12] || "Unknown";
      }
    }
    
    // Find planets in this house
    const planetsInHouse = planets
      .filter(p => p.house === houseNum)
      .map(p => p.name);
    
    return {
      number: houseNum,
      sign: sign || "Unknown",
      planets: planetsInHouse,
    };
  });
  
  // Extract aspects from planetary positions
  const aspects = calculateAspectsFromPlanets(planets);
  
  // Extract dasha information
  const dashaInfo = extractDashaInfo(data, result);
  
  return {
    houses,
    aspects,
    dasha: dashaInfo,
  };
}

/**
 * Calculate aspects from planetary positions
 */
function calculateAspectsFromPlanets(planets: PlanetPosition[]): Array<{
  from: string;
  to: string;
  type: string;
}> {
  const aspects: Array<{ from: string; to: string; type: string }> = [];
  
  // Planetary aspects (Vedic)
  const aspectRules: Record<string, number[]> = {
    "Mars": [4, 7, 8],
    "Jupiter": [5, 7, 9],
    "Saturn": [3, 7, 10],
    "Rahu": [5, 7, 9],
    "Ketu": [5, 7, 9],
  };
  
  for (const planet1 of planets) {
    const aspectHouses = aspectRules[planet1.name] || [7];
    
    for (const planet2 of planets) {
      if (planet1.name === planet2.name) continue;
      
      const houseDiff = Math.abs(planet2.house - planet1.house);
      const oppositeHouseDiff = 12 - houseDiff;
      
      for (const aspectHouse of aspectHouses) {
        if (houseDiff === aspectHouse || oppositeHouseDiff === aspectHouse) {
          let aspectType = "Aspect";
          if (aspectHouse === 7) aspectType = "7th House (Full Aspect)";
          else if (aspectHouse === 5) aspectType = "5th House (Trine)";
          else if (aspectHouse === 9) aspectType = "9th House (Trine)";
          else if (aspectHouse === 4) aspectType = "4th House";
          else if (aspectHouse === 8) aspectType = "8th House";
          else if (aspectHouse === 10) aspectType = "10th House";
          
          aspects.push({
            from: planet1.name,
            to: planet2.name,
            type: aspectType,
          });
        }
      }
    }
  }
  
  return aspects;
}

/**
 * Extract dasha information from Prokerala response
 */
function extractDashaInfo(data: any, result: any): {
  current: string;
  next: string;
  startDate: string;
} {
  // Try multiple paths for dasha data
  const dashaData = 
    data.dasha || 
    data.dashaPeriods || 
    data.vimshottariDasha ||
    result.dasha ||
    result.dashaPeriods ||
    result.vimshottariDasha;
  
  if (dashaData) {
    const current = dashaData.current || 
                   dashaData.majorDasha ||
                   dashaData.currentPeriod?.dasha ||
                   "Unknown";
    
    const next = dashaData.next ||
                 dashaData.upcomingDasha ||
                 "Unknown";
    
    const startDate = dashaData.startDate ||
                     dashaData.currentPeriod?.startDate ||
                     dashaData.start ||
                     new Date().toISOString().slice(0, 10);
    
    return { current, next, startDate };
  }
  
  // Fallback
  return {
    current: "Unknown",
    next: "Unknown",
    startDate: new Date().toISOString().slice(0, 10),
  };
}

