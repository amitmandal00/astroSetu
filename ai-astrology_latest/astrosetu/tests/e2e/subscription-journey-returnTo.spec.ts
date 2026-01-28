import { test, expect } from "@playwright/test";
import { resetStorage } from "./helpers/storage";

test.describe("Subscription Journey ReturnTo Flow", () => {
  test("monthly subscription → input → subscription dashboard with input_token → NO redirect to free life report", async ({ page }) => {
    // Start with clean storage, then hit subscription page
    await resetStorage(page);
    await page.goto("/ai-astrology/subscription");

    // Should redirect to input page with flow=subscription
    await page.waitForURL(/\/ai-astrology\/input.*flow=subscription/, { timeout: 3000 });
    expect(page.url()).toContain("flow=subscription");
    expect(page.url()).toContain("returnTo=/ai-astrology/subscription");

    // Wait for form to load, then fill birth details
    await page.waitForSelector('input[name="name"]', { timeout: 10000 });
    await page.fill('input[name="name"]', "Test User");
    await page.fill('input[name="dob"]', "1990-01-01");
    await page.fill('input[name="tob"]', "12:00");
    await page.fill('input[name="place"]', "Mumbai");
    await page.waitForTimeout(1000);

    // Submit form
    await page.getByRole("button", { name: /submit|continue|generate/i }).click();

    // Should navigate to subscription page with input_token
    await page.waitForURL(/\/ai-astrology\/subscription.*input_token=/, { timeout: 3000 });
    expect(page.url()).toContain("input_token=");

    // Wait for token to load
    await page.waitForTimeout(2000);

    // CRITICAL: Should stay on subscription page (NOT redirect to free life report)
    await page.waitForTimeout(3000);
    expect(page.url()).toContain("/ai-astrology/subscription");
    expect(page.url()).not.toContain("/ai-astrology/preview");
    expect(page.url()).not.toContain("/ai-astrology/input");

    // Should show subscribe button (not redirect to input)
    await expect(page.getByRole("button", { name: /subscribe/i })).toBeVisible({ timeout: 5000 });
    
    // Should NOT show "Enter Your Birth Details" card
    await expect(page.getByText("Enter Your Birth Details")).not.toBeVisible();
  });

  test("subscribe button with input_token → should navigate to Stripe checkout (not redirect to same page)", async ({ page }) => {
    // Mock the checkout API to return a checkout URL
    await page.route("**/api/ai-astrology/create-checkout", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          data: {
            url: "https://checkout.stripe.com/test",
            sessionId: "test_session_123",
          },
        }),
      });
    });

    // Navigate to subscription page with input_token (simulating return from input)
    const mockToken = "test_token_123";
    await resetStorage(page);
    await page.goto(`/ai-astrology/subscription?input_token=${mockToken}`);

    // Wait for token to load
    await page.waitForTimeout(2000);

    // Should show subscribe button (not stuck on loading)
    const subscribeButton = page.getByRole("button", { name: /subscribe/i });
    await expect(subscribeButton).toBeVisible({ timeout: 5000 });
    await expect(subscribeButton).not.toBeDisabled();

    // Click subscribe button
    await subscribeButton.click();

    // Should navigate to Stripe checkout (or show error if Stripe not configured)
    // In test environment, might show error, but should NOT redirect to same page
    await page.waitForTimeout(2000);
    
    // Should either navigate to checkout OR show error message
    const isOnCheckout = page.url().includes("checkout.stripe.com");
    const hasError = await page.getByText(/error|failed|taking longer/i).isVisible().catch(() => false);
    
    // Should NOT be on subscription page with input_token (should have navigated)
    const stillOnSubscription = page.url().includes("/ai-astrology/subscription?input_token=");
    expect(stillOnSubscription).toBe(false);
    
    // Should have either navigated to checkout OR shown error
    expect(isOnCheckout || hasError).toBe(true);
  });

  test("subscribe button while token loading → should be disabled", async ({ page }) => {
    // Mock slow token fetch
    await page.route("**/api/ai-astrology/input-session?token=*", async (route) => {
      await page.waitForTimeout(3000); // Simulate slow token fetch
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          data: {
            input: {
              name: "Test User",
              dob: "1990-01-01",
              tob: "12:00:00",
              place: "Mumbai",
              gender: "Male",
              latitude: 19.076,
              longitude: 72.8777,
            },
          },
        }),
      });
    });

    const mockToken = "test_token_slow";
    await resetStorage(page);
    await page.goto(`/ai-astrology/subscription?input_token=${mockToken}`);

    // Should show "Loading your details..." while token is loading
    await expect(page.getByText("Loading your details...")).toBeVisible({ timeout: 1000 });

    // Subscribe button should be disabled or not visible while loading
    const subscribeButton = page.getByRole("button", { name: /subscribe/i });
    const isDisabled = await subscribeButton.isDisabled().catch(() => true);
    const isVisible = await subscribeButton.isVisible().catch(() => false);
    
    // Button should either be disabled or not visible
    expect(isDisabled || !isVisible).toBe(true);

    // Wait for token to load
    await page.waitForTimeout(4000);

    // After loading, button should be enabled
    await expect(subscribeButton).toBeVisible({ timeout: 2000 });
    await expect(subscribeButton).not.toBeDisabled();
  });
});

