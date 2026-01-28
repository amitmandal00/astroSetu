/**
 * Prokerala API Response Transformers
 * Transforms Prokerala API responses to AstroSetu format
 */

import type { KundliResult, MatchResult, Panchang, DoshaAnalysis, KundliChart, Choghadiya, NakshatraPorutham, CalendarSystem } from "@/types/astrology";

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
    } else if (nakDetails.zodiac) {
      // Zodiac in nakshatra_details often represents the ascendant sign
      const extracted = extractSignName(nakDetails.zodiac);
      if (extracted) {
        ascendant = extracted;
        console.log("[Transform] Found ascendant from nakshatra_details.zodiac:", ascendant);
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
    } else if (input?.dob) {
      // Note: Calculating tithi from date alone requires complex astronomical calculations
      // and is not reliable without moon/sun positions. Skip this fallback.
      console.log("[Transform] Could calculate tithi from date but skipping complex calculation");
    }
  }
  
  // Get moon data for planet map (defined early for use in debug logs)
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
  
  // If no planets found in standard locations, try extracting from zodiac/rashi data
  if (Object.keys(planetMap).filter(k => planetMap[k]).length === 0) {
    // Try to extract from soorya_rasi (sun sign) and chandra_rasi (moon sign) if available
    if (data.nakshatra_details) {
      const nakDetails = data.nakshatra_details;
      
      // Moon sign is available
      if (nakDetails.chandra_rasi) {
        const moonSign = nakDetails.chandra_rasi.name || nakDetails.chandra_rasi;
        planetMap.moon = {
          name: "Moon",
          sign: moonSign,
          rashi: moonSign,
          zodiac: moonSign,
          degree: 0, // Approximate
        };
      }
      
      // Sun sign is available
      if (nakDetails.soorya_rasi) {
        const sunSign = nakDetails.soorya_rasi.name || nakDetails.soorya_rasi;
        planetMap.sun = {
          name: "Sun",
          sign: sunSign,
          rashi: sunSign,
          zodiac: sunSign,
          degree: 0, // Approximate
        };
      }
      
      // Zodiac sign (often represents ascendant when houses are not available)
      if (nakDetails.zodiac && ascendant === "Unknown") {
        const extracted = extractSignName(nakDetails.zodiac);
        if (extracted) {
          ascendant = extracted;
          console.log("[Transform] Using zodiac from nakshatra_details as ascendant (in planet extraction):", ascendant);
        } else {
          const zodiacSign = nakDetails.zodiac.name || nakDetails.zodiac;
          if (typeof zodiacSign === 'string') {
            ascendant = zodiacSign;
            console.log("[Transform] Using zodiac string from nakshatra_details as ascendant (in planet extraction):", ascendant);
          }
        }
      }
    }
  }
  
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
  // If ascendant is still unknown, try ALL possible calculation methods
  if (ascendant === "Unknown") {
    // Method 1: Try to find house 1 cusp from houses array
    if (data.houses && Array.isArray(data.houses)) {
      const house1 = data.houses.find((h: any) => 
        h.house === 1 || h.houseNumber === 1 || h.number === 1
      ) || data.houses[0];
      
      if (house1) {
        // Try to get sign from house1
        const house1Sign = extractSignName(house1.sign || house1.rashi || house1.zodiac);
        if (house1Sign) {
          ascendant = house1Sign;
          console.log("[Transform] Final fallback: Found ascendant from house1 sign:", ascendant);
        } else if (house1.longitude) {
          // Calculate from longitude
          const long = typeof house1.longitude === 'number' 
            ? house1.longitude 
            : (house1.longitude.degrees || 0) + (house1.longitude.minutes || 0) / 60 + (house1.longitude.seconds || 0) / 3600;
          if (long > 0) {
            ascendant = calculateSignFromLongitude(long);
            console.log("[Transform] Final fallback: Calculated ascendant from house1 longitude:", ascendant, "longitude:", long);
          }
        } else if (house1.cusp) {
          // Some APIs return cusp directly
          const cuspLong = typeof house1.cusp === 'number' 
            ? house1.cusp 
            : (house1.cusp.degrees || 0) + (house1.cusp.minutes || 0) / 60;
          if (cuspLong > 0) {
            ascendant = calculateSignFromLongitude(cuspLong);
            console.log("[Transform] Final fallback: Calculated ascendant from house1 cusp:", ascendant);
          }
        }
      }
    }
    
    // Method 2: Try to calculate from input coordinates and time (if available)
    if (ascendant === "Unknown" && input && input.latitude && input.longitude && input.dob && input.tob) {
      // This would require astronomical calculations - skip for now as it's complex
      // But log that we have the data
      console.log("[Transform] Could calculate ascendant from coordinates but skipping complex calculation");
    }
  }
  
  // If tithi is still unknown, try ALL possible calculation methods
  if (tithi === "Unknown") {
    // Method 1: Try panchang data
    if (data.panchang) {
      const panchang = data.panchang;
      if (panchang.tithi) {
        const extracted = extractTithiName(panchang.tithi);
        if (extracted) {
          tithi = extracted;
          console.log("[Transform] Final fallback: Found tithi from panchang:", tithi);
        }
      }
    }
    
    // Method 2: Calculate from moon-sun difference (more accurate calculation)
    if (tithi === "Unknown") {
      const moonData = result.moon || data.moon || {};
      const sunData = result.sun || data.sun || {};
      
      if (moonData.longitude && sunData.longitude) {
        const moonLong = typeof moonData.longitude === 'number'
          ? moonData.longitude
          : (moonData.longitude.degrees || 0) + (moonData.longitude.minutes || 0) / 60 + (moonData.longitude.seconds || 0) / 3600;
        const sunLong = typeof sunData.longitude === 'number'
          ? sunData.longitude
          : (sunData.longitude.degrees || 0) + (sunData.longitude.minutes || 0) / 60 + (sunData.longitude.seconds || 0) / 3600;
        
        if (moonLong > 0 && sunLong > 0) {
          // Calculate tithi: (Moon - Sun) / 12 degrees
          const diff = (moonLong - sunLong + 360) % 360;
          const tithiNumber = Math.floor(diff / 12) + 1;
          
          // Map tithi number to name (15 tithis in a lunar month)
          const tithiNames = [
            'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
            'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
            'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima'
          ];
          
          // Determine if it's Shukla (waxing) or Krishna (waning) paksha
          const isShukla = diff < 180;
          const paksha = isShukla ? 'Shukla' : 'Krishna';
          
          if (tithiNumber >= 1 && tithiNumber <= 15) {
            const tithiName = tithiNames[tithiNumber - 1];
            // For Purnima/Amavasya, check if it's actually Amavasya
            if (tithiNumber === 15) {
              // If difference is close to 0 or 360, it's Amavasya; if close to 180, it's Purnima
              const remainder = diff % 12;
              if (remainder < 1 || remainder > 11) {
                tithi = 'Amavasya';
              } else {
                tithi = 'Purnima';
              }
            } else {
              tithi = `${paksha} ${tithiName}`;
            }
            console.log("[Transform] Final fallback: Calculated tithi from moon-sun difference:", tithi, "diff:", diff, "tithiNumber:", tithiNumber);
          }
        }
      }
    }
    
    // Method 3: Try to get from input date if available
    if (tithi === "Unknown" && input && input.dob) {
      // Could calculate from date, but this requires complex lunar calendar calculations
      console.log("[Transform] Could calculate tithi from date but skipping complex calculation");
    }
  }
  
  // Final cleanup - ensure we never return "Unknown"
  // Apply sign mapping to final values
  if (ascendant && ascendant !== "Unknown") {
    // Try case-insensitive matching for sign map
    const ascLower = ascendant.toLowerCase();
    for (const [key, value] of Object.entries(signMap)) {
      if (key.toLowerCase() === ascLower) {
        ascendant = value;
        break;
      }
    }
  }
  
  // If still unknown after ALL attempts, log detailed debug info
  if (ascendant === "Unknown") {
    console.error("[Transform] ❌ FAILED to extract ascendant after all attempts!");
    console.error("[Transform] Debug info:", {
      hasHouses: !!(data.houses && Array.isArray(data.houses)),
      housesLength: data.houses?.length || 0,
      house1Data: data.houses?.[0],
      hasAscendantField: !!data.ascendant,
      hasLagnaField: !!data.lagna,
      hasResultAscendant: !!result.ascendant,
      hasResultLagna: !!result.lagna,
      hasNakshatraDetails: !!data.nakshatra_details,
      fullDataSample: JSON.stringify(data).substring(0, 500),
    });
  }
  
  if (tithi === "Unknown") {
    // Tithi calculation from moon-sun difference failed - use default
    // This is acceptable as tithi is optional and can be calculated elsewhere
    console.log("[Transform] Tithi not found in response, will calculate from moon-sun difference if available");
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
  
  // Final values - return empty string only if truly not found (UI will show "Calculating...")
  const finalAscendant = ascendant !== "Unknown" ? ascendant : "";
  const finalRashi = rashi !== "Unknown" ? rashi : "";
  const finalNakshatra = nakshatra !== "Unknown" ? nakshatra : "";
  const finalTithi = tithi !== "Unknown" ? tithi : "";
  
  console.log("[Transform] ✅ Final extracted values:", {
    ascendant: finalAscendant || "❌ Not found",
    rashi: finalRashi || "❌ Not found",
    nakshatra: finalNakshatra || "❌ Not found",
    tithi: finalTithi || "❌ Not found",
    planetsCount: planets.length,
  });
  
  return {
    ascendant: finalAscendant,
    rashi: finalRashi,
    nakshatra: finalNakshatra,
    tithi: finalTithi,
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
  
  // Extract Nakshatra Porutham data if available
  const nakshatraPorutham = extractNakshatraPorutham(data, match, inputA, inputB);
  
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
    nakshatraPorutham,
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
  
  // Calculate calendar systems
  const calendar = calculateCalendarSystems(date, panchang, data);
  
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
    calendar,
  };
}

/**
 * Transform Prokerala Dosha response
 * Enhanced with comprehensive remedies and analysis
 * Also handles dosha data embedded in kundli responses
 */
import { 
  generateManglikRemedies, 
  generateKaalSarpRemedies, 
  generateShaniRemedies,
  generateRahuKetuRemedies,
  generatePitraRemedies,
  getDoshaImpact,
  getDoshaExplanation
} from "./doshaAnalysis";

export function transformDoshaResponse(prokeralaData: any, planets?: any[]): DoshaAnalysis {
  const data = prokeralaData.data || prokeralaData;
  
  // Handle dosha data that might be embedded in kundli response
  // Prokerala sometimes returns dosha info in the kundli response itself
  const doshaData = data.dosha || data.mangal_dosha || data.manglik || data;
  
  // Manglik Dosha - Enhanced extraction (handle both standalone and embedded formats)
  const manglik = doshaData.manglik || doshaData.mangalDosha || doshaData.mangal_dosha || data.manglik || data.mangalDosha || data.mangal_dosha || {};
  
  // Handle different response formats
  let manglikStatus: "Manglik" | "Non-Manglik";
  if (manglik.has_dosha !== undefined) {
    manglikStatus = manglik.has_dosha ? "Manglik" : "Non-Manglik";
  } else if (manglik.present !== undefined) {
    manglikStatus = manglik.present ? "Manglik" : "Non-Manglik";
  } else if (manglik.hasDosha !== undefined) {
    manglikStatus = manglik.hasDosha ? "Manglik" : "Non-Manglik";
  } else if (manglik.status === "Manglik" || manglik.status === "Non-Manglik") {
    manglikStatus = manglik.status;
  } else {
    // Check description for manglik indication
    const description = manglik.description || manglik.detail || "";
    manglikStatus = description.toLowerCase().includes("manglik") || description.toLowerCase().includes("mangal dosha") ? "Manglik" : "Non-Manglik";
  }
  
  const manglikSeverity = manglik.severity || manglik.level || (manglikStatus === "Manglik" ? "Medium" : "Low");
  let manglikHouse = manglik.house || manglik.houseNumber;
  
  // Extract house from description if available (e.g., "Mars is positioned in the 7th house")
  if (!manglikHouse && manglik.description) {
    const houseMatch = manglik.description.match(/(\d+)(?:st|nd|rd|th)?\s+house/i);
    if (houseMatch) {
      manglikHouse = parseInt(houseMatch[1]);
    }
  }
  
  // Extract Mars position from planets if available
  const marsPlanet = planets?.find((p: any) => 
    p.name === "Mars" || 
    (typeof p === 'string' && p.toLowerCase().includes('mars'))
  );
  const marsHouse = marsPlanet?.house || manglikHouse;
  
  // Kaal Sarp Dosha - Enhanced extraction with detailed type detection
  const kaalSarp = data.kaalSarp || data.kaalSarpDosha || data.kaalSarpaDosha || data.kaalsarp || {};
  const kaalSarpPresent = kaalSarp.present !== undefined 
    ? kaalSarp.present 
    : kaalSarp.hasDosha !== undefined 
    ? kaalSarp.hasDosha 
    : kaalSarp.status === "Present" || kaalSarp.status === "Yes"
    ? true
    : kaalSarp.has_dosha !== undefined
    ? kaalSarp.has_dosha
    : false;
  
  // Enhanced type detection - check multiple possible field names
  let kaalSarpType = kaalSarp.type || kaalSarp.doshaType || kaalSarp.kaalSarpType || kaalSarp.kaalsarpType;
  
  // If type not found but description mentions a type, extract it
  if (!kaalSarpType && kaalSarp.description) {
    const typeNames = ["Anant", "Kulik", "Vasuki", "Shankhpal", "Padma", "Mahapadma", "Takshak", "Karkotak"];
    for (const typeName of typeNames) {
      if (kaalSarp.description.toLowerCase().includes(typeName.toLowerCase())) {
        kaalSarpType = typeName;
        break;
      }
    }
  }
  
  // Determine severity based on type (Anant and Mahapadma are most severe)
  let kaalSarpSeverity: "High" | "Medium" | "Low" = "Medium";
  if (kaalSarpPresent) {
    if (kaalSarp.severity) {
      kaalSarpSeverity = kaalSarp.severity as "High" | "Medium" | "Low";
    } else if (kaalSarp.level) {
      const level = kaalSarp.level.toString().toLowerCase();
      if (level.includes("high") || level.includes("severe")) {
        kaalSarpSeverity = "High";
      } else if (level.includes("medium") || level.includes("moderate")) {
        kaalSarpSeverity = "Medium";
      } else {
        kaalSarpSeverity = "Low";
      }
    } else if (kaalSarpType === "Anant" || kaalSarpType === "Mahapadma") {
      kaalSarpSeverity = "High";
    } else {
      kaalSarpSeverity = "Medium";
    }
  } else {
    kaalSarpSeverity = "Low";
  }
  
  // Shani Dosha - Enhanced extraction
  const shani = data.shani || data.sadeSati || data.sadeSatiPeriod || {};
  const shaniEffects = shani.effects || shani.challenges || (shani.active ? ["Sade Sati period may be active"] : []);
  const shaniPeriod = shani.period || shani.activePeriod || shani.duration;
  const shaniSeverity = shani.severity || shani.level || (shani.active ? "Medium" : "Low");
  
  // Rahu-Ketu Dosha - Enhanced extraction
  const rahuKetu = data.rahuKetu || data.rahuKetuDosha || {};
  const rahuKetuEffects = rahuKetu.effects || rahuKetu.challenges || ["Rahu-Ketu axis affects life areas"];
  const rahuKetuSeverity = rahuKetu.severity || rahuKetu.level || "Medium";
  
  // Pitra Dosha - Check if present
  const pitra = data.pitra || data.pitraDosha || {};
  const pitraPresent = pitra.present || pitra.hasDosha || false;
  
  // Generate comprehensive remedies
  const manglikDetailedRemedies = manglikStatus === "Manglik" 
    ? generateManglikRemedies(marsHouse, manglikSeverity as "High" | "Medium" | "Low")
    : [];
  
  const kaalSarpDetailedRemedies = kaalSarpPresent 
    ? generateKaalSarpRemedies(kaalSarpType)
    : [];
  
  const shaniDetailedRemedies = generateShaniRemedies(shaniPeriod);
  const rahuKetuDetailedRemedies = generateRahuKetuRemedies();
  const pitraDetailedRemedies = pitraPresent ? generatePitraRemedies() : [];
  
  // Convert detailed remedies to simple string array for backward compatibility
  const convertRemediesToStrings = (remedies: any[]) => {
    return remedies.map(r => r.name || `${r.type}: ${r.description}`).slice(0, 4);
  };
  
  // Count total doshas
  let totalDoshas = 0;
  if (manglikStatus === "Manglik") totalDoshas++;
  if (kaalSarpPresent) totalDoshas++;
  if (shaniEffects.length > 0 && shaniEffects[0] !== "Shani is well-placed") totalDoshas++;
  if (rahuKetuEffects.length > 0) totalDoshas++;
  if (pitraPresent) totalDoshas++;
  
  // Generate overall recommendation
  let recommendation = "";
  if (totalDoshas === 0) {
    recommendation = "Your chart shows good planetary balance. Minor remedies may be beneficial for specific goals.";
  } else if (totalDoshas === 1) {
    recommendation = "One dosha is present. Follow recommended remedies and consult an astrologer for personalized guidance.";
  } else if (totalDoshas === 2) {
    recommendation = "Two doshas are present. It's recommended to perform remedies and consult an expert astrologer for detailed analysis.";
  } else {
    recommendation = "Multiple doshas are present. Immediate consultation with an expert astrologer is highly recommended. Follow all remedies diligently.";
  }
  
  return {
    manglik: {
      status: manglikStatus as "Manglik" | "Non-Manglik",
      severity: manglikSeverity as "High" | "Medium" | "Low",
      remedies: manglik.remedies || convertRemediesToStrings(manglikDetailedRemedies),
      detailedRemedies: manglikDetailedRemedies,
      impact: getDoshaImpact("manglik", manglikStatus === "Manglik", manglikSeverity),
      house: marsHouse,
      explanation: getDoshaExplanation("manglik", { status: manglikStatus, severity: manglikSeverity, house: marsHouse }),
    },
    kaalSarp: {
      present: kaalSarpPresent,
      type: kaalSarpType,
      remedies: kaalSarp.remedies || convertRemediesToStrings(kaalSarpDetailedRemedies),
      detailedRemedies: kaalSarpDetailedRemedies,
      impact: getDoshaImpact("kaalSarp", kaalSarpPresent, kaalSarpSeverity),
      explanation: getDoshaExplanation("kaalSarp", { present: kaalSarpPresent, type: kaalSarpType }),
      severity: kaalSarpSeverity as "High" | "Medium" | "Low",
    },
    shani: {
      effects: shaniEffects,
      remedies: shani.remedies || convertRemediesToStrings(shaniDetailedRemedies),
      detailedRemedies: shaniDetailedRemedies,
      period: shaniPeriod,
      explanation: getDoshaExplanation("shani", { period: shaniPeriod, effects: shaniEffects }),
      severity: shaniSeverity as "High" | "Medium" | "Low",
    },
    rahuKetu: {
      effects: rahuKetuEffects,
      remedies: rahuKetu.remedies || convertRemediesToStrings(rahuKetuDetailedRemedies),
      detailedRemedies: rahuKetuDetailedRemedies,
      explanation: getDoshaExplanation("rahuKetu", { effects: rahuKetuEffects }),
      severity: rahuKetuSeverity as "High" | "Medium" | "Low",
    },
    pitra: pitraPresent ? {
      present: pitraPresent,
      effects: pitra.effects || ["Obstacles in family matters", "Delays in success"],
      remedies: pitra.remedies || convertRemediesToStrings(pitraDetailedRemedies),
      detailedRemedies: pitraDetailedRemedies,
      explanation: getDoshaExplanation("pitra", { present: pitraPresent }),
    } : undefined,
    overall: manglikStatus === "Manglik" || kaalSarpPresent || totalDoshas > 0
      ? "Some doshas are present in your chart. Following recommended remedies can help mitigate their effects. For best results, consult an expert astrologer for personalized guidance and timing."
      : "Overall chart is well-balanced. Minor remedies may still be beneficial for specific goals and overall well-being.",
    recommendation,
    totalDoshas,
  };
}

/**
 * Transform Prokerala Choghadiya response to AstroSetu format
 */
export function transformChoghadiyaResponse(prokeralaData: any, date: string, place: string): Choghadiya {
  const data = prokeralaData.data || prokeralaData;
  const choghadiyaData = data.choghadiya || data;
  
  // Extract day and night periods
  const dayPeriods = (choghadiyaData.day || choghadiyaData.dayPeriods || []).map((period: any) => ({
    type: mapChoghadiyaType(period.type || period.name),
    name: period.name || period.type || "Unknown",
    start: period.start || period.startTime || period.start_time || "",
    end: period.end || period.endTime || period.end_time || "",
    quality: mapChoghadiyaQuality(period.type || period.name),
    activities: period.activities || period.recommended || getChoghadiyaActivities(period.type || period.name),
    avoidActivities: period.avoid || period.notRecommended || getChoghadiyaAvoidActivities(period.type || period.name),
  }));

  const nightPeriods = (choghadiyaData.night || choghadiyaData.nightPeriods || []).map((period: any) => ({
    type: mapChoghadiyaType(period.type || period.name),
    name: period.name || period.type || "Unknown",
    start: period.start || period.startTime || period.start_time || "",
    end: period.end || period.endTime || period.end_time || "",
    quality: mapChoghadiyaQuality(period.type || period.name),
    activities: period.activities || period.recommended || getChoghadiyaActivities(period.type || period.name),
    avoidActivities: period.avoid || period.notRecommended || getChoghadiyaAvoidActivities(period.type || period.name),
  }));

  return {
    date,
    place,
    dayPeriods,
    nightPeriods,
  };
}

/**
 * Transform Panchang data to Choghadiya format (fallback when choghadiya endpoint unavailable)
 */
export function transformPanchangToChoghadiya(panchang: Panchang, date: string, place: string): Choghadiya {
  // Generate mock choghadiya periods based on panchang sunrise/sunset
  // This is a fallback when choghadiya data is not available separately
  const sunrise = panchang.sunrise || "06:00";
  const sunset = panchang.sunset || "18:00";
  
  // Generate typical day periods
  const dayPeriods = [
    { type: "Shubh" as const, name: "Shubh", start: sunrise, end: addTime(sunrise, 1.5), quality: "Auspicious" as const, activities: ["Starting new ventures", "Business activities"], avoidActivities: [] },
    { type: "Labh" as const, name: "Labh", start: addTime(sunrise, 1.5), end: addTime(sunrise, 3), quality: "Auspicious" as const, activities: ["Financial transactions", "Buying/selling"], avoidActivities: [] },
    { type: "Amrit" as const, name: "Amrit", start: addTime(sunrise, 3), end: addTime(sunrise, 4.5), quality: "Auspicious" as const, activities: ["Religious activities", "Health treatments"], avoidActivities: [] },
    { type: "Chal" as const, name: "Chal", start: addTime(sunrise, 4.5), end: addTime(sunrise, 6), quality: "Moderate" as const, activities: ["Travel"], avoidActivities: ["Important decisions"] },
    { type: "Kaal" as const, name: "Kaal", start: addTime(sunrise, 6), end: addTime(sunrise, 7.5), quality: "Inauspicious" as const, activities: [], avoidActivities: ["All important activities"] },
    { type: "Rog" as const, name: "Rog", start: addTime(sunrise, 7.5), end: addTime(sunrise, 9), quality: "Inauspicious" as const, activities: [], avoidActivities: ["Health-related activities"] },
    { type: "Udveg" as const, name: "Udveg", start: addTime(sunrise, 9), end: sunset, quality: "Inauspicious" as const, activities: [], avoidActivities: ["Important meetings"] },
  ];

  const nightPeriods = [
    { type: "Shubh" as const, name: "Shubh", start: sunset, end: addTime(sunset, 1.5), quality: "Auspicious" as const, activities: ["Evening prayers", "Family time"], avoidActivities: [] },
    { type: "Labh" as const, name: "Labh", start: addTime(sunset, 1.5), end: addTime(sunset, 3), quality: "Auspicious" as const, activities: ["Social gatherings"], avoidActivities: [] },
    { type: "Amrit" as const, name: "Amrit", start: addTime(sunset, 3), end: addTime(sunset, 4.5), quality: "Auspicious" as const, activities: ["Meditation"], avoidActivities: [] },
    { type: "Chal" as const, name: "Chal", start: addTime(sunset, 4.5), end: "24:00", quality: "Moderate" as const, activities: ["Travel"], avoidActivities: ["Important activities"] },
  ];

  return {
    date,
    place,
    dayPeriods,
    nightPeriods,
  };
}

/**
 * Helper functions for Choghadiya transformation
 */
function mapChoghadiyaType(type: string): "Shubh" | "Labh" | "Amrit" | "Chal" | "Kaal" | "Rog" | "Udveg" {
  const typeLower = type.toLowerCase();
  if (typeLower.includes("shubh")) return "Shubh";
  if (typeLower.includes("labh")) return "Labh";
  if (typeLower.includes("amrit")) return "Amrit";
  if (typeLower.includes("chal")) return "Chal";
  if (typeLower.includes("kaal")) return "Kaal";
  if (typeLower.includes("rog")) return "Rog";
  if (typeLower.includes("udveg")) return "Udveg";
  return "Chal"; // Default to moderate
}

function mapChoghadiyaQuality(type: string): "Auspicious" | "Moderate" | "Inauspicious" {
  const auspicious = ["Shubh", "Labh", "Amrit"];
  const inauspicious = ["Kaal", "Rog", "Udveg"];
  if (auspicious.includes(type)) return "Auspicious";
  if (inauspicious.includes(type)) return "Inauspicious";
  return "Moderate";
}

function getChoghadiyaActivities(type: string): string[] {
  const typeLower = type.toLowerCase();
  if (typeLower.includes("shubh")) return ["Starting new ventures", "Business activities", "Important meetings"];
  if (typeLower.includes("labh")) return ["Financial transactions", "Buying/selling", "Starting business"];
  if (typeLower.includes("amrit")) return ["Religious activities", "Health treatments", "Education"];
  if (typeLower.includes("chal")) return ["Travel", "Movement"];
  return [];
}

function getChoghadiyaAvoidActivities(type: string): string[] {
  const typeLower = type.toLowerCase();
  if (typeLower.includes("kaal")) return ["All important activities", "Starting new work"];
  if (typeLower.includes("rog")) return ["Health-related activities", "Medical treatments"];
  if (typeLower.includes("udveg")) return ["Important meetings", "Decisions"];
  return [];
}

function addTime(time: string, hours: number): string {
  const [h, m] = time.split(":").map(Number);
  const newHours = (h + hours) % 24;
  return `${String(Math.floor(newHours)).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/**
 * Extract and calculate Nakshatra Porutham from match data
 */
function extractNakshatraPorutham(data: any, match: any, inputA?: any, inputB?: any): NakshatraPorutham | undefined {
  // Try to extract nakshatra porutham from Prokerala response
  const porutham = data.porutham || data.nakshatraPorutham || match.porutham || match.nakshatraPorutham || {};
  
  // Get nakshatra details from both persons
  const nakshatraA = data.girl?.nakshatra || data.personA?.nakshatra || 
                     data.girl?.nakshatra_details?.nakshatra?.name || 
                     match.girlNakshatra || inputA?.nakshatra;
  const nakshatraB = data.boy?.nakshatra || data.personB?.nakshatra ||
                     data.boy?.nakshatra_details?.nakshatra?.name ||
                     match.boyNakshatra || inputB?.nakshatra;
  
  if (!nakshatraA || !nakshatraB) {
    // Try to calculate from available data
    return calculateNakshatraPorutham(nakshatraA || "Unknown", nakshatraB || "Unknown", porutham);
  }
  
  // If Prokerala provides porutham data, use it
  if (porutham.total || porutham.score || porutham.points) {
    const points = porutham.points || porutham.details || [];
    const totalScore = porutham.total || porutham.score || 0;
    const maxScore = porutham.max || 27; // Standard Nakshatra Porutham has 27 points
    
    let compatibility: "Excellent" | "Good" | "Average" | "Challenging" = "Average";
    const scorePercent = (totalScore / maxScore) * 100;
    if (scorePercent >= 80) compatibility = "Excellent";
    else if (scorePercent >= 60) compatibility = "Good";
    else if (scorePercent >= 40) compatibility = "Average";
    else compatibility = "Challenging";
    
    return {
      totalScore,
      maxScore,
      compatibility,
      points: points.map((p: any) => ({
        nakshatra: p.name || p.nakshatra || "",
        score: p.score || 0,
        maxScore: p.max || 1,
        note: p.note || p.description || "",
        compatibility: p.compatibility || (p.score >= p.max * 0.8 ? "Excellent" : p.score >= p.max * 0.6 ? "Good" : p.score >= p.max * 0.4 ? "Average" : "Challenging"),
      })),
      summary: porutham.summary || porutham.description || generateNakshatraPoruthamSummary(totalScore, maxScore, compatibility),
      remedies: porutham.remedies || [],
    };
  }
  
  // Fallback: Calculate from nakshatra names
  return calculateNakshatraPorutham(nakshatraA, nakshatraB, porutham);
}

/**
 * Calculate Nakshatra Porutham from nakshatra names
 */
function calculateNakshatraPorutham(nakshatraA: string, nakshatraB: string, existingData: any): NakshatraPorutham {
  // Nakshatra Porutham calculation - 27 points system
  // This is a simplified calculation - real calculation requires detailed nakshatra analysis
  
  // Get nakshatra indices (27 nakshatras)
  const nakshatras = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashirsha",
    "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha",
    "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati",
    "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha",
    "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada",
    "Uttara Bhadrapada", "Revati"
  ];
  
  const getNakshatraIndex = (name: string): number => {
    const index = nakshatras.findIndex(n => n.toLowerCase() === name.toLowerCase());
    return index >= 0 ? index : -1;
  };
  
  const indexA = getNakshatraIndex(nakshatraA);
  const indexB = getNakshatraIndex(nakshatraB);
  
  // If we can't identify nakshatras, return a basic analysis
  if (indexA < 0 || indexB < 0) {
    return {
      totalScore: 0,
      maxScore: 27,
      compatibility: "Average",
      points: [],
      summary: "Nakshatra Porutham analysis requires accurate nakshatra information. Please ensure birth details are accurate.",
    };
  }
  
  // Calculate compatibility based on nakshatra positions
  // Simplified calculation - real porutham involves multiple factors
  const difference = Math.abs(indexA - indexB);
  const compatibilityScore = Math.max(0, 27 - (difference * 2)); // Simplified scoring
  
  let compatibility: "Excellent" | "Good" | "Average" | "Challenging" = "Average";
  if (compatibilityScore >= 22) compatibility = "Excellent";
  else if (compatibilityScore >= 18) compatibility = "Good";
  else if (compatibilityScore >= 12) compatibility = "Average";
  else compatibility = "Challenging";
  
  return {
    totalScore: compatibilityScore,
    maxScore: 27,
    compatibility,
    points: [
      {
        nakshatra: `${nakshatraA} - ${nakshatraB}`,
        score: compatibilityScore,
        maxScore: 27,
        note: "Nakshatra compatibility based on position analysis",
        compatibility,
      },
    ],
    summary: generateNakshatraPoruthamSummary(compatibilityScore, 27, compatibility),
    remedies: compatibilityScore < 18 ? [
      "Perform Nakshatra Shanti Puja",
      "Consult expert astrologer for detailed analysis",
      "Follow recommended remedies for better compatibility",
    ] : [],
  };
}

/**
 * Generate summary for Nakshatra Porutham
 */
function generateNakshatraPoruthamSummary(score: number, max: number, compatibility: string): string {
  const percentage = Math.round((score / max) * 100);
  if (compatibility === "Excellent") {
    return `Excellent Nakshatra compatibility (${score}/${max} points, ${percentage}%). The nakshatras are highly compatible, indicating strong spiritual and emotional alignment.`;
  } else if (compatibility === "Good") {
    return `Good Nakshatra compatibility (${score}/${max} points, ${percentage}%). The nakshatras show good alignment with some areas requiring attention. Remedies can enhance compatibility further.`;
  } else if (compatibility === "Average") {
    return `Average Nakshatra compatibility (${score}/${max} points, ${percentage}%). Some compatibility factors need attention. Following recommended remedies and consulting an expert astrologer is advisable.`;
  } else {
    return `Challenging Nakshatra compatibility (${score}/${max} points, ${percentage}%). The nakshatras show significant differences. Comprehensive remedies and expert consultation are strongly recommended to improve compatibility.`;
  }
}

/**
 * Calculate calendar systems (Amanta, Purnimanta, Vikram Samvat)
 */
function calculateCalendarSystems(date: string, panchang: any, data: any): CalendarSystem {
  const dateObj = new Date(date);
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1;
  const day = dateObj.getDate();
  
  // Extract tithi info to determine paksha
  const tithiStr = (panchang.tithi || data.tithi || "").toString().toLowerCase();
  const isShukla = tithiStr.includes("shukla") || tithiStr.includes("waxing");
  const isKrishna = tithiStr.includes("krishna") || tithiStr.includes("waning");
  
  // Extract tithi number (1-15)
  const tithiMatch = tithiStr.match(/(\d+)/);
  const tithiNum = tithiMatch ? parseInt(tithiMatch[1]) : day;
  
  // Hindu month names
  const hinduMonths = [
    "Chaitra", "Vaishakha", "Jyeshtha", "Ashadha",
    "Shravana", "Bhadrapada", "Ashwin", "Kartik",
    "Margashirsha", "Paush", "Magh", "Phalguna"
  ];
  
  // Calculate Vikram Samvat year (approximately 57 years ahead of Gregorian)
  const vikramYear = year + 57;
  
  // Determine current Hindu month based on Gregorian month
  // This is simplified - actual calculation requires precise astronomical data
  let hinduMonthIndex = month - 1; // Approximate mapping
  if (month === 1 || month === 2) hinduMonthIndex = 9; // Paush/Magh
  else if (month === 3 || month === 4) hinduMonthIndex = (month === 3 ? 10 : 11); // Phalguna/Chaitra
  else if (month >= 5 && month <= 7) hinduMonthIndex = month - 4; // Vaishakha to Ashadha
  else if (month >= 8 && month <= 10) hinduMonthIndex = month - 3; // Shravana to Ashwin
  else if (month === 11 || month === 12) hinduMonthIndex = (month === 11 ? 6 : 7); // Kartik/Margashirsha
  
  const hinduMonth = hinduMonths[hinduMonthIndex % 12];
  
  // Determine paksha for Amanta (month ends on Amavasya)
  const amantaPaksha: "Shukla" | "Krishna" = isShukla ? "Shukla" : (isKrishna ? "Krishna" : (tithiNum <= 15 ? "Shukla" : "Krishna"));
  const amantaDate = tithiNum <= 15 ? tithiNum : tithiNum - 15;
  
  // Determine paksha for Purnimanta (month ends on Purnima)
  const purnimantaPaksha: "Shukla" | "Krishna" = isShukla ? "Shukla" : (isKrishna ? "Krishna" : (tithiNum <= 15 ? "Shukla" : "Krishna"));
  const purnimantaDate = tithiNum <= 15 ? tithiNum : tithiNum - 15;
  
  // Adjust month for Amanta vs Purnimanta if needed
  const amantaMonth = hinduMonth;
  const purnimantaMonth = hinduMonth;
  
  return {
    amanta: {
      month: amantaMonth,
      date: amantaDate.toString(),
      year: vikramYear,
      paksha: amantaPaksha,
      fullDate: `${amantaMonth} ${amantaPaksha} ${amantaDate}, ${vikramYear}`,
    },
    purnimanta: {
      month: purnimantaMonth,
      date: purnimantaDate.toString(),
      year: vikramYear,
      paksha: purnimantaPaksha,
      fullDate: `${purnimantaMonth} ${purnimantaPaksha} ${purnimantaDate}, ${vikramYear}`,
    },
    vikramSamvat: {
      year: vikramYear,
      month: hinduMonth,
      date: amantaDate.toString(),
      fullDate: `Vikram Samvat ${vikramYear}, ${hinduMonth} ${amantaDate}`,
    },
  };
}

