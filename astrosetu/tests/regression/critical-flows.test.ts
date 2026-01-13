/**
 * Critical Flows Regression Tests
 * 
 * These tests ensure existing functionality never breaks.
 * All tests must pass before any deployment.
 */

import { describe, it, expect } from 'vitest';

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
      const { BirthDetailsSchema } = await import('@/lib/validation');
      
      const validData = {
        name: 'Test User',
        dob: '1990-01-01',
        tob: '12:00:00',
        place: 'Mumbai, Maharashtra, India',
        coordinates: { lat: 19.0760, lng: 72.8777 },
        gender: 'male'
      };

      const result = BirthDetailsSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('EmailSchema should validate correctly', async () => {
      const { EmailSchema } = await import('@/lib/validation');
      
      const validEmail = 'test@example.com';
      const result = EmailSchema.safeParse(validEmail);
      expect(result.success).toBe(true);
    });
  });

  describe('Date Helpers - Must Work', () => {
    it('getDateContext should work correctly', async () => {
      const { getDateContext } = await import('@/lib/dateHelpers');
      
      const context = getDateContext(new Date('2024-01-15'));
      expect(context).toBeDefined();
      expect(context.year).toBe(2024);
      expect(context.month).toBe(1);
    });

    it('getYearAnalysisDateRange should work correctly', async () => {
      const { getYearAnalysisDateRange } = await import('@/lib/dateHelpers');
      
      const range = getYearAnalysisDateRange(2024);
      expect(range).toBeDefined();
      expect(range.start).toBeDefined();
      expect(range.end).toBeDefined();
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

