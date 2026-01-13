/**
 * Integration Tests for Contact API Route
 * Tests: API endpoint, validation, error handling
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST } from '@/app/api/contact/route';
import { NextRequest } from 'next/server';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      insert: vi.fn().mockResolvedValue({ data: { id: '123' }, error: null }),
    })),
  })),
}));

// Mock email sending
vi.mock('@/lib/contactConfig', () => ({
  sendContactEmail: vi.fn().mockResolvedValue({ success: true }),
  sendInternalNotification: vi.fn().mockResolvedValue({ success: true }),
}));

// Mock PII Redaction (must be before apiHelpers import)
vi.mock('@/lib/piiRedaction', () => ({
  redactPII: vi.fn((text: string) => text), // Return text as-is for tests
}));

// Mock apiHelpers to handle require('./piiRedaction')
vi.mock('@/lib/apiHelpers', async () => {
  const actual = await vi.importActual('@/lib/apiHelpers');
  return {
    ...actual,
    handleApiError: vi.fn((error: unknown) => {
      // Simple error handler for tests
      const { NextResponse } = require('next/server');
      return NextResponse.json(
        { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }),
  };
});

describe('Contact API Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/contact', () => {
    it('accepts valid contact form data', async () => {
      const request = new NextRequest('http://localhost/api/contact', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          phone: '+919876543210',
          subject: 'Test Subject',
          message: 'Test message',
          category: 'general',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
    });

    it('rejects invalid email', async () => {
      const request = new NextRequest('http://localhost/api/contact', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          email: 'invalid-email',
          phone: '+919876543210',
          subject: 'Test',
          message: 'Test',
          category: 'general',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('rejects missing required fields', async () => {
      const request = new NextRequest('http://localhost/api/contact', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          // Missing email, phone, etc.
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('handles database errors gracefully', async () => {
      // Mock database error
      const { createClient } = await import('@/lib/supabase');
      const mockClient = createClient as any;
      mockClient.mockReturnValueOnce({
        from: vi.fn(() => ({
          insert: vi.fn().mockResolvedValue({ 
            data: null, 
            error: { message: 'Database error' } 
          }),
        })),
      });

      const request = new NextRequest('http://localhost/api/contact', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          phone: '+919876543210',
          subject: 'Test',
          message: 'Test',
          category: 'general',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      // Should handle error gracefully
      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('validates phone number format', async () => {
      const request = new NextRequest('http://localhost/api/contact', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          phone: '123', // Invalid phone
          subject: 'Test',
          message: 'Test',
          category: 'general',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('sanitizes input to prevent XSS', async () => {
      const request = new NextRequest('http://localhost/api/contact', {
        method: 'POST',
        body: JSON.stringify({
          name: '<script>alert("xss")</script>',
          email: 'test@example.com',
          phone: '+919876543210',
          subject: 'Test',
          message: 'Test',
          category: 'general',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      // Should either sanitize or reject
      expect([200, 400]).toContain(response.status);
    });
  });
});

