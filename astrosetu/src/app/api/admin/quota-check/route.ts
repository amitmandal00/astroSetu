import { NextResponse } from "next/server";
import { getAPICredentials, prokeralaRequest } from "@/lib/astrologyAPI";

/**
 * GET /api/admin/quota-check
 * Check Prokerala API quota usage
 * Requires ADMIN_API_KEY in Authorization header
 */
export async function GET(req: Request) {
  // Check authentication
  const authHeader = req.headers.get("authorization");
  const adminKey = process.env.ADMIN_API_KEY;
  
  if (!adminKey) {
    return NextResponse.json(
      { error: "Admin API key not configured" },
      { status: 500 }
    );
  }

  if (!authHeader || authHeader !== `Bearer ${adminKey}`) {
    return NextResponse.json(
      { error: "Unauthorized. Provide Authorization: Bearer <ADMIN_API_KEY>" },
      { status: 401 }
    );
  }

  try {
    // Make a lightweight test API call to check quota
    // Using panchang as it's a simple GET request
    const testDate = new Date();
    const response = await fetch(
      `https://api.prokerala.com/v2/astrology/panchang?` +
      `datetime=${testDate.getFullYear()}-${String(testDate.getMonth() + 1).padStart(2, '0')}-${String(testDate.getDate()).padStart(2, '0')}` +
      `&coordinates=28.6139,77.2090&timezone=Asia/Kolkata`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${await getProkeralaToken()}`,
        },
      }
    ).catch(() => null);

    // Extract quota info from headers (if available)
    const quotaUsed = response?.headers.get("x-ratelimit-used");
    const quotaLimit = response?.headers.get("x-ratelimit-limit");
    const quotaRemaining = response?.headers.get("x-ratelimit-remaining");
    const quotaReset = response?.headers.get("x-ratelimit-reset");

    // Calculate percentage
    const percentageUsed = quotaLimit && quotaUsed
      ? Math.round((parseInt(quotaUsed) / parseInt(quotaLimit)) * 100)
      : null;

    // Determine alert status
    const alertThreshold = 80; // Alert at 80% usage
    const needsAlert = percentageUsed !== null && percentageUsed >= alertThreshold;

    return NextResponse.json({
      status: response?.status === 200 ? "ok" : "error",
      quota: {
        used: quotaUsed ? parseInt(quotaUsed) : null,
        limit: quotaLimit ? parseInt(quotaLimit) : null,
        remaining: quotaRemaining ? parseInt(quotaRemaining) : null,
        reset: quotaReset ? parseInt(quotaReset) : null,
        percentageUsed,
        alert: needsAlert,
        message: needsAlert
          ? `⚠️ Quota usage at ${percentageUsed}% - Consider monitoring usage`
          : percentageUsed !== null
          ? `✅ Quota usage at ${percentageUsed}% - Healthy`
          : "⚠️ Quota information not available in API response",
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Failed to check quota",
        message: error?.message || "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * Helper to get Prokerala access token
 * This is a simplified version - in production, use the actual token caching logic
 */
async function getProkeralaToken(): Promise<string> {
  const CLIENT_ID = process.env.PROKERALA_CLIENT_ID;
  const CLIENT_SECRET = process.env.PROKERALA_CLIENT_SECRET;

  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error("Prokerala credentials not configured");
  }

  try {
    const response = await fetch("https://api.prokerala.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),
    });

    if (!response.ok) {
      throw new Error(`Token request failed: ${response.status}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    throw new Error(`Failed to get Prokerala token: ${error}`);
  }
}

