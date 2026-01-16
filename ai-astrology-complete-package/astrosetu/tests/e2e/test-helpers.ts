/**
 * Test Helpers for E2E Tests
 * Shared test data and utility functions
 */

export const TEST_USER = {
  name: "Amit Kumar Mandal",
  dob: "1984-11-26", // YYYY-MM-DD format for date input
  tob: "21:40", // HH:MM format
  place: "Noamundi, Jharkhand, India",
  gender: "Male" as const,
  // Coordinates for Noamundi, Jharkhand
  latitude: 22.1667,
  longitude: 85.5167,
};

type TestUser = typeof TEST_USER;

// Ensure repeated E2E submissions don't collide on server-side idempotency (which hashes dob/tob/place/etc).
// We keep the NAME constant so "test user" access checks still pass, but vary TOB minutes per submission.
let __submissionCounter = 0;

function withUniqueTimeOfBirth(baseTob: string): string {
  // baseTob is "HH:MM"
  const m = baseTob.match(/^(\d{2}):(\d{2})$/);
  if (!m) return baseTob;
  const hh = parseInt(m[1], 10);
  const mm = parseInt(m[2], 10);
  __submissionCounter += 1;
  const bump = (__submissionCounter % 17) + 1; // 1..17 (small bump avoids wrapping too often)
  const newMm = (mm + bump) % 60;
  const padded = String(newMm).padStart(2, "0");
  return `${String(hh).padStart(2, "0")}:${padded}`;
}

/**
 * Fill the AI Astrology input form and submit
 */
export async function fillInputForm(
  page: any,
  opts?: { user?: Partial<TestUser>; unique?: boolean }
) {
  const user: TestUser = {
    ...TEST_USER,
    ...(opts?.user ?? {}),
  };

  const tobToUse = opts?.unique === false ? user.tob : withUniqueTimeOfBirth(user.tob);

  // Fill name - use placeholder to find the input
  const nameInput = page.locator('input[placeholder*="full name"], input[placeholder*="Full Name"], input[placeholder*="Name"]').first();
  await nameInput.fill(user.name);
  
  // Fill date of birth (format: YYYY-MM-DD) - type="date" input
  const dobInput = page.locator('input[type="date"]').first();
  await dobInput.fill(user.dob);
  
  // Fill time of birth (format: HH:MM) - type="time" input
  const tobInput = page.locator('input[type="time"]').first();
  await tobInput.fill(tobToUse);
  
  // Fill place - AutocompleteInput component (uses placeholder "Enter city name")
  const placeInput = page.locator('input[placeholder*="city name"], input[placeholder*="City"]').first();
  await placeInput.click(); // Focus the input first
  await page.waitForTimeout(500); // Wait for focus
  await placeInput.fill('Noamundi'); // Type just the city name to trigger autocomplete
  // Wait for autocomplete suggestions to appear (they appear when typing)
  await page.waitForTimeout(1500); // Wait longer for suggestions
  
  // Try to click on the suggestion button that matches our test place
  // Suggestions are in buttons inside a dropdown
  const suggestionButton = page.locator('button:has-text("Noamundi")').first();
  const suggestionVisible = await suggestionButton.isVisible({ timeout: 3000 }).catch(() => false);
  if (suggestionVisible) {
    await suggestionButton.click({ force: true }); // Force click in case it's covered
    await page.waitForTimeout(1000); // Wait for selection and coordinate resolution
  } else {
    // If no suggestion appears, try typing the full name and wait
    await placeInput.fill(user.place);
    await page.waitForTimeout(1000);
    // Try one more time to find suggestion
    const retrySuggestion = page.locator('button:has-text("Noamundi"), button:has-text("Jharkhand")').first();
    const retryVisible = await retrySuggestion.isVisible({ timeout: 2000 }).catch(() => false);
    if (retryVisible) {
      await retrySuggestion.click({ force: true });
      await page.waitForTimeout(1000);
    }
  }
  
  // Select gender if dropdown exists
  const genderSelect = page.locator('select').first();
  const genderVisible = await genderSelect.isVisible({ timeout: 2000 }).catch(() => false);
  if (genderVisible) {
    await genderSelect.selectOption(user.gender);
  }
  
  // Wait a bit for coordinates to resolve
  await page.waitForTimeout(1000);
  
  // Submit the form - wait for button to be enabled (not disabled)
  const submitButton = page.locator('button[type="submit"]').first();
  await submitButton.waitFor({ state: 'visible', timeout: 5000 });
  // Wait for button to not be disabled (canSubmit becomes true when coordinates are resolved)
  await page.waitForFunction(
    () => {
      const button = document.querySelector('button[type="submit"]') as HTMLButtonElement;
      return button && !button.disabled;
    },
    { timeout: 10000 }
  ).catch(() => {}); // Continue even if timeout - might already be enabled
  await submitButton.click();
  
  // Handle confirmation modal if it appears
  // Wait for modal to appear (it has a backdrop with z-50)
  const modalBackdrop = page.locator('div[class*="backdrop"]').first();
  await modalBackdrop.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
  
  // Check terms checkbox in modal (inside the modal, not the form)
  const termsCheckbox = page.locator('div[class*="backdrop"]').locator('input[type="checkbox"]').first();
  const checkboxVisible = await termsCheckbox.isVisible({ timeout: 3000 }).catch(() => false);
  if (checkboxVisible) {
    await termsCheckbox.check();
    await page.waitForTimeout(500); // Wait for state to update
  }
  
  // Click confirm/continue button in modal ("Continue to Generate Report")
  const confirmButton = page.locator('div[class*="backdrop"]').locator('button:has-text("Continue to Generate"), button:has-text("Generate")').first();
  const confirmVisible = await confirmButton.isVisible({ timeout: 3000 }).catch(() => false);
  if (confirmVisible) {
    await confirmButton.click();
  }
}

/**
 * Wait for report generation to complete
 * Uses MOCK_MODE so should complete quickly
 */
export async function waitForReportGeneration(page: any, timeout = 10000) {
  // In many flows (and especially with idempotency cache hits), the loader may be very brief or skipped.
  // Prefer waiting for "report-ready" UI rather than specific report-type strings.
  const downloadButton = page.locator('button:has-text("Download")').first();
  const reportMarker = page
    .locator('text=/Report|Overview|Summary|Insights|Timing|Career|Decision|Year\\s*Analysis|Life\\s*Summary|Bundle/i')
    .first();

  await Promise.race([
    downloadButton.waitFor({ state: "visible", timeout }),
    reportMarker.waitFor({ state: "visible", timeout }),
  ]).catch(() => {});

  const hasDownload = await downloadButton.isVisible().catch(() => false);
  const hasMarker = await reportMarker.isVisible().catch(() => false);
  if (!hasDownload && !hasMarker) {
    throw new Error(`Report did not become visible within ${timeout}ms`);
  }
}

/**
 * Wait for payment verification (for paid reports)
 */
export async function waitForPaymentVerification(page: any, timeout = 5000) {
  await page.waitForSelector('text=/Payment Verified|Payment.*Confirmed/i', { timeout }).catch(() => {});
}

