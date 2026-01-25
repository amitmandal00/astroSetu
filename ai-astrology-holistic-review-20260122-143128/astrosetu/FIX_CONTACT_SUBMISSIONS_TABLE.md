# Fix: contact_submissions Table Missing

## ❌ Error

```
Could not find the table 'public.contact_submissions' in the schema cache
```

## ✅ Solution

The `contact_submissions` table doesn't exist in your Supabase database. Run the SQL script below to create it.

---

## 🚀 Quick Fix (2 minutes)

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase project dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Run This SQL Script

Copy and paste the entire SQL below, then click **Run**:

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

### Step 3: Verify Table Created

1. Go to **Table Editor** in Supabase dashboard
2. You should see `contact_submissions` table
3. Check that it has all the columns listed above

---

## ✅ What This Fixes

- ✅ Creates `contact_submissions` table
- ✅ Makes `name` field nullable (optional for compliance requests)
- ✅ Adds all compliance categories to the check constraint
- ✅ Sets up proper indexes for performance
- ✅ Configures Row Level Security (RLS) policies
- ✅ Adds automatic timestamp updates

---

## 🔍 After Running SQL

1. **Test the form again** - Submit a regulatory request
2. **Check Supabase** - Go to Table Editor → `contact_submissions` → Should see your submission
3. **Check logs** - Should no longer see "Could not find the table" error

---

## 📝 Note About Email Service

The second error you saw:
```
[Contact API] Email service not configured
```

This is separate from the database issue. To fix email sending:

1. **Option A (Gmail SMTP):** Add these to environment variables:
   ```bash
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=no-reply@mindveda.net
   SMTP_PASS=your_app_password
   ```

2. **Option B (Resend):** Add this to environment variables:
   ```bash
   RESEND_API_KEY=re_your_api_key
   ```

See `GMAIL_SMTP_SETUP.md` for detailed instructions.

---

## 🎯 Summary

**Database Error:** ✅ Fixed by running SQL script above
**Email Error:** ⚠️ Configure SMTP or Resend API key (see above)

After running the SQL and configuring email, both errors will be resolved!

