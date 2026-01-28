# Production Flags & Environment Variables Guide

**Last Updated**: 2026-01-25  
**Purpose**: Single source of truth for MVP-critical production flags

---

## 🚨 CRITICAL PRODUCTION FLAGS

These flags control core MVP guarantees (payment protection, bundle availability, test mode).  
**NEVER change these in production without explicit approval and understanding the implications.**

---

## 📋 FLAG REFERENCE

### `NEXT_PUBLIC_BUNDLES_ENABLED`

**What it does**: Controls whether bundle reports are available in the UI  
**Type**: `boolean` (string: `"true"` or `"false"`)  
**Default (Production)**: `false`  
**Safe for Production**: ✅ `false` | ⚠️ `true` (only if bundle redesign complete)

**Behavior**:
- `false`: Bundle page shows "Bundles Temporarily Paused" message, links to single reports
- `true`: Bundle selection UI is available, bundle generation is enabled

**MVP Context**:
- Bundles are currently client-orchestrated (not server-orchestrated)
- MVP requires bundle-level payment guarantee (no charge unless ALL bundle reports delivered)
- Current implementation does NOT meet this guarantee
- **RECOMMENDATION**: Keep `false` until bundle redesign is complete

**When to enable**:
- Only after implementing server-orchestrated bundles with bundle-level payment capture
- Only after bundle status is a single logical unit (not per-item complexity)
- Only after testing bundle payment guarantee thoroughly

---

### `BYPASS_PAYMENT_FOR_TEST_USERS`

**What it does**: Bypasses Stripe payment for test users (creates mock sessions)  
**Type**: `boolean` (string: `"true"` or `"false"`)  
**Default (Production)**: `false`  
**Safe for Production**: ✅ `false` | ❌ `true` (NEVER in production)

**Behavior**:
- `false`: All users go through Stripe (production-safe)
- `true`: Test users bypass Stripe, create mock `test_session_` or `prodtest_` sessions

**MVP Context**:
- Payment protection is core MVP guarantee
- Bypassing payment in production violates MVP Rule #3 (Payment captured only after success)
- **NEVER enable in production** - only safe in local/preview environments

**When to enable**:
- Local development (`.env.local`)
- Preview deployments for testing (Vercel Preview)
- **NEVER in production**

---

### `ALLOW_PROD_TEST_BYPASS`

**What it does**: Allows `prodtest_` sessions to bypass Stripe in production  
**Type**: `boolean` (string: `"true"` or `"false"`)  
**Default (Production)**: `false`  
**Safe for Production**: ⚠️ `false` (default) | ⚠️ `true` (only for controlled testing)

**Behavior**:
- `false`: `prodtest_` sessions are created but payment verification still goes through Stripe (will fail)
- `true`: `prodtest_` sessions bypass Stripe in production (creates mock sessions)

**MVP Context**:
- `prodtest_` sessions are for production test users (allowlisted users)
- If enabled, these sessions bypass payment verification
- **WARNING**: Only enable if you explicitly need production test sessions and understand the security implications

**When to enable**:
- Only for controlled production testing with allowlisted users
- Only if you understand that `prodtest_` sessions will bypass Stripe
- **NEVER enable without explicit approval**

**Note**: Even if `false`, `prodtest_` sessions are created by `create-checkout` (with warning), but `verify-payment` will try to retrieve them from Stripe (which will fail). The fix ensures `verify-payment` always recognizes `prodtest_` sessions as test sessions.

---

### `AI_ASTROLOGY_DEMO_MODE`

**What it does**: Enables demo/test mode for development  
**Type**: `boolean` (string: `"true"` or `"false"`)  
**Default (Production)**: `false`  
**Safe for Production**: ✅ `false` | ❌ `true` (NEVER in production)

**Behavior**:
- `false`: Normal production mode (real reports, real payments)
- `true`: Demo mode (mock reports, mock payments)

**MVP Context**:
- Demo mode is for development/testing only
- Enabling in production would violate MVP guarantees
- **NEVER enable in production**

**When to enable**:
- Local development (`.env.local`)
- Preview deployments for testing (Vercel Preview)
- **NEVER in production**

---

## 🔒 PRODUCTION SAFE DEFAULTS

**Recommended Production Configuration**:

```bash
NEXT_PUBLIC_BUNDLES_ENABLED=false
BYPASS_PAYMENT_FOR_TEST_USERS=false
ALLOW_PROD_TEST_BYPASS=false
AI_ASTROLOGY_DEMO_MODE=false
```

**These defaults ensure**:
- ✅ Payment protection is enforced (no bypasses)
- ✅ Bundles are frozen (no bundle-level payment risk)
- ✅ Demo mode is disabled (real reports only)
- ✅ Production test sessions require explicit opt-in

---

## 📝 VERIFICATION CHECKLIST

Before deploying to production, verify:

- [ ] `NEXT_PUBLIC_BUNDLES_ENABLED=false` (unless bundle redesign is complete)
- [ ] `BYPASS_PAYMENT_FOR_TEST_USERS=false`
- [ ] `ALLOW_PROD_TEST_BYPASS=false` (unless explicitly needed)
- [ ] `AI_ASTROLOGY_DEMO_MODE=false`
- [ ] No cron jobs calling `/api/ai-astrology/expire-orders` (404 noise)
- [ ] Vercel environment variables match `.env.example` defaults

---

## 🚦 CHANGE APPROVAL PROCESS

**Before changing any production flag**:

1. **Understand the MVP implications**
   - Does this violate MVP Rule #3 (Payment protection)?
   - Does this violate MVP Rule #4 (No automatic retries)?
   - Does this affect bundle-level payment guarantee?

2. **Get explicit approval**
   - Document why the change is needed
   - Document the MVP impact
   - Get approval from product owner

3. **Test thoroughly**
   - Test in preview environment first
   - Verify MVP guarantees still hold
   - Monitor logs for violations

4. **Document the change**
   - Update this file with change reason
   - Update `.env.example` if default changes
   - Document in commit message

---

## 📚 RELATED DOCUMENTATION

- `docs/MVP_GOALS_FINAL_LOCKED.md` - MVP goals and rules
- `docs/NON_NEGOTIABLES.md` - Non-negotiable system rules
- `.env.example` - Environment variable template

---

**Remember**: These flags control core MVP guarantees. Changes should be rare, well-documented, and explicitly approved.

