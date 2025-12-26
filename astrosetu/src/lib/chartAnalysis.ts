/**
 * Advanced Chart Analysis Utilities
 * Inspired by AstroSage and AstroTalk comprehensive analysis features
 */

import type { PlanetPosition, KundliChart } from "@/types/astrology";

// House lords mapping (sign -> lord planet)
const HOUSE_LORDS: Record<string, string> = {
  "Aries": "Mars", "Leo": "Sun", "Sagittarius": "Jupiter",
  "Taurus": "Venus", "Virgo": "Mercury", "Capricorn": "Saturn",
  "Gemini": "Mercury", "Libra": "Venus", "Aquarius": "Saturn",
  "Cancer": "Moon", "Scorpio": "Mars", "Pisces": "Jupiter"
};

// Planetary aspects (Vedic astrology - full aspects)
const PLANETARY_ASPECTS: Record<string, number[]> = {
  "Mars": [4, 7, 8],
  "Jupiter": [5, 7, 9],
  "Saturn": [3, 7, 10],
  "Rahu": [5, 7, 9],
  "Ketu": [5, 7, 9],
  // Others aspect only 7th house
};

// Planetary relationships
const PLANETARY_FRIENDS: Record<string, string[]> = {
  "Sun": ["Moon", "Mars", "Jupiter"],
  "Moon": ["Sun", "Mercury"],
  "Mars": ["Sun", "Moon", "Jupiter"],
  "Mercury": ["Sun", "Venus"],
  "Jupiter": ["Sun", "Moon", "Mars"],
  "Venus": ["Mercury", "Saturn"],
  "Saturn": ["Mercury", "Venus"],
  "Rahu": ["Jupiter", "Venus", "Saturn"],
  "Ketu": ["Jupiter", "Venus", "Saturn"],
};

const PLANETARY_ENEMIES: Record<string, string[]> = {
  "Sun": ["Saturn", "Venus"],
  "Moon": ["Saturn"],
  "Mars": ["Mercury", "Venus", "Saturn"],
  "Mercury": ["Moon"],
  "Jupiter": ["Mercury", "Venus"],
  "Venus": ["Sun", "Moon"],
  "Saturn": ["Sun", "Moon", "Mars"],
  "Rahu": ["Sun", "Moon", "Mars"],
  "Ketu": ["Sun", "Moon", "Mars"],
};

export type PlanetaryAspect = {
  from: string;
  to: string;
  aspect: number; // 7th, 5th, 4th, etc.
  type: "full" | "partial";
  description: string;
};

export type PlanetaryRelationship = {
  planet1: string;
  planet2: string;
  relationship: "friendly" | "enemy" | "neutral";
  description: string;
};

export type Yogas = {
  name: string;
  type: "benefic" | "malefic" | "neutral";
  description: string;
  planets: string[];
  impact: string;
};

export type HouseAnalysis = {
  houseNumber: number;
  lord: string;
  sign: string;
  planets: string[];
  significations: string[];
  analysis: string;
  strengths: string[];
  challenges: string[];
};

/**
 * Calculate planetary aspects
 */
export function calculateAspects(planets: PlanetPosition[]): PlanetaryAspect[] {
  const aspects: PlanetaryAspect[] = [];
  
  for (const planet1 of planets) {
    const aspectHouses = PLANETARY_ASPECTS[planet1.name] || [7]; // Default 7th aspect
    
    for (const planet2 of planets) {
      if (planet1.name === planet2.name) continue;
      
      const houseDiff = Math.abs(planet2.house - planet1.house);
      const oppositeHouseDiff = 12 - houseDiff;
      
      // Check for aspects
      for (const aspectHouse of aspectHouses) {
        if (houseDiff === aspectHouse || oppositeHouseDiff === aspectHouse) {
          aspects.push({
            from: planet1.name,
            to: planet2.name,
            aspect: aspectHouse,
            type: aspectHouse === 7 ? "full" : "partial",
            description: `${planet1.name} aspects ${planet2.name} in ${planet2.house}th house (${aspectHouse}th aspect)`,
          });
        }
      }
    }
  }
  
  return aspects;
}

/**
 * Calculate planetary relationships
 */
export function calculateRelationships(planets: PlanetPosition[]): PlanetaryRelationship[] {
  const relationships: PlanetaryRelationship[] = [];
  
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const p1 = planets[i];
      const p2 = planets[j];
      
      const p1Friends = PLANETARY_FRIENDS[p1.name] || [];
      const p1Enemies = PLANETARY_ENEMIES[p1.name] || [];
      
      let relationship: "friendly" | "enemy" | "neutral" = "neutral";
      let description = "";
      
      if (p1Friends.includes(p2.name)) {
        relationship = "friendly";
        description = `${p1.name} and ${p2.name} are friendly planets`;
      } else if (p1Enemies.includes(p2.name)) {
        relationship = "enemy";
        description = `${p1.name} and ${p2.name} are enemy planets`;
      } else {
        description = `${p1.name} and ${p2.name} have neutral relationship`;
      }
      
      relationships.push({
        planet1: p1.name,
        planet2: p2.name,
        relationship,
        description,
      });
    }
  }
  
  return relationships;
}

/**
 * Calculate conjunctions (planets in same house)
 */
export function calculateConjunctions(planets: PlanetPosition[]): Array<{
  house: number;
  planets: string[];
  type: "benefic" | "malefic" | "mixed";
  description: string;
}> {
  const conjunctions: Map<number, string[]> = new Map();
  
  // Group planets by house
  for (const planet of planets) {
    if (!conjunctions.has(planet.house)) {
      conjunctions.set(planet.house, []);
    }
    conjunctions.get(planet.house)!.push(planet.name);
  }
  
  const beneficPlanets = ["Jupiter", "Venus", "Mercury", "Moon"];
  const maleficPlanets = ["Saturn", "Mars", "Sun", "Rahu", "Ketu"];
  
  return Array.from(conjunctions.entries())
    .filter(([_, planets]) => planets.length > 1)
    .map(([house, planetNames]) => {
      const beneficCount = planetNames.filter(p => beneficPlanets.includes(p)).length;
      const maleficCount = planetNames.filter(p => maleficPlanets.includes(p)).length;
      
      let type: "benefic" | "malefic" | "mixed" = "mixed";
      if (beneficCount > maleficCount) type = "benefic";
      else if (maleficCount > beneficCount) type = "malefic";
      
      return {
        house,
        planets: planetNames,
        type,
        description: `${planetNames.join(", ")} are conjunct in ${house}th house`,
      };
    });
}

/**
 * Detect important Yogas (planetary combinations)
 */
export function detectYogas(planets: PlanetPosition[], chart: KundliChart): Yogas[] {
  const yogas: Yogas[] = [];
  
  // Helper to find planet by name
  const findPlanet = (name: string) => planets.find(p => p.name === name);
  
  // Helper to check if planets are in specific houses
  const planetsInHouses = (planetNames: string[], houseNumbers: number[]) => {
    return planetNames.every(name => {
      const planet = findPlanet(name);
      return planet && houseNumbers.includes(planet.house);
    });
  };
  
  // Helper to check if planets are in specific signs
  const planetsInSigns = (planetNames: string[], signs: string[]) => {
    return planetNames.every(name => {
      const planet = findPlanet(name);
      return planet && signs.includes(planet.sign);
    });
  };
  
  // 1. Raja Yoga - Benefic planets in kendra (1,4,7,10) and trikona (1,5,9)
  const kendra = [1, 4, 7, 10];
  const trikona = [1, 5, 9];
  const beneficPlanets = planets.filter(p => 
    ["Jupiter", "Venus", "Mercury", "Moon"].includes(p.name)
  );
  
  if (beneficPlanets.some(p => kendra.includes(p.house)) &&
      beneficPlanets.some(p => trikona.includes(p.house))) {
    yogas.push({
      name: "Raja Yoga",
      type: "benefic",
      description: "Benefic planets in Kendra and Trikona houses",
      planets: beneficPlanets.map(p => p.name),
      impact: "High status, success, and recognition in life",
    });
  }
  
  // 2. Chandra-Mangal Yoga - Moon and Mars together
  const moon = findPlanet("Moon");
  const mars = findPlanet("Mars");
  if (moon && mars && moon.house === mars.house) {
    yogas.push({
      name: "Chandra-Mangal Yoga",
      type: "mixed",
      description: "Moon and Mars in same house",
      planets: ["Moon", "Mars"],
      impact: "Strong willpower but may indicate emotional volatility",
    });
  }
  
  // 3. Budha-Aditya Yoga - Mercury and Sun together
  const mercury = findPlanet("Mercury");
  const sun = findPlanet("Sun");
  if (mercury && sun && mercury.house === sun.house) {
    yogas.push({
      name: "Budha-Aditya Yoga",
      type: "benefic",
      description: "Mercury and Sun in same house",
      planets: ["Mercury", "Sun"],
      impact: "Intelligence, communication skills, and knowledge",
    });
  }
  
  // 4. Gaj Kesari Yoga - Jupiter in kendra from Moon
  if (moon && findPlanet("Jupiter")) {
    const jupiter = findPlanet("Jupiter")!;
    const moonHouse = moon.house;
    const jupiterHouse = jupiter.house;
    const diff = Math.abs(jupiterHouse - moonHouse);
    if (diff === 4 || diff === 7 || diff === 10 || diff === 1 || diff === 8 || diff === 5) {
      yogas.push({
        name: "Gaj Kesari Yoga",
        type: "benefic",
        description: "Jupiter in kendra (1,4,7,10) from Moon",
        planets: ["Jupiter", "Moon"],
        impact: "Wisdom, wealth, and success in life",
      });
    }
  }
  
  // 5. Sunapha Yoga - Planets in 2nd house from Moon
  if (moon) {
    const moonHouse = moon.house;
    const secondFromMoon = (moonHouse % 12) + 1;
    const planetsInSecond = planets.filter(p => p.house === secondFromMoon && p.name !== "Moon");
    if (planetsInSecond.length > 0 && !planetsInSecond.some(p => ["Saturn", "Mars", "Sun"].includes(p.name))) {
      yogas.push({
        name: "Sunapha Yoga",
        type: "benefic",
        description: "Benefic planets in 2nd house from Moon",
        planets: planetsInSecond.map(p => p.name),
        impact: "Wealth and prosperity",
      });
    }
  }
  
  return yogas;
}

/**
 * Analyze house significations and meanings
 */
export function analyzeHouses(planets: PlanetPosition[], chart: KundliChart): HouseAnalysis[] {
  const analyses: HouseAnalysis[] = [];
  
  for (const house of chart.houses) {
    const housePlanets = planets.filter(p => p.house === house.number);
    const lord = HOUSE_LORDS[house.sign] || "Unknown";
    const lordPlanet = planets.find(p => p.name === lord);
    
    const significations: Record<number, string[]> = {
      1: ["Self", "Personality", "Appearance", "Health", "Longevity"],
      2: ["Wealth", "Family", "Speech", "Food", "Face"],
      3: ["Siblings", "Courage", "Communication", "Short journeys"],
      4: ["Mother", "Home", "Property", "Education", "Happiness"],
      5: ["Children", "Intelligence", "Romance", "Education", "Creativity"],
      6: ["Enemies", "Health issues", "Service", "Competitions"],
      7: ["Spouse", "Partnerships", "Business", "Marriage"],
      8: ["Longevity", "Obstacles", "Occult", "Transformation"],
      9: ["Father", "Dharma", "Fortune", "Higher learning", "Guru"],
      10: ["Career", "Reputation", "Status", "Authority"],
      11: ["Gains", "Income", "Friends", "Desires", "Elder siblings"],
      12: ["Expenses", "Losses", "Spiritual liberation", "Foreign lands"],
    };
    
    const analysis = generateHouseAnalysis(
      house.number,
      house.sign,
      lord,
      housePlanets.map(p => p.name),
      lordPlanet
    );
    
    analyses.push({
      houseNumber: house.number,
      lord,
      sign: house.sign,
      planets: housePlanets.map(p => p.name),
      significations: significations[house.number] || [],
      analysis: analysis.analysis,
      strengths: analysis.strengths,
      challenges: analysis.challenges,
    });
  }
  
  return analyses;
}

function generateHouseAnalysis(
  houseNum: number,
  sign: string,
  lord: string,
  planets: string[],
  lordPlanet?: PlanetPosition
): { analysis: string; strengths: string[]; challenges: string[] } {
  const strengths: string[] = [];
  const challenges: string[] = [];
  let analysis = "";
  
  // Check if lord is well-placed
  if (lordPlanet) {
    const lordHouse = lordPlanet.house;
    // Lord in own house or exaltation is good
    if (lordHouse === houseNum) {
      strengths.push(`Lord ${lord} is in its own house`);
      analysis += `The house lord ${lord} is well-placed in its own house, indicating strength. `;
    }
  }
  
  // Analyze based on planets in house
  if (planets.length === 0) {
    analysis += `This house is empty, indicating neutral effects. `;
  } else {
    const beneficPlanets = planets.filter(p => 
      ["Jupiter", "Venus", "Mercury", "Moon"].includes(p)
    );
    const maleficPlanets = planets.filter(p => 
      ["Saturn", "Mars", "Sun", "Rahu", "Ketu"].includes(p)
    );
    
    if (beneficPlanets.length > maleficPlanets.length) {
      strengths.push(`Benefic planets ${beneficPlanets.join(", ")} in this house`);
      analysis += `Benefic influence in this house brings positive results. `;
    } else if (maleficPlanets.length > beneficPlanets.length) {
      challenges.push(`Malefic planets ${maleficPlanets.join(", ")} in this house`);
      analysis += `Malefic influence may create challenges related to house significations. `;
    }
  }
  
  return { analysis, strengths, challenges };
}

/**
 * Calculate planetary strengths (simplified)
 */
export function calculatePlanetaryStrengths(planets: PlanetPosition[]): Record<string, {
  strength: number; // 0-100
  position: "exalted" | "own" | "friendly" | "enemy" | "debilitated" | "neutral";
  description: string;
}> {
  const exaltation: Record<string, string> = {
    "Sun": "Aries", "Moon": "Taurus", "Mars": "Capricorn",
    "Mercury": "Virgo", "Jupiter": "Cancer", "Venus": "Pisces",
    "Saturn": "Libra",
  };
  
  const debilitation: Record<string, string> = {
    "Sun": "Libra", "Moon": "Scorpio", "Mars": "Cancer",
    "Mercury": "Pisces", "Jupiter": "Capricorn", "Venus": "Virgo",
    "Saturn": "Aries",
  };
  
  const ownSigns: Record<string, string[]> = {
    "Sun": ["Leo"], "Moon": ["Cancer"], "Mars": ["Aries", "Scorpio"],
    "Mercury": ["Gemini", "Virgo"], "Jupiter": ["Sagittarius", "Pisces"],
    "Venus": ["Taurus", "Libra"], "Saturn": ["Capricorn", "Aquarius"],
  };
  
  const strengths: Record<string, any> = {};
  
  for (const planet of planets) {
    let strength = 50; // Base strength
    let position: "exalted" | "own" | "friendly" | "enemy" | "debilitated" | "neutral" = "neutral";
    let description = "";
    
    if (exaltation[planet.name] === planet.sign) {
      strength = 100;
      position = "exalted";
      description = `${planet.name} is exalted in ${planet.sign}, maximum strength`;
    } else if (debilitation[planet.name] === planet.sign) {
      strength = 25;
      position = "debilitated";
      description = `${planet.name} is debilitated in ${planet.sign}, weak`;
    } else if (ownSigns[planet.name]?.includes(planet.sign)) {
      strength = 90;
      position = "own";
      description = `${planet.name} is in own sign ${planet.sign}, very strong`;
    } else {
      // Check if in friendly or enemy sign (simplified)
      position = "neutral";
      description = `${planet.name} in ${planet.sign}`;
      strength = 60;
    }
    
    // Adjust for retrograde (typically weakens)
    if (planet.retrograde) {
      strength = Math.max(20, strength - 10);
      description += " (Retrograde - reduced strength)";
    }
    
    strengths[planet.name] = {
      strength: Math.round(strength),
      position,
      description,
    };
  }
  
  return strengths;
}

