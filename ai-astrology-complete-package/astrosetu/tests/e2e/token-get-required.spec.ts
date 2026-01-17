import { test, expect } from "@playwright/test";

/**
 * CRITICAL FIX (Step 4): Verify token GET is required after input submit
 * 
 * This test ensures that when:
 * 1. User submits input form
 * 2. Navigation includes `input_token` in URL
 * 3. GET `/api/ai-astrology/input-session?token=...` occurs within 2s
 * 4. Fail if no GET happens
 * 
 * Root cause: If token GET doesn't happen, preview/subscription won't have input data
 * Fix: Ensure token fetch is always triggered when `input_token` is in URL
 */
test.describe("Token GET Required After Input Submit", () => {
  test("input submit → preview with input_token → GET token within 2s", async ({ page }) => {
    // Clear storage to ensure clean state
    await page.goto("/ai-astrology/input?reportType=year-analysis");
    await page.evaluate(() => {
      sessionStorage.clear();
      localStorage.clear();
    });

    // Step 1: Fill input form
    await page.fill('input[name="name"]', "Test User");
    await page.fill('input[name="dob"]', "1990-01-01");
    await page.fill('input[name="tob"]', "12:00");
    await page.fill('input[name="place"]', "Mumbai");
    
    // Wait for geocoding (if any)
    await page.waitForTimeout(1000);

    // Step 2: Track network requests to input-session API
    const tokenGetRequests: string[] = [];
    page.on("request", (request) => {
      const url = request.url();
      // Match GET request to /api/ai-astrology/input-session?token=
      if (url.includes("/api/ai-astrology/input-session") && 
          url.includes("token=") && 
          request.method() === "GET") {
        tokenGetRequests.push(url);
      }
    });

    // Step 3: Submit input → should navigate to preview with input_token
    const submitButton = page.getByRole("button", { name: /submit|continue|generate/i });
    await submitButton.click();

    // Step 4: Wait for navigation to preview with input_token
    await page.waitForURL(/\/ai-astrology\/preview.*input_token=/, { timeout: 2000 });
    
    // Verify input_token is in URL
    const previewUrl = page.url();
    expect(previewUrl).toContain("/ai-astrology/preview");
    expect(previewUrl).toContain("input_token=");

    // Step 5: CRITICAL - Wait up to 2s for GET token request
    // This proves token fetch is actually happening (not just in URL)
    let tokenGetHappened = false;
    const startTime = Date.now();
    while (Date.now() - startTime < 2000) {
      if (tokenGetRequests.length > 0) {
        tokenGetHappened = true;
        break;
      }
      await page.waitForTimeout(100);
    }
    
    // CRITICAL FIX: Fail if no GET happened within 2s
    expect(tokenGetHappened).toBe(true);
    expect(tokenGetRequests.length).toBeGreaterThan(0);
    
    const tokenGetUrl = tokenGetRequests[0];
    expect(tokenGetUrl).toContain("/api/ai-astrology/input-session");
    expect(tokenGetUrl).toContain("token=");

    // Verify we're still on preview (no redirect loop)
    await page.waitForTimeout(1000);
    const finalUrl = page.url();
    expect(finalUrl).toContain("/ai-astrology/preview");
  });

  test("input submit → subscription with input_token → GET token within 2s", async ({ page }) => {
    // Clear storage
    await page.goto("/ai-astrology/input?reportType=life-summary&flow=subscription&returnTo=/ai-astrology/subscription");
    await page.evaluate(() => {
      sessionStorage.clear();
      localStorage.clear();
    });

    // Fill input form
    await page.fill('input[name="name"]', "Test User");
    await page.fill('input[name="dob"]', "1990-01-01");
    await page.fill('input[name="tob"]', "12:00");
    await page.fill('input[name="place"]', "Mumbai");
    
    await page.waitForTimeout(1000);

    // Track network requests
    const tokenGetRequests: string[] = [];
    page.on("request", (request) => {
      const url = request.url();
      if (url.includes("/api/ai-astrology/input-session") && 
          url.includes("token=") && 
          request.method() === "GET") {
        tokenGetRequests.push(url);
      }
    });

    // Submit input
    const submitButton = page.getByRole("button", { name: /submit|continue|generate/i });
    await submitButton.click();

    // Assert URL contains input_token within 2s
    await page.waitForURL(/\/ai-astrology\/subscription.*input_token=/, { timeout: 2000 });
    
    const subscriptionUrl = page.url();
    expect(subscriptionUrl).toContain("/ai-astrology/subscription");
    expect(subscriptionUrl).toContain("input_token=");

    // CRITICAL - Wait up to 2s for GET token request
    let tokenGetHappened = false;
    const startTime = Date.now();
    while (Date.now() - startTime < 2000) {
      if (tokenGetRequests.length > 0) {
        tokenGetHappened = true;
        break;
      }
      await page.waitForTimeout(100);
    }
    
    // CRITICAL FIX: Fail if no GET happened within 2s
    expect(tokenGetHappened).toBe(true);
    expect(tokenGetRequests.length).toBeGreaterThan(0);
    
    const tokenGetUrl = tokenGetRequests[0];
    expect(tokenGetUrl).toContain("/api/ai-astrology/input-session");
    expect(tokenGetUrl).toContain("token=");

    // Verify we're still on subscription (no redirect loop)
    await page.waitForTimeout(1000);
    const finalUrl = page.url();
    expect(finalUrl).toContain("/ai-astrology/subscription");
  });
});

