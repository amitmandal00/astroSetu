# Production Status - Test Users vs All Other Users
**Date**: 2026-01-18  
**Last Updated**: 2026-01-18 20:40  
**Build**: `00ae3ba` (stable-2026-01-18)

---

## 🎯 Current Production Status (Based on Code Analysis)

### 📋 Environment Variables Configuration

**⚠️ IMPORTANT**: Actual production status depends on Vercel environment variables. This document shows code defaults.

| Variable | Default (Code) | Production (Vercel) | Meaning |
|----------|---------------|---------------------|---------|
| `BYPASS_PAYMENT_FOR_TEST_USERS` | `true` (unless `"false"`) | **UNKNOWN** - Check Vercel | Test users bypass payment |
| `NEXT_PUBLIC_RESTRICT_ACCESS` | `false` (unless `"true"`) | **UNKNOWN** - Check Vercel | Restricts access to test users only |
| `NEXT_PUBLIC_PRIVATE_BETA` | Not used in UI routes | **UNKNOWN** - Check Vercel | Private beta gating (API only) |

---

## 👥 Production Test Users (Amit Kumar Mandal, Ankita Surabhi)

### ✅ Access Status
- **Can Access Features**: ✅ YES
  - `restrictAccess` defaults to `false` (code line: `create-checkout/route.ts:105`)
  - Test users bypass restriction even if `restrictAccess = true` (code line: `create-checkout/route.ts:110-136`)

### 💳 Payment Status
- **Bypass Payment**: ✅ YES
  - `bypassPaymentForTestUsers` defaults to `true` (code line: `create-checkout/route.ts:100`)
  - Logic: `process.env.BYPASS_PAYMENT_FOR_TEST_USERS !== "false"`
  - **Meaning**: Test users bypass payment **UNLESS** explicitly set to `"false"`

### 📄 Report Generation
- **Can Generate Reports**: ✅ YES
  - Test user detection via `isProdTestUser()` (code line: `create-checkout/route.ts:85`)
  - Partial matching fix allows matching with name + DOB (commit `00ae3ba`)
  - Mock Stripe sessions returned (no real payment)

### 🔒 Security
- **Test User Detection**: ✅ ACTIVE
  - Uses `matchAllowlist()` from `betaAccess.ts`
  - Required: name + DOB (minimum)
  - Optional: time, gender, place (checked if provided)

---

## 🌐 All Other Production Users

### ✅ Access Status
- **Can Access Features**: ✅ YES (by default)
  - `restrictAccess` defaults to `false`
  - **BUT**: If `NEXT_PUBLIC_RESTRICT_ACCESS="true"` is set in Vercel, access is blocked
  - Check Vercel logs for `[ACCESS RESTRICTION - PAYMENT CREATION]` messages

### 💳 Payment Status
- **Bypass Payment**: ❌ NO
  - Not test users, so `isProdTestUser()` returns `false`
  - Must go through **real Stripe checkout**
  - Real payment processing (not mock sessions)

### 📄 Report Generation
- **Can Generate Reports**: ✅ YES
  - But must pay first (Stripe checkout required)
  - Subject to `restrictAccess` if enabled

### 🔒 Security
- **Test User Detection**: ❌ NOT DETECTED
  - Do not match allowlist (Amit Kumar Mandal, Ankita Surabhi only)
  - Normal user flow applies

---

## 📊 Comparison Table

| Feature | Test Users | All Other Users |
|---------|-----------|------------------|
| **Access to Features** | ✅ YES (always) | ✅ YES (if `restrictAccess=false`) |
| **Payment Bypass** | ✅ YES (default) | ❌ NO (real Stripe) |
| **Report Generation** | ✅ YES (mock) | ✅ YES (after payment) |
| **Test User Detection** | ✅ YES | ❌ NO |
| **Mock Stripe Sessions** | ✅ YES | ❌ NO |
| **Real Payment Required** | ❌ NO | ✅ YES |

---

## 🔍 How to Verify Production Status

### 1. Check Vercel Environment Variables

```bash
# Via Vercel Dashboard
# Project Settings → Environment Variables

# Check these variables:
- BYPASS_PAYMENT_FOR_TEST_USERS (should be "true" for test users to bypass)
- NEXT_PUBLIC_RESTRICT_ACCESS (should be "false" for open access)
- NEXT_PUBLIC_PRIVATE_BETA (optional, for private beta gating)
```

### 2. Check Production Logs

#### For Test Users:
```
[TEST_USER_CHECK] Result: { isTestUser: true, ... }
[PROD_ALLOWLIST] Matching input: { name: "amit kumar mandal", ... }
[DEMO MODE] Returning mock checkout session (test user: true, ...) - Bypassing Stripe
```

#### For Other Users:
```
[TEST_USER_CHECK] Result: { isTestUser: false, ... }
[CHECKOUT CREATION] { ... } (normal Stripe checkout)
```

#### For Access Restrictions:
```
[ACCESS RESTRICTION - PAYMENT CREATION] { error: "Access restricted...", ... }
```

### 3. Test User Flows

#### Test User Flow (Amit/Ankita):
1. Enter birth details (name + DOB minimum)
2. Click "Purchase" → Should see **mock success page** (not Stripe)
3. Check logs: `[DEMO MODE] ... Bypassing Stripe`

#### Other User Flow:
1. Enter birth details
2. Click "Purchase" → Should see **Stripe checkout page**
3. Check logs: `[CHECKOUT CREATION]` (no `[DEMO MODE]`)

---

## ⚙️ Configuration Options

### Scenario 1: Open Access + Test User Payment Bypass (Current Default)

```env
BYPASS_PAYMENT_FOR_TEST_USERS=true
NEXT_PUBLIC_RESTRICT_ACCESS=false
```

**Result**:
- ✅ All users can access features
- ✅ Test users bypass payment (mock sessions)
- ✅ Other users go through Stripe (real payment)

### Scenario 2: Restricted Access + Test User Payment Bypass

```env
BYPASS_PAYMENT_FOR_TEST_USERS=true
NEXT_PUBLIC_RESTRICT_ACCESS=true
```

**Result**:
- ✅ Test users can access features + bypass payment
- ❌ Other users **blocked** (403 error)
- ⚠️ **NOT suitable for production launch**

### Scenario 3: Open Access + Real Payments for All

```env
BYPASS_PAYMENT_FOR_TEST_USERS=false
NEXT_PUBLIC_RESTRICT_ACCESS=false
```

**Result**:
- ✅ All users can access features
- ✅ All users go through Stripe (real payment)
- ⚠️ Test users will see real Stripe checkout (test mode)

### Scenario 4: Restricted Access + Real Payments for All

```env
BYPASS_PAYMENT_FOR_TEST_USERS=false
NEXT_PUBLIC_RESTRICT_ACCESS=true
```

**Result**:
- ✅ Test users can access features + go through Stripe (test mode)
- ❌ Other users **blocked** (403 error)
- ⚠️ **NOT suitable for production launch**

---

## 🚨 Important Notes

### ⚠️ Current Stable Build Status

**Build**: `00ae3ba` (stable-2026-01-18)  
**Status**: ✅ STABLE - Tested with production test users

**Limitations**:
- ⚠️ Payment bypass enabled for test users (mock Stripe sessions)
- ⚠️ Not suitable for real customer payments
- ⚠️ Mock report generation (no actual AI/astrology API calls)

### 🔐 Security Considerations

1. **Test User Detection**:
   - Uses `matchAllowlist()` with partial matching (name + DOB required)
   - Optional fields (time, gender, place) only checked if provided
   - **Secure**: Only 2 users match allowlist (Amit Kumar Mandal, Ankita Surabhi)

2. **Access Restriction**:
   - Controlled by `NEXT_PUBLIC_RESTRICT_ACCESS`
   - Test users **ALWAYS** bypass restriction (code line: `create-checkout/route.ts:110`)
   - Other users blocked if `restrictAccess = true`

3. **Payment Bypass**:
   - Controlled by `BYPASS_PAYMENT_FOR_TEST_USERS`
   - Only affects test users (determined by `isProdTestUser()`)
   - Other users always go through Stripe

---

## 📝 Recommended Production Configuration

### For Production Launch (Real Payments):

```env
# Disable payment bypass for test users (test with Stripe test mode)
BYPASS_PAYMENT_FOR_TEST_USERS=false

# Open access for all users
NEXT_PUBLIC_RESTRICT_ACCESS=false

# Optional: Enable private beta if needed
NEXT_PUBLIC_PRIVATE_BETA=false
```

### For Pre-Production Testing (Current Setup):

```env
# Enable payment bypass for test users (mock sessions)
BYPASS_PAYMENT_FOR_TEST_USERS=true

# Open access for testing
NEXT_PUBLIC_RESTRICT_ACCESS=false
```

---

## 🔄 How to Change Status

### To Enable Real Payments for Test Users:

1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Set `BYPASS_PAYMENT_FOR_TEST_USERS=false`
3. Redeploy (or wait for auto-deploy)
4. Test users will now see Stripe checkout (test mode)

### To Restrict Access to Test Users Only:

1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Set `NEXT_PUBLIC_RESTRICT_ACCESS=true`
3. Redeploy (or wait for auto-deploy)
4. Other users will see 403 error

---

**Last Verified**: 2026-01-18 20:40  
**Next Verification**: Check Vercel environment variables for actual production status

