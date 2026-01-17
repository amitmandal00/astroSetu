import { test, expect } from "@playwright/test";

/**
 * Private Beta Access E2E Test: Allows Access After Verification
 * 
 * When user submits valid details matching allowlist:
 * - Verification API sets beta_access=1 cookie (HttpOnly)
 * - User can then access /ai-astrology/* pages without redirect
 * - Cookie persists across page navigations
 * 
 * Test users:
 * 1. Amit Kumar Mandal | 1984-11-26 | 21:40 | Noamundi, Jharkhand | Male
 * 2. Ankita Surabhi | 1988-07-01 | 17:58 | Ranchi, Jharkhand | Female
 */
test.describe("Beta Access Allows After Verification", () => {
  test.beforeEach(async ({ context }) => {
    // Clear all cookies to ensure clean state
    await context.clearCookies();
  });

  test("submit valid details → cookie set → can visit /ai-astrology/preview without redirect", async ({ page, context }) => {
    // Step 1: Navigate to access page
    await page.goto("/ai-astrology/access");

    // Step 2: Fill form with valid details (Amit Kumar Mandal)
    await page.fill('input[name="name"]', "Amit Kumar Mandal");
    await page.fill('input[name="dob"]', "26 Nov 1984");
    await page.fill('input[name="time"]', "09:40 pm");
    await page.fill('input[name="place"]', "Noamundi, Jharkhand");
    await page.selectOption('select[name="gender"]', "Male");

    // Wait for place autocomplete (if any)
    await page.waitForTimeout(1000);

    // Step 3: Submit form
    const submitButton = page.getByRole("button", { name: /verify access/i });
    await submitButton.click();

    // Step 4: Wait for redirect to /ai-astrology (cookie is set, then redirect happens)
    await page.waitForURL(/\/ai-astrology/, { timeout: 5000 });

    // Step 5: Verify cookie is set (HttpOnly, so we can't read it in JS, but we can verify by accessing protected page)
    const cookies = await context.cookies();
    const betaAccessCookie = cookies.find(c => c.name === "beta_access");
    expect(betaAccessCookie).toBeDefined();
    expect(betaAccessCookie?.value).toBe("1");

    // Step 6: Navigate to protected page and verify no redirect
    await page.goto("/ai-astrology/preview?reportType=year-analysis");

    // Should NOT redirect to /ai-astrology/access
    await page.waitForLoadState("networkidle");
    const url = page.url();
    expect(url).toContain("/ai-astrology/preview");
    expect(url).not.toContain("/ai-astrology/access");
  });

  test("submit valid details → cookie set → can access /ai-astrology without redirect", async ({ page, context }) => {
    // Step 1: Navigate to access page
    await page.goto("/ai-astrology/access");

    // Step 2: Fill form with valid details (Ankita Surabhi)
    await page.fill('input[name="name"]', "Ankita Surabhi");
    await page.fill('input[name="dob"]', "01 Jul 1988");
    await page.fill('input[name="time"]', "05:58 pm");
    await page.fill('input[name="place"]', "Ranchi, Jharkhand");
    await page.selectOption('select[name="gender"]', "Female");

    await page.waitForTimeout(1000);

    // Step 3: Submit form
    const submitButton = page.getByRole("button", { name: /verify access/i });
    await submitButton.click();

    // Step 4: Wait for redirect to /ai-astrology
    await page.waitForURL(/\/ai-astrology/, { timeout: 5000 });

    // Step 5: Verify cookie is set
    const cookies = await context.cookies();
    const betaAccessCookie = cookies.find(c => c.name === "beta_access");
    expect(betaAccessCookie).toBeDefined();
    expect(betaAccessCookie?.value).toBe("1");

    // Step 6: Navigate to /ai-astrology and verify no redirect
    await page.goto("/ai-astrology");

    await page.waitForLoadState("networkidle");
    const url = page.url();
    expect(url).toContain("/ai-astrology");
    expect(url).not.toContain("/ai-astrology/access");
  });

  test("submit invalid details → no cookie set → remains blocked", async ({ page, context }) => {
    // Step 1: Navigate to access page
    await page.goto("/ai-astrology/access");

    // Step 2: Fill form with invalid details
    await page.fill('input[name="name"]', "Test User");
    await page.fill('input[name="dob"]', "01 Jan 1990");
    await page.fill('input[name="time"]', "12:00 pm");
    await page.fill('input[name="place"]', "Delhi");
    await page.selectOption('select[name="gender"]', "Male");

    await page.waitForTimeout(1000);

    // Step 3: Submit form
    const submitButton = page.getByRole("button", { name: /verify access/i });
    await submitButton.click();

    // Step 4: Wait for error message (should stay on access page, not redirect)
    await page.waitForTimeout(2000);

    // Step 5: Verify no redirect occurred (should still be on access page)
    const url = page.url();
    expect(url).toContain("/ai-astrology/access");
    expect(url).not.toContain("/ai-astrology");

    // Step 6: Verify error message is shown
    const pageContent = await page.textContent("body");
    expect(pageContent).toContain("Access not granted");

    // Step 7: Verify cookie is NOT set
    const cookies = await context.cookies();
    const betaAccessCookie = cookies.find(c => c.name === "beta_access");
    expect(betaAccessCookie).toBeUndefined();
  });
});

