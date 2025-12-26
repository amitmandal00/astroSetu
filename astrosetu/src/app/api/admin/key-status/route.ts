import { NextResponse } from "next/server";
import { checkAllKeys, getAllKeyAlerts, getKeyExpirationMonitor } from "@/lib/keyExpirationMonitor";

/**
 * GET /api/admin/key-status
 * Check status of all monitored API keys
 * Requires ADMIN_API_KEY in Authorization header
 */
export async function GET(req: Request) {
  // Check authentication
  const authHeader = req.headers.get("authorization");
  const adminKey = process.env.ADMIN_API_KEY;
  
  if (!adminKey) {
    return NextResponse.json(
      { error: "Admin API key not configured. Set ADMIN_API_KEY environment variable." },
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
    const monitor = getKeyExpirationMonitor();
    const results = checkAllKeys();
    const alerts = getAllKeyAlerts();
    const summary = monitor.getSummary();

    // Determine overall status
    const hasExpired = summary.expired > 0;
    const hasExpiringSoon = summary.expiringSoon > 0;
    const hasCritical = alerts.some(a => a.severity === "critical");
    
    let overallStatus: "healthy" | "warning" | "critical" = "healthy";
    if (hasExpired || hasCritical) {
      overallStatus = "critical";
    } else if (hasExpiringSoon) {
      overallStatus = "warning";
    }

    return NextResponse.json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      summary,
      keys: results,
      alerts,
      message: hasExpired
        ? `🚨 CRITICAL: ${summary.expired} key(s) have expired!`
        : hasExpiringSoon
        ? `⚠️ WARNING: ${summary.expiringSoon} key(s) expiring soon`
        : "✅ All keys are healthy",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Failed to check key status",
        message: error?.message || "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

