# ✅ Verify ProKerala Credentials

## Current Credentials (from ProKerala Dashboard)

**Client ID:** `70b7ffb3-78f1-4a2f-9044-835ac8e5e642`  
**Client Secret:** `Oz9iwYNzgCtkIAsXOcC0BWw6IwboDVx7uNfV5Ilk`

**Note:** The image shows `Oz9iwYNzgCtkIAsX0cC0BWw6IwboDVx7uNfV5Ilk` (with zero `0`)  
But you provided `Oz9iwYNzgCtkIAsXOcC0BWw6IwboDVx7uNfV5Ilk` (with letter `O`)

**Important:** Verify which one is correct in the ProKerala dashboard!

---

## Step 1: Test Production Endpoint

```bash
curl https://astrosetu-app.vercel.app/api/astrology/diagnostic | jq '.data.prokeralaTest'
```

### Check These Fields:

1. **Status:**
   - ✅ `"status": "connected"` = Success
   - ❌ `"status": "error"` = Still failing

2. **Client ID Preview:**
   - Should show: `"70b7...e642"` (first 4 and last 4 chars)

3. **Client Secret Preview:**
   - Should show: `"Oz9i...5Ilk"` (first 4 and last 4 chars)
   - If shows old: `"06SC...YZ6o"` → Secret not updated in Vercel

4. **Authentication:**
   - ✅ `"ok": true` = Authentication successful
   - ❌ `"statusCode": 401` = Authentication failed

---

## Step 2: Verify Secret Character

**Potential Issue:** Letter `O` vs Zero `0`

The image shows: `Oz9iwYNzgCtkIAsX0cC0BWw6IwboDVx7uNfV5Ilk`  
You provided: `Oz9iwYNzgCtkIAsXOcC0BWw6IwboDVx7uNfV5Ilk`

**Difference:** `AsX0cC0` (zero) vs `AsXOcC0` (letter O)

### To Verify:

1. Go to ProKerala dashboard
2. Copy the Client Secret **character by character**
3. Check if it's:
   - `AsX0cC0` (zero `0`)
   - `AsXOcC0` (letter `O`)

### If Wrong Character:

- If it's actually `0` (zero), update Vercel with: `Oz9iwYNzgCtkIAsX0cC0BWw6IwboDVx7uNfV5Ilk`
- If it's actually `O` (letter), keep: `Oz9iwYNzgCtkIAsXOcC0BWw6IwboDVx7uNfV5Ilk`

---

## Step 3: Full Diagnostic Check

```bash
curl https://astrosetu-app.vercel.app/api/astrology/diagnostic | jq '.data.prokeralaTest.authDiagnostic'
```

**Expected Output:**
```json
{
  "statusCode": 200,
  "clientIdLength": 36,
  "clientSecretLength": 40,
  "clientIdPreview": "70b7...e642",
  "clientSecretPreview": "Oz9i...5Ilk",
  "clientIdHasSpaces": false,
  "clientSecretHasSpaces": false,
  "clientIdHasQuotes": false,
  "clientSecretHasQuotes": false
}
```

---

## Step 4: Expected Success Response

```json
{
  "status": "connected",
  "ok": true,
  "message": "Successfully authenticated and tested Prokerala API",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "panchangTest": "passed",
  "debug": {
    "method": "GET",
    "endpoint": "/panchang",
    "result": "success"
  }
}
```

---

## Troubleshooting

### If Still Getting 401 Error:

1. **Check Secret Character:**
   - Verify `O` vs `0` in ProKerala dashboard
   - Update Vercel with exact value

2. **Verify in Vercel:**
   - Go to Settings → Environment Variables
   - Check `PROKERALA_CLIENT_SECRET`
   - Should match ProKerala dashboard exactly

3. **Force Redeploy:**
   - Deployments → Redeploy
   - Uncheck "Use existing Build Cache"
   - Wait 3-5 minutes

4. **Check Client Status:**
   - ProKerala dashboard shows "Live Client" ✅
   - Should be active

---

## Quick Test Command

```bash
# Full diagnostic
curl https://astrosetu-app.vercel.app/api/astrology/diagnostic | jq

# Just status
curl https://astrosetu-app.vercel.app/api/astrology/diagnostic | jq '.data.prokeralaTest.status'

# Secret preview
curl https://astrosetu-app.vercel.app/api/astrology/diagnostic | jq '.data.prokeralaTest.authDiagnostic.clientSecretPreview'
```

---

## Summary

**Verify:**
1. ✅ Client ID matches: `70b7ffb3-78f1-4a2f-9044-835ac8e5e642`
2. ⚠️ Client Secret: Check `O` vs `0` in ProKerala dashboard
3. ✅ Updated in Vercel
4. ✅ Force redeployed
5. ✅ Test diagnostic endpoint

**After verification, authentication should work!**
