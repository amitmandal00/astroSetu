import { NextResponse } from "next/server";
import type { KundliResult } from "@/types/astrology";

function generateLalKitabReport(kundli: KundliResult) {
  const introduction = `Lal Kitab is a unique system of Vedic astrology that provides simple and effective remedies for planetary issues. Unlike traditional astrology, Lal Kitab focuses on practical solutions using everyday items and simple rituals. Based on your planetary positions, this report provides specific Lal Kitab remedies and predictions.`;

  // Planetary Analysis - Detailed for each planet
  const planetaryAnalysis = kundli.planets.map((planet) => {
    const house = planet.house;
    const sign = planet.sign;
    
    // Get Lal Kitab predictions based on house position
    const predictions = getLalKitabPlanetPrediction(planet.name, house, sign);
    const remedy = getLalKitabRemedy(planet.name, house);
    
    return {
      planet: planet.name,
      house,
      sign,
      prediction: predictions.prediction,
      remedy: remedy.remedy,
      item: remedy.item,
      timing: remedy.timing
    };
  });

  // House Analysis - For houses with planets
  const houseAnalysis = Array.from({ length: 12 }, (_, i) => i + 1).map((houseNum) => {
    const planetsInHouse = kundli.planets.filter(p => p.house === houseNum);
    if (planetsInHouse.length === 0) return null;
    
    return {
      house: houseNum,
      planets: planetsInHouse.map(p => p.name),
      prediction: getHousePrediction(houseNum, planetsInHouse.map(p => p.name)),
      remedies: getHouseRemedies(houseNum, planetsInHouse.map(p => p.name))
    };
  }).filter(Boolean) as Array<{
    house: number;
    planets: string[];
    prediction: string;
    remedies: string[];
  }>;

  // Area-wise Predictions
  const predictions = [
    {
      area: "Career & Profession",
      prediction: getCareerPrediction(kundli),
      period: "Current Period",
      remedies: getCareerRemedies(kundli)
    },
    {
      area: "Health & Wellbeing",
      prediction: getHealthPrediction(kundli),
      period: "Current Period",
      remedies: getHealthRemedies(kundli)
    },
    {
      area: "Relationships & Marriage",
      prediction: getRelationshipPrediction(kundli),
      period: "Current Period",
      remedies: getRelationshipRemedies(kundli)
    },
    {
      area: "Finance & Wealth",
      prediction: getFinancePrediction(kundli),
      period: "Current Period",
      remedies: getFinanceRemedies(kundli)
    },
    {
      area: "Education & Learning",
      prediction: getEducationPrediction(kundli),
      period: "Current Period",
      remedies: getEducationRemedies(kundli)
    }
  ];

  // Detailed Remedies
  const remedies = [
    {
      type: "Donation",
      description: "Donate specific items to reduce negative planetary effects",
      item: getDonationItem(kundli),
      method: "Donate to temple, poor people, or charity",
      timing: "On specific days based on planet",
      duration: "As per Lal Kitab guidelines"
    },
    {
      type: "Feeding",
      description: "Feed specific animals or birds",
      item: getFeedingItem(kundli),
      method: "Feed daily or on specific days",
      timing: "Early morning or evening",
      duration: "Continue for specified period"
    },
    {
      type: "Wearing",
      description: "Wear or keep specific items",
      item: getWearingItem(kundli),
      method: "Wear as jewelry or keep in pocket",
      timing: "Always or specific times",
      duration: "As long as needed"
    },
    {
      type: "Chanting",
      description: "Chant specific mantras or prayers",
      item: "Mantra or prayer",
      method: "Chant daily with devotion",
      timing: "Early morning or evening",
      duration: "Daily practice"
    }
  ];

  // Special Remedies for specific issues
  const specialRemedies = [];
  
  // Check for Manglik Dosha
  const mars = kundli.planets.find(p => p.name === "Mars");
  if (mars && (mars.house === 1 || mars.house === 4 || mars.house === 7 || mars.house === 8 || mars.house === 12)) {
    specialRemedies.push({
      issue: "Manglik Dosha",
      remedy: "Lal Kitab remedy for Manglik Dosha",
      item: "Copper items, red items",
      method: "Donate copper on Tuesdays, wear copper ring"
    });
  }

  // Check for Shani effects
  const saturn = kundli.planets.find(p => p.name === "Saturn");
  if (saturn && (saturn.house === 1 || saturn.house === 4 || saturn.house === 7 || saturn.house === 8 || saturn.house === 12)) {
    specialRemedies.push({
      issue: "Shani Effects",
      remedy: "Lal Kitab remedy for Shani",
      item: "Black items, sesame, iron",
      method: "Donate black items on Saturdays, feed black animals"
    });
  }

  // Period-wise Predictions
  const predictionsByPeriod = [
    {
      period: "Next 6 Months",
      predictions: [
        { area: "Career", prediction: getPeriodPrediction(kundli, "6months", "career") },
        { area: "Health", prediction: getPeriodPrediction(kundli, "6months", "health") },
        { area: "Relationships", prediction: getPeriodPrediction(kundli, "6months", "relationships") },
        { area: "Finance", prediction: getPeriodPrediction(kundli, "6months", "finance") }
      ]
    },
    {
      period: "Next 1 Year",
      predictions: [
        { area: "Career", prediction: getPeriodPrediction(kundli, "1year", "career") },
        { area: "Health", prediction: getPeriodPrediction(kundli, "1year", "health") },
        { area: "Relationships", prediction: getPeriodPrediction(kundli, "1year", "relationships") },
        { area: "Finance", prediction: getPeriodPrediction(kundli, "1year", "finance") }
      ]
    },
    {
      period: "Next 2-3 Years",
      predictions: [
        { area: "Career", prediction: getPeriodPrediction(kundli, "2-3years", "career") },
        { area: "Health", prediction: getPeriodPrediction(kundli, "2-3years", "health") },
        { area: "Relationships", prediction: getPeriodPrediction(kundli, "2-3years", "relationships") },
        { area: "Finance", prediction: getPeriodPrediction(kundli, "2-3years", "finance") }
      ]
    }
  ];

  return {
    introduction,
    planetaryAnalysis,
    houseAnalysis,
    predictions,
    remedies,
    specialRemedies,
    predictionsByPeriod
  };
}

function getLalKitabPlanetPrediction(planet: string, house: number, sign: string): { prediction: string } {
  const predictions: Record<string, Record<number, string>> = {
    "Sun": {
      1: "Strong personality and leadership. May face ego issues.",
      2: "Good financial status. Speech may be harsh.",
      3: "Courageous and determined. Good relationship with siblings.",
      4: "Strong connection with mother. Property matters favorable.",
      5: "Creative and intelligent. Good relationship with children.",
      6: "Victory over enemies. Health may need attention.",
      7: "Strong partnerships. Spouse may be authoritative.",
      8: "Long life. May face obstacles and transformations.",
      9: "Spiritual inclination. Good relationship with father.",
      10: "Strong career and reputation. Leadership qualities.",
      11: "Good income and gains. Strong friendships.",
      12: "Spiritual pursuits. Expenses and losses possible."
    },
    "Moon": {
      1: "Emotional and sensitive nature. Good appearance.",
      2: "Wealth through family. Good speech.",
      3: "Close bond with siblings. Courageous.",
      4: "Strong mother connection. Property matters.",
      5: "Creative and intelligent. Good with children.",
      6: "Victory over enemies. Health attention needed.",
      7: "Emotional partnerships. Spouse may be caring.",
      8: "Longevity. Emotional transformations.",
      9: "Spiritual and philosophical. Good father relationship.",
      10: "Career in public service. Good reputation.",
      11: "Income through various sources. Good friendships.",
      12: "Spiritual pursuits. Expenses possible."
    },
    "Mars": {
      1: "Energetic and courageous. May be aggressive.",
      2: "Wealth through hard work. Speech may be sharp.",
      3: "Strong siblings bond. Very courageous.",
      4: "Property matters. Mother may be strong-willed.",
      5: "Creative and passionate. Good with children.",
      6: "Victory over enemies. Health needs attention.",
      7: "Passionate partnerships. Spouse may be energetic.",
      8: "Long life. May face accidents.",
      9: "Spiritual warrior. Good father relationship.",
      10: "Career in military or sports. Strong leadership.",
      11: "Income through hard work. Strong friendships.",
      12: "Spiritual warrior. Expenses possible."
    }
  };

  const planetPredictions = predictions[planet] || {};
  const prediction = planetPredictions[house] || `Planet ${planet} in House ${house} (${sign}) influences various aspects of life. Follow Lal Kitab remedies for best results.`;

  return { prediction };
}

function getLalKitabRemedy(planet: string, house: number): { remedy: string; item: string; timing: string } {
  const remedies: Record<string, Record<number, { remedy: string; item: string; timing: string }>> = {
    "Sun": {
      1: { remedy: "Donate copper on Sundays", item: "Copper items", timing: "Sunday mornings" },
      2: { remedy: "Donate wheat and jaggery", item: "Wheat, jaggery", timing: "Sunday mornings" },
      4: { remedy: "Donate red items", item: "Red clothes, red flowers", timing: "Sunday mornings" },
      8: { remedy: "Donate copper and red items", item: "Copper, red items", timing: "Sunday mornings" },
      12: { remedy: "Donate to temples", item: "Money, items", timing: "Sunday mornings" }
    },
    "Moon": {
      1: { remedy: "Donate white items on Mondays", item: "White clothes, milk", timing: "Monday mornings" },
      2: { remedy: "Donate rice and white items", item: "Rice, white items", timing: "Monday mornings" },
      4: { remedy: "Donate silver items", item: "Silver coins, items", timing: "Monday mornings" },
      8: { remedy: "Donate white items", item: "White clothes, milk", timing: "Monday mornings" },
      12: { remedy: "Donate to temples", item: "Money, items", timing: "Monday mornings" }
    },
    "Mars": {
      1: { remedy: "Donate red items on Tuesdays", item: "Red clothes, red lentils", timing: "Tuesday mornings" },
      2: { remedy: "Donate red items and copper", item: "Red items, copper", timing: "Tuesday mornings" },
      4: { remedy: "Donate red items", item: "Red clothes, red flowers", timing: "Tuesday mornings" },
      7: { remedy: "Donate red items", item: "Red clothes, red lentils", timing: "Tuesday mornings" },
      8: { remedy: "Donate red items and copper", item: "Red items, copper", timing: "Tuesday mornings" },
      12: { remedy: "Donate red items", item: "Red clothes, red lentils", timing: "Tuesday mornings" }
    },
    "Mercury": {
      1: { remedy: "Donate green items on Wednesdays", item: "Green clothes, green gram", timing: "Wednesday mornings" },
      2: { remedy: "Donate green items", item: "Green clothes, green gram", timing: "Wednesday mornings" },
      4: { remedy: "Donate green items and books", item: "Green items, books", timing: "Wednesday mornings" },
      5: { remedy: "Donate green items", item: "Green clothes, green gram", timing: "Wednesday mornings" },
      9: { remedy: "Donate green items and books", item: "Green items, books", timing: "Wednesday mornings" }
    },
    "Jupiter": {
      1: { remedy: "Donate yellow items on Thursdays", item: "Yellow clothes, yellow gram", timing: "Thursday mornings" },
      2: { remedy: "Donate yellow items and turmeric", item: "Yellow items, turmeric", timing: "Thursday mornings" },
      5: { remedy: "Donate yellow items and books", item: "Yellow items, books", timing: "Thursday mornings" },
      9: { remedy: "Donate yellow items and turmeric", item: "Yellow items, turmeric", timing: "Thursday mornings" },
      11: { remedy: "Donate yellow items", item: "Yellow clothes, yellow gram", timing: "Thursday mornings" }
    },
    "Venus": {
      1: { remedy: "Donate white items on Fridays", item: "White clothes, white items", timing: "Friday mornings" },
      2: { remedy: "Donate white items and silver", item: "White items, silver", timing: "Friday mornings" },
      4: { remedy: "Donate white items", item: "White clothes, white items", timing: "Friday mornings" },
      7: { remedy: "Donate white items and silver", item: "White items, silver", timing: "Friday mornings" },
      11: { remedy: "Donate white items", item: "White clothes, white items", timing: "Friday mornings" }
    },
    "Saturn": {
      1: { remedy: "Donate black items on Saturdays", item: "Black clothes, black sesame", timing: "Saturday mornings" },
      4: { remedy: "Donate black items and iron", item: "Black items, iron", timing: "Saturday mornings" },
      7: { remedy: "Donate black items", item: "Black clothes, black sesame", timing: "Saturday mornings" },
      8: { remedy: "Donate black items and iron", item: "Black items, iron", timing: "Saturday mornings" },
      12: { remedy: "Donate black items", item: "Black clothes, black sesame", timing: "Saturday mornings" }
    },
    "Rahu": {
      1: { remedy: "Donate blue items", item: "Blue clothes, items", timing: "Saturday evenings" },
      2: { remedy: "Donate blue items and black gram", item: "Blue items, black gram", timing: "Saturday evenings" },
      4: { remedy: "Donate blue items", item: "Blue clothes, items", timing: "Saturday evenings" },
      8: { remedy: "Donate blue items and black gram", item: "Blue items, black gram", timing: "Saturday evenings" },
      12: { remedy: "Donate blue items", item: "Blue clothes, items", timing: "Saturday evenings" }
    },
    "Ketu": {
      1: { remedy: "Donate brown items", item: "Brown clothes, items", timing: "Tuesday evenings" },
      2: { remedy: "Donate brown items", item: "Brown clothes, items", timing: "Tuesday evenings" },
      4: { remedy: "Donate brown items", item: "Brown clothes, items", timing: "Tuesday evenings" },
      8: { remedy: "Donate brown items", item: "Brown clothes, items", timing: "Tuesday evenings" },
      12: { remedy: "Donate brown items", item: "Brown clothes, items", timing: "Tuesday evenings" }
    }
  };

  const planetRemedies = remedies[planet] || {};
  const remedy = planetRemedies[house] || {
    remedy: `Follow general Lal Kitab remedies for ${planet}`,
    item: "Consult expert for specific items",
    timing: "As per Lal Kitab guidelines"
  };

  return remedy;
}

function getHousePrediction(house: number, planets: string[]): string {
  const houseMeanings: Record<number, string> = {
    1: "Personality, self, appearance, and health",
    2: "Wealth, family, speech, and food",
    3: "Siblings, courage, communication, and short journeys",
    4: "Mother, home, education, and property",
    5: "Children, creativity, intelligence, and education",
    6: "Health, enemies, service, and debts",
    7: "Marriage, partnerships, and business",
    8: "Longevity, obstacles, and transformation",
    9: "Fortune, father, spirituality, and higher learning",
    10: "Career, reputation, and status",
    11: "Income, gains, friends, and desires",
    12: "Expenses, losses, spirituality, and foreign lands"
  };

  const meaning = houseMeanings[house] || "Various life aspects";
  return `House ${house} (${meaning}) with planets ${planets.join(", ")} influences your life. Follow Lal Kitab remedies for planets in this house.`;
}

function getHouseRemedies(house: number, planets: string[]): string[] {
  const remedies: string[] = [];
  
  planets.forEach(planet => {
    const remedy = getLalKitabRemedy(planet, house);
    remedies.push(`${planet}: ${remedy.remedy} (${remedy.item})`);
  });

  return remedies.length > 0 ? remedies : ["Follow general house remedies"];
}

function getCareerPrediction(kundli: KundliResult): string {
  const house10 = kundli.planets.filter(p => p.house === 10);
  const house10Planets = house10.map(p => p.name);
  
  if (house10Planets.includes("Jupiter") || house10Planets.includes("Venus")) {
    return "Your career shows strong potential with favorable planetary positions. Focus on building expertise and maintaining professional relationships. Lal Kitab remedies will enhance career growth.";
  } else if (house10Planets.includes("Saturn") || house10Planets.includes("Mars")) {
    return "Your career may face some challenges. Follow Lal Kitab remedies to reduce negative effects and enhance positive outcomes. Patience and hard work will bring success.";
  } else {
    return "Your career shows moderate growth potential. Follow Lal Kitab remedies to enhance career prospects and overcome obstacles.";
  }
}

function getCareerRemedies(kundli: KundliResult): string[] {
  const house10 = kundli.planets.filter(p => p.house === 10);
  const remedies: string[] = [];
  
  house10.forEach(planet => {
    const remedy = getLalKitabRemedy(planet.name, 10);
    remedies.push(`${remedy.remedy} for ${planet.name}`);
  });

  return remedies.length > 0 ? remedies : ["Donate yellow items on Thursdays", "Worship Lord Vishnu"];
}

function getHealthPrediction(kundli: KundliResult): string {
  const house6 = kundli.planets.filter(p => p.house === 6);
  const house1 = kundli.planets.filter(p => p.house === 1);
  
  if (house6.length > 0 || house1.some(p => p.name === "Mars" || p.name === "Saturn")) {
    return "Your health requires attention. Follow Lal Kitab remedies to maintain good health and prevent diseases. Regular health check-ups are recommended.";
  } else {
    return "Your health appears stable. Follow Lal Kitab remedies to maintain good health and prevent future issues.";
  }
}

function getHealthRemedies(kundli: KundliResult): string[] {
  return [
    "Donate to health-related charities",
    "Feed animals and birds",
    "Maintain cleanliness",
    "Follow healthy lifestyle"
  ];
}

function getRelationshipPrediction(kundli: KundliResult): string {
  const house7 = kundli.planets.filter(p => p.house === 7);
  const venus = kundli.planets.find(p => p.name === "Venus");
  
  if (venus && venus.house === 7) {
    return "Your relationships show harmony and balance. Follow Lal Kitab remedies to enhance relationship happiness and maintain harmony.";
  } else if (house7.some(p => p.name === "Mars" || p.name === "Saturn")) {
    return "Your relationships may face some challenges. Follow Lal Kitab remedies to reduce negative effects and enhance relationship harmony.";
  } else {
    return "Your relationships show moderate potential. Follow Lal Kitab remedies to enhance relationship happiness and compatibility.";
  }
}

function getRelationshipRemedies(kundli: KundliResult): string[] {
  const house7 = kundli.planets.filter(p => p.house === 7);
  const remedies: string[] = [];
  
  house7.forEach(planet => {
    const remedy = getLalKitabRemedy(planet.name, 7);
    remedies.push(`${remedy.remedy} for ${planet.name}`);
  });

  return remedies.length > 0 ? remedies : ["Donate white items on Fridays", "Worship Goddess Lakshmi"];
}

function getFinancePrediction(kundli: KundliResult): string {
  const house2 = kundli.planets.filter(p => p.house === 2);
  const house11 = kundli.planets.filter(p => p.house === 11);
  
  if (house2.some(p => p.name === "Jupiter") || house11.some(p => p.name === "Jupiter")) {
    return "Your financial situation shows strong potential. Follow Lal Kitab remedies to enhance wealth and maintain financial stability.";
  } else if (house2.some(p => p.name === "Saturn") || house11.some(p => p.name === "Saturn")) {
    return "Your finances may face some delays. Follow Lal Kitab remedies to reduce obstacles and enhance financial growth.";
  } else {
    return "Your financial situation shows moderate potential. Follow Lal Kitab remedies to enhance wealth and financial stability.";
  }
}

function getFinanceRemedies(kundli: KundliResult): string[] {
  const house2 = kundli.planets.filter(p => p.house === 2);
  const remedies: string[] = [];
  
  house2.forEach(planet => {
    const remedy = getLalKitabRemedy(planet.name, 2);
    remedies.push(`${remedy.remedy} for ${planet.name}`);
  });

  return remedies.length > 0 ? remedies : ["Donate yellow items on Thursdays", "Worship Goddess Lakshmi"];
}

function getEducationPrediction(kundli: KundliResult): string {
  const house5 = kundli.planets.filter(p => p.house === 5);
  const house9 = kundli.planets.filter(p => p.house === 9);
  
  if (house5.some(p => p.name === "Mercury") || house9.some(p => p.name === "Jupiter")) {
    return "Your education shows strong potential. Follow Lal Kitab remedies to enhance learning and academic success.";
  } else {
    return "Your education shows good potential. Follow Lal Kitab remedies to enhance learning and academic achievements.";
  }
}

function getEducationRemedies(kundli: KundliResult): string[] {
  return [
    "Donate books and educational items",
    "Donate green items on Wednesdays",
    "Worship Goddess Saraswati",
    "Feed birds and animals"
  ];
}

function getDonationItem(kundli: KundliResult): string {
  const problematicPlanets = kundli.planets.filter(p => 
    p.house === 1 || p.house === 4 || p.house === 7 || p.house === 8 || p.house === 12
  );
  
  if (problematicPlanets.length > 0) {
    const planet = problematicPlanets[0];
    const remedy = getLalKitabRemedy(planet.name, planet.house);
    return remedy.item;
  }
  
  return "General items (clothes, food, money)";
}

function getFeedingItem(kundli: KundliResult): string {
  const mars = kundli.planets.find(p => p.name === "Mars");
  const saturn = kundli.planets.find(p => p.name === "Saturn");
  
  if (mars && (mars.house === 1 || mars.house === 4 || mars.house === 7 || mars.house === 8 || mars.house === 12)) {
    return "Red lentils, red items to animals";
  } else if (saturn && (saturn.house === 1 || saturn.house === 4 || saturn.house === 7 || saturn.house === 8 || saturn.house === 12)) {
    return "Black sesame, black items to animals";
  }
  
  return "General food items to animals and birds";
}

function getWearingItem(kundli: KundliResult): string {
  const lagnaLord = kundli.planets.find(p => {
    const ascendantRulers: Record<string, string> = {
      "Aries": "Mars", "Taurus": "Venus", "Gemini": "Mercury",
      "Cancer": "Moon", "Leo": "Sun", "Virgo": "Mercury",
      "Libra": "Venus", "Scorpio": "Mars", "Sagittarius": "Jupiter",
      "Capricorn": "Saturn", "Aquarius": "Saturn", "Pisces": "Jupiter"
    };
    return p.name === ascendantRulers[kundli.ascendant];
  });
  
  if (lagnaLord) {
    const planetItems: Record<string, string> = {
      "Sun": "Copper ring",
      "Moon": "Silver ring or pearl",
      "Mars": "Copper ring or coral",
      "Mercury": "Silver ring or emerald",
      "Jupiter": "Gold ring or yellow sapphire",
      "Venus": "Silver ring or diamond",
      "Saturn": "Iron ring or blue sapphire"
    };
    return planetItems[lagnaLord.name] || "Consult expert for specific item";
  }
  
  return "Consult expert for specific item";
}

function getPeriodPrediction(kundli: KundliResult, period: string, area: string): string {
  const predictions: Record<string, Record<string, string>> = {
    "6months": {
      "career": "The next 6 months bring opportunities for career growth. Follow Lal Kitab remedies to enhance positive outcomes.",
      "health": "Health requires attention in the coming months. Follow Lal Kitab remedies to maintain good health.",
      "relationships": "Relationships show positive trends. Follow Lal Kitab remedies to enhance harmony.",
      "finance": "Financial situation shows improvement. Follow Lal Kitab remedies to enhance wealth."
    },
    "1year": {
      "career": "This year brings significant career opportunities. Follow Lal Kitab remedies for best results.",
      "health": "Health remains stable with proper care. Follow Lal Kitab remedies to maintain wellness.",
      "relationships": "Relationships show growth and harmony. Follow Lal Kitab remedies to enhance happiness.",
      "finance": "Financial situation improves steadily. Follow Lal Kitab remedies to enhance wealth."
    },
    "2-3years": {
      "career": "The coming years bring long-term career growth. Follow Lal Kitab remedies for sustained success.",
      "health": "Health remains good with proper care. Follow Lal Kitab remedies to maintain wellness.",
      "relationships": "Relationships show stability and growth. Follow Lal Kitab remedies to enhance harmony.",
      "finance": "Financial situation shows steady growth. Follow Lal Kitab remedies to enhance wealth."
    }
  };

  return predictions[period]?.[area] || `Follow Lal Kitab remedies for ${area} in the ${period} period.`;
}

import { checkRateLimit, handleApiError, parseJsonBody, validateRequestSize } from "@/lib/apiHelpers";

export async function POST(req: Request) {
  try {
    // Rate limiting
    const rateLimitResponse = checkRateLimit(req, '/api/reports/lalkitab');
    if (rateLimitResponse) return rateLimitResponse;
    
    // Validate request size
    validateRequestSize(req.headers.get('content-length'), 50 * 1024); // 50KB max
    
    // Parse and validate request body
    const json = await parseJsonBody<Record<string, any>>(req);
    const { kundliData, name } = json;

    if (!kundliData || typeof kundliData !== 'object') {
      return NextResponse.json({ 
        ok: false, 
        error: "Kundli data is required" 
      }, { status: 400 });
    }

    const kundli = kundliData as KundliResult;
    const lalkitab = generateLalKitabReport(kundli);

    return NextResponse.json({
      ok: true,
      data: {
        kundli,
        lalkitab,
        userName: name || "User",
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
