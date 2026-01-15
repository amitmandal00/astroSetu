import { NextResponse } from "next/server";
import { checkRateLimit, parseJsonBody } from "@/lib/apiHelpers";
import { generateRequestId } from "@/lib/requestId";
import { isStripeConfigured } from "@/lib/ai-astrology/payments";
import {
  upsertSubscriptionFromStripe,
  derivePlanIntervalFromStripe,
  mapStripeStatus,
  getCurrentPeriodEndIsoFromStripe,
} from "@/lib/billing/subscriptionStore";
import { buildBillingSessionCookie } from "@/lib/billing/sessionCookie";

/**
 * POST /api/billing/subscription/verify-session
 * Body: { session_id: string }
 *
 * Best-practice contract:
 * - Accept session_id from query string ONLY once (Stripe redirect contract) via the client success page.
 * - Verify server-side with Stripe.
 * - Persist to DB (Supabase) and set HttpOnly cookie for future requests.
 */
export async function POST(req: Request) {
  const requestId = generateRequestId();

  try {
    const rateLimitResponse = checkRateLimit(req, "/api/billing/subscription/verify-session");
    if (rateLimitResponse) {
      rateLimitResponse.headers.set("X-Request-ID", requestId);
      return rateLimitResponse;
    }

    const json = await parseJsonBody<{ session_id?: string }>(req);
    const sessionId = json.session_id;
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
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!session || session.mode !== "subscription" || !session.subscription) {
      return NextResponse.json({ ok: false, error: "Not a subscription checkout session", requestId }, { status: 400 });
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

    const res = NextResponse.json(
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

    res.headers.append("Set-Cookie", buildBillingSessionCookie(sessionId));
    return res;
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Failed to verify subscription session", requestId }, { status: 400 });
  }
}


