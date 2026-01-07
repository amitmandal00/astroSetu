# 📋 How to Run Supabase Migration

## Quick Steps

### Option 1: Copy SQL Directly (Easiest)

1. **Open Supabase Dashboard**
   - Go to: https://app.supabase.com
   - Select your project
   - Click **"SQL Editor"** in left sidebar

2. **Copy this SQL** (starts from "-- Step 1" below):

```sql
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
```

3. **Paste into SQL Editor**
4. **Click "Run"** button (or press Ctrl+Enter / Cmd+Enter)
5. **Check Results** - Should show: "SUCCESS: All 5 required columns exist"

---

### Option 2: Upload SQL File

If copying doesn't work:
1. Open Supabase SQL Editor
2. Click **"New Query"**
3. Copy the entire contents of `supabase-contact-submissions-migration.sql`
4. Paste and run

---

## ✅ Verification

After running the migration, verify with this query:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'contact_submissions'
AND column_name LIKE 'email_%'
ORDER BY column_name;
```

You should see these 5 columns:
- `email_sent_user` (boolean)
- `email_sent_internal` (boolean)
- `email_sent_user_at` (timestamptz)
- `email_sent_internal_at` (timestamptz)
- `email_error` (text)

---

## 🆘 Troubleshooting

### Error: "relation contact_submissions does not exist"
- Table doesn't exist yet - run `supabase-contact-submissions.sql` first

### Error: "permission denied"
- Make sure you're using SQL Editor (not Table Editor)
- You need admin/service role permissions

### Columns still not showing
- Refresh the page
- Check you're looking at the right project
- Verify table name is exactly `contact_submissions`

---

## 📞 Need Help?

If the migration doesn't work:
1. Check Supabase logs for error messages
2. Verify table name matches exactly
3. Try running Step 1 separately first
4. Contact Supabase support if needed

