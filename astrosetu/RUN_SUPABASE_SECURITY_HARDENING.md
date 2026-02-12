# 🚨 Supabase Security Lockdown

## Purpose
- Harden the AI Astrology / session tables so that **only the server-side service role** can read or write them.
- This replaces the default public API access (anon key + PostgREST) with explicit deny-all policies.
-
## Steps
1. Open https://app.supabase.com → your project → **SQL Editor**.
2. Create a **New Query** and paste the entire contents of `docs/AI_ASTROLOGY_TABLES_RLS_HARDENING.sql`.
3. Click **Run** (or press ⌘+Enter / Ctrl+Enter).

## Verification
Run the following checks in the SQL editor after the script succeeds:

### Row-level security flag

```sql
SELECT c.relname AS table_name, c.relrowsecurity
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname IN (
    'ai_astrology_orders',
    'ai_astrology_reports',
    'ai_astrology_subscriptions',
    'ai_astrology_runtime_flags',
    'ai_input_sessions'
  )
ORDER BY c.relname;
```

Each row must show `relrowsecurity = true`. If a table isn't listed yet, it means the table has not been created; rerun the script after the schema exists.

### Deny policies

```sql
SELECT policyname, tablename, perm
FROM pg_policies
WHERE tablename IN (
  'ai_astrology_orders',
  'ai_astrology_reports',
  'ai_astrology_subscriptions',
  'ai_astrology_runtime_flags',
  'ai_input_sessions'
);
```

Every row should list `policyname = 'No direct access'` and perm covering all commands.

## Notes
- The Supabase service role bypasses RLS, so your backend/APIs continue working.
- Make sure no frontend clients embed the anon key into custom SQL queries once this lock is in place.

