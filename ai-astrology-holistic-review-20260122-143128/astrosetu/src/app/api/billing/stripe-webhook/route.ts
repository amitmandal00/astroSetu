import { NextResponse } from "next/server";
import { generateRequestId } from "@/lib/requestId";
import { isStripeConfigured } from "@/lib/ai-astrology/payments";
import {
  upsertSubscriptionFromStripe,
  derivePlanIntervalFromStripe,
  mapStripeStatus,
  getCurrentPeriodEndIsoFromStripe,
  getSubscriptionByStripeSubscriptionId,
} from "@/lib/billing/subscriptionStore";

/**
 * Stripe webhook for AI Astrology monthly subscriptions.
 *
 * Events handled:
 * - checkout.session.completed (creates mapping session_id → subscription/customer)
 * - customer.subscription.updated
 * - customer.subscription.deleted
 * - invoice.paid
 * - invoice.payment_failed
 *
 * Non-negotiable: DB is updated only here or via server routes (never client).
 */
export async function POST(req: Request) {
  const requestId = generateRequestId();

  if (!isStripeConfigured()) {
    return NextResponse.json({ ok: false, error: "Stripe not configured", requestId }, { status: 503 });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secretKey || secretKey.startsWith("pk_") || !webhookSecret) {
    return NextResponse.json({ ok: false, error: "Stripe webhook misconfigured", requestId }, { status: 500 });
  }

  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(secretKey);

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ ok: false, error: "Missing stripe-signature", requestId }, { status: 400 });
  }

  const body = await req.text();
  let event: any;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: `Webhook signature verification failed: ${e?.message}`, requestId }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        if (session.mode !== "subscription") break;
        const sessionId = session.id;
        const subId = session.subscription ? String(session.subscription) : null;
        const customerId = session.customer ? String(session.customer) : null;
        if (!sessionId || !subId) break;

        const sub = await stripe.subscriptions.retrieve(subId);
        await upsertSubscriptionFromStripe({
          sessionId,
          stripeCustomerId: customerId,
          stripeSubscriptionId: subId,
          status: mapStripeStatus(sub.status),
          cancelAtPeriodEnd: !!sub.cancel_at_period_end,
          currentPeriodEndIso: getCurrentPeriodEndIsoFromStripe(sub),
          planInterval: derivePlanIntervalFromStripe(sub),
        });
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object;
        const subId = sub.id;
        const existing = await getSubscriptionByStripeSubscriptionId(subId);
        if (!existing) break;
        await upsertSubscriptionFromStripe({
          sessionId: existing.stripe_checkout_session_id,
          stripeCustomerId: existing.stripe_customer_id,
          stripeSubscriptionId: subId,
          status: mapStripeStatus(sub.status),
          cancelAtPeriodEnd: !!sub.cancel_at_period_end,
          currentPeriodEndIso: getCurrentPeriodEndIsoFromStripe(sub),
          planInterval: derivePlanIntervalFromStripe(sub),
        });
        break;
      }

      case "invoice.paid":
      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const subId = invoice.subscription ? String(invoice.subscription) : null;
        if (!subId) break;
        const existing = await getSubscriptionByStripeSubscriptionId(subId);
        if (!existing) break;
        const sub = await stripe.subscriptions.retrieve(subId);
        await upsertSubscriptionFromStripe({
          sessionId: existing.stripe_checkout_session_id,
          stripeCustomerId: existing.stripe_customer_id,
          stripeSubscriptionId: subId,
          status: mapStripeStatus(sub.status),
          cancelAtPeriodEnd: !!sub.cancel_at_period_end,
          currentPeriodEndIso: getCurrentPeriodEndIsoFromStripe(sub),
          planInterval: derivePlanIntervalFromStripe(sub),
        });
        break;
      }
    }

    return NextResponse.json({ ok: true, requestId });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Webhook error", requestId }, { status: 500 });
  }
}


