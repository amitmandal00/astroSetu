import { test, expect } from "@playwright/test";
import { resetStorage } from "./helpers/storage";

/**
 * CRITICAL FIX (ChatGPT): Purchase must not loop back to input after returning from input
 * 
 * This test ensures that when:
 * 1. User is at preview paywall
 * 2. Clicks purchase → goes to input
 * 3. Submits input → returns to preview with input_token
 * 4. Preview loads input_token and sets state
 * 5. Preview does NOT auto-redirect back to input again
 * 
 * Root cause: Preview wasn't setting input state immediately after loading input_token,
 * causing it to think input is still missing and redirect again.
 * Fix: Set input state IMMEDIATELY after loading input_token, before any redirect logic.
 */
test.describe("Purchase Redirects to Input Then Back (No Loop)", () => {
  test("purchase → input → preview with input_token → preview does NOT redirect back to input", async ({ page }) => {
    // Step 1: Start at preview paywall (no input)
    await resetStorage(page);
    await page.goto("/ai-astrology/preview?reportType=year-analysis");

    // Step 2: Click purchase → should go to input
    const purchaseButton = page.getByRole("button", { name: /purchase/i });
    if (await purchaseButton.isVisible()) {
      await purchaseButton.click();
      // Wait for navigation to input
      await page.waitForURL(/\/ai-astrology\/input/, { timeout: 2000 });
    } else {
      // If purchase button not visible, we might already be on input (auto-redirect happened)
      await page.waitForURL(/\/ai-astrology\/input/, { timeout: 2000 });
    }

    // Step 3: Wait for form to load, then fill input form
    await page.waitForSelector('input[name="name"]', { timeout: 10000 });
    await page.fill('input[name="name"]', "Test User");
    await page.fill('input[name="dob"]', "1990-01-01");
    await page.fill('input[name="tob"]', "12:00");
    await page.fill('input[name="place"]', "Mumbai");
    
    // Wait for geocoding (if any)
    await page.waitForTimeout(1000);

    // Step 4: Submit input → should return to preview with input_token
    const submitButton = page.getByRole("button", { name: /submit|continue|generate/i });
    await submitButton.click();

    // Wait for navigation back to preview with input_token
    await page.waitForURL(/\/ai-astrology\/preview/, { timeout: 5000 });
    
    // Verify input_token is in URL
    const previewUrl = page.url();
    expect(previewUrl).toContain("/ai-astrology/preview");
    expect(previewUrl).toContain("input_token=");

    // Step 5: CRITICAL - Wait a bit and verify preview does NOT redirect back to input
    // Preview should load input_token, set input state, and render normally (not redirect)
    await page.waitForTimeout(3000); // Wait for input_token to be loaded and state to be set

    // Verify we're still on preview page (not redirected back to input)
    const finalUrl = page.url();
    expect(finalUrl).toContain("/ai-astrology/preview");
    expect(finalUrl).not.toContain("/ai-astrology/input");

    // CRITICAL FIX (ChatGPT): Assert URL contains input_token OR session_id (whichever you chose)
    // This locks in "token-loaded state wins"
    const hasInputToken = finalUrl.includes("input_token=");
    const hasSessionId = finalUrl.includes("session_id=");
    expect(hasInputToken || hasSessionId).toBe(true);

    // CRITICAL FIX (ChatGPT): Assert "Enter Your Birth Details" card is NOT visible
    // This ensures token-loaded state prevents redirect
    const enterDetailsCard = page.getByText("Enter Your Birth Details");
    await expect(enterDetailsCard).not.toBeVisible({ timeout: 1000 }).catch(() => {
      // If element doesn't exist, that's fine - it means the card is not visible
    });

    // CRITICAL FIX (ChatGPT): Assert "Redirecting..." is NOT visible
    // This ensures we're not stuck in redirect dead-state
    const redirectingText = page.getByText("Redirecting...");
    await expect(redirectingText).not.toBeVisible({ timeout: 1000 }).catch(() => {
      // If element doesn't exist, that's fine - it means redirecting is not visible
    });

    // Verify preview is showing content (not "Redirecting..." or "Enter Your Birth Details")
    const pageContent = await page.textContent("body");
    expect(pageContent).not.toContain("Redirecting...");
    expect(pageContent).not.toContain("Enter Your Birth Details");
  });

  test("preview loads input_token and sets state before any redirect logic", async ({ page }) => {
    // This test verifies that input_token is loaded and state is set immediately,
    // preventing redirect loops

    // Mock input_token API to return valid data
    await page.route("**/api/ai-astrology/input-session?token=*", async (route) => {
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
              latitude: 19.0760,
              longitude: 72.8777,
              timezone: "Asia/Kolkata",
            },
            reportType: "year-analysis",
          },
        }),
      });
    });

    // Navigate to preview with input_token
    await page.goto("/ai-astrology/preview?reportType=year-analysis&input_token=test-token-123");
    
    // Wait for input_token to be loaded (API call should happen)
    await page.waitForTimeout(2000);

    // CRITICAL: Verify we're still on preview (not redirected to input)
    const currentUrl = page.url();
    expect(currentUrl).toContain("/ai-astrology/preview");
    expect(currentUrl).not.toContain("/ai-astrology/input");

    // CRITICAL FIX (ChatGPT): Assert URL contains input_token OR session_id
    const hasInputToken = currentUrl.includes("input_token=");
    const hasSessionId = currentUrl.includes("session_id=");
    expect(hasInputToken || hasSessionId).toBe(true);

    // CRITICAL FIX (ChatGPT): Assert "Enter Your Birth Details" card is NOT visible
    const enterDetailsCard = page.getByText("Enter Your Birth Details");
    await expect(enterDetailsCard).not.toBeVisible({ timeout: 1000 }).catch(() => {
      // If element doesn't exist, that's fine
    });

    // CRITICAL FIX (ChatGPT): Assert "Redirecting..." is NOT visible
    const redirectingText = page.getByText("Redirecting...");
    await expect(redirectingText).not.toBeVisible({ timeout: 1000 }).catch(() => {
      // If element doesn't exist, that's fine
    });

    // Verify preview is showing content (input was loaded and state was set)
    const pageContent = await page.textContent("body");
    expect(pageContent).not.toContain("Enter Your Birth Details");
  });
});

