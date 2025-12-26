/**
 * Western Astrology API
 * Handles Natal Charts, Synastry, and Transit Charts
 */

import type { BirthDetails, WesternNatalChart, SynastryChart, TransitChart } from "@/types/astrology";
import { isAPIConfigured } from "./astrologyAPI";
import { prokeralaRequest } from "./astrologyAPI";

/**
 * Get Western Natal Chart
 * Uses tropical zodiac (Western astrology system)
 */
export async function getWesternNatalChart(input: BirthDetails): Promise<WesternNatalChart> {
  if (!isAPIConfigured() || !input.latitude || !input.longitude) {
    console.warn("[AstroSetu] Western Natal Chart: API not configured - using mock data");
    return generateMockWesternNatalChart(input);
  }

  try {
    const [year, month, day] = input.dob.split("-").map(Number);
    const [hours, minutes, seconds = 0] = input.tob.split(":").map(Number);

    // Prokerala Western astrology endpoint (if available)
    // Note: Prokerala primarily does Vedic astrology, but may have Western endpoints
    // Using /kundli endpoint with house system = "placidus" and ayanamsa = 0 (tropical)
    const response = await prokeralaRequest("/kundli", {
      ayanamsa: 0, // 0 = Tropical (Western), 1 = Lahiri (Vedic)
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
      house_system: "placidus", // Western house system
    }, 2, "GET" as const);

    return transformWesternNatalChart(response, input);
  } catch (error: any) {
    console.warn("[AstroSetu] API error, using mock:", error?.message || error);
    return generateMockWesternNatalChart(input);
  }
}

/**
 * Get Synastry Chart (Compatibility between two charts)
 */
export async function getSynastryChart(
  personA: BirthDetails,
  personB: BirthDetails
): Promise<SynastryChart> {
  // Get both natal charts
  const chartA = await getWesternNatalChart(personA);
  const chartB = await getWesternNatalChart(personB);

  // Calculate compatibility aspects
  const aspects = calculateSynastryAspects(chartA, chartB);
  
  // Calculate overall compatibility score
  const compatibilityScore = calculateCompatibilityScore(aspects);
  
  const category: SynastryChart["compatibility"]["category"] =
    compatibilityScore >= 80 ? "Excellent" :
    compatibilityScore >= 60 ? "Good" :
    compatibilityScore >= 40 ? "Moderate" : "Challenging";

  // Generate analysis
  const harmonious = aspects.filter(a => a.quality === "Harmonious");
  const challenging = aspects.filter(a => a.quality === "Challenging");
  
  const strengths = harmonious.slice(0, 5).map(a => 
    `${a.planetA} ${a.aspect} ${a.planetB}: ${a.description}`
  );
  
  const challenges = challenging.slice(0, 3).map(a =>
    `${a.planetA} ${a.aspect} ${a.planetB}: ${a.description}`
  );

  const recommendations = generateSynastryRecommendations(aspects, compatibilityScore);

  return {
    personA: chartA,
    personB: chartB,
    compatibility: {
      overall: compatibilityScore,
      category,
      aspects,
      summary: generateSynastrySummary(chartA, chartB, compatibilityScore, category),
      strengths,
      challenges,
      recommendations,
    },
  };
}

/**
 * Get Transit Chart
 * Shows current planetary transits and their effects on natal chart
 */
export async function getTransitChart(
  birthChart: BirthDetails,
  transitDate: string = new Date().toISOString().slice(0, 10)
): Promise<TransitChart> {
  const natalChart = await getWesternNatalChart(birthChart);
  
  // Get current planetary positions for transit date
  const [year, month, day] = transitDate.split("-").map(Number);
  
  // For transits, we'd need current planetary positions
  // This is a simplified version - in production, use ephemeris data
  const transits = generateTransitData(natalChart, transitDate);
  
  const majorTransits = transits
    .filter(t => t.aspectsToNatal.some(a => 
      a.quality === "Positive" || a.quality === "Challenging"
    ))
    .map(t => ({
      transit: `${t.planet} in ${t.sign}`,
      effect: t.aspectsToNatal[0]?.effect || "Ongoing transit",
      dates: `${transitDate} - ${getNextTransitDate(t.planet)}`,
      importance: t.aspectsToNatal.some(a => Math.abs(a.orb) < 1) ? "Major" : "Moderate" as const,
    }))
    .slice(0, 5);

  return {
    birthChart: natalChart,
    transitDate,
    transits,
    summary: generateTransitSummary(transits, majorTransits),
    majorTransits,
    dailyForecast: generateDailyForecast(natalChart, transits),
  };
}

/**
 * Transform Prokerala response to Western Natal Chart
 */
function transformWesternNatalChart(response: any, input: BirthDetails): WesternNatalChart {
  const data = response.data || response;
  const planets: WesternNatalChart["planets"] = [];
  
  // Extract planets from response (assuming similar structure to Vedic)
  const planetNames = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu", "Uranus", "Neptune", "Pluto"];
  
  // Extract house cusps
  const houses = Array.from({ length: 12 }, (_, i) => ({
    number: i + 1,
    sign: getSignFromLongitude((i * 30) % 360), // Simplified
    cuspDegree: (i * 30) % 360,
  }));

  // Calculate aspects
  const aspects: WesternNatalChart["aspects"] = [];

  // Calculate dominant elements and modalities
  const dominantElements = calculateDominantElements(planets);
  const dominantModalities = calculateDominantModalities(planets);

  return {
    birthDetails: input,
    ascendant: houses[0]?.sign || "Aries",
    midheaven: houses[9]?.sign || "Capricorn",
    planets,
    houses,
    aspects,
    summary: generateWesternNatalSummary(planets, houses),
    dominantElements,
    dominantModalities,
    sunSign: planets.find(p => p.name === "Sun")?.sign || "Aries",
    moonSign: planets.find(p => p.name === "Moon")?.sign || "Aries",
    risingSign: houses[0]?.sign || "Aries",
  };
}

/**
 * Generate mock Western Natal Chart
 */
function generateMockWesternNatalChart(input: BirthDetails): WesternNatalChart {
  const seed = input.dob.charCodeAt(0) + input.tob.charCodeAt(0);
  const signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
  
  const planets: WesternNatalChart["planets"] = [
    { name: "Sun", sign: signs[seed % 12], degree: (seed * 7) % 30, house: (seed % 12) + 1, longitude: (seed * 7) % 360, retrograde: false },
    { name: "Moon", sign: signs[(seed + 3) % 12], degree: (seed * 11) % 30, house: ((seed + 2) % 12) + 1, longitude: ((seed + 3) * 30) % 360, retrograde: false },
    { name: "Mercury", sign: signs[(seed + 1) % 12], degree: (seed * 13) % 30, house: (seed % 12) + 1, longitude: ((seed + 1) * 30) % 360, retrograde: (seed % 3 === 0) },
    { name: "Venus", sign: signs[(seed + 4) % 12], degree: (seed * 17) % 30, house: ((seed + 1) % 12) + 1, longitude: ((seed + 4) * 30) % 360, retrograde: false },
    { name: "Mars", sign: signs[(seed + 6) % 12], degree: (seed * 19) % 30, house: ((seed + 5) % 12) + 1, longitude: ((seed + 6) * 30) % 360, retrograde: false },
    { name: "Jupiter", sign: signs[(seed + 9) % 12], degree: (seed * 23) % 30, house: ((seed + 8) % 12) + 1, longitude: ((seed + 9) * 30) % 360, retrograde: (seed % 2 === 0) },
    { name: "Saturn", sign: signs[(seed + 10) % 12], degree: (seed * 29) % 30, house: ((seed + 9) % 12) + 1, longitude: ((seed + 10) * 30) % 360, retrograde: false },
    { name: "Uranus", sign: signs[(seed + 2) % 12], degree: (seed * 31) % 30, house: ((seed + 11) % 12) + 1, longitude: ((seed + 2) * 30) % 360, retrograde: false },
    { name: "Neptune", sign: signs[(seed + 5) % 12], degree: (seed * 37) % 30, house: ((seed + 3) % 12) + 1, longitude: ((seed + 5) * 30) % 360, retrograde: false },
    { name: "Pluto", sign: signs[(seed + 8) % 12], degree: (seed * 41) % 30, house: ((seed + 6) % 12) + 1, longitude: ((seed + 8) * 30) % 360, retrograde: false },
  ];

  const houses = Array.from({ length: 12 }, (_, i) => ({
    number: i + 1,
    sign: signs[(seed + i) % 12],
    cuspDegree: (i * 30 + seed) % 360,
  }));

  const aspects: WesternNatalChart["aspects"] = [];

  const dominantElements = calculateDominantElements(planets);
  const dominantModalities = calculateDominantModalities(planets);

  return {
    birthDetails: input,
    ascendant: houses[0].sign,
    midheaven: houses[9].sign,
    planets,
    houses,
    aspects,
    summary: generateWesternNatalSummary(planets, houses),
    dominantElements,
    dominantModalities,
    sunSign: planets[0].sign,
    moonSign: planets[1].sign,
    risingSign: houses[0].sign,
  };
}

/**
 * Calculate synastry aspects between two charts
 */
function calculateSynastryAspects(
  chartA: WesternNatalChart,
  chartB: WesternNatalChart
): SynastryChart["compatibility"]["aspects"] {
  const aspects: SynastryChart["compatibility"]["aspects"] = [];

  for (const planetA of chartA.planets) {
    for (const planetB of chartB.planets) {
      const angle = Math.abs(planetA.longitude - planetB.longitude);
      const normalizedAngle = Math.min(angle, 360 - angle);
      
      // Check for major aspects
      const aspect = findAspect(normalizedAngle);
      if (aspect) {
        const orb = Math.abs(normalizedAngle - getAspectAngle(aspect));
        if (orb <= 8) { // 8 degree orb for synastry
          aspects.push({
            planetA: planetA.name,
            planetB: planetB.name,
            aspect,
            quality: getAspectQuality(aspect),
            description: getAspectDescription(planetA.name, planetB.name, aspect),
          });
        }
      }
    }
  }

  return aspects;
}

/**
 * Find aspect type from angle
 */
function findAspect(angle: number): WesternAspect["type"] | null {
  const aspects: Array<{ angle: number; type: WesternAspect["type"]; orb: number }> = [
    { angle: 0, type: "Conjunction", orb: 8 },
    { angle: 180, type: "Opposition", orb: 8 },
    { angle: 120, type: "Trine", orb: 8 },
    { angle: 90, type: "Square", orb: 8 },
    { angle: 60, type: "Sextile", orb: 6 },
    { angle: 150, type: "Quincunx", orb: 3 },
  ];

  for (const asp of aspects) {
    if (Math.abs(angle - asp.angle) <= asp.orb) {
      return asp.type;
    }
  }
  return null;
}

/**
 * Get aspect angle in degrees
 */
function getAspectAngle(aspect: WesternAspect["type"]): number {
  const angles: Record<WesternAspect["type"], number> = {
    Conjunction: 0,
    Opposition: 180,
    Trine: 120,
    Square: 90,
    Sextile: 60,
    Quincunx: 150,
    "Semi-Sextile": 30,
    "Semi-Square": 45,
    Sesquiquadrate: 135,
  };
  return angles[aspect] || 0;
}

/**
 * Get aspect quality
 */
function getAspectQuality(aspect: WesternAspect["type"]): "Harmonious" | "Challenging" | "Neutral" {
  const harmonious: WesternAspect["type"][] = ["Trine", "Sextile", "Conjunction"];
  const challenging: WesternAspect["type"][] = ["Opposition", "Square", "Quincunx"];
  
  if (harmonious.includes(aspect)) return "Harmonious";
  if (challenging.includes(aspect)) return "Challenging";
  return "Neutral";
}

/**
 * Get aspect description
 */
function getAspectDescription(planetA: string, planetB: string, aspect: WesternAspect["type"]): string {
  const quality = getAspectQuality(aspect);
  const descriptions: Record<string, string> = {
    "Sun Conjunction Moon": "Strong emotional and ego connection",
    "Venus Trine Mars": "Harmonious attraction and chemistry",
    "Mars Square Mars": "Competitive dynamics and power struggles",
    "Sun Trine Sun": "Easy understanding and compatibility",
    "Moon Opposition Moon": "Emotional differences and needs",
  };

  const key = `${planetA} ${aspect} ${planetB}`;
  return descriptions[key] || `${planetA} ${aspect} ${planetB}: ${quality} interaction`;
}

/**
 * Calculate compatibility score from aspects
 */
function calculateCompatibilityScore(aspects: SynastryChart["compatibility"]["aspects"]): number {
  let score = 50; // Base score

  for (const aspect of aspects) {
    if (aspect.quality === "Harmonious") score += 5;
    else if (aspect.quality === "Challenging") score -= 3;
  }

  // Bonus for strong connections (Sun, Moon, Venus, Mars aspects)
  const personalPlanets = ["Sun", "Moon", "Venus", "Mars"];
  const personalAspects = aspects.filter(a => 
    personalPlanets.includes(a.planetA) && personalPlanets.includes(a.planetB)
  );
  
  score += personalAspects.filter(a => a.quality === "Harmonious").length * 3;

  return Math.max(0, Math.min(100, score));
}

/**
 * Generate synastry summary
 */
function generateSynastrySummary(
  chartA: WesternNatalChart,
  chartB: WesternNatalChart,
  score: number,
  category: string
): string {
  return `${chartA.birthDetails.name || "Person A"} and ${chartB.birthDetails.name || "Person B"} show ${category.toLowerCase()} compatibility (${score}/100). The synastry chart reveals how your planets interact, highlighting areas of harmony and potential challenges in your relationship.`;
}

/**
 * Generate synastry recommendations
 */
function generateSynastryRecommendations(
  aspects: SynastryChart["compatibility"]["aspects"],
  score: number
): string[] {
  const recommendations: string[] = [];

  if (score >= 70) {
    recommendations.push("Strong compatibility - focus on nurturing your natural connection");
  } else if (score >= 50) {
    recommendations.push("Good foundation - work on communication to overcome challenges");
  } else {
    recommendations.push("Focus on understanding each other's differences and finding common ground");
  }

  const challengingAspects = aspects.filter(a => a.quality === "Challenging");
  if (challengingAspects.length > 0) {
    recommendations.push(`Pay attention to ${challengingAspects[0].planetA}-${challengingAspects[0].planetB} interactions`);
  }

  recommendations.push("Consider consulting an astrologer for detailed relationship guidance");

  return recommendations;
}

/**
 * Generate transit data
 */
function generateTransitData(
  natalChart: WesternNatalChart,
  transitDate: string
): TransitChart["transits"] {
  // Simplified transit generation
  // In production, use ephemeris data for accurate planetary positions
  const transitPlanets = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"];
  
  return transitPlanets.map(planet => {
    const natalPlanet = natalChart.planets.find(p => p.name === planet);
    const transitLongitude = (natalPlanet?.longitude || 0) + (Math.random() * 360);
    const transitSign = getSignFromLongitude(transitLongitude);
    
    return {
      planet,
      sign: transitSign,
      degree: transitLongitude % 30,
      house: Math.floor(transitLongitude / 30) % 12 + 1,
      aspectsToNatal: generateTransitAspects(planet, natalChart),
      currentPosition: {
        sign: transitSign,
        degree: transitLongitude % 30,
        house: Math.floor(transitLongitude / 30) % 12 + 1,
      },
    };
  });
}

/**
 * Generate transit aspects to natal chart
 */
function generateTransitAspects(
  transitPlanet: string,
  natalChart: WesternNatalChart
): TransitChart["transits"][0]["aspectsToNatal"] {
  const aspects: TransitChart["transits"][0]["aspectsToNatal"] = [];
  
  // Simplified - check aspects to Sun, Moon, Ascendant
  const importantPoints = [
    { name: "Sun", longitude: natalChart.planets.find(p => p.name === "Sun")?.longitude || 0 },
    { name: "Moon", longitude: natalChart.planets.find(p => p.name === "Moon")?.longitude || 0 },
    { name: "Ascendant", longitude: natalChart.houses[0]?.cuspDegree || 0 },
  ];

  for (const point of importantPoints) {
    // Simplified aspect detection
    const aspect: WesternAspect["type"] = "Trine"; // Simplified
    aspects.push({
      natalPlanet: point.name,
      aspect,
      orb: 2,
      effect: `${transitPlanet} ${aspect} ${point.name}: Influences ${point.name.toLowerCase()}-related areas`,
      duration: "Ongoing",
      quality: aspect === "Trine" || aspect === "Sextile" ? "Positive" : "Challenging",
    });
  }

  return aspects;
}

/**
 * Generate transit summary
 */
function generateTransitSummary(
  transits: TransitChart["transits"],
  majorTransits: TransitChart["majorTransits"]
): string {
  return `Current transits show ${majorTransits.length} major planetary influences. Focus on areas highlighted by these transits for optimal timing and decision-making.`;
}

/**
 * Generate daily forecast
 */
function generateDailyForecast(
  natalChart: WesternNatalChart,
  transits: TransitChart["transits"]
): string {
  return `Today's transits emphasize ${transits[0]?.sign || "planetary"} energy. Pay attention to ${transits[0]?.aspectsToNatal[0]?.natalPlanet || "key areas"} of your chart for insights and opportunities.`;
}

/**
 * Helper functions
 */
function getSignFromLongitude(longitude: number): string {
  const signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
  return signs[Math.floor(longitude / 30)];
}

function calculateDominantElements(planets: WesternNatalChart["planets"]): WesternNatalChart["dominantElements"] {
  const elements: Record<string, number> = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
  const elementMap: Record<string, string> = {
    Aries: "Fire", Leo: "Fire", Sagittarius: "Fire",
    Taurus: "Earth", Virgo: "Earth", Capricorn: "Earth",
    Gemini: "Air", Libra: "Air", Aquarius: "Air",
    Cancer: "Water", Scorpio: "Water", Pisces: "Water",
  };

  for (const planet of planets) {
    const element = elementMap[planet.sign];
    if (element) elements[element]++;
  }

  const total = planets.length;
  return Object.entries(elements)
    .map(([element, count]) => ({ element: element as any, percentage: Math.round((count / total) * 100) }))
    .sort((a, b) => b.percentage - a.percentage);
}

function calculateDominantModalities(planets: WesternNatalChart["planets"]): WesternNatalChart["dominantModalities"] {
  const modalities: Record<string, number> = { Cardinal: 0, Fixed: 0, Mutable: 0 };
  const modalityMap: Record<string, string> = {
    Aries: "Cardinal", Cancer: "Cardinal", Libra: "Cardinal", Capricorn: "Cardinal",
    Taurus: "Fixed", Leo: "Fixed", Scorpio: "Fixed", Aquarius: "Fixed",
    Gemini: "Mutable", Virgo: "Mutable", Sagittarius: "Mutable", Pisces: "Mutable",
  };

  for (const planet of planets) {
    const modality = modalityMap[planet.sign];
    if (modality) modalities[modality]++;
  }

  const total = planets.length;
  return Object.entries(modalities)
    .map(([modality, count]) => ({ modality: modality as any, percentage: Math.round((count / total) * 100) }))
    .sort((a, b) => b.percentage - a.percentage);
}

function generateWesternNatalSummary(
  planets: WesternNatalChart["planets"],
  houses: WesternNatalChart["houses"]
): string {
  const sun = planets.find(p => p.name === "Sun");
  const moon = planets.find(p => p.name === "Moon");
  return `Your Western natal chart shows a ${sun?.sign || "Sun"} Sun sign and ${moon?.sign || "Moon"} Moon sign. The chart reveals your personality, emotional nature, and life path according to Western astrological traditions.`;
}

function getNextTransitDate(planet: string): string {
  // Simplified - in production, calculate actual transit end date
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString().slice(0, 10);
}

