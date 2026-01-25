# CURSOR ACTIONS REQUIRED

**Last Updated**: 2026-01-25  
**Status**: 🔄 **MVP GOALS LOCKED - ROLLBACK TO LAST STABLE BUILD REQUIRED**

---

## 🎯 MVP Goals Alignment (2026-01-25)

**MVP Definition**: "A user authorizes payment once and always gets either a fully delivered report (or bundle) or no charge — with zero stuck states and zero money leakage."

**Core Intent**: Stability > cleverness, Predictability > speed, One correct path > many flexible ones

**Key Decisions**:
- ✅ Bulk reports allowed (with strict conditions) - they worked in last stable build
- ✅ Yearly analysis flakiness acknowledged - needs strict timeouts/validation/fallback
- ✅ Priority = stability > scope purity
- ✅ Rollback to last stable build required

**Next Actions**:
1. ⏳ **Rollback to last stable build** where bulk reports worked
2. ⏳ **Validate bulk implementation** - ensure all conditions met
3. ⏳ **Identify yearly flakiness root cause** - document exact issues
4. ⏳ **Create "do not touch / safe to refactor" map** - surgical fixes only

## 🚨 COST OPTIMIZATION ACTIONS (2026-01-25)

### Immediate Actions Required
- [ ] **Monitor On-Demand charges daily**: Check Cursor Settings → Usage
- [ ] **Implement scoped requests**: Use @filename mentions, focus on specific files
- [ ] **Break large tasks**: Split into smaller requests (< 500K tokens each)
- [ ] **Review cost patterns**: Document large requests in `COST_SPIKE_ANALYSIS.md`

### Cost Alert Thresholds
- **⚠️ WARNING**: Request > 500K tokens → Alert user, suggest scoping
- **🔴 CRITICAL**: Request > 1M tokens → Require explicit approval
- **💥 BLOCK**: Request > 2M tokens → Block immediately, require breakdown

### Weekly Review
- [ ] Check On-Demand usage vs $50/month limit
- [ ] Review large requests (> 500K tokens)
- [ ] Identify optimization opportunities
- [ ] Adjust workflow if needed

**See `COST_SPIKE_ANALYSIS.md` and `COST_ALERT_SYSTEM.md` for detailed guidelines.**

---

## Previous Status (2026-01-18)

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

**🚨 Git Push Approval Requirement (NON-NEGOTIABLE - 2026-01-19)**:
- ✅ **CRITICAL**: ALL git push operations now require explicit user approval
- ✅ **ALWAYS keep all changes**: Commit locally to preserve work (`git add` and `git commit` are fine)
- ✅ **ALWAYS get approval before git push**: **NEVER** push to remote without explicit user approval
- ✅ **Show what will be pushed**: Display commit summary and changed files before asking for approval
- ✅ **Wait for confirmation**: Do not proceed with `git push` until user explicitly approves
- ✅ Updated all operational documentation files to reflect this requirement:
  - `CURSOR_OPERATIONAL_GUIDE.md`
  - `CURSOR_WORKFLOW_CONTROL.md`
  - `CURSOR_PROGRESS.md`
  - `CURSOR_AUTOPILOT_PROMPT.md`
  - `CURSOR_ACTIONS_REQUIRED.md`
- ✅ This is a NON-NEGOTIABLE rule that cannot be bypassed under any circumstances

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
