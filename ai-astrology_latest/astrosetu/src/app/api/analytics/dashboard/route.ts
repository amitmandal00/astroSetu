import { NextResponse } from "next/server";
import { createServerClient, isSupabaseConfigured } from "@/lib/supabase";
import { checkRateLimit } from "@/lib/apiHelpers";

/**
 * Simple analytics dashboard endpoint
 * Returns aggregated telemetry data for internal dashboard
 */
export async function GET(req: Request) {
  try {
    // Rate limiting
    const rateLimitResponse = checkRateLimit(req, '/api/analytics/dashboard');
    if (rateLimitResponse) return rateLimitResponse;
    
    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        ok: true,
        data: {
          message: "Analytics dashboard requires Supabase. Events are currently logged to console.",
          events: [],
          summary: {},
        },
      });
    }
    
    const supabase = createServerClient();
    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get("days") || "7");
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Get events from database
    const { data: events, error } = await supabase
      .from("telemetry_events")
      .select("*")
      .gte("timestamp", startDate.toISOString())
      .order("timestamp", { ascending: false })
      .limit(1000);
    
    if (error) {
      console.error("Failed to fetch telemetry events:", error);
      return NextResponse.json({
        ok: true,
        data: {
          message: "Analytics data not available",
          events: [],
          summary: {},
        },
      });
    }
    
    // Aggregate events
    const summary: Record<string, number> = {};
    const eventTypes: Record<string, number> = {};
    
    events?.forEach((event) => {
      const type = event.event_type || "unknown";
      eventTypes[type] = (eventTypes[type] || 0) + 1;
      
      // Count specific important events
      if (type.includes("kundli_generated")) {
        summary.kundliGenerated = (summary.kundliGenerated || 0) + 1;
      }
      if (type.includes("subscription")) {
        summary.subscriptionEvents = (summary.subscriptionEvents || 0) + 1;
      }
      if (type.includes("auth")) {
        summary.authEvents = (summary.authEvents || 0) + 1;
      }
      if (type.includes("payment")) {
        summary.paymentEvents = (summary.paymentEvents || 0) + 1;
      }
    });
    
    return NextResponse.json({
      ok: true,
      data: {
        period: `${days} days`,
        totalEvents: events?.length || 0,
        eventTypes,
        summary: {
          kundliGenerated: summary.kundliGenerated || 0,
          subscriptionEvents: summary.subscriptionEvents || 0,
          authEvents: summary.authEvents || 0,
          paymentEvents: summary.paymentEvents || 0,
        },
        recentEvents: events?.slice(0, 50) || [],
      },
    });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message ?? "Failed to get analytics" }, { status: 500 });
  }
}
