-- Persistent idempotency store for AI Astrology reports (serverless-safe)
-- Why: in-memory maps do not work reliably on Vercel/serverless; this prevents duplicate OpenAI calls
-- and enables polling (GET) to reliably see status/content.

create table if not exists public.ai_astrology_reports (
  id bigserial primary key,
  idempotency_key text not null unique,
  report_id text not null unique,
  status text not null check (status in ('processing','completed','failed')),
  report_type text not null,
  input jsonb not null,
  content jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ai_astrology_reports_status_idx
  on public.ai_astrology_reports (status);

create index if not exists ai_astrology_reports_report_type_idx
  on public.ai_astrology_reports (report_type);

-- Optional: keep updated_at fresh automatically (requires extension / function).
-- If you already have a standard updated_at trigger, apply it here.


