import { NextResponse } from "next/server";
import { isAPIConfigured } from "@/lib/astrologyAPI";
import { isSupabaseConfigured } from "@/lib/supabase";

/**
 * GET /api/admin/status
 * Comprehensive system status check for monitoring
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

  const startTime = Date.now();
  
  try {
    // Check system components
    const checks = {
      prokerala: {
        configured: isAPIConfigured(),
        status: isAPIConfigured() ? "ok" : "not_configured",
      },
      supabase: {
        configured: isSupabaseConfigured(),
        status: isSupabaseConfigured() ? "ok" : "not_configured",
      },
      sentry: {
        configured: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
        status: process.env.NEXT_PUBLIC_SENTRY_DSN ? "ok" : "not_configured",
      },
      environment: {
        nodeEnv: process.env.NODE_ENV || "development",
        hasAdminKey: !!adminKey,
      },
    };

    // Determine overall status
    const criticalServicesOk = checks.prokerala.configured && checks.supabase.configured;
    const overallStatus = criticalServicesOk ? "healthy" : "degraded";

    const responseTime = Date.now() - startTime;

    return NextResponse.json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      responseTime: `${responseTime}ms`,
      checks,
      version: "1.0.0",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        error: error?.message || "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

