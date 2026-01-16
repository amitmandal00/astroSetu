/**
 * Stripe (AI Astrology) subscription store (Supabase-backed).
 *
 * Source of truth contract:
 * - UI renders from DB row returned by GET /api/billing/subscription
 * - Server routes + Stripe webhook are the only writers.
 */

import { createServerClient, isSupabaseConfigured } from "@/lib/supabase";

export type BillingSubscriptionStatus =
  | "active"
  | "canceled"
  | "incomplete"
  | "incomplete_expired"
  | "past_due"
  | "trialing"
  | "unpaid"
  | "paused"
  | "unknown";

export interface BillingSubscriptionRow {
  stripe_checkout_session_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: BillingSubscriptionStatus;
  current_period_end: string | null; // ISO
  cancel_at_period_end: boolean;
  plan_interval: "month" | "year" | "unknown";
  updated_at?: string;
  created_at?: string;
}

const TABLE = "ai_astrology_subscriptions";

function toIsoFromUnixSeconds(sec: number | null | undefined): string | null {
  if (!sec) return null;
  return new Date(sec * 1000).toISOString();
}

export async function getSubscriptionBySessionId(sessionId: string): Promise<BillingSubscriptionRow | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("stripe_checkout_session_id", sessionId)
    .maybeSingle();
  if (error) return null;
  return (data as BillingSubscriptionRow) || null;
}

export async function getSubscriptionByStripeSubscriptionId(
  stripeSubscriptionId: string
): Promise<BillingSubscriptionRow | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("stripe_subscription_id", stripeSubscriptionId)
    .maybeSingle();
  if (error) return null;
  return (data as BillingSubscriptionRow) || null;
}

export async function upsertSubscriptionFromStripe(params: {
  sessionId: string;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  status: BillingSubscriptionStatus;
  cancelAtPeriodEnd: boolean;
  currentPeriodEndIso: string | null;
  planInterval: "month" | "year" | "unknown";
}): Promise<BillingSubscriptionRow | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = createServerClient();
  const now = new Date().toISOString();
  const row: BillingSubscriptionRow = {
    stripe_checkout_session_id: params.sessionId,
    stripe_customer_id: params.stripeCustomerId ?? null,
    stripe_subscription_id: params.stripeSubscriptionId ?? null,
    status: params.status,
    cancel_at_period_end: params.cancelAtPeriodEnd,
    current_period_end: params.currentPeriodEndIso,
    plan_interval: params.planInterval,
    updated_at: now,
  };

  // Use upsert so repeated calls (idempotency/webhook replays) are safe.
  const { data, error } = await supabase
    .from(TABLE)
    .upsert(row, { onConflict: "stripe_checkout_session_id" })
    .select("*")
    .maybeSingle();
  if (error) return null;
  return (data as BillingSubscriptionRow) || null;
}

export function derivePlanIntervalFromStripe(sub: any): "month" | "year" | "unknown" {
  const interval = sub?.items?.data?.[0]?.price?.recurring?.interval;
  if (interval === "month") return "month";
  if (interval === "year") return "year";
  return "unknown";
}

export function mapStripeStatus(status: string | null | undefined): BillingSubscriptionStatus {
  if (!status) return "unknown";
  return status as BillingSubscriptionStatus;
}

export function getCurrentPeriodEndIsoFromStripe(sub: any): string | null {
  return toIsoFromUnixSeconds(sub?.current_period_end);
}


