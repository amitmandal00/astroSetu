# Category Display Fix - Match Form Labels

## Issue

The "Request Type" displayed in the email didn't match the regulatory request type selected in the form.

## Root Cause

The `categoryDisplay` formatting in email templates didn't match the exact form labels:
- Form: "Account Access Issue"
- Email: "Account Access Request" ❌

## Fix Applied

Updated all three `categoryDisplay` definitions to match form labels exactly:

### Form Labels (from contact/page.tsx):
- `data_deletion` → "Data Deletion Request"
- `account_access` → "Account Access Issue"
- `legal_notice` → "Legal Notice"
- `privacy_complaint` → "Privacy Complaint"

### Email Display (now matches):
- `data_deletion` → "Data Deletion Request" ✅
- `account_access` → "Account Access Issue" ✅ (was "Account Access Request")
- `legal_notice` → "Legal Notice" ✅
- `privacy_complaint` → "Privacy Complaint" ✅

## Locations Fixed

1. **Internal notification subject** (line ~341)
   - Used in: "New Regulatory Request – {categoryDisplay}"

2. **User acknowledgement email** (line ~698)
   - Used in: "Request Type: {categoryDisplay}"

3. **Admin notification email** (line ~776)
   - Used in: Category field display

## Verification

After deployment, test each category:
- [ ] Select "Data Deletion Request" → Email shows "Data Deletion Request"
- [ ] Select "Account Access Issue" → Email shows "Account Access Issue"
- [ ] Select "Legal Notice" → Email shows "Legal Notice"
- [ ] Select "Privacy Complaint" → Email shows "Privacy Complaint"

---

**All category displays now match form labels exactly.**

