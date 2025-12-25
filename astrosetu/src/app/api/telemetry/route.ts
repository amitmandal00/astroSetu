import { NextResponse } from "next/server";
import { generateRequestId } from "@/lib/requestId";
import { createServerClient, isSupabaseConfigured } from "@/lib/supabase";

export async function POST(req: Request) {
  const requestId = generateRequestId();
  try {
    const body = await req.json().catch(() => ({}));
    const { type, payload, ts } = body ?? {};

    // Log to console (always)
    console.log("[telemetry]", JSON.stringify({ requestId, type, ts, payload }));

    // Store in database if Supabase is configured
    if (isSupabaseConfigured()) {
      try {
        const supabase = createServerClient();
        await supabase.from("telemetry_events").insert({
          event_type: type,
          payload: payload || {},
          timestamp: ts ? new Date(ts).toISOString() : new Date().toISOString(),
          request_id: requestId,
          metadata: {
            user_agent: req.headers.get("user-agent"),
            ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip"),
          },
        });
      } catch (dbError) {
        // Don't fail if DB insert fails, just log
        console.warn("[telemetry] Failed to store in database:", dbError);
      }
    }

    return NextResponse.json({ ok: true, requestId });
  } catch (error: any) {
    console.error("[telemetry] failed", error?.message || error);
    return NextResponse.json(
      { ok: false, error: "Failed to record telemetry", requestId },
      { status: 500 }
    );
  }
}

