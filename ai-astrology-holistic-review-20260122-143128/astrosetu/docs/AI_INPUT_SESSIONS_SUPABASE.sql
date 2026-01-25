-- AI Input Sessions Table
-- Stores birth details temporarily with token-based access
-- Replaces sessionStorage dependency for production reliability

CREATE TABLE IF NOT EXISTS ai_input_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token UUID UNIQUE NOT NULL,
  payload JSONB NOT NULL, -- { input, reportType, bundleType, bundleReports }
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 minutes'), -- CRITICAL: TTL default 30 minutes
  consumed_at TIMESTAMPTZ, -- NOT USED: Multi-use semantics (token can be reused within TTL)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for token lookups
CREATE INDEX IF NOT EXISTS idx_ai_input_sessions_token ON ai_input_sessions(token);

-- Index for expiration cleanup
CREATE INDEX IF NOT EXISTS idx_ai_input_sessions_expires_at ON ai_input_sessions(expires_at);

-- CRITICAL FIX (ChatGPT): RLS Policy (Row Level Security)
-- Since we use service role key, RLS is not strictly required, but recommended for defense in depth
-- NOTE: Service role key bypasses RLS, so API must enforce access control

-- Enable RLS (optional - API uses service role which bypasses RLS)
-- ALTER TABLE ai_input_sessions ENABLE ROW LEVEL SECURITY;

-- Example RLS policy (if using anon key instead of service role):
-- CREATE POLICY "Token access only via token" ON ai_input_sessions
--   FOR SELECT USING (true); -- API validates token, not RLS
-- Note: Current implementation uses service role key (bypasses RLS) for API routes

-- CRITICAL FIX (ChatGPT): Auto-cleanup expired tokens (run via cron or scheduled function)
-- Recommended: Set up Supabase cron job or Edge Function to run periodically:
-- DELETE FROM ai_input_sessions WHERE expires_at < NOW();
--
-- TODO (Future Optimization): Add scheduled cleanup job
-- - Set up Supabase cron job or Edge Function
-- - Run daily: DELETE FROM ai_input_sessions WHERE expires_at < NOW() - INTERVAL '24 hours';
-- - This keeps the table tidy long-term (not required for initial deployment)

