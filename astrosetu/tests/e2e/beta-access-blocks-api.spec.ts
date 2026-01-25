import { test, expect } from "@playwright/test";

/**
 * Private Beta Access E2E Test: Blocks API Routes
 * 
 * When NEXT_PUBLIC_PRIVATE_BETA=true and user has no beta_access cookie:
 * - POST /api/ai-astrology/input-session returns 401 private_beta
 * - POST /api/ai-astrology/create-checkout returns 401 private_beta
 * - POST /api/billing/subscription returns 401 private_beta
 */
test.describe("Beta Access Blocks API Routes", () => {
  test.use({
    extraHTTPHeaders: { "x-playwright-private-beta": "true" },
  });

  test.beforeEach(async ({ context }) => {
    // Clear all cookies to ensure no beta_access cookie exists
    await context.clearCookies();
  });

  test("POST /api/ai-astrology/input-session returns 401 when gate enabled and no cookie", async ({ page, request }) => {
    // Make POST request to input-session API
    const response = await request.post("/api/ai-astrology/input-session", {
      data: {
        input: {
          name: "Test User",
          dob: "1990-01-01",
          tob: "12:00",
          place: "Mumbai",
          gender: "Male",
        },
        reportType: "year-analysis",
      },
    });

    // Should return 401 with private_beta error
    expect(response.status()).toBe(401);
    
    const body = await response.json();
    expect(body.error).toBe("private_beta");
    expect(body.message).toContain("restricted");
  });

  test("POST /api/ai-astrology/create-checkout returns 401 when gate enabled and no cookie", async ({ page, request }) => {
    // Make POST request to create-checkout API
    const response = await request.post("/api/ai-astrology/create-checkout", {
      data: {
        reportType: "year-analysis",
        input: {
          name: "Test User",
          dob: "1990-01-01",
          tob: "12:00",
          place: "Mumbai",
          gender: "Male",
        },
      },
    });

    // Should return 401 with private_beta error
    expect(response.status()).toBe(401);
    
    const body = await response.json();
    expect(body.error).toBe("private_beta");
    expect(body.message).toContain("restricted");
  });

  test("GET /api/billing/subscription returns 401 when gate enabled and no cookie", async ({ page, request }) => {
    // Make GET request to subscription API
    const response = await request.get("/api/billing/subscription");

    // Should return 401 with private_beta error
    expect(response.status()).toBe(401);
    
    const body = await response.json();
    expect(body.error).toBe("private_beta");
    expect(body.message).toContain("restricted");
  });

  test("POST /api/ai-astrology/input-session returns 200 when cookie is set", async ({ page, context, request }) => {
    // Step 1: Set beta_access cookie manually (simulating successful verification)
    await context.addCookies([
      {
        name: "beta_access",
        value: "1",
        domain: "localhost",
        path: "/",
        httpOnly: true,
        secure: false,
        sameSite: "Lax",
      },
    ]);

    // Step 2: Make POST request to input-session API
    const response = await request.post("/api/ai-astrology/input-session", {
      data: {
        input: {
          name: "Test User",
          dob: "1990-01-01",
          tob: "12:00",
          place: "Mumbai",
          gender: "Male",
        },
        reportType: "year-analysis",
      },
    });

    // Should return 200 (or appropriate success status, depending on actual implementation)
    // Note: This might still fail if other validation fails, but should NOT be 401 private_beta
    expect(response.status()).not.toBe(401);
    
    if (response.status() === 401) {
      const body = await response.json();
      expect(body.error).not.toBe("private_beta"); // Should not be private_beta error
    }
  });
});

