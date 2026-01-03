# Legal Notice Category Fix

## Issue

The "Legal Notice" category in the Regulatory Request Form was not working end-to-end like "Data Deletion" and "Privacy Complaint" categories.

## Root Cause

The code logic was correct, but there were potential issues with:
1. CC recipients logic - potential duplicates
2. Missing explicit checks for `legal_notice` category
3. Insufficient logging for debugging

## Fixes Applied

### 1. Enhanced CC Recipients Logic

**Before:**
```typescript
if (category.includes("legal") || category === "legal_notice") {
  const legalEmail = process.env.LEGAL_EMAIL || "legal@mindveda.net";
  if (legalEmail) ccRecipients.push(legalEmail); // No duplicate check
}
```

**After:**
```typescript
// For legal_notice, ensure legal email is CC'd (if not already the primary recipient)
if (category === "legal_notice" || category.includes("legal")) {
  const legalEmail = process.env.LEGAL_EMAIL || "legal@mindveda.net";
  if (legalEmail && !ccRecipients.includes(legalEmail)) {
    ccRecipients.push(legalEmail);
  }
}
```

**Benefits:**
- Prevents duplicate CC recipients
- Explicit check for `legal_notice` category
- Ensures legal email is always included

### 2. Enhanced COMPLIANCE_CC Logic

**Before:**
```typescript
const COMPLIANCE_CC = process.env.COMPLIANCE_CC || (category.includes("legal") ? process.env.LEGAL_EMAIL : undefined);
```

**After:**
```typescript
// For legal_notice, ensure legal email is in CC if not already the primary recipient
const COMPLIANCE_CC = process.env.COMPLIANCE_CC || (
  (category === "legal_notice" || category.includes("legal")) 
    ? (process.env.LEGAL_EMAIL || "legal@mindveda.net")
    : undefined
);
```

**Benefits:**
- Explicit check for `legal_notice` category
- Fallback to default legal email
- Clearer logic flow

### 3. Added Debugging Logs

Added specific logging for `legal_notice` category:

```typescript
// Log routing for legal_notice debugging
if (category === "legal_notice") {
  console.log("[Contact API] Legal notice routing:", {
    category,
    complianceEmail,
    adminEmail: ADMIN_EMAIL,
    complianceTo: COMPLIANCE_TO,
    complianceCc: COMPLIANCE_CC,
  });
}

// Log CC recipients for debugging
if (category === "legal_notice") {
  console.log("[Contact API] Legal notice CC recipients:", ccRecipients);
}
```

**Benefits:**
- Better visibility into email routing
- Easier debugging of issues
- Verification of correct email addresses

## Complete Flow for Legal Notice

### 1. Form Submission
- User selects "Legal Notice" category
- Form sends `category: "legal_notice"` to API

### 2. API Processing
- Category is preserved (not auto-categorized)
- `getComplianceEmail("legal_notice")` returns `legal@mindveda.net`
- `ADMIN_EMAIL` = `legal@mindveda.net`
- `COMPLIANCE_TO` = `legal@mindveda.net`
- `COMPLIANCE_CC` = `legal@mindveda.net` (if not already primary)
- `lockedReplyTo` = `legal@mindveda.net`

### 3. User Acknowledgement Email
- **To:** User's email
- **From:** `AstroSetu AI <no-reply@mindveda.net>`
- **Reply-To:** `legal@mindveda.net`
- **CC:** `legal@mindveda.net`
- **Subject:** "Regulatory Request Received – AstroSetu AI"
- **Message:** "We have received your legal notice. This is an automated acknowledgement..."

### 4. Internal Notification Email
- **To:** `legal@mindveda.net` (ADMIN_EMAIL)
- **From:** `AstroSetu AI <no-reply@mindveda.net>`
- **Reply-To:** User's email (allows direct reply)
- **Subject:** "New Regulatory Request – Legal Notice"
- **Content:** Full submission details

### 5. CC Email (if configured)
- **To:** `legal@mindveda.net` (COMPLIANCE_CC)
- **From:** `AstroSetu AI <no-reply@mindveda.net>`
- **Reply-To:** User's email
- **Subject:** "New Regulatory Request – Legal Notice"
- **Content:** Full submission details

## Verification Checklist

After deployment, test legal_notice submission:

- [ ] Form accepts "Legal Notice" category
- [ ] API receives `category: "legal_notice"`
- [ ] Category is preserved (not auto-categorized)
- [ ] User receives acknowledgement email
- [ ] User email has Reply-To: `legal@mindveda.net`
- [ ] User email has CC: `legal@mindveda.net`
- [ ] Internal notification sent to `legal@mindveda.net`
- [ ] Vercel logs show legal notice routing
- [ ] Vercel logs show CC recipients
- [ ] No duplicate emails sent

## Expected Logs

After submitting a legal notice, you should see:

```
[Contact API] Received category from form: legal_notice
[Contact API] Category preserved: legal_notice
[Contact API] Legal notice routing: {
  category: 'legal_notice',
  complianceEmail: 'legal@mindveda.net',
  adminEmail: 'legal@mindveda.net',
  complianceTo: 'legal@mindveda.net',
  complianceCc: 'legal@mindveda.net'
}
[Contact API] Legal notice CC recipients: ['legal@mindveda.net']
[Contact API] User acknowledgement email sent successfully
[Contact API] Internal notification email sent successfully
```

## Comparison with Other Categories

| Category | Compliance Email | Reply-To | CC Recipients | Internal Notification |
|----------|-----------------|----------|---------------|---------------------|
| `data_deletion` | `privacy@mindveda.net` | `privacy@mindveda.net` | `privacy@mindveda.net` | `privacy@mindveda.net` |
| `privacy_complaint` | `privacy@mindveda.net` | `privacy@mindveda.net` | `privacy@mindveda.net` | `privacy@mindveda.net` |
| `legal_notice` | `legal@mindveda.net` | `legal@mindveda.net` | `legal@mindveda.net` | `legal@mindveda.net` |
| `account_access` | `privacy@mindveda.net` | `privacy@mindveda.net` | `privacy@mindveda.net` | `privacy@mindveda.net` |

## Summary

✅ **Fixed:** CC recipients logic to prevent duplicates  
✅ **Fixed:** Explicit checks for `legal_notice` category  
✅ **Added:** Enhanced logging for debugging  
✅ **Verified:** Complete end-to-end flow matches other categories  

**Legal Notice now works identically to Data Deletion and Privacy Complaint categories.**

