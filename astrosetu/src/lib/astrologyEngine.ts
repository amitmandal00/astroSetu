import type { BirthDetails, KundliResult, MatchResult, HoroscopeDaily, HoroscopeWeekly, HoroscopeMonthly, HoroscopeYearly, Panchang, Muhurat, Numerology, Remedy, DoshaAnalysis, KundliChart } from "@/types/astrology";

const SIGNS = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];
const NAKSHATRAS = ["Ashwini","Bharani","Krittika","Rohini","Mrigashirsha","Ardra","Punarvasu","Pushya","Ashlesha","Magha","Purva Phalguni","Uttara Phalguni","Hasta","Chitra","Swati","Vishakha","Anuradha","Jyeshtha","Mula","Purva Ashadha","Uttara Ashadha","Shravana","Dhanishta","Shatabhisha","Purva Bhadrapada","Uttara Bhadrapada","Revati"];
const TITHIS = ["Pratipada","Dvitiya","Tritiya","Chaturthi","Panchami","Shashthi","Saptami","Ashtami","Navami","Dashami","Ekadashi","Dwadashi","Trayodashi","Chaturdashi","Purnima/Amavasya"];

function hash(s: string) { let h=2166136261; for (let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619);} return Math.abs(h); }
function pick<T>(arr: T[], seed: number) { return arr[seed % arr.length]; }
function deg(seed: number) { return Math.round(((seed % 36000) / 100) * 100) / 100; }

export function generateKundli(input: BirthDetails): KundliResult {
  const seed = hash(`${input.dob}|${input.tob}|${input.place}`);
  const asc = pick(SIGNS, seed);
  const rashi = pick(SIGNS, seed + 7);
  const nak = pick(NAKSHATRAS, seed + 13);
  const tithi = pick(TITHIS, seed + 19);

  const planets = ["Sun","Moon","Mars","Mercury","Jupiter","Venus","Saturn","Rahu","Ketu"].map((name, idx) => {
    const s2 = seed + idx * 97;
    return { name, sign: pick(SIGNS, s2), degree: deg(s2), house: (s2 % 12) + 1, retrograde: (s2 % 5) === 0 };
  });

  const summary = [
    `Ascendant in ${asc} suggests how you approach life, opportunities, and challenges.`,
    `Moon sign ${rashi} reflects emotional needs and relationship patterns.`,
    `Nakshatra ${nak} highlights deeper traits and repeating life themes.`
  ];

  return { ascendant: asc, rashi, nakshatra: nak, tithi, planets, summary };
}

import { 
  generateManglikRemedies, 
  generateKaalSarpRemedies, 
  generateShaniRemedies,
  generateRahuKetuRemedies,
  getDoshaImpact,
  getDoshaExplanation
} from "./doshaAnalysis";

export function generateDoshaAnalysis(input: BirthDetails, planets?: any[]): DoshaAnalysis {
  const seed = hash(`${input.dob}|${input.tob}|${input.place}`);
  const manglikStatus = (seed % 7) <= 1 ? "Manglik" : "Non-Manglik";
  const manglikSeverity = manglikStatus === "Manglik" ? (seed % 3 === 0 ? "High" : "Medium") : "Low";
  const kaalSarpPresent = (seed % 5) === 0;
  const kaalSarpTypes = ["Anant", "Kulik", "Vasuki", "Shankhpal", "Padma", "Mahapadma", "Takshak", "Karkotak"];
  const kaalSarpType = kaalSarpPresent ? pick(kaalSarpTypes, seed) : undefined;
  
  // Find Mars house from planets if available
  const marsPlanet = planets?.find((p: any) => 
    p.name === "Mars" || 
    (typeof p === 'string' && p.toLowerCase().includes('mars'))
  );
  const marsHouse = marsPlanet?.house || ((seed % 12) + 1);
  
  const shaniActive = (seed % 3) === 0;
  const shaniEffects = shaniActive ? [
    "Sade Sati period may be active",
    "Delays and obstacles possible",
    "Karmic lessons to learn"
  ] : ["Shani is well-placed"];
  
  // Generate comprehensive remedies
  const manglikDetailedRemedies = manglikStatus === "Manglik" 
    ? generateManglikRemedies(marsHouse, manglikSeverity)
    : [];
  
  const kaalSarpDetailedRemedies = kaalSarpPresent 
    ? generateKaalSarpRemedies(kaalSarpType)
    : [];
  
  const shaniDetailedRemedies = generateShaniRemedies(shaniActive ? "Active" : undefined);
  const rahuKetuDetailedRemedies = generateRahuKetuRemedies();
  
  // Convert detailed remedies to simple string array for backward compatibility
  const convertRemediesToStrings = (remedies: any[]) => {
    return remedies.map(r => r.name || `${r.type}: ${r.description}`).slice(0, 4);
  };
  
  // Count total doshas
  let totalDoshas = 0;
  if (manglikStatus === "Manglik") totalDoshas++;
  if (kaalSarpPresent) totalDoshas++;
  if (shaniActive) totalDoshas++;
  totalDoshas++; // Rahu-Ketu always has effects
  
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
      remedies: convertRemediesToStrings(manglikDetailedRemedies),
      detailedRemedies: manglikDetailedRemedies,
      impact: getDoshaImpact("manglik", manglikStatus === "Manglik", manglikSeverity),
      house: marsHouse,
      explanation: getDoshaExplanation("manglik", { status: manglikStatus, severity: manglikSeverity, house: marsHouse }),
    },
    kaalSarp: {
      present: kaalSarpPresent,
      type: kaalSarpType,
      remedies: convertRemediesToStrings(kaalSarpDetailedRemedies),
      detailedRemedies: kaalSarpDetailedRemedies,
      impact: getDoshaImpact("kaalSarp", kaalSarpPresent, "Medium"),
      explanation: getDoshaExplanation("kaalSarp", { present: kaalSarpPresent, type: kaalSarpType }),
      severity: kaalSarpPresent ? "Medium" : "Low",
    },
    shani: {
      effects: shaniEffects,
      remedies: convertRemediesToStrings(shaniDetailedRemedies),
      detailedRemedies: shaniDetailedRemedies,
      period: shaniActive ? "Active" : undefined,
      explanation: getDoshaExplanation("shani", { period: shaniActive ? "Active" : undefined, effects: shaniEffects }),
      severity: shaniActive ? "Medium" : "Low",
    },
    rahuKetu: {
      effects: [
        "Rahu-Ketu axis affects life areas",
        "Spiritual growth opportunities",
        "Unexpected changes possible"
      ],
      remedies: convertRemediesToStrings(rahuKetuDetailedRemedies),
      detailedRemedies: rahuKetuDetailedRemedies,
      explanation: getDoshaExplanation("rahuKetu", { effects: ["Rahu-Ketu axis affects life areas"] }),
      severity: "Medium",
    },
    overall: manglikStatus === "Manglik" || kaalSarpPresent || totalDoshas > 0
      ? "Some doshas are present in your chart. Following recommended remedies can help mitigate their effects. For best results, consult an expert astrologer for personalized guidance and timing."
      : "Overall chart is well-balanced. Minor remedies may still be beneficial for specific goals and overall well-being.",
    recommendation,
    totalDoshas,
  };
}

export function generateKundliChart(input: BirthDetails): KundliChart {
  const seed = hash(`${input.dob}|${input.tob}|${input.place}`);
  const houses = Array.from({ length: 12 }, (_, i) => {
    const houseNum = i + 1;
    const signIdx = (seed + i * 13) % SIGNS.length;
    const planetCount = (seed + i * 7) % 4;
    const planets = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"]
      .slice(0, planetCount)
      .map((_, idx) => ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"][(seed + i * 11 + idx) % 9]);
    return {
      number: houseNum,
      sign: SIGNS[signIdx],
      planets
    };
  });
  
  const aspects = [
    { from: "Mars", to: "Jupiter", type: "Trine" },
    { from: "Saturn", to: "Sun", type: "Opposition" },
    { from: "Venus", to: "Moon", type: "Conjunction" }
  ];
  
  const dashas = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];
  const currentDasha = pick(dashas, seed);
  const nextDasha = dashas[(dashas.indexOf(currentDasha) + 1) % dashas.length];
  
  return {
    houses,
    aspects,
    dasha: {
      current: currentDasha,
      next: nextDasha,
      startDate: new Date(Date.now() - (seed % 365) * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    }
  };
}

export function matchKundli(a: BirthDetails, b: BirthDetails): MatchResult {
  const sa = hash(`${a.dob}|${a.tob}|${a.place}`);
  const sb = hash(`${b.dob}|${b.tob}|${b.place}`);
  const mix = sa ^ (sb << 1);

  const categories = [
    { category: "Varna", max: 1 }, { category: "Vashya", max: 2 }, { category: "Tara", max: 3 }, { category: "Yoni", max: 4 },
    { category: "Graha Maitri", max: 5 }, { category: "Gana", max: 6 }, { category: "Bhakoot", max: 7 }, { category: "Nadi", max: 8 }
  ];

  const breakdown = categories.map((c, i) => {
    const raw = (mix + i * 101) % (c.max * 100 + 1);
    const score = Math.round((raw / 100) * 2) / 2;
    const clamped = Math.max(0, Math.min(c.max, score));
    let note = "Balanced.";
    if (clamped >= c.max * 0.8) note = "Strong alignment.";
    else if (clamped <= c.max * 0.3) note = "Needs attention.";
    return { category: c.category, max: c.max, score: clamped, note };
  });

  const total = breakdown.reduce((s, x) => s + x.score, 0);
  const verdict: MatchResult["verdict"] = total >= 28 ? "Excellent" : total >= 22 ? "Good" : total >= 16 ? "Average" : "Challenging";

  const mangA = (sa % 7) <= 1 ? "Manglik" : "Non-Manglik";
  const mangB = (sb % 7) <= 1 ? "Manglik" : "Non-Manglik";
  const note = mangA === mangB ? "Manglik status aligns; remedies are optional depending on tradition." : "Manglik mismatch; consider remedies and a detailed consultation.";

  const guidance = [
    "Use the score as a signal—not a verdict. Communication and values matter most.",
    "If Bhakoot or Nadi is low, consult for context-specific remedies.",
    "Consider muhurat/date alignment once compatibility feels right."
  ];

  return { totalGuna: Math.round(total * 2) / 2, maxGuna: 36, verdict, breakdown, manglik: { a: mangA, b: mangB, note }, guidance };
}

export function dailyHoroscope(sign: string, date: string): HoroscopeDaily {
  const safeSign = SIGNS.includes(sign) ? sign : "Aries";
  const seed = hash(`${safeSign}|${date}`);
  const moods = ["Focused","Optimistic","Calm","Bold","Reflective","Playful"];
  const colors = ["Indigo","Emerald","Saffron","Crimson","Teal","Violet"];
  const textBlocks = [
    "Today favors small decisive moves. Focus on one priority and commit.",
    "A conversation unlocks progress. Ask one honest question and listen.",
    "Simplify your routine. Your energy improves when you reduce noise.",
    "Money decisions benefit from patience—delay impulse purchases.",
    "Relationships feel smoother when you state needs directly (without blame)."
  ];
  return { sign: safeSign, date, text: pick(textBlocks, seed), lucky: { color: pick(colors, seed + 3), number: (seed % 9) + 1, mood: pick(moods, seed + 9) } };
}

export function weeklyHoroscope(sign: string, weekOf: string): HoroscopeWeekly {
  const safeSign = SIGNS.includes(sign) ? sign : "Aries";
  const seed = hash(`${safeSign}|${weekOf}|weekly`);
  const summaries = [
    "A steady week for progress—win by consistency over intensity.",
    "Expect a key decision mid-week; choose clarity over speed.",
    "Relationships and collaborations become smoother with boundaries.",
    "A creative idea pays off—share it with someone practical.",
    "Reset your routine; better sleep improves everything."
  ];
  const focus = [
    "Career: prioritize one task daily.",
    "Love: be direct about needs.",
    "Money: avoid impulse buying.",
    "Health: protect sleep and hydration.",
    "Mind: reduce distractions."
  ];
  return { sign: safeSign, weekOf, summary: pick(summaries, seed), focus: [pick(focus, seed+1), pick(focus, seed+2), pick(focus, seed+3)] };
}

export function monthlyHoroscope(sign: string, month: string, year: number): HoroscopeMonthly {
  const safeSign = SIGNS.includes(sign) ? sign : "Aries";
  const seed = hash(`${safeSign}|${month}|${year}`);
  const overviews = [
    "This month brings opportunities for growth. Stay open to new experiences.",
    "Focus on relationships and communication. Important conversations await.",
    "Financial planning pays off. Review your budget and investments.",
    "Health and wellness take center stage. Establish healthy routines.",
    "Career advancement is possible. Showcase your skills confidently."
  ];
  const careers = [
    "New projects emerge. Take initiative and lead with confidence.",
    "Collaboration is key. Build alliances with colleagues.",
    "Recognition for your work is likely. Keep up the momentum.",
    "Challenges test your resilience. Stay focused on long-term goals.",
    "Opportunities for learning and growth present themselves."
  ];
  const loves = [
    "Romantic connections deepen. Express your feelings openly.",
    "Single? New connections are possible. Be open to meeting people.",
    "Communication strengthens bonds. Have honest conversations.",
    "Quality time with loved ones brings joy and fulfillment.",
    "Resolve any conflicts through understanding and compromise."
  ];
  const healths = [
    "Energy levels improve. Maintain a balanced routine.",
    "Focus on preventive care. Regular check-ups are beneficial.",
    "Stress management is important. Practice relaxation techniques.",
    "Physical activity boosts mood and energy. Stay active.",
    "Diet and nutrition play a key role. Eat mindfully."
  ];
  const finances = [
    "Financial stability improves. Save for future goals.",
    "Unexpected expenses may arise. Build an emergency fund.",
    "Investment opportunities look promising. Research carefully.",
    "Budgeting helps maintain control. Track your spending.",
    "Income may increase through new opportunities."
  ];
  const luckyDays = Array.from({ length: 5 }, (_, i) => ((seed + i * 7) % 28) + 1);
  return {
    sign: safeSign,
    month,
    year,
    overview: pick(overviews, seed),
    career: pick(careers, seed + 2),
    love: pick(loves, seed + 4),
    health: pick(healths, seed + 6),
    finance: pick(finances, seed + 8),
    luckyDays: luckyDays.sort((a, b) => a - b)
  };
}

export function yearlyHoroscope(sign: string, year: number): HoroscopeYearly {
  const safeSign = SIGNS.includes(sign) ? sign : "Aries";
  const seed = hash(`${safeSign}|${year}`);
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const events = [
    "Major career milestone",
    "Significant relationship development",
    "Financial breakthrough",
    "Health transformation",
    "Educational achievement",
    "Travel opportunity",
    "Family celebration",
    "Creative project completion"
  ];
  const importantMonths = Array.from({ length: 3 }, (_, i) => ({
    month: pick(months, seed + i * 13),
    event: pick(events, seed + i * 17)
  }));
  return {
    sign: safeSign,
    year,
    overview: `This year brings transformation and growth for ${safeSign}. Focus on long-term goals and maintain balance across all life areas.`,
    predictions: {
      career: "Professional growth is significant. New opportunities and recognition await those who take initiative.",
      love: "Relationships deepen and evolve. Single individuals may find meaningful connections.",
      health: "Overall wellness improves with attention to preventive care and healthy habits.",
      finance: "Financial stability strengthens. Smart investments and budgeting yield positive results.",
      family: "Family bonds strengthen. Important family events and celebrations bring joy."
    },
    importantMonths
  };
}

export function generatePanchang(date: string, place: string): Panchang {
  const seed = hash(`${date}|${place}`);
  const tithi = pick(TITHIS, seed);
  const nak = pick(NAKSHATRAS, seed + 5);
  const yogas = ["Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda", "Sukarma", "Dhriti", "Shula", "Ganda", "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyana", "Parigha", "Shiva", "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti"];
  const karanas = ["Bava", "Balava", "Kaulava", "Taitila", "Garija", "Vanija", "Visti", "Shakuni", "Chatushpada", "Naga", "Kimstughna"];
  const sunrise = `${6 + (seed % 2)}:${String(seed % 60).padStart(2, "0")}`;
  const sunset = `${18 + (seed % 2)}:${String((seed + 30) % 60).padStart(2, "0")}`;
  const moonrise = `${(seed % 12) + 12}:${String((seed * 7) % 60).padStart(2, "0")}`;
  const moonset = `${(seed % 12)}:${String((seed * 11) % 60).padStart(2, "0")}`;
  const rahuStart = `${(seed % 4) + 7}:${String((seed * 3) % 60).padStart(2, "0")}`;
  const rahuEnd = `${(seed % 4) + 9}:${String((seed * 5) % 60).padStart(2, "0")}`;
  const abhijitStart = `${11 + (seed % 2)}:${String((seed * 7) % 60).padStart(2, "0")}`;
  const abhijitEnd = `${12 + (seed % 2)}:${String((seed * 13) % 60).padStart(2, "0")}`;
  const auspiciousNames = ["Brahma Muhurat", "Abhijit Muhurat", "Godhuli Muhurat", "Amrit Kaal"];
  const auspiciousTimings = auspiciousNames.map((name, i) => ({
    name,
    start: `${(seed + i * 3) % 12 + 6}:${String((seed + i * 7) % 60).padStart(2, "0")}`,
    end: `${(seed + i * 3) % 12 + 7}:${String((seed + i * 11) % 60).padStart(2, "0")}`
  }));
  return {
    date,
    tithi,
    nakshatra: nak,
    yoga: pick(yogas, seed),
    karana: pick(karanas, seed),
    sunrise,
    sunset,
    moonrise,
    moonset,
    rahuKaal: { start: rahuStart, end: rahuEnd },
    abhijitMuhurat: { start: abhijitStart, end: abhijitEnd },
    auspiciousTimings
  };
}

export function findMuhurat(date: string, type: Muhurat["type"]): Muhurat {
  const seed = hash(`${date}|${type}`);
  const auspiciousTimings = Array.from({ length: 3 }, (_, i) => ({
    start: `${(seed + i * 4) % 12 + 6}:${String((seed + i * 7) % 60).padStart(2, "0")}`,
    end: `${(seed + i * 4) % 12 + 8}:${String((seed + i * 13) % 60).padStart(2, "0")}`,
    quality: pick(["Excellent", "Good", "Moderate"], seed + i)
  }));
  const avoidTimings = Array.from({ length: 2 }, (_, i) => ({
    start: `${(seed + i * 3) % 12 + 10}:${String((seed + i * 5) % 60).padStart(2, "0")}`,
    end: `${(seed + i * 3) % 12 + 12}:${String((seed + i * 11) % 60).padStart(2, "0")}`,
    reason: pick(["Rahu Kaal", "Inauspicious Tithi", "Planetary Conflict"], seed + i)
  }));
  return { date, type, auspiciousTimings, avoidTimings };
}

export function calculateNumerology(name: string, dob?: string): Numerology {
  const cleanName = name.toUpperCase().replace(/[^A-Z\s]/g, "").trim();
  const nameParts = cleanName.split(/\s+/).filter(p => p.length > 0);
  
  // Standard Pythagorean Numerology values (matches AstroSage)
  const values: Record<string, number> = {
    A: 1, I: 1, J: 1, Q: 1, Y: 1,
    B: 2, K: 2, R: 2,
    C: 3, G: 3, L: 3, S: 3,
    D: 4, M: 4, T: 4,
    E: 5, H: 5, N: 5, X: 5,
    U: 6, V: 6, W: 6,
    O: 7, Z: 7,
    F: 8, P: 8
  };
  
  const reduce = (n: number): number => {
    if (n === 0) return 0;
    if (n === 11 || n === 22 || n === 33) return n; // Master numbers
    return n > 9 ? reduce(Math.floor(n / 10) + (n % 10)) : n;
  };
  
  // Life Path Number: Sum of all digits in date of birth (DD/MM/YYYY)
  let lifePath = 0;
  if (dob) {
    const dobDigits = dob.replace(/[^0-9]/g, "");
    const dobSum = dobDigits.split("").reduce((sum, digit) => sum + parseInt(digit, 10), 0);
    lifePath = reduce(dobSum);
  } else {
    // Fallback: calculate from name if DOB not provided (not standard but for compatibility)
    const nameSum = cleanName.replace(/\s/g, "").split("").reduce((sum, char) => sum + (values[char] || 0), 0);
    lifePath = reduce(nameSum);
  }
  
  // Destiny Number (Expression Number): Sum of all letters in full name
  const fullName = nameParts.join("");
  const destinySum = fullName.split("").reduce((sum, char) => sum + (values[char] || 0), 0);
  const destiny = reduce(destinySum);
  
  // Soul Number (Heart's Desire): Sum of vowels in name
  const vowels = fullName.match(/[AEIOU]/g) || [];
  const soulSum = vowels.reduce((sum, char) => sum + (values[char] || 0), 0);
  const soul = reduce(soulSum);
  
  // Personality Number: Sum of consonants in name
  const consonants = fullName.match(/[BCDFGHJKLMNPQRSTVWXYZ]/g) || [];
  const personalitySum = consonants.reduce((sum, char) => sum + (values[char] || 0), 0);
  const personality = reduce(personalitySum);
  const analyses: Record<number, string> = {
    1: "Natural leader, independent, ambitious",
    2: "Cooperative, diplomatic, peacemaker",
    3: "Creative, expressive, optimistic",
    4: "Practical, organized, reliable",
    5: "Adventurous, freedom-loving, versatile",
    6: "Nurturing, responsible, harmonious",
    7: "Spiritual, analytical, introspective",
    8: "Ambitious, material success, powerful",
    9: "Compassionate, humanitarian, idealistic"
  };
  const luckyNumbers = [lifePath, destiny, soul, personality].filter((n, i, arr) => arr.indexOf(n) === i);
  const colors = ["Red", "Orange", "Yellow", "Green", "Blue", "Indigo", "Violet", "Pink", "Gold"];
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return {
    name,
    lifePathNumber: lifePath,
    destinyNumber: destiny,
    soulNumber: soul,
    personalityNumber: personality,
    analysis: {
      lifePath: analyses[lifePath] || "Unique path",
      destiny: analyses[destiny] || "Unique destiny",
      soul: analyses[soul] || "Unique soul",
      personality: analyses[personality] || "Unique personality"
    },
    luckyNumbers,
    luckyColors: [colors[lifePath - 1] || "White", colors[destiny - 1] || "Silver"],
    luckyDays: [days[lifePath % 7], days[destiny % 7]]
  };
}

export function getRemedies(planet: string, issue: string): Remedy[] {
  const seed = hash(`${planet}|${issue}`);
  const gemstones: Record<string, string> = {
    Sun: "Ruby", Moon: "Pearl", Mars: "Red Coral", Mercury: "Emerald",
    Jupiter: "Yellow Sapphire", Venus: "Diamond", Saturn: "Blue Sapphire",
    Rahu: "Hessonite", Ketu: "Cat's Eye"
  };
  const mantras: Record<string, string> = {
    Sun: "Om Suryaya Namaha", Moon: "Om Som Somaya Namaha",
    Mars: "Om Mangalaya Namaha", Mercury: "Om Budhaya Namaha",
    Jupiter: "Om Guruve Namaha", Venus: "Om Shukraya Namaha",
    Saturn: "Om Shanaishcharaya Namaha", Rahu: "Om Rahave Namaha",
    Ketu: "Om Ketave Namaha"
  };
  const remedies: Remedy[] = [
    {
      type: "Gemstone",
      name: gemstones[planet] || "Appropriate Gemstone",
      description: `Wear ${gemstones[planet] || "appropriate gemstone"} to strengthen ${planet}`,
      planet,
      instructions: [
        "Consult an astrologer for exact specifications",
        "Wear on the appropriate finger and day",
        "Purify the gemstone before wearing",
        "Remove during inauspicious periods"
      ],
      benefits: [`Strengthens ${planet}`, "Brings positive energy", "Reduces malefic effects"]
    },
    {
      type: "Mantra",
      name: `${planet} Mantra`,
      description: `Chant ${mantras[planet] || "planet-specific mantra"} regularly`,
      planet,
      instructions: [
        "Chant 108 times daily",
        "Best time: during planet's hour",
        "Maintain focus and devotion",
        "Continue for at least 40 days"
      ],
      benefits: ["Planetary blessings", "Mental peace", "Spiritual growth"]
    },
    {
      type: "Ritual",
      name: `${planet} Puja`,
      description: `Perform rituals dedicated to ${planet}`,
      planet,
      instructions: [
        "Choose an auspicious day",
        "Offer appropriate items (flowers, fruits, incense)",
        "Light a lamp with specific oil",
        "Pray with devotion"
      ],
      benefits: ["Planetary favor", "Removes obstacles", "Brings prosperity"]
    }
  ];
  return remedies.slice(0, 3);
}
