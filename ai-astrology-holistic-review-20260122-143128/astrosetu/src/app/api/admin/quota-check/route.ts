import { NextResponse } from "next/server";
import { prokeralaRequest } from "@/lib/astrologyAPI";

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
    
    // Use the existing prokeralaRequest function which handles token management
    const result = await prokeralaRequest(
      "/panchang",
      {
        datetime: {
          year: testDate.getFullYear(),
          month: testDate.getMonth() + 1,
          day: testDate.getDate(),
        },
        coordinates: "28.6139,77.2090",
        timezone: "Asia/Kolkata",
      },
      0, // No retries for monitoring call
      "GET",
      true // Skip cache for accurate quota check
    ).catch((error) => {
      // If API call fails, return error info
      return { error: error.message, status: "error" };
    });

    // Note: Prokerala API may not return quota headers in response
    // This endpoint serves as a connectivity check
    // For actual quota monitoring, check Prokerala dashboard or API documentation
    
    const isHealthy = !result.error && result.status !== "error";

    return NextResponse.json({
      status: isHealthy ? "ok" : "error",
      message: isHealthy
        ? "✅ Prokerala API is accessible and responding"
        : `⚠️ Prokerala API check failed: ${result.error || "Unknown error"}`,
      note: "Quota information is not available in API response headers. Check Prokerala dashboard for quota usage.",
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

