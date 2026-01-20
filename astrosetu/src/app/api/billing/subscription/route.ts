import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/apiHelpers";
import { generateRequestId } from "@/lib/requestId";
import { isStripeConfigured } from "@/lib/ai-astrology/payments";
import {
  getSubscriptionBySessionId,
  upsertSubscriptionFromStripe,
  derivePlanIntervalFromStripe,
  mapStripeStatus,
  getCurrentPeriodEndIsoFromStripe,
} from "@/lib/billing/subscriptionStore";
import { getBillingSessionIdFromRequest } from "@/lib/billing/sessionCookie";

// CRITICAL FIX (2026-01-18): Force dynamic rendering to prevent caching and ensure proper route handling
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/billing/subscription?session_id=cs_xxx
 *
 * Source-of-truth contract: returns DB state (Supabase) if present.
 * Fallback: if not found in DB, fetch from Stripe and upsert (best-effort).
 */
export async function GET(req: Request) {
  const requestId = generateRequestId();

  try {
    const rateLimitResponse = checkRateLimit(req, "/api/billing/subscription");
    if (rateLimitResponse) {
      rateLimitResponse.headers.set("X-Request-ID", requestId);
      return rateLimitResponse;
    }

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("session_id") || getBillingSessionIdFromRequest(req);
    if (!sessionId) {
      // CRITICAL FIX (2026-01-18): Return 200 with status: "none" instead of 400 for missing session
      // "No session" is normal for unauthenticated users, not an error condition
      // This prevents UI from treating it as a hard failure and reduces noisy error logs
      return NextResponse.json(
        { ok: true, status: "none", requestId },
        { headers: { "X-Request-ID": requestId, "Cache-Control": "no-cache" } }
      );
    }

    // DEV/TEST SAFETY: Allow "test_session_subscription_*" and "prodtest_subscription_*" to behave like an active subscription without Stripe/Supabase.
    // CRITICAL FIX: Handle both demo test sessions and production test user sessions
    if (sessionId.startsWith("test_session_subscription_") || sessionId.startsWith("prodtest_subscription_")) {
      const periodEnd = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(); // +30 days
      return NextResponse.json(
        {
          ok: true,
          data: {
            status: "active",
            planInterval: "month",
            cancelAtPeriodEnd: false,
            currentPeriodEnd: periodEnd,
          },
          requestId,
        },
        { headers: { "X-Request-ID": requestId, "Cache-Control": "no-cache" } }
      );
    }

    // 1) DB-first
    const existing = await getSubscriptionBySessionId(sessionId);
    if (existing) {
      return NextResponse.json(
        {
          ok: true,
          data: {
            status: existing.status,
            planInterval: existing.plan_interval,
            cancelAtPeriodEnd: existing.cancel_at_period_end,
            currentPeriodEnd: existing.current_period_end,
          },
          requestId,
        },
        { headers: { "X-Request-ID": requestId, "Cache-Control": "no-cache" } }
      );
    }

    // 2) Stripe fallback (best-effort backfill)
    if (!isStripeConfigured()) {
      return NextResponse.json(
        { ok: true, data: { status: "unknown", planInterval: "unknown", cancelAtPeriodEnd: false, currentPeriodEnd: null }, requestId },
        { headers: { "X-Request-ID": requestId, "Cache-Control": "no-cache" } }
      );
    }

    const Stripe = (await import("stripe")).default;
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey || secretKey.startsWith("pk_")) {
      return NextResponse.json({ ok: false, error: "Stripe misconfigured", requestId }, { status: 500 });
    }

    const stripe = new Stripe(secretKey);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!session || session.mode !== "subscription" || !session.subscription) {
      return NextResponse.json(
        { ok: true, data: { status: "unknown", planInterval: "unknown", cancelAtPeriodEnd: false, currentPeriodEnd: null }, requestId },
        { headers: { "X-Request-ID": requestId, "Cache-Control": "no-cache" } }
      );
    }

    const subId = typeof session.subscription === "string" ? session.subscription : session.subscription.id;
    const sub = await stripe.subscriptions.retrieve(subId);

    const row = await upsertSubscriptionFromStripe({
      sessionId,
      stripeCustomerId: (session.customer as any) ? String(session.customer) : null,
      stripeSubscriptionId: subId,
      status: mapStripeStatus(sub.status),
      cancelAtPeriodEnd: !!sub.cancel_at_period_end,
      currentPeriodEndIso: getCurrentPeriodEndIsoFromStripe(sub),
      planInterval: derivePlanIntervalFromStripe(sub),
    });

    return NextResponse.json(
      {
        ok: true,
        data: {
          status: row?.status || mapStripeStatus(sub.status),
          planInterval: row?.plan_interval || derivePlanIntervalFromStripe(sub),
          cancelAtPeriodEnd: row?.cancel_at_period_end ?? !!sub.cancel_at_period_end,
          currentPeriodEnd: row?.current_period_end ?? getCurrentPeriodEndIsoFromStripe(sub),
        },
        requestId,
      },
      { headers: { "X-Request-ID": requestId, "Cache-Control": "no-cache" } }
    );
  } catch (e: any) {
    // CRITICAL FIX (2026-01-18): Ensure all errors return JSON responses, not redirects
    // Log error for debugging but return JSON to prevent Next.js from redirecting to error page
    console.error("[billing] /api/billing/subscription error:", e?.message || e);
    return NextResponse.json(
      { ok: false, error: e?.message || "Failed to load subscription", requestId },
      { status: 400, headers: { "X-Request-ID": requestId } }
    );
  }
}


