import { test, expect } from "@playwright/test";

/**
 * E2E Test: Complete Subscription Journey
 * 
 * ChatGPT Feedback Fix: Tests the canonical subscription flow end-to-end
 * 
 * Canonical Flow:
 * 1. Subscribe button → POST /api/ai-astrology/create-checkout
 * 2. Server returns checkoutUrl
 * 3. Client does window.location.href = checkoutUrl
 * 4. Stripe success_url → /ai-astrology/subscription/success?session_id=...
 * 5. Success page calls server verify endpoint, writes subscription status into Supabase
 * 6. User redirected to subscription dashboard → shows "Active"
 * 
 * Success Criteria:
 * - Subscribe button creates checkout and redirects to Stripe
 * - Success page verifies session_id and redirects to dashboard
 * - Dashboard shows "Active" status after verification
 * - Cancel subscription works (server-side cancel endpoint)
 * - Status persists after refresh
 */

test.describe("Subscription Journey - Complete Flow", () => {
  test("Subscribe → Checkout → Success → Verify → Dashboard shows Active", async ({ page }) => {
    // Seed sessionStorage with birth details (required for subscription page)
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

    // Track subscription state (simulates Supabase/DB)
    let subscriptionState: any = {
      ok: true,
      data: {
        status: "inactive",
        planInterval: "month",
        cancelAtPeriodEnd: false,
        currentPeriodEnd: null,
      },
    };

    // Mock create-checkout endpoint
    const mockSessionId = "cs_test_mock_subscription_session_" + Date.now();
    await page.route("**/api/ai-astrology/create-checkout", async (route) => {
      const request = route.request();
      const postData = request.postDataJSON();
      
      // Verify it's a subscription request
      expect(postData.subscription).toBe(true);
      expect(postData.input).toBeDefined();
      expect(postData.successUrl).toContain("/ai-astrology/subscription/success");
      expect(postData.cancelUrl).toContain("/ai-astrology/subscription");
      
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          data: {
            sessionId: mockSessionId,
            // For mock mode, return local success URL (not Stripe)
            url: `${new URL(request.url()).origin}/ai-astrology/subscription/success?session_id=${mockSessionId}`,
          },
          testMode: true,
        }),
      });
    });

    // Mock subscription status endpoint (initial: inactive)
    await page.route("**/api/billing/subscription**", async (route) => {
      const request = route.request();
      if (request.method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(subscriptionState),
        });
        return;
      }
      await route.continue();
    });

    // Mock verify-session endpoint (simulates writing to Supabase)
    await page.route("**/api/billing/subscription/verify-session", async (route) => {
      const request = route.request();
      const postData = request.postDataJSON();
      expect(postData.session_id).toBe(mockSessionId);
      
      // Update state to "active" (simulates DB write)
      subscriptionState = {
        ok: true,
        data: {
          status: "active",
          planInterval: "month",
          cancelAtPeriodEnd: false,
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        },
      };
      
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true }),
        headers: {
          "Set-Cookie": `billing_session_id=${mockSessionId}; HttpOnly; Path=/; SameSite=Lax`,
        },
      });
    });

    // Navigate to subscription page
    await page.goto("/ai-astrology/subscription", { waitUntil: "domcontentloaded" });

    // Verify initial state (not subscribed)
    await expect(page.locator('text=/Subscribe|Get started/i')).toBeVisible();

    // Click Subscribe button
    const subscribeButton = page.locator('button:has-text("Subscribe"), button:has-text("Get started"), button:has-text("Start Subscription")').first();
    await subscribeButton.click();

    // Wait for redirect to success page (create-checkout should redirect)
    await page.waitForURL(/\/ai-astrology\/subscription\/success/, { timeout: 5000 });

    // Verify we're on success page
    await expect(page).toHaveURL(/\/ai-astrology\/subscription\/success\?session_id=/);

    // Success page should call verify-session
    // Wait for redirect back to subscription dashboard
    await page.waitForURL(/\/ai-astrology\/subscription(?!\/success)/, { timeout: 5000 });

    // Verify we're back on subscription dashboard
    await expect(page).toHaveURL(/\/ai-astrology\/subscription$/);

    // Dashboard should now show "Active" status
    // The subscription state was updated by verify-session, and dashboard fetches it
    await expect(page.locator('text=/Active|Subscribed/i')).toBeVisible({ timeout: 5000 });

    // Refresh page - status should persist
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.locator('text=/Active|Subscribed/i')).toBeVisible();
  });

  test("Cancel subscription → shows Canceled status → persists after refresh", async ({ page }) => {
    // Seed sessionStorage
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
      sessionStorage.setItem("aiAstrologyPaymentSessionId", "cs_test_mock_subscription_session");
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

    // Start with active subscription
    let subscriptionState: any = {
      ok: true,
      data: {
        status: "active",
        planInterval: "month",
        cancelAtPeriodEnd: false,
        currentPeriodEnd: "2026-02-15T00:00:00.000Z",
      },
    };

    // Mock subscription status endpoint
    await page.route("**/api/billing/subscription**", async (route) => {
      const request = route.request();
      if (request.method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(subscriptionState),
        });
        return;
      }
      await route.continue();
    });

    // Mock cancel endpoint
    await page.route("**/api/billing/subscription/cancel", async (route) => {
      // Update state to canceled (simulates DB update)
      subscriptionState = {
        ok: true,
        data: {
          status: "active",
          planInterval: "month",
          cancelAtPeriodEnd: true, // Canceled at period end
          currentPeriodEnd: "2026-02-15T00:00:00.000Z",
        },
      };
      
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(subscriptionState),
      });
    });

    await page.goto("/ai-astrology/subscription", { waitUntil: "domcontentloaded" });

    // Verify active state
    await expect(page.locator('text=/Active|Subscribed/i')).toBeVisible();

    // Click Cancel button
    const cancelButton = page.locator('button:has-text("Cancel"), button:has-text("Cancel subscription")').first();
    await cancelButton.click();

    // Confirm cancellation (if there's a modal)
    const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Yes, cancel"), [data-testid*="confirm"]').first();
    if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await confirmButton.click();
    }

    // Wait for status update
    await expect(page.locator('text=/Canceled|active until|canceled/i')).toBeVisible({ timeout: 5000 });

    // Refresh - status should persist
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.locator('text=/Canceled|active until|canceled/i')).toBeVisible();
  });
});

