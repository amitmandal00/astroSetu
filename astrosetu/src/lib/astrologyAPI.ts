/**
 * Astrology API Abstraction Layer
 * Local-only engine (Prokerala removed)
 */

import type {
  BirthDetails,
  KundliResult,
  MatchResult,
  HoroscopeDaily,
  HoroscopeWeekly,
  HoroscopeMonthly,
  HoroscopeYearly,
  Panchang,
  Muhurat,
  Numerology,
  Remedy,
  DoshaAnalysis,
  KundliChart,
  Choghadiya,
} from "@/types/astrology";
import {
  generateKundli,
  matchKundli,
  dailyHoroscope,
  weeklyHoroscope,
  monthlyHoroscope,
  yearlyHoroscope,
  generatePanchang,
  findMuhurat,
  calculateNumerology,
  getRemedies,
  generateDoshaAnalysis,
  generateKundliChart,
} from "./astrologyEngine";

// Local engine is always available.
export const isAPIConfigured = () => true;

/**
 * Get Kundli (Birth Chart)
 */
export async function getKundli(
  input: BirthDetails
): Promise<KundliResult & { dosha: DoshaAnalysis | null; chart: KundliChart }> {
  const kundli = generateKundli(input);
  const dosha = generateDoshaAnalysis(input, kundli.planets);
  const chart = generateKundliChart(input);
  return { ...kundli, dosha, chart };
}

/**
 * Match Kundli (Guna Milan)
 */
export async function matchKundliAPI(
  a: BirthDetails,
  b: BirthDetails
): Promise<MatchResult & { doshaA: DoshaAnalysis; doshaB: DoshaAnalysis }> {
  const match = matchKundli(a, b);
  const kundliA = generateKundli(a);
  const kundliB = generateKundli(b);
  const doshaA = generateDoshaAnalysis(a, kundliA.planets);
  const doshaB = generateDoshaAnalysis(b, kundliB.planets);
  return { ...match, doshaA, doshaB };
}

/**
 * Get Horoscope
 */
export async function getHoroscope(
  mode: "daily" | "weekly" | "monthly" | "yearly",
  sign: string,
  date?: string,
  month?: string,
  year?: number
): Promise<HoroscopeDaily | HoroscopeWeekly | HoroscopeMonthly | HoroscopeYearly> {
  const dateStr = date || new Date().toISOString().slice(0, 10);
  if (mode === "weekly") return weeklyHoroscope(sign, dateStr);
  if (mode === "monthly") {
    return monthlyHoroscope(
      sign,
      month || new Date().toLocaleString("en-US", { month: "long" }),
      year || new Date().getFullYear()
    );
  }
  if (mode === "yearly") return yearlyHoroscope(sign, year || new Date().getFullYear());
  return dailyHoroscope(sign, dateStr);
}

/**
 * Get Panchang
 */
export async function getPanchangAPI(
  date: string,
  place: string,
  _latitude?: number,
  _longitude?: number
): Promise<Panchang> {
  return generatePanchang(date, place);
}

/**
 * Find Muhurat
 */
export async function findMuhuratAPI(date: string, type: Muhurat["type"]): Promise<Muhurat> {
  return findMuhurat(date, type);
}

/**
 * Get Choghadiya (Auspicious/Inauspicious Timings)
 */
export async function getChoghadiyaAPI(
  date: string,
  place: string,
  _latitude?: number,
  _longitude?: number
): Promise<Choghadiya> {
  return generateMockChoghadiya(date, place);
}

/**
 * Generate mock Choghadiya data for local fallback
 */
function generateMockChoghadiya(date: string, place: string): Choghadiya {
  const dayPeriods = [
    { type: "Shubh" as const, name: "Shubh", start: "06:00", end: "07:30", quality: "Auspicious" as const, activities: ["Starting new ventures", "Business activities", "Important meetings"], avoidActivities: [] },
    { type: "Labh" as const, name: "Labh", start: "07:30", end: "09:00", quality: "Auspicious" as const, activities: ["Financial transactions", "Buying/selling", "Starting business"], avoidActivities: [] },
    { type: "Amrit" as const, name: "Amrit", start: "09:00", end: "10:30", quality: "Auspicious" as const, activities: ["Religious activities", "Health treatments", "Education"], avoidActivities: [] },
    { type: "Chal" as const, name: "Chal", start: "10:30", end: "12:00", quality: "Moderate" as const, activities: ["Travel", "Movement"], avoidActivities: ["Important decisions"] },
    { type: "Kaal" as const, name: "Kaal", start: "12:00", end: "13:30", quality: "Inauspicious" as const, activities: [], avoidActivities: ["All important activities", "Starting new work"] },
    { type: "Rog" as const, name: "Rog", start: "13:30", end: "15:00", quality: "Inauspicious" as const, activities: [], avoidActivities: ["Health-related activities", "Medical treatments"] },
    { type: "Udveg" as const, name: "Udveg", start: "15:00", end: "16:30", quality: "Inauspicious" as const, activities: [], avoidActivities: ["Important meetings", "Decisions"] },
  ];

  const nightPeriods = [
    { type: "Shubh" as const, name: "Shubh", start: "18:00", end: "19:30", quality: "Auspicious" as const, activities: ["Evening prayers", "Family time"], avoidActivities: [] },
    { type: "Labh" as const, name: "Labh", start: "19:30", end: "21:00", quality: "Auspicious" as const, activities: ["Social gatherings", "Entertainment"], avoidActivities: [] },
    { type: "Amrit" as const, name: "Amrit", start: "21:00", end: "22:30", quality: "Auspicious" as const, activities: ["Meditation", "Spiritual activities"], avoidActivities: [] },
    { type: "Chal" as const, name: "Chal", start: "22:30", end: "00:00", quality: "Moderate" as const, activities: ["Travel"], avoidActivities: ["Important activities"] },
  ];

  return {
    date,
    place,
    dayPeriods,
    nightPeriods,
  };
}

/**
 * Calculate Numerology
 */
export async function calculateNumerologyAPI(name: string, dob?: string): Promise<Numerology> {
  return calculateNumerology(name, dob);
}

/**
 * Get Remedies
 */
export async function getRemediesAPI(planet: string, issue: string): Promise<Remedy[]> {
  return getRemedies(planet, issue);
}

/**
 * Get Dasha Periods (Vimshottari Dasha)
 */
export async function getDashaPeriods(_input: BirthDetails): Promise<any> {
  return {
    current: {
      planet: "Jupiter",
      period: "16 years",
      startDate: "2020-01-01",
      endDate: "2036-01-01",
      description: "Jupiter Dasha brings wisdom and spiritual growth.",
    },
    next: {
      planet: "Saturn",
      period: "19 years",
      startDate: "2036-01-01",
      endDate: "2055-01-01",
      description: "Saturn Dasha brings discipline and karmic lessons.",
    },
    antardashas: [],
  };
}

/**
 * Get Dosha Analysis (standalone)
 */
export async function getDoshaAnalysis(input: BirthDetails): Promise<DoshaAnalysis> {
  const kundli = generateKundli(input);
  return generateDoshaAnalysis(input, kundli.planets);
}

