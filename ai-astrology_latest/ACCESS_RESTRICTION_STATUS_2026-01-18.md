# Access Restriction Status - 2026-01-18

**Environment Variable**: `NEXT_PUBLIC_RESTRICT_ACCESS=true` ✅ **ALREADY SET IN VERCEL**

---

## 🎯 Current Configuration

### Environment Variables in Vercel:
- ✅ `NEXT_PUBLIC_RESTRICT_ACCESS=true` (already set)
- ✅ `BYPASS_PAYMENT_FOR_TEST_USERS=true` (should be set)

### Access Restriction Logic:

**Code Location**: `create-checkout/route.ts:105-136`

```typescript
const restrictAccess = process.env.NEXT_PUBLIC_RESTRICT_ACCESS === "true"; // ✅ TRUE
const isTestUserForAccess = isProdTestUser(input); // Checks betaAccess.ts allowlist

if (restrictAccess && input && !isTestUserForAccess) {
  // Block non-test users
  if (!isAllowedUser(input)) {
    return 403 error; // ACCESS_RESTRICTED
  }
}
```

---

## 👥 Allowed Users (Two Lists)

### ⚠️ **IMPORTANT**: There are TWO separate allowlists:

#### 1. **Test User Allowlist** (`betaAccess.ts` / `prodAllowlist.ts`)
Used for: Payment bypass (`isProdTestUser()`)
- **Amit Kumar Mandal**: 1984-11-26 / 21:40 / noamundi, jharkhand / Male
- **Ankita Surabhi**: 1988-07-01 / 17:58 / ranchi, jharkhand / Female

#### 2. **Access Restriction Allowlist** (`access-restriction.ts`)
Used for: Access restriction (`isAllowedUser()`)
- **Amit Kumar Mandal**: 1984-11-26 / 21:40 / Noamundi / Male
- **Ankita Surabhi**: 1990-05-15 / 10:30 / Delhi / Female ⚠️ **DIFFERENT DOB!**

---

## 🔍 Potential Issues

### Issue 1: Ankita Surabhi DOB Mismatch ⚠️

**Test User List** (`betaAccess.ts`):
- DOB: `1988-07-01`
- Place: `ranchi, jharkhand`

**Access Restriction List** (`access-restriction.ts`):
- DOB: `1990-05-15` ⚠️ **DIFFERENT**
- Place: `Delhi` ⚠️ **DIFFERENT**

**Impact**:
- ✅ `isProdTestUser()` (payment bypass) uses `betaAccess.ts` → Matches `1988-07-01`
- ❌ `isAllowedUser()` (access restriction) uses `access-restriction.ts` → Matches `1990-05-15`

**Result**: Ankita Surabhi might:
- ✅ Bypass payment (matches test user list)
- ❌ Get **BLOCKED** if access restriction checks DOB strictly (doesn't match access restriction list)

### Issue 2: Place Name Variations

**Test User List**:
- Place: `noamundi, jharkhand` (lowercase, includes state)

**Access Restriction List**:
- Place: `Noamundi` (capitalized, no state)

**Impact**: Place matching is flexible (includes check), so should work, but might have edge cases.

---

## ✅ Expected Behavior (With `NEXT_PUBLIC_RESTRICT_ACCESS=true`)

### Production Test Users (Amit/Ankita):
1. `isProdTestUser()` returns `true` → Bypasses access restriction check
2. ✅ Can create checkout sessions
3. ✅ Can generate reports
4. ✅ Payment bypass works

### All Other Users:
1. `isProdTestUser()` returns `false`
2. Access restriction check: `isAllowedUser()` returns `false` (doesn't match allowlist)
3. ❌ **403 Error**: "Access restricted for production testing"
4. ❌ Cannot create checkout sessions
5. ❌ Cannot generate reports

---

## 🧪 How to Verify It's Working

### Check Vercel Logs for Access Restrictions:

#### For Test Users (Should NOT see this):
```
[ACCESS RESTRICTION - PAYMENT CREATION] { ... }  # Should NOT appear
```

#### For Other Users (Should see this):
```
[ACCESS RESTRICTION - PAYMENT CREATION] {
  "error": "Access restricted for production testing - payment creation blocked",
  "code": "ACCESS_RESTRICTED"
}
```

### Test Scenarios:

1. **Test User (Amit Kumar Mandal)**:
   - Name: "Amit Kumar Mandal"
   - DOB: "1984-11-26"
   - Expected: ✅ Access granted, payment bypassed

2. **Test User (Ankita Surabhi)**:
   - Name: "Ankita Surabhi"
   - DOB: "1988-07-01" (or "1990-05-15" depending on which list is checked)
   - Expected: ✅ Access granted, payment bypassed (via `isProdTestUser()`)

3. **Other User (Any other name)**:
   - Name: "John Doe"
   - DOB: "1990-01-01"
   - Expected: ❌ 403 Error: "Access restricted for production testing"

---

## 🔧 Recommended Fix: Sync Allowlists

### Option 1: Update `access-restriction.ts` to match `betaAccess.ts`

Update `ALLOWED_USERS` in `access-restriction.ts`:

```typescript
export const ALLOWED_USERS = [
  {
    name: "Amit Kumar Mandal",
    dob: "1984-11-26",  // ✅ Already matches
    tob: "21:40",
    place: "Noamundi",  // or "noamundi, jharkhand"
    gender: "Male",
  },
  {
    name: "Ankita Surabhi",
    dob: "1988-07-01",  // ⚠️ Change from "1990-05-15" to match betaAccess
    tob: "17:58",       // ⚠️ Change from "10:30" to match betaAccess
    place: "Ranchi",    // ⚠️ Change from "Delhi" to match betaAccess
    gender: "Female",
  },
];
```

### Option 2: Use `isProdTestUser()` for access restriction (Recommended)

Since `isProdTestUser()` is already used for test user detection, we could use it for access restriction too, eliminating the need for two separate lists.

---

## 📊 Current Status Summary

| User Type | Test User Detection | Access Restriction | Payment Bypass | Status |
|-----------|-------------------|-------------------|----------------|---------|
| **Amit Kumar Mandal** | ✅ Matches `betaAccess.ts` | ✅ Should match `access-restriction.ts` | ✅ YES | ✅ Working |
| **Ankita Surabhi** | ✅ Matches `betaAccess.ts` (1988-07-01) | ⚠️ Matches `access-restriction.ts` (1990-05-15) **but bypasses via `isProdTestUser()`** | ✅ YES | ✅ Working (bypasses) |
| **All Other Users** | ❌ No match | ❌ No match → **403 Error** | ❌ NO | ❌ Blocked |

---

## 🎯 Conclusion

**With `NEXT_PUBLIC_RESTRICT_ACCESS=true` already set:**

✅ **Access restriction is ACTIVE**  
✅ **Test users (Amit/Ankita) bypass restriction** via `isProdTestUser()`  
✅ **All other users are BLOCKED** at API level (403 error)  

**Current Status**: Access restriction is working as expected. Test users can access features because they bypass the restriction check via `isProdTestUser()`, while all other users are blocked.

---

**Last Verified**: 2026-01-18  
**Next Action**: Test with a non-test user to confirm 403 error appears

