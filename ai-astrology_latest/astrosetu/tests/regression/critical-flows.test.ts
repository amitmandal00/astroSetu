/**
 * Critical Flows Regression Tests
 * 
 * These tests ensure existing functionality never breaks.
 * All tests must pass before any deployment.
 */

import { describe, it, expect } from 'vitest';
import { join } from 'path';
import { existsSync } from 'fs';

describe('Critical Flows - Regression Protection', () => {
  describe('API Routes - Must Exist and Work', () => {
    it('contact API route should be accessible', async () => {
      // Verify contact API route exists
      const contactRoute = await import('@/app/api/contact/route');
      expect(contactRoute).toBeDefined();
      expect(contactRoute.POST).toBeDefined();
    });

    it('payment API route should be accessible', async () => {
      // Verify payment API route exists
      const paymentRoute = await import('@/app/api/payments/create-order/route');
      expect(paymentRoute).toBeDefined();
      expect(paymentRoute.POST).toBeDefined();
    });

    it('AI astrology API route should be accessible', async () => {
      // Verify AI astrology API route exists
      const aiRoute = await import('@/app/api/ai-astrology/generate-report/route');
      expect(aiRoute).toBeDefined();
      expect(aiRoute.POST).toBeDefined();
    });
  });

  describe('Validation Schemas - Must Work', () => {
    it('BirthDetailsSchema should validate correctly', async () => {
      const { BirthDetailsSchema } = await import('@/lib/validators');
      
      const validData = {
        name: 'Test User',
        dob: '1990-01-01',
        tob: '12:00:00',
        place: 'Mumbai, Maharashtra, India',
        latitude: 19.0760,
        longitude: 72.8777,
        gender: 'Male' // Must be "Male" or "Female", not "male"
      };

      const result = BirthDetailsSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('EmailSchema should validate correctly', async () => {
      const { EmailSchema } = await import('@/lib/validators');
      
      const validEmail = 'test@example.com';
      const result = EmailSchema.safeParse(validEmail);
      expect(result.success).toBe(true);
    });
  });

  describe('Date Helpers - Must Work', () => {
    it('getDateContext should work correctly', async () => {
      const { getDateContext } = await import('@/lib/ai-astrology/dateHelpers');
      
      // getDateContext() doesn't take parameters - it uses current date
      const context = getDateContext();
      expect(context).toBeDefined();
      expect(context.currentYear).toBeDefined();
      expect(context.currentMonth).toBeDefined();
      expect(context.currentYear).toBeGreaterThan(2020);
      expect(context.currentMonth).toBeGreaterThanOrEqual(1);
      expect(context.currentMonth).toBeLessThanOrEqual(12);
    });

    it('getYearAnalysisDateRange should work correctly', async () => {
      const { getYearAnalysisDateRange } = await import('@/lib/ai-astrology/dateHelpers');
      
      // getYearAnalysisDateRange() doesn't take parameters - it uses current date
      const range = getYearAnalysisDateRange();
      expect(range).toBeDefined();
      expect(range.startDate).toBeDefined();
      expect(range.endDate).toBeDefined();
      expect(range.startYear).toBeDefined();
      expect(range.endYear).toBeDefined();
      expect(range.startMonth).toBeGreaterThanOrEqual(1);
      expect(range.startMonth).toBeLessThanOrEqual(12);
      expect(range.endMonth).toBeGreaterThanOrEqual(1);
      expect(range.endMonth).toBeLessThanOrEqual(12);
    });
  });

  describe('Critical Components - Must Exist', () => {
    it('preview page component should exist', () => {
      const componentPath = join(process.cwd(), 'src/app/ai-astrology/preview/page.tsx');
      expect(existsSync(componentPath)).toBe(true);
    });

    it('input page component should exist', () => {
      const componentPath = join(process.cwd(), 'src/app/ai-astrology/input/page.tsx');
      expect(existsSync(componentPath)).toBe(true);
    });
  });
});

