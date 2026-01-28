import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";

// Mock Stripe
vi.mock("stripe", () => {
  return {
    default: vi.fn().mockImplementation(() => {
      return {
        checkout: {
          sessions: {
            retrieve: vi.fn(async (_sid: string) => ({
              id: _sid,
              mode: "subscription",
              subscription: "sub_123",
              customer: "cus_123",
            })),
          },
        },
        subscriptions: {
          retrieve: vi.fn(async (_subId: string) => ({
            id: _subId,
            cancel_at_period_end: false,
            current_period_end: 1771113600,
            status: "active",
            items: { data: [{ price: { recurring: { interval: "month" } } }] },
          })),
        },
      };
    }),
  };
});

// Vitest hoists `vi.mock` calls. Use vi.hoisted so the spy exists before module evaluation.
const { upsertSpy } = vi.hoisted(() => ({
  upsertSpy: vi.fn(async (row: any) => ({
    stripe_checkout_session_id: row.sessionId,
    stripe_customer_id: row.stripeCustomerId ?? null,
    stripe_subscription_id: row.stripeSubscriptionId ?? null,
    status: row.status,
    cancel_at_period_end: row.cancelAtPeriodEnd,
    current_period_end: row.currentPeriodEndIso,
    plan_interval: row.planInterval,
  })),
}));

vi.mock("@/lib/billing/subscriptionStore", () => {
  return {
    upsertSubscriptionFromStripe: upsertSpy,
    derivePlanIntervalFromStripe: vi.fn(() => "month"),
    mapStripeStatus: vi.fn(() => "active"),
    getCurrentPeriodEndIsoFromStripe: vi.fn(() => "2026-02-15T00:00:00.000Z"),
  };
});

import { POST as Verify } from "@/app/api/billing/subscription/verify-session/route";

describe("Billing verify-session idempotency", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.STRIPE_SECRET_KEY = "sk_test_123";
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = "pk_test_123";
  });

  // eslint-disable-next-line vitest/no-conditional-in-test
  afterAll(() => {
    process.env = originalEnv as any;
  });

  it("verifying the same session_id twice should be safe (no duplicates; upsert is idempotent)", async () => {
    const mkReq = () =>
      new Request("http://localhost:3001/api/billing/subscription/verify-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: "cs_test_123" }),
      });

    const res1 = await Verify(mkReq());
    expect(res1.status).toBe(200);
    const j1 = await res1.json();
    expect(j1.ok).toBe(true);
    expect(upsertSpy).toHaveBeenCalledTimes(1);

    const res2 = await Verify(mkReq());
    expect(res2.status).toBe(200);
    const j2 = await res2.json();
    expect(j2.ok).toBe(true);
    expect(upsertSpy).toHaveBeenCalledTimes(2);
  });
});


