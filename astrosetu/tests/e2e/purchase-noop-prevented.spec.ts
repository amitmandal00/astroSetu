import { test, expect } from "@playwright/test";

/**
 * E2E Test: Purchase No-Op Prevented
 * 
 * Verifies that purchase button redirects to input instead of silently returning
 * This fixes "Purchase does nothing" issue
 */
test.describe("Purchase No-Op Prevented", () => {
  test("Purchase button redirects to input when no input present", async ({ page, context }) => {
    // Clear sessionStorage and localStorage
    await context.clearCookies();
    await page.addInitScript(() => {
      sessionStorage.clear();
      localStorage.clear();
    });

    // Navigate to preview page with reportType but no input
    const reportType = "year-analysis";
    await page.goto(`/ai-astrology/preview?reportType=${reportType}`);
    
    // Wait for redirect to input (if auto-redirect happens)
    // OR wait for purchase button to be visible
    await page.waitForTimeout(2000);
    
    // If still on preview (auto-redirect didn't happen), click purchase button
    if (page.url().includes("/preview")) {
      const purchaseButton = page.getByRole("button", { name: /purchase.*year analysis/i });
      
      // Should be visible (even if disabled or clickable)
      await expect(purchaseButton).toBeVisible({ timeout: 5000 });
      
      // Click purchase button
      await purchaseButton.click();
      
      // Should redirect to input page within 2 seconds (not silent no-op)
      await page.waitForURL(/\/ai-astrology\/input/, { timeout: 5000 });
      
      // Verify returnTo is present in URL
      const url = page.url();
      expect(url).toContain("returnTo=");
      expect(url).toContain("reportType=");
      expect(url).toContain(reportType);
    } else {
      // Auto-redirect already happened - verify we're on input page
      expect(page.url()).toContain("/input");
      expect(page.url()).toContain("reportType=");
    }
  });

  test("Purchase button works when input is present (via input_token)", async ({ page, context }) => {
    // Clear sessionStorage
    await page.addInitScript(() => {
      sessionStorage.clear();
    });

    // Mock input-session API
    await page.route("**/api/ai-astrology/input-session", async (route) => {
      if (route.request().method() === "POST") {
        const response = await route.fetch();
        await route.fulfill({
          status: response.status,
          contentType: "application/json",
          body: JSON.stringify({
            ok: true,
            data: { token: "test-token-123" },
          }),
        });
      } else if (route.request().method() === "GET") {
        const url = new URL(route.request().url());
        const token = url.searchParams.get("token");
        if (token === "test-token-123") {
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
            },
          });
        } else {
          await route.continue();
        }
      } else {
        await route.continue();
      }
    });

    // Mock checkout API to return success
    await page.route("**/api/ai-astrology/create-checkout", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          data: {
            url: "https://checkout.stripe.com/pay/test",
            sessionId: "test-session-id",
          },
        }),
      });
    });

    // First, create input_token by visiting input page
    await page.goto("/ai-astrology/input?reportType=year-analysis");
    
    // Fill form
    await page.fill('input[name="name"]', "Test User");
    await page.fill('input[name="dob"]', "1990-01-01");
    await page.fill('input[name="tob"]', "12:00");
    await page.fill('input[placeholder*="Place"]', "Mumbai, Maharashtra, India");
    await page.waitForSelector('text=Coordinates resolved', { timeout: 10000 });
    
    // Submit form
    const submitButton = page.getByRole("button", { name: /submit|continue|generate/i });
    await submitButton.click();

    // Wait for redirect to preview with input_token
    await page.waitForURL(/\/preview/, { timeout: 15000 });
    
    // Wait a bit for input to load
    await page.waitForTimeout(2000);
    
    // Click purchase button
    const purchaseButton = page.getByRole("button", { name: /purchase.*year analysis/i });
    await expect(purchaseButton).toBeVisible({ timeout: 5000 });
    
    // CRITICAL: Verify purchase button does NOT silently return
    // Should either redirect to Stripe OR show error within 15 seconds
    const purchaseClickPromise = purchaseButton.click();
    
    // Wait for navigation OR error message
    const navigationOrError = await Promise.race([
      page.waitForURL(/checkout\.stripe\.com/, { timeout: 15000 }).then(() => "stripe"),
      page.waitForSelector('text=/error|failed|ref:/i', { timeout: 15000 }).then(() => "error"),
      page.waitForTimeout(15000).then(() => "timeout"),
    ]);
    
    expect(navigationOrError).not.toBe("timeout"); // Should not be silent no-op
    
    // If navigation happened, we're good
    // If error appeared, verify it has attempt ID
    if (navigationOrError === "error") {
      const errorText = await page.getByText(/error|failed|ref:/i).first().textContent();
      expect(errorText).toMatch(/ref:\s*[A-Z0-9]{8}/i); // Should have attempt ID
    }
  });
});

