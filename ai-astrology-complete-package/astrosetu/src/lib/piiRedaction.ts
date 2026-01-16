/**
 * PII (Personally Identifiable Information) Redaction
 * Redacts sensitive data from logs and error messages
 */

/**
 * Redact date of birth from string
 */
export function redactDOB(text: string): string {
  // Redact dates in YYYY-MM-DD format
  return text.replace(/\d{4}-\d{2}-\d{2}/g, '[DOB_REDACTED]');
}

/**
 * Redact time of birth from string
 */
export function redactTOB(text: string): string {
  // Redact times in HH:MM:SS or HH:MM format
  return text.replace(/\d{2}:\d{2}(:\d{2})?/g, '[TOB_REDACTED]');
}

/**
 * Redact place name (keep only first letter)
 */
export function redactPlace(text: string): string {
  // Redact place names (words that might be place names)
  // This is a simple implementation - can be enhanced
  return text.replace(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g, (match) => {
    // Keep first letter, redact rest
    return match.charAt(0) + '*'.repeat(match.length - 1);
  });
}

/**
 * Redact all PII from a string
 */
export function redactPII(text: string): string {
  let redacted = text;
  redacted = redactDOB(redacted);
  redacted = redactTOB(redacted);
  redacted = redactPlace(redacted);
  return redacted;
}

/**
 * Redact PII from an object (for logging)
 */
export function redactPIIFromObject(obj: any): any {
  if (typeof obj !== 'object' || obj === null) {
    return typeof obj === 'string' ? redactPII(obj) : obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(redactPIIFromObject);
  }

  const redacted: any = {};
  for (const [key, value] of Object.entries(obj)) {
    // Redact sensitive fields
    if (key.toLowerCase().includes('dob') || 
        key.toLowerCase().includes('birth') ||
        key.toLowerCase().includes('date')) {
      redacted[key] = '[DOB_REDACTED]';
    } else if (key.toLowerCase().includes('tob') || 
               key.toLowerCase().includes('time')) {
      redacted[key] = '[TOB_REDACTED]';
    } else if (key.toLowerCase().includes('place') || 
               key.toLowerCase().includes('location')) {
      redacted[key] = '[PLACE_REDACTED]';
    } else if (typeof value === 'string') {
      redacted[key] = redactPII(value);
    } else if (typeof value === 'object') {
      redacted[key] = redactPIIFromObject(value);
    } else {
      redacted[key] = value;
    }
  }

  return redacted;
}

