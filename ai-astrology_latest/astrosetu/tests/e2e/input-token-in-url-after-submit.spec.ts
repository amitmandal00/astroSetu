import { test, expect } from "@playwright/test";
import { resetStorage } from "./helpers/storage";

/**
 * CRITICAL FIX (ChatGPT 22:45): Verify input_token appears in URL after input submit
 * 
 * This test ensures that when:
 * 1. User is on input page
 * 2. Fills birth details and submits
 * 3. Should land on preview/subscription with input_token in URL
 * 4. AND within 2s you see a network call to /api/ai-astrology/input-session?token=
 * 5. AND the page does NOT redirect back to input again
 * 
 * Root cause: router.push() was losing query params or causing stale state
 * Fix: Use window.location.assign() for hard navigation (guarantees query params survive)
 */
test.describe("Input Token in URL After Submit", () => {
  test("input submit → preview with input_token → network call visible → no redirect loop", async ({ page }) => {
    // Clear storage to ensure clean state
    await resetStorage(page);
    await page.goto("/ai-astrology/input?reportType=year-analysis");

    // Step 1: Wait for form to load, then fill input form
    await page.waitForSelector('input[name="name"]', { timeout: 10000 });
    await page.fill('input[name="name"]', "Test User");
    await page.fill('input[name="dob"]', "1990-01-01");
    await page.fill('input[name="tob"]', "12:00");
    await page.fill('input[name="place"]', "Mumbai");
    
    // Wait for geocoding (if any)
    await page.waitForTimeout(1000);

    // Step 2: Track network requests to input-session API
    const tokenFetchRequests: string[] = [];
    page.on("request", (request) => {
      const url = request.url();
      if (url.includes("/api/ai-astrology/input-session?token=")) {
        tokenFetchRequests.push(url);
      }
    });

    // Step 3: Submit input → should return to preview with input_token
    const submitButton = page.getByRole("button", { name: /submit|continue|generate|purchase/i });
    await submitButton.click();

    // Step 4: CRITICAL - Wait for navigation back to preview with input_token
    // Assert URL contains input_token within 2s
    await page.waitForURL(/\/ai-astrology\/preview.*input_token=/, { timeout: 2000 });
    
    // Verify input_token is in URL
    const previewUrl = page.url();
    expect(previewUrl).toContain("/ai-astrology/preview");
    expect(previewUrl).toContain("input_token=");

    // Step 5: CRITICAL - Verify network call to /api/ai-astrology/input-session?token= happened
    // This proves token fetch is actually happening (not just in URL)
    await page.waitForTimeout(2000); // Wait for token fetch to complete
    
    expect(tokenFetchRequests.length).toBeGreaterThan(0);
    const tokenFetchUrl = tokenFetchRequests[0];
    expect(tokenFetchUrl).toContain("/api/ai-astrology/input-session?token=");

    // Step 6: CRITICAL - Verify we're still on preview (not redirected back to input)
    // Wait a bit longer to ensure no redirect loop
    await page.waitForTimeout(3000);
    
    const finalUrl = page.url();
    expect(finalUrl).toContain("/ai-astrology/preview");
    expect(finalUrl).not.toContain("/ai-astrology/input");

    // Verify preview is showing content (not "Redirecting..." or "Enter Your Birth Details")
    const pageContent = await page.textContent("body");
    expect(pageContent).not.toContain("Redirecting...");
    expect(pageContent).not.toContain("Enter Your Birth Details");
  });

  test("input submit → subscription with input_token → network call visible → no redirect loop", async ({ page }) => {
    // Clear storage
    await resetStorage(page);
    await page.goto("/ai-astrology/input?reportType=life-summary&flow=subscription&returnTo=/ai-astrology/subscription");

    // Wait for form to load, then fill input form
    await page.waitForSelector('input[name="name"]', { timeout: 10000 });
    await page.fill('input[name="name"]', "Test User");
    await page.fill('input[name="dob"]', "1990-01-01");
    await page.fill('input[name="tob"]', "12:00");
    await page.fill('input[name="place"]', "Mumbai");
    
    await page.waitForTimeout(1000);

    // Track network requests
    const tokenFetchRequests: string[] = [];
    page.on("request", (request) => {
      const url = request.url();
      if (url.includes("/api/ai-astrology/input-session?token=")) {
        tokenFetchRequests.push(url);
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

    // Verify network call happened
    await page.waitForTimeout(2000);
    
    expect(tokenFetchRequests.length).toBeGreaterThan(0);
    const tokenFetchUrl = tokenFetchRequests[0];
    expect(tokenFetchUrl).toContain("/api/ai-astrology/input-session?token=");

    // Verify no redirect loop
    await page.waitForTimeout(3000);
    
    const finalUrl = page.url();
    expect(finalUrl).toContain("/ai-astrology/subscription");
    expect(finalUrl).not.toContain("/ai-astrology/input");
  });
});

