import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";

// Regression: production must NOT fall back to volatile in-memory "processing" when report store is unavailable,
// because that leads to infinite polling/spinners on serverless.

vi.mock("@/lib/ai-astrology/reportCache", () => {
  return {
    generateIdempotencyKey: vi.fn(() => "idem_key_store_availability"),
    getCachedReport: vi.fn(() => null),
    cacheReport: vi.fn(),
    markReportProcessing: vi.fn(() => true),
    getCachedReportByReportId: vi.fn(() => null),
  };
});

vi.mock("@/lib/ai-astrology/reportStore", () => {
  return {
    getStoredReportByIdempotencyKey: vi.fn(async () => null),
    getStoredReportByReportId: vi.fn(async () => null),
    markStoredReportProcessing: vi.fn(async () => {
      throw new Error("SUPABASE_NOT_CONFIGURED");
    }),
    // In real code, markStoredReportCompleted/Failed are best-effort and no-op when Supabase isn't configured.
    markStoredReportCompleted: vi.fn(async () => undefined),
    markStoredReportFailed: vi.fn(async () => undefined),
  };
});

import { POST as GenerateReport } from "@/app/api/ai-astrology/generate-report/route";

describe("Report store availability (DEF-010)", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
    process.env.NEXT_PUBLIC_RESTRICT_ACCESS = "false";
    process.env.AI_ASTROLOGY_DEMO_MODE = "false";
    process.env.MOCK_MODE = "false";
    process.env.NODE_ENV = "production";
  });

  afterAll(() => {
    process.env = originalEnv as any;
  });

  it("fails fast in production when report store is unavailable (prevents infinite polling)", async () => {
    const body = {
      reportType: "year-analysis",
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

    const res = await GenerateReport(
      new Request("http://localhost:3001/api/ai-astrology/generate-report", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      })
    );

    expect(res.status).toBe(503);
    const j = await res.json();
    expect(j.ok).toBe(false);
    expect(String(j.error || "")).toMatch(/report store is not configured/i);
  });

  it("allows production test sessions to complete via forced mock (session_id=test_session_*)", async () => {
    const body = {
      reportType: "year-analysis",
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

    const res = await GenerateReport(
      new Request("http://localhost:3001/api/ai-astrology/generate-report?session_id=test_session_year-analysis_req-1", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      })
    );

    expect(res.status).toBe(200);
    const j = await res.json();
    expect(j.ok).toBe(true);
    expect(j.data?.status).toBe("completed");
    expect(j.data?.content).toBeTruthy();
  });
});


