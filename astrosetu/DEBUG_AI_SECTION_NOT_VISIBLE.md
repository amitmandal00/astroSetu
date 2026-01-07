# 🔍 Debug: AI Section Not Visible on Production

**Issue**: AI section not visible at `https://astrosetu-app.vercel.app/`

---

## 🎯 **UNDERSTANDING THE ROUTING**

### **Two Possible Setups**:

#### **Setup 1: AI Section at Base URL (`/`)**
- Requires: `NEXT_PUBLIC_AI_ONLY_MODE=true` in Vercel
- Behavior: Base URL redirects to `/ai-astrology`
- Shows: "Redirecting..." then AI section

#### **Setup 2: AI Section at `/ai-astrology` Route**
- Requires: `NEXT_PUBLIC_AI_ONLY_MODE` not set or `false`
- Behavior: Base URL shows main AstroSetu landing page
- AI Section: Accessible at `https://astrosetu-app.vercel.app/ai-astrology`

---

## 🔍 **DIAGNOSIS**

### **Check 1: What do you see at base URL?**
- **Option A**: Orange/saffron landing page (Kundli, Match, etc.) → `AI_ONLY_MODE` is **OFF**
- **Option B**: "Redirecting..." or AI section → `AI_ONLY_MODE` is **ON**
- **Option C**: Error or blank page → Build/deployment issue

### **Check 2: Can you access AI section directly?**
Try: `https://astrosetu-app.vercel.app/ai-astrology`
- ✅ **Works** → AI section exists, just not at base URL
- ❌ **Doesn't work** → Deployment/build issue

---

## 🛠️ **SOLUTIONS**

### **Solution 1: Enable AI-Only Mode (Base URL → AI Section)**

**If you want base URL to show AI section**:

1. **Go to Vercel Dashboard**:
   - Settings → Environment Variables
   - Production environment

2. **Set/Create Variable**:
   - **Key**: `NEXT_PUBLIC_AI_ONLY_MODE`
   - **Value**: `true`
   - **Environment**: Production (and All Environments if needed)

3. **Redeploy**:
   - Vercel should auto-redeploy
   - OR manually redeploy latest deployment

4. **Verify**:
   - Visit `https://astrosetu-app.vercel.app/`
   - Should redirect to `/ai-astrology` or show AI section

---

### **Solution 2: Access AI Section Directly (Keep Base URL as Is)**

**If you want to keep base URL as main landing page**:

1. **Access AI section directly**:
   - URL: `https://astrosetu-app.vercel.app/ai-astrology`
   - This should work without any changes

2. **Verify route exists**:
   - The route is: `/ai-astrology`
   - Not at base URL `/`

---

### **Solution 3: Fix Build/Deployment Issue**

**If `/ai-astrology` doesn't work either**:

1. **Check Vercel Build Logs**:
   - Go to Deployments → Latest → Logs
   - Look for errors related to `/ai-astrology` route

2. **Check File Structure**:
   - Verify `src/app/ai-astrology/page.tsx` exists
   - Verify route is not blocked

3. **Clear Cache & Redeploy**:
   - Vercel Dashboard → Deployments → Latest → Three dots → "Redeploy"
   - Or trigger new deployment from Git

---

## ✅ **VERIFICATION STEPS**

### **Step 1: Check Environment Variable**

**In Vercel Dashboard**:
1. Settings → Environment Variables
2. Production environment
3. Look for: `NEXT_PUBLIC_AI_ONLY_MODE`
4. Check value:
   - ✅ `true` → Base URL should redirect to AI section
   - ✅ Not set or `false` → Base URL shows main landing page
   - ✅ AI section accessible at `/ai-astrology`

---

### **Step 2: Test Direct Access**

**Try these URLs**:
1. `https://astrosetu-app.vercel.app/` → What do you see?
2. `https://astrosetu-app.vercel.app/ai-astrology` → Does this work?
3. `https://astrosetu-app.vercel.app/contact` → Does this work?

**Expected Results**:
- Base URL (`/`): Depends on `AI_ONLY_MODE` setting
- `/ai-astrology`: Should always work (AI section)
- `/contact`: Should always work (legal page)

---

### **Step 3: Check Browser Console**

**Open browser console (F12)**:
1. Visit `https://astrosetu-app.vercel.app/`
2. Check Console tab for errors
3. Check Network tab for failed requests

**Common Issues**:
- 404 errors → Route doesn't exist
- 500 errors → Server/build issue
- Redirect loops → `AI_ONLY_MODE` misconfiguration

---

## 🎯 **QUICK FIX**

### **Most Likely Issue**: `AI_ONLY_MODE` Not Set

**Fix**:
1. Vercel → Settings → Environment Variables
2. Production environment
3. **If variable doesn't exist**: Add `NEXT_PUBLIC_AI_ONLY_MODE` = `true`
4. **If variable exists**: Verify value is `true` (not `"true"` with quotes)
5. Redeploy

**OR**: Access AI section directly at `/ai-astrology`

---

## 📋 **CHECKLIST**

- [ ] Checked what appears at base URL `/`
- [ ] Tested direct access to `/ai-astrology`
- [ ] Verified `NEXT_PUBLIC_AI_ONLY_MODE` in Vercel
- [ ] Checked browser console for errors
- [ ] Checked Vercel build logs
- [ ] Tried clearing browser cache

---

## 🔧 **TROUBLESHOOTING**

### **If Base URL Shows Old Landing Page**:
- ✅ This is **NORMAL** if `AI_ONLY_MODE` is OFF
- Access AI section at: `/ai-astrology`

### **If `/ai-astrology` Shows 404**:
- ❌ Route file missing or build error
- Check Vercel build logs
- Verify `src/app/ai-astrology/page.tsx` exists in codebase

### **If Base URL Shows "Redirecting..." Forever**:
- ❌ Redirect loop or JavaScript error
- Check browser console
- Verify `AI_ONLY_MODE` is set correctly

---

**Last Updated**: January 6, 2026  
**Status**: Diagnostic Guide

