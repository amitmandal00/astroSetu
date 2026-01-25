/**
 * @fileoverview E2E Test: Subscription Flow - Subscribe Button Redirects
 * 
 * ChatGPT Feedback: Assert on clicking Subscribe:
 * - URL changes away from /ai-astrology/subscription within 2 seconds
 * - OR a visible error toast appears (acceptable, but must not silent-refresh)
 * 
 * This test verifies that clicking "Subscribe" button actually redirects the user
 * to the checkout URL, not just refreshing the same page silently.
 */

import { test, expect } from "@playwright/test";

test.describe("Subscription Flow - Subscribe Button Redirects", () => {
  test("Subscribe button redirects away from subscription page (not silent refresh)", async ({ page, context }) => {
    // CRITICAL: Start with fresh browser context (no cookies, no storage)
    // This simulates first-time user clicking Subscribe
    await context.clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // Seed sessionStorage with birth details (required for subscription page)
    await page.addInitScript(() => {
      sessionStorage.setItem(
        "aiAstrologyInput",
        JSON.stringify({
          name: "Test User",
          dob: "1990-01-01",
          tob: "10:00",
          place: "Mumbai",
          latitude: 19.0760,
          longitude: 72.8777,
          gender: "Male",
          timezone: "Asia/Kolkata",
        })
      );
    });

    // Mock daily-guidance API (subscription page may fetch it)
    await page.route("**/api/ai-astrology/daily-guidance", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          data: {
            guidance: "Mock monthly guidance",
            focusAreas: { mindset: "x", work: "x", relationships: "x", energy: "x" },
            helpfulThisMonth: [],
            beMindfulOf: [],
            reflectionPrompt: "Mock reflection prompt",
          },
        }),
      });
    });

    // Track requests to create-checkout endpoint
    let checkoutRequestCount = 0;
    let checkoutUrl: string | null = null;

    // Mock create-checkout endpoint
    const mockSessionId = "cs_test_mock_subscription_session_" + Date.now();
    await page.route("**/api/ai-astrology/create-checkout", async (route) => {
      checkoutRequestCount++;
      const request = route.request();
      const postData = request.postDataJSON();
      
      // Verify it's a subscription request
      expect(postData.subscription).toBe(true);
      expect(postData.input).toBeDefined();
      expect(postData.successUrl).toContain("/ai-astrology/subscription/success");
      expect(postData.cancelUrl).toContain("/ai-astrology/subscription");
      
      // Return a mock checkout URL (either Stripe or local success URL)
      checkoutUrl = `${new URL(request.url()).origin}/ai-astrology/subscription/success?session_id=${mockSessionId}`;
      
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          data: {
            sessionId: mockSessionId,
            url: checkoutUrl,
          },
          testMode: true,
        }),
      });
    });

    // Mock subscription status endpoint (initial: not subscribed)
    await page.route("**/api/billing/subscription**", async (route) => {
      const request = route.request();
      if (request.method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            ok: true,
            data: {
              status: "inactive",
              planInterval: "month",
              cancelAtPeriodEnd: false,
              currentPeriodEnd: null,
            },
          }),
        });
        return;
      }
      await route.continue();
    });

    // Navigate to subscription page
    const initialUrl = "/ai-astrology/subscription";
    await page.goto(initialUrl, { waitUntil: "domcontentloaded" });

    // Get initial URL to compare later
    const initialPageUrl = page.url();

    // Verify Subscribe button is visible
    const subscribeButton = page.locator('button:has-text("Subscribe"), button:has-text("Get started"), button:has-text("Start Subscription")').first();
    await expect(subscribeButton).toBeVisible();

    // CRITICAL ASSERTION: Click Subscribe and verify redirect happens
    // Either URL changes away from subscription page OR error toast appears
    const subscribePromise = subscribeButton.click();
    const urlChangePromise = page.waitForURL(
      (url) => !url.pathname.includes("/ai-astrology/subscription") || url.searchParams.has("session_id"),
      { timeout: 2000 }
    ).catch(() => null);

    // Wait for either URL change or timeout
    await Promise.race([subscribePromise, urlChangePromise]);

    // Wait a bit to see if URL changes or error appears
    await page.waitForTimeout(2000);

    // CRITICAL ASSERTION 1: URL must change away from subscription page OR error must be visible
    const currentUrl = page.url();
    const urlChanged = currentUrl !== initialPageUrl && 
                       (currentUrl.includes("/ai-astrology/subscription/success") || 
                        currentUrl.includes("checkout.stripe.com") ||
                        !currentUrl.includes("/ai-astrology/subscription"));

    // Check for visible error toast/message
    const errorVisible = await page.locator('text=/failed|error|Invalid checkout URL|Missing env/i').isVisible().catch(() => false);
    const errorToast = await page.locator('[role="alert"], .error-message, .toast-error').isVisible().catch(() => false);

    // CRITICAL: Must have either URL change OR visible error (not silent refresh)
    expect(
      urlChanged || errorVisible || errorToast,
      "Subscribe button must redirect away from page OR show visible error (not silent refresh)"
    ).toBe(true);

    // CRITICAL ASSERTION 2: create-checkout endpoint must be called
    expect(
      checkoutRequestCount,
      "Subscribe button must call create-checkout endpoint"
    ).toBeGreaterThan(0);

    // CRITICAL ASSERTION 3: If URL changed, it should be to success or Stripe checkout
    if (urlChanged) {
      expect(
        currentUrl.includes("/ai-astrology/subscription/success") || 
        currentUrl.includes("checkout.stripe.com") ||
        currentUrl.includes("localhost"),
        "Redirect URL must be to success page, Stripe checkout, or localhost"
      ).toBe(true);
    }

    // CRITICAL ASSERTION 4: If error shown, it must be visible (not silent)
    if (errorVisible || errorToast) {
      const errorText = await page.locator('text=/failed|error/i').first().textContent().catch(() => null);
      expect(
        errorText,
        "Error message must be visible and descriptive"
      ).not.toBeNull();
    }
  });

  test("Subscribe button shows error if checkout fails", async ({ page }) => {
    // Seed sessionStorage
    await page.addInitScript(() => {
      sessionStorage.setItem(
        "aiAstrologyInput",
        JSON.stringify({
          name: "Test User",
          dob: "1990-01-01",
          tob: "10:00",
          place: "Mumbai",
          latitude: 19.0760,
          longitude: 72.8777,
          gender: "Male",
          timezone: "Asia/Kolkata",
        })
      );
    });

    // Mock daily-guidance
    await page.route("**/api/ai-astrology/daily-guidance", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          data: {
            guidance: "Mock monthly guidance",
            focusAreas: { mindset: "x", work: "x", relationships: "x", energy: "x" },
            helpfulThisMonth: [],
            beMindfulOf: [],
            reflectionPrompt: "Mock reflection prompt",
          },
        }),
      });
    });

    // Mock create-checkout to fail (simulate missing env vars or API error)
    await page.route("**/api/ai-astrology/create-checkout", async (route) => {
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({
          ok: false,
          error: "Failed to create subscription: STRIPE_PRICE_ID_MONTHLY not configured",
        }),
      });
    });

    // Mock subscription status (inactive)
    await page.route("**/api/billing/subscription**", async (route) => {
      const request = route.request();
      if (request.method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            ok: true,
            data: {
              status: "inactive",
              planInterval: "month",
              cancelAtPeriodEnd: false,
              currentPeriodEnd: null,
            },
          }),
        });
        return;
      }
      await route.continue();
    });

    await page.goto("/ai-astrology/subscription", { waitUntil: "domcontentloaded" });

    const subscribeButton = page.locator('button:has-text("Subscribe"), button:has-text("Get started")').first();
    await expect(subscribeButton).toBeVisible();

    // Click Subscribe
    await subscribeButton.click();

    // Wait for error to appear (should not redirect)
    await page.waitForTimeout(1000);

    // CRITICAL ASSERTION: Error must be visible (not silent failure)
    const errorVisible = await page.locator('text=/failed|error|not configured/i').isVisible({ timeout: 3000 }).catch(() => false);
    expect(
      errorVisible,
      "If checkout fails, error must be visible (not silent failure)"
    ).toBe(true);

    // CRITICAL ASSERTION: Should still be on subscription page (not redirected)
    expect(page.url()).toContain("/ai-astrology/subscription");
  });

  test("Monthly flow returnTo contract - Subscription → Input → Returns to Subscription", async ({ page, context }) => {
    // CRITICAL: Fresh browser context (no saved input)
    await context.clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // Navigate to subscription page (no birth details in storage)
    await page.goto("/ai-astrology/subscription", { waitUntil: "domcontentloaded" });

    // CRITICAL ASSERTION 1: Should redirect to input with returnTo parameter
    await page.waitForURL(
      /\/ai-astrology\/input\?.*returnTo=%2Fai-astrology%2Fsubscription/,
      { timeout: 5000 }
    );

    // Verify returnTo parameter is present
    const url = new URL(page.url());
    const returnToParam = url.searchParams.get("returnTo");
    expect(
      returnToParam,
      "Input page must have returnTo=/ai-astrology/subscription parameter"
    ).toBe("/ai-astrology/subscription");

    // Verify flow parameter is present
    const flowParam = url.searchParams.get("flow");
    expect(
      flowParam,
      "Input page must have flow=subscription parameter"
    ).toBe("subscription");

    // Fill birth details form (use helper if available, otherwise manual)
    await page.fill('input[name="name"], input[placeholder*="name" i]', "Test User");
    await page.fill('input[name="dob"], input[type="date"]', "1990-01-01");
    await page.fill('input[name="tob"], input[type="time"]', "10:00");
    await page.fill('input[name="place"], input[placeholder*="place" i]', "Mumbai");

    // Submit form
    const submitButton = page.locator('button[type="submit"], button:has-text("Submit"), button:has-text("Continue")').first();
    await submitButton.click();

    // CRITICAL ASSERTION 2: After submitting, should return to subscription page
    await page.waitForURL(
      /\/ai-astrology\/subscription$/,
      { timeout: 5000 }
    );

    // Verify we're back on subscription page
    expect(
      page.url(),
      "After entering birth details, must return to /ai-astrology/subscription"
    ).toContain("/ai-astrology/subscription");
  });
});

