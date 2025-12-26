/**
 * Consent Logging Client Helpers
 * 
 * Functions to log user consent for legal documents.
 * This ensures compliance and provides an audit trail.
 */

export type ConsentType = "terms" | "privacy" | "cookies" | "ai";
export type Source = "web" | "ios" | "android";

interface ConsentLogPayload {
  userId?: string | null;
  sessionId: string;
  source?: Source;
  consentType: ConsentType;
  granted: boolean;
  documentVersion: string;
  documentUrl: string;
  metadata?: Record<string, any>;
}

/**
 * Get or create a session ID for anonymous users
 */
export function getSessionId(): string {
  const key = "astrosetu_session_id";
  
  if (typeof window === "undefined") {
    // Server-side: generate a new ID (this should rarely happen)
    return crypto.randomUUID();
  }
  
  let sessionId = localStorage.getItem(key);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(key, sessionId);
  }
  return sessionId;
}

/**
 * Log consent for a legal document
 */
export async function logConsent(
  consentType: ConsentType,
  granted: boolean,
  documentVersion: string,
  documentUrl: string,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    const sessionId = getSessionId();
    
    // Try to get user ID from session storage or auth context
    // This is a placeholder - you should integrate with your auth system
    const userId = typeof window !== "undefined" 
      ? sessionStorage.getItem("user_id") || null
      : null;
    
    // Detect source (default to web)
    let source: Source = "web";
    if (typeof window !== "undefined" && navigator.userAgent) {
      const ua = navigator.userAgent.toLowerCase();
      if (ua.includes("android")) {
        source = "android";
      } else if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("ipod")) {
        source = "ios";
      }
    }
    
    const payload: ConsentLogPayload = {
      userId: userId || null,
      sessionId,
      source,
      consentType,
      granted,
      documentVersion,
      documentUrl,
      metadata: metadata || {}
    };
    
    const response = await fetch("/api/consent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      console.error("Failed to log consent:", await response.text());
      // Don't throw - consent logging failures shouldn't break the app
    }
  } catch (error) {
    console.error("Error logging consent:", error);
    // Don't throw - consent logging failures shouldn't break the app
  }
}

/**
 * Log terms acceptance
 */
export async function logTermsAcceptance(version: string): Promise<void> {
  await logConsent("terms", true, version, "/terms");
}

/**
 * Log privacy policy acceptance
 */
export async function logPrivacyAcceptance(version: string): Promise<void> {
  await logConsent("privacy", true, version, "/privacy");
}

/**
 * Log cookie preferences
 */
export async function logCookiePreferences(
  granted: boolean,
  version: string,
  preferences?: Record<string, boolean>
): Promise<void> {
  await logConsent("cookies", granted, version, "/cookies", { preferences });
}

/**
 * Log AI processing consent
 */
export async function logAIConsent(granted: boolean, version: string): Promise<void> {
  await logConsent("ai", granted, version, "/privacy", {
    type: "ai_processing"
  });
}

