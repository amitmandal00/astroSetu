# Consent Logging Setup Instructions

This guide will help you set up the consent logging infrastructure for legal compliance.

---

## Step 1: Create Supabase Table

1. **Open Supabase Dashboard**
   - Go to your project: https://supabase.com/dashboard
   - Navigate to **SQL Editor**

2. **Run the SQL Script**
   - Open the file: `supabase-consent-logs.sql`
   - Copy all contents
   - Paste into SQL Editor
   - Click **Run** or press `Ctrl/Cmd + Enter`

3. **Verify Table Created**
   - Go to **Table Editor**
   - Look for `consent_logs` table
   - Verify it has the following columns:
     - `id`, `created_at`
     - `user_id`, `session_id`
     - `source`, `consent_type`, `granted`
     - `document_version`, `document_url`
     - `ip_hash`, `user_agent_hash`
     - `metadata`

---

## Step 2: Set Environment Variables

### For Local Development

Add to `.env.local`:

```bash
# Consent Logging Salt (generate a random secret)
CONSENT_LOG_SALT=<your-random-secret>
```

**Generate a random secret:**
```bash
# Using OpenSSL
openssl rand -hex 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### For Vercel Production

1. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Add new variable:
   - **Key:** `CONSENT_LOG_SALT`
   - **Value:** (paste the generated secret)
   - **Environment:** Production, Preview, Development (all)
3. Click **Save**

---

## Step 3: Integrate Consent Logging in Code

Consent logging is already integrated in the login/register flow. Here's what happens:

### Automatic Integration

When users register or login with privacy consent:
- Terms acceptance is logged (if checkbox checked)
- Privacy acceptance is logged (if checkbox checked)

### Manual Integration (if needed elsewhere)

```typescript
import { logTermsAcceptance, logPrivacyAcceptance, logCookiePreferences } from "@/lib/consentLogging";
import { getLegalVersion, getLegalUrl } from "@/lib/legalVersions";

// Log terms acceptance
await logTermsAcceptance(getLegalVersion("terms"));

// Log privacy acceptance
await logPrivacyAcceptance(getLegalVersion("privacy"));

// Log cookie preferences
await logCookiePreferences(true, getLegalVersion("cookies"), {
  essential: true,
  analytics: true,
  marketing: false
});
```

---

## Step 4: Verify Setup

### Test Consent Logging

1. **Register a new user** (or login)
2. **Check Supabase Table**
   - Go to **Table Editor** → `consent_logs`
   - You should see new entries with:
     - `consent_type`: "terms" or "privacy"
     - `granted`: true
     - `document_version`: "2024-12-26"
     - `session_id`: (a UUID)

### Verify API Endpoint

Test the API directly:

```bash
curl -X POST http://localhost:3000/api/consent \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-session-123",
    "consentType": "terms",
    "granted": true,
    "documentVersion": "2024-12-26",
    "documentUrl": "/terms"
  }'
```

Expected response: `{"ok": true}`

---

## Step 5: Admin Export Query (Optional)

Create a view or query for exporting consent logs for audits:

```sql
-- Example: Get all consent logs for a user
SELECT 
  id,
  created_at,
  consent_type,
  granted,
  document_version,
  document_url,
  source
FROM consent_logs
WHERE user_id = 'user-uuid-here'
ORDER BY created_at DESC;

-- Example: Get consent logs by type
SELECT 
  consent_type,
  COUNT(*) as total,
  SUM(CASE WHEN granted THEN 1 ELSE 0 END) as granted_count,
  SUM(CASE WHEN NOT granted THEN 1 ELSE 0 END) as denied_count
FROM consent_logs
GROUP BY consent_type;

-- Example: Get latest consent for each user by type
SELECT DISTINCT ON (user_id, consent_type)
  user_id,
  consent_type,
  granted,
  document_version,
  created_at
FROM consent_logs
WHERE user_id IS NOT NULL
ORDER BY user_id, consent_type, created_at DESC;
```

---

## Troubleshooting

### Issue: Table doesn't exist
**Solution:** Make sure you ran the SQL script in Supabase SQL Editor. Check for any errors in the execution.

### Issue: API returns 500 error
**Solution:** 
- Check that `CONSENT_LOG_SALT` is set in environment variables
- Verify Supabase connection is working
- Check server logs for detailed error messages

### Issue: No logs appearing
**Solution:**
- Verify the table exists and has correct structure
- Check that consent logging is being called (check browser console for errors)
- Verify user is authenticated (if using user_id)
- Check RLS policies allow service role to insert

### Issue: RLS Policy Errors
**Solution:** The SQL script creates RLS policies. If you see permission errors:
- Verify you're using service role key (not anon key) in API routes
- Check RLS policies in Supabase Dashboard → Authentication → Policies

---

## Security Notes

1. **CONSENT_LOG_SALT**: Keep this secret secure. Do not commit to git.
2. **IP/User-Agent Hashing**: IP addresses and user agents are hashed (HMAC-SHA256) for privacy.
3. **RLS Policies**: Only service role can insert logs. Users can read their own logs.
4. **Service Role Key**: Only use service role key server-side, never expose to client.

---

## Maintenance

### Updating Legal Document Versions

When legal documents are updated:

1. Update version in `src/lib/legalVersions.ts`:
```typescript
export const LEGAL_VERSIONS = {
  terms: "2024-12-27", // Updated version
  privacy: "2024-12-26",
  // ...
};
```

2. The system will automatically log new version when users accept updated documents.

### Exporting Logs for Audits

Use the SQL queries above or create a simple admin interface to export consent logs for compliance audits.

---

**Status:** ✅ Ready to use after SQL script is executed and environment variable is set.

