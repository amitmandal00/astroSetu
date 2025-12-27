/**
 * Payment Token Utility
 * Generates and verifies short-lived tokens for paid report access
 * Prevents unauthorized access to premium reports
 */

import crypto from "crypto";

const SECRET_KEY = process.env.AI_ASTROLOGY_TOKEN_SECRET || process.env.NEXTAUTH_SECRET || "default-secret-change-in-production";
const TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

export interface PaymentTokenData {
  reportType: string;
  sessionId: string;
  issuedAt: number;
  expiresAt: number;
}

/**
 * Generate a payment verification token
 */
export function generatePaymentToken(reportType: string, sessionId: string): string {
  const issuedAt = Date.now();
  const expiresAt = issuedAt + TOKEN_EXPIRY_MS;

  const payload: PaymentTokenData = {
    reportType,
    sessionId,
    issuedAt,
    expiresAt,
  };

  // Create a simple token: base64(JSON) + signature
  const payloadString = JSON.stringify(payload);
  const payloadBase64 = Buffer.from(payloadString).toString("base64");

  // Create HMAC signature
  const signature = crypto
    .createHmac("sha256", SECRET_KEY)
    .update(payloadBase64)
    .digest("hex");

  // Return token: payload.signature
  return `${payloadBase64}.${signature}`;
}

/**
 * Verify and decode a payment token
 */
export function verifyPaymentToken(token: string): PaymentTokenData | null {
  try {
    const [payloadBase64, signature] = token.split(".");

    if (!payloadBase64 || !signature) {
      return null;
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac("sha256", SECRET_KEY)
      .update(payloadBase64)
      .digest("hex");

    if (signature !== expectedSignature) {
      return null;
    }

    // Decode payload
    const payloadString = Buffer.from(payloadBase64, "base64").toString("utf-8");
    const payload: PaymentTokenData = JSON.parse(payloadString);

    // Check expiry
    if (Date.now() > payload.expiresAt) {
      return null;
    }

    return payload;
  } catch (error) {
    console.error("[PaymentToken] Verification error:", error);
    return null;
  }
}

/**
 * Check if a report type requires payment
 */
export function isPaidReportType(reportType: string): boolean {
  return reportType !== "life-summary";
}

