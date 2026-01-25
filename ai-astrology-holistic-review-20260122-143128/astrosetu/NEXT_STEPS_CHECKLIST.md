# Next Steps Checklist - Consent Logging Integration

## ✅ Completed

1. ✅ Consent logging API route created (`/api/consent`)
2. ✅ Client helper functions created (`src/lib/consentLogging.ts`)
3. ✅ Legal version management created (`src/lib/legalVersions.ts`)
4. ✅ SQL schema created (`supabase-consent-logs.sql`)
5. ✅ Consent logging integrated in login/register flow
6. ✅ Setup instructions created (`CONSENT_LOGGING_SETUP.md`)

---

## 📋 Remaining Steps (Manual Setup Required)

### Step 1: Run SQL Script in Supabase ⏳

**Action Required:**
1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `supabase-consent-logs.sql`
3. Paste and run in SQL Editor
4. Verify `consent_logs` table exists

**Status:** ⏳ Pending (requires Supabase access)

---

### Step 2: Set Environment Variable ⏳

**For Local Development:**
Add to `.env.local`:
```bash
CONSENT_LOG_SALT=<generate-with-openssl-rand-hex-32>
```

**For Vercel Production:**
1. Go to Vercel Dashboard → Project → Settings → Environment Variables
2. Add: `CONSENT_LOG_SALT` = `<random-secret>`
3. Apply to: Production, Preview, Development

**Generate Secret:**
```bash
openssl rand -hex 32
# Or
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Status:** ⏳ Pending (requires environment variable setup)

---

### Step 3: Test Consent Logging ⏳

**After Steps 1 & 2 are complete:**

1. **Register a new user** (or login)
2. **Check Supabase Table Editor** → `consent_logs`
3. **Verify entries exist** with:
   - `consent_type`: "terms" or "privacy"
   - `granted`: true
   - `document_version`: "2024-12-26"
   - `session_id`: (UUID)

**Status:** ⏳ Pending (blocked by Steps 1 & 2)

---

### Step 4: Verify API Endpoint (Optional) ⏳

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

Expected: `{"ok": true}`

**Status:** ⏳ Optional verification step

---

## 📝 Integration Details

### How It Works

1. **User checks Terms checkbox** → Logs terms acceptance immediately
2. **User checks Privacy checkbox** → Logs privacy acceptance immediately
3. **On form submit** → Consent has already been logged

### Code Integration Points

✅ **Login/Register Page** (`src/app/login/page.tsx`):
- Terms checkbox: Logs when checked
- Privacy checkbox: Logs when checked
- Both checkboxes must be checked to submit

### Future Integration Points (If Needed)

If you need consent logging elsewhere:

1. **Cookie Preferences Modal**:
   ```typescript
   import { logCookiePreferences } from "@/lib/consentLogging";
   import { getLegalVersion } from "@/lib/legalVersions";
   
   await logCookiePreferences(true, getLegalVersion("cookies"), {
     essential: true,
     analytics: true,
     marketing: false
   });
   ```

2. **AI Processing Consent** (if added):
   ```typescript
   import { logAIConsent } from "@/lib/consentLogging";
   import { getLegalVersion } from "@/lib/legalVersions";
   
   await logAIConsent(true, getLegalVersion("privacy"));
   ```

---

## 🔍 Verification Checklist

After completing Steps 1-2, verify:

- [ ] `consent_logs` table exists in Supabase
- [ ] `CONSENT_LOG_SALT` environment variable is set
- [ ] Register/login with checkboxes checked
- [ ] Check Supabase `consent_logs` table for new entries
- [ ] Verify `session_id` is populated
- [ ] Verify `ip_hash` and `user_agent_hash` are populated
- [ ] Verify `document_version` matches `LEGAL_VERSIONS` in code

---

## 🚨 Troubleshooting

### No logs appearing?
- ✅ Check Supabase table exists
- ✅ Check `CONSENT_LOG_SALT` is set
- ✅ Check browser console for errors
- ✅ Verify API route is accessible
- ✅ Check Supabase RLS policies

### API returns 500 error?
- ✅ Check `CONSENT_LOG_SALT` environment variable
- ✅ Check Supabase connection
- ✅ Check server logs for detailed errors
- ✅ Verify service role key is configured

### RLS Policy Errors?
- ✅ Verify SQL script ran completely
- ✅ Check RLS is enabled on table
- ✅ Verify service role key is used (not anon key)

---

## 📊 Next Steps After Setup

Once consent logging is working:

1. **Monitor logs** - Check `consent_logs` table periodically
2. **Export for audits** - Use SQL queries from setup guide
3. **Update versions** - When legal docs change, update `LEGAL_VERSIONS`
4. **Review logs** - Periodically review consent patterns

---

**Status:** ✅ Code integration complete, ⏳ Manual setup steps remaining

**Last Updated:** December 26, 2024

