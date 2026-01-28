import { NextResponse } from "next/server";
import type { KundliResult } from "@/types/astrology";

function generateAscendantAnalysis(kundli: KundliResult) {
  const ascendant = kundli.ascendant;
  const lagnaLordPlanet = kundli.planets.find(p => {
    // Find planet ruling the ascendant sign
    const ascendantRulers: Record<string, string> = {
      "Aries": "Mars",
      "Taurus": "Venus",
      "Gemini": "Mercury",
      "Cancer": "Moon",
      "Leo": "Sun",
      "Virgo": "Mercury",
      "Libra": "Venus",
      "Scorpio": "Mars",
      "Sagittarius": "Jupiter",
      "Capricorn": "Saturn",
      "Aquarius": "Saturn",
      "Pisces": "Jupiter"
    };
    return p.name === ascendantRulers[ascendant];
  });
  
  const lagnaLord = lagnaLordPlanet?.name || "Unknown";
  const lagnaLordHouse = lagnaLordPlanet?.house || 1;
  const lagnaLordSign = lagnaLordPlanet?.sign || ascendant;
  const lagnaLordDegree = lagnaLordPlanet?.degree || 0;

  // Get characteristics based on ascendant
  const characteristicsMap: Record<string, string[]> = {
    "Aries": ["Energetic and dynamic", "Natural leadership qualities", "Courageous and bold", "Impulsive nature", "Independent spirit", "Quick decision maker"],
    "Taurus": ["Stable and grounded", "Patient and determined", "Materialistic tendencies", "Loves comfort and luxury", "Strong willpower", "Practical approach"],
    "Gemini": ["Curious and intellectual", "Excellent communication skills", "Adaptable and versatile", "Restless nature", "Quick learner", "Social and friendly"],
    "Cancer": ["Emotional and sensitive", "Nurturing and caring", "Intuitive and psychic", "Moody nature", "Family-oriented", "Protective instincts"],
    "Leo": ["Confident and charismatic", "Creative and expressive", "Generous and warm-hearted", "Proud nature", "Natural leader", "Loves attention"],
    "Virgo": ["Analytical and detail-oriented", "Practical and methodical", "Perfectionist tendencies", "Service-minded", "Health-conscious", "Organized"],
    "Libra": ["Diplomatic and balanced", "Harmonious nature", "Aesthetic sense", "Indecisive at times", "Partnership-focused", "Fair and just"],
    "Scorpio": ["Intense and passionate", "Mysterious and secretive", "Transformative nature", "Deep emotions", "Strong willpower", "Investigative"],
    "Sagittarius": ["Optimistic and adventurous", "Philosophical and wise", "Restless and freedom-loving", "Honest and straightforward", "Love for travel", "Enthusiastic"],
    "Capricorn": ["Ambitious and disciplined", "Practical and realistic", "Reserved nature", "Goal-oriented", "Patient and persistent", "Traditional values"],
    "Aquarius": ["Innovative and independent", "Humanitarian and progressive", "Unconventional thinking", "Forward-looking", "Friendly and social", "Original ideas"],
    "Pisces": ["Compassionate and intuitive", "Artistic and creative", "Dreamy and imaginative", "Spiritually inclined", "Empathetic nature", "Sensitive"]
  };

  const strengthsMap: Record<string, string[]> = {
    "Aries": ["Natural leadership abilities", "High energy and drive", "Courage to take risks", "Quick action", "Competitive spirit"],
    "Taurus": ["Financial stability", "Reliability and consistency", "Strong determination", "Practical wisdom", "Steady progress"],
    "Gemini": ["Quick thinking and adaptability", "Versatility in skills", "Excellent communication", "Intellectual curiosity", "Social networking"],
    "Cancer": ["Emotional intelligence", "Nurturing abilities", "Strong intuition", "Family values", "Protective nature"],
    "Leo": ["Charisma and confidence", "Creative expression", "Natural leadership", "Generosity", "Positive energy"],
    "Virgo": ["Attention to detail", "Practical problem-solving", "Service orientation", "Analytical skills", "Efficiency"],
    "Libra": ["Diplomacy and balance", "Aesthetic sense", "Partnership skills", "Fair judgment", "Harmony creation"],
    "Scorpio": ["Deep insight and transformation", "Intense focus", "Resourcefulness", "Emotional depth", "Mystical understanding"],
    "Sagittarius": ["Optimism and wisdom", "Adventure spirit", "Philosophical understanding", "Honesty", "Enthusiasm"],
    "Capricorn": ["Ambition and discipline", "Long-term planning", "Practical approach", "Perseverance", "Achievement orientation"],
    "Aquarius": ["Innovation and originality", "Humanitarian values", "Future vision", "Independence", "Progressive thinking"],
    "Pisces": ["Compassion and empathy", "Artistic talent", "Spiritual depth", "Intuitive understanding", "Creative imagination"]
  };

  const challengesMap: Record<string, string[]> = {
    "Aries": ["Impatience and impulsiveness", "Need to control temper", "Tendency to be aggressive", "Lack of patience"],
    "Taurus": ["Stubbornness and rigidity", "Resistance to change", "Material attachment", "Possessiveness"],
    "Gemini": ["Restlessness and inconsistency", "Difficulty focusing", "Superficiality", "Indecisiveness"],
    "Cancer": ["Moodiness and sensitivity", "Over-emotional reactions", "Tendency to hold grudges", "Over-protectiveness"],
    "Leo": ["Pride and ego", "Need for constant attention", "Stubbornness", "Over-confidence"],
    "Virgo": ["Perfectionism and criticism", "Worry and anxiety", "Over-analysis", "Self-criticism"],
    "Libra": ["Indecisiveness", "Avoidance of conflict", "Dependency on others", "Procrastination"],
    "Scorpio": ["Intensity and jealousy", "Secretive nature", "Possessiveness", "Vindictiveness"],
    "Sagittarius": ["Restlessness and tactlessness", "Over-optimism", "Lack of commitment", "Impatience"],
    "Capricorn": ["Rigidity and pessimism", "Emotional reserve", "Workaholic tendency", "Stubbornness"],
    "Aquarius": ["Detachment and unpredictability", "Rebelliousness", "Unconventional behavior", "Aloofness"],
    "Pisces": ["Escapism and confusion", "Over-sensitivity", "Lack of boundaries", "Indecisiveness"]
  };

  // Career predictions based on ascendant and lagna lord position
  const careerPredictions: Record<string, { prediction: string; fields: string[]; periods: string[]; challenges: string[] }> = {
    "Aries": {
      prediction: `Your ${ascendant} ascendant with ${lagnaLord} in House ${lagnaLordHouse} indicates strong leadership potential. You excel in competitive fields and are suited for roles requiring initiative and courage.`,
      fields: ["Military", "Sports", "Entrepreneurship", "Engineering", "Police", "Fire Services"],
      periods: ["Mars and Sun periods bring career growth", "Jupiter periods enhance opportunities", "Venus periods improve financial status"],
      challenges: ["Avoid impulsive career decisions", "Control aggression in workplace", "Maintain patience for long-term goals"]
    },
    "Taurus": {
      prediction: `Your ${ascendant} ascendant suggests stability and persistence in career. You prefer steady growth over quick gains and excel in fields requiring patience and determination.`,
      fields: ["Banking", "Finance", "Real Estate", "Agriculture", "Arts", "Jewelry"],
      periods: ["Venus periods are highly favorable", "Jupiter periods bring expansion", "Saturn periods require patience"],
      challenges: ["Resist resistance to change", "Avoid excessive material focus", "Maintain work-life balance"]
    },
    "Gemini": {
      prediction: `Your ${ascendant} ascendant indicates versatility and communication skills. You excel in fields requiring intellectual abilities and adaptability.`,
      fields: ["Media", "Journalism", "Teaching", "Writing", "Sales", "IT", "Communication"],
      periods: ["Mercury periods enhance communication", "Jupiter periods bring opportunities", "Venus periods improve finances"],
      challenges: ["Maintain focus on goals", "Avoid spreading too thin", "Complete projects before starting new ones"]
    },
    "Cancer": {
      prediction: `Your ${ascendant} ascendant suggests nurturing and caring nature in career. You excel in fields related to care, service, and emotional connection.`,
      fields: ["Nursing", "Hospitality", "Real Estate", "Food Industry", "Childcare", "Psychology"],
      periods: ["Moon periods are favorable", "Jupiter periods bring growth", "Venus periods enhance relationships"],
      challenges: ["Control emotional reactions", "Avoid moodiness affecting work", "Maintain professional boundaries"]
    },
    "Leo": {
      prediction: `Your ${ascendant} ascendant indicates leadership and creative expression. You excel in fields requiring confidence, creativity, and public presence.`,
      fields: ["Entertainment", "Management", "Politics", "Creative Arts", "Education", "Public Relations"],
      periods: ["Sun periods are highly favorable", "Jupiter periods bring recognition", "Venus periods enhance creativity"],
      challenges: ["Control pride and ego", "Avoid seeking constant attention", "Maintain humility"]
    },
    "Virgo": {
      prediction: `Your ${ascendant} ascendant suggests analytical and service-oriented approach. You excel in fields requiring attention to detail and practical skills.`,
      fields: ["Healthcare", "Accounting", "Research", "Service Industry", "Quality Control", "Data Analysis"],
      periods: ["Mercury periods enhance skills", "Jupiter periods bring opportunities", "Venus periods improve finances"],
      challenges: ["Avoid over-criticism", "Control perfectionism", "Reduce worry and anxiety"]
    },
    "Libra": {
      prediction: `Your ${ascendant} ascendant indicates balance and partnership skills. You excel in fields requiring diplomacy, aesthetics, and collaboration.`,
      fields: ["Law", "Diplomacy", "Fashion", "Beauty", "Partnerships", "Design"],
      periods: ["Venus periods are highly favorable", "Jupiter periods bring opportunities", "Mercury periods enhance communication"],
      challenges: ["Make decisions confidently", "Avoid procrastination", "Maintain independence"]
    },
    "Scorpio": {
      prediction: `Your ${ascendant} ascendant suggests intensity and transformation abilities. You excel in fields requiring deep analysis, research, and transformation.`,
      fields: ["Research", "Investigation", "Psychology", "Surgery", "Mysticism", "Transformation Fields"],
      periods: ["Mars periods bring energy", "Pluto periods enhance transformation", "Jupiter periods bring opportunities"],
      challenges: ["Control intensity and jealousy", "Avoid secretive behavior", "Maintain trust"]
    },
    "Sagittarius": {
      prediction: `Your ${ascendant} ascendant indicates optimism and philosophical wisdom. You excel in fields requiring knowledge, travel, and higher learning.`,
      fields: ["Education", "Travel", "Philosophy", "Law", "Publishing", "Spirituality"],
      periods: ["Jupiter periods are highly favorable", "Sun periods bring recognition", "Mercury periods enhance communication"],
      challenges: ["Maintain commitment", "Avoid restlessness", "Control tactlessness"]
    },
    "Capricorn": {
      prediction: `Your ${ascendant} ascendant suggests ambition and discipline. You excel in fields requiring structure, planning, and long-term goals.`,
      fields: ["Administration", "Government", "Construction", "Mining", "Management", "Engineering"],
      periods: ["Saturn periods require patience", "Jupiter periods bring opportunities", "Sun periods enhance status"],
      challenges: ["Avoid excessive rigidity", "Maintain work-life balance", "Control pessimism"]
    },
    "Aquarius": {
      prediction: `Your ${ascendant} ascendant indicates innovation and humanitarian values. You excel in fields requiring original thinking and social contribution.`,
      fields: ["Technology", "Innovation", "Social Work", "Astrology", "Research", "Humanitarian Work"],
      periods: ["Saturn periods bring structure", "Jupiter periods enhance opportunities", "Uranus periods bring innovation"],
      challenges: ["Maintain consistency", "Avoid detachment", "Control unpredictability"]
    },
    "Pisces": {
      prediction: `Your ${ascendant} ascendant suggests compassion and artistic abilities. You excel in fields requiring creativity, spirituality, and emotional connection.`,
      fields: ["Arts", "Spirituality", "Healing", "Music", "Film", "Psychology"],
      periods: ["Jupiter periods are highly favorable", "Neptune periods enhance creativity", "Venus periods bring opportunities"],
      challenges: ["Avoid escapism", "Maintain boundaries", "Control over-sensitivity"]
    }
  };

  const career = careerPredictions[ascendant] || {
    prediction: `Your ${ascendant} ascendant influences your career path. Focus on building expertise and maintaining professional relationships.`,
    fields: ["Various professional fields"],
    periods: ["Consult expert for specific periods"],
    challenges: ["Maintain balance in all aspects"]
  };

  // Health predictions
  const healthAreas: Record<string, string[]> = {
    "Aries": ["Head and face", "Eyes", "Brain"],
    "Taurus": ["Throat and neck", "Thyroid", "Voice"],
    "Gemini": ["Arms and shoulders", "Lungs", "Nervous system"],
    "Cancer": ["Chest and stomach", "Breasts", "Digestive system"],
    "Leo": ["Heart and back", "Spine", "Circulation"],
    "Virgo": ["Digestive system", "Intestines", "Nervous system"],
    "Libra": ["Kidneys", "Lower back", "Skin"],
    "Scorpio": ["Reproductive system", "Genitals", "Elimination"],
    "Sagittarius": ["Hips and thighs", "Liver", "Nervous system"],
    "Capricorn": ["Knees and bones", "Teeth", "Skin"],
    "Aquarius": ["Ankles", "Circulation", "Nervous system"],
    "Pisces": ["Feet", "Lymphatic system", "Immune system"]
  };

  const health = {
    prediction: `Your ${ascendant} ascendant indicates attention to ${healthAreas[ascendant]?.join(", ") || "overall health"}. Regular health check-ups and maintaining balance in these areas is recommended.`,
    areas: healthAreas[ascendant] || ["Overall health"],
    precautions: [
      "Regular health check-ups",
      "Maintain balanced diet",
      "Exercise regularly",
      "Manage stress levels"
    ],
    remedies: [
      "Worship ruling deity of your ascendant",
      "Follow healthy lifestyle",
      "Practice yoga and meditation",
      "Maintain positive attitude"
    ]
  };

  // Relationship predictions
  const relationships = {
    prediction: `Your ${ascendant} ascendant influences your approach to relationships. You tend to ${getRelationshipTraits(ascendant)}. The placement of ${lagnaLord} in House ${lagnaLordHouse} further affects your relationship dynamics.`,
    marriageTiming: lagnaLordHouse === 7 ? "Early marriage likely" : lagnaLordHouse === 5 || lagnaLordHouse === 9 ? "Marriage in mid-20s to early 30s" : "Consult expert for specific timing",
    partnerCharacteristics: [
      getPartnerTraits(ascendant),
      "Compatible with your nature",
      "Supportive and understanding"
    ],
    compatibility: [
      getCompatibleSigns(ascendant),
      "Good understanding with water and earth signs",
      "Mutual respect and harmony"
    ]
  };

  // Finance predictions
  const finance = {
    prediction: `Your ${ascendant} ascendant with ${lagnaLord} in House ${lagnaLordHouse} indicates ${lagnaLordHouse === 2 || lagnaLordHouse === 11 ? "strong" : "moderate"} earning potential. Focus on stable investments and avoid speculation.`,
    earningPotential: lagnaLordHouse === 2 || lagnaLordHouse === 11 ? "High earning potential with steady growth" : "Moderate to good earning potential",
    favorablePeriods: [
      "Jupiter periods favor financial growth",
      "Venus periods enhance wealth",
      "Mercury periods improve business"
    ],
    investments: [
      "Real estate and property",
      "Stable mutual funds",
      "Gold and precious metals",
      "Avoid speculative investments"
    ]
  };

  // Education predictions
  const education = {
    prediction: `Your ${ascendant} ascendant suggests ${lagnaLordHouse === 5 || lagnaLordHouse === 9 ? "strong" : "good"} educational potential. Focus on skill development and continuous learning.`,
    suitableFields: getEducationFields(ascendant),
    favorablePeriods: [
      "Jupiter periods favor education",
      "Mercury periods enhance learning",
      "Venus periods improve creativity"
    ]
  };

  // Remedies
  const remedies = [
    {
      type: "Mantra",
      description: `Chant mantras for ${lagnaLord} daily`,
      timing: "Early morning or evening"
    },
    {
      type: "Gemstone",
      description: `Wear gemstone associated with ${lagnaLord}`,
      timing: "After consultation with expert"
    },
    {
      type: "Puja",
      description: `Worship ruling deity of ${ascendant}`,
      timing: "On auspicious days"
    },
    {
      type: "Charity",
      description: "Donate to charity and help needy",
      timing: "Regularly"
    }
  ];

  // Period-wise predictions
  const predictions = [
    {
      period: "Next 6 Months",
      prediction: `The coming months bring ${lagnaLordHouse === 1 || lagnaLordHouse === 10 ? "positive" : "mixed"} changes. Focus on ${lagnaLordHouse === 10 ? "career development" : lagnaLordHouse === 7 ? "relationships" : "overall growth"}.`,
      areas: ["Career", "Relationships", "Health"]
    },
    {
      period: "Next 1 Year",
      prediction: `This year brings opportunities for growth in ${lagnaLordHouse === 10 ? "career" : lagnaLordHouse === 2 ? "finance" : "various"} areas. Maintain balance and follow remedies.`,
      areas: ["Finance", "Career", "Health"]
    },
    {
      period: "Next 2-3 Years",
      prediction: `The coming years indicate ${lagnaLordHouse === 1 || lagnaLordHouse === 9 ? "favorable" : "moderate"} period. Focus on long-term goals and maintain positive attitude.`,
      areas: ["Long-term Goals", "Career", "Relationships"]
    }
  ];

  return {
    lagna: ascendant,
    lagnaLord,
    lagnaLordHouse,
    lagnaLordSign,
    lagnaLordDegree,
    characteristics: characteristicsMap[ascendant] || ["Unique personality", "Individual traits"],
    strengths: strengthsMap[ascendant] || ["Natural abilities", "Personal strengths"],
    challenges: challengesMap[ascendant] || ["Areas to work on", "Growth opportunities"],
    career,
    health,
    relationships,
    finance,
    education,
    remedies,
    predictions
  };
}

function getRelationshipTraits(ascendant: string): string {
  const map: Record<string, string> = {
    "Aries": "be direct and passionate in relationships",
    "Taurus": "value stability and loyalty in partnerships",
    "Gemini": "seek intellectual connection and communication",
    "Cancer": "be nurturing and emotionally connected",
    "Leo": "be generous and expressive in love",
    "Virgo": "be practical and service-oriented",
    "Libra": "seek harmony and balance in relationships",
    "Scorpio": "be intense and deeply committed",
    "Sagittarius": "value freedom and adventure in partnerships",
    "Capricorn": "be serious and committed to long-term relationships",
    "Aquarius": "value independence and friendship in love",
    "Pisces": "be compassionate and spiritually connected"
  };
  return map[ascendant] || "have unique relationship dynamics";
}

function getPartnerTraits(ascendant: string): string {
  const map: Record<string, string> = {
    "Aries": "Energetic and independent",
    "Taurus": "Stable and reliable",
    "Gemini": "Intellectual and communicative",
    "Cancer": "Emotional and caring",
    "Leo": "Confident and generous",
    "Virgo": "Practical and detail-oriented",
    "Libra": "Balanced and harmonious",
    "Scorpio": "Intense and passionate",
    "Sagittarius": "Adventurous and optimistic",
    "Capricorn": "Ambitious and disciplined",
    "Aquarius": "Independent and innovative",
    "Pisces": "Compassionate and artistic"
  };
  return map[ascendant] || "Compatible partner";
}

function getCompatibleSigns(ascendant: string): string {
  const map: Record<string, string> = {
    "Aries": "Compatible with Leo, Sagittarius, and Gemini",
    "Taurus": "Compatible with Virgo, Capricorn, and Cancer",
    "Gemini": "Compatible with Libra, Aquarius, and Aries",
    "Cancer": "Compatible with Scorpio, Pisces, and Taurus",
    "Leo": "Compatible with Aries, Sagittarius, and Libra",
    "Virgo": "Compatible with Taurus, Capricorn, and Cancer",
    "Libra": "Compatible with Gemini, Aquarius, and Leo",
    "Scorpio": "Compatible with Cancer, Pisces, and Virgo",
    "Sagittarius": "Compatible with Aries, Leo, and Aquarius",
    "Capricorn": "Compatible with Taurus, Virgo, and Scorpio",
    "Aquarius": "Compatible with Gemini, Libra, and Sagittarius",
    "Pisces": "Compatible with Cancer, Scorpio, and Capricorn"
  };
  return map[ascendant] || "Good compatibility with various signs";
}

function getEducationFields(ascendant: string): string[] {
  const map: Record<string, string[]> = {
    "Aries": ["Engineering", "Military Science", "Sports", "Leadership"],
    "Taurus": ["Finance", "Banking", "Arts", "Agriculture"],
    "Gemini": ["Communication", "Media", "IT", "Languages"],
    "Cancer": ["Nursing", "Psychology", "Hospitality", "Education"],
    "Leo": ["Management", "Arts", "Education", "Entertainment"],
    "Virgo": ["Medicine", "Research", "Accounting", "Science"],
    "Libra": ["Law", "Design", "Fashion", "Diplomacy"],
    "Scorpio": ["Research", "Psychology", "Medicine", "Mysticism"],
    "Sagittarius": ["Philosophy", "Law", "Travel", "Education"],
    "Capricorn": ["Engineering", "Administration", "Management", "Science"],
    "Aquarius": ["Technology", "Innovation", "Social Sciences", "Research"],
    "Pisces": ["Arts", "Spirituality", "Psychology", "Healing"]
  };
  return map[ascendant] || ["Various fields"];
}

import { checkRateLimit, handleApiError, parseJsonBody, validateRequestSize } from "@/lib/apiHelpers";

export async function POST(req: Request) {
  try {
    // Rate limiting
    const rateLimitResponse = checkRateLimit(req, '/api/reports/ascendant');
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
    const ascendantAnalysis = generateAscendantAnalysis(kundli);

    return NextResponse.json({
      ok: true,
      data: {
        kundli,
        ascendantAnalysis,
        userName: name || "User",
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
