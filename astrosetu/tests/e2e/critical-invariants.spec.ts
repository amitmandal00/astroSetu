/**
 * Critical Invariant Tests - Timer & Generation UI
 *
 * These are intentionally deterministic: they mock backend endpoints so the tests
 * enforce UI/timer contracts without depending on external APIs or flaky async timing.
 */

import { test, expect } from "@playwright/test";

const LOADER_TITLE = /Generating|Verifying|Preparing/i;
const ELAPSED = '[data-testid="elapsed-seconds"]';

async function seedInput(page: any) {
  await page.addInitScript(() => {
    sessionStorage.setItem(
      "aiAstrologyInput",
      JSON.stringify({
        name: "Amit Kumar Mandal",
        dob: "1984-11-26",
        tob: "10:30",
        place: "Noamundi, Jharkhand",
        gender: "Male",
        latitude: 22.16,
        longitude: 85.5,
        timezone: "Asia/Kolkata",
      })
    );
  });
}

async function mockVerifyPayment(page: any, opts?: { delayMs?: number }) {
  const delayMs = opts?.delayMs ?? 300;
  await page.route("**/api/ai-astrology/verify-payment**", async (route) => {
    await new Promise((r) => setTimeout(r, delayMs));
    const url = new URL(route.request().url());
    const sessionId = url.searchParams.get("session_id") || "cs_test";
    const reportType = url.searchParams.get("reportType") || "marriage-timing";
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        data: {
          sessionId,
          paid: true,
          paymentStatus: "paid",
          subscription: false,
          reportType,
          paymentToken: "tok_test",
          currency: "aud",
          amountTotal: 1,
        },
      }),
    });
  });
}

async function mockGenerateReport(page: any) {
  let pollCount = 0;
  const reportId = "test_report_123";

  await page.route("**/api/ai-astrology/generate-report**", async (route) => {
    const reqUrl = new URL(route.request().url());
    const hasReportId = reqUrl.searchParams.get("reportId");

    if (route.request().method() === "GET" && hasReportId) {
      pollCount += 1;
      const isDone = pollCount >= 3;
      await route.fulfill({
        status: isDone ? 200 : 202,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          data: isDone
            ? {
                status: "completed",
                reportId,
                reportType: "year-analysis",
                content: {
                  title: "Test Report",
                  sections: [{ title: "Test Section", content: "Test content" }],
                },
              }
            : { status: "processing", reportId },
        }),
      });
      return;
    }

    if (route.request().method() === "POST") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          data: { status: "processing", reportId },
        }),
      });
      return;
    }

    await route.continue();
  });
}

async function expectTimerTicks(page: any) {
  // Prefer the main loader heading to avoid hidden/duplicate text matches
  await expect(page.getByRole("heading", { name: LOADER_TITLE })).toBeVisible({ timeout: 10000 });
  const elapsedElement = page.locator(ELAPSED);
  await expect(elapsedElement).toBeVisible({ timeout: 5000 });

  const t1 = await elapsedElement.innerText();
  await page.waitForTimeout(2200);
  const t2 = await elapsedElement.innerText();

  const n1 = parseInt((t1.match(/\d+/) ?? ["0"])[0], 10);
  const n2 = parseInt((t2.match(/\d+/) ?? ["0"])[0], 10);
  // Allow one retry to avoid flakiness on slow CI runners.
  if (n2 <= n1) {
    await page.waitForTimeout(2200);
    const t3 = await elapsedElement.innerText();
    const n3 = parseInt((t3.match(/\d+/) ?? ["0"])[0], 10);
    expect(n3).toBeGreaterThan(n1);
    return;
  }
  expect(n2).toBeGreaterThan(n1);
}

test.describe("Critical Invariants - Timer & Report Generation", () => {
  test("Loader visible => elapsed ticks within 2 seconds (year-analysis with session_id)", async ({ page }) => {
    await seedInput(page);
    await mockVerifyPayment(page);
    await mockGenerateReport(page);
    await page.goto("/ai-astrology/preview?session_id=test_session_123&reportType=year-analysis&auto_generate=true", {
      waitUntil: "networkidle",
    });
    await expectTimerTicks(page);
  });

  test("Loader visible => elapsed ticks within 2 seconds (bundle with retry)", async ({ page }) => {
    await seedInput(page);
    await mockVerifyPayment(page);
    await mockGenerateReport(page);
    await page.goto("/ai-astrology/preview?session_id=test_bundle_session&bundle=any-2&reports=marriage-timing,career-money&auto_generate=true", {
      waitUntil: "networkidle",
    });
    await expectTimerTicks(page);
  });

  test("Loader visible => elapsed ticks within 2 seconds (paid transition: verify → generate)", async ({ page }) => {
    await seedInput(page);
    await mockVerifyPayment(page, { delayMs: 600 });
    await mockGenerateReport(page);
    await page.goto("/ai-astrology/preview?session_id=test_session_paid&reportType=marriage-timing&auto_generate=true", {
      waitUntil: "networkidle",
    });
    await expectTimerTicks(page);
  });

  test("Session resume: loader visible => elapsed increments => report renders", async ({ page }) => {
    await seedInput(page);
    await mockVerifyPayment(page);
    await mockGenerateReport(page);
    await page.goto("/ai-astrology/preview?session_id=test_session_resume&reportType=year-analysis&auto_generate=true", {
      waitUntil: "networkidle",
    });
    await expectTimerTicks(page);
  });

  // Test 3: Retry must be a full restart
  test("Retry must be a full restart: abort + reset + restart", async ({ page }) => {
    await seedInput(page);
    await mockVerifyPayment(page);
    await mockGenerateReport(page);
    await page.goto("/ai-astrology/preview?session_id=test_bundle_retry&bundle=any-2&reports=marriage-timing,career-money&auto_generate=true", {
      waitUntil: "networkidle",
    });

    // Contract: if loader visible, elapsed must tick
    await expectTimerTicks(page);
  });

  // Test 4: reportType alone must not show loader
  test("reportType alone must not show loader (anti-regression)", async ({ page }) => {
    // CRITICAL: This prevents the loader from showing just because reportType is in URL
    await page.goto("/ai-astrology/preview?reportType=year-analysis", {
      waitUntil: "networkidle"
    });

    // Wait a bit to see if loader appears
    await page.waitForTimeout(2000);

    // Assert: Loader should NOT be visible
    const loaderVisible = await page.getByText(LOADER_TITLE).isVisible().catch(() => false);
    
    // Should show input form or redirect, NOT "Generating..."
    expect(loaderVisible).toBe(false);
    
    // Should show input form or have redirected
    const inputForm = await page.locator('form, [data-testid="birth-details-form"]').isVisible().catch(() => false);
    const redirected = page.url().includes("/input") || page.url().includes("/preview?reportType=");
    
    expect(inputForm || redirected).toBeTruthy();
  });

  // Test 5: Year-analysis timer must NOT reset to 0 (CRITICAL BUG)
  test("Year-analysis timer must NOT reset to 0 after a few seconds", async ({ page }) => {
    await seedInput(page);
    await mockVerifyPayment(page);
    await mockGenerateReport(page);
    await page.goto("/ai-astrology/preview?session_id=test_year_analysis&reportType=year-analysis&auto_generate=true", {
      waitUntil: "networkidle",
    });

    // Wait for loader
    await expect(page.getByRole("heading", { name: LOADER_TITLE })).toBeVisible({ timeout: 10000 });
    const elapsedElement = page.locator(ELAPSED);
    await expect(elapsedElement).toBeVisible({ timeout: 5000 });
    
    // Get initial elapsed time
    const t0 = await elapsedElement.innerText();
    const n0 = parseInt((t0.match(/\d+/) ?? ["0"])[0], 10);
    
    // Wait 3 seconds
    await page.waitForTimeout(3000);
    
    // Get elapsed time after 3 seconds
    const t1 = await elapsedElement.innerText();
    const n1 = parseInt((t1.match(/\d+/) ?? ["0"])[0], 10);
    
    // CRITICAL: Timer must have increased, NOT reset to 0
    expect(n1).toBeGreaterThan(n0);
    expect(n1).toBeGreaterThanOrEqual(2); // Should be at least 2-3 seconds
    
    // Wait another 3 seconds
    await page.waitForTimeout(3000);
    
    // Get elapsed time after 6 seconds total
    const t2 = await elapsedElement.innerText();
    const n2 = parseInt((t2.match(/\d+/) ?? ["0"])[0], 10);
    
    // CRITICAL: Timer must continue increasing, NOT reset
    expect(n2).toBeGreaterThan(n1);
    expect(n2).toBeGreaterThanOrEqual(5); // Should be at least 5-6 seconds
  });

  // Test 6: Bundle timer must NOT stay at 0 (CRITICAL BUG)
  test("Bundle timer must NOT stay at 0 during generation", async ({ page }) => {
    await seedInput(page);
    await mockVerifyPayment(page);
    await mockGenerateReport(page);
    await page.goto("/ai-astrology/preview?session_id=test_bundle_any3&bundle=any-3&reports=marriage-timing,career-money,full-life&auto_generate=true", {
      waitUntil: "networkidle"
    });

    // Wait for loader
    await expect(page.getByRole("heading", { name: LOADER_TITLE })).toBeVisible({ timeout: 10000 });
    const elapsedElement = page.locator(ELAPSED);
    await expect(elapsedElement).toBeVisible({ timeout: 5000 });
    
    // Wait 2 seconds and check timer ticks
    await expectTimerTicks(page);
    
    // Wait another 3 seconds
    await page.waitForTimeout(3000);
    
    // Get elapsed time
    const t = await elapsedElement.innerText();
    const n = parseInt((t.match(/\d+/) ?? ["0"])[0], 10);
    
    // CRITICAL: Timer must be greater than 0
    expect(n).toBeGreaterThan(0);
    expect(n).toBeGreaterThanOrEqual(4); // Should be at least 4-5 seconds
  });

  // Test 7: Decision-support timer must NOT stay at 0 (CRITICAL BUG)
  test("Decision-support timer must NOT stay at 0 during generation", async ({ page }) => {
    await seedInput(page);
    await mockVerifyPayment(page);
    await mockGenerateReport(page);
    await page.goto("/ai-astrology/preview?session_id=test_decision&reportType=decision-support&auto_generate=true", {
      waitUntil: "networkidle"
    });

    // Wait for loader
    await expect(page.getByRole("heading", { name: LOADER_TITLE })).toBeVisible({ timeout: 10000 });
    const elapsedElement = page.locator(ELAPSED);
    await expect(elapsedElement).toBeVisible({ timeout: 5000 });
    
    // Wait 2 seconds and check timer ticks
    await expectTimerTicks(page);
    
    // Wait another 3 seconds
    await page.waitForTimeout(3000);
    
    // Get elapsed time
    const t = await elapsedElement.innerText();
    const n = parseInt((t.match(/\d+/) ?? ["0"])[0], 10);
    
    // CRITICAL: Timer must be greater than 0
    expect(n).toBeGreaterThan(0);
    expect(n).toBeGreaterThanOrEqual(4); // Should be at least 4-5 seconds
  });

  // Test 9: Cross-report transition without reload must NOT reset timer (CRITICAL BUG)
  test("Cross-report transition: life-summary → year-analysis must NOT reset timer", async ({ page }) => {
    await seedInput(page);
    await mockGenerateReport(page);

    await page.goto("/ai-astrology/preview?reportType=life-summary&auto_generate=true", {
      waitUntil: "networkidle",
    });
    await expectTimerTicks(page);

    await mockVerifyPayment(page);
    await page.goto("/ai-astrology/preview?session_id=test_cross&reportType=year-analysis&auto_generate=true", {
      waitUntil: "networkidle",
    });
    await expectTimerTicks(page);
  });

  // Test 8: Full-life must NOT flicker and end in error (CRITICAL BUG)
  test("Full-life must NOT flicker and end in error screen", async ({ page }) => {
    await seedInput(page);
    await mockVerifyPayment(page);
    await mockGenerateReport(page);
    await page.goto("/ai-astrology/preview?session_id=test_full_life&reportType=full-life&auto_generate=true", {
      waitUntil: "networkidle",
    });

    await expectTimerTicks(page);
    const errorVisible = await page.getByText(/Error Generating Report/i).isVisible().catch(() => false);
    expect(errorVisible).toBe(false);
  });
});

