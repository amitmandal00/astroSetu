# CRON REMOVAL REQUIRED (P0 - Manual Action)

**Status**: ✅ **COMPLETED**  
**Priority**: P0 (MVP Compliance Blocker)  
**Date**: 2026-01-25  
**Completed**: 2026-01-25

---

## 🚨 ISSUE

Vercel logs show repeated 404 errors for `/api/ai-astrology/expire-orders`:

```
POST 404 /api/ai-astrology/expire-orders
```

**Frequency**: Every ~10 minutes  
**Impact**: 
- Violates MVP Rule: "No cron-for-correctness"
- Creates noise in logs
- Indicates misconfiguration

---

## 🔍 ROOT CAUSE

The endpoint `/api/ai-astrology/expire-orders` **does not exist** in the codebase.

**Evidence**:
- No route file: `astrosetu/src/app/api/ai-astrology/expire-orders/route.ts`
- No `vercel.json` cron configuration in repo
- Endpoint returns 404 (not found)

**Conclusion**: Cron job is configured in **Vercel Dashboard**, not in code.

---

## ✅ REQUIRED ACTION

### Step 1: Access Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Select your project: `astroSetu` (or `mindveda.net`)
3. Navigate to: **Settings** → **Cron Jobs**

### Step 2: Find and Remove Cron Job
1. Look for a cron job that calls:
   - Endpoint: `/api/ai-astrology/expire-orders`
   - Method: `POST`
   - Schedule: Every 10 minutes (or similar)

2. **Delete** or **Disable** the cron job

### Step 3: Verify Removal
1. Wait 10-15 minutes after removal
2. Check Vercel logs
3. Confirm no more 404s for `/expire-orders`

---

## 📋 MVP COMPLIANCE

**MVP Rule**: "No cron job required for correctness"

**Why This Matters**:
- MVP explicitly states: "No cron-for-correctness"
- System should work correctly without scheduled jobs
- Cron jobs add complexity and failure points

**After Removal**:
- ✅ No more 404 noise in logs
- ✅ MVP compliance restored
- ✅ System remains correct without cron

---

## 🔮 FUTURE CONSIDERATIONS

If you need order expiration in the future:

1. **Option A**: Implement endpoint first, then add cron
   - Create `/api/ai-astrology/expire-orders/route.ts`
   - Test endpoint manually
   - Then configure cron in Vercel Dashboard

2. **Option B**: Use payment authorization expiration (Stripe)
   - Stripe PaymentIntents expire after 24 hours if not captured
   - No cron needed - Stripe handles expiration

3. **Option C**: Check expiration on-demand (when user returns)
   - Check payment status when user visits preview page
   - Cancel expired payments on-demand
   - No cron needed

**Recommendation**: Use Option B or C (no cron needed).

---

## ✅ VERIFICATION CHECKLIST

After removing cron:

- [x] Cron job removed from Vercel Dashboard
- [x] Wait 10-15 minutes
- [x] Check Vercel logs - no more `/expire-orders` 404s
- [x] Document removal date
- [x] Update this document: Mark as "COMPLETED"

---

## 📝 NOTES

- This is a **manual action** - cannot be automated
- Must be done in Vercel Dashboard (not in code)
- No code changes required
- No deployment needed

---

**Created**: 2026-01-25  
**Completed**: 2026-01-25  
**Status**: ✅ Completed - Cron job removed from Vercel Dashboard

