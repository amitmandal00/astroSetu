-- Consent Logs Table for Legal Compliance
-- 
-- This table stores user consent for legal documents (Terms, Privacy Policy, Cookies, AI processing)
-- Provides an audit trail for compliance and legal protection
--
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS consent_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- User identification
  user_id UUID NULL, -- Null for anonymous users
  session_id UUID NOT NULL, -- Session ID for anonymous tracking

  -- Source and type
  source TEXT NOT NULL CHECK (source IN ('web', 'ios', 'android')),
  consent_type TEXT NOT NULL CHECK (consent_type IN ('terms', 'privacy', 'cookies', 'ai')),
  granted BOOLEAN NOT NULL, -- Whether consent was granted or withdrawn

  -- Document information
  document_version TEXT NOT NULL, -- Version identifier (e.g., "2024-12-26")
  document_url TEXT NOT NULL, -- URL of the document (e.g., "/terms", "/privacy")

  -- Privacy-preserving hashed identifiers
  ip_hash TEXT NULL, -- HMAC-SHA256 hash of IP address (for security/audit)
  user_agent_hash TEXT NULL, -- HMAC-SHA256 hash of user agent (for security/audit)

  -- Additional metadata (JSON)
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS consent_logs_user_id_idx ON consent_logs(user_id);
CREATE INDEX IF NOT EXISTS consent_logs_session_id_idx ON consent_logs(session_id);
CREATE INDEX IF NOT EXISTS consent_logs_consent_type_idx ON consent_logs(consent_type);
CREATE INDEX IF NOT EXISTS consent_logs_created_at_idx ON consent_logs(created_at);
CREATE INDEX IF NOT EXISTS consent_logs_granted_idx ON consent_logs(granted);

-- Optional: Index for querying by document version
CREATE INDEX IF NOT EXISTS consent_logs_document_version_idx ON consent_logs(document_version);

-- Row Level Security (RLS) - Recommended
-- Only allow inserts from authenticated service role (server-side only)
ALTER TABLE consent_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service role to insert (server-side API only)
CREATE POLICY "Service role can insert consent logs"
  ON consent_logs
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Policy: Allow service role to read all consent logs (for admin/audit)
CREATE POLICY "Service role can read all consent logs"
  ON consent_logs
  FOR SELECT
  USING (auth.role() = 'service_role');

-- Optional: Allow users to read their own consent logs
CREATE POLICY "Users can read their own consent logs"
  ON consent_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Comments for documentation
COMMENT ON TABLE consent_logs IS 'Stores user consent logs for legal documents (Terms, Privacy, Cookies, AI). Provides audit trail for compliance.';
COMMENT ON COLUMN consent_logs.session_id IS 'Session ID for anonymous users. Generated client-side and stored in localStorage.';
COMMENT ON COLUMN consent_logs.ip_hash IS 'HMAC-SHA256 hash of IP address. Does not store raw IP for privacy.';
COMMENT ON COLUMN consent_logs.user_agent_hash IS 'HMAC-SHA256 hash of user agent. Does not store raw user agent for privacy.';
COMMENT ON COLUMN consent_logs.metadata IS 'Additional metadata (e.g., cookie preferences, consent details).';

