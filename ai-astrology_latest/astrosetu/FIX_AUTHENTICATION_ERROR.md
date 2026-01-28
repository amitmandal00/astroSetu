# 🔐 Fix ProKerala Authentication Error (401/602)

## Error Message

```
"Client authentication failed. Please check your client credentials"
Code: 602
```

This means ProKerala is rejecting your Client ID and Client Secret.

## 🔍 Diagnosis Steps

### Step 1: Verify Credentials in Vercel

1. Go to: https://vercel.com/dashboard
2. Click your project: **astrosetu**
3. Go to **Settings** → **Environment Variables**
4. Check for:
   - `PROKERALA_CLIENT_ID` - Should have a value
   - `PROKERALA_CLIENT_SECRET` - Should have a value

**Common Issues:**
- ❌ Variable name has typo (e.g., `PROKERALA_CLIENT_IDD`)
- ❌ Value has extra spaces (e.g., ` 4aedeb7a-...`)
- ❌ Value has quotes (e.g., `"4aedeb7a-..."`)
- ❌ Value is empty or missing

### Step 2: Verify Credentials in ProKerala Dashboard

1. Go to: https://www.prokerala.com/account/api.php
2. Log in to your ProKerala account
3. Check your API client:
   - **Client ID** should match what's in Vercel
   - **Client Secret** should match what's in Vercel
   - **Status** should be "Active" or "Live"

**If credentials don't match:**
- Copy the correct values from ProKerala dashboard
- Update them in Vercel (see Step 3)

### Step 3: Update Credentials in Vercel

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. For each variable:
   - Click the variable
   - Click **"Edit"**
   - **Remove any extra spaces** (before or after the value)
   - **Remove any quotes** (if present)
   - Paste the exact value from ProKerala dashboard
   - Click **"Save"**

**Example:**
```
❌ Wrong: PROKERALA_CLIENT_ID = "4aedeb7a-2fd2-4cd4-a0ec-11b01a895749"
✅ Correct: PROKERALA_CLIENT_ID=4aedeb7a-2fd2-4cd4-a0ec-11b01a895749
```

### Step 4: Verify Credentials Format

**Client ID Format:**
- Should be a UUID: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
- Example: `4aedeb7a-2fd2-4cd4-a0ec-11b01a895749`
- No spaces, no quotes

**Client Secret Format:**
- Should be a long alphanumeric string
- Example: `06SCo9ssJB0nQWYbDWx7GXvnNAc0dqMhDrvIYZ6o`
- No spaces, no quotes

### Step 5: Redeploy After Updating Credentials

**CRITICAL:** Environment variables only take effect after redeployment!

1. After updating credentials in Vercel
2. Go to **Deployments** tab
3. Click **"..."** on latest deployment → **"Redeploy"**
4. Wait for deployment to complete (3-5 minutes)

### Step 6: Test Authentication

After redeployment, test:

```bash
curl https://astrosetu-app.vercel.app/api/astrology/diagnostic | jq '.data.prokeralaTest'
```

**Expected Results:**

✅ **Success:**
```json
{
  "status": "connected",
  "ok": true,
  "message": "Successfully authenticated and tested Prokerala API"
}
```

❌ **Still Failing:**
```json
{
  "status": "error",
  "error": "Client authentication failed...",
  "statusCode": 401
}
```

## 🔧 Common Fixes

### Fix 1: Remove Extra Spaces

**Problem:** Value has spaces
```
PROKERALA_CLIENT_ID= 4aedeb7a-2fd2-4cd4-a0ec-11b01a895749 
```

**Solution:** Remove spaces
```
PROKERALA_CLIENT_ID=4aedeb7a-2fd2-4cd4-a0ec-11b01a895749
```

### Fix 2: Remove Quotes

**Problem:** Value has quotes
```
PROKERALA_CLIENT_ID="4aedeb7a-2fd2-4cd4-a0ec-11b01a895749"
```

**Solution:** Remove quotes
```
PROKERALA_CLIENT_ID=4aedeb7a-2fd2-4cd4-a0ec-11b01a895749
```

### Fix 3: Verify Exact Match

**Problem:** Credentials don't match ProKerala dashboard

**Solution:**
1. Go to ProKerala dashboard
2. Copy exact Client ID and Client Secret
3. Paste into Vercel (no spaces, no quotes)
4. Redeploy

### Fix 4: Check Client Status

**Problem:** Client is inactive or revoked in ProKerala

**Solution:**
1. Go to ProKerala dashboard
2. Check if client is "Active" or "Live"
3. If inactive, reactivate or create new client
4. Update credentials in Vercel
5. Redeploy

### Fix 5: Regenerate Credentials

If credentials are compromised or lost:

1. Go to ProKerala dashboard
2. Create a new API client
3. Copy new Client ID and Client Secret
4. Update in Vercel
5. Redeploy

## 📋 Verification Checklist

After fixing credentials:

- [ ] Credentials match ProKerala dashboard exactly
- [ ] No extra spaces in values
- [ ] No quotes around values
- [ ] Client status is "Active" in ProKerala
- [ ] Credentials updated in Vercel
- [ ] Application redeployed after updating credentials
- [ ] Diagnostic endpoint shows "connected" status

## 🧪 Test Commands

```bash
# Test authentication
curl https://astrosetu-app.vercel.app/api/astrology/diagnostic | jq '.data.prokeralaTest.status'

# Should return: "connected" (not "error")

# Check full response
curl https://astrosetu-app.vercel.app/api/astrology/diagnostic | jq '.data.prokeralaTest'
```

## 📞 If Still Failing

If authentication still fails after all steps:

1. **Double-check ProKerala dashboard:**
   - Client is active
   - Credentials are correct
   - No account issues

2. **Check Vercel logs:**
   - Go to Vercel Dashboard → Functions
   - Check `/api/astrology/diagnostic` logs
   - Look for authentication errors

3. **Verify environment:**
   - Make sure you're checking Production environment
   - Not Preview or Development

4. **Contact ProKerala support:**
   - If credentials are correct but still failing
   - There may be an account or API issue

## Summary

**Most Common Causes:**
1. Extra spaces in credentials
2. Quotes around values
3. Credentials don't match ProKerala dashboard
4. Not redeployed after updating credentials

**Quick Fix:**
1. Copy exact credentials from ProKerala dashboard
2. Paste into Vercel (no spaces, no quotes)
3. Redeploy
4. Test

