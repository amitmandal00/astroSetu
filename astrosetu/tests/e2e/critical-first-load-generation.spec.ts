/**
 * @fileoverview Critical E2E Test: First-Load Generation Race Condition
 * 
 * ChatGPT Feedback: This test catches the "first-load only" regression where
 * multiple auto-start mechanisms race on first load, causing timer resets and stuck states.
 * 
 * This test verifies:
 * - Only ONE generation request is started within 5 seconds
 * - Timer does NOT reset back to 0 after it begins ticking
 * - Within timeout (N seconds), either report renders OR error UI appears with Retry button
 * - No infinite spinner states
 * 
 * This test fails the moment a second auto-start/race is reintroduced.
 */

import { test, expect, Page } from "@playwright/test";
import { resetStorage } from "./helpers/storage";

test.describe("Critical First-Load Generation", () => {
  test("should start generation exactly once on first load (no race condition)", async ({ page, context }) => {
    // CRITICAL: Start with fresh browser context (no cookies, no storage)
    // This simulates the exact "first load" scenario where the bug occurs
    await resetStorage(page, context);

    // Seed sessionStorage with mock birth details (simulates input page redirect)
    const mockInput = {
      name: "Test User",
      dob: "1990-01-01",
      tob: "10:00",
      place: "Mumbai",
      latitude: 19.0760,
      longitude: 72.8777,
    };
    await page.evaluate((input) => {
      sessionStorage.setItem("aiAstrologyInput", JSON.stringify(input));
      sessionStorage.setItem("aiAstrologyReportType", "year-analysis");
    }, mockInput);

    // Track network requests to generation endpoint
    const generationRequests: string[] = [];
    page.on("request", (request) => {
      const url = request.url();
      // Track POST to generate-report or GET with reportId
      if (
        url.includes("/api/ai-astrology/generate-report") ||
        url.includes("/api/ai-astrology/verify-payment")
      ) {
        generationRequests.push(`${request.method()} ${url}`);
      }
    });

    // Navigate to preview page with auto_generate=true (first load scenario)
    const previewUrl = `/ai-astrology/preview?session_id=test_session_year-analysis_req-${Date.now()}-test&reportType=year-analysis&auto_generate=true`;
    await page.goto(previewUrl, { waitUntil: "networkidle" });

    // Wait a bit for any auto-start mechanisms to fire
    await page.waitForTimeout(5000); // 5 seconds

    // CRITICAL ASSERTION 1: Exactly ONE generation request should be started
    // Count POST requests to generate-report endpoint (exclude GET polling)
    const postRequests = generationRequests.filter((req) => req.startsWith("POST"));
    expect(postRequests.length, "Should start generation exactly once (no race condition)").toBe(1);

    // CRITICAL ASSERTION 2: Timer should be monotonic (never reset to 0)
    // Check elapsed time display
    const timerText = await page.locator('text=/Elapsed:\\s*\\d+s/').textContent().catch(() => null);
    if (timerText) {
      const match = timerText.match(/Elapsed:\s*(\d+)s/);
      if (match) {
        const elapsedSeconds = parseInt(match[1], 10);
        // Timer should be > 0 and < 5 (we waited 5 seconds)
        expect(elapsedSeconds, "Timer should have started (not stuck at 0)").toBeGreaterThan(0);
        expect(elapsedSeconds, "Timer should not exceed wait time").toBeLessThanOrEqual(6); // Allow 1s buffer
      }
    }

    // CRITICAL ASSERTION 3: Within reasonable timeout, either report renders OR error appears
    // Wait up to 180 seconds (matching maxDuration from server)
    const maxWaitTime = 180000; // 180 seconds
    const startTime = Date.now();

    let reportRendered = false;
    let errorShown = false;
    let retryButtonVisible = false;

    while (Date.now() - startTime < maxWaitTime) {
      // Check if report content is rendered
      const reportContent = await page.locator('[data-testid="report-content"], .report-content, .prose').isVisible().catch(() => false);
      if (reportContent) {
        reportRendered = true;
        break;
      }

      // Check if error UI is shown with Retry button
      const retryButton = page.locator('button:has-text("Retry"), button:has-text("Try Again")');
      const hasRetryButton = await retryButton.isVisible().catch(() => false);
      if (hasRetryButton) {
        errorShown = true;
        retryButtonVisible = true;
        break;
      }

      // Check for explicit error message (non-retryable errors are acceptable too)
      const errorMessage = await page.locator('text=/failed|error|timed out/i').isVisible().catch(() => false);
      if (errorMessage) {
        errorShown = true;
        break;
      }

      // Wait a bit before checking again
      await page.waitForTimeout(2000); // Check every 2 seconds
    }

    // CRITICAL ASSERTION 4: Must have either report OR error (not infinite spinner)
    expect(
      reportRendered || errorShown,
      "Must complete or show error within timeout (no infinite spinner)"
    ).toBe(true);

    // If error shown, retry button should be visible (recoverable error)
    if (errorShown) {
      expect(
        retryButtonVisible || reportRendered,
        "If error shown, should have Retry button or report should eventually render"
      ).toBe(true);
    }
  });

  test("should not reset timer after starting (monotonic timer invariant)", async ({ page, context }) => {
    // Fresh context
    await resetStorage(page, context);

    // Seed sessionStorage
    const mockInput = {
      name: "Test User",
      dob: "1990-01-01",
      tob: "10:00",
      place: "Mumbai",
      latitude: 19.0760,
      longitude: 72.8777,
    };
    await page.evaluate((input) => {
      sessionStorage.setItem("aiAstrologyInput", JSON.stringify(input));
      sessionStorage.setItem("aiAstrologyReportType", "year-analysis");
    }, mockInput);

    const previewUrl = `/ai-astrology/preview?session_id=test_session_year-analysis_req-${Date.now()}-test&reportType=year-analysis&auto_generate=true`;
    await page.goto(previewUrl, { waitUntil: "networkidle" });

    // Track timer values over time
    const timerValues: number[] = [];
    const timerCheckInterval = 2000; // Check every 2 seconds
    const maxChecks = 10; // Check up to 20 seconds

    for (let i = 0; i < maxChecks; i++) {
      await page.waitForTimeout(timerCheckInterval);
      const timerText = await page.locator('text=/Elapsed:\\s*\\d+s/').textContent().catch(() => null);
      if (timerText) {
        const match = timerText.match(/Elapsed:\s*(\d+)s/);
        if (match) {
          const elapsedSeconds = parseInt(match[1], 10);
          timerValues.push(elapsedSeconds);
        }
      }
    }

    // Timer should be monotonic (always increasing or staying same, never decreasing)
    if (timerValues.length >= 2) {
      for (let i = 1; i < timerValues.length; i++) {
        expect(
          timerValues[i] >= timerValues[i - 1],
          `Timer should be monotonic (${timerValues[i - 1]}s -> ${timerValues[i]}s)`
        ).toBe(true);
      }
    }
  });

  test("should complete or fail explicitly within 180s (no infinite spinner)", async ({ page, context }) => {
    // Fresh context
    await resetStorage(page, context);

    // Seed sessionStorage
    const mockInput = {
      name: "Test User",
      dob: "1990-01-01",
      tob: "10:00",
      place: "Mumbai",
      latitude: 19.0760,
      longitude: 72.8777,
    };
    await page.evaluate((input) => {
      sessionStorage.setItem("aiAstrologyInput", JSON.stringify(input));
      sessionStorage.setItem("aiAstrologyReportType", "full-life");
    }, mockInput);

    const previewUrl = `/ai-astrology/preview?session_id=test_session_full-life_req-${Date.now()}-test&reportType=full-life&auto_generate=true`;
    await page.goto(previewUrl, { waitUntil: "networkidle" });

    // Wait up to 180 seconds (matching server maxDuration)
    const maxWaitTime = 180000;
    const startTime = Date.now();
    let finalState: "completed" | "failed" | "still-loading" = "still-loading";

    while (Date.now() - startTime < maxWaitTime) {
      // Check for completion
      const reportContent = await page.locator('[data-testid="report-content"], .report-content').isVisible().catch(() => false);
      if (reportContent) {
        finalState = "completed";
        break;
      }

      // Check for explicit failure
      const retryButton = page.locator('button:has-text("Retry"), button:has-text("Try Again")');
      const hasRetryButton = await retryButton.isVisible().catch(() => false);
      const errorMessage = await page.locator('text=/failed|error|timed out/i').isVisible().catch(() => false);
      if (hasRetryButton || errorMessage) {
        finalState = "failed";
        break;
      }

      await page.waitForTimeout(5000); // Check every 5 seconds
    }

    // Must have completed or failed (not still loading)
    expect(
      finalState !== "still-loading",
      "Must complete or fail explicitly within 180s (no infinite spinner)"
    ).toBe(true);
  });
});

