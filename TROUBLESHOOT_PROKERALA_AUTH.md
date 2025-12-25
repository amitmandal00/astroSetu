# Troubleshoot Prokerala Authentication Error

## Issue

Credentials are set in Vercel, but still getting:
- Error 602: "Client authentication failed"
- 400 Bad Request on `/api/astrology/kundli`

## Common Causes & Solutions

### 1. Deployment Not Redeployed After Adding Variables

**Problem:** Environment variables only apply to NEW deployments.

**Solution:**
1. Go to Vercel → **Deployments**
2. Click **three dots (⋯)** on latest deployment
3. Click **"Redeploy"**
4. Wait for deployment to complete
5. Test again

### 2. Wrong Environment Scope

**Problem:** Variables set for "Preview" but not "Production" (or vice versa).

**Solution:**
1. Go to Vercel → **Settings** → **Environment Variables**
2. Check each variable:
   - `PROKERALA_CLIENT_ID` - Should have ✅ **Production** checked
   - `PROKERALA_CLIENT_SECRET` - Should have ✅ **Production** checked
3. If not checked, edit and check "Production"
4. Redeploy

### 3. Extra Spaces or Formatting Issues

**Problem:** Values might have leading/trailing spaces or hidden characters.

**Solution:**
1. Go to Vercel → **Settings** → **Environment Variables**
2. Edit each variable
3. **Delete the value completely**
4. **Re-type or copy-paste** the exact value:
   - `PROKERALA_CLIENT_ID`: `4aedeb7a-2fd2-4cd4-a0ec-11b01a895749`
   - `PROKERALA_CLIENT_SECRET`: `06SCo9ssJB0nQWYbDWx7GXvnNAc0dqMhDrvIYZ6o`
5. Make sure NO spaces before or after
6. Save and redeploy

### 4. Credentials Revoked or Invalid

**Problem:** The credentials might have been revoked or are incorrect.

**Solution:**
1. Verify credentials are still valid:
   - Go to: https://www.prokerala.com/account/api.php
   - Check if your API client is still active
   - Verify the Client ID and Secret match
2. If needed, create new credentials and update in Vercel

### 5. Variables Not Accessible at Runtime

**Problem:** Serverless functions might not have access to environment variables.

**Solution:**
1. Check if variables are visible in build logs:
   - Go to Vercel → **Deployments** → Click on deployment
   - Check **Build Logs** - should NOT show the actual values (for security)
   - But should show they're being used
2. Test with a diagnostic endpoint:
   - Visit: `https://your-app.vercel.app/api/astrology/diagnostic`
   - Should show if credentials are detected

### 6. Case Sensitivity

**Problem:** Variable names are case-sensitive.

**Solution:**
Verify exact variable names (case-sensitive):
- ✅ `PROKERALA_CLIENT_ID` (all uppercase)
- ✅ `PROKERALA_CLIENT_SECRET` (all uppercase)
- ❌ `prokerala_client_id` (wrong case)
- ❌ `PROKERALA_CLIENT_ID ` (trailing space)

## Diagnostic Steps

### Step 1: Verify Variables Are Set

1. Go to Vercel → **Settings** → **Environment Variables**
2. Verify you see:
   - `PROKERALA_CLIENT_ID` with value starting with `4aedeb7a...`
   - `PROKERALA_CLIENT_SECRET` with value starting with `06SCo9ss...`
3. Check environment scope: Both should have ✅ **Production**

### Step 2: Test Configuration Endpoint

Visit: `https://your-app.vercel.app/api/astrology/config`

**Expected if working:**
```json
{
  "ok": true,
  "data": {
    "configured": true
  }
}
```

**If not working:**
```json
{
  "ok": true,
  "data": {
    "configured": false
  }
}
```

### Step 3: Check Diagnostic Endpoint

Visit: `https://your-app.vercel.app/api/astrology/diagnostic`

This will show:
- Whether credentials are detected
- What values are being read (masked for security)
- Any configuration issues

### Step 4: Force Redeploy

Even if variables are set, force a fresh deployment:

1. Go to **Deployments**
2. Click **"Redeploy"**
3. Select **"Use existing Build Cache"** = OFF (to force fresh build)
4. Click **"Redeploy"**
5. Wait for completion
6. Test again

## Quick Fix Checklist

- [ ] Variables are set in Vercel
- [ ] Both variables have ✅ **Production** environment checked
- [ ] No extra spaces in values
- [ ] Variable names are exact: `PROKERALA_CLIENT_ID` and `PROKERALA_CLIENT_SECRET`
- [ ] Redeployed after adding/updating variables
- [ ] Tested `/api/astrology/config` endpoint
- [ ] Credentials verified in Prokerala dashboard

## If Still Not Working

### Option 1: Verify Credentials Manually

Test the credentials directly:

```bash
curl -X POST https://api.prokerala.com/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials&client_id=4aedeb7a-2fd2-4cd4-a0ec-11b01a895749&client_secret=06SCo9ssJB0nQWYbDWx7GXvnNAc0dqMhDrvIYZ6o"
```

**Expected:** Should return an access token (JSON with `access_token` field)

**If error 602:** Credentials are invalid or revoked

### Option 2: Check Prokerala Dashboard

1. Go to: https://www.prokerala.com/account/api.php
2. Check your API client status
3. Verify Client ID and Secret match
4. Check if there are any restrictions or issues

### Option 3: Create New Credentials

If credentials are invalid:
1. Create new API client in Prokerala
2. Get new Client ID and Secret
3. Update in Vercel
4. Redeploy

## Most Likely Solution

**If credentials are already set correctly, the issue is most likely:**

1. **Not redeployed** after adding variables → **Redeploy now**
2. **Wrong environment scope** → Check Production is enabled
3. **Extra spaces** → Re-enter values without spaces

**Try this first:**
1. Go to Vercel → Deployments
2. Click "Redeploy" (without cache)
3. Wait for completion
4. Test again

---

**The credentials need to be in the deployment environment. If you just added them, you MUST redeploy!** 🔄
