# Quick Checklist: Verify SUPABASE_SERVICE_ROLE_KEY

## ✅ 5-Minute Verification

### 1. Check Vercel Dashboard (2 minutes)
- [ ] Go to: https://vercel.com/dashboard → Your Project → Settings → Environment Variables
- [ ] Find `SUPABASE_SERVICE_ROLE_KEY` in the list
- [ ] Verify it has ✅ checkmarks for Production (and Preview/Development if needed)
- [ ] Value should be masked (shows as `••••••••`)

### 2. Check Browser DevTools (2 minutes)
- [ ] Open your production site: https://your-domain.com
- [ ] Press `F12` to open DevTools
- [ ] In **Console** tab, type: `process.env.SUPABASE_SERVICE_ROLE_KEY`
- [ ] ✅ Should return `undefined` (NOT the actual key)
- [ ] In **Network** tab, check any API response
- [ ] ✅ Should NOT contain "SUPABASE_SERVICE_ROLE_KEY" or "eyJ" (JWT token)

### 3. Test Functionality (1 minute)
- [ ] Go to: https://your-domain.com/ai-astrology/input
- [ ] Fill form and submit
- [ ] ✅ Should redirect to preview (no error about "storage not available")

---

## ❌ Red Flags (Security Issues)

If you see any of these, **STOP** and fix immediately:

- ❌ `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` (has `NEXT_PUBLIC_` prefix - WRONG!)
- ❌ Key visible in browser Console (should be `undefined`)
- ❌ Key in Network tab responses
- ❌ Key in page source code
- ❌ Error: "Input session storage is not available" (key missing)

---

## 🔧 If Key is Missing

1. **Get Key from Supabase**:
   - Go to: https://supabase.com/dashboard → Your Project → Settings → API
   - Find **"service_role"** key (NOT "anon")
   - Click "Reveal" and copy

2. **Add to Vercel**:
   - Vercel Dashboard → Project → Settings → Environment Variables
   - Click "Add New"
   - Key: `SUPABASE_SERVICE_ROLE_KEY`
   - Value: Paste the key
   - Environment: ✅ Production, ✅ Preview, ✅ Development
   - Click "Save"

3. **Redeploy**:
   - Go to Deployments tab
   - Click "..." on latest deployment
   - Click "Redeploy"

---

## 📖 Full Guide

For detailed instructions, see: `VERIFY_SUPABASE_SERVICE_ROLE_KEY_GUIDE.md`

