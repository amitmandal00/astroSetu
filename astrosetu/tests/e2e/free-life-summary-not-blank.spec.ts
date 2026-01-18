import { test, expect } from "@playwright/test";

/**
 * E2E Test: Free Life Summary Not Blank
 * 
 * CRITICAL FIX (2026-01-18 - ChatGPT): Prevents blank screen regression
 * 
 * Verifies that free life summary report never shows a blank screen:
 * - After input submission, preview page should show either:
 *   1. Loader ("Preparing your report..." or "Generating...")
 *   2. Rendered report content
 * - Never shows empty body or blank page during generation
 * 
 * Root cause: loadingStage !== null but isProcessingUI = false → return null → blank screen
 * Fix: isProcessingUI now includes loadingStage, always show loader instead of null
 */
test.describe("Free Life Summary Not Blank", () => {
  test("Free life summary never shows blank screen during generation", async ({ page, context }) => {
    // Clear sessionStorage and cookies
    await context.clearCookies();
    await page.addInitScript(() => {
      sessionStorage.clear();
      localStorage.clear();
    });

    // Mock input-session API to return valid token data
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
      } else if (route.request().method() === "GET") {
        // Mock GET response
        const url = new URL(route.request().url());
        const token = url.searchParams.get("token");
        if (token) {
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
            }),
          });
        } else {
          await route.continue();
        }
      } else {
        await route.continue();
      }
    });

    // Mock report generation to return content after a delay (simulating real generation)
    await page.route("**/api/ai-astrology/generate-report", async (route) => {
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2s delay to test loading state
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          data: {
            content: {
              title: "Free Life Summary Report",
              sections: [
                {
                  title: "Overview",
                  content: "This is a test report section content.",
                },
                {
                  title: "Key Insights",
                  content: "These are key insights from your birth chart.",
                },
              ],
              summary: "Summary of the report",
              generatedAt: new Date().toISOString(),
            },
          },
        }),
      });
    });

    // Navigate to input page for free life summary
    await page.goto("/ai-astrology/input?reportType=life-summary");
    
    // Wait for form to load, then fill form
    await page.waitForSelector('input[name="name"]', { timeout: 10000 });
    await page.fill('input[name="name"]', "Test User");
    await page.fill('input[name="dob"]', "1990-01-01");
    await page.fill('input[name="tob"]', "12:00");
    await page.fill('input[placeholder*="Place"]', "Mumbai, Maharashtra, India");
    await page.waitForSelector('text=Coordinates resolved', { timeout: 10000 });
    
    // Submit form
    const submitButton = page.getByRole("button", { name: /submit|continue|generate/i });
    await submitButton.click();

    // Wait for redirect to preview with input_token and auto_generate=true
    await page.waitForURL(/\/preview/, { timeout: 15000 });
    
    // CRITICAL: Immediately after navigation, check that page is NOT blank
    // Should show either loader or content (never empty body)
    const bodyText = await page.locator("body").textContent({ timeout: 1000 });
    
    // Assert body is not empty (blank screen)
    expect(bodyText).toBeTruthy();
    expect(bodyText?.trim().length).toBeGreaterThan(0);
    
    // Assert that either loader or content is visible (not blank)
    // Check for loader indicators
    const loaderTexts = [
      "Preparing your report",
      "Generating",
      "Please wait",
      "Preparing your personalized insights",
    ];
    
    // Check for content indicators
    const contentIndicators = [
      "Free Life Summary",
      "Overview",
      "Report",
      "Sections",
    ];
    
    // Wait a bit to allow state to settle
    await page.waitForTimeout(500);
    
    // Get visible text on page
    const visibleText = await page.locator("body").textContent();
    
    // Assert that page contains either loader text OR content (not blank)
    const hasLoader = loaderTexts.some(text => visibleText?.includes(text));
    const hasContent = contentIndicators.some(text => visibleText?.includes(text));
    
    expect(hasLoader || hasContent).toBe(true);
    
    // If loader is visible, wait for content to appear (max 10s)
    if (hasLoader) {
      // Wait for either loader to persist or content to appear
      await page.waitForSelector('text=/Free Life Summary|Overview|Report/', { timeout: 10000 }).catch(() => {
        // If content doesn't appear, loader should still be visible (not blank)
        const loaderStillVisible = await page.locator('text=/Preparing|Generating|Please wait/').isVisible();
        expect(loaderStillVisible).toBe(true);
      });
    }
    
    // Final check: Body should never be empty or just whitespace
    const finalBodyText = await page.locator("body").textContent();
    expect(finalBodyText?.trim().length).toBeGreaterThan(0);
  });

  test("Free life summary shows loader immediately after input submission", async ({ page, context }) => {
    // Clear sessionStorage
    await context.clearCookies();
    await page.addInitScript(() => {
      sessionStorage.clear();
      localStorage.clear();
    });

    // Mock input-session API
    await page.route("**/api/ai-astrology/input-session", async (route) => {
      if (route.request().method() === "GET") {
        const url = new URL(route.request().url());
        const token = url.searchParams.get("token");
        if (token) {
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
            }),
          });
          return;
        }
      }
      await route.continue();
    });

    // Slow down report generation to ensure loader is visible
    await page.route("**/api/ai-astrology/generate-report", async (route) => {
      await new Promise(resolve => setTimeout(resolve, 5000)); // 5s delay
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          data: {
            content: {
              title: "Free Life Summary Report",
              sections: [{ title: "Overview", content: "Content here" }],
            },
          },
        }),
      });
    });

    // Navigate directly to preview with input_token (simulating redirect after form submit)
    await page.goto("/ai-astrology/preview?reportType=life-summary&input_token=test-token-123&auto_generate=true");
    
    // Immediately check that loader is visible (not blank)
    // Should show loader within 1 second
    await page.waitForTimeout(1000);
    
    const bodyText = await page.locator("body").textContent();
    expect(bodyText).toBeTruthy();
    
    // Check for loader indicators
    const loaderVisible = await Promise.race([
      page.locator('text=/Preparing|Generating|Please wait|🌙/').waitFor({ timeout: 2000 }).then(() => true),
      Promise.resolve(false).then(() => false),
    ]);
    
    // Either loader should be visible OR content should already be loaded (never blank)
    const hasContent = bodyText?.includes("Free Life Summary") || bodyText?.includes("Overview");
    expect(loaderVisible || hasContent).toBe(true);
  });
});

