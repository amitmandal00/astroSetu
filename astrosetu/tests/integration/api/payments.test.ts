import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST } from '@/app/api/payments/create-order/route';
import { NextRequest, NextResponse } from 'next/server';

// Mock dependencies
vi.mock('@/lib/supabase', () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(),
    },
  })),
  isSupabaseConfigured: vi.fn(() => false),
}));

vi.mock('@/lib/razorpay', () => ({
  createRazorpayOrder: vi.fn(),
  isRazorpayConfigured: vi.fn(() => false),
}));

vi.mock('@/lib/apiHelpers', () => ({
  checkRateLimit: vi.fn(() => null),
  parseJsonBody: vi.fn(async (req) => {
    const body = await req.json();
    return body;
  }),
  validateRequestSize: vi.fn(() => {}), // No size limit - doesn't throw
}));

vi.mock('@/lib/validation', () => ({
  RazorpayOrderSchema: {
    parse: vi.fn((data) => data),
  },
}));

describe('Payment API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a mock order when Razorpay is not configured', async () => {
    const { isRazorpayConfigured } = await import('@/lib/razorpay');
    vi.mocked(isRazorpayConfigured).mockReturnValue(false);

    const requestBody = {
      amount: 100,
      currency: 'INR',
      description: 'Test payment',
      serviceId: 'test-service',
      serviceName: 'Test Service',
    };

    const req = new NextRequest('http://localhost:3000/api/payments/create-order', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.data).toBeDefined();
    expect(data.data.id).toContain('order_mock_');
    expect(data.data.amount).toBe(10000); // Amount in paise
    expect(data.mock).toBe(true);
  });

  it('should validate payment amount', async () => {
    const { RazorpayOrderSchema } = await import('@/lib/validation');
    vi.mocked(RazorpayOrderSchema.parse).mockImplementation((data) => {
      if (!data.amount || data.amount <= 0) {
        throw new Error('Amount must be greater than 0');
      }
      return data;
    });

    const requestBody = {
      amount: -100,
      currency: 'INR',
    };

    const req = new NextRequest('http://localhost:3000/api/payments/create-order', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(req);
    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  it('should handle authentication with Supabase', async () => {
    const { createServerClient, isSupabaseConfigured } = await import('@/lib/supabase');
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);

    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
    };

    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
    };

    vi.mocked(createServerClient).mockReturnValue(mockSupabase as any);

    const requestBody = {
      amount: 100,
      currency: 'INR',
      description: 'Test payment',
    };

    const req = new NextRequest('http://localhost:3000/api/payments/create-order', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ok).toBe(true);
  });

  it('should handle rate limiting', async () => {
    const { checkRateLimit } = await import('@/lib/apiHelpers');
    vi.mocked(checkRateLimit).mockReturnValue(
      new NextResponse(JSON.stringify({ ok: false, error: 'Rate limit exceeded' }), {
        status: 429,
      })
    );

    const req = new NextRequest('http://localhost:3000/api/payments/create-order', {
      method: 'POST',
      body: JSON.stringify({ amount: 100 }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(req);
    expect(response.status).toBe(429);
  });

  it('should validate request size', async () => {
    const { validateRequestSize } = await import('@/lib/apiHelpers');
    vi.mocked(validateRequestSize).mockImplementation(() => {
      throw new Error('Request too large');
    });

    const req = new NextRequest('http://localhost:3000/api/payments/create-order', {
      method: 'POST',
      body: JSON.stringify({ amount: 100 }),
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': '20000',
      },
    });

    // validateRequestSize throws, so POST should handle it and return error response
    const response = await POST(req);
    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  it('should create real Razorpay order when configured', async () => {
    const { isRazorpayConfigured, createRazorpayOrder } = await import('@/lib/razorpay');
    const { isSupabaseConfigured } = await import('@/lib/supabase');
    const { checkRateLimit } = await import('@/lib/apiHelpers');
    const { RazorpayOrderSchema } = await import('@/lib/validation');
    vi.mocked(isRazorpayConfigured).mockReturnValue(true);
    vi.mocked(isSupabaseConfigured).mockReturnValue(false); // Not configured, use userId from body
    vi.mocked(checkRateLimit).mockReturnValue(null); // No rate limit
    // Mock validation to pass
    vi.mocked(RazorpayOrderSchema.parse).mockReturnValue({
      amount: 100,
      currency: 'INR',
      description: 'Test payment',
      serviceId: 'test-service',
      serviceName: 'Test Service',
    });
    vi.mocked(createRazorpayOrder).mockResolvedValue({
      id: 'order_real_123',
      amount: 10000,
      currency: 'INR',
      receipt: 'receipt_123',
      status: 'created',
    });

    const requestBody = {
      amount: 100,
      currency: 'INR',
      description: 'Test payment',
      serviceId: 'test-service',
      serviceName: 'Test Service',
      userId: 'user-123',
    };

    const body = JSON.stringify(requestBody);
    const req = new NextRequest('http://localhost:3000/api/payments/create-order', {
      method: 'POST',
      body: body,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': body.length.toString(), // Add content-length header
      },
    });

    const response = await POST(req);
    const data = await response.json();
    
    // If validation fails, log the error message
    if (response.status !== 200) {
      console.log('Payment test error:', data);
    }

    expect(response.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.data.id).toBe('order_real_123');
    expect(createRazorpayOrder).toHaveBeenCalledWith(100, 'INR', expect.stringContaining('wallet_user-123_'));
  });
});

