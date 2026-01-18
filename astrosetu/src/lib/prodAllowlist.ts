/**
 * Production Test User Allowlist
 * Single source of truth for production test user checks
 * Server-only (MUST NOT be imported in client components)
 * 
 * Test users (as per ChatGPT requirements):
 * - Amit Kumar Mandal / 26 Nov 1984 / 9:40pm / Noamundi, Jharkhand / Male
 * - Ankita Surabhi / 01 Jul 1988 / 05:58pm / Ranchi, Jharkhand / Female
 */

import type { AIAstrologyInput } from './ai-astrology/types';
import { matchAllowlist, normalizeDOB, normalizeTime, normalizeGender } from './betaAccess';

/**
 * Check if user input matches production test user allowlist
 * Uses same matching logic as betaAccess for consistency
 * 
 * @param input - User input (can be partial - name minimum, full details optional)
 * @returns true if user matches allowlist
 */
export function isProdTestUser(input: AIAstrologyInput | { name?: string; dob?: string; time?: string; tob?: string; place?: string; gender?: string }): boolean {
  if (!input || !input.name) {
    return false;
  }

  // Use comprehensive matching from betaAccess (name, dob, time, place, gender)
  // This is more strict than the old checkIfTestUser which only checked name
  // But ChatGPT specifically requested matching based on name, DOB, time, place, and gender
  
  // For minimum matching: at least name + DOB should be provided
  // If only name is provided, we can't match properly, so return false
  // This ensures we don't accidentally allow users who just happen to have similar names
  if (!input.dob) {
    // Log for debugging but don't match (missing DOB)
    console.log(`[PROD_ALLOWLIST] Name provided but DOB missing - cannot verify: ${input.name}`);
    return false;
  }

  // Use betaAccess matching (which requires name, dob, time, place, gender)
  // AIAstrologyInput uses 'tob' (time of birth), while betaAccess uses 'time'
  // Handle both field names for compatibility
  const timeValue = ('time' in input && input.time) 
    ? input.time 
    : ('tob' in input && input.tob) 
      ? input.tob 
      : '';

  // CRITICAL FIX (2026-01-18): Log input fields before matching for debugging
  const inputForMatch = {
    name: input.name || '',
    dob: input.dob || '',
    time: timeValue || '',
    place: input.place || '',
    gender: input.gender || '',
  };
  
  console.log(`[PROD_ALLOWLIST] Matching input:`, {
    name: inputForMatch.name.substring(0, 20),
    hasDOB: !!inputForMatch.dob,
    hasTime: !!inputForMatch.time,
    hasPlace: !!inputForMatch.place,
    hasGender: !!inputForMatch.gender,
    dob: inputForMatch.dob || 'N/A',
    time: inputForMatch.time || 'N/A',
    gender: inputForMatch.gender || 'N/A',
    place: inputForMatch.place?.substring(0, 30) || 'N/A',
  });

  // CRITICAL FIX (2026-01-18): matchAllowlist requires ALL fields (dob, time, gender) to be normalized
  // If any are missing, it returns false. This is causing test users to fail matching.
  // For test users in production, we need to ensure all fields are present OR make matching more lenient
  
  // If some fields are missing, matchAllowlist will return false (safe)
  const hasAccess = matchAllowlist(inputForMatch);
  
  if (!hasAccess) {
    // CRITICAL FIX (2026-01-18): Log why matching failed to help diagnose
    const normalized = {
      dob: inputForMatch.dob ? normalizeDOB(inputForMatch.dob) : null,
      time: inputForMatch.time ? normalizeTime(inputForMatch.time) : null,
      gender: inputForMatch.gender ? normalizeGender(inputForMatch.gender) : null,
    };
    
    console.log(`[PROD_ALLOWLIST] No match found for user: ${inputForMatch.name.substring(0, 20)}`, {
      normalizedDOB: normalized.dob || 'FAILED/MISSING',
      normalizedTime: normalized.time || 'FAILED/MISSING',
      normalizedGender: normalized.gender || 'FAILED/MISSING',
      missingFields: [
        !normalized.dob && 'dob',
        !normalized.time && 'time',
        !normalized.gender && 'gender',
      ].filter(Boolean),
    });
  }

  return hasAccess;
}

