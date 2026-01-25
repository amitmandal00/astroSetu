# 🔄 Update Base URL to Show AI Section

**Current**: `https://astrosetu-app.vercel.app/` shows old landing page (orange AstroSetu site)  
**Goal**: Base URL should show/redirect to AI section  
**Solution**: Enable `AI_ONLY_MODE` and update `NEXT_PUBLIC_APP_URL`

---

## 🎯 **SOLUTION: Enable AI-Only Mode**

This will make the base URL redirect to the AI section.

---

## ✅ **STEP 1: Update Environment Variables in Vercel**

### **1.1 Enable AI-Only Mode**

1. **Go to**: Vercel Dashboard → Settings → Environment Variables
2. **Production environment** (make sure it's selected)
3. **Find or Add**: `NEXT_PUBLIC_AI_ONLY_MODE`
   - **If it exists**: Click edit (three dots) → Change value to: `true` → Save
   - **If it doesn't exist**: Click "Add Environment Variable" →
     - **Key**: `NEXT_PUBLIC_AI_ONLY_MODE`
     - **Value**: `true` (lowercase, no quotes)
     - **Environment**: Production (or All Environments)
     - **Save**

### **1.2 Update App URL**

1. **Still in Environment Variables**
2. **Find**: `NEXT_PUBLIC_APP_URL`
3. **Update value to**: `https://astrosetu-app.vercel.app`
   - Make sure there's **NO path** (like `/NEXT_PUBLIC_APP_URL`)
   - Should be just the base URL: `https://astrosetu-app.vercel.app`
4. **Save**

---

## 🚀 **STEP 2: Redeploy**

After updating environment variables:

1. **Vercel will auto-redeploy** (may take a minute to trigger)
2. **OR manually trigger**:
   - Go to Deployments tab
   - Click "Redeploy" on latest deployment
   - OR push a new commit to trigger deployment

---

## ✅ **STEP 3: Verify After Deployment**

Wait for deployment to complete (~2-3 minutes), then:

1. **Visit**: `https://astrosetu-app.vercel.app/`
2. **Expected behavior**:
   - Shows "Redirecting..." briefly
   - Then redirects to `/ai-astrology`
   - OR shows AI section directly

3. **Test AI section**:
   - `https://astrosetu-app.vercel.app/ai-astrology`
   - Should show AI section landing page

---

## 🔍 **VERIFICATION CHECKLIST**

- [ ] `NEXT_PUBLIC_AI_ONLY_MODE` = `true` in Vercel
- [ ] `NEXT_PUBLIC_APP_URL` = `https://astrosetu-app.vercel.app` (no path)
- [ ] Deployment completed successfully
- [ ] Base URL redirects to AI section
- [ ] AI section accessible at `/ai-astrology`

---

## 📋 **WHAT HAPPENS**

### **Before** (Current):
- `https://astrosetu-app.vercel.app/` → Shows old orange landing page (Kundli, Match, etc.)
- `https://astrosetu-app.vercel.app/ai-astrology` → Shows AI section

### **After** (With AI_ONLY_MODE enabled):
- `https://astrosetu-app.vercel.app/` → Redirects to `/ai-astrology` or shows AI section directly
- `https://astrosetu-app.vercel.app/ai-astrology` → Shows AI section

---

## ⚠️ **IMPORTANT NOTES**

### **Environment Variable Values**:

**Correct**:
- ✅ `NEXT_PUBLIC_AI_ONLY_MODE` = `true` (lowercase, no quotes)
- ✅ `NEXT_PUBLIC_APP_URL` = `https://astrosetu-app.vercel.app` (no path)

**Wrong**:
- ❌ `NEXT_PUBLIC_AI_ONLY_MODE` = `"true"` (with quotes)
- ❌ `NEXT_PUBLIC_AI_ONLY_MODE` = `True` or `TRUE` (uppercase)
- ❌ `NEXT_PUBLIC_APP_URL` = `https://astrosetu-app.vercel.app/NEXT_PUBLIC_APP_URL` (has path)

---

## 🔧 **IF IT DOESN'T WORK**

### **Issue 1: Still Shows Old Landing Page**

**Check**:
1. Environment variables are saved correctly
2. Deployment completed successfully
3. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
4. Try incognito/private window

### **Issue 2: Redirect Loop**

**Fix**:
1. Check `NEXT_PUBLIC_APP_URL` doesn't have `/ai-astrology` in it
2. Should be: `https://astrosetu-app.vercel.app` (base URL only)
3. Redeploy

### **Issue 3: Environment Variables Not Applied**

**Fix**:
1. Make sure you selected **Production** environment
2. Check variables show "All Environments" or "Production"
3. Redeploy after saving variables

---

## 🎯 **QUICK ACTION CHECKLIST**

- [ ] Go to Vercel → Settings → Environment Variables
- [ ] Set `NEXT_PUBLIC_AI_ONLY_MODE` = `true`
- [ ] Set `NEXT_PUBLIC_APP_URL` = `https://astrosetu-app.vercel.app` (no path)
- [ ] Save both variables
- [ ] Wait for auto-redeploy OR manually redeploy
- [ ] Test: Visit `https://astrosetu-app.vercel.app/`
- [ ] Verify redirects to AI section

---

## 📝 **SUMMARY**

**Current State**:
- Base URL shows old landing page

**Action**:
1. Set `NEXT_PUBLIC_AI_ONLY_MODE=true`
2. Set `NEXT_PUBLIC_APP_URL=https://astrosetu-app.vercel.app`
3. Redeploy

**Result**:
- Base URL redirects to/shows AI section
- Clean production URL ready

---

**Time to Complete**: ~5 minutes (2 min setup + 3 min deployment)

**Last Updated**: January 6, 2026

