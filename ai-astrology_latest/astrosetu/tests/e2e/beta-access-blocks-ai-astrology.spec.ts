import { test, expect } from "@playwright/test";

/**
 * Private Beta Access E2E Test: Blocks AI Astrology Pages
 * 
 * When NEXT_PUBLIC_PRIVATE_BETA=true and user has no beta_access cookie:
 * - Visiting /ai-astrology redirects to /ai-astrology/access
 * - Visiting /ai-astrology/preview?reportType=year-analysis redirects to /ai-astrology/access with returnTo preserved
 * - Other /ai-astrology/* routes also redirect
 */
test.describe("Beta Access Blocks AI Astrology Pages", () => {
  test.use({
    extraHTTPHeaders: { "x-playwright-private-beta": "true" },
  });

  test.beforeEach(async ({ context }) => {
    // Clear all cookies to ensure no beta_access cookie exists
    await context.clearCookies();
  });

  test("visiting /ai-astrology redirects to /ai-astrology/access when gate enabled and no cookie", async ({ page }) => {
    // Set environment variable to enable beta gating (for test purposes, this is mocked by test setup)
    // In real testing, this would be set via test environment
    // For now, we'll test the redirect behavior when cookie is missing

    // Navigate to /ai-astrology
    await page.goto("/ai-astrology");

    // Should redirect to /ai-astrology/access
    await page.waitForURL(/\/ai-astrology\/access/, { timeout: 3000 });

    const url = page.url();
    expect(url).toContain("/ai-astrology/access");

    // Verify access page is rendered
    const pageContent = await page.textContent("body");
    expect(pageContent).toContain("Private Beta Access");
  });

  test("visiting /ai-astrology/preview?reportType=year-analysis redirects to /ai-astrology/access with returnTo preserved", async ({ page }) => {
    // Navigate to preview page
    await page.goto("/ai-astrology/preview?reportType=year-analysis");

    // Should redirect to /ai-astrology/access with returnTo parameter
    await page.waitForURL(/\/ai-astrology\/access/, { timeout: 3000 });

    const url = page.url();
    expect(url).toContain("/ai-astrology/access");
    expect(url).toContain("returnTo=");
    expect(url).toContain(encodeURIComponent("/ai-astrology/preview"));
    expect(url).toContain(encodeURIComponent("reportType=year-analysis"));

    // Verify access page is rendered
    const pageContent = await page.textContent("body");
    expect(pageContent).toContain("Private Beta Access");
  });

  test("visiting /ai-astrology/subscription redirects to /ai-astrology/access", async ({ page }) => {
    // Navigate to subscription page
    await page.goto("/ai-astrology/subscription");

    // Should redirect to /ai-astrology/access
    await page.waitForURL(/\/ai-astrology\/access/, { timeout: 3000 });

    const url = page.url();
    expect(url).toContain("/ai-astrology/access");

    // Verify access page is rendered
    const pageContent = await page.textContent("body");
    expect(pageContent).toContain("Private Beta Access");
  });

  test("visiting /ai-astrology/input redirects to /ai-astrology/access", async ({ page }) => {
    // Navigate to input page
    await page.goto("/ai-astrology/input");

    // Should redirect to /ai-astrology/access
    await page.waitForURL(/\/ai-astrology\/access/, { timeout: 3000 });

    const url = page.url();
    expect(url).toContain("/ai-astrology/access");

    // Verify access page is rendered
    const pageContent = await page.textContent("body");
    expect(pageContent).toContain("Private Beta Access");
  });

  test("visiting /ai-astrology/access does NOT redirect (access page itself is allowed)", async ({ page }) => {
    // Navigate directly to access page
    await page.goto("/ai-astrology/access");

    // Should stay on access page (no redirect)
    await page.waitForLoadState("networkidle");

    const url = page.url();
    expect(url).toContain("/ai-astrology/access");
    expect(url).not.toContain("/ai-astrology/access/access"); // Should not redirect again

    // Verify access page is rendered
    const pageContent = await page.textContent("body");
    expect(pageContent).toContain("Private Beta Access");
  });
});

