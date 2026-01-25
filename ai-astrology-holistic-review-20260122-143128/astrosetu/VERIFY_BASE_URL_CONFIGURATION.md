# ✅ Verification Checklist: Base URL Configuration

**Goal**: Verify that `https://astrosetu-app.vercel.app/` shows AI section

---

## 🔍 **PRE-DEPLOYMENT VERIFICATION**

### **Check 1: Environment Variables**

**Before redeploying, verify these are set correctly**:

1. **Go to**: Vercel Dashboard → Settings → Environment Variables
2. **Select**: Production environment
3. **Verify**:

   **✅ `NEXT_PUBLIC_AI_ONLY_MODE`**:
   - [ ] Variable exists
   - [ ] Value = `true` (lowercase, no quotes)
   - [ ] Environment = Production (or All Environments)

   **✅ `NEXT_PUBLIC_APP_URL`**:
   - [ ] Variable exists
   - [ ] Value = `https://astrosetu-app.vercel.app` (exact, no path)
   - [ ] **NO** `/NEXT_PUBLIC_APP_URL` or other paths
   - [ ] Environment = Production (or All Environments)

---

## 🚀 **DEPLOYMENT VERIFICATION**

### **After Redeploying**:

1. **Wait for deployment to complete** (~2-3 minutes)
2. **Check deployment status**:
   - Go to Deployments tab
   - Latest deployment should be "Ready" (green dot)
   - Should show as "Production" environment

3. **Verify deployment logs** (optional):
   - Click on deployment
   - Check for any errors
   - Should show successful build

---

## ✅ **POST-DEPLOYMENT VERIFICATION**

### **Test 1: Base URL Redirect**

1. **Visit**: `https://astrosetu-app.vercel.app/`
2. **Expected behavior**:
   - ✅ Shows "Redirecting..." briefly (1-2 seconds)
   - ✅ Then redirects to `/ai-astrology`
   - ✅ OR shows AI section directly
   - ❌ Should NOT show old orange landing page

**If old page shows**:
- Clear browser cache (Ctrl+Shift+R / Cmd+Shift+R)
- Try incognito/private window
- Check environment variables again

---

### **Test 2: Direct AI Section Access**

1. **Visit**: `https://astrosetu-app.vercel.app/ai-astrology`
2. **Expected**:
   - ✅ AI section landing page loads
   - ✅ Shows "Year Analysis Report" and other reports
   - ✅ Purple/cosmic theme (not orange)
   - ✅ No old header/footer flash

---

### **Test 3: Environment Variable Usage**

**Check browser console** (optional):
1. Visit `https://astrosetu-app.vercel.app/`
2. Open DevTools (F12) → Console
3. Should see redirect happening (if using client-side redirect)
4. No errors related to environment variables

---

## 🔧 **TROUBLESHOOTING**

### **Issue 1: Still Shows Old Landing Page**

**Check**:
- [ ] Environment variables are saved in Vercel
- [ ] Selected "Production" environment
- [ ] Deployment completed successfully
- [ ] Cleared browser cache
- [ ] Tried incognito window

**Fix**:
1. Re-check environment variable values
2. Make sure `NEXT_PUBLIC_AI_ONLY_MODE` = `true` (not `"true"`)
3. Redeploy again

---

### **Issue 2: Redirect Loop**

**Check**:
- [ ] `NEXT_PUBLIC_APP_URL` doesn't contain `/ai-astrology`
- [ ] Value is exactly: `https://astrosetu-app.vercel.app`

**Fix**:
1. Update `NEXT_PUBLIC_APP_URL` to base URL only
2. Redeploy

---

### **Issue 3: Environment Variables Not Applied**

**Check**:
- [ ] Variables show "Production" or "All Environments"
- [ ] Deployment happened after saving variables
- [ ] No typos in variable names

**Fix**:
1. Delete and re-add variables
2. Redeploy

---

## 📋 **VERIFICATION CHECKLIST**

### **Before Redeploy**:
- [ ] `NEXT_PUBLIC_AI_ONLY_MODE` = `true` in Vercel
- [ ] `NEXT_PUBLIC_APP_URL` = `https://astrosetu-app.vercel.app` (no path)
- [ ] Both variables set for Production environment

### **After Redeploy**:
- [ ] Deployment status is "Ready"
- [ ] Base URL (`/`) redirects to AI section
- [ ] `/ai-astrology` loads correctly
- [ ] No old landing page visible
- [ ] No console errors

---

## 🎯 **QUICK VERIFICATION**

**Run these tests after deployment**:

1. **Base URL**: `https://astrosetu-app.vercel.app/`
   - Should redirect to AI section ✅

2. **AI Section**: `https://astrosetu-app.vercel.app/ai-astrology`
   - Should show AI section ✅

3. **Contact Form**: `https://astrosetu-app.vercel.app/contact`
   - Should work ✅

---

## 📝 **SUCCESS CRITERIA**

**✅ Configuration is correct if**:
- Base URL redirects to/shows AI section
- Old landing page no longer visible at base URL
- All links and redirects work correctly
- No console errors

---

**Last Updated**: January 6, 2026  
**Status**: Pre-Deployment Verification Guide

