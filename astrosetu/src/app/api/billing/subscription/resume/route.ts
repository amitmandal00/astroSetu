import { NextResponse } from "next/server";
import { checkRateLimit, parseJsonBody } from "@/lib/apiHelpers";
import { generateRequestId } from "@/lib/requestId";
import { isStripeConfigured } from "@/lib/ai-astrology/payments";
import {
  getSubscriptionBySessionId,
  upsertSubscriptionFromStripe,
  derivePlanIntervalFromStripe,
  mapStripeStatus,
  getCurrentPeriodEndIsoFromStripe,
} from "@/lib/billing/subscriptionStore";
import { buildBillingSessionCookie, getBillingSessionIdFromRequest } from "@/lib/billing/sessionCookie";

/**
 * POST /api/billing/subscription/resume
 * Body: { session_id: string }
 *
 * Resumes (undo cancel_at_period_end) — idempotent.
 */
export async function POST(req: Request) {
  const requestId = generateRequestId();
  try {
    const rateLimitResponse = checkRateLimit(req, "/api/billing/subscription/resume");
    if (rateLimitResponse) {
      rateLimitResponse.headers.set("X-Request-ID", requestId);
      return rateLimitResponse;
    }

    let json: { session_id?: string } = {};
    try {
      json = await parseJsonBody<{ session_id?: string }>(req);
    } catch {
      // Allow empty body when session id is provided via HttpOnly cookie
      json = {};
    }
    const sessionId = json.session_id || getBillingSessionIdFromRequest(req);
    if (!sessionId) {
      return NextResponse.json({ ok: false, error: "session_id is required", requestId }, { status: 400 });
    }

    // CRITICAL FIX (2026-01-18): Handle test/demo sessions that don't exist in Stripe
    // DEV/TEST SAFETY: Allow "test_session_subscription_*" and "prodtest_subscription_*" to be resumed without Stripe calls
    // CRITICAL FIX: Handle both demo test sessions and production test user sessions
    if (sessionId.startsWith("test_session_subscription_") || sessionId.startsWith("prodtest_subscription_")) {
      const periodEnd = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(); // +30 days
      // Return success with cancel_at_period_end=false to simulate resume
      return NextResponse.json(
        {
          ok: true,
          data: {
            status: "active",
            planInterval: "month",
            cancelAtPeriodEnd: false, // Resumed - no longer canceled
            currentPeriodEnd: periodEnd,
          },
          requestId,
          message: sessionId.startsWith("prodtest_")
            ? "Test subscription resumed (production test user)"
            : "Test subscription resumed (demo mode)",
        },
        { headers: { "X-Request-ID": requestId, "Cache-Control": "no-cache" } }
      );
    }

    if (!isStripeConfigured()) {
      return NextResponse.json({ ok: false, error: "Stripe not configured", requestId }, { status: 503 });
    }

    const Stripe = (await import("stripe")).default;
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey || secretKey.startsWith("pk_")) {
      return NextResponse.json({ ok: false, error: "Stripe misconfigured", requestId }, { status: 500 });
    }
    const stripe = new Stripe(secretKey);

    const existing = await getSubscriptionBySessionId(sessionId);
    let subId = existing?.stripe_subscription_id || null;

    if (!subId) {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (!session || session.mode !== "subscription" || !session.subscription) {
        return NextResponse.json({ ok: false, error: "Subscription not found for session", requestId }, { status: 404 });
      }
      subId = typeof session.subscription === "string" ? session.subscription : session.subscription.id;
    }

    const updated = await stripe.subscriptions.update(subId, { cancel_at_period_end: false });

    const row = await upsertSubscriptionFromStripe({
      sessionId,
      stripeCustomerId: existing?.stripe_customer_id ?? null,
      stripeSubscriptionId: subId,
      status: mapStripeStatus(updated.status),
      cancelAtPeriodEnd: !!updated.cancel_at_period_end,
      currentPeriodEndIso: getCurrentPeriodEndIsoFromStripe(updated),
      planInterval: derivePlanIntervalFromStripe(updated),
    });

    const res = NextResponse.json(
      {
        ok: true,
        data: {
          status: row?.status || mapStripeStatus(updated.status),
          planInterval: row?.plan_interval || derivePlanIntervalFromStripe(updated),
          cancelAtPeriodEnd: false,
          currentPeriodEnd: row?.current_period_end ?? getCurrentPeriodEndIsoFromStripe(updated),
        },
        requestId,
      },
      { headers: { "X-Request-ID": requestId, "Cache-Control": "no-cache" } }
    );
    // Refresh cookie (best-effort)
    res.headers.append("Set-Cookie", buildBillingSessionCookie(sessionId));
    return res;
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Failed to resume subscription", requestId }, { status: 400 });
  }
}


