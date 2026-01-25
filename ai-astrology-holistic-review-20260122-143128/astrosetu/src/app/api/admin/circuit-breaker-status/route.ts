import { NextResponse } from "next/server";
import { getAllCircuitBreakerStats } from "@/lib/circuitBreaker";

/**
 * GET /api/admin/circuit-breaker-status
 * Get circuit breaker status for all services
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
    const stats = getAllCircuitBreakerStats();
    
    // Determine overall health
    const hasOpenCircuit = Object.values(stats).some(s => s.state === "open");
    const hasHalfOpenCircuit = Object.values(stats).some(s => s.state === "half-open");
    const overallStatus = hasOpenCircuit ? "degraded" : hasHalfOpenCircuit ? "recovering" : "healthy";

    return NextResponse.json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      circuits: stats,
      summary: {
        total: Object.keys(stats).length,
        open: Object.values(stats).filter(s => s.state === "open").length,
        halfOpen: Object.values(stats).filter(s => s.state === "half-open").length,
        closed: Object.values(stats).filter(s => s.state === "closed").length,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Failed to get circuit breaker status",
        message: error?.message || "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

