# CURSOR_ACTIONS_REQUIRED

This file contains ONLY things that require user interaction (keys, approvals, Stripe dashboard, etc.).

## Current Actions Required (2026-01-17 19:00)

### 1. Database Migration: Create `ai_input_sessions` Table (CRITICAL)

**Action**: Run SQL migration in Supabase

**File**: `astrosetu/docs/AI_INPUT_SESSIONS_SUPABASE.sql`

**SQL to execute**:
```sql
CREATE TABLE IF NOT EXISTS ai_input_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token UUID UNIQUE NOT NULL,
  payload JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 minutes'), -- CRITICAL: TTL default 30 minutes
  consumed_at TIMESTAMPTZ, -- Optional: mark as consumed for one-time semantics
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_input_sessions_token ON ai_input_sessions(token);
CREATE INDEX IF NOT EXISTS idx_ai_input_sessions_expires_at ON ai_input_sessions(expires_at);
```

**Steps**:
1. Open Supabase Dashboard → SQL Editor
2. Copy SQL above
3. Execute SQL
4. Verify table created: `SELECT * FROM ai_input_sessions LIMIT 1;`

**Why**: Required for input token pattern (replaces sessionStorage dependency). **Without this, input token storage will fail in production.**

---

### 2. Environment Variables Verification (CRITICAL)

**Action**: Verify these env vars are set in Vercel:

**Required**:
- `NEXT_PUBLIC_SUPABASE_URL` - Required for input token storage
- `SUPABASE_SERVICE_ROLE_KEY` - **CRITICAL**: Required server-side only (never exposed to client)
- `STRIPE_SECRET_KEY` - Required for checkout
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Required for checkout

**Optional but recommended**:
- `NEXT_PUBLIC_APP_URL` - Now resilient (derives from headers), but recommended for reliability

**Security Note**: `SUPABASE_SERVICE_ROLE_KEY` is **server-only**. It must NEVER be:
- Exposed to client code
- Logged in responses
- Returned in API responses
- Accessible via browser DevTools

**Why**: Input token pattern requires Supabase. If `SUPABASE_SERVICE_ROLE_KEY` is missing in production, API will return 500 error (hard guard, no silent degradation).

---

### 3. Production Testing Checklist

**After deployment, test these scenarios**:

1. **Checkout No-Op Fix**:
   - Navigate to preview page
   - Click "Purchase Year Analysis Report"
   - ✅ Should redirect to Stripe OR show error within 15s (not stuck loading)

2. **Input Token Flow**:
   - Open incognito browser
   - Fill birth details on input page
   - Submit form
   - ✅ Should redirect to preview (no redirect loop)
   - ✅ Preview should load input data (even without sessionStorage)

3. **Subscription ReturnTo**:
   - Navigate to `/ai-astrology/subscription`
   - If redirected to input, fill details
   - Submit
   - ✅ Should return to `/ai-astrology/subscription` (exact pathname, not preview)

4. **Subscribe Button**:
   - On subscription page, click "Subscribe"
   - ✅ Should redirect to Stripe OR show error within 15s (not stuck loading)

---

### 4. E2E Tests (Recommended - for CI/CD)

**Action**: Run new E2E tests to verify fixes

```bash
cd astrosetu
npm run test:e2e -- checkout-failure-handling.spec.ts
npm run test:e2e -- input-token-flow.spec.ts
npm run test:e2e -- subscription-returnTo-exact.spec.ts
npm run test:e2e -- expired-input-token.spec.ts
npm run test:e2e -- returnTo-security.spec.ts
```

**Why**: These tests verify the fixes work in production-like scenarios, including security edge cases

---

### 5. Production Readiness Checklist (CRITICAL)

**Before declaring "production-ready", verify ALL of these**:

✅ **Database Migration**: `ai_input_sessions` table created in Supabase  
✅ **Environment Variables**: All required vars set in Vercel (see #2 above)  
✅ **Release Gate**: `npm run release:gate` passes in CI/Vercel (not just local)  
✅ **Manual Production Testing**: All 4 scenarios in #3 above tested in production  
✅ **Security Verification**: No service role key exposure (check browser DevTools, API responses)

---

## No Actions Required (Auto-Resolved)

- ✅ Checkout API baseUrl resilience (derives from headers automatically)
- ✅ Purchase/subscribe timeout (15s hardcoded)
- ✅ Error UI (automatically shows on failure)
- ✅ Input token API routes (created, ready to use)
- ✅ Preview page token handling (checks token first, falls back to sessionStorage)

---

**Last Updated**: 2026-01-17 19:00  
**Status**: Production fixes implemented, awaiting database migration and testing
