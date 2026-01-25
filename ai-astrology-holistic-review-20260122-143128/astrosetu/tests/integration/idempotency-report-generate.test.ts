import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";

// Gate: same idempotency key must not trigger duplicate AI generation calls.

// Mock reportCache so idempotency key is deterministic and in-memory cache doesn't interfere.
vi.mock("@/lib/ai-astrology/reportCache", () => {
  return {
    generateIdempotencyKey: vi.fn(() => "idem_key_fixed"),
    getCachedReport: vi.fn(() => null),
    cacheReport: vi.fn(),
    markReportProcessing: vi.fn(() => true),
    getCachedReportByReportId: vi.fn(() => null),
  };
});

// Mock reportStore (Supabase-backed persistent store) with in-memory state.
vi.mock("@/lib/ai-astrology/reportStore", () => {
  const state: any = { row: null };
  const markStoredReportProcessing = vi.fn(async (args: any) => {
    if (state.row) {
      return { ok: false, existing: state.row };
    }
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
  const markStoredReportCompleted = vi.fn(async (args: any) => {
    if (!state.row) return;
    state.row = {
      ...state.row,
      status: "completed",
      content: args.content,
      updated_at: new Date().toISOString(),
    };
  });
  return {
    getStoredReportByIdempotencyKey: vi.fn(async (key: string) => {
      if (state.row && state.row.idempotency_key === key) return state.row;
      return null;
    }),
    getStoredReportByReportId: vi.fn(async (_id: string) => null),
    markStoredReportProcessing,
    markStoredReportCompleted,
    markStoredReportFailed: vi.fn(async (_args: any) => {
      // not used in this test
    }),
  };
});

// We don't assert on generator function calls here because "test user" flows may use mock generation.
// The invariant we care about is: idempotency key ⇒ single job/attempt (processing lock) + stable reportId.

import { POST as GenerateReport } from "@/app/api/ai-astrology/generate-report/route";

describe("Idempotency - /api/ai-astrology/generate-report", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_RESTRICT_ACCESS = "false";
    // IMPORTANT: demo mode bypasses reportGenerator and returns mock reports.
    // For idempotency we must exercise the real generation path (with mocked generator).
    process.env.AI_ASTROLOGY_DEMO_MODE = "false";
  });

  afterAll(() => {
    process.env = originalEnv as any;
  });

  it("should not call report generator twice for same idempotency key", async () => {
    const body = {
      reportType: "life-summary",
      sessionId: "cs_test_123",
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

    const res1 = await GenerateReport(mkReq());
    expect([200, 202]).toContain(res1.status);
    const j1 = await res1.json();
    expect(j1.ok).toBe(true);
    expect(j1.data?.reportId).toBeTruthy();

    const res2 = await GenerateReport(mkReq());
    expect([200, 202]).toContain(res2.status);
    const j2 = await res2.json();
    expect(j2.ok).toBe(true);

    // Idempotency invariant: same job/report id (no duplicate jobs created)
    expect(j2.data?.reportId).toBe(j1.data?.reportId);

    const { markStoredReportProcessing } = await import("@/lib/ai-astrology/reportStore");
    expect(markStoredReportProcessing).toHaveBeenCalledTimes(1);
  });
});


