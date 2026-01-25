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
import { createHash } from "crypto";
import { matchAllowlist, normalizeDOB, normalizeTime, normalizeGender } from './betaAccess';

const buildInputFingerprintSuffix = (dob?: string, time?: string, gender?: string, place?: string): string => {
  const canonical = [
    dob?.trim().toLowerCase() || "",
    time?.trim().toLowerCase() || "",
    gender?.trim().toLowerCase() || "",
    place?.trim().toLowerCase() || "",
  ].join("|");
  if (!canonical) return "none";
  const digest = createHash("sha256").update(canonical).digest("hex");
  return digest.slice(-6);
};

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
  
  // Use betaAccess matching (which requires name, dob, time, place, gender)
  // AIAstrologyInput uses 'tob' (time of birth), while betaAccess uses 'time'
  // Handle both field names for compatibility
  const timeValue = ('time' in input && input.time) 
    ? input.time 
    : ('tob' in input && input.tob) 
      ? input.tob 
      : '';

  // For minimum matching: at least name + DOB should be provided
  // If only name is provided, we can't match properly, so return false
  // This ensures we don't accidentally allow users who just happen to have similar names
  if (!input.dob) {
    // Log for debugging but don't include PII
    console.log("[PROD_ALLOWLIST] Name provided but DOB missing - cannot verify", {
      inputFingerprintSuffix: buildInputFingerprintSuffix(input.dob, timeValue, input.gender, input.place),
      hasDOB: false,
      hasTime: !!timeValue,
      hasPlace: !!input.place,
      hasGender: !!input.gender,
    });
    return false;
  }

  // CRITICAL FIX (2026-01-18): Log input fields before matching for debugging
  const inputForMatch = {
    name: input.name || '',
    dob: input.dob || '',
    time: timeValue || '',
    place: input.place || '',
    gender: input.gender || '',
  };
  
  console.log("[PROD_ALLOWLIST] Matching input", {
    inputFingerprintSuffix: buildInputFingerprintSuffix(inputForMatch.dob, inputForMatch.time, inputForMatch.gender, inputForMatch.place),
    hasDOB: !!inputForMatch.dob,
    hasTime: !!inputForMatch.time,
    hasPlace: !!inputForMatch.place,
    hasGender: !!inputForMatch.gender,
  });

  // CRITICAL FIX (2026-01-18): matchAllowlist now supports partial matching (fixed in betaAccess.ts)
  // Required: name + DOB (minimum for payment bypass)
  // Optional: time, gender, place (only checked if provided and normalized)
  // This allows test users to bypass payment even when gender/time/place are missing
  
  // If some fields are missing, matchAllowlist will return false (safe)
  const hasAccess = matchAllowlist(inputForMatch);
  
  if (!hasAccess) {
    // CRITICAL FIX (2026-01-18): Log why matching failed to help diagnose
    const normalized = {
      dob: inputForMatch.dob ? normalizeDOB(inputForMatch.dob) : null,
      time: inputForMatch.time ? normalizeTime(inputForMatch.time) : null,
      gender: inputForMatch.gender ? normalizeGender(inputForMatch.gender) : null,
    };
    
    console.log("[PROD_ALLOWLIST] No match found", {
      inputFingerprintSuffix: buildInputFingerprintSuffix(inputForMatch.dob, inputForMatch.time, inputForMatch.gender, inputForMatch.place),
      hasDOB: !!normalized.dob,
      hasTime: !!normalized.time,
      hasGender: !!normalized.gender,
    });
  }

  return hasAccess;
}

