# ⚡ Quick Fix: Show AI Section at Base URL

**Issue**: Base URL (`/`) shows old landing page instead of AI section  
**Solution**: Enable `AI_ONLY_MODE` or access AI section directly

---

## 🎯 **TWO OPTIONS**

### **Option 1: Enable AI-Only Mode (Base URL → AI Section)** ⭐ **RECOMMENDED**

This makes the base URL redirect to the AI section.

**Steps**:
1. **Go to Vercel Dashboard**:
   - https://vercel.com/dashboard
   - Select "astrosetu-app"
   - Settings → Environment Variables
   - Make sure "Production" environment is selected

2. **Find or Add Variable**:
   - Look for: `NEXT_PUBLIC_AI_ONLY_MODE`
   - **If it exists**: Click edit (three dots) → Change value to: `true` → Save
   - **If it doesn't exist**: Click "Add Environment Variable" → 
     - Key: `NEXT_PUBLIC_AI_ONLY_MODE`
     - Value: `true`
     - Environment: Production (or All Environments)
     - Save

3. **Redeploy**:
   - Vercel should auto-redeploy when you save
   - OR go to Deployments → Latest → Three dots → "Redeploy"

4. **Verify**:
   - Visit: `https://astrosetu-app.vercel.app/`
   - Should redirect to `/ai-astrology` or show AI section directly

**Time**: 2-3 minutes

---

### **Option 2: Access AI Section Directly** (No Changes Needed)

If you don't want to change the base URL behavior:

**Just visit**:
```
https://astrosetu-app.vercel.app/ai-astrology
```

This should work **right now** without any changes.

---

## ✅ **VERIFICATION**

### **After Enabling AI_ONLY_MODE**:

1. **Wait for redeployment** (~2 minutes)
2. **Visit**: `https://astrosetu-app.vercel.app/`
3. **Expected**:
   - Shows "Redirecting..." briefly
   - Then redirects to `/ai-astrology`
   - OR shows AI section directly

### **If Using Direct Access**:

1. **Visit**: `https://astrosetu-app.vercel.app/ai-astrology`
2. **Expected**: AI section landing page with report options

---

## 🔍 **IF STILL NOT WORKING**

### **Check Environment Variable Value**:

In Vercel, make sure:
- ✅ Key: `NEXT_PUBLIC_AI_ONLY_MODE` (exact spelling)
- ✅ Value: `true` (lowercase, no quotes)
- ✅ Environment: Production selected
- ✅ Scope: Can be "All Environments" or "Production"

**Common Mistakes**:
- ❌ Value: `"true"` (with quotes) → Won't work
- ❌ Value: `True` or `TRUE` → Won't work
- ❌ Value: `1` or `yes` → Won't work
- ✅ Value: `true` (lowercase, no quotes) → Correct

---

## 🚀 **QUICK TEST**

### **Before Fix**:
- `https://astrosetu-app.vercel.app/` → Shows orange landing page (Kundli, Match, etc.)
- `https://astrosetu-app.vercel.app/ai-astrology` → Should show AI section

### **After Fix (AI_ONLY_MODE enabled)**:
- `https://astrosetu-app.vercel.app/` → Redirects to AI section
- `https://astrosetu-app.vercel.app/ai-astrology` → Shows AI section

---

## 📝 **SUMMARY**

**Current Behavior**:
- Base URL shows main AstroSetu landing page
- AI section accessible at `/ai-astrology`

**After Enabling AI_ONLY_MODE**:
- Base URL redirects to AI section
- AI section accessible at `/ai-astrology`

**Action**: Set `NEXT_PUBLIC_AI_ONLY_MODE=true` in Vercel, then redeploy.

---

**Last Updated**: January 6, 2026  
**Estimated Fix Time**: 2-3 minutes

