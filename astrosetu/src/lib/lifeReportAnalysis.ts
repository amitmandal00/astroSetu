/**
 * Enhanced Life Report Analysis Utilities
 * Comprehensive life report generation based on birth chart
 * Inspired by AstroSage and AstroTalk patterns
 */

import type { KundliResult, PlanetPosition, KundliChart, DoshaAnalysis } from "@/types/astrology";

export type LifeReportSection = {
  title: string;
  icon: string;
  content: string;
  details: string[];
  recommendations?: string[];
};

export type PersonalityAnalysis = {
  traits: string[];
  strengths: string[];
  weaknesses: string[];
  characteristics: string[];
  nature: string;
  behavior: string;
};

export type CareerAnalysis = {
  overview: string;
  suitableProfessions: string[];
  careerTips: string[];
  favorablePeriods: string[];
  challenges: string[];
  growthAreas: string[];
};

export type HealthAnalysis = {
  overview: string;
  potentialIssues: string[];
  preventiveMeasures: string[];
  healthTips: string[];
  favorablePeriods: string[];
  cautionPeriods: string[];
};

export type FinanceAnalysis = {
  overview: string;
  earningPotential: string;
  investmentAdvice: string[];
  favorablePeriods: string[];
  cautionPeriods: string[];
  wealthFactors: string[];
};

export type RelationshipAnalysis = {
  overview: string;
  marriageTiming: string;
  relationshipTips: string[];
  partnerCharacteristics: string[];
  challenges: string[];
  favorablePeriods: string[];
};

export type EducationAnalysis = {
  overview: string;
  suitableFields: string[];
  learningStyle: string;
  favorablePeriods: string[];
  recommendations: string[];
};

export type FamilyAnalysis = {
  overview: string;
  familyRelations: string;
  children: string;
  familyTips: string[];
  favorablePeriods: string[];
};

export type SpiritualAnalysis = {
  overview: string;
  spiritualPath: string;
  practices: string[];
  favorablePeriods: string[];
  insights: string[];
};

export type YearlyPrediction = {
  year: number;
  overview: string;
  career: string;
  health: string;
  finance: string;
  relationships: string;
  importantMonths: { month: string; event: string }[];
};

export type LuckyElements = {
  colors: string[];
  numbers: number[];
  directions: string[];
  gemstones: string[];
  metals: string[];
  days: string[];
};

/**
 * Analyze personality based on Ascendant, Moon Sign, and planetary positions
 */
export function analyzePersonality(
  kundli: KundliResult,
  chart?: KundliChart
): PersonalityAnalysis {
  const ascendant = kundli.ascendant;
  const moonSign = kundli.rashi;
  const sunPlanet = kundli.planets.find(p => p.name === "Sun");
  const moonPlanet = kundli.planets.find(p => p.name === "Moon");
  
  const traits: string[] = [];
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const characteristics: string[] = [];
  
  // Ascendant-based traits
  const ascendantTraits: Record<string, { traits: string[]; strengths: string[] }> = {
    "Aries": { 
      traits: ["Dynamic", "Energetic", "Courageous", "Impulsive"], 
      strengths: ["Leadership", "Initiative", "Bravery", "Enthusiasm"] 
    },
    "Taurus": { 
      traits: ["Stable", "Practical", "Determined", "Materialistic"], 
      strengths: ["Reliability", "Patience", "Persistence", "Financial acumen"] 
    },
    "Gemini": { 
      traits: ["Curious", "Communicative", "Adaptable", "Restless"], 
      strengths: ["Intelligence", "Communication skills", "Versatility", "Quick learning"] 
    },
    "Cancer": { 
      traits: ["Emotional", "Intuitive", "Caring", "Moody"], 
      strengths: ["Nurturing nature", "Intuition", "Loyalty", "Empathy"] 
    },
    "Leo": { 
      traits: ["Confident", "Charismatic", "Proud", "Dominating"], 
      strengths: ["Charisma", "Leadership", "Creativity", "Confidence"] 
    },
    "Virgo": { 
      traits: ["Analytical", "Perfectionist", "Practical", "Critical"], 
      strengths: ["Attention to detail", "Practicality", "Organization", "Analytical skills"] 
    },
    "Libra": { 
      traits: ["Diplomatic", "Balanced", "Social", "Indecisive"], 
      strengths: ["Diplomacy", "Harmony", "Social skills", "Aesthetic sense"] 
    },
    "Scorpio": { 
      traits: ["Intense", "Mysterious", "Passionate", "Secretive"], 
      strengths: ["Determination", "Intensity", "Intuition", "Resourcefulness"] 
    },
    "Sagittarius": { 
      traits: ["Optimistic", "Adventurous", "Philosophical", "Restless"], 
      strengths: ["Optimism", "Adventure", "Philosophy", "Freedom-loving"] 
    },
    "Capricorn": { 
      traits: ["Ambitious", "Disciplined", "Practical", "Reserved"], 
      strengths: ["Ambition", "Discipline", "Patience", "Long-term planning"] 
    },
    "Aquarius": { 
      traits: ["Independent", "Innovative", "Humanitarian", "Unconventional"], 
      strengths: ["Innovation", "Independence", "Humanitarianism", "Originality"] 
    },
    "Pisces": { 
      traits: ["Compassionate", "Imaginative", "Intuitive", "Escapist"], 
      strengths: ["Compassion", "Creativity", "Intuition", "Empathy"] 
    },
  };
  
  const ascData = ascendantTraits[ascendant] || ascendantTraits["Aries"];
  traits.push(...ascData.traits);
  strengths.push(...ascData.strengths);
  
  // Moon sign influence on emotions
  if (moonPlanet) {
    const moonTraits = ascendantTraits[moonSign] || {};
    characteristics.push(`Emotional nature influenced by ${moonSign}`);
    if (moonPlanet.house === 1) {
      characteristics.push("Strong emotional expression");
    }
    if (moonPlanet.retrograde) {
      characteristics.push("Internalized emotions, deep introspection");
    }
  }
  
  // Sun placement influence
  if (sunPlanet) {
    if (sunPlanet.house === 10) {
      strengths.push("Natural leadership and career success");
    }
    if (sunPlanet.house === 1) {
      strengths.push("Strong personality and self-confidence");
    }
    if (sunPlanet.retrograde) {
      weaknesses.push("May struggle with self-expression");
    }
  }
  
  // Jupiter placement (Guru)
  const jupiter = kundli.planets.find(p => p.name === "Jupiter");
  if (jupiter) {
    if (jupiter.house === 1 || jupiter.house === 5 || jupiter.house === 9) {
      strengths.push("Wisdom and spiritual inclination");
    }
  }
  
  // Mars influence
  const mars = kundli.planets.find(p => p.name === "Mars");
  if (mars) {
    if (mars.house === 1 || mars.house === 3 || mars.house === 10) {
      strengths.push("Courage and determination");
    } else {
      weaknesses.push("May have tendency towards anger or impulsiveness");
    }
  }
  
  // Venus influence (relationships and aesthetics)
  const venus = kundli.planets.find(p => p.name === "Venus");
  if (venus) {
    if (venus.house === 1 || venus.house === 7 || venus.house === 10) {
      strengths.push("Charm, diplomacy, and relationship skills");
    }
  }
  
  // Nature and behavior
  let nature = "Balanced";
  let behavior = "Adaptable";
  
  if (sunPlanet && moonPlanet) {
    const fireSigns = ["Aries", "Leo", "Sagittarius"];
    const earthSigns = ["Taurus", "Virgo", "Capricorn"];
    const airSigns = ["Gemini", "Libra", "Aquarius"];
    const waterSigns = ["Cancer", "Scorpio", "Pisces"];
    
    const sunElement = fireSigns.includes(sunPlanet.sign) ? "fire" :
                      earthSigns.includes(sunPlanet.sign) ? "earth" :
                      airSigns.includes(sunPlanet.sign) ? "air" : "water";
    
    if (sunElement === "fire") nature = "Energetic and action-oriented";
    if (sunElement === "earth") nature = "Practical and grounded";
    if (sunElement === "air") nature = "Intellectual and communicative";
    if (sunElement === "water") nature = "Emotional and intuitive";
    
    behavior = `${nature}. Influenced by ${moonSign} moon sign.`;
  }
  
  return {
    traits: [...new Set(traits)],
    strengths: [...new Set(strengths)],
    weaknesses: [...new Set(weaknesses)],
    characteristics: [...new Set(characteristics)],
    nature,
    behavior,
  };
}

/**
 * Analyze career prospects
 */
export function analyzeCareer(
  kundli: KundliResult,
  chart?: KundliChart
): CareerAnalysis {
  const planets = kundli.planets;
  const tenthHouse = planets.filter(p => p.house === 10);
  const sixthHouse = planets.filter(p => p.house === 6);
  const eleventhHouse = planets.filter(p => p.house === 11);
  
  const suitableProfessions: string[] = [];
  const careerTips: string[] = [];
  const challenges: string[] = [];
  const growthAreas: string[] = [];
  
  // Tenth house analysis (Career)
  if (tenthHouse.length > 0) {
    tenthHouse.forEach(planet => {
      switch (planet.name) {
        case "Sun":
          suitableProfessions.push("Government service", "Administration", "Leadership roles", "Politics");
          break;
        case "Moon":
          suitableProfessions.push("Public service", "Hospitality", "Media", "Nursing");
          break;
        case "Mars":
          suitableProfessions.push("Engineering", "Military", "Police", "Sports", "Mechanical work");
          break;
        case "Mercury":
          suitableProfessions.push("Business", "Writing", "Teaching", "Communication", "IT");
          break;
        case "Jupiter":
          suitableProfessions.push("Education", "Law", "Banking", "Finance", "Spiritual guidance");
          break;
        case "Venus":
          suitableProfessions.push("Arts", "Entertainment", "Fashion", "Beauty", "Design");
          break;
        case "Saturn":
          suitableProfessions.push("Hardware", "Construction", "Real estate", "Mining", "Agriculture");
          break;
      }
    });
  } else {
    suitableProfessions.push("Various fields based on planetary strength", "Service-oriented professions");
  }
  
  // Analyze career potential
  let overview = "Your 10th house analysis indicates ";
  if (tenthHouse.length === 0) {
    overview += "moderate career prospects with steady growth. Focus on building expertise and maintaining professional relationships.";
  } else if (tenthHouse.length === 1) {
    const planet = tenthHouse[0];
    overview += `strong career potential influenced by ${planet.name}. You have natural inclination towards your chosen field.`;
  } else {
    overview += "multiple career opportunities. You may excel in various fields or have career changes.";
  }
  
  // Jupiter in 10th house
  if (tenthHouse.find(p => p.name === "Jupiter")) {
    careerTips.push("Career growth through education and knowledge");
    growthAreas.push("Teaching, consulting, advisory roles");
  }
  
  // Mercury in 10th house
  if (tenthHouse.find(p => p.name === "Mercury")) {
    careerTips.push("Success in business, communication, and technology");
    growthAreas.push("Entrepreneurship, media, IT sectors");
  }
  
  // Saturn in 10th house
  if (tenthHouse.find(p => p.name === "Saturn")) {
    careerTips.push("Career success through hard work and persistence");
    challenges.push("Delays in early career, success comes with experience");
  }
  
  // Sixth house (Service, work environment)
  if (sixthHouse.length > 0) {
    careerTips.push("Good working relationships with colleagues");
    challenges.push("May face competition at workplace");
  }
  
  // Eleventh house (Income, gains)
  if (eleventhHouse.length > 0) {
    growthAreas.push("Strong potential for income growth");
    careerTips.push("Networking and partnerships will benefit career");
  }
  
  // Favorable periods
  const favorablePeriods: string[] = [];
  if (chart?.dasha) {
    const currentDasha = chart.dasha.current;
    if (currentDasha.includes("Jupiter") || currentDasha.includes("Venus") || currentDasha.includes("Mercury")) {
      favorablePeriods.push(`Current ${currentDasha} dasha is favorable for career growth`);
    }
  }
  favorablePeriods.push("Jupiter and Venus periods bring career opportunities");
  favorablePeriods.push("Mercury periods favor business and communication-related careers");
  
  return {
    overview,
    suitableProfessions: [...new Set(suitableProfessions)].slice(0, 8),
    careerTips: [...new Set(careerTips)],
    favorablePeriods,
    challenges: [...new Set(challenges)],
    growthAreas: [...new Set(growthAreas)],
  };
}

/**
 * Analyze health
 */
export function analyzeHealth(
  kundli: KundliResult,
  chart?: KundliChart
): HealthAnalysis {
  const planets = kundli.planets;
  const firstHouse = planets.filter(p => p.house === 1);
  const sixthHouse = planets.filter(p => p.house === 6);
  const eighthHouse = planets.filter(p => p.house === 8);
  
  const potentialIssues: string[] = [];
  const preventiveMeasures: string[] = [];
  const healthTips: string[] = [];
  const cautionPeriods: string[] = [];
  
  // First house (Health, constitution)
  let overview = "Your overall health is ";
  if (firstHouse.length === 0) {
    overview += "generally good with moderate constitution. Regular exercise and balanced diet are important.";
  } else {
    const firstHousePlanets = firstHouse.map(p => p.name).join(", ");
    overview += `influenced by ${firstHousePlanets} in the ascendant.`;
    
    if (firstHouse.find(p => p.name === "Mars")) {
      healthTips.push("Strong physical constitution and energy");
      potentialIssues.push("May be prone to inflammation or accidents");
      preventiveMeasures.push("Avoid risky activities, maintain cooling diet");
    }
    if (firstHouse.find(p => p.name === "Saturn")) {
      potentialIssues.push("May have bone or joint issues");
      preventiveMeasures.push("Regular exercise, calcium-rich diet");
    }
  }
  
  // Sixth house (Diseases, health)
  if (sixthHouse.length > 0) {
    if (sixthHouse.find(p => p.name === "Mars")) {
      healthTips.push("Strong immunity and recovery power");
    } else {
      potentialIssues.push("May need to be careful about digestive health");
      preventiveMeasures.push("Maintain proper diet and digestion");
    }
  } else {
    healthTips.push("Generally good health with proper care");
  }
  
  // Eighth house (Longevity, chronic issues)
  if (eighthHouse.length > 0) {
    cautionPeriods.push("Eighth house planets may indicate periods requiring health caution");
    preventiveMeasures.push("Regular health check-ups are important");
  }
  
  // Planet-specific health concerns
  const sun = planets.find(p => p.name === "Sun");
  if (sun?.house === 6 || sun?.house === 8) {
    potentialIssues.push("Eye or heart-related concerns");
    preventiveMeasures.push("Regular eye and heart check-ups");
  }
  
  const moon = planets.find(p => p.name === "Moon");
  if (moon?.house === 6 || moon?.house === 8) {
    potentialIssues.push("Mental health or digestive concerns");
    healthTips.push("Maintain mental peace, practice meditation");
  }
  
  const mars = planets.find(p => p.name === "Mars");
  if (mars?.house === 6 || mars?.house === 8) {
    potentialIssues.push("Accidents, injuries, or blood-related issues");
    preventiveMeasures.push("Be cautious in activities, avoid risky situations");
  }
  
  // General health tips
  healthTips.push("Regular exercise and yoga");
  healthTips.push("Balanced diet with seasonal fruits and vegetables");
  healthTips.push("Adequate sleep and rest");
  healthTips.push("Stress management through meditation");
  
  // Favorable periods
  const favorablePeriods: string[] = [];
  favorablePeriods.push("Jupiter periods bring better health");
  favorablePeriods.push("Sun periods improve overall vitality");
  
  return {
    overview,
    potentialIssues: [...new Set(potentialIssues)],
    preventiveMeasures: [...new Set(preventiveMeasures)],
    healthTips: [...new Set(healthTips)],
    favorablePeriods,
    cautionPeriods: [...new Set(cautionPeriods)],
  };
}

/**
 * Analyze finance and wealth
 */
export function analyzeFinance(
  kundli: KundliResult,
  chart?: KundliChart
): FinanceAnalysis {
  const planets = kundli.planets;
  const secondHouse = planets.filter(p => p.house === 2);
  const eighthHouse = planets.filter(p => p.house === 8);
  const eleventhHouse = planets.filter(p => p.house === 11);
  
  const investmentAdvice: string[] = [];
  const wealthFactors: string[] = [];
  
  // Second house (Wealth, finances)
  let overview = "Your financial situation is ";
  let earningPotential = "Moderate";
  
  if (secondHouse.length > 0) {
    const secondHousePlanets = secondHouse.map(p => p.name).join(", ");
    overview += `influenced by ${secondHousePlanets} in the wealth house.`;
    
    if (secondHouse.find(p => p.name === "Jupiter" || p.name === "Venus")) {
      earningPotential = "Good";
      wealthFactors.push("Strong wealth accumulation potential");
      investmentAdvice.push("Long-term investments will be beneficial");
    }
    if (secondHouse.find(p => p.name === "Mercury")) {
      earningPotential = "Good through business";
      wealthFactors.push("Business and communication skills bring wealth");
    }
    if (secondHouse.find(p => p.name === "Saturn")) {
      earningPotential = "Steady with hard work";
      investmentAdvice.push("Focus on stable investments, avoid speculation");
    }
  } else {
    overview += "moderate with steady growth potential. Focus on stable investments and avoid speculation.";
  }
  
  // Eleventh house (Gains, income)
  if (eleventhHouse.length > 0) {
    if (eleventhHouse.find(p => p.name === "Jupiter" || p.name === "Venus")) {
      earningPotential = "Excellent";
      wealthFactors.push("Strong income potential and gains");
    }
    investmentAdvice.push("Networking and partnerships will benefit financially");
  }
  
  // Eighth house (Unexpected gains/losses)
  if (eighthHouse.length > 0) {
    wealthFactors.push("May have unexpected financial gains or losses");
    investmentAdvice.push("Be cautious with investments, avoid risky ventures");
  }
  
  // General investment advice
  investmentAdvice.push("Diversify investments");
  investmentAdvice.push("Focus on long-term financial planning");
  investmentAdvice.push("Avoid impulsive financial decisions");
  investmentAdvice.push("Consult financial advisor for major investments");
  
  // Favorable periods
  const favorablePeriods: string[] = [];
  if (chart?.dasha) {
    const currentDasha = chart.dasha.current;
    if (currentDasha.includes("Jupiter") || currentDasha.includes("Venus")) {
      favorablePeriods.push(`Current ${currentDasha} dasha is favorable for financial growth`);
    }
  }
  favorablePeriods.push("Jupiter and Venus periods bring financial opportunities");
  favorablePeriods.push("Mercury periods favor business and investments");
  
  // Caution periods
  const cautionPeriods: string[] = [];
  cautionPeriods.push("Saturn periods require financial discipline");
  cautionPeriods.push("Be cautious during Rahu-Ketu periods");
  
  return {
    overview,
    earningPotential,
    investmentAdvice: [...new Set(investmentAdvice)],
    favorablePeriods,
    cautionPeriods,
    wealthFactors: [...new Set(wealthFactors)],
  };
}

/**
 * Analyze relationships and marriage
 */
export function analyzeRelationships(
  kundli: KundliResult,
  dosha?: DoshaAnalysis,
  chart?: KundliChart
): RelationshipAnalysis {
  const planets = kundli.planets;
  const seventhHouse = planets.filter(p => p.house === 7);
  const venus = planets.find(p => p.name === "Venus");
  const mars = planets.find(p => p.name === "Mars");
  
  const relationshipTips: string[] = [];
  const partnerCharacteristics: string[] = [];
  const challenges: string[] = [];
  
  // Seventh house analysis (Marriage, partnerships)
  let overview = "Your relationships are ";
  let marriageTiming = "Favorable periods for marriage are Jupiter and Venus dashas. Consult expert for specific timing.";
  
  if (seventhHouse.length > 0) {
    const seventhHousePlanets = seventhHouse.map(p => p.name).join(", ");
    overview += `influenced by ${seventhHousePlanets} in the marriage house.`;
    
    if (seventhHouse.find(p => p.name === "Venus")) {
      relationshipTips.push("Harmonious and beautiful relationships");
      partnerCharacteristics.push("Charming and aesthetically inclined partner");
    }
    if (seventhHouse.find(p => p.name === "Jupiter")) {
      relationshipTips.push("Spiritual and growth-oriented relationships");
      partnerCharacteristics.push("Wise and supportive partner");
    }
    if (seventhHouse.find(p => p.name === "Mars")) {
      challenges.push("May have conflicts in relationships");
      relationshipTips.push("Practice patience and understanding");
    }
    if (seventhHouse.find(p => p.name === "Saturn")) {
      challenges.push("Delays in marriage possible");
      relationshipTips.push("Late but stable marriage");
    }
  } else {
    overview += "balanced. Venus placement indicates appreciation for beauty and harmony in partnerships.";
  }
  
  // Venus placement
  if (venus) {
    if (venus.house === 1 || venus.house === 7) {
      relationshipTips.push("Strong attraction and charm in relationships");
      partnerCharacteristics.push("Attractive and harmonious partner");
    }
    if (venus.retrograde) {
      challenges.push("May have challenges expressing love or emotions");
    }
  }
  
  // Manglik dosha impact
  if (dosha?.manglik?.status === "Manglik") {
    challenges.push("Manglik dosha present - may cause delays in marriage");
    relationshipTips.push("Follow recommended Manglik remedies");
    marriageTiming = "Marriage timing should be carefully planned. Consult expert astrologer for best timing.";
  }
  
  // General relationship tips
  relationshipTips.push("Communication and understanding are key");
  relationshipTips.push("Respect and support your partner");
  relationshipTips.push("Maintain balance between independence and togetherness");
  
  // Favorable periods
  const favorablePeriods: string[] = [];
  if (chart?.dasha) {
    const currentDasha = chart.dasha.current;
    if (currentDasha.includes("Venus") || currentDasha.includes("Jupiter")) {
      favorablePeriods.push(`Current ${currentDasha} dasha is favorable for relationships`);
    }
  }
  favorablePeriods.push("Venus and Jupiter periods bring relationship harmony");
  favorablePeriods.push("Consult expert for specific marriage timing");
  
  return {
    overview,
    marriageTiming,
    relationshipTips: [...new Set(relationshipTips)],
    partnerCharacteristics: [...new Set(partnerCharacteristics)],
    challenges: [...new Set(challenges)],
    favorablePeriods,
  };
}

/**
 * Analyze education
 */
export function analyzeEducation(
  kundli: KundliResult,
  chart?: KundliChart
): EducationAnalysis {
  const planets = kundli.planets;
  const fourthHouse = planets.filter(p => p.house === 4);
  const fifthHouse = planets.filter(p => p.house === 5);
  const ninthHouse = planets.filter(p => p.house === 9);
  const mercury = planets.find(p => p.name === "Mercury");
  const jupiter = planets.find(p => p.name === "Jupiter");
  
  const suitableFields: string[] = [];
  const recommendations: string[] = [];
  
  // Fifth house (Education, intelligence)
  let overview = "Your educational prospects are ";
  let learningStyle = "Balanced";
  
  if (fifthHouse.length > 0) {
    if (fifthHouse.find(p => p.name === "Jupiter")) {
      overview += "excellent with strong academic potential. Higher education is favorable.";
      learningStyle = "Deep and analytical";
      suitableFields.push("Higher education", "Research", "Philosophy", "Law", "Spiritual studies");
    }
    if (fifthHouse.find(p => p.name === "Mercury")) {
      overview += "good with quick learning ability. Communication and technology fields suit you.";
      learningStyle = "Quick and adaptable";
      suitableFields.push("Communication", "Technology", "Languages", "Business studies");
    }
    if (fifthHouse.find(p => p.name === "Venus")) {
      suitableFields.push("Arts", "Design", "Aesthetics", "Fine arts");
    }
  } else {
    overview += "moderate. Focus on consistent efforts and building strong foundation.";
  }
  
  // Fourth house (Early education, home)
  if (fourthHouse.length > 0) {
    recommendations.push("Strong foundation in early education");
  }
  
  // Ninth house (Higher education, wisdom)
  if (ninthHouse.length > 0) {
    if (ninthHouse.find(p => p.name === "Jupiter")) {
      suitableFields.push("Higher studies", "Philosophy", "Religion", "Spiritual studies");
      recommendations.push("Higher education will be beneficial");
    }
  }
  
  // Mercury influence
  if (mercury) {
    if (mercury.house === 1 || mercury.house === 5 || mercury.house === 9) {
      recommendations.push("Excellent communication and learning skills");
      suitableFields.push("Literature", "Journalism", "Teaching");
    }
  }
  
  // Jupiter influence
  if (jupiter) {
    if (jupiter.house === 1 || jupiter.house === 5 || jupiter.house === 9) {
      recommendations.push("Strong analytical and research abilities");
      learningStyle = "In-depth and comprehensive";
    }
  }
  
  // General recommendations
  recommendations.push("Focus on areas of natural interest");
  recommendations.push("Build strong foundation in chosen field");
  recommendations.push("Continuous learning and skill development");
  
  // Favorable periods
  const favorablePeriods: string[] = [];
  favorablePeriods.push("Jupiter and Mercury periods favor education");
  favorablePeriods.push("Fourth, fifth, and ninth house transits bring educational opportunities");
  
  return {
    overview,
    suitableFields: [...new Set(suitableFields)].slice(0, 8),
    learningStyle,
    favorablePeriods,
    recommendations: [...new Set(recommendations)],
  };
}

/**
 * Get lucky elements
 */
export function getLuckyElements(
  kundli: KundliResult,
  chart?: KundliChart
): LuckyElements {
  const ascendant = kundli.ascendant;
  const moonSign = kundli.rashi;
  const sunPlanet = kundli.planets.find(p => p.name === "Sun");
  
  // Sign-based colors
  const signColors: Record<string, string[]> = {
    "Aries": ["Red", "Orange"],
    "Taurus": ["Pink", "White", "Light Blue"],
    "Gemini": ["Yellow", "Green"],
    "Cancer": ["White", "Silver", "Sea Green"],
    "Leo": ["Orange", "Gold", "Red"],
    "Virgo": ["Green", "Brown", "Mustard"],
    "Libra": ["Pink", "White", "Light Blue"],
    "Scorpio": ["Red", "Maroon", "Black"],
    "Sagittarius": ["Yellow", "Orange", "Red"],
    "Capricorn": ["Brown", "Black", "Dark Blue"],
    "Aquarius": ["Blue", "Indigo", "Electric Blue"],
    "Pisces": ["Sea Green", "White", "Silver"],
  };
  
  const colors = signColors[ascendant] || signColors[moonSign] || ["White", "Blue"];
  
  // Numbers based on planets
  const numbers: number[] = [];
  const planets = kundli.planets;
  if (planets.find(p => p.name === "Sun")) numbers.push(1, 4);
  if (planets.find(p => p.name === "Moon")) numbers.push(2, 7);
  if (planets.find(p => p.name === "Mars")) numbers.push(3, 9);
  if (planets.find(p => p.name === "Mercury")) numbers.push(5, 8);
  if (planets.find(p => p.name === "Jupiter")) numbers.push(3, 9);
  if (planets.find(p => p.name === "Venus")) numbers.push(6, 7);
  if (planets.find(p => p.name === "Saturn")) numbers.push(8, 9);
  
  // Directions
  const directions: string[] = [];
  if (sunPlanet) {
    if (sunPlanet.house <= 3) directions.push("East");
    if (sunPlanet.house >= 4 && sunPlanet.house <= 6) directions.push("South");
    if (sunPlanet.house >= 7 && sunPlanet.house <= 9) directions.push("West");
    if (sunPlanet.house >= 10) directions.push("North");
  }
  
  // Gemstones
  const gemstones: string[] = [];
  planets.forEach(planet => {
    switch (planet.name) {
      case "Sun": gemstones.push("Ruby"); break;
      case "Moon": gemstones.push("Pearl"); break;
      case "Mars": gemstones.push("Red Coral"); break;
      case "Mercury": gemstones.push("Emerald"); break;
      case "Jupiter": gemstones.push("Yellow Sapphire"); break;
      case "Venus": gemstones.push("Diamond"); break;
      case "Saturn": gemstones.push("Blue Sapphire"); break;
    }
  });
  
  // Metals
  const metals: string[] = [];
  if (sunPlanet) metals.push("Gold");
  if (planets.find(p => p.name === "Moon")) metals.push("Silver");
  if (planets.find(p => p.name === "Mercury")) metals.push("Copper");
  
  // Days
  const days: string[] = [];
  if (sunPlanet) days.push("Sunday");
  if (planets.find(p => p.name === "Moon")) days.push("Monday");
  if (planets.find(p => p.name === "Mars")) days.push("Tuesday");
  if (planets.find(p => p.name === "Mercury")) days.push("Wednesday");
  if (planets.find(p => p.name === "Jupiter")) days.push("Thursday");
  if (planets.find(p => p.name === "Venus")) days.push("Friday");
  if (planets.find(p => p.name === "Saturn")) days.push("Saturday");
  
  return {
    colors: [...new Set(colors)],
    numbers: [...new Set(numbers)].slice(0, 5),
    directions: [...new Set(directions)] || ["East"],
    gemstones: [...new Set(gemstones)].slice(0, 5),
    metals: [...new Set(metals)] || ["Gold"],
    days: [...new Set(days)].slice(0, 5),
  };
}

/**
 * Generate yearly prediction
 */
export function generateYearlyPrediction(
  kundli: KundliResult,
  year: number,
  chart?: KundliChart
): YearlyPrediction {
  const currentDasha = chart?.dasha?.current || "Unknown";
  
  return {
    year,
    overview: `The year ${year} brings a mix of opportunities and challenges. Your current ${currentDasha} dasha period influences various aspects of life. Focus on maintaining balance and making informed decisions.`,
    career: "Career prospects show steady growth. Focus on skill development and building professional relationships. New opportunities may arise in the second half of the year.",
    health: "Overall health remains stable with proper care. Regular exercise and balanced diet are important. Be cautious during seasonal changes.",
    finance: "Financial situation shows improvement. Stable investments are favorable. Avoid risky ventures and focus on long-term planning.",
    relationships: "Relationships show harmony and understanding. Communication is key to maintaining strong bonds. Favorable periods for important decisions.",
    importantMonths: [
      { month: "April-May", event: "Favorable for career and financial decisions" },
      { month: "August-September", event: "Good for relationships and partnerships" },
      { month: "November-December", event: "Period of reflection and planning" },
    ],
  };
}

