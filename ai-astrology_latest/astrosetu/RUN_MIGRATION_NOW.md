# 🚀 Run Database Migration Now

## Quick Start

**Click this file to open it:**
[`docs/AI_ASTROLOGY_REPORTS_REFUND_TRACKING_MIGRATION.sql`](../docs/AI_ASTROLOGY_REPORTS_REFUND_TRACKING_MIGRATION.sql)

---

## Step-by-Step Instructions

1. **Open the SQL file:**
   - Click the link above, or
   - Navigate to: `astrosetu/docs/AI_ASTROLOGY_REPORTS_REFUND_TRACKING_MIGRATION.sql`

2. **Copy the SQL content:**
   - Select all (Cmd/Ctrl + A)
   - Copy (Cmd/Ctrl + C)

3. **Open Supabase Dashboard:**
   - Go to https://supabase.com/dashboard
   - Select your project
   - Click **SQL Editor** in the left sidebar

4. **Run the migration:**
   - Click **New Query**
   - Paste the SQL content
   - Click **Run** (or press Cmd/Ctrl + Enter)

5. **Verify success:**
   - You should see "Success. No rows returned"
   - Check the table structure to confirm columns were added

---

## Verify Migration Success

After running the migration, verify the columns were added:

```sql
-- Check if columns exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'ai_astrology_reports'
  AND column_name IN ('payment_intent_id', 'refunded', 'refund_id', 'refunded_at', 'error_code');
```

You should see all 5 columns listed.

---

## Migration File Location

**Full path:** `astrosetu/docs/AI_ASTROLOGY_REPORTS_REFUND_TRACKING_MIGRATION.sql`

**Relative path from project root:** `docs/AI_ASTROLOGY_REPORTS_REFUND_TRACKING_MIGRATION.sql`

---

## What This Migration Does

Adds the following columns to `ai_astrology_reports` table:
- `payment_intent_id` - Links reports to Stripe payments
- `refunded` - Tracks if report was refunded
- `refund_id` - Stripe refund ID
- `refunded_at` - Timestamp when refund was processed
- `error_code` - Categorizes failure reasons

Also creates indexes for performance optimization.

---

## Troubleshooting

**If you get "column already exists" error:**
- The migration is idempotent (safe to run multiple times)
- If columns already exist, you can skip this migration

**If you get "table does not exist" error:**
- You need to run the initial table creation first
- See: `docs/AI_ASTROLOGY_REPORT_STORE_SUPABASE.sql`

---

**Status:** ⏳ **AWAITING MIGRATION** - Run the SQL file in Supabase to complete setup

