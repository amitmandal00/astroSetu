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

/**
 * Fill the AI Astrology input form and submit
 */
export async function fillInputForm(page: any) {
  // Fill name - use placeholder to find the input
  const nameInput = page.locator('input[placeholder*="full name"], input[placeholder*="Full Name"], input[placeholder*="Name"]').first();
  await nameInput.fill(TEST_USER.name);
  
  // Fill date of birth (format: YYYY-MM-DD) - type="date" input
  const dobInput = page.locator('input[type="date"]').first();
  await dobInput.fill(TEST_USER.dob);
  
  // Fill time of birth (format: HH:MM) - type="time" input
  const tobInput = page.locator('input[type="time"]').first();
  await tobInput.fill(TEST_USER.tob);
  
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
    await placeInput.fill(TEST_USER.place);
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
    await genderSelect.selectOption(TEST_USER.gender);
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
  // Wait for loading state to disappear
  await page.waitForSelector('text=/Generating/i', { state: 'hidden', timeout }).catch(() => {});
  
  // Wait for report content to appear
  await page.waitForSelector('text=/Your.*Report|Life Summary|Year Analysis/i', { timeout });
}

/**
 * Wait for payment verification (for paid reports)
 */
export async function waitForPaymentVerification(page: any, timeout = 5000) {
  await page.waitForSelector('text=/Payment Verified|Payment.*Confirmed/i', { timeout }).catch(() => {});
}

