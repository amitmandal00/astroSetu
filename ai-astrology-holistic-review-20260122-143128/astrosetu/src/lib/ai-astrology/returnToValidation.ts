/**
 * ReturnTo Validation Utility
 * Validates returnTo paths to prevent open redirect vulnerabilities
 */

/**
 * Check if a returnTo path is safe
 * 
 * Rules:
 * - Must start with /ai-astrology/
 * - Must not contain protocol-relative URLs (//)
 * - Must not contain encoded protocol variants (%3A%2F%2F, %2F%2F)
 * - Allows querystrings (e.g., ?session_id=...)
 * 
 * @param path - The returnTo path to validate
 * @returns true if path is safe, false otherwise
 */
export function isSafeReturnTo(path: string): boolean {
  if (!path || typeof path !== "string") {
    return false;
  }

  const sanitized = path.trim();

  // Must start with /ai-astrology/
  if (!sanitized.startsWith("/ai-astrology/")) {
    return false;
  }

  // Block protocol-relative URLs (//example.com)
  if (sanitized.startsWith("//")) {
    return false;
  }

  // Block encoded protocol variants (decode first to check)
  try {
    const decoded = decodeURIComponent(sanitized);
    // Block http://, https://, or // anywhere in the path (even if encoded)
    if (decoded.includes("://") || decoded.includes("//")) {
      return false;
    }
  } catch {
    // If decoding fails, check original string for encoded variants
    if (sanitized.includes("%3A%2F%2F") || sanitized.includes("%2F%2F")) {
      return false;
    }
  }

  // Path is safe
  return true;
}

