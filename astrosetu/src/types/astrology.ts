export type BirthDetails = {
  name?: string;
  gender?: "Male" | "Female";
  day?: number;
  month?: number;
  year?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
  dob: string;  // YYYY-MM-DD (computed from day/month/year)
  tob: string;  // HH:mm:ss (computed from hours/minutes/seconds)
  place: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  ayanamsa?: number; // 1 = Lahiri (default, matches AstroSage), 3 = Raman, 5 = KP, etc.
};

export type PlanetPosition = {
  name: string;
  sign: string;
  degree: number;
  house: number;
  retrograde: boolean;
};

export type KundliResult = {
  ascendant: string;
  rashi: string;
  nakshatra: string;
  tithi: string;
  planets: PlanetPosition[];
  summary: string[];
};

export type GunaBreakdownItem = {
  category: string;
  max: number;
  score: number;
  note: string;
};

export type NakshatraPorutham = {
  totalScore: number;
  maxScore: number;
  compatibility: "Excellent" | "Good" | "Average" | "Challenging";
  points: Array<{
    nakshatra: string;
    score: number;
    maxScore: number;
    note: string;
    compatibility: "Excellent" | "Good" | "Average" | "Challenging";
  }>;
  summary: string;
  remedies?: string[];
};

export type MatchResult = {
  totalGuna: number;
  maxGuna: number;
  verdict: "Excellent" | "Good" | "Average" | "Challenging";
  breakdown: GunaBreakdownItem[];
  manglik: { a: "Non-Manglik" | "Manglik"; b: "Non-Manglik" | "Manglik"; note: string };
  guidance: string[];
  nakshatraPorutham?: NakshatraPorutham; // Enhanced with Nakshatra Porutham
};

export type HoroscopeDaily = {
  sign: string;
  date: string;
  text: string;
  lucky: { color: string; number: number; mood: string };
};

export type HoroscopeWeekly = {
  sign: string;
  weekOf: string; // YYYY-MM-DD
  summary: string;
  focus: string[];
};

export type Astrologer = {
  id: string;
  name: string;
  title: string;
  bio: string;
  skills: string[];
  languages: string[];
  pricePerMin: number;
  isOnline: boolean;
  ratingAvg: number;
  ratingCount: number;
  experienceYears: number;
  totalConsultations?: number;
};

export type ChatSession = {
  id: string;
  userName: string;
  astrologerId: string;
  status: "active" | "ended";
  createdAt: number;
};

export type ChatMessage = {
  id: string;
  sessionId: string;
  sender: "user" | "astrologer" | "system";
  text: string;
  createdAt: number;
};

export type PujaService = {
  id: string;
  name: string;
  description: string;
  deity: string;
  duration: string;
  price: number;
  benefits: string[];
  image?: string;
};

export type LiveSession = {
  id: string;
  title: string;
  astrologerId: string;
  astrologerName: string;
  startTime: number;
  endTime: number;
  type: "webinar" | "class" | "workshop";
  topic: string;
  price: number;
  attendees: number;
  maxAttendees: number;
  status: "upcoming" | "live" | "completed";
};

export type CommunityPost = {
  id: string;
  userId: string;
  userName: string;
  title: string;
  content: string;
  category: "question" | "discussion" | "experience" | "help";
  likes: number;
  replies: number;
  createdAt: number;
  tags: string[];
};

export type AIInsight = {
  category: string;
  insight: string;
  confidence: number;
  recommendations: string[];
  relatedPlanets: string[];
};

export type Wallet = {
  balance: number;
  currency: "INR";
  transactions: Array<{
    id: string;
    type: "credit" | "debit";
    amount: number;
    description: string;
    timestamp: number;
  }>;
};

export type Panchang = {
  date: string;
  tithi: string;
  nakshatra: string;
  yoga: string;
  karana: string;
  sunrise: string;
  sunset: string;
  moonrise: string;
  moonset: string;
  rahuKaal: { start: string; end: string };
  abhijitMuhurat: { start: string; end: string };
  auspiciousTimings: { name: string; start: string; end: string }[];
};

export type Choghadiya = {
  date: string;
  place: string;
  dayPeriods: Array<{
    type: "Shubh" | "Labh" | "Amrit" | "Chal" | "Kaal" | "Rog" | "Udveg";
    name: string;
    start: string;
    end: string;
    quality: "Auspicious" | "Moderate" | "Inauspicious";
    activities: string[];
    avoidActivities: string[];
  }>;
  nightPeriods: Array<{
    type: "Shubh" | "Labh" | "Amrit" | "Chal" | "Kaal" | "Rog" | "Udveg";
    name: string;
    start: string;
    end: string;
    quality: "Auspicious" | "Moderate" | "Inauspicious";
    activities: string[];
    avoidActivities: string[];
  }>;
};

export type CalendarSystem = "Amanta" | "Purnimanta" | "VikramSamvat" | "Shaka" | "Gregorian";

export type Muhurat = {
  date: string;
  type: "Marriage" | "GrihaPravesh" | "Vehicle" | "Business" | "Education" | "Travel";
  auspiciousTimings: { start: string; end: string; quality: string }[];
  avoidTimings: { start: string; end: string; reason: string }[];
};

export type Numerology = {
  name: string;
  lifePathNumber: number;
  destinyNumber: number;
  soulNumber: number;
  personalityNumber: number;
  analysis: {
    lifePath: string;
    destiny: string;
    soul: string;
    personality: string;
  };
  luckyNumbers: number[];
  luckyColors: string[];
  luckyDays: string[];
};

export type Remedy = {
  type: "Gemstone" | "Mantra" | "Ritual" | "Yantra" | "Donation" | "Fasting";
  name: string;
  description: string;
  planet: string;
  instructions: string[];
  benefits: string[];
};

export type HoroscopeMonthly = {
  sign: string;
  month: string;
  year: number;
  overview: string;
  career: string;
  love: string;
  health: string;
  finance: string;
  luckyDays: number[];
};

export type HoroscopeYearly = {
  sign: string;
  year: number;
  overview: string;
  predictions: {
    career: string;
    love: string;
    health: string;
    finance: string;
    family: string;
  };
  importantMonths: { month: string; event: string }[];
};

export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  birthDetails?: BirthDetails;
  createdAt: number;
  savedKundlis?: string[];
  savedMatches?: string[];
};

export type ConsultationType = "chat" | "call" | "video";

// Enhanced Dosha types with comprehensive remedies
export type RemedyDetail = {
  type: "Mantra" | "Puja" | "Gemstone" | "Donation" | "Fasting" | "Ritual" | "Yantra" | "Other";
  name: string;
  description: string;
  instructions: string[];
  timing?: string;
  duration?: string;
  benefits: string[];
  frequency?: string;
  priority?: "High" | "Medium" | "Low";
};

export type DoshaAnalysis = {
  manglik: { 
    status: "Manglik" | "Non-Manglik"; 
    severity: "High" | "Medium" | "Low"; 
    remedies: string[];
    detailedRemedies?: RemedyDetail[];
    impact?: string[];
    house?: number;
    explanation?: string;
  };
  kaalSarp: { 
    present: boolean; 
    type?: string; 
    remedies: string[];
    detailedRemedies?: RemedyDetail[];
    impact?: string[];
    explanation?: string;
    severity?: "High" | "Medium" | "Low";
  };
  shani: { 
    effects: string[]; 
    remedies: string[];
    detailedRemedies?: RemedyDetail[];
    period?: string;
    explanation?: string;
    severity?: "High" | "Medium" | "Low";
  };
  rahuKetu: { 
    effects: string[]; 
    remedies: string[];
    detailedRemedies?: RemedyDetail[];
    explanation?: string;
    severity?: "High" | "Medium" | "Low";
  };
  pitra?: {
    present: boolean;
    effects: string[];
    remedies: string[];
    detailedRemedies?: RemedyDetail[];
    explanation?: string;
  };
  overall: string;
  recommendation?: string;
  totalDoshas?: number;
};

export type KundliChart = {
  houses: Array<{ number: number; sign: string; planets: string[] }>;
  aspects: Array<{ from: string; to: string; type: string }>;
  dasha: { current: string; next: string; startDate: string };
};
