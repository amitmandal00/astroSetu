import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";
import { POST as StripeWebhook } from "@/app/api/billing/stripe-webhook/route";

vi.mock("@/lib/billing/subscriptionStore", () => {
  return {
    upsertSubscriptionFromStripe: vi.fn(async () => ({})),
    derivePlanIntervalFromStripe: vi.fn(() => "month"),
    mapStripeStatus: vi.fn(() => "active"),
    getCurrentPeriodEndIsoFromStripe: vi.fn(() => "2026-02-15T00:00:00.000Z"),
    getSubscriptionByStripeSubscriptionId: vi.fn(async () => ({
      stripe_checkout_session_id: "cs_test_123",
      stripe_customer_id: "cus_123",
    })),
  };
});

vi.mock("stripe", () => {
  return {
    default: vi.fn().mockImplementation(() => {
      return {
        webhooks: {
          constructEvent: vi.fn((_body: string, _sig: string, secret: string) => {
            if (secret === "whsec_invalid") {
              throw new Error("Invalid signature");
            }
            return {
              type: "customer.subscription.updated",
              data: { object: { id: "sub_123", status: "active", cancel_at_period_end: false, current_period_end: 1771113600 } },
            };
          }),
        },
        subscriptions: {
          retrieve: vi.fn(async () => ({
            id: "sub_123",
            status: "active",
            cancel_at_period_end: false,
            current_period_end: 1771113600,
            items: { data: [{ price: { recurring: { interval: "month" } } }] },
          })),
        },
      };
    }),
  };
});

describe("Stripe webhook signature verification", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.STRIPE_SECRET_KEY = "sk_test_123";
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = "pk_test_123";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_valid";
  });

  afterAll(() => {
    process.env = originalEnv as any;
  });

  it("rejects when stripe-signature header is missing", async () => {
    const req = new Request("http://localhost:3001/api/billing/stripe-webhook", {
      method: "POST",
      body: "{}", // raw body required by Stripe signature verification
    });
    const res = await StripeWebhook(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.ok).toBe(false);
    expect(String(json.error)).toMatch(/stripe-signature/i);
  });

  it("rejects when signature verification fails", async () => {
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_invalid";
    const req = new Request("http://localhost:3001/api/billing/stripe-webhook", {
      method: "POST",
      headers: { "stripe-signature": "t=123,v1=bad" },
      body: "{}",
    });
    const res = await StripeWebhook(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.ok).toBe(false);
    expect(String(json.error)).toMatch(/signature/i);
  });

  it("accepts when signature is present and processes event", async () => {
    const { upsertSubscriptionFromStripe } = await import("@/lib/billing/subscriptionStore");
    const req = new Request("http://localhost:3001/api/billing/stripe-webhook", {
      method: "POST",
      headers: { "stripe-signature": "t=123,v1=ok" },
      body: "{}",
    });
    const res = await StripeWebhook(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(upsertSubscriptionFromStripe).toHaveBeenCalled();
  });
});


