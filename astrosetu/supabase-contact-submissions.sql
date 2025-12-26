-- Contact Form Submissions Table
-- Stores all contact form submissions for tracking and follow-up

create table if not exists contact_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Contact Information
  name text not null,
  email text not null,
  phone text null,

  -- Message Details
  subject text not null,
  message text not null,
  category text not null default 'general' check (category in ('general','support','feedback','bug','partnership','other')),

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

-- Optionally: Allow users to view their own submissions (if authenticated)
-- create policy "Allow users to view their own submissions"
--   on contact_submissions for select
--   using (auth.uid()::text = (metadata->>'user_id')::text);

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

