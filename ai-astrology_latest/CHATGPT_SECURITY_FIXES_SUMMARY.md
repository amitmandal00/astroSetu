# ChatGPT Security Fixes - Implementation Summary

**Date**: 2026-01-17 19:30  
**Status**: ✅ **ALL SECURITY FIXES IMPLEMENTED**

---

## Security Gaps Fixed

### 1. ✅ SUPABASE_SERVICE_ROLE_KEY Security

**Issue**: Service role key was used without hard guards, could leak silently

**Fixes Applied**:
- **Hard Guard in Production**: If `SUPABASE_SERVICE_ROLE_KEY` is missing in production, return 500 error (no silent degradation)
- **No Mock Tokens in Production**: Mock tokens only allowed in development mode
- **Service Role Key Never Exposed**: 
  - Never logged in responses
  - Never returned in API responses
  - Only used server-side for Supabase client creation
  - `autoRefreshToken: false`, `persistSession: false` to prevent leaks

**Files Changed**:
- `src/app/api/ai-astrology/input-session/route.ts`

---

### 2. ✅ Token TTL + One-Time Semantics

**Issue**: Input tokens had no default TTL and could be reused indefinitely

**Fixes Applied**:
- **Default TTL**: `expires_at` default set to `NOW() + INTERVAL '30 minutes'` (reduced from 1 hour)
- **Expiration Check**: GET handler rejects expired tokens with 410 status
- **Optional One-Time Semantics**: Added `consumed_at` column (commented out - can enable if needed)
- **Automatic Cleanup**: Expired tokens are deleted after rejection

**Files Changed**:
- `docs/AI_INPUT_SESSIONS_SUPABASE.sql` - Added default TTL and `consumed_at` column
- `src/app/api/ai-astrology/input-session/route.ts` - Expiration check and cleanup

**Test Added**: `tests/e2e/expired-input-token.spec.ts` - Verifies expired token shows "Start again" within 2s

---

### 3. ✅ ReturnTo Security Hardening

**Issue**: ReturnTo parameter could accept external URLs or dangerous paths (open redirect vulnerability)

**Fixes Applied**:
- **Path Whitelist**: Only allow paths starting with `/ai-astrology/`
- **Block External URLs**: Reject `https://` or `//` protocol-relative URLs
- **Block Dangerous Paths**: Reject paths outside `/ai-astrology/` (e.g., `/admin/`)
- **Safe Fallback**: If returnTo is invalid, fall back to default preview redirect (safe)

**Files Changed**:
- `src/app/ai-astrology/input/page.tsx` - Added returnTo validation

**Test Added**: `tests/e2e/returnTo-security.spec.ts` - Verifies external URLs and dangerous paths are blocked

---

### 4. ✅ Checkout baseUrl Priority Fix

**Issue**: baseUrl derivation order was suboptimal

**Fixes Applied**:
- **Improved Priority Order**:
  1. `NEXT_PUBLIC_APP_URL` (most reliable if set)
  2. `x-forwarded-proto` + `x-forwarded-host` (Vercel/proxy)
  3. `host` header (with protocol detection)
  4. Request URL parsing (fallback)
  5. `origin` header (last resort)
- **Clean Error Handling**: Return 500 with safe message if baseUrl cannot be derived

**Files Changed**:
- `src/app/api/ai-astrology/create-checkout/route.ts` - Improved baseUrl derivation priority

---

### 5. ✅ Production Readiness Rules

**Issue**: No clear rules for claiming "production-ready"

**Fixes Applied**:
- **Updated `.cursor/rules`**: Added strict production readiness requirements
  - DB migration must be executed
  - `npm run release:gate` must pass in CI/Vercel (not just local)
  - Manual production verification checklist must be completed (3 critical flows)

**Files Changed**:
- `.cursor/rules` - Added production readiness rules section
- `CURSOR_ACTIONS_REQUIRED.md` - Added production readiness checklist

---

## SQL Migration (User Action Required)

**File**: `astrosetu/docs/AI_INPUT_SESSIONS_SUPABASE.sql`

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

**Why**: Required for input token storage with proper TTL and security

---

## New Tests Added

1. **`expired-input-token.spec.ts`**: Verifies expired token shows "Start again" within 2s
2. **`returnTo-security.spec.ts`**: Verifies external URLs and dangerous paths are blocked

---

## Security Verification Checklist

After deployment, verify:

✅ **Service Role Key Not Exposed**:
- Check browser DevTools → Network → API responses (no `SUPABASE_SERVICE_ROLE_KEY`)
- Check browser DevTools → Application → Storage (no service role key)
- Check API response headers (no service role key)

✅ **ReturnTo Validation**:
- Try `returnTo=https://evil.com` → should ignore and use default route
- Try `returnTo=/admin/sensitive` → should ignore and use default route

✅ **Token Expiration**:
- Wait 30+ minutes, then try expired token → should show "Start again" within 2s

---

## Next Steps

1. ✅ Run SQL migration (user action required)
2. ✅ Verify env vars in Vercel (see `CURSOR_ACTIONS_REQUIRED.md`)
3. ✅ Deploy to production
4. ✅ Run production verification checklist
5. ✅ Verify security requirements (no service role key exposure)

---

**Status**: ✅ All security fixes implemented and tested locally  
**Ready for**: Database migration → Production deployment → Security verification

