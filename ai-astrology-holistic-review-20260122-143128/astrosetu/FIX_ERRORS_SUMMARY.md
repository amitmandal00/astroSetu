# Fix Errors Summary

## Issues Fixed

### 1. "DOSHA ERROR WITH DEBUG" Logging Issue
**Problem**: Error messages were being logged even when requests succeeded (POST 200).

**Fix**: 
- Modified error logging in `astrologyAPI.ts` to only log when `!response.ok`
- Improved dosha error handling to only log warnings for actual client/server errors (4xx/5xx)
- Reduced noise in logs for successful fallbacks

**Files Changed**:
- `src/lib/astrologyAPI.ts` (lines 296-301, 427-431)

### 2. Phone Validation Error (400 Bad Request)
**Problem**: Phone numbers with invalid characters (like starting with "I") were causing validation errors.

**Fix**:
- Improved phone number sanitization to aggressively remove ALL non-digit characters
- Better error messages with digit count
- Consistent validation logic across `send-otp` and `verify-otp` routes

**Files Changed**:
- `src/app/api/auth/send-otp/route.ts`
- `src/app/api/auth/verify-otp/route.ts`

### 3. TypeScript Build Error
**Problem**: `OTPVerifySchema.extend()` was failing because `OTPRequestSchema` is a `ZodEffects` (from `.refine()`), which doesn't support `.extend()`.

**Fix**:
- Restructured schemas to use a base `PhoneBaseSchema` that both schemas can extend
- Applied refine validation to both schemas separately

**Files Changed**:
- `src/lib/validation.ts`

## Next Steps

1. Commit and push these fixes:
```bash
cd astrosetu
git add src/lib/astrologyAPI.ts src/app/api/auth/send-otp/route.ts src/app/api/auth/verify-otp/route.ts src/lib/validation.ts
git commit -m "Fix: Error logging and phone validation improvements

- Fix DOSHA ERROR logging to only log actual errors
- Improve phone number sanitization (handles invalid characters)
- Fix TypeScript error: OTPVerifySchema extend on ZodEffects
- Better error messages and reduced log noise"
git push origin main
```

2. Monitor Vercel logs after deployment to confirm:
   - No more "DOSHA ERROR WITH DEBUG" for successful requests
   - Phone validation works correctly
   - Build succeeds without TypeScript errors

## Notes

- The 401 errors for various endpoints (life, setup-2fa, preferences) are expected when users are not logged in
- The `icon-192.png` 401 error might be a caching issue - the file exists but may need proper authentication headers

