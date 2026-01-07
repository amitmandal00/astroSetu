-- ============================================================================
-- SUPABASE MIGRATION SCRIPT
-- ============================================================================
-- File: supabase-contact-submissions-migration.sql
-- Purpose: Update contact_submissions table columns to match code expectations
-- Date: January 6, 2026
-- ============================================================================
-- INSTRUCTIONS:
-- 1. Open Supabase Dashboard → SQL Editor (https://app.supabase.com)
-- 2. Select your project
-- 3. Copy ALL lines below (from "-- Step 1" to end)
-- 4. Paste into SQL Editor
-- 5. Click "Run" button or press Ctrl+Enter (Cmd+Enter on Mac)
-- ============================================================================

-- Step 1: Add new columns (safe - won't error if columns already exist)
ALTER TABLE contact_submissions
  ADD COLUMN IF NOT EXISTS email_sent_user boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS email_sent_internal boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS email_sent_user_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS email_sent_internal_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS email_error text NULL;

-- Step 2: Migrate data from old columns (if they exist)
DO $$
BEGIN
  -- Migrate email_sent_pass -> email_sent_user
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'contact_submissions' 
    AND column_name = 'email_sent_pass'
  ) THEN
    UPDATE contact_submissions
    SET 
      email_sent_user = COALESCE(email_sent_pass, false),
      email_sent_user_at = email_sent_pass_at
    WHERE email_sent_pass IS NOT NULL OR email_sent_pass_at IS NOT NULL;
    
    RAISE NOTICE 'Migrated email_sent_pass to email_sent_user';
  END IF;
  
  -- Migrate email_sent_fail -> email_sent_internal
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'contact_submissions' 
    AND column_name = 'email_sent_fail'
  ) THEN
    UPDATE contact_submissions
    SET 
      email_sent_internal = COALESCE(email_sent_fail, false),
      email_sent_internal_at = email_sent_fail_at
    WHERE email_sent_fail IS NOT NULL OR email_sent_fail_at IS NOT NULL;
    
    RAISE NOTICE 'Migrated email_sent_fail to email_sent_internal';
  END IF;
END $$;

-- Step 3: Verify columns were added successfully
SELECT 
  CASE 
    WHEN COUNT(*) = 5 THEN 'SUCCESS: All 5 required columns exist'
    ELSE 'WARNING: Only ' || COUNT(*) || ' columns found (expected 5)'
  END as migration_status
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'contact_submissions'
AND column_name IN ('email_sent_user', 'email_sent_internal', 'email_sent_user_at', 'email_sent_internal_at', 'email_error');
