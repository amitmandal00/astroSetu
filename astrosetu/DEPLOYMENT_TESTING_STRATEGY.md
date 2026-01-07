# 🚀 Deployment Testing Strategy

**Date**: January 6, 2026  
**Current Situation**: Preview deployment URL visible, Production deployment exists

---

## 📍 **CURRENT DEPLOYMENT STATUS**

### **What You're Seeing**:
- **Preview URL**: `https://astrosetu-ogd5xl4i0-amits-projects-a49d49fa.vercel.app/ai-astrology`
- **Production URL**: `https://astrosetu-app.vercel.app` (should be the main production domain)

### **From Vercel Dashboard**:
- ✅ Latest deployment (`9Ap9opFY6`) is **Ready** in **Production** environment
- ✅ Deployed 7 minutes ago (after environment variable fixes)
- ✅ Build successful (1m 54s)

---

## 🎯 **RECOMMENDED TESTING APPROACH**

### **Option 1: Test Preview First (Recommended)** ⭐

**Why**:
- ✅ Test changes before promoting to production
- ✅ Safe to test without affecting live users
- ✅ Can verify fixes work correctly

**Steps**:
1. **Test on Preview URL**:
   - URL: `https://astrosetu-ogd5xl4i0-amits-projects-a49d49fa.vercel.app`
   - Test all critical flows (contact form, payment, etc.)
   - Verify environment variables are working
   - Check email delivery, database logging

2. **If Tests Pass → Promote to Production**:
   - Go to Vercel Dashboard → Deployments
   - Find deployment `9Ap9opFY6` (or latest)
   - Click three dots menu → **"Promote"**
   - This will make it the active production deployment

3. **Test Production**:
   - URL: `https://astrosetu-app.vercel.app`
   - Re-run critical tests
   - Verify everything works in production

**Timeline**: ~45-60 minutes (testing preview + production)

---

### **Option 2: Test Production Directly** (If Already Promoted)

**Check if Production is Already Active**:
1. Visit: `https://astrosetu-app.vercel.app`
2. Check if it shows the latest changes (new environment variable values)
3. If yes → Test directly on production
4. If no → Use Option 1 (test preview, then promote)

**Steps**:
1. Verify production URL has latest changes
2. Run full test suite on production
3. Monitor for any issues

---

## 🔍 **HOW TO VERIFY WHICH DEPLOYMENT IS ACTIVE**

### **Method 1: Check Production URL**
1. Visit: `https://astrosetu-app.vercel.app/ai-astrology`
2. Open browser console (F12)
3. Check for any errors
4. Verify features work (should have latest fixes)

### **Method 2: Check Vercel Dashboard**
1. Go to Deployments tab
2. Look for deployment with:
   - **Environment**: Production
   - **Status**: Ready (green dot)
   - **Age**: Most recent (7m ago = `9Ap9opFY6`)
3. If this deployment shows a "Promote" button → Not yet in production
4. If it shows as active/production → Already in production

---

## ✅ **RECOMMENDATION: TEST PREVIEW FIRST**

### **Why This is Best Practice**:

1. **Safety First**:
   - Preview deployments are isolated
   - Won't affect real users
   - Can catch issues before production

2. **Verify Fixes**:
   - Confirm environment variables are correct
   - Test Stripe live keys work
   - Verify Supabase migration worked
   - Check all fixes are applied

3. **Then Promote**:
   - Only promote if all tests pass
   - Production will then have verified code
   - Less risk of breaking production

---

## 🧪 **TESTING CHECKLIST FOR PREVIEW**

Use the same checklist as production, but on preview URL:

### **Quick Test on Preview**:
1. ✅ Contact Form:
   - URL: `https://astrosetu-ogd5xl4i0-amits-projects-a49d49fa.vercel.app/contact`
   - Submit form → Check emails → Verify database

2. ✅ AI Section Purchase:
   - URL: `https://astrosetu-ogd5xl4i0-amits-projects-a49d49fa.vercel.app/ai-astrology`
   - Complete payment → Verify redirect works → Generate report

3. ✅ URL Redirects:
   - Verify `NEXT_PUBLIC_APP_URL` fix (should work correctly)
   - Check payment success page loads

4. ✅ Stripe Integration:
   - Verify live keys work (or test keys if still using test mode)
   - Complete a payment

5. ✅ Database Logging:
   - Check Supabase table has email audit columns
   - Verify data is logged correctly

---

## 🎯 **NEXT STEPS**

### **Step 1: Test Preview Deployment** (30-45 min)
```
URL: https://astrosetu-ogd5xl4i0-amits-projects-a49d49fa.vercel.app
```

**Critical Tests**:
- [ ] Contact form submission
- [ ] Email delivery (acknowledgment + internal)
- [ ] Database logging (Supabase table)
- [ ] AI section purchase flow
- [ ] Payment success redirect (tests NEXT_PUBLIC_APP_URL fix)
- [ ] Report generation
- [ ] PDF download

### **Step 2: If All Tests Pass → Promote to Production**

**In Vercel Dashboard**:
1. Go to Deployments
2. Find deployment `9Ap9opFY6` (or latest Ready deployment)
3. Click three dots menu (⋯)
4. Click **"Promote"**
5. Confirm promotion

**Verify Promotion**:
- Check production URL: `https://astrosetu-app.vercel.app`
- Should now show latest deployment

### **Step 3: Quick Smoke Test on Production** (10 min)

**Test critical flows**:
- [ ] Homepage loads
- [ ] Contact form works
- [ ] AI section loads
- [ ] Quick payment test

**If everything works** → ✅ **You're Live!**

---

## ⚠️ **IMPORTANT NOTES**

### **Preview vs Production URLs**:
- **Preview**: `https://astrosetu-{hash}-amits-projects-{id}.vercel.app`
- **Production**: `https://astrosetu-app.vercel.app`

### **Environment Variables**:
- ✅ Both preview and production should have the same environment variables
- ✅ `NEXT_PUBLIC_APP_URL` should be set to production URL: `https://astrosetu-app.vercel.app`
- ⚠️ Preview deployments will use this URL for redirects (which is correct for production)

### **Stripe Keys**:
- ✅ Live keys should work on both preview and production
- ⚠️ Test payments will appear in Stripe Dashboard regardless of deployment type

---

## 🎯 **FINAL RECOMMENDATION**

**✅ YES - Start Testing on Preview**:
1. Test preview deployment first (`https://astrosetu-ogd5xl4i0-amits-projects-a49d49fa.vercel.app`)
2. Use full test checklist
3. If all tests pass → Promote to production
4. Quick smoke test on production
5. ✅ Go live!

**Timeline**:
- Preview Testing: 30-45 minutes
- Promotion: 1 minute
- Production Smoke Test: 10 minutes
- **Total: ~45-60 minutes**

---

## 📋 **QUICK DECISION FLOWCHART**

```
Is preview deployment ready? 
  ├─ YES → Test on preview URL
  │   ├─ Tests pass? 
  │   │   ├─ YES → Promote to production
  │   │   │   └─ Quick smoke test → Go live!
  │   │   └─ NO → Fix issues → Redeploy → Test again
  │   └─ Continue testing...
  └─ NO → Wait for deployment → Then test
```

---

**Last Updated**: January 6, 2026  
**Status**: Ready for Testing - Use Preview First

