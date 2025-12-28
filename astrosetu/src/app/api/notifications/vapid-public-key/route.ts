import { NextResponse } from "next/server";
import { checkRateLimit, successResponse, errorResponse } from "@/lib/apiHelpers";

// Force dynamic rendering since we use request headers for rate limiting
export const dynamic = 'force-dynamic';

/**
 * GET /api/notifications/vapid-public-key
 * Returns the VAPID public key for web push notifications
 * 
 * The public key is safe to expose to clients.
 * The private key should be stored in VAPID_PRIVATE_KEY env variable.
 */
export async function GET(req: Request) {
  try {
    // Rate limiting
    const rateLimitResponse = checkRateLimit(req, "/api/notifications/vapid-public-key");
    if (rateLimitResponse) return rateLimitResponse;

    // Get VAPID public key from environment
    // Format: VAPID_PUBLIC_KEY should be a URL-safe base64 string
    const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;

    if (!vapidPublicKey) {
      // In development, we can generate a placeholder or return an error
      // For production, VAPID keys must be configured
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "VAPID_PUBLIC_KEY not configured. Web push notifications will not work."
        );
        return errorResponse(
          "VAPID keys not configured. Please set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY environment variables.",
          503
        );
      }
      return errorResponse("Push notifications not configured", 503);
    }

    return successResponse({ publicKey: vapidPublicKey });
  } catch (error: any) {
    console.error("Error getting VAPID public key:", error);
    return errorResponse(
      error?.message ?? "Failed to get VAPID public key",
      500
    );
  }
}
