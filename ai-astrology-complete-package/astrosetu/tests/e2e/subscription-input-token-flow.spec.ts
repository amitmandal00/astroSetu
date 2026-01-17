import { test, expect } from "@playwright/test";

/**
 * E2E Test: Subscription Input Token Flow
 * 
 * Verifies that subscription page accepts input_token, loads input, and cleans URL
 * This fixes "Monthly Outlook → input → never returns to subscription" issue
 */
test.describe("Subscription Input Token Flow", () => {
  test("Subscription loads input from input_token and cleans URL", async ({ page, context }) => {
    // Clear sessionStorage
    await page.addInitScript(() => {
      sessionStorage.clear();
    });

    // Mock input-session API to return valid token data
    const testToken = "test-subscription-token-123";
    await page.route(`**/api/ai-astrology/input-session?token=${testToken}`, async (route) => {
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
            reportType: "life-summary",
          },
        },
      });
    });

    // Navigate to subscription page with input_token
    await page.goto(`/ai-astrology/subscription?input_token=${testToken}`);
    
    // Wait for URL to be cleaned (input_token removed)
    await page.waitForURL(/\/ai-astrology\/subscription(?!\?input_token)/, { timeout: 5000 });
    
    // Verify URL is clean (no input_token)
    const url = page.url();
    expect(url).not.toContain("input_token");
    expect(url).toContain("/ai-astrology/subscription");
    
    // Verify Subscribe button is enabled (input loaded)
    const subscribeButton = page.getByRole("button", { name: /subscribe/i });
    await expect(subscribeButton).toBeVisible({ timeout: 5000 });
    
    // CRITICAL FIX (ChatGPT): Assert UI shows "Cancel anytime" / active state after return
    // Should show subscription UI (not "Enter birth details" or redirect to input)
    const enterDetailsText = page.getByText(/enter birth details|redirecting/i);
    await expect(enterDetailsText).not.toBeVisible({ timeout: 2000 });
    
    // Verify active state is visible (subscription UI loaded)
    const subscriptionUI = page.getByText(/cancel anytime|active|subscribed/i);
    await expect(subscriptionUI).toBeVisible({ timeout: 2000 });
  });

  test("Subscription redirects to input with flow=subscription when no input_token and no sessionStorage", async ({ page, context }) => {
    // Clear sessionStorage and localStorage
    await context.clearCookies();
    await page.addInitScript(() => {
      sessionStorage.clear();
      localStorage.clear();
    });

    // Navigate to subscription page without input_token
    await page.goto("/ai-astrology/subscription");
    
    // Should redirect to input page with flow=subscription and returnTo
    await page.waitForURL(/\/ai-astrology\/input/, { timeout: 5000 });
    
    // Verify flow and returnTo parameters
    const url = page.url();
    expect(url).toContain("flow=subscription");
    expect(url).toContain("returnTo=");
    expect(url).toContain("/ai-astrology/subscription");
    expect(url).toContain("reportType=life-summary");
  });

  test("Input page redirects to subscription when flow=subscription", async ({ page, context }) => {
    // Clear sessionStorage
    await page.addInitScript(() => {
      sessionStorage.clear();
    });

    // Mock input-session API to return token
    await page.route("**/api/ai-astrology/input-session", async (route) => {
      if (route.request().method() === "POST") {
        const response = await route.fetch();
        await route.fulfill({
          status: response.status,
          contentType: "application/json",
          body: JSON.stringify({
            ok: true,
            data: { token: "subscription-token-456" },
          }),
        });
      } else {
        await route.continue();
      }
    });

    // Navigate to input page with flow=subscription
    await page.goto("/ai-astrology/input?reportType=life-summary&flow=subscription&returnTo=/ai-astrology/subscription");
    
    // Fill form
    await page.fill('input[name="name"]', "Test User");
    await page.fill('input[name="dob"]', "1990-01-01");
    await page.fill('input[name="tob"]', "12:00");
    await page.fill('input[placeholder*="Place"]', "Mumbai, Maharashtra, India");
    await page.waitForSelector('text=Coordinates resolved', { timeout: 10000 });
    
    // Submit form
    const submitButton = page.getByRole("button", { name: /submit|continue|generate/i });
    await submitButton.click();

    // Should redirect to subscription page (not preview) with input_token
    await page.waitForURL(/\/ai-astrology\/subscription/, { timeout: 15000 });
    
    // Verify input_token is in URL initially
    let url = page.url();
    expect(url).toContain("input_token=");
    
    // Wait for URL to be cleaned (input_token removed after loading)
    await page.waitForURL(/\/ai-astrology\/subscription(?!\?input_token)/, { timeout: 5000 });
    
    // Verify final URL is clean
    url = page.url();
    expect(url).not.toContain("input_token");
    expect(url).toContain("/ai-astrology/subscription");
    
    // Verify Subscribe button is visible (input loaded successfully)
    const subscribeButton = page.getByRole("button", { name: /subscribe/i });
    await expect(subscribeButton).toBeVisible({ timeout: 5000 });
  });

  test("Full journey: Subscription → Input → Subscription with input_token", async ({ page, context }) => {
    // Clear sessionStorage
    await page.addInitScript(() => {
      sessionStorage.clear();
    });

    // Mock input-session API
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
      } else if (route.request().method() === "GET" && capturedToken) {
        const url = new URL(route.request().url());
        const token = url.searchParams.get("token");
        if (token === capturedToken) {
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
                reportType: "life-summary",
              },
            },
          });
        } else {
          await route.continue();
        }
      } else {
        await route.continue();
      }
    });

    // Step 1: Navigate to subscription (no input)
    await page.goto("/ai-astrology/subscription");
    
    // Step 2: Should redirect to input with flow=subscription
    await page.waitForURL(/\/ai-astrology\/input/, { timeout: 5000 });
    expect(page.url()).toContain("flow=subscription");
    expect(page.url()).toContain("returnTo=");
    
    // Step 3: Fill input form
    await page.fill('input[name="name"]', "Test User");
    await page.fill('input[name="dob"]', "1990-01-01");
    await page.fill('input[name="tob"]', "12:00");
    await page.fill('input[placeholder*="Place"]', "Mumbai, Maharashtra, India");
    await page.waitForSelector('text=Coordinates resolved', { timeout: 10000 });
    
    // Step 4: Submit form
    const submitButton = page.getByRole("button", { name: /submit|continue|generate/i });
    await submitButton.click();

    // Step 5: Should return to subscription with input_token
    await page.waitForURL(/\/ai-astrology\/subscription/, { timeout: 15000 });
    
    // Step 6: URL should be cleaned (input_token removed)
    await page.waitForURL(/\/ai-astrology\/subscription(?!\?input_token)/, { timeout: 5000 });
    
    // Step 7: Verify Subscribe button is enabled
    const subscribeButton = page.getByRole("button", { name: /subscribe/i });
    await expect(subscribeButton).toBeVisible({ timeout: 5000 });
    
    // CRITICAL: Verify we're on subscription page (not stuck in input/preview)
    const finalUrl = page.url();
    expect(finalUrl).toContain("/ai-astrology/subscription");
    expect(finalUrl).not.toContain("/input");
    expect(finalUrl).not.toContain("/preview");
  });
});

