/**
 * Private Beta Access Control
 * Server-only utilities for normalizing and matching user input against allowlist
 * MUST NOT be imported in client components (will leak allowlist)
 */

/**
 * Allowed users (stored server-side only)
 * Format: { name, dob, time, place, gender }
 * All values are normalized for matching
 */
const ALLOWLIST: Array<{
  name: string;
  dob: string; // YYYY-MM-DD
  time: string; // HH:mm (24h)
  place: string; // Normalized place string
  gender: "Male" | "Female";
}> = [
  {
    name: "amit kumar mandal",
    dob: "1984-11-26",
    time: "21:40",
    place: "noamundi, jharkhand",
    gender: "Male",
  },
  {
    name: "ankita surabhi",
    dob: "1988-07-01",
    time: "17:58",
    place: "ranchi, jharkhand",
    gender: "Female",
  },
];

/**
 * Normalize name: lowercase, collapse spaces, trim
 */
export function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Normalize DOB: accept various formats, convert to YYYY-MM-DD
 * Supports: "26 nov 1984", "1984-11-26", "26/11/1984", etc.
 */
export function normalizeDOB(dob: string): string | null {
  if (!dob) return null;

  // Already in YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(dob.trim())) {
    return dob.trim();
  }

  // Try parsing as Date (handles most formats)
  const parsed = new Date(dob);
  if (!isNaN(parsed.getTime())) {
    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, "0");
    const day = String(parsed.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // Try parsing "dd mon yyyy" format (e.g., "26 nov 1984")
  const monthNames: { [key: string]: string } = {
    jan: "01", january: "01",
    feb: "02", february: "02",
    mar: "03", march: "03",
    apr: "04", april: "04",
    may: "05",
    jun: "06", june: "06",
    jul: "07", july: "07",
    aug: "08", august: "08",
    sep: "09", september: "09",
    oct: "10", october: "10",
    nov: "11", november: "11",
    dec: "12", december: "12",
  };

  const parts = dob.toLowerCase().trim().split(/\s+/);
  if (parts.length >= 3) {
    const day = parts[0].replace(/[^\d]/g, "");
    const monthName = parts[1].replace(/[^\d]/g, "");
    const year = parts[2].replace(/[^\d]/g, "");

    if (day && monthNames[monthName] && year) {
      return `${year}-${monthNames[monthName]}-${day.padStart(2, "0")}`;
    }
  }

  return null;
}

/**
 * Normalize time: accept "09:40 pm", "21:40", etc., convert to HH:mm (24h)
 */
export function normalizeTime(time: string): string | null {
  if (!time) return null;

  const cleaned = time.toLowerCase().trim();
  
  // Already in 24h format (HH:mm)
  if (/^\d{1,2}:\d{2}$/.test(cleaned)) {
    const [hours, minutes] = cleaned.split(":").map(Number);
    if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    }
  }

  // Try parsing 12h format (e.g., "09:40 pm", "9:40pm", "9:40 PM")
  const match = cleaned.match(/^(\d{1,2}):(\d{2})\s*(am|pm)?$/);
  if (match) {
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const ampm = match[3] || "";

    if (ampm === "pm" && hours !== 12) {
      hours += 12;
    } else if (ampm === "am" && hours === 12) {
      hours = 0;
    }

    if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    }
  }

  return null;
}

/**
 * Normalize place: lowercase, collapse spaces, trim
 * Allows "Noamundi, Jharkhand" to match "Noamundi, Jharkhand, India"
 */
export function normalizePlace(place: string): string {
  return place
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Normalize gender: accept "Male", "Female", "M", "F", etc.
 */
export function normalizeGender(gender: string): "Male" | "Female" | null {
  const cleaned = gender.toLowerCase().trim();
  if (cleaned === "male" || cleaned === "m") return "Male";
  if (cleaned === "female" || cleaned === "f") return "Female";
  return null;
}

/**
 * Check if normalized user input matches any allowlist entry
 * CRITICAL FIX (2026-01-18): Allow partial matching for payment bypass
 * - Required: name + dob must normalize successfully
 * - Optional: time, gender, place only checked if provided + normalizes
 * This allows test users to bypass payment even when gender/time/place are missing
 */
export function matchAllowlist(input: {
  name: string;
  dob: string;
  time: string;
  place: string;
  gender: string;
}): boolean {
  const normalized = {
    name: normalizeName(input.name),
    dob: normalizeDOB(input.dob),
    time: normalizeTime(input.time || ''),
    place: normalizePlace(input.place || ''),
    gender: normalizeGender(input.gender || ''),
  };

  // CRITICAL FIX (2026-01-18): Require only name + DOB (payment bypass minimum)
  // Optional fields (time, gender, place) only checked if provided and normalized
  if (!normalized.dob) {
    return false; // DOB is required for matching
  }

  // Check against allowlist
  for (const allowed of ALLOWLIST) {
    // Name and DOB must match exactly (required)
    if (allowed.name !== normalized.name || allowed.dob !== normalized.dob) {
      continue;
    }

    // Optional field matching: only check if provided + normalized
    // Time: if provided, must match
    const timeMatches = !normalized.time || normalized.time === allowed.time;
    if (!timeMatches) {
      continue;
    }

    // Gender: if provided, must match
    const genderMatches = !normalized.gender || normalized.gender === allowed.gender;
    if (!genderMatches) {
      continue;
    }

    // Place: if provided, must include allowed.place (or vice versa)
    // This allows "Noamundi, Jharkhand" to match "Noamundi, Jharkhand, India"
    const placeMatches =
      !normalized.place ||
      normalized.place.includes(allowed.place) ||
      allowed.place.includes(normalized.place);

    if (placeMatches) {
      return true;
    }
  }

  return false;
}

/**
 * Get allowlist count (for logging/debugging, not actual entries)
 */
export function getAllowlistCount(): number {
  return ALLOWLIST.length;
}

