# Fix Prokerala Authentication Still Failing

## Current Status

✅ **Credentials Detected:**
- `hasClientId: true`
- `hasClientSecret: true`
- `prokeralaConfigured: true`

❌ **Still Getting Error 602:** "Client authentication failed"

## Root Cause Analysis

The diagnostic shows credentials are detected, but authentication is still failing. This suggests:

1. **Credentials are invalid/revoked** - Most likely
2. **Deployment not redeployed** after adding credentials
3. **Credentials have extra spaces or formatting issues**

## Solution Steps

### Step 1: Verify Credentials in Prokerala Dashboard

1. Go to: https://www.prokerala.com/account/api.php
2. Log in to your Prokerala account
3. Check your API client status
4. Verify the Client ID and Secret match what's in Vercel:
   - Client ID: `4aedeb7a-2fd2-4cd4-a0ec-11b01a895749`
   - Client Secret: `06SCo9ssJB0nQWYbDWx7GXvnNAc0dqMhDrvIYZ6o`

### Step 2: Test Credentials Manually

Test if the credentials work:

```bash
curl -X POST https://api.prokerala.com/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials&client_id=4aedeb7a-2fd2-4cd4-a0ec-11b01a895749&client_secret=06SCo9ssJB0nQWYbDWx7GXvnNAc0dqMhDrvIYZ6o"
```

**Expected Response (Success):**
```json
{
  "access_token": "eyJhbGci...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

**If Error 602:**
- Credentials are invalid or revoked
- Need to create new credentials

### Step 3: Re-enter Credentials in Vercel

Even if they look correct, re-enter them:

1. Go to Vercel → **Settings** → **Environment Variables**
2. **Delete** both `PROKERALA_CLIENT_ID` and `PROKERALA_CLIENT_SECRET`
3. **Add them again** with exact values:
   - `PROKERALA_CLIENT_ID` = `4aedeb7a-2fd2-4cd4-a0ec-11b01a895749`
   - `PROKERALA_CLIENT_SECRET` = `06SCo9ssJB0nQWYbDWx7GXvnNAc0dqMhDrvIYZ6o`
4. Make sure **NO spaces** before or after
5. Check ✅ **Production** environment
6. Save

### Step 4: Force Redeploy

1. Go to **Deployments**
2. Click **three dots (⋯)** → **"Redeploy"**
3. **Uncheck** "Use existing Build Cache" (force fresh build)
4. Click **"Redeploy"**
5. Wait for completion

### Step 5: Test Again

After redeploying:
1. Visit: `https://your-app.vercel.app/api/astrology/config`
2. Should return: `{"ok":true,"data":{"configured":true}}`
3. Try generating a Kundli - should work

## If Credentials Are Invalid

If the manual curl test fails with error 602:

1. **Create New API Client:**
   - Go to: https://www.prokerala.com/account/api.php
   - Create a new API client
   - Get new Client ID and Secret

2. **Update Vercel:**
   - Replace old credentials with new ones
   - Redeploy

## Diagnostic Endpoint Fix

I've also fixed the diagnostic endpoint to use the proper authentication flow. After you commit and push this change, the diagnostic will test correctly.

## Next Steps

1. ✅ Test credentials manually with curl (above)
2. ✅ If curl fails, create new credentials
3. ✅ Re-enter credentials in Vercel (even if they look correct)
4. ✅ Force redeploy without cache
5. ✅ Test Kundli generation

---

**The most likely issue is that the credentials need to be verified in Prokerala dashboard or re-entered in Vercel to ensure no formatting issues.** 🔧
