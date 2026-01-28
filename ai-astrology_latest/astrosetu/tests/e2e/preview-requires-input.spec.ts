import { test, expect } from "@playwright/test";
import { resetStorage } from "./helpers/storage";

/**
 * E2E Test: Preview Requires Input
 * 
 * Verifies that preview page redirects to input when no input + no valid input_token
 * This prevents "Redirecting..." dead states
 */
test.describe("Preview Requires Input", () => {
  test("Preview redirects to input when no input_token and no sessionStorage", async ({ page, context }) => {
    // Clear sessionStorage and localStorage
    await resetStorage(page, context);

    // Navigate to preview page with reportType but no input_token
    const reportType = "year-analysis";
    await page.goto(`/ai-astrology/preview?reportType=${reportType}`);
    
    // CRITICAL FIX (ChatGPT): Assert no "Redirecting..." screen persists beyond 2s
    // Should redirect to input page with returnTo parameter within 2s
    const redirectStartTime = Date.now();
    await page.waitForURL(/\/ai-astrology\/input/, { timeout: 5000 });
    const redirectTime = Date.now() - redirectStartTime;
    
    // Assert redirect happened within 2s (not infinite "Redirecting...")
    expect(redirectTime).toBeLessThan(2500); // Allow 500ms buffer
    
    // Verify returnTo is present in URL
    const url = page.url();
    expect(url).toContain("returnTo=");
    expect(url).toContain("reportType=");
    expect(url).toContain(reportType);
    
    // Verify returnTo contains the preview URL
    const urlObj = new URL(url);
    const returnTo = urlObj.searchParams.get("returnTo");
    expect(returnTo).toBeTruthy();
    expect(returnTo).toContain("/ai-astrology/preview");
    expect(returnTo).toContain(`reportType=${reportType}`);
  });

  test("Preview loads input from input_token and doesn't redirect", async ({ page, context }) => {
    // Clear sessionStorage
    await resetStorage(page, context);

    // Mock input-session API to return valid token data
    let capturedToken: string | null = null;
    await page.route("**/api/ai-astrology/input-session", async (route) => {
      if (route.request().method() === "POST") {
        const response = await route.fetch();
        const json = await response.json();
        if (json.ok && json.data?.token) {
          capturedToken = json.data.token;
        }
        await route.fulfill({
          status: response.status,
          contentType: "application/json",
          body: JSON.stringify(json),
        });
      } else if (route.request().method() === "GET") {
        // Mock GET response
        const url = new URL(route.request().url());
        const token = url.searchParams.get("token");
        if (token) {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              ok: true,
              data: {
                input: {
                  name: "Test User",
                  dob: "1990-01-01",
                  tob: "12:00",
                  place: "Mumbai, Maharashtra, India",
                  latitude: 19.0760,
                  longitude: 72.8777,
                  gender: "Male",
                },
                reportType: "year-analysis",
              },
            }),
          });
        } else {
          await route.continue();
        }
      } else {
        await route.continue();
      }
    });

    // First, create a token by visiting input page
    await page.goto("/ai-astrology/input?reportType=year-analysis");
    
    // Wait for form to load, then fill form
    await page.waitForSelector('input[name="name"]', { timeout: 10000 });
    await page.fill('input[name="name"]', "Test User");
    await page.fill('input[name="dob"]', "1990-01-01");
    await page.fill('input[name="tob"]', "12:00");
    await page.fill('input[placeholder*="Place"]', "Mumbai, Maharashtra, India");
    await page.waitForSelector('text=Coordinates resolved', { timeout: 10000 });
    
    // Submit form (this will create token)
    const submitButton = page.getByRole("button", { name: /submit|continue|generate/i });
    await submitButton.click();

    // Wait for redirect to preview with input_token
    await page.waitForURL(/\/preview/, { timeout: 15000 });
    
    // Verify input_token is in URL
    const previewUrl = page.url();
    expect(previewUrl).toContain("input_token=");
    
    // Extract token from URL
    const urlObj = new URL(previewUrl);
    const inputToken = urlObj.searchParams.get("input_token");
    expect(inputToken).toBeTruthy();
    
    // Verify preview page does NOT redirect (input loaded successfully)
    await page.waitForTimeout(2000); // Wait to ensure no redirect happens
    expect(page.url()).toContain("/preview");
    expect(page.url()).toContain("input_token=");
    
    // CRITICAL FIX (ChatGPT): Assert no "Redirecting..." message persists beyond 2s
    // Verify no "Redirecting..." message is visible after 2s
    await page.waitForTimeout(2500); // Wait 2.5s to ensure watchdog doesn't fire
    const redirectingText = page.getByText("Redirecting...");
    await expect(redirectingText).not.toBeVisible({ timeout: 1000 });
  });

  test("Preview shows error and Start again button when input_token is expired", async ({ page }) => {
    // Clear sessionStorage
    await page.addInitScript(() => {
      sessionStorage.clear();
    });

    // Mock input-session API to return expired token (410)
    await page.route("**/api/ai-astrology/input-session?token=*", async (route) => {
      await route.fulfill({
        status: 410,
        contentType: "application/json",
        body: JSON.stringify({
          ok: false,
          error: "Token has expired. Please start again.",
          code: "TOKEN_EXPIRED",
        }),
      });
    });

    // Navigate to preview with expired token
    await page.goto("/ai-astrology/preview?reportType=year-analysis&input_token=expired-token-123");
    
    // CRITICAL FIX (ChatGPT): Assert no "Redirecting..." screen persists beyond 2s
    // Should show error message within 2 seconds (not infinite redirecting)
    const errorStartTime = Date.now();
    const errorMessage = page.getByText(/expired|start again/i);
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
    const errorTime = Date.now() - errorStartTime;
    
    // Assert error appeared within 2s (not infinite "Redirecting...")
    expect(errorTime).toBeLessThan(2500); // Allow 500ms buffer
    
    // Should not show "Redirecting..." forever
    const redirectingText = page.getByText("Redirecting...");
    await expect(redirectingText).not.toBeVisible({ timeout: 1000 });
  });
});

