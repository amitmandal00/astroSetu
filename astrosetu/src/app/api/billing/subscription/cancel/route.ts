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
 * POST /api/billing/subscription/cancel
 * Body: { session_id: string }
 *
 * Cancels at period end (recommended) — idempotent.
 */
export async function POST(req: Request) {
  const requestId = generateRequestId();
  try {
    const rateLimitResponse = checkRateLimit(req, "/api/billing/subscription/cancel");
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

    if (!isStripeConfigured()) {
      return NextResponse.json({ ok: false, error: "Stripe not configured", requestId }, { status: 503 });
    }

    const Stripe = (await import("stripe")).default;
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey || secretKey.startsWith("pk_")) {
      return NextResponse.json({ ok: false, error: "Stripe misconfigured", requestId }, { status: 500 });
    }
    const stripe = new Stripe(secretKey);

    // Get subscription id from DB or Stripe checkout session
    const existing = await getSubscriptionBySessionId(sessionId);
    let subId = existing?.stripe_subscription_id || null;

    if (!subId) {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (!session || session.mode !== "subscription" || !session.subscription) {
        return NextResponse.json({ ok: false, error: "Subscription not found for session", requestId }, { status: 404 });
      }
      subId = typeof session.subscription === "string" ? session.subscription : session.subscription.id;
    }

    // Idempotent: if already cancel_at_period_end=true, Stripe returns same state
    const updated = await stripe.subscriptions.update(subId, { cancel_at_period_end: true });

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
          cancelAtPeriodEnd: true,
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
    return NextResponse.json({ ok: false, error: e?.message || "Failed to cancel subscription", requestId }, { status: 400 });
  }
}


