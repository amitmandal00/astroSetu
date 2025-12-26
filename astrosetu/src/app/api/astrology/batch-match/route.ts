import { NextResponse } from "next/server";
import { matchKundliAPI } from "@/lib/astrologyAPI";
import type { BatchMatchRequest, BatchMatchResponse, BirthDetails } from "@/types/astrology";
import { checkRateLimit, handleApiError, parseJsonBody, validateRequestSize } from "@/lib/apiHelpers";
import { generateRequestId } from "@/lib/requestId";

/**
 * POST /api/astrology/batch-match
 * Batch Kundli Matching (up to 500 profiles)
 */
export async function POST(req: Request) {
  const requestId = generateRequestId();
  
  try {
    // Rate limiting
    const rateLimitResponse = checkRateLimit(req, '/api/astrology/batch-match');
    if (rateLimitResponse) {
      rateLimitResponse.headers.set('X-Request-ID', requestId);
      return rateLimitResponse;
    }
    
    // Validate request size (larger for batch requests)
    validateRequestSize(req.headers.get('content-length'), 500 * 1024); // 500KB max
    
    // Parse and validate request body
    const json = await parseJsonBody<BatchMatchRequest>(req);
    
    // Validate required fields
    if (!json.primaryProfile || !json.profiles || !Array.isArray(json.profiles)) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields: primaryProfile, profiles (array)" },
        { status: 400, headers: { 'X-Request-ID': requestId } }
      );
    }
    
    if (!json.primaryProfile.dob || !json.primaryProfile.tob || !json.primaryProfile.place) {
      return NextResponse.json(
        { ok: false, error: "primaryProfile missing required fields: dob, tob, place" },
        { status: 400, headers: { 'X-Request-ID': requestId } }
      );
    }
    
    // Validate profiles array
    if (json.profiles.length === 0) {
      return NextResponse.json(
        { ok: false, error: "profiles array cannot be empty" },
        { status: 400, headers: { 'X-Request-ID': requestId } }
      );
    }
    
    // Limit to 500 profiles
    const maxProfiles = json.maxResults || 500;
    const profilesToProcess = json.profiles.slice(0, Math.min(maxProfiles, 500));
    
    if (profilesToProcess.length !== json.profiles.length) {
      console.warn(`[AstroSetu] Batch match: Limiting to ${maxProfiles} profiles (requested ${json.profiles.length})`);
    }
    
    // Process matches
    const results: BatchMatchResponse["results"] = [];
    const primaryName = json.primaryProfile.name || "Primary Profile";
    
    // Process in batches to avoid overwhelming the API
    const batchSize = 10; // Process 10 at a time
    for (let i = 0; i < profilesToProcess.length; i += batchSize) {
      const batch = profilesToProcess.slice(i, i + batchSize);
      
      // Process batch in parallel
      const batchResults = await Promise.all(
        batch.map(async (profile) => {
          try {
            if (!profile.birthDetails.dob || !profile.birthDetails.tob || !profile.birthDetails.place) {
              return {
                profileId: profile.id,
                name: profile.name,
                matchScore: 0,
                totalGuna: 0,
                verdict: "Challenging" as const,
                breakdown: [],
                manglik: { status: "Non-Manglik" as const, compatible: false },
                summary: "Invalid birth details",
              };
            }
            
            const match = await matchKundliAPI(json.primaryProfile, profile.birthDetails);
            
            return {
              profileId: profile.id,
              name: profile.name,
              matchScore: match.totalGuna,
              totalGuna: match.totalGuna,
              verdict: match.verdict,
              breakdown: match.breakdown,
              nakshatraPorutham: match.nakshatraPorutham,
              manglik: {
                status: match.manglik.a === "Manglik" ? "Manglik" as const : "Non-Manglik" as const,
                compatible: match.manglik.a === match.manglik.b,
              },
              summary: `Compatibility score: ${match.totalGuna}/36. ${match.verdict} match. ${match.manglik.note}`,
            };
          } catch (error: any) {
            console.error(`[AstroSetu] Batch match error for profile ${profile.id}:`, error);
            return {
              profileId: profile.id,
              name: profile.name,
              matchScore: 0,
              totalGuna: 0,
              verdict: "Challenging" as const,
              breakdown: [],
              manglik: { status: "Non-Manglik" as const, compatible: false },
              summary: `Error: ${error?.message || "Failed to calculate match"}`,
            };
          }
        })
      );
      
      results.push(...batchResults);
    }
    
    // Sort by match score (highest first)
    results.sort((a, b) => b.matchScore - a.matchScore);
    
    // Get best matches (top 10)
    const bestMatches = results.slice(0, 10);
    
    // Calculate summary statistics
    const summary = {
      excellent: results.filter(r => r.verdict === "Excellent").length,
      good: results.filter(r => r.verdict === "Good").length,
      average: results.filter(r => r.verdict === "Average").length,
      challenging: results.filter(r => r.verdict === "Challenging").length,
    };
    
    const response: BatchMatchResponse = {
      primaryProfile: {
        name: primaryName,
        birthDetails: json.primaryProfile,
      },
      results,
      totalProcessed: results.length,
      bestMatches,
      summary,
    };
    
    return NextResponse.json(
      { ok: true, data: response },
      { headers: { 'X-Request-ID': requestId } }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

