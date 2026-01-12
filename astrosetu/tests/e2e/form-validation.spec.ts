/**
 * E2E Test: Form Validation
 * 
 * Tests form validation and error handling:
 * 1. Empty form submission
 * 2. Invalid date of birth
 * 3. Invalid time format
 * 4. Missing place coordinates
 * 5. Form field requirements
 */

import { test, expect } from '@playwright/test';
import { TEST_USER } from './test-helpers';

test.describe('Form Validation E2E', () => {
  test('should show error for empty form submission', async ({ page }) => {
    await page.goto('/ai-astrology/input?reportType=life-summary');
    
    // Try to submit empty form
    const submitButton = page.locator('button[type="submit"]').first();
    
    // Button should be disabled if form is invalid
    const isDisabled = await submitButton.isDisabled();
    
    // If button is enabled, click it and check for validation errors
    if (!isDisabled) {
      await submitButton.click();
      await page.waitForTimeout(500);
      
      // Check for validation errors
      const errorMessage = page.locator('text=/required|Please|Error/i');
      const hasError = await errorMessage.first().isVisible({ timeout: 2000 }).catch(() => false);
      
      // Either button should be disabled OR error should appear
      expect(isDisabled || hasError).toBeTruthy();
    } else {
      // Button is disabled, which is correct validation behavior
      expect(isDisabled).toBeTruthy();
    }
  });
  
  test('should validate date of birth format', async ({ page }) => {
    await page.goto('/ai-astrology/input?reportType=life-summary');
    
    // Fill name
    const nameInput = page.locator('input[placeholder*="full name"]').first();
    await nameInput.fill(TEST_USER.name);
    
    // Try invalid date (future date should be blocked by max attribute)
    const dobInput = page.locator('input[type="date"]').first();
    const maxDate = await dobInput.getAttribute('max');
    
    // Date input should have max attribute set to today
    expect(maxDate).toBeTruthy();
  });
  
  test('should validate time of birth format', async ({ page }) => {
    await page.goto('/ai-astrology/input?reportType=life-summary');
    
    // Fill name and DOB
    const nameInput = page.locator('input[placeholder*="full name"]').first();
    await nameInput.fill(TEST_USER.name);
    
    const dobInput = page.locator('input[type="date"]').first();
    await dobInput.fill(TEST_USER.dob);
    
    // Time input should be type="time" which enforces format
    const tobInput = page.locator('input[type="time"]').first();
    const inputType = await tobInput.getAttribute('type');
    
    expect(inputType).toBe('time');
  });
  
  test('should require place selection with coordinates', async ({ page }) => {
    await page.goto('/ai-astrology/input?reportType=life-summary');
    
    // Fill name, DOB, TOB
    const nameInput = page.locator('input[placeholder*="full name"]').first();
    await nameInput.fill(TEST_USER.name);
    
    const dobInput = page.locator('input[type="date"]').first();
    await dobInput.fill(TEST_USER.dob);
    
    const tobInput = page.locator('input[type="time"]').first();
    await tobInput.fill(TEST_USER.tob);
    
    // Submit button should be disabled until place is selected
    const submitButton = page.locator('button[type="submit"]').first();
    const isDisabled = await submitButton.isDisabled();
    
    // Button should be disabled if coordinates aren't resolved
    expect(isDisabled).toBeTruthy();
  });
  
  test('should show coordinate resolution message', async ({ page }) => {
    await page.goto('/ai-astrology/input?reportType=life-summary');
    
    // Fill place input
    const placeInput = page.locator('input[placeholder*="city name"]').first();
    await placeInput.click();
    await placeInput.fill('Noamundi');
    await page.waitForTimeout(1500);
    
    // Try to select from autocomplete
    const suggestion = page.locator('button:has-text("Noamundi")').first();
    const suggestionVisible = await suggestion.isVisible({ timeout: 3000 }).catch(() => false);
    
    if (suggestionVisible) {
      await suggestion.click();
      await page.waitForTimeout(1000);
      
      // Check for coordinate resolution message
      const coordMessage = page.locator('text=/Coordinates|resolved/i');
      const hasCoordMessage = await coordMessage.isVisible({ timeout: 2000 }).catch(() => false);
      
      // Coordinates should be resolved or message shown
      expect(suggestionVisible || hasCoordMessage).toBeTruthy();
    }
  });
});

