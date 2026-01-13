/**
 * Integration Test Setup
 * Mocks and configuration for integration tests
 */

import { vi } from 'vitest';

// Mock Next.js environment
process.env.NODE_ENV = 'test';
process.env.MOCK_MODE = 'true';

// Mock Supabase client
vi.mock('@/lib/supabase', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      insert: vi.fn(),
      select: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    })),
    auth: {
      getUser: vi.fn(),
      getSession: vi.fn(),
    },
  })),
}));

// Mock external APIs
vi.mock('openai', () => ({
  OpenAI: vi.fn(),
}));

vi.mock('@/lib/prokeralaEnhanced', () => ({
  getKundli: vi.fn(),
  getMatch: vi.fn(),
}));

// Mock Stripe
vi.mock('stripe', () => ({
  default: vi.fn(() => ({
    checkout: {
      sessions: {
        create: vi.fn(),
        retrieve: vi.fn(),
      },
    },
  })),
}));

// Mock PII Redaction
vi.mock('@/lib/piiRedaction', () => ({
  redactPII: vi.fn((text: string) => text), // Return text as-is for tests
}));

