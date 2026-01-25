# Email Separation Fix - User vs Internal Emails

## Issue

Previously, the same email template was being used for:
1. User acknowledgement email (sent to user)
2. Internal compliance notification (CC'd to compliance inboxes)

This meant users could see internal routing information and compliance teams received the same minimal email as users.

## Solution

**Separated into 2 distinct emails:**

### 1. User Acknowledgement Email (External-Facing, Minimal)
- **To:** User's email only
- **No CC** - completely separate from internal notifications
- **Content:** Minimal, user-friendly
  - Request type
  - Timestamp
  - Standard acknowledgement message
  - What happens next
  - Self-help resources
- **Purpose:** Confirm receipt, set expectations

### 2. Internal Compliance Notification (Internal-Only, Detailed)
- **To:** Primary compliance email (privacy@mindveda.net or legal@mindveda.net)
- **CC:** Additional compliance emails based on category
- **Content:** Detailed, internal-use only
  - Full submission details
  - Submission ID with Supabase link
  - IP address
  - User agent
  - Category and metadata
  - Quick action links (Reply, Supabase, Resend logs)
- **Purpose:** Enable compliance team triage and response

## Changes Made

### 1. Removed CC from User Acknowledgement
**Before:**
```typescript
await sendEmail({
  to: email,
  cc: ccRecipients, // ❌ Compliance emails CC'd to user
  ...
});
```

**After:**
```typescript
await sendEmail({
  to: email,
  // NO CC - external-facing only ✅
  ...
});
```

### 2. Enhanced Internal Notification with CC
**Before:**
```typescript
await sendEmail({
  to: ADMIN_EMAIL,
  // No CC, or separate CC email
  ...
});
```

**After:**
```typescript
await sendEmail({
  to: ADMIN_EMAIL,
  cc: internalCcRecipients, // ✅ CC based on category
  html: generateAdminNotificationEmail({
    ...,
    ipAddress: data.ipAddress, // ✅ Added
    userAgent: data.userAgent, // ✅ Added
  }),
  ...
});
```

### 3. Enhanced User Acknowledgement Template
- Added request type display
- Added timestamp
- Added "What happens next" section
- Removed internal routing information
- More user-friendly language

### 4. Enhanced Internal Notification Template
- Added submission ID with Supabase link
- Added IP address
- Added user agent
- Added category display
- Added quick action links
- Added "Internal Use Only" notice

## Email Flow

### User Acknowledgement Email
```
To: user@example.com
From: AstroSetu AI <no-reply@mindveda.net>
Reply-To: privacy@mindveda.net (or legal@mindveda.net for legal_notice)
CC: NONE
Subject: Regulatory Request Received – AstroSetu AI

Content:
- Minimal acknowledgement
- Request type
- Timestamp
- What happens next
- Self-help resources
```

### Internal Compliance Notification
```
To: privacy@mindveda.net (or legal@mindveda.net for legal_notice)
From: AstroSetu AI <no-reply@mindveda.net>
Reply-To: user@example.com
CC: legal@mindveda.net (for legal_notice) or privacy@mindveda.net (for privacy)
Subject: New Regulatory Request – [Category]

Content:
- Full submission details
- Submission ID with Supabase link
- IP address
- User agent
- Category and metadata
- Quick action links
```

## Benefits

✅ **User Experience:**
- Users see clean, minimal acknowledgement
- No internal routing information visible
- Professional, user-friendly language

✅ **Compliance Operations:**
- Internal team gets detailed information
- All data needed for triage in one email
- Quick links to Supabase and Resend logs
- IP and user agent for security/spam detection

✅ **Separation of Concerns:**
- External-facing vs internal-only content
- No risk of exposing internal details to users
- Better compliance audit trail

## Testing Checklist

After deployment:

- [ ] Submit regulatory request form
- [ ] User receives minimal acknowledgement email (no CC)
- [ ] Compliance inbox receives detailed internal notification
- [ ] CC recipients receive internal notification
- [ ] User email has no internal details
- [ ] Internal email has all details (ID, IP, user agent, links)
- [ ] No duplicate emails sent
- [ ] Reply-To is correct for each email type

## Expected Results

**User Email:**
- ✅ Clean, minimal content
- ✅ No CC recipients
- ✅ User-friendly language
- ✅ No internal routing info

**Internal Email:**
- ✅ Full submission details
- ✅ Submission ID with Supabase link
- ✅ IP address and user agent
- ✅ CC to appropriate compliance emails
- ✅ Quick action links

---

**Email separation complete. Users and compliance teams now receive appropriate emails.**

