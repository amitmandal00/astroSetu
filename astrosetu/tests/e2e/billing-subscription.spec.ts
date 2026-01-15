import { test, expect } from "@playwright/test";

/**
 * Critical E2E: Cancel/Resume monthly subscription (AI Astrology)
 *
 * Non-negotiable assertions:
 * - UI must render from DB/API state (GET /api/billing/subscription), not client guesses.
 * - After refresh, state must persist (simulated here by API response, which is what prod DB will back).
 *
 * We mock the billing API routes to keep this deterministic and avoid real Stripe/Supabase calls.
 */

test.describe("Billing - Cancel monthly subscription", () => {
  test("Cancel subscription shows 'active until' and persists after refresh", async ({ page }) => {
    // Prevent networkidle hangs by mocking daily-guidance (subscription page may fetch it)
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

    // Simulated DB-backed state held by mocked API
    let state: any = {
      ok: true,
      data: {
        status: "active",
        planInterval: "month",
        cancelAtPeriodEnd: false,
        currentPeriodEnd: "2026-02-15T00:00:00.000Z",
      },
    };

    await page.route("**/api/billing/subscription**", async (route) => {
      const request = route.request();
      if (request.method() === "GET") {
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(state) });
        return;
      }
      await route.continue();
    });

    await page.route("**/api/billing/subscription/cancel", async (route) => {
      state = {
        ok: true,
        data: {
          status: "active",
          planInterval: "month",
          cancelAtPeriodEnd: true,
          currentPeriodEnd: "2026-02-15T00:00:00.000Z",
        },
      };
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(state) });
    });

    // Seed sessionStorage (page expects input/session to exist)
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
      sessionStorage.setItem("aiAstrologySubscription", "active");
    });

    await page.goto("/ai-astrology/subscription", { waitUntil: "networkidle" });

    // Ensure UI reflects API state
    await expect(page.getByTestId("billing-subscription-status")).toContainText("Active");
    await expect(page.getByTestId("billing-subscription-cancel")).toBeVisible();

    // Cancel flow (confirm modal)
    await page.getByTestId("billing-subscription-cancel").click();
    await expect(page.getByTestId("billing-subscription-confirm-modal")).toBeVisible();
    await page.getByTestId("billing-subscription-confirm-cancel").click();

    // UI updated
    await expect(page.getByTestId("billing-subscription-status")).toContainText("Canceled");
    await expect(page.getByTestId("billing-subscription-status")).toContainText("active until");

    // Refresh should still show canceled (proves UI reads from API, not client-only)
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("billing-subscription-status")).toContainText("Canceled");
  });

  test("Resume subscription returns to Active and persists after refresh", async ({ page }) => {
    // Prevent networkidle hangs by mocking daily-guidance (subscription page may fetch it)
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

    let state: any = {
      ok: true,
      data: {
        status: "active",
        planInterval: "month",
        cancelAtPeriodEnd: true,
        currentPeriodEnd: "2026-02-15T00:00:00.000Z",
      },
    };

    await page.route("**/api/billing/subscription**", async (route) => {
      const request = route.request();
      if (request.method() === "GET") {
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(state) });
        return;
      }
      await route.continue();
    });

    await page.route("**/api/billing/subscription/resume", async (route) => {
      state = {
        ok: true,
        data: {
          status: "active",
          planInterval: "month",
          cancelAtPeriodEnd: false,
          currentPeriodEnd: "2026-02-15T00:00:00.000Z",
        },
      };
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(state) });
    });

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
      sessionStorage.setItem("aiAstrologySubscription", "active");
    });

    await page.goto("/ai-astrology/subscription", { waitUntil: "networkidle" });

    // Canceled state shows Resume
    await expect(page.getByTestId("billing-subscription-resume")).toBeVisible();
    await page.getByTestId("billing-subscription-resume").click();

    await expect(page.getByTestId("billing-subscription-status")).toContainText("Active");

    // Refresh should remain active
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("billing-subscription-status")).toContainText("Active");
  });
});


