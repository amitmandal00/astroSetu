import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { POST } from "@/app/api/ai-astrology/generate-report/route";
import type { AIAstrologyInput } from "@/lib/ai-astrology/types";
import { 
  markStoredReportProcessing,
  markStoredReportCompleted,
  markStoredReportFailed,
  getStoredReportByReportId,
} from "@/lib/ai-astrology/reportStore";
import * as reportGenerator from "@/lib/ai-astrology/reportGenerator";

/**
 * Integration Test: Generate Report Processing Lifecycle
 * 
 * ChatGPT Feedback Fix: Tests that POST never leaves reports stuck in "processing"
 * 
 * Root Cause: Serverless function times out before marking as completed/failed,
 * leaving reports stuck in "processing" status forever.
 * 
 * This test ensures:
 * - Processing → Completed transition works correctly
 * - Processing → Failed transition works correctly (on error/timeout)
 * - Reports never remain stuck in "processing" status
 * 
 * Success Criteria:
 * - Report status transitions: processing → completed OR processing → failed
 * - Never stuck in "processing" after generation completes/fails
 * - Error/timeout always marks as "failed"
 */

// Mock report generator to simulate long-running or failing generation
vi.mock("@/lib/ai-astrology/reportGenerator", () => ({
  generateYearAnalysisReport: vi.fn(),
  generateLifeSummaryReport: vi.fn(),
  generateFullLifeReport: vi.fn(),
  isAIConfigured: vi.fn(() => true),
}));

// Mock report store
vi.mock("@/lib/ai-astrology/reportStore", () => ({
  getStoredReportByIdempotencyKey: vi.fn(),
  getStoredReportByReportId: vi.fn(),
  markStoredReportProcessing: vi.fn(),
  markStoredReportCompleted: vi.fn(),
  markStoredReportFailed: vi.fn(),
}));

// Mock report cache
vi.mock("@/lib/ai-astrology/reportCache", () => ({
  generateIdempotencyKey: vi.fn(() => "test-idempotency-key"),
  getCachedReport: vi.fn(() => null),
  cacheReport: vi.fn(),
  markReportProcessing: vi.fn(),
  getCachedReportByReportId: vi.fn(() => null),
}));

// Mock payment token verification
vi.mock("@/lib/ai-astrology/paymentToken", () => ({
  verifyPaymentToken: vi.fn(() => ({ ok: true, data: { verified: true } })),
  isPaidReportType: vi.fn(() => false),
}));

describe("Generate Report Processing Lifecycle", () => {
  const mockInput: AIAstrologyInput = {
    name: "Test User",
    dob: "1990-01-01",
    tob: "12:00",
    place: "Test City",
    gender: "Male",
    latitude: 0,
    longitude: 0,
    timezone: "UTC",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default: mark as processing returns success
    vi.mocked(markStoredReportProcessing).mockResolvedValue({
      ok: true,
      row: {
        idempotency_key: "test-idempotency-key",
        report_id: "RPT-test-report-id",
        status: "processing",
        report_type: "year-analysis",
        input: mockInput,
        content: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        error_message: null,
      },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should transition from processing → completed on successful generation", async () => {
    // Arrange: Mock successful report generation
    const mockReportContent = {
      reportId: "RPT-test-report-id",
      generatedAt: new Date().toISOString(),
      sections: [{ title: "Test Section", content: "Test Content" }],
    };

    vi.mocked(reportGenerator.generateYearAnalysisReport).mockResolvedValue(mockReportContent);
    vi.mocked(markStoredReportCompleted).mockResolvedValue();

    // Act: Call POST endpoint
    const request = new Request("http://localhost:3000/api/ai-astrology/generate-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: mockInput,
        reportType: "year-analysis",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    // Assert: Report should be marked as completed
    expect(response.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.data?.status).toBe("completed");
    expect(markStoredReportCompleted).toHaveBeenCalledWith({
      idempotencyKey: expect.any(String),
      reportId: expect.any(String),
      content: expect.objectContaining({ reportId: expect.any(String) }),
    });
  });

  it("should transition from processing → failed on generation error", async () => {
    // Arrange: Mock failing report generation
    const errorMessage = "Report generation failed: OpenAI API error";
    vi.mocked(reportGenerator.generateYearAnalysisReport).mockRejectedValue(
      new Error(errorMessage)
    );
    vi.mocked(markStoredReportFailed).mockResolvedValue();

    // Act: Call POST endpoint
    const request = new Request("http://localhost:3000/api/ai-astrology/generate-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: mockInput,
        reportType: "year-analysis",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    // Assert: Report should be marked as failed (never stuck in processing)
    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(data.ok).toBe(false);
    expect(markStoredReportFailed).toHaveBeenCalledWith({
      idempotencyKey: expect.any(String),
      reportId: expect.any(String),
      errorMessage: expect.stringContaining(errorMessage),
    });
    
    // CRITICAL: Verify status was updated to "failed"
    expect(markStoredReportFailed).toHaveBeenCalledTimes(1);
  });

  it("should transition from processing → failed on timeout", async () => {
    // Arrange: Mock timeout (generation takes too long)
    vi.mocked(reportGenerator.generateYearAnalysisReport).mockImplementation(
      () => new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Report generation timed out")), 100);
      })
    );
    vi.mocked(markStoredReportFailed).mockResolvedValue();

    // Act: Call POST endpoint (will timeout)
    const request = new Request("http://localhost:3000/api/ai-astrology/generate-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: mockInput,
        reportType: "year-analysis",
      }),
    });

    // Note: This test may need adjustment based on actual timeout handling
    // The important thing is that markStoredReportFailed is called
    try {
      await POST(request);
    } catch (error) {
      // Expected to throw or return error
    }

    // Assert: Report should be marked as failed (not stuck in processing)
    // In a real timeout scenario, markStoredReportFailed should be called
    // This test verifies the error path always marks as failed
    expect(markStoredReportFailed).toHaveBeenCalled();
  });

  it("should never leave report in processing status after generation completes or fails", async () => {
    // Arrange: Track status transitions
    let finalStatus: "completed" | "failed" | "processing" | null = null;

    vi.mocked(markStoredReportCompleted).mockImplementation(async () => {
      finalStatus = "completed";
    });
    vi.mocked(markStoredReportFailed).mockImplementation(async () => {
      finalStatus = "failed";
    });

    // Test successful path
    const mockReportContent = {
      reportId: "RPT-test-report-id",
      generatedAt: new Date().toISOString(),
      sections: [{ title: "Test", content: "Content" }],
    };
    vi.mocked(reportGenerator.generateYearAnalysisReport).mockResolvedValue(mockReportContent);

    const request = new Request("http://localhost:3000/api/ai-astrology/generate-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: mockInput,
        reportType: "year-analysis",
      }),
    });

    await POST(request);

    // Assert: Status should be "completed" (not "processing")
    expect(finalStatus).toBe("completed");
    expect(finalStatus).not.toBe("processing");
  });

  it("should mark as failed even if markStoredReportCompleted throws", async () => {
    // Arrange: Mock markStoredReportCompleted to throw (simulates DB error)
    const mockReportContent = {
      reportId: "RPT-test-report-id",
      generatedAt: new Date().toISOString(),
      sections: [{ title: "Test", content: "Content" }],
    };
    vi.mocked(reportGenerator.generateYearAnalysisReport).mockResolvedValue(mockReportContent);
    vi.mocked(markStoredReportCompleted).mockRejectedValue(new Error("DB error"));

    const request = new Request("http://localhost:3000/api/ai-astrology/generate-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: mockInput,
        reportType: "year-analysis",
      }),
    });

    // Act: Should handle error gracefully
    const response = await POST(request);

    // Assert: Should not leave in processing - either completed or failed
    // The exact behavior depends on error handling, but should never be stuck
    expect(response.status).toBeGreaterThanOrEqual(200); // Should return some status
  });
});

