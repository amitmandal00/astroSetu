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
  console.log("[Transform] Raw ProKerala response:", JSON.stringify(prokeralaData).substring(0, 1000));
  
  // Prokerala API response structure can vary, handle multiple formats
  const data = prokeralaData.data || prokeralaData;
  const result = data.result || data;
  
  // Log full structure for debugging
  console.log("[Transform] Extracted data structure:", {
    dataKeys: data ? Object.keys(data) : [],
    resultKeys: result ? Object.keys(result) : [],
    hasNakshatraDetails: !!data.nakshatra_details,
    hasAscendant: !!(result?.ascendant || result?.lagna || data?.ascendant || data?.lagna),
    hasMoon: !!(result?.moon || data?.moon),
    hasHouses: !!(data.houses && Array.isArray(data.houses)),
    housesCount: data.houses ? data.houses.length : 0,
    hasPlanets: !!(data.planets || result.planets),
    fullData: JSON.stringify(data).substring(0, 2000),
  });
  
  // Extract ascendant (Lagna) - Prokerala returns in different formats
  let ascendant = "Unknown";
  let ascendantDegree = 0;
  
  // Helper function to extract sign name from various formats
  const extractSignName = (signObj: any): string | null => {
    if (!signObj) return null;
    if (typeof signObj === 'string') return signObj;
    return signObj.name || signObj.rashi?.name || signObj.sign?.name || signObj.zodiac?.name || 
           signObj.rashi || signObj.sign || signObj.zodiac || null;
  };
  
  // Helper function to calculate sign from longitude
  const calculateSignFromLongitude = (longitude: number): string => {
    const signIndex = Math.floor(longitude / 30);
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
                   'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    return signs[signIndex % 12] || "Unknown";
  };
  
  // Try multiple paths for ascendant
  // 1. Check houses first (house 1 is ascendant)
  if (data.houses && Array.isArray(data.houses) && data.houses[0]) {
    const house1 = data.houses[0];
    const house1Sign = extractSignName(house1.sign || house1.rashi || house1.zodiac);
    if (house1Sign) {
      ascendant = house1Sign;
      console.log("[Transform] Found ascendant from houses[0]:", ascendant);
    }
    // If sign not found but longitude is available, calculate
    if (ascendant === "Unknown" && house1.longitude) {
      const long = typeof house1.longitude === 'number' 
        ? house1.longitude 
        : (house1.longitude.degrees || 0) + (house1.longitude.minutes || 0) / 60;
      ascendant = calculateSignFromLongitude(long);
      ascendantDegree = long;
      console.log("[Transform] Calculated ascendant from houses[0].longitude:", ascendant);
    }
  }
  
  // 2. Check ascendant field directly
  if (ascendant === "Unknown" && data.ascendant) {
    const asc = data.ascendant;
    const extracted = extractSignName(asc);
    if (extracted) {
      ascendant = extracted;
      console.log("[Transform] Found ascendant from data.ascendant:", ascendant);
    }
    if (asc.longitude) {
      ascendantDegree = typeof asc.longitude === 'number' 
        ? asc.longitude 
        : (asc.longitude.degrees || 0) + (asc.longitude.minutes || 0) / 60;
      if (ascendant === "Unknown") {
        ascendant = calculateSignFromLongitude(ascendantDegree);
        console.log("[Transform] Calculated ascendant from data.ascendant.longitude:", ascendant);
      }
    }
  }
  
  // 3. Check lagna field
  if (ascendant === "Unknown" && data.lagna) {
    const lagna = data.lagna;
    const extracted = extractSignName(lagna);
    if (extracted) {
      ascendant = extracted;
      console.log("[Transform] Found ascendant from data.lagna:", ascendant);
    }
    if (lagna.longitude) {
      ascendantDegree = typeof lagna.longitude === 'number'
        ? lagna.longitude
        : (lagna.longitude.degrees || 0) + (lagna.longitude.minutes || 0) / 60;
      if (ascendant === "Unknown") {
        ascendant = calculateSignFromLongitude(ascendantDegree);
        console.log("[Transform] Calculated ascendant from data.lagna.longitude:", ascendant);
      }
    }
  }
  
  // 4. Check result.ascendant
  if (ascendant === "Unknown" && result.ascendant) {
    const asc = result.ascendant;
    const extracted = extractSignName(asc);
    if (extracted) {
      ascendant = extracted;
      console.log("[Transform] Found ascendant from result.ascendant:", ascendant);
    }
    if (asc.longitude) {
      ascendantDegree = typeof asc.longitude === 'number' 
        ? asc.longitude 
        : (asc.longitude.degrees || 0) + (asc.longitude.minutes || 0) / 60;
      if (ascendant === "Unknown") {
        ascendant = calculateSignFromLongitude(ascendantDegree);
        console.log("[Transform] Calculated ascendant from result.ascendant.longitude:", ascendant);
      }
    }
  }
  
  // 5. Check result.lagna
  if (ascendant === "Unknown" && result.lagna) {
    const lagna = result.lagna;
    const extracted = extractSignName(lagna);
    if (extracted) {
      ascendant = extracted;
      console.log("[Transform] Found ascendant from result.lagna:", ascendant);
    }
    if (lagna.longitude) {
      ascendantDegree = typeof lagna.longitude === 'number'
        ? lagna.longitude
        : (lagna.longitude.degrees || 0) + (lagna.longitude.minutes || 0) / 60;
      if (ascendant === "Unknown") {
        ascendant = calculateSignFromLongitude(ascendantDegree);
        console.log("[Transform] Calculated ascendant from result.lagna.longitude:", ascendant);
      }
    }
  }
  
  // 6. Try to get from nakshatra_details if available
  if (ascendant === "Unknown" && data.nakshatra_details) {
    const nakDetails = data.nakshatra_details;
    if (nakDetails.ascendant) {
      const extracted = extractSignName(nakDetails.ascendant);
      if (extracted) {
        ascendant = extracted;
        console.log("[Transform] Found ascendant from nakshatra_details.ascendant:", ascendant);
      }
    } else if (nakDetails.lagna) {
      const extracted = extractSignName(nakDetails.lagna);
      if (extracted) {
        ascendant = extracted;
        console.log("[Transform] Found ascendant from nakshatra_details.lagna:", ascendant);
      }
    }
  }
  
  // 7. Try to calculate from first house cusp if available
  if (ascendant === "Unknown" && data.houses && Array.isArray(data.houses)) {
    for (const house of data.houses) {
      if (house.house === 1 || house.houseNumber === 1) {
        if (house.longitude) {
          const long = typeof house.longitude === 'number' 
            ? house.longitude 
            : (house.longitude.degrees || 0) + (house.longitude.minutes || 0) / 60;
          ascendant = calculateSignFromLongitude(long);
          ascendantDegree = long;
          console.log("[Transform] Calculated ascendant from house 1 cusp longitude:", ascendant);
          break;
        }
      }
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
  
  // Extract tithi - check multiple locations
  let tithi = "Unknown";
  
  // Helper function to extract tithi name
  const extractTithiName = (tithiObj: any): string | null => {
    if (!tithiObj) return null;
    if (typeof tithiObj === 'string') return tithiObj;
    return tithiObj.name || tithiObj.tithi || tithiObj.value || null;
  };
  
  // Try multiple paths for tithi
  if (data.tithi) {
    const extracted = extractTithiName(data.tithi);
    if (extracted) {
      tithi = extracted;
      console.log("[Transform] Found tithi from data.tithi:", tithi);
    }
  }
  
  if (tithi === "Unknown" && data.panchang?.tithi) {
    const extracted = extractTithiName(data.panchang.tithi);
    if (extracted) {
      tithi = extracted;
      console.log("[Transform] Found tithi from data.panchang.tithi:", tithi);
    }
  }
  
  if (tithi === "Unknown" && result.tithi) {
    const extracted = extractTithiName(result.tithi);
    if (extracted) {
      tithi = extracted;
      console.log("[Transform] Found tithi from result.tithi:", tithi);
    }
  }
  
  if (tithi === "Unknown" && data.nakshatra_details?.tithi) {
    const extracted = extractTithiName(data.nakshatra_details.tithi);
    if (extracted) {
      tithi = extracted;
      console.log("[Transform] Found tithi from nakshatra_details.tithi:", tithi);
    }
  }
  
  // Try panchang object at root level
  if (tithi === "Unknown" && data.panchang) {
    const panchang = data.panchang;
    if (panchang.tithi) {
      const extracted = extractTithiName(panchang.tithi);
      if (extracted) {
        tithi = extracted;
        console.log("[Transform] Found tithi from panchang object:", tithi);
      }
    }
  }
  
  // Try to calculate tithi from moon-sun difference if available
  if (tithi === "Unknown") {
    const moonData = result.moon || data.moon || {};
    const sunData = result.sun || data.sun || {};
    
    if (moonData.longitude && sunData.longitude) {
      const moonLong = typeof moonData.longitude === 'number'
        ? moonData.longitude
        : (moonData.longitude.degrees || 0) + (moonData.longitude.minutes || 0) / 60;
      const sunLong = typeof sunData.longitude === 'number'
        ? sunData.longitude
        : (sunData.longitude.degrees || 0) + (sunData.longitude.minutes || 0) / 60;
      
      // Calculate tithi (difference between moon and sun, divided by 12)
      const diff = (moonLong - sunLong + 360) % 360;
      const tithiNumber = Math.floor(diff / 12) + 1;
      
      // Map tithi number to name (simplified - actual calculation is more complex)
      const tithiNames = [
        'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
        'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
        'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima/Amavasya'
      ];
      
      if (tithiNumber >= 1 && tithiNumber <= 15) {
        tithi = tithiNames[tithiNumber - 1];
        console.log("[Transform] Calculated tithi from moon-sun difference:", tithi);
      }
    }
  }
  
  // Get moon data for planet map (defined here for scope)
  const moonDataForPlanets = result.moon || data.moon || {};
  
  // Extract planetary positions - Prokerala returns planets in different structures
  // Check for planets in different locations
  const planetsData = data.planets || data.planetPositions || result.planets || {};
  const planetMap: Record<string, any> = {
    sun: planetsData.sun || result.sun || data.sun,
    moon: planetsData.moon || result.moon || data.moon || moonDataForPlanets,
    mars: planetsData.mars || result.mars || data.mars,
    mercury: planetsData.mercury || result.mercury || data.mercury,
    jupiter: planetsData.jupiter || result.jupiter || data.jupiter,
    venus: planetsData.venus || result.venus || data.venus,
    saturn: planetsData.saturn || result.saturn || data.saturn,
    rahu: planetsData.rahu || planetsData.rahuNode || result.rahu || result.rahuNode || data.rahu || data.rahuNode,
    ketu: planetsData.ketu || planetsData.ketuNode || result.ketu || result.ketuNode || data.ketu || data.ketuNode,
  };
  
  // If planets are in an array format, extract them
  if (Array.isArray(planetsData)) {
    for (const planet of planetsData) {
      const planetName = (planet.name || planet.planet || "").toLowerCase();
      if (planetName && planetMap[planetName] === undefined) {
        planetMap[planetName] = planet;
      }
    }
  } else if (planetsData && typeof planetsData === 'object' && !planetsData.sun) {
    // If planetsData is an object with planet keys
    Object.assign(planetMap, planetsData);
  }
  
  console.log("[Transform] Extracted planets:", Object.keys(planetMap).filter(k => planetMap[k]));
  
  const planets = Object.entries(planetMap)
    .filter(([_, planet]) => planet)
    .map(([planetName, planet]: [string, any]) => {
      // Handle different Prokerala response formats
      const name = planet.name || planet.planet || planetName.charAt(0).toUpperCase() + planetName.slice(1);
      
      // Extract sign - try multiple paths
      let sign = "Unknown";
      
      // Try extracting sign name using helper function
      const extractedSign = extractSignName(planet.rashi || planet.sign || planet.zodiac);
      if (extractedSign) {
        sign = extractedSign;
      } else if (planet.longitude) {
        // Calculate sign from longitude if direct extraction failed
        const long = typeof planet.longitude === 'number'
          ? planet.longitude
          : (planet.longitude.degrees || 0) + (planet.longitude.minutes || 0) / 60 + (planet.longitude.seconds || 0) / 3600;
        sign = calculateSignFromLongitude(long);
        console.log("[Transform] Calculated planet sign from longitude:", planetName, sign);
      }
      
      // Map to standard sign name
      if (sign && sign !== "Unknown") {
        if (signMap[sign]) {
          sign = signMap[sign];
        } else if (typeof sign === 'string') {
          // Try case-insensitive match
          const signLower = sign.toLowerCase();
          for (const [key, value] of Object.entries(signMap)) {
            if (key.toLowerCase() === signLower) {
              sign = value;
              break;
            }
          }
        }
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
      
      // Extract house - try multiple paths
      let house = 0;
      if (planet.house) {
        house = typeof planet.house === 'number' ? planet.house : (planet.house.number || planet.house.house || 0);
      } else if (planet.houseNumber !== undefined) {
        house = planet.houseNumber;
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
  
  console.log("[Transform] Extracted", planets.length, "planets");

  // Final validation - ensure we don't return "Unknown" if we have any data
  // If ascendant is still unknown but we have houses, try to get from house 1
  if (ascendant === "Unknown" && data.houses && Array.isArray(data.houses) && data.houses.length > 0) {
    // Try to find house 1 or use first house
    const house1 = data.houses.find((h: any) => h.house === 1 || h.houseNumber === 1) || data.houses[0];
    if (house1 && house1.longitude) {
      const long = typeof house1.longitude === 'number' 
        ? house1.longitude 
        : (house1.longitude.degrees || 0) + (house1.longitude.minutes || 0) / 60;
      ascendant = calculateSignFromLongitude(long);
      console.log("[Transform] Final fallback: Calculated ascendant from house 1 longitude:", ascendant);
    }
  }
  
  // If tithi is still unknown, try to get from panchang data if available
  if (tithi === "Unknown" && data.panchang) {
    const panchang = data.panchang;
    if (panchang.tithi) {
      const extracted = extractTithiName(panchang.tithi);
      if (extracted) {
        tithi = extracted;
        console.log("[Transform] Final fallback: Found tithi from panchang:", tithi);
      }
    }
  }
  
  // Generate summary - handle "Unknown" values gracefully
  const summary = [
    ascendant !== "Unknown" 
      ? `Ascendant in ${ascendant} suggests how you approach life, opportunities, and challenges.`
      : `Your ascendant sign indicates how you approach life, opportunities, and challenges.`,
    rashi !== "Unknown"
      ? `Moon sign ${rashi} reflects emotional needs and relationship patterns.`
      : `Your moon sign reflects emotional needs and relationship patterns.`,
    nakshatra !== "Unknown"
      ? `Nakshatra ${nakshatra} highlights deeper traits and repeating life themes.`
      : `Your nakshatra highlights deeper traits and repeating life themes.`,
  ];

  // Return with fallback values - use empty string or "N/A" instead of "Unknown" for better UX
  return {
    ascendant: ascendant !== "Unknown" ? ascendant : "",
    rashi: rashi !== "Unknown" ? rashi : "",
    nakshatra: nakshatra !== "Unknown" ? nakshatra : "",
    tithi: tithi !== "Unknown" ? tithi : "",
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
  
  // Helper to extract name from object or string
  const extractName = (obj: any): string => {
    if (!obj) return "";
    if (typeof obj === 'string') return obj;
    return obj.name || obj.value || "";
  };
  
  return {
    date,
    tithi: extractName(panchang.tithi || data.tithi) || "",
    nakshatra: extractName(panchang.nakshatra || data.nakshatra) || "",
    yoga: extractName(panchang.yoga || data.yoga) || "",
    karana: extractName(panchang.karana || data.karana) || "",
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

