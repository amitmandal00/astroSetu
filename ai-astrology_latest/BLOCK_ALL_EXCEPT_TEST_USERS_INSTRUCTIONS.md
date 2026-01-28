# Instructions: Block All Users Except Test Users

**Date**: 2026-01-18  
**Goal**: Restrict access so ONLY production test users (Amit Kumar Mandal, Ankita Surabhi) can access the site

---

## 🎯 Current Status

### Current Configuration (Code Defaults):
- `NEXT_PUBLIC_RESTRICT_ACCESS` = `false` (open access - all users can access)
- `BYPASS_PAYMENT_FOR_TEST_USERS` = `true` (test users bypass payment)
- **Problem**: All users can currently access the site

### Required Configuration:
- `NEXT_PUBLIC_RESTRICT_ACCESS` = `"true"` (block all users except test users)
- `BYPASS_PAYMENT_FOR_TEST_USERS` = `"true"` (keep test users bypassing payment)

---

## 🔧 How to Implement (Vercel Environment Variables)

### Step 1: Set Environment Variable in Vercel

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Add or update:
   ```
   Variable: NEXT_PUBLIC_RESTRICT_ACCESS
   Value: true
   Environment: Production (and Preview if needed)
   ```
3. Click **Save**

### Step 2: Verify Payment Bypass is Enabled

Ensure this is set (should already be set):
```
Variable: BYPASS_PAYMENT_FOR_TEST_USERS
Value: true
Environment: Production
```

### Step 3: Redeploy

- Vercel will auto-deploy on the next push, OR
- Go to **Deployments** → Click **...** → **Redeploy**

---

## 🔍 How It Works

### Access Restriction Logic (Code: `create-checkout/route.ts:105-136`)

```typescript
const restrictAccess = process.env.NEXT_PUBLIC_RESTRICT_ACCESS === "true";

// Test users ALWAYS bypass restriction
const isTestUserForAccess = isProdTestUser(input);

if (restrictAccess && input && !isTestUserForAccess) {
  // Block non-test users
  if (!isAllowedUser(input)) {
    return NextResponse.json({
      ok: false,
      error: "Access restricted for production testing - payment creation blocked",
      code: "ACCESS_RESTRICTED"
    }, { status: 403 });
  }
}
```

### What Happens:

1. **Test Users (Amit/Ankita)**:
   - ✅ Can access features (bypass restriction)
   - ✅ Can bypass payment (mock Stripe sessions)
   - ✅ Can generate reports

2. **All Other Users**:
   - ❌ **Blocked** at API level (403 error)
   - ❌ Cannot create payment sessions
   - ❌ Cannot generate reports

---

## ⚠️ Important Notes

### Current Limitations:

1. **API-Level Protection Only**:
   - Access restriction is checked in API routes (`create-checkout`, `generate-report`)
   - **UI routes** (`/ai-astrology/*` pages) may still be accessible
   - Users can navigate to pages but will be blocked when they try to create checkout/generate reports

2. **UI Route Protection**:
   - UI routes are **NOT** currently protected by access restriction
   - This means users can still see pages but will get errors when submitting forms
   - To fully block UI access, middleware or page-level checks would be needed

### Recommended Approach:

**Option 1: Keep API-Level Protection (Current)**
- ✅ Simple (just set env var)
- ⚠️ Users can see pages but get blocked on form submission
- ✅ Test users can still use the site normally

**Option 2: Add UI Route Protection (Better UX)**
- ✅ Users see "Access Restricted" page immediately
- ✅ Better user experience (no confusing errors)
- ⚠️ Requires code changes (middleware or page checks)

---

## 🧪 Testing After Configuration

### Test User Flow (Should Work):
1. Go to `/ai-astrology/input`
2. Enter birth details (Amit Kumar Mandal or Ankita Surabhi)
3. Click "Purchase" or "Generate Report"
4. ✅ Should see mock success page (payment bypass)

### Other User Flow (Should Be Blocked):
1. Go to `/ai-astrology/input`
2. Enter birth details (any other user)
3. Click "Purchase" or "Generate Report"
4. ❌ Should see 403 error: "Access restricted for production testing"

---

## 📊 Verification Checklist

After setting `NEXT_PUBLIC_RESTRICT_ACCESS=true`:

- [ ] Vercel environment variable set to `"true"`
- [ ] Redeploy completed
- [ ] Test users can still access (verify with Amit/Ankita)
- [ ] Other users get 403 error (verify with different user)
- [ ] Check production logs for `[ACCESS RESTRICTION - PAYMENT CREATION]` messages

---

## 🔄 To Revert (Open Access for All)

If you want to allow all users again:

1. Go to **Vercel Dashboard** → **Environment Variables**
2. Set `NEXT_PUBLIC_RESTRICT_ACCESS` = `false` (or delete it)
3. Redeploy

---

**Last Updated**: 2026-01-18 20:45  
**Status**: Ready to implement (just set env var in Vercel)

