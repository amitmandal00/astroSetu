import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";

/**
 * OpenAI Budget Invariant (integration-style)
 *
 * Goal: Catch runaway duplicate generation loops before they hit production spend.
 * Invariant: A single "attempt" (same idempotency key) must not trigger more than N AI-generation calls.
 *
 * Note: We model "AI calls" at the report generator boundary (generateXReport).
 * This is the highest-signal regression surface for "refresh/retry triggers generation again".
 */

const MAX_GENERATION_CALLS_PER_ATTEMPT = 1;

vi.mock("@/lib/ai-astrology/reportCache", () => {
  return {
    generateIdempotencyKey: vi.fn(() => "idem_key_budget"),
    getCachedReport: vi.fn(() => null),
    cacheReport: vi.fn(),
    markReportProcessing: vi.fn(() => true),
    getCachedReportByReportId: vi.fn(() => null),
  };
});

vi.mock("@/lib/ai-astrology/reportStore", () => {
  const state: any = { row: null };
  const markStoredReportProcessing = vi.fn(async (args: any) => {
    if (state.row) return { ok: false, existing: state.row };
    state.row = {
      idempotency_key: args.idempotencyKey,
      report_id: args.reportId,
      report_type: args.reportType,
      input: args.input,
      status: "processing",
      content: null,
      updated_at: new Date().toISOString(),
    };
    return { ok: true };
  });
  return {
    getStoredReportByIdempotencyKey: vi.fn(async (key: string) => {
      if (state.row && state.row.idempotency_key === key) return state.row;
      return null;
    }),
    getStoredReportByReportId: vi.fn(async (_id: string) => null),
    markStoredReportProcessing,
    markStoredReportCompleted: vi.fn(async (args: any) => {
      if (!state.row) return;
      state.row = { ...state.row, status: "completed", content: args.content, updated_at: new Date().toISOString() };
    }),
    markStoredReportFailed: vi.fn(async () => undefined),
  };
});

// We model "AI calls" as "job starts" here to catch duplication loops regardless of mock/demo behavior.
// The backend can use mock generation for production test users; this invariant still holds.

import { POST as GenerateReport } from "@/app/api/ai-astrology/generate-report/route";

describe("OpenAI Budget Invariant - generate-report", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_RESTRICT_ACCESS = "false";
    // IMPORTANT: demo mode bypasses reportGenerator and returns mock reports.
    // This invariant must exercise the real generation path (with mocked generator).
    process.env.AI_ASTROLOGY_DEMO_MODE = "false";
  });

  afterAll(() => {
    process.env = originalEnv as any;
  });

  it(`same attempt must not exceed ${MAX_GENERATION_CALLS_PER_ATTEMPT} generation call(s)`, async () => {
    const body = {
      reportType: "life-summary",
      sessionId: "cs_test_budget",
      input: {
        name: "Amit Kumar Mandal",
        dob: "1984-11-26",
        tob: "10:30",
        place: "Noamundi, Jharkhand",
        gender: "Male",
        latitude: 22.16,
        longitude: 85.5,
        timezone: "Asia/Kolkata",
      },
    };

    const mkReq = () =>
      new Request("http://localhost:3001/api/ai-astrology/generate-report", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });

    // Simulate duplicate triggers within the same attempt (refresh/retry loop behavior)
    await GenerateReport(mkReq());
    await GenerateReport(mkReq());
    await GenerateReport(mkReq());

    const { markStoredReportProcessing } = await import("@/lib/ai-astrology/reportStore");
    expect((markStoredReportProcessing as any).mock.calls.length).toBeLessThanOrEqual(MAX_GENERATION_CALLS_PER_ATTEMPT);
  });
});


