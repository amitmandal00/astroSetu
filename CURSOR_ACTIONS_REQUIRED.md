# CURSOR ACTIONS REQUIRED

**Last Updated**: 2026-01-18  
**Status**: 🔄 **IN PROGRESS - REDIRECT RACE CONDITION FIX APPLIED, 307 REDIRECTS UNDER INVESTIGATION**

---

## ✅ Implementation Complete

**Private Beta Gating**:
- ✅ Middleware created (`middleware.ts`) - UI + API gate enforcement
- ✅ Access page created (`/ai-astrology/access`) - Birth details form
- ✅ Verification API created (`/api/beta-access/verify`) - Server-side allowlist matching
- ✅ Server-only helpers (`src/lib/betaAccess.ts`) - Normalization/matching
- ✅ E2E tests created (3 specs: blocks, allows, blocks-api)
- ✅ Unit tests created (`tests/unit/betaAccess.test.ts`)
- ✅ Tests added to `test:critical` and `release:gate`
- ✅ `.cursor/rules` updated with PRIVATE_BETA_GATING invariants
- ✅ `PRODUCTION_PRIVATE_BETA_CHECKLIST.md` created

---

## 🔴 Latest Fixes Applied (2026-01-18)

**Free Life Summary Redirect Loop Fix**:
- ✅ Fixed race condition where `setTokenLoading(false)` was called immediately after `setInput()`, causing redirect check to run before React flushed the state update
- ✅ Used `requestAnimationFrame` to delay `setTokenLoading(false)` until after React has flushed the `setInput` state update
- ✅ Applied same fix to subscription page for consistency
- **Files Modified**: `astrosetu/src/app/ai-astrology/preview/page.tsx`, `astrosetu/src/app/ai-astrology/subscription/page.tsx`

**Monthly Subscription 307 Redirects**:
- ⏳ Investigating 307 redirects from `/api/billing/subscription` and `/api/billing/subscription/verify-session`
- ⏳ May be Vercel/Next.js routing issue rather than code issue
- ⏳ Need to verify if these redirects are causing the subscription loop or if they're unrelated

**Git Push Approval Requirement (2026-01-18)**:
- ✅ **CRITICAL**: ALL git push operations now require explicit user approval
- ✅ Updated `CURSOR_AUTOPILOT_PROMPT.md` to require approval before git push
- ✅ Cursor will show what will be pushed and wait for confirmation before executing

---

## 🔴 User Action Required

### 1. Review Changes

**Files Created/Modified**:
- `astrosetu/middleware.ts` (new) - Gate enforcement
- `astrosetu/src/app/ai-astrology/access/page.tsx` (new) - Access form UI
- `astrosetu/src/app/api/beta-access/verify/route.ts` (new) - Verification API
- `astrosetu/src/lib/betaAccess.ts` (new) - Server-only normalization/matching
- `astrosetu/tests/e2e/beta-access-*.spec.ts` (3 new) - E2E tests
- `astrosetu/tests/unit/betaAccess.test.ts` (new) - Unit tests
- `astrosetu/package.json` - Updated test scripts
- `.cursor/rules` - Added PRIVATE_BETA_GATING section
- `PRODUCTION_PRIVATE_BETA_CHECKLIST.md` (new) - Verification checklist

**Review and approve** before merging to main.

---

### 2. Merge to Main

**After review**:
1. Merge `chore/stabilization-notes` → `main` branch
   - No squash if it complicates tracing
   - Ensure branch is green per `release:gate` in CI/Vercel

2. **Commit Message**:
   ```
   feat: production private beta gating (2 test users)
   ```

---

### 3. Set Production Environment Variable

**In Vercel Dashboard**:
1. Go to Settings → Environment Variables
2. **For Production environment**:
   - Key: `NEXT_PUBLIC_PRIVATE_BETA`
   - Value: `true`
   - ☑️ Production checkbox

3. **For Preview environment** (optional):
   - Leave `NEXT_PUBLIC_PRIVATE_BETA` unset or set to `false`
   - Preview can remain open (not gated)

---

### 4. Deploy to Production

**After setting env var**:
1. Deploy `main` branch to **Production** in Vercel
2. Wait for deployment to complete
3. Verify deployment status (green/ready)

---

### 5. Verify in Production (Incognito)

**Follow `PRODUCTION_PRIVATE_BETA_CHECKLIST.md`**:
1. Verify UI routes are blocked (redirect to `/ai-astrology/access`)
2. Verify API routes are blocked (401 private_beta)
3. Verify valid user 1 (Amit Kumar Mandal) can access after verification
4. Verify valid user 2 (Ankita Surabhi) can access after verification
5. Verify invalid details remain blocked

**Expected Results**:
- ✅ Without cookie: All `/ai-astrology/*` pages redirect to `/ai-astrology/access`
- ✅ Without cookie: All `/api/ai-astrology/*` and `/api/billing/*` return 401
- ✅ With valid verification: Cookie set, can access all pages/APIs
- ✅ Invalid details: Stays blocked, no hints

---

## 📝 Summary

**What Was Implemented**:
- Private beta gating system (middleware + access page + verification API)
- Server-side allowlist for 2 test users (Amit Kumar Mandal, Ankita Surabhi)
- Dual enforcement (UI routes redirect, API routes return 401)
- HttpOnly cookie-based access control (7-day TTL)
- Comprehensive tests (E2E + unit)

**What User Must Do**:
1. Review and approve changes
2. Merge to main
3. Set `NEXT_PUBLIC_PRIVATE_BETA=true` in Production
4. Deploy to production
5. Verify using checklist

**Ready for**: Merge to main → Deploy → Production verification
