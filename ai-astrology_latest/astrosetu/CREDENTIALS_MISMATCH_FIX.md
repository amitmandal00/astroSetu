# 🔍 Fix: Credentials Mismatch (401/602 Error)

## Current Status

✅ **Credentials are properly formatted:**
- No spaces detected
- No quotes detected
- Correct lengths (Client ID: 36, Secret: 40)

❌ **But authentication still fails:**
- This means credentials in Vercel **don't match** ProKerala dashboard

---

## Step-by-Step Fix

### Step 1: Get Exact Credentials from ProKerala

1. **Go to ProKerala Dashboard:**
   - Visit: https://www.prokerala.com/account/api.php
   - Log in to your account

2. **Find Your API Client:**
   - Look for your client (e.g., "AstroSetu")
   - Click on it to view details

3. **Copy Credentials:**
   - **Client ID**: Copy the exact value (should be a UUID like `4aedeb7a-2fd2-4cd4-a0ec-11b01a895749`)
   - **Client Secret**: Copy the exact value (should be a long string)
   - **Important**: Copy character-by-character, don't miss anything

4. **Check Client Status:**
   - Make sure status is **"Active"** or **"Live"**
   - If inactive, reactivate it

---

### Step 2: Compare with Vercel

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/dashboard
   - Your Project → **Settings** → **Environment Variables**

2. **Check Each Variable:**

   **For `PROKERALA_CLIENT_ID`:**
   - Click on it
   - Compare character-by-character with ProKerala dashboard
   - **Every character must match exactly**

   **For `PROKERALA_CLIENT_SECRET`:**
   - Click on it
   - Compare character-by-character with ProKerala dashboard
   - **Every character must match exactly**

3. **Common Mismatches:**
   - ❌ Different Client ID (wrong UUID)
   - ❌ Different Client Secret (wrong string)
   - ❌ Old/revoked credentials (regenerated but not updated)
   - ❌ Wrong client selected (multiple clients in dashboard)

---

### Step 3: Update Credentials in Vercel

**If they don't match:**

1. **For `PROKERALA_CLIENT_ID`:**
   - Click **"Edit"**
   - Delete the current value
   - Paste the exact value from ProKerala dashboard
   - Click **"Save"**

2. **For `PROKERALA_CLIENT_SECRET`:**
   - Click **"Edit"**
   - Delete the current value
   - Paste the exact value from ProKerala dashboard
   - Click **"Save"**

3. **Double-check:**
   - No extra spaces
   - No quotes
   - Exact match with ProKerala

---

### Step 4: Verify Environment

**Make sure credentials are set for Production:**

1. In Vercel → Environment Variables
2. Check the environment dropdown for each variable
3. Should be set for **"Production"** (not just Preview/Development)
4. If not, add them for Production environment

---

### Step 5: Redeploy

**CRITICAL:** Changes only take effect after redeployment!

1. Go to **Deployments** tab
2. Click **"..."** on latest deployment
3. Click **"Redeploy"**
4. **Uncheck** "Use existing Build Cache"
5. Click **"Redeploy"**
6. Wait 3-5 minutes

---

### Step 6: Test Again

After redeployment:

```bash
curl https://astrosetu-app.vercel.app/api/astrology/diagnostic | jq '.data.prokeralaTest'
```

**Expected Success:**
```json
{
  "status": "connected",
  "ok": true,
  "message": "Successfully authenticated and tested Prokerala API"
}
```

---

## If Still Failing

### Option 1: Regenerate Credentials

If credentials might be compromised:

1. **In ProKerala Dashboard:**
   - Go to your API client
   - Click **"Regenerate Secret"** (or similar)
   - Copy the new Client Secret

2. **Update in Vercel:**
   - Update `PROKERALA_CLIENT_SECRET` with new value
   - Redeploy

3. **Test again**

### Option 2: Create New Client

If credentials are completely wrong:

1. **In ProKerala Dashboard:**
   - Create a new API client
   - Copy new Client ID and Client Secret

2. **Update in Vercel:**
   - Update both `PROKERALA_CLIENT_ID` and `PROKERALA_CLIENT_SECRET`
   - Redeploy

3. **Test again**

### Option 3: Check ProKerala Account

1. **Verify account is active:**
   - Log in to ProKerala
   - Check account status
   - Ensure no payment/billing issues

2. **Check API limits:**
   - Verify you haven't exceeded API limits
   - Check if account is suspended

3. **Contact ProKerala Support:**
   - If account is active but credentials don't work
   - They can verify your credentials are correct

---

## Verification Checklist

- [ ] Opened ProKerala dashboard
- [ ] Found correct API client
- [ ] Copied exact Client ID
- [ ] Copied exact Client Secret
- [ ] Verified client is "Active"
- [ ] Compared with Vercel values
- [ ] Updated if they don't match
- [ ] Verified no spaces/quotes
- [ ] Set for Production environment
- [ ] Redeployed after updating
- [ ] Tested diagnostic endpoint
- [ ] Got "connected" status

---

## Most Likely Issue

**90% of cases:** Credentials in Vercel don't match ProKerala dashboard exactly.

**Quick fix:**
1. Copy exact values from ProKerala
2. Paste into Vercel (replace old values)
3. Redeploy
4. Test

---

## Need Help?

If still failing after all steps:

1. **Share diagnostic response:**
   ```bash
   curl https://astrosetu-app.vercel.app/api/astrology/diagnostic | jq '.data.prokeralaTest.authDiagnostic'
   ```

2. **Verify in ProKerala:**
   - Client ID matches exactly
   - Client Secret matches exactly
   - Client is active

3. **Check Vercel logs:**
   - Look for authentication attempts
   - Check for any warnings

