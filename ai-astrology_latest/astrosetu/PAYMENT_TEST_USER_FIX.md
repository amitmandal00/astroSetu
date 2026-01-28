# Fix: Enable Payment Windows for Test Users (Amit & Ankita)

## ✅ Issue Fixed

Test users (Amit Kumar Mandal and Ankita Surabhi) were not getting payment windows - they were bypassing Stripe checkout.

## 🔧 Changes Made

### 1. Changed Default Behavior

**Before:**
- `BYPASS_PAYMENT_FOR_TEST_USERS` defaulted to `true` (bypass payment)
- Test users automatically bypassed Stripe

**After:**
- `BYPASS_PAYMENT_FOR_TEST_USERS` defaults to `false` (go through payment)
- Test users now go through Stripe checkout by default

### 2. Added Support for Ankita Surabhi

**Before:**
- Only Amit Kumar Mandal was recognized as test user

**After:**
- Both Amit Kumar Mandal and Ankita Surabhi are recognized
- Flexible matching for Ankita (name-based primary matching)

### 3. Updated Both Routes

- ✅ `create-checkout/route.ts` - Updated default behavior
- ✅ `generate-report/route.ts` - Updated default behavior

## 🚀 How to Enable Payment Testing

### Option 1: No Action Required (Recommended)

**Current behavior (after fix):**
- Test users will go through Stripe payment by default
- Payment windows will appear
- Full payment flow testing enabled

### Option 2: Explicitly Set Environment Variable

If you want to be explicit, set in Vercel:

```
BYPASS_PAYMENT_FOR_TEST_USERS=false
```

This ensures test users go through Stripe even if other settings change.

### Option 3: Disable Payment Testing (If Needed)

If you want test users to bypass payment again, set:

```
BYPASS_PAYMENT_FOR_TEST_USERS=true
```

## 📋 Test User Details

### Amit Kumar Mandal
- Name: Amit Kumar Mandal
- DOB: 26/11/1984 (or 1984-11-26)
- Time: 21:40 (or 9:40 PM)
- Place: Noamundi, Jharkhand, India (contains "Noamundi")
- Gender: Male

### Ankita Surabhi
- Name: Ankita Surabhi
- DOB: Flexible matching (currently set to 1990-05-15 - update if different)
- Time: Flexible matching (currently set to 10:30 - update if different)
- Place: Should contain "Delhi" (currently set to "Delhi" - update if different)
- Gender: Female (optional)

**Note:** If Ankita's actual details are different, update the `testUsers` array in:
- `src/app/api/ai-astrology/create-checkout/route.ts`
- `src/app/api/ai-astrology/generate-report/route.ts`

## ✅ Verification Steps

After deployment:

1. **Test with Amit:**
   - Fill form with Amit's details
   - Select paid report
   - **Expected:** Stripe checkout window appears

2. **Test with Ankita:**
   - Fill form with Ankita's details
   - Select paid report
   - **Expected:** Stripe checkout window appears

3. **Check Vercel Logs:**
   - Should see: `[CHECKOUT CREATION]` (not `[DEMO MODE]`)
   - Should see Stripe session creation
   - Should NOT see: "Returning mock checkout session"

## 🎯 Expected Behavior

**Before Fix:**
- Test users → Mock session → No payment window → Bypass payment

**After Fix:**
- Test users → Stripe checkout → Payment window → Complete payment → Report generation

## 📝 Important Notes

1. **Access Restriction Still Active:**
   - `NEXT_PUBLIC_RESTRICT_ACCESS=true` still restricts access
   - Only authorized users (Amit, Ankita) can access
   - But they now go through Stripe payment flow

2. **Demo Mode Still Bypasses:**
   - `AI_ASTROLOGY_DEMO_MODE=true` still bypasses payment
   - This is separate from test user detection

3. **Build Status:**
   - ✅ Code updated
   - ✅ Build successful
   - ⏳ **Action Required:** Deploy to production

## 🚨 Action Required

1. ✅ **Code Fixed** - Default behavior changed
2. ⏳ **Deploy to Production** - Push changes and redeploy
3. ⏳ **Test Payment Flow** - Verify payment windows appear
4. ⏳ **Update Ankita Details** - If her DOB/time/place are different

---

**Status:** ✅ **READY TO DEPLOY**

The fix is complete and ready. After deployment, test users will see payment windows automatically.

