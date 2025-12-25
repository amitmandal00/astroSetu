import { createClient } from '@supabase/supabase-js';

// Safe placeholder values
const PLACEHOLDER_URL = 'https://example.supabase.co';
const PLACEHOLDER_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4YW1wbGUiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0NTc2OTIwMCwiZXhwIjoxOTYxMzQ1NjAwfQ.example';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || PLACEHOLDER_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || PLACEHOLDER_KEY;

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: typeof window !== 'undefined',
    autoRefreshToken: typeof window !== 'undefined',
  },
});

// Server-side client (for API routes)
export function createServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !key || url === 'https://placeholder.supabase.co') {
    // Return a mock client that will fail gracefully
    try {
      return createClient('https://placeholder.supabase.co', 'placeholder-key', {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
    } catch (error) {
      // If even placeholder fails, return a minimal client
      return createClient('https://example.supabase.co', 'example-key', {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
    }
  }

  try {
    return createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  } catch (error) {
    console.error('Failed to create Supabase server client:', error);
    // Return a safe fallback
    return createClient('https://example.supabase.co', 'example-key', {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
}

// Check if Supabase is properly configured
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  return !!(url && key && url !== 'https://placeholder.supabase.co' && url !== 'https://example.supabase.co');
}

