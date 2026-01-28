import { NextResponse } from "next/server";

/**
 * GET /api/health
 * Health check endpoint for monitoring
 */
export async function GET(req: Request) {
  const startTime = Date.now();
  
  try {
    // Check basic health
    const health = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      astrologyEngine: "local",
      version: "1.0.0",
    };

    const responseTime = Date.now() - startTime;
    
    return NextResponse.json(
      {
        ...health,
        responseTime: `${responseTime}ms`,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error?.message || "Unknown error",
      },
      { status: 503 }
    );
  }
}

