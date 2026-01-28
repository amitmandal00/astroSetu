# 🔧 Trying Basic Auth Method for ProKerala Token

## Current Situation

✅ **Credentials match exactly:**
- Client ID: `4aedeb7a-2fd2-4cd4-a0ec-11b01a895749`
- Client Secret: `06SCo9ssJBOnQWYbDWx7GXvnNAc0dqMhDrvIYZ6o`
- No spaces, no quotes
- Correct lengths

❌ **But authentication still fails with 401/602**

## Hypothesis

Some OAuth2 implementations require **Basic Authentication** in the Authorization header instead of (or in addition to) form-encoded body parameters.

## Solution Implemented

The code now tries **both methods**:

### Method 1: Basic Auth (Tried First)
```http
POST https://api.prokerala.com/token
Content-Type: application/x-www-form-urlencoded
Authorization: Basic <base64(clientId:clientSecret)>

grant_type=client_credentials
```

### Method 2: Form-Encoded Body (Fallback)
```http
POST https://api.prokerala.com/token
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials&client_id=...&client_secret=...
```

## What Changed

1. **Tries Basic Auth first** - Standard OAuth2 method
2. **Falls back to form-encoded** - If Basic Auth fails with 401
3. **Logs which method is used** - For debugging

## Next Steps

1. **Deploy the updated code:**
   ```bash
   cd astrosetu
   git add src/lib/astrologyAPI.ts
   git commit -m "Try Basic Auth for ProKerala token endpoint"
   git push origin main
   ```

2. **Redeploy on Vercel:**
   - Force redeploy with cache cleared
   - Wait 3-5 minutes

3. **Test:**
   ```bash
   curl https://astrosetu-app.vercel.app/api/astrology/diagnostic | jq '.data.prokeralaTest'
   ```

4. **Check logs:**
   - Look for `[AstroSetu] Token request completed - Method: basic/form-encoded`
   - This will show which method worked (or if both failed)

## Expected Results

### ✅ Success with Basic Auth:
- Logs show: `Method: basic, Status: 200`
- Diagnostic shows: `"status": "connected"`

### ✅ Success with Form-Encoded:
- Logs show: `Method: form-encoded, Status: 200`
- Diagnostic shows: `"status": "connected"`

### ❌ Both Fail:
- Still getting 401/602
- Need to check:
  - Client status in ProKerala dashboard
  - Account status
  - API limits
  - Contact ProKerala support

## Why This Might Work

OAuth2 specification (RFC 6749) allows client authentication via:
1. **Authorization header** (Basic Auth) - Section 2.3.1
2. **Request body parameters** (form-encoded) - Section 2.3.1

Some implementations prefer one over the other. ProKerala might require Basic Auth.

## If Still Failing

If both methods fail:

1. **Verify client is active** in ProKerala dashboard
2. **Check account status** - no billing/payment issues
3. **Verify API limits** - not exceeded
4. **Contact ProKerala support** with:
   - Client ID (first 4 and last 4 chars)
   - Error code: 602
   - Authentication method tried: Basic Auth and form-encoded

