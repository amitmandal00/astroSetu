/**
 * Enhanced Dosha Analysis Utilities
 * Comprehensive dosha analysis and remedy generation
 * Inspired by AstroSage and AstroTalk patterns
 */

import type { DoshaAnalysis, RemedyDetail, PlanetPosition } from "@/types/astrology";

/**
 * Generate comprehensive remedies for Manglik Dosha
 */
export function generateManglikRemedies(house?: number, severity: "High" | "Medium" | "Low" = "Medium"): RemedyDetail[] {
  const remedies: RemedyDetail[] = [];
  
  remedies.push({
    type: "Puja",
    name: "Kumbh Vivah",
    description: "Ritual marriage to a banana tree or peepal tree before actual marriage. This is one of the most powerful remedies for Manglik dosha.",
    instructions: [
      "Perform this puja on Tuesday or during auspicious time",
      "Marry a banana tree or peepal tree first",
      "The tree should be worshipped as Lord Vishnu",
      "Perform full wedding rituals with the tree",
      "After the ritual, the tree is cut and disposed in flowing water",
    ],
    timing: "Tuesday, during Manglik period",
    duration: "1-2 hours",
    benefits: [
      "Reduces Manglik dosha effects",
      "Improves marital harmony",
      "Prevents delays in marriage",
      "Brings peace and stability",
    ],
    frequency: "Once before marriage",
    priority: "High",
  });
  
  remedies.push({
    type: "Mantra",
    name: "Mangal Mantra",
    description: "Chanting of Mars-related mantras to pacify Mangal dosha",
    instructions: [
      "Chant 'Om Ang Angarkaya Namaha' 108 times daily",
      "Or chant 'Om Mangal Devaya Namaha' 108 times",
      "Best time: Tuesday morning during sunrise",
      "Maintain a red cloth or red flowers nearby",
      "Offer red flowers to Lord Hanuman",
    ],
    timing: "Tuesday, sunrise",
    duration: "10-15 minutes daily",
    benefits: [
      "Pacifies Mars energy",
      "Reduces anger and aggression",
      "Improves health",
      "Brings peace",
    ],
    frequency: "Daily for 40 days or lifelong",
    priority: "High",
  });
  
  remedies.push({
    type: "Gemstone",
    name: "Red Coral (Moonga)",
    description: "Wearing red coral gemstone to strengthen Mars positively",
    instructions: [
      "Wear red coral ring or pendant in copper or gold",
      "Weight should be at least 5-7 carats",
      "Wear on ring finger of right hand (Tuesday)",
      "Must be purified and energized before wearing",
      "Consult astrologer for exact specifications",
    ],
    timing: "Tuesday, during Shukla Paksha",
    duration: "Lifelong or as advised",
    benefits: [
      "Strengthens positive Mars energy",
      "Reduces dosha effects",
      "Improves courage and confidence",
      "Enhances physical strength",
    ],
    frequency: "Permanent",
    priority: severity === "High" ? "High" : "Medium",
  });
  
  remedies.push({
    type: "Donation",
    name: "Mars-related Donations",
    description: "Donating items related to Mars on Tuesdays",
    instructions: [
      "Donate red cloth, red lentils (masoor dal), copper utensils",
      "Donate to temples or needy people",
      "Best done on Tuesday during Mars hour",
      "Donate jaggery, red flowers to Lord Hanuman",
      "Feed red-colored food to animals",
    ],
    timing: "Every Tuesday",
    duration: "As long as dosha persists",
    benefits: [
      "Reduces malefic effects",
      "Brings positive energy",
      "Improves relationships",
      "Enhances overall well-being",
    ],
    frequency: "Weekly",
    priority: "Medium",
  });
  
  remedies.push({
    type: "Fasting",
    name: "Mangalvar Vrat (Tuesday Fasting)",
    description: "Fasting on Tuesdays to pacify Mars",
    instructions: [
      "Fast on every Tuesday",
      "Can consume fruits, milk, or light meals",
      "Worship Lord Hanuman and Lord Kartikeya",
      "Read Hanuman Chalisa",
      "Avoid non-vegetarian food on Tuesdays",
    ],
    timing: "Every Tuesday",
    duration: "Till marriage or as advised",
    benefits: [
      "Pacifies Mangal dosha",
      "Brings mental peace",
      "Improves health",
      "Removes obstacles",
    ],
    frequency: "Weekly",
    priority: "Medium",
  });
  
  if (severity === "High") {
    remedies.push({
      type: "Ritual",
      name: "Mangal Shanti Puja",
      description: "Special puja performed by priests to pacify Mars",
      instructions: [
        "Perform at a temple or with qualified priest",
        "Use red flowers, red cloth, red sindoor",
        "Offer sweets and fruits to Mars",
        "Perform during Mangal hora on Tuesday",
        "Follow priest's guidance for complete ritual",
      ],
      timing: "Tuesday during Mangal hora",
      duration: "2-3 hours",
      benefits: [
        "Powerful remedy for high severity Manglik dosha",
        "Reduces all negative effects",
        "Brings peace and harmony",
        "Improves marital prospects",
      ],
      frequency: "Once or as advised",
      priority: "High",
    });
  }
  
  return remedies;
}

/**
 * Generate comprehensive remedies for Kaal Sarp Dosha
 * Enhanced with type-specific remedies
 */
export function generateKaalSarpRemedies(type?: string): RemedyDetail[] {
  const remedies: RemedyDetail[] = [];
  
  // Type-specific puja recommendations
  const typeInfo: Record<string, { deity: string; specialNote: string }> = {
    Anant: { deity: "Lord Vishnu", specialNote: "Anant Kaal Sarp - Most severe type, requires intensive remedies" },
    Kulik: { deity: "Lord Shiva", specialNote: "Kulik Kaal Sarp - Affects family and lineage" },
    Vasuki: { deity: "Lord Shiva", specialNote: "Vasuki Kaal Sarp - Affects health and longevity" },
    Shankhpal: { deity: "Lord Vishnu", specialNote: "Shankhpal Kaal Sarp - Affects wealth and prosperity" },
    Padma: { deity: "Goddess Lakshmi", specialNote: "Padma Kaal Sarp - Affects relationships and harmony" },
    Mahapadma: { deity: "Lord Vishnu", specialNote: "Mahapadma Kaal Sarp - Very severe, affects all life areas" },
    Takshak: { deity: "Lord Shiva", specialNote: "Takshak Kaal Sarp - Affects career and profession" },
    Karkotak: { deity: "Lord Shiva", specialNote: "Karkotak Kaal Sarp - Affects mental peace and stability" },
  };

  const typeData = type && typeInfo[type] ? typeInfo[type] : { deity: "Lord Shiva", specialNote: "Kaal Sarp dosha requires immediate attention" };
  
  remedies.push({
    type: "Puja",
    name: `Kaal Sarp Dosha Nivaran Puja${type ? ` (${type} Type)` : ""}`,
    description: `Special puja to remove ${type || "Kaal Sarp"} dosha effects. ${typeData.specialNote}. This is one of the most effective remedies.`,
    instructions: [
      `Perform at ${typeData.deity} temple or with qualified priest`,
      "Use silver or gold snake idol (minimum 10 grams)",
      "Perform Nag Panchami puja with full rituals",
      "Chant Maha Mrityunjaya Mantra 108 times",
      "Perform Rudrabhishek with milk and water",
      "Donate silver snake to temple after puja",
      type === "Anant" || type === "Mahapadma" ? "Requires multiple sessions - consult astrologer" : undefined,
    ].filter(Boolean) as string[],
    timing: "Nag Panchami, Shravan month, or any Monday during Shukla Paksha",
    duration: "2-4 hours (longer for severe types)",
    benefits: [
      "Removes Kaal Sarp dosha completely",
      "Removes obstacles in all life areas",
      "Brings peace, prosperity, and longevity",
      "Improves health and mental peace",
      "Enhances spiritual growth",
    ],
    frequency: type === "Anant" || type === "Mahapadma" ? "Multiple times as advised" : "Once or as advised",
    priority: type === "Anant" || type === "Mahapadma" ? "High" : "High",
  });
  
  remedies.push({
    type: "Mantra",
    name: "Maha Mrityunjaya Mantra",
    description: "Powerful mantra dedicated to Lord Shiva for protection and longevity",
    instructions: [
      "Chant 'Om Tryambakam Yajamahe Sugandhim Pushtivardhanam' 108 times daily",
      "Best time: Early morning during Brahma Muhurta",
      "Face east direction",
      "Use rudraksha mala for counting",
      "Offer water and bilva leaves to Lord Shiva",
    ],
    timing: "Daily, early morning",
    duration: "15-20 minutes",
    benefits: [
      "Removes fear of death and obstacles",
      "Improves health and longevity",
      "Removes Kaal Sarp dosha effects",
      "Brings peace and protection",
    ],
    frequency: "Daily for 108 days or lifelong",
    priority: "High",
  });
  
  remedies.push({
    type: "Donation",
    name: "Silver Snake Donation",
    description: "Donating silver snake idol to remove Kaal Sarp dosha",
    instructions: [
      "Donate silver snake idol weighing at least 10 grams",
      "Donate at Lord Shiva temple or river",
      "Best done on Nag Panchami or Monday",
      "Can also donate to snake temple",
      "Perform with proper rituals",
    ],
    timing: "Nag Panchami or any Monday",
    duration: "One time",
    benefits: [
      "Removes Kaal Sarp dosha",
      "Removes obstacles",
      "Brings positive energy",
      "Improves life conditions",
    ],
    frequency: "Once",
    priority: "High",
  });
  
  remedies.push({
    type: "Ritual",
    name: "Nag Panchami Puja",
    description: "Annual ritual on Nag Panchami to worship snakes",
    instructions: [
      "Perform on Nag Panchami day (Shravan month)",
      "Worship snake idols with milk, flowers, and turmeric",
      "Draw snake patterns with turmeric and kumkum",
      "Offer milk to snake idols",
      "Pray to Nag Devatas for protection",
    ],
    timing: "Nag Panchami (annual)",
    duration: "2-3 hours",
    benefits: [
      "Pacifies snake deities",
      "Removes dosha effects",
      "Brings protection",
      "Improves fortune",
    ],
    frequency: "Annually",
    priority: "Medium",
  });
  
  remedies.push({
    type: "Gemstone",
    name: "Cat's Eye (Lehsunia)",
    description: "Wearing Cat's Eye gemstone to reduce Kaal Sarp dosha effects",
    instructions: [
      "Wear in silver or gold ring",
      "Weight should be at least 5 carats",
      "Wear on middle finger of right hand",
      "Must be purified and energized",
      "Consult astrologer for exact timing",
    ],
    timing: "Saturday, during Shukla Paksha",
    duration: "As advised",
    benefits: [
      "Reduces dosha effects",
      "Brings protection",
      "Removes obstacles",
      "Improves fortune",
    ],
    frequency: "Permanent",
    priority: "Medium",
  });
  
  return remedies;
}

/**
 * Generate comprehensive remedies for Shani (Saturn) Dosha
 */
export function generateShaniRemedies(period?: string): RemedyDetail[] {
  const remedies: RemedyDetail[] = [];
  
  remedies.push({
    type: "Puja",
    name: "Shani Shanti Puja",
    description: "Special puja to pacify Saturn and reduce Sade Sati effects",
    instructions: [
      "Perform at Lord Shani temple or with qualified priest",
      "Use black cloth, black sesame seeds, mustard oil",
      "Offer black urad dal, black til, blue flowers",
      "Perform on Saturday during Shani hora",
      "Chant Shani mantras",
    ],
    timing: "Saturday, during Shani hora",
    duration: "2-3 hours",
    benefits: [
      "Reduces Sade Sati effects",
      "Pacifies Saturn",
      "Removes obstacles",
      "Brings peace and stability",
    ],
    frequency: "Once or as advised",
    priority: "High",
  });
  
  remedies.push({
    type: "Mantra",
    name: "Shani Mantra",
    description: "Chanting Saturn mantras to pacify Shani dosha",
    instructions: [
      "Chant 'Om Sham Shanaishcharaya Namaha' 108 times daily",
      "Or chant 'Om Praam Preem Prom Sah Shanaye Namah'",
      "Best time: Saturday evening after sunset",
      "Use blue flowers and black sesame seeds",
      "Light mustard oil lamp",
    ],
    timing: "Saturday, evening",
    duration: "15-20 minutes",
    benefits: [
      "Pacifies Saturn energy",
      "Reduces Sade Sati effects",
      "Brings stability",
      "Removes obstacles",
    ],
    frequency: "Daily for 108 days",
    priority: "High",
  });
  
  remedies.push({
    type: "Donation",
    name: "Shani Donations",
    description: "Donating items related to Saturn on Saturdays",
    instructions: [
      "Donate black cloth, black urad dal, black sesame seeds",
      "Donate mustard oil, blue flowers, iron items",
      "Donate to old age homes or disabled people",
      "Feed crows and black dogs",
      "Donate to Shani temples",
    ],
    timing: "Every Saturday",
    duration: "During Sade Sati period",
    benefits: [
      "Reduces Shani dosha effects",
      "Brings positive energy",
      "Removes obstacles",
      "Improves fortune",
    ],
    frequency: "Weekly",
    priority: "High",
  });
  
  remedies.push({
    type: "Fasting",
    name: "Shaniwar Vrat (Saturday Fasting)",
    description: "Fasting on Saturdays to pacify Saturn",
    instructions: [
      "Fast on every Saturday",
      "Can consume black sesame seeds, black urad dal",
      "Worship Lord Shani",
      "Avoid non-vegetarian food",
      "Read Shani stotra or chalisa",
    ],
    timing: "Every Saturday",
    duration: "During Sade Sati or as advised",
    benefits: [
      "Pacifies Shani dosha",
      "Reduces Sade Sati effects",
      "Brings peace",
      "Removes obstacles",
    ],
    frequency: "Weekly",
    priority: "High",
  });
  
  remedies.push({
    type: "Gemstone",
    name: "Blue Sapphire (Neelam)",
    description: "Wearing blue sapphire to strengthen Saturn positively (CAUTION: Must consult astrologer)",
    instructions: [
      "Wear only after proper consultation",
      "Weight should be at least 5-7 carats",
      "Wear in middle finger of right hand",
      "Must be purified and energized",
      "Test for 3 days before permanent wearing",
    ],
    timing: "Saturday, during Shukla Paksha",
    duration: "As advised",
    benefits: [
      "Strengthens positive Saturn energy",
      "Reduces dosha effects",
      "Brings stability and discipline",
      "Improves karma",
    ],
    frequency: "Permanent (after testing)",
    priority: "Medium",
  });
  
  return remedies;
}

/**
 * Generate comprehensive remedies for Rahu-Ketu Dosha
 */
export function generateRahuKetuRemedies(): RemedyDetail[] {
  const remedies: RemedyDetail[] = [];
  
  remedies.push({
    type: "Puja",
    name: "Rahu-Ketu Shanti Puja",
    description: "Special puja to pacify Rahu and Ketu",
    instructions: [
      "Perform at Navagraha temple or with qualified priest",
      "Use multi-colored cloth, honey, jaggery",
      "Offer blue and brown flowers",
      "Perform during Rahu-Ketu hora",
      "Chant Rahu-Ketu mantras",
    ],
    timing: "Saturday or Wednesday, during Rahu-Ketu hora",
    duration: "2-3 hours",
    benefits: [
      "Pacifies Rahu and Ketu",
      "Removes obstacles",
      "Brings peace and stability",
      "Improves fortune",
    ],
    frequency: "Once or as advised",
    priority: "High",
  });
  
  remedies.push({
    type: "Mantra",
    name: "Rahu-Ketu Mantras",
    description: "Chanting Rahu and Ketu mantras to pacify these planets",
    instructions: [
      "Chant 'Om Raam Rahve Namaha' 108 times for Rahu",
      "Chant 'Om Kem Ketave Namaha' 108 times for Ketu",
      "Best time: Saturday or Wednesday evening",
      "Use honey and jaggery in puja",
      "Offer blue flowers",
    ],
    timing: "Saturday or Wednesday, evening",
    duration: "15-20 minutes each",
    benefits: [
      "Pacifies Rahu-Ketu energy",
      "Removes obstacles",
      "Brings stability",
      "Improves mental peace",
    ],
    frequency: "Daily for 108 days",
    priority: "High",
  });
  
  remedies.push({
    type: "Donation",
    name: "Rahu-Ketu Donations",
    description: "Donating items related to Rahu and Ketu",
    instructions: [
      "Donate blue cloth, black gram, mustard oil",
      "Donate honey, jaggery, multi-colored items",
      "Donate to temples or needy people",
      "Feed birds and animals",
      "Donate to Navagraha temples",
    ],
    timing: "Saturday or Wednesday",
    duration: "As long as dosha persists",
    benefits: [
      "Reduces Rahu-Ketu dosha effects",
      "Brings positive energy",
      "Removes obstacles",
      "Improves fortune",
    ],
    frequency: "Weekly",
    priority: "Medium",
  });
  
  remedies.push({
    type: "Gemstone",
    name: "Hessonite (Gomed) & Cat's Eye (Lehsunia)",
    description: "Wearing Hessonite for Rahu and Cat's Eye for Ketu",
    instructions: [
      "Hessonite for Rahu: Wear in silver ring, middle finger",
      "Cat's Eye for Ketu: Wear in silver ring, ring finger",
      "Weight should be at least 5 carats each",
      "Must be purified and energized",
      "Consult astrologer before wearing",
    ],
    timing: "Saturday, during Shukla Paksha",
    duration: "As advised",
    benefits: [
      "Pacifies Rahu-Ketu energy",
      "Reduces dosha effects",
      "Brings protection",
      "Removes obstacles",
    ],
    frequency: "Permanent",
    priority: "Medium",
  });
  
  remedies.push({
    type: "Fasting",
    name: "Rahu-Ketu Vrat",
    description: "Fasting on Saturdays to pacify Rahu-Ketu",
    instructions: [
      "Fast on every Saturday",
      "Can consume fruits and light meals",
      "Avoid non-vegetarian food",
      "Worship Rahu and Ketu",
      "Read related mantras",
    ],
    timing: "Every Saturday",
    duration: "As advised",
    benefits: [
      "Pacifies Rahu-Ketu dosha",
      "Brings peace",
      "Removes obstacles",
      "Improves fortune",
    ],
    frequency: "Weekly",
    priority: "Medium",
  });
  
  return remedies;
}

/**
 * Generate Pitra Dosha remedies
 */
export function generatePitraRemedies(): RemedyDetail[] {
  const remedies: RemedyDetail[] = [];
  
  remedies.push({
    type: "Puja",
    name: "Pitra Dosha Nivaran Puja",
    description: "Special puja to pacify ancestors and remove Pitra dosha",
    instructions: [
      "Perform on Amavasya or Pitra Paksha",
      "Offer food and water to ancestors",
      "Perform Shraddha rituals",
      "Donate to Brahmins",
      "Perform at holy places like Gaya, Haridwar",
    ],
    timing: "Amavasya, Pitra Paksha, or any Monday",
    duration: "2-3 hours",
    benefits: [
      "Pacifies ancestors",
      "Removes Pitra dosha",
      "Brings peace to family",
      "Improves fortune",
    ],
    frequency: "Once or annually",
    priority: "High",
  });
  
  remedies.push({
    type: "Donation",
    name: "Pitra Tarpan",
    description: "Offering water and food to ancestors",
    instructions: [
      "Perform daily during Pitra Paksha",
      "Offer water mixed with black sesame seeds",
      "Offer food, clothes to ancestors",
      "Donate to Brahmins in ancestor's name",
      "Perform at river or temple",
    ],
    timing: "Pitra Paksha, Amavasya, or daily",
    duration: "15-20 minutes",
    benefits: [
      "Pacifies ancestors",
      "Removes Pitra dosha",
      "Brings peace to family",
      "Improves fortune",
    ],
    frequency: "Daily during Pitra Paksha or as advised",
    priority: "High",
  });
  
  return remedies;
}

/**
 * Get impact descriptions for doshas
 */
export function getDoshaImpact(doshaType: string, present: boolean, severity?: string): string[] {
  if (!present) return [];
  
  const impacts: Record<string, string[]> = {
    manglik: [
      "May cause delays in marriage",
      "Potential relationship challenges",
      "Need for remedies before marriage",
      "May affect marital harmony",
      "Consultation recommended for timing",
    ],
    kaalSarp: [
      "May create obstacles in all life areas",
      "Potential delays in achievements and progress",
      "Health-related concerns and longevity issues possible",
      "Financial challenges and instability may arise",
      "Relationship and family harmony may be affected",
      "Career and professional growth may face hurdles",
      "Mental peace and emotional stability may be disrupted",
      "Overall life progress may be slower than expected",
      "Immediate remedies and spiritual practices are recommended",
    ],
    shani: [
      "Sade Sati period effects",
      "Challenges in career and relationships",
      "Health issues possible",
      "Financial setbacks may occur",
      "Period of transformation and learning",
    ],
    rahuKetu: [
      "Mental stress and confusion",
      "Unexpected changes in life",
      "Spiritual growth opportunities",
      "May affect career and relationships",
      "Need for balance and remedies",
    ],
    pitra: [
      "Obstacles in family matters",
      "Delays in success and achievements",
      "Health issues in family",
      "Financial problems",
      "Need to pacify ancestors",
    ],
  };
  
  const baseImpact = impacts[doshaType.toLowerCase()] || [];
  if (severity === "High") {
    return [...baseImpact, "High severity - Immediate remedies recommended", "Consult expert astrologer"];
  }
  return baseImpact;
}

/**
 * Generate explanation for dosha
 */
export function getDoshaExplanation(doshaType: string, details: any): string {
  const explanations: Record<string, (d: any) => string> = {
    manglik: (d: any) => {
      if (d.status === "Non-Manglik") {
        return "Mars is favorably placed in your chart. No Manglik dosha is present. Your marital prospects are good.";
      }
      return `Manglik Dosha is present due to Mars placement in certain houses (1st, 4th, 7th, 8th, or 12th). This may cause delays in marriage or relationship challenges. With proper remedies, the effects can be minimized.`;
    },
    kaalSarp: (d: any) => {
      if (!d.present) {
        return "All planets are not confined between Rahu and Ketu. No Kaal Sarp dosha is present in your chart. Your planetary positions are well-balanced.";
      }
      const type = d.type || "Unknown";
      const typeDescriptions: Record<string, string> = {
        Anant: "Anant Kaal Sarp Dosha is the most severe form. All planets are between Rahu and Ketu, creating significant obstacles in life, health, career, and relationships. Immediate remedies are strongly recommended.",
        Kulik: "Kulik Kaal Sarp Dosha affects family lineage and relationships. It may cause challenges in family matters and lineage continuity. Family-oriented remedies are beneficial.",
        Vasuki: "Vasuki Kaal Sarp Dosha primarily affects health and longevity. It may cause health issues and concerns about life span. Health-focused remedies and regular check-ups are recommended.",
        Shankhpal: "Shankhpal Kaal Sarp Dosha impacts wealth and financial stability. Financial ups and downs are common. Wealth-building remedies and financial planning are essential.",
        Padma: "Padma Kaal Sarp Dosha affects relationships and marital harmony. It may cause challenges in partnerships and relationships. Relationship-focused remedies are important.",
        Mahapadma: "Mahapadma Kaal Sarp Dosha is very severe and affects all aspects of life. Comprehensive remedies and regular spiritual practices are essential for mitigation.",
        Takshak: "Takshak Kaal Sarp Dosha affects career and professional growth. Career obstacles and professional challenges are common. Career-focused remedies are recommended.",
        Karkotak: "Karkotak Kaal Sarp Dosha affects mental peace and emotional stability. Stress and mental unrest may be experienced. Mental peace and meditation practices are beneficial.",
      };
      
      const typeDescription = typeDescriptions[type] || `Kaal Sarp Dosha (${type} type) is present as all planets are positioned between Rahu and Ketu. This creates obstacles in various life areas.`;
      
      return `${typeDescription} Proper remedies, regular puja, and consultation with an expert astrologer are strongly recommended to mitigate the effects and bring positive changes.`;
    },
    shani: (d: any) => {
      return `Saturn's influence in your chart may bring challenges during Sade Sati or related periods. This is a time of learning, discipline, and transformation. With proper remedies and patience, you can overcome challenges.`;
    },
    rahuKetu: (d: any) => {
      return `Rahu and Ketu's influence creates a spiritual axis in your chart. This may bring unexpected changes, mental stress, but also opportunities for spiritual growth. Remedies help balance their energy.`;
    },
  };
  
  const explainer = explanations[doshaType.toLowerCase()];
  return explainer ? explainer(details) : "Planetary dosha detected. Remedies are recommended for better results.";
}

