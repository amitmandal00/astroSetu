# 🔧 Complete Prokerala Setup & Fix Guide

## ✅ Current Credentials (From Dashboard)

Based on your Prokerala dashboard:

- **Client ID**: `4aedeb7a-2fd2-4cd4-a0ec-11b01a895749`
- **Client Secret**: `06SCo9ssJB0nQWYbDWx7GXvnNAc0dqMhDrvIYZ60` ⚠️ **Note: Ends with `60`, not `6o`**
- **Client Type**: Web Application
- **Created**: 2025-12-20

## 🚨 Critical Issues Found

### Issue 1: Client Secret Mismatch
- **Dashboard shows**: `06SCo9ssJB0nQWYbDWx7GXvnNAc0dqMhDrvIYZ60` (ends with `60`)
- **Codebase references**: `06SCo9ssJB0nQWYbDWx7GXvnNAc0dqMhDrvIYZ6o` (ends with `6o`)
- **Fix**: Use the exact value from dashboard: `60` (not `6o`)

### Issue 2: Missing Production Domain in Authorized Origins
- **Current**: Only `http://localhost:3001` is listed
- **Required**: Add your Vercel production domain(s)
- **Impact**: Client-side API calls from production will fail with CORS errors

---

## Step 1: Add Production Domain to Prokerala

### 1.1 Find Your Vercel Domain

Your Vercel deployment URL should be something like:
- `https://astrosetu-app.vercel.app` (if using project name)
- `https://astrosetu-xxxxx.vercel.app` (auto-generated)
- Or your custom domain

**To find it:**
1. Go to Vercel Dashboard → Your Project
2. Check the deployment URL in the top right
3. Or go to Settings → Domains

### 1.2 Add to Prokerala Authorized JavaScript Origins

1. Go to: https://api.prokerala.com/account/client/4aedeb7a-2fd2-4cd4-a0ec-11b01a895749
2. Scroll to **"Authorized JavaScript Origins"** section
3. Click the **"Add more"** input field
4. Add your production domain(s):
   - `https://your-app.vercel.app` (main domain)
   - `https://www.your-app.vercel.app` (if using www)
   - `https://your-custom-domain.com` (if using custom domain)
5. Click **"Update"** button
6. **Keep** `http://localhost:3001` for local development

**Example:**
```
http://localhost:3001
https://astrosetu-app.vercel.app
https://astrosetu-8yfzxcbd4-amits-projects-a49d49fa.vercel.app
```

---

## Step 2: Update Vercel Environment Variables

### 2.1 Delete Old Variables (If They Exist)

1. Go to Vercel → **Settings** → **Environment Variables**
2. Find `PROKERALA_CLIENT_ID` and `PROKERALA_CLIENT_SECRET`
3. Click the **trash icon** to delete each one
4. This ensures no formatting issues

### 2.2 Add Correct Credentials

**Add `PROKERALA_CLIENT_ID`:**
1. Click **"Add New"**
2. **Key**: `PROKERALA_CLIENT_ID`
3. **Value**: `4aedeb7a-2fd2-4cd4-a0ec-11b01a895749`
4. **Environment**: Check ✅ **Production**, ✅ **Preview**, ✅ **Development**
5. Click **"Save"**

**Add `PROKERALA_CLIENT_SECRET`:**
1. Click **"Add New"**
2. **Key**: `PROKERALA_CLIENT_SECRET`
3. **Value**: `06SCo9ssJB0nQWYbDWx7GXvnNAc0dqMhDrvIYZ60` ⚠️ **Note: `60` at the end, not `6o`**
4. **Environment**: Check ✅ **Production**, ✅ **Preview**, ✅ **Development**
5. Click **"Save"**

**⚠️ Critical:**
- **NO spaces** before or after the `=` sign
- **NO quotes** around the values
- **Exact match** to dashboard values
- **Case-sensitive** - copy exactly

---

## Step 3: Test Credentials Manually

Before redeploying, verify credentials work:

```bash
curl -X POST https://api.prokerala.com/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials&client_id=4aedeb7a-2fd2-4cd4-a0ec-11b01a895749&client_secret=06SCo9ssJB0nQWYbDWx7GXvnNAc0dqMhDrvIYZ60"
```

**Expected Success Response:**
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

**If Error 602:**
- Credentials are invalid
- Double-check Client Secret ends with `60` (not `6o`)
- Verify in Prokerala dashboard

---

## Step 4: Force Redeploy on Vercel

### 4.1 Redeploy Without Cache

1. Go to Vercel → **Deployments**
2. Find the latest deployment
3. Click **three dots (⋯)** → **"Redeploy"**
4. **Uncheck** ✅ "Use existing Build Cache" (important!)
5. Click **"Redeploy"**
6. Wait for build to complete (~2-3 minutes)

### 4.2 Verify Deployment

After deployment completes:
1. Visit: `https://your-app.vercel.app/api/astrology/config`
2. Should return: `{"ok":true,"data":{"configured":true}}`
3. Visit: `https://your-app.vercel.app/api/astrology/diagnostic`
4. Should show: `"prokeralaTest": {"status": "connected", "ok": true}`

---

## Step 5: Test Full Flow

### 5.1 Test Kundli Generation

1. Go to: `https://your-app.vercel.app/kundli`
2. Fill in birth details:
   - Date of Birth
   - Time of Birth
   - Place of Birth (with coordinates)
3. Click **"Generate Kundli"**
4. Should work without error 602

### 5.2 Check Browser Console

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Generate a Kundli
4. Should see: `[AstroSetu] Calling Prokerala API with: {...}`
5. Should see: `[AstroSetu] Prokerala API response received: {...}`
6. **No errors** about authentication

---

## Step 6: Update Local Development (Optional)

If you want to test locally with real API:

### 6.1 Update `.env.local`

```bash
cd astrosetu
```

Edit `.env.local`:
```bash
PROKERALA_CLIENT_ID=4aedeb7a-2fd2-4cd4-a0ec-11b01a895749
PROKERALA_CLIENT_SECRET=06SCo9ssJB0nQWYbDWx7GXvnNAc0dqMhDrvIYZ60
```

**⚠️ Note:** Client Secret ends with `60`, not `6o`

### 6.2 Restart Dev Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

---

## ✅ Verification Checklist

After completing all steps:

- [ ] Production domain added to Prokerala Authorized JavaScript Origins
- [ ] `PROKERALA_CLIENT_ID` set in Vercel with correct value
- [ ] `PROKERALA_CLIENT_SECRET` set in Vercel with correct value (ends with `60`)
- [ ] Manual curl test returns access token
- [ ] Vercel deployment redeployed without cache
- [ ] `/api/astrology/config` returns `{"configured":true}`
- [ ] `/api/astrology/diagnostic` shows `"status": "connected"`
- [ ] Kundli generation works without error 602
- [ ] Browser console shows successful API calls

---

## 🐛 Troubleshooting

### Still Getting Error 602

1. **Verify credentials in Prokerala dashboard**
   - Go to: https://api.prokerala.com/account/client/4aedeb7a-2fd2-4cd4-a0ec-11b01a895749
   - Copy Client Secret exactly (ends with `60`)

2. **Re-enter in Vercel**
   - Delete variables
   - Add again with exact values
   - No spaces, no quotes

3. **Check environment scope**
   - Ensure Production is checked ✅
   - Redeploy after adding

4. **Test with curl** (see Step 3)
   - If curl fails, credentials are invalid
   - Create new API client in Prokerala

### CORS Errors in Browser

- **Symptom**: `Access-Control-Allow-Origin` errors
- **Fix**: Add production domain to Authorized JavaScript Origins (Step 1.2)

### Diagnostic Shows "not_configured"

- **Symptom**: `prokeralaConfigured: false`
- **Fix**: Check environment variables are set in Vercel
- **Fix**: Ensure Production environment is checked ✅

---

## 📝 Summary

**Key Points:**
1. ✅ Client Secret ends with `60` (not `6o`)
2. ✅ Add Vercel domain to Authorized JavaScript Origins
3. ✅ Re-enter credentials in Vercel (even if they look correct)
4. ✅ Force redeploy without cache
5. ✅ Test with diagnostic endpoint

**Most Common Issue:**
The Client Secret mismatch (`60` vs `6o`) is likely causing authentication failures. Always use the exact value from the Prokerala dashboard.

---

**After completing these steps, Prokerala should be fully configured and working! 🎉**
