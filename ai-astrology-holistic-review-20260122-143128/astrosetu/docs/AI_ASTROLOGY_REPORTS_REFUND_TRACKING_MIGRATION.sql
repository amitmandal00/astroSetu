-- Migration: Add refund tracking fields to ai_astrology_reports table
-- Purpose: Track refund status, payment intent IDs, and error codes for automatic refund system
-- Date: 2026-01-18

-- Add new columns to existing table (safe to run multiple times)
ALTER TABLE public.ai_astrology_reports
ADD COLUMN IF NOT EXISTS payment_intent_id TEXT,
ADD COLUMN IF NOT EXISTS refunded BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS refund_id TEXT,
ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS error_code TEXT;

-- Create index on payment_intent_id for faster lookups
CREATE INDEX IF NOT EXISTS ai_astrology_reports_payment_intent_id_idx
  ON public.ai_astrology_reports (payment_intent_id)
  WHERE payment_intent_id IS NOT NULL;

-- Create index on refunded for filtering refunded reports
CREATE INDEX IF NOT EXISTS ai_astrology_reports_refunded_idx
  ON public.ai_astrology_reports (refunded)
  WHERE refunded = TRUE;

-- Create index on error_code for analytics
CREATE INDEX IF NOT EXISTS ai_astrology_reports_error_code_idx
  ON public.ai_astrology_reports (error_code)
  WHERE error_code IS NOT NULL;

-- Add comment to table
COMMENT ON COLUMN public.ai_astrology_reports.payment_intent_id IS 'Stripe payment intent ID - links report to payment';
COMMENT ON COLUMN public.ai_astrology_reports.refunded IS 'Whether this report was automatically refunded due to generation failure';
COMMENT ON COLUMN public.ai_astrology_reports.refund_id IS 'Stripe refund ID if refund was processed';
COMMENT ON COLUMN public.ai_astrology_reports.refunded_at IS 'Timestamp when refund was processed';
COMMENT ON COLUMN public.ai_astrology_reports.error_code IS 'Categorized error code (MISSING_SECTIONS, MOCK_CONTENT_DETECTED, VALIDATION_FAILED, etc.)';

