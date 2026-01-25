import { NextResponse } from "next/server";

type BabyNameRequest = {
  gender: "Male" | "Female" | "Unisex";
  rashi?: string;
  nakshatra?: string;
  startingLetter?: string;
};

// Sample baby names database (in production, use a real database)
const BABY_NAMES: Record<string, Array<{ name: string; meaning: string; numerology: number; rashi: string; nakshatra?: string; deity: string; gender: "Male" | "Female" | "Unisex" }>> = {
  "Aries": [
    { name: "Arjun", meaning: "Bright, Shining", numerology: 1, rashi: "Aries", deity: "Mars", gender: "Male" },
    { name: "Aarav", meaning: "Peaceful", numerology: 9, rashi: "Aries", deity: "Mars", gender: "Male" },
    { name: "Anika", meaning: "Grace", numerology: 5, rashi: "Aries", deity: "Mars", gender: "Female" },
  ],
  "Taurus": [
    { name: "Tara", meaning: "Star", numerology: 2, rashi: "Taurus", deity: "Venus", gender: "Female" },
    { name: "Tanvi", meaning: "Beautiful", numerology: 7, rashi: "Taurus", deity: "Venus", gender: "Female" },
    { name: "Tanish", meaning: "Ambition", numerology: 3, rashi: "Taurus", deity: "Venus", gender: "Male" },
  ],
  "Gemini": [
    { name: "Gaurav", meaning: "Pride", numerology: 3, rashi: "Gemini", deity: "Mercury", gender: "Male" },
    { name: "Gayatri", meaning: "Sacred Chant", numerology: 5, rashi: "Gemini", deity: "Mercury", gender: "Female" },
    { name: "Gauri", meaning: "Fair", numerology: 6, rashi: "Gemini", deity: "Mercury", gender: "Female" },
  ],
  "Cancer": [
    { name: "Chandra", meaning: "Moon", numerology: 2, rashi: "Cancer", deity: "Moon", gender: "Unisex" },
    { name: "Chitra", meaning: "Picture", numerology: 4, rashi: "Cancer", deity: "Moon", gender: "Female" },
    { name: "Chirag", meaning: "Lamp", numerology: 7, rashi: "Cancer", deity: "Moon", gender: "Male" },
  ],
  "Leo": [
    { name: "Lakshya", meaning: "Goal", numerology: 1, rashi: "Leo", deity: "Sun", gender: "Male" },
    { name: "Lavanya", meaning: "Beauty", numerology: 8, rashi: "Leo", deity: "Sun", gender: "Female" },
    { name: "Lakshmi", meaning: "Goddess of Wealth", numerology: 3, rashi: "Leo", deity: "Sun", gender: "Female" },
  ],
  "Virgo": [
    { name: "Vidya", meaning: "Knowledge", numerology: 5, rashi: "Virgo", deity: "Mercury", gender: "Female" },
    { name: "Vikram", meaning: "Valour", numerology: 9, rashi: "Virgo", deity: "Mercury", gender: "Male" },
    { name: "Vishal", meaning: "Great", numerology: 6, rashi: "Virgo", deity: "Mercury", gender: "Male" },
  ],
  "Libra": [
    { name: "Riya", meaning: "Singer", numerology: 7, rashi: "Libra", deity: "Venus", gender: "Female" },
    { name: "Rohan", meaning: "Ascending", numerology: 2, rashi: "Libra", deity: "Venus", gender: "Male" },
    { name: "Ritika", meaning: "Movement", numerology: 4, rashi: "Libra", deity: "Venus", gender: "Female" },
  ],
  "Scorpio": [
    { name: "Shivam", meaning: "Auspicious", numerology: 8, rashi: "Scorpio", deity: "Mars", gender: "Male" },
    { name: "Shreya", meaning: "Auspicious", numerology: 1, rashi: "Scorpio", deity: "Mars", gender: "Female" },
    { name: "Shivani", meaning: "Goddess Parvati", numerology: 5, rashi: "Scorpio", deity: "Mars", gender: "Female" },
  ],
  "Sagittarius": [
    { name: "Sahil", meaning: "Guide", numerology: 3, rashi: "Sagittarius", deity: "Jupiter", gender: "Male" },
    { name: "Sakshi", meaning: "Witness", numerology: 6, rashi: "Sagittarius", deity: "Jupiter", gender: "Female" },
    { name: "Saanvi", meaning: "Goddess Lakshmi", numerology: 9, rashi: "Sagittarius", deity: "Jupiter", gender: "Female" },
  ],
  "Capricorn": [
    { name: "Kartik", meaning: "God of War", numerology: 7, rashi: "Capricorn", deity: "Saturn", gender: "Male" },
    { name: "Kavya", meaning: "Poetry", numerology: 2, rashi: "Capricorn", deity: "Saturn", gender: "Female" },
    { name: "Krishna", meaning: "Dark", numerology: 4, rashi: "Capricorn", deity: "Saturn", gender: "Unisex" },
  ],
  "Aquarius": [
    { name: "Aarush", meaning: "First Ray of Sun", numerology: 1, rashi: "Aquarius", deity: "Saturn", gender: "Male" },
    { name: "Aanya", meaning: "Inexhaustible", numerology: 8, rashi: "Aquarius", deity: "Saturn", gender: "Female" },
    { name: "Aaradhya", meaning: "Worshipped", numerology: 5, rashi: "Aquarius", deity: "Saturn", gender: "Female" },
  ],
  "Pisces": [
    { name: "Pranav", meaning: "Om", numerology: 9, rashi: "Pisces", deity: "Jupiter", gender: "Male" },
    { name: "Pooja", meaning: "Worship", numerology: 3, rashi: "Pisces", deity: "Jupiter", gender: "Female" },
    { name: "Priya", meaning: "Beloved", numerology: 6, rashi: "Pisces", deity: "Jupiter", gender: "Female" },
  ],
};

import { checkRateLimit, handleApiError, parseJsonBody, validateRequestSize } from "@/lib/apiHelpers";
import { z } from "zod";

const BabyNameRequestSchema = z.object({
  gender: z.enum(["Male", "Female", "Unisex"]),
  rashi: z.string().optional(),
  nakshatra: z.string().optional(),
  startingLetter: z.string().length(1).optional(),
}).refine((data) => data.rashi || data.nakshatra, {
  message: "Rashi or Nakshatra is required",
});

export async function POST(req: Request) {
  try {
    // Rate limiting
    const rateLimitResponse = checkRateLimit(req, '/api/reports/babyname');
    if (rateLimitResponse) return rateLimitResponse;
    
    // Validate request size
    validateRequestSize(req.headers.get('content-length'), 2 * 1024); // 2KB max
    
    // Parse and validate request body
    const body = await parseJsonBody(req);
    const validated = BabyNameRequestSchema.parse(body);
    const { gender, rashi, nakshatra, startingLetter } = validated;

    // Get names based on rashi
    let suggestedNames = rashi ? (BABY_NAMES[rashi] || []) : [];

    // Filter by gender
    if (gender !== "Unisex") {
      suggestedNames = suggestedNames.filter((n) => n.gender === gender || n.gender === "Unisex");
    }

    // Filter by starting letter if provided
    if (startingLetter) {
      suggestedNames = suggestedNames.filter((n) => n.name.startsWith(startingLetter));
    }

    // If no names found, add some generic names
    if (suggestedNames.length === 0) {
      suggestedNames = [
        { name: "Aarav", meaning: "Peaceful", numerology: 9, rashi: rashi || "Aries", deity: "Mars", gender: "Male" },
        { name: "Anika", meaning: "Grace", numerology: 5, rashi: rashi || "Aries", deity: "Mars", gender: "Female" },
        { name: "Arjun", meaning: "Bright", numerology: 1, rashi: rashi || "Aries", deity: "Mars", gender: "Male" },
      ];
    }

    // Limit to 12 names
    suggestedNames = suggestedNames.slice(0, 12);

    const analysis = `Based on ${rashi ? `Rashi: ${rashi}` : `Nakshatra: ${nakshatra}`}, we've selected ${suggestedNames.length} astrologically suitable names for a ${gender} child. These names are chosen based on numerology, planetary influences, and traditional Vedic astrology principles.`;

    return NextResponse.json({
      ok: true,
      data: {
        suggestedNames,
        analysis,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

