import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";

// NOTE: These tests are integration-style but use module mocks for Stripe + Supabase.
// They enforce idempotency contracts for cancel/resume.

vi.mock("stripe", () => {
  return {
    default: vi.fn().mockImplementation(() => {
      return {
        subscriptions: {
          update: vi.fn(async (_id: string, _params: any) => {
            return {
              id: "sub_123",
              cancel_at_period_end: !!_params.cancel_at_period_end,
              current_period_end: 1771113600, // unix seconds
              status: "active",
              items: { data: [{ price: { recurring: { interval: "month" } } }] },
            };
          }),
          retrieve: vi.fn(async () => {
            return {
              id: "sub_123",
              cancel_at_period_end: false,
              current_period_end: 1771113600,
              status: "active",
              items: { data: [{ price: { recurring: { interval: "month" } } }] },
            };
          }),
        },
        checkout: {
          sessions: {
            retrieve: vi.fn(async () => ({
              id: "cs_test_123",
              mode: "subscription",
              subscription: "sub_123",
              customer: "cus_123",
              customer_email: "test@example.com",
            })),
          },
        },
        webhooks: {
          constructEvent: vi.fn((_body: string, _sig: string, _secret: string) => ({
            type: "customer.subscription.updated",
            data: { object: { id: "sub_123" } },
          })),
        },
      };
    }),
  };
});

// Mock subscriptionStore layer (DB)
vi.mock("@/lib/billing/subscriptionStore", () => {
  const state: any = {
    row: {
      stripe_checkout_session_id: "cs_test_123",
      stripe_customer_id: "cus_123",
      stripe_subscription_id: "sub_123",
      status: "active",
      cancel_at_period_end: false,
      current_period_end: "2026-02-15T00:00:00.000Z",
      plan_interval: "month",
    },
  };

  return {
    getSubscriptionBySessionId: vi.fn(async (_sid: string) => state.row),
    upsertSubscriptionFromStripe: vi.fn(async (row: any) => {
      state.row = { ...state.row, ...row };
      return state.row;
    }),
    // Helpers used by route handlers
    derivePlanIntervalFromStripe: vi.fn((_sub: any) => "month"),
    mapStripeStatus: vi.fn((_status: any) => "active"),
    getCurrentPeriodEndIsoFromStripe: vi.fn((_sub: any) => "2026-02-15T00:00:00.000Z"),
  };
});

import { GET as GetSub } from "@/app/api/billing/subscription/route";
import { POST as CancelSub } from "@/app/api/billing/subscription/cancel/route";
import { POST as ResumeSub } from "@/app/api/billing/subscription/resume/route";

describe("Billing Subscription API", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.STRIPE_SECRET_KEY = "sk_test_123";
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = "pk_test_123";
  });

  // Restore env after suite
  // eslint-disable-next-line vitest/no-conditional-in-test
  afterAll(() => {
    process.env = originalEnv as any;
  });

  it("GET returns subscription row", async () => {
    const req = new Request("http://localhost:3001/api/billing/subscription?session_id=cs_test_123");
    const res = await GetSub(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.data.status).toBe("active");
  });

  it("Cancel is idempotent (second call stays cancel_at_period_end=true)", async () => {
    const mkReq = () =>
      new Request("http://localhost:3001/api/billing/subscription/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: "cs_test_123" }),
      });

    const res1 = await CancelSub(mkReq());
    const j1 = await res1.json();
    expect(res1.status).toBe(200);
    expect(j1.ok).toBe(true);
    expect(j1.data.cancelAtPeriodEnd).toBe(true);

    const res2 = await CancelSub(mkReq());
    const j2 = await res2.json();
    expect(j2.ok).toBe(true);
    expect(j2.data.cancelAtPeriodEnd).toBe(true);
  });

  it("Resume works and is idempotent", async () => {
    await CancelSub(
      new Request("http://localhost:3001/api/billing/subscription/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: "cs_test_123" }),
      })
    );

    const mkReq = () =>
      new Request("http://localhost:3001/api/billing/subscription/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: "cs_test_123" }),
      });

    const res1 = await ResumeSub(mkReq());
    const j1 = await res1.json();
    expect(j1.ok).toBe(true);
    expect(j1.data.cancelAtPeriodEnd).toBe(false);

    const res2 = await ResumeSub(mkReq());
    const j2 = await res2.json();
    expect(j2.ok).toBe(true);
    expect(j2.data.cancelAtPeriodEnd).toBe(false);
  });
});


