# ⚡ Prokerala Quick Fix Checklist

## 🔑 Correct Credentials

- **Client ID**: `4aedeb7a-2fd2-4cd4-a0ec-11b01a895749`
- **Client Secret**: `06SCo9ssJB0nQWYbDWx7GXvnNAc0dqMhDrvIYZ60` ⚠️ **Ends with `60`**

---

## ✅ 3-Step Fix

### Step 1: Add Vercel Domain to Prokerala
1. Go to: https://api.prokerala.com/account/client/4aedeb7a-2fd2-4cd4-a0ec-11b01a895749
2. Scroll to **"Authorized JavaScript Origins"**
3. Add: `https://your-app.vercel.app` (your actual Vercel URL)
4. Click **"Update"**

### Step 2: Update Vercel Environment Variables
1. Vercel → Settings → Environment Variables
2. **Delete** old `PROKERALA_CLIENT_ID` and `PROKERALA_CLIENT_SECRET`
3. **Add** `PROKERALA_CLIENT_ID` = `4aedeb7a-2fd2-4cd4-a0ec-11b01a895749`
4. **Add** `PROKERALA_CLIENT_SECRET` = `06SCo9ssJB0nQWYbDWx7GXvnNAc0dqMhDrvIYZ60` ⚠️ **`60` not `6o`**
5. Check ✅ **Production** for both
6. Save

### Step 3: Redeploy
1. Vercel → Deployments → Three dots (⋯) → **"Redeploy"**
2. **Uncheck** "Use existing Build Cache"
3. Click **"Redeploy"**

---

## 🧪 Quick Test

After redeploy, visit:
- `https://your-app.vercel.app/api/astrology/diagnostic`
- Should show: `"prokeralaTest": {"status": "connected"}`

---

## ⚠️ Common Mistakes

- ❌ Using `6o` instead of `60` in Client Secret
- ❌ Forgetting to add Vercel domain to Authorized Origins
- ❌ Not redeploying after updating environment variables
- ❌ Using quotes or spaces in environment variables

---

**See `PROKERALA_COMPLETE_SETUP.md` for detailed instructions.**
