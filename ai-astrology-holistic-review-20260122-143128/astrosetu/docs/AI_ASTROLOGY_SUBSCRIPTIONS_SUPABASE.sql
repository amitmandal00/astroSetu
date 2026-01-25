-- AI Astrology (Stripe) subscription store
-- Source of truth for Billing UI + cancel/resume.

create table if not exists public.ai_astrology_subscriptions (
  id bigserial primary key,
  stripe_checkout_session_id text not null unique,
  stripe_customer_id text,
  stripe_subscription_id text unique,
  status text not null,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  plan_interval text not null default 'month',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ai_astrology_subscriptions_status_idx
  on public.ai_astrology_subscriptions (status);

create index if not exists ai_astrology_subscriptions_stripe_sub_idx
  on public.ai_astrology_subscriptions (stripe_subscription_id);


