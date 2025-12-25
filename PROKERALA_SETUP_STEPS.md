# 🎯 Prokerala Setup - Action Steps

## 📋 What You Need to Do

Follow these steps in order. Each step is critical.

---

## Step 1: Fix Authorized JavaScript Origins ⚠️ CRITICAL

**Why:** Your production domain must be whitelisted for CORS.

**Action:**
1. Open: https://api.prokerala.com/account/client/4aedeb7a-2fd2-4cd4-a0ec-11b01a895749
2. Scroll to **"Authorized JavaScript Origins"**
3. Find your Vercel deployment URL:
   - Go to Vercel Dashboard → Your Project
   - Copy the URL (e.g., `https://astrosetu-app.vercel.app`)
4. In Prokerala, click the input field under "Add more"
5. Paste your Vercel URL (e.g., `https://astrosetu-app.vercel.app`)
6. Click **"Update"** button
7. ✅ Done when you see your domain in the list

**Keep:** `http://localhost:3001` for local development

---

## Step 2: Update Vercel Environment Variables ⚠️ CRITICAL

**Why:** The Client Secret in Vercel might be wrong (ends with `6o` instead of `60`).

**Action:**
1. Go to: https://vercel.com → Your Project → **Settings** → **Environment Variables**
2. **Delete** existing variables:
   - Find `PROKERALA_CLIENT_ID` → Click trash icon → Confirm
   - Find `PROKERALA_CLIENT_SECRET` → Click trash icon → Confirm
3. **Add `PROKERALA_CLIENT_ID`:**
   - Click **"Add New"**
   - Key: `PROKERALA_CLIENT_ID`
   - Value: `4aedeb7a-2fd2-4cd4-a0ec-11b01a895749`
   - Environments: ✅ Production, ✅ Preview, ✅ Development
   - Click **"Save"**
4. **Add `PROKERALA_CLIENT_SECRET`:**
   - Click **"Add New"**
   - Key: `PROKERALA_CLIENT_SECRET`
   - Value: `06SCo9ssJB0nQWYbDWx7GXvnNAc0dqMhDrvIYZ60` ⚠️ **Ends with `60`**
   - Environments: ✅ Production, ✅ Preview, ✅ Development
   - Click **"Save"**

**⚠️ Important:**
- Copy values exactly (no spaces, no quotes)
- Client Secret ends with `60` (not `6o`)

---

## Step 3: Test Credentials (Optional but Recommended)

**Why:** Verify credentials work before redeploying.

**Action:**
Open terminal and run:
```bash
curl -X POST https://api.prokerala.com/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials&client_id=4aedeb7a-2fd2-4cd4-a0ec-11b01a895749&client_secret=06SCo9ssJB0nQWYbDWx7GXvnNAc0dqMhDrvIYZ60"
```

**Expected:** JSON with `access_token` field
**If Error 602:** Credentials are wrong - double-check Client Secret ends with `60`

---

## Step 4: Redeploy on Vercel ⚠️ REQUIRED

**Why:** Environment variables only apply to new deployments.

**Action:**
1. Go to: https://vercel.com → Your Project → **Deployments**
2. Find the latest deployment
3. Click **three dots (⋯)** → **"Redeploy"**
4. **Uncheck** ✅ "Use existing Build Cache" (important!)
5. Click **"Redeploy"**
6. Wait 2-3 minutes for build to complete

---

## Step 5: Verify It Works ✅

**Action:**
1. After deployment completes, visit:
   ```
   https://your-app.vercel.app/api/astrology/diagnostic
   ```
   Replace `your-app.vercel.app` with your actual Vercel URL.

2. **Expected Response:**
   ```json
   {
     "ok": true,
     "data": {
       "prokeralaConfigured": true,
       "prokeralaTest": {
         "status": "connected",
         "ok": true,
         "message": "Successfully connected to Prokerala API"
       },
       "hasClientId": true,
       "hasClientSecret": true
     }
   }
   ```

3. **Test Kundli Generation:**
   - Go to: `https://your-app.vercel.app/kundli`
   - Fill in birth details
   - Click "Generate Kundli"
   - Should work without error 602

---

## ✅ Success Checklist

After completing all steps:

- [ ] Vercel domain added to Prokerala Authorized JavaScript Origins
- [ ] `PROKERALA_CLIENT_ID` updated in Vercel
- [ ] `PROKERALA_CLIENT_SECRET` updated in Vercel (ends with `60`)
- [ ] Vercel deployment redeployed
- [ ] Diagnostic endpoint shows `"status": "connected"`
- [ ] Kundli generation works

---

## 🐛 If Still Not Working

### Error 602: Client authentication failed

1. **Double-check Client Secret:**
   - Must end with `60` (not `6o`)
   - No spaces or quotes
   - Copy exactly from Prokerala dashboard

2. **Verify in Vercel:**
   - Go to Settings → Environment Variables
   - Click on `PROKERALA_CLIENT_SECRET` to view value
   - Should end with `60`

3. **Test with curl** (Step 3 above)
   - If curl fails, credentials are invalid
   - Check Prokerala dashboard again

4. **Force redeploy again:**
   - Sometimes takes 2-3 redeploys

### CORS Errors

- **Symptom:** `Access-Control-Allow-Origin` in browser console
- **Fix:** Add Vercel domain to Authorized JavaScript Origins (Step 1)

---

## 📝 Summary

**The 3 Critical Fixes:**
1. ✅ Add Vercel domain to Prokerala Authorized Origins
2. ✅ Update Client Secret in Vercel (ends with `60`, not `6o`)
3. ✅ Redeploy on Vercel

**Most Important:** Client Secret must end with `60` (not `6o`)

---

**After these steps, Prokerala should be fully working! 🎉**
