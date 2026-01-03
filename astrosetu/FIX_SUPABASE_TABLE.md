# Fix Supabase Table - Step-by-Step Guide

## Issue

You're seeing this error in logs:
```
Table 'contact_submissions' does not exist. Please run the SQL script from supabase-contact-submissions.sql in your Supabase SQL Editor.
```

This prevents submissions from being stored in the database, but **emails still work** (they're sent successfully).

## Solution: Create the Table

### Step 1: Open Supabase SQL Editor

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New query"** button (top right)

### Step 2: Copy the SQL Script

The SQL script is located at: `astrosetu/supabase-contact-submissions.sql`

**Full SQL Script:**
```sql
-- Contact Form Submissions Table
-- Stores all contact form submissions for tracking and follow-up

create table if not exists contact_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Contact Information
  name text null,  -- Optional for compliance requests
  email text not null,
  phone text null,

  -- Message Details
  subject text not null,
  message text not null,
  category text not null default 'general' check (category in ('general','support','feedback','bug','partnership','privacy','other','data_deletion','account_access','legal_notice','privacy_complaint')),

  -- Tracking
  status text not null default 'new' check (status in ('new','read','in_progress','resolved','archived')),
  assigned_to uuid null references auth.users(id) on delete set null,
  resolution_notes text null,

  -- Spam Prevention
  ip_address text null,
  user_agent text null,

  -- Metadata
  metadata jsonb not null default '{}'::jsonb
);

-- Indexes for performance
create index if not exists contact_submissions_email_idx on contact_submissions(email);
create index if not exists contact_submissions_status_idx on contact_submissions(status);
create index if not exists contact_submissions_category_idx on contact_submissions(category);
create index if not exists contact_submissions_created_at_idx on contact_submissions(created_at desc);
create index if not exists contact_submissions_ip_address_idx on contact_submissions(ip_address);

-- Full-text search index for message content
create index if not exists contact_submissions_message_search_idx on contact_submissions using gin(to_tsvector('english', message || ' ' || subject));

-- RLS (Row Level Security)
alter table contact_submissions enable row level security;

-- Allow service role to insert (server-side only)
create policy "Allow service role to insert contact submissions"
  on contact_submissions for insert
  with check (auth.role() = 'service_role');

-- Allow service role to read all submissions
create policy "Allow service role to read all contact submissions"
  on contact_submissions for select
  using (auth.role() = 'service_role');

-- Allow service role to update all submissions
create policy "Allow service role to update contact submissions"
  on contact_submissions for update
  using (auth.role() = 'service_role');

-- Update updated_at timestamp automatically
create or replace function update_contact_submissions_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_contact_submissions_updated_at
  before update on contact_submissions
  for each row
  execute function update_contact_submissions_updated_at();
```

### Step 3: Paste and Run

1. **Paste** the entire SQL script into the SQL Editor
2. Click **"Run"** button (or press `Ctrl+Enter` / `Cmd+Enter`)
3. Wait for execution to complete
4. You should see: **"Success. No rows returned"**

### Step 4: Verify Table Creation

1. In Supabase Dashboard, go to **"Table Editor"** (left sidebar)
2. Look for **`contact_submissions`** table
3. Click on it to view the structure
4. Verify columns match:
   - `id` (uuid, primary key)
   - `created_at` (timestamptz)
   - `updated_at` (timestamptz)
   - `name` (text, nullable)
   - `email` (text, not null)
   - `phone` (text, nullable)
   - `subject` (text, not null)
   - `message` (text, not null)
   - `category` (text, not null)
   - `status` (text, not null)
   - `assigned_to` (uuid, nullable)
   - `resolution_notes` (text, nullable)
   - `ip_address` (text, nullable)
   - `user_agent` (text, nullable)
   - `metadata` (jsonb)

### Step 5: Test

1. Submit the Regulatory Request Form again
2. Check Vercel logs - should see:
   ```
   [Contact API] Regulatory request received: {
     submissionId: "uuid-here",  // ✅ Should have a UUID now
     email: 'ami***',
     category: 'data_deletion',
     timestamp: '...',
     emailConfigured: true,
     stored: true  // ✅ Should be true now
   }
   ```
3. Check Supabase Table Editor → `contact_submissions` table
4. You should see the new submission row

## What This Fixes

✅ **Before:** `stored: false`, `submissionId: null`  
✅ **After:** `stored: true`, `submissionId: "uuid-here"`

## Benefits

1. **Audit Trail:** All submissions are stored in the database
2. **Tracking:** You can track status, assign to team members, add resolution notes
3. **Search:** Full-text search on messages and subjects
4. **Analytics:** Query submissions by category, date, status
5. **Compliance:** Complete record of all regulatory requests

## Troubleshooting

### Error: "relation already exists"
- The table already exists - this is fine
- The script uses `create table if not exists`, so it's safe to run again

### Error: "permission denied"
- Make sure you're using the **service role** key in your environment variables
- Check that RLS policies are created correctly

### Error: "function already exists"
- The trigger function already exists - this is fine
- The script will update it if needed

## Next Steps

After creating the table:
1. ✅ Test form submission
2. ✅ Verify `stored: true` in logs
3. ✅ Check Supabase table for new rows
4. ✅ Set up monitoring/alerts if needed

---

**The table creation is a one-time setup. Once created, all future submissions will be stored automatically.**

