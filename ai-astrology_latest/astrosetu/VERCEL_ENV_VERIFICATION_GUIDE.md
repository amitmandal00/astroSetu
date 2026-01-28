# 🔍 How to Verify Vercel Environment Variables

## Step-by-Step Instructions

### Step 1: Access Vercel Dashboard

1. **Go to Vercel Dashboard**
   - Open: https://vercel.com/dashboard
   - Log in if needed

2. **Select Your Project**
   - Click on **"astrosetu-app"** (or your project name)

### Step 2: Navigate to Environment Variables

1. **Go to Settings**
   - Click **"Settings"** tab in the top navigation

2. **Open Environment Variables Section**
   - In left sidebar, click **"Environment Variables"** (under "Environments" section)
   - You should now see the environment variables page

### Step 3: Check Environment Selection

**IMPORTANT**: Make sure you're viewing the correct environment!

At the top, you'll see tabs or dropdown:
- **"Production"** - Variables for production deployments
- **"Preview"** - Variables for preview deployments  
- **"Development"** - Variables for development

✅ **Click on "Production"** to verify production variables are set

### Step 4: Verify Required Variables

#### ✅ **Check These Variables Exist** (Copy this checklist):

**Core Configuration**:
- [ ] `NODE_ENV` (should be `production`)
- [ ] `NEXT_PUBLIC_APP_URL` (should be your production URL, e.g., `https://astrosetu-app.vercel.app`)

**Supabase (Database)**:
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`

**Email (Resend)**:
- [ ] `RESEND_API_KEY`
- [ ] `RESEND_FROM`

**Payments (Stripe - AI Section)**:
- [ ] `STRIPE_SECRET_KEY` ✅ (You have this)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` ✅ (You have this)
- [ ] `STRIPE_WEBHOOK_SECRET` ❓ **NOT NEEDED** (No webhook endpoint exists)

**AI (OpenAI)**:
- [ ] `OPENAI_API_KEY` ✅ (You have this)

**Astrology (Prokerala)**:
- [ ] `PROKERALA_CLIENT_ID` ✅ (You have this)
- [ ] `PROKERALA_CLIENT_SECRET` ✅ (You have this)

---

## 📝 **How to Check if a Variable Exists**

1. **Look at the list** - Variables are listed with their names
2. **Check the "Environments" column** - Should say "All Environments" or "Production"
3. **Click the eye icon** - To verify the value (if you have permission)
4. **Check "Last Updated"** - Recent date means it was recently set

---

## ⚠️ **About STRIPE_WEBHOOK_SECRET**

**Status**: ❌ **NOT NEEDED**

**Reason**: 
- Your code uses **direct Stripe session verification** (not webhooks)
- The `/api/ai-astrology/verify-payment` endpoint retrieves sessions directly from Stripe
- No webhook endpoint exists in your codebase
- **You can ignore this variable** - it's not required

**If you see it in your list**: You can leave it or remove it (doesn't matter)

---

## ✅ **Quick Verification Checklist**

### Must Have (Production):
- ✅ `NEXT_PUBLIC_APP_URL` - **CRITICAL**
- ✅ `STRIPE_SECRET_KEY` - For payments
- ✅ `RESEND_API_KEY` - For emails
- ✅ `OPENAI_API_KEY` - For AI reports
- ✅ `NEXT_PUBLIC_SUPABASE_URL` - For database

### Already Have (From Your Screenshot):
All the variables I saw in your screenshot are set! ✅

### Verify:
- [ ] All variables are set for **"Production"** environment (not just Preview)
- [ ] Values are not placeholder text (like "your-key-here")
- [ ] `NEXT_PUBLIC_APP_URL` matches your actual Vercel URL

---

## 🔧 **If a Variable is Missing**

1. **Click "Create new"** button
2. **Enter the variable name** (e.g., `STRIPE_SECRET_KEY`)
3. **Enter the value**
4. **Select "Production"** from Environments dropdown
5. **Click "Save"**
6. **Redeploy** your application for changes to take effect

---

## 📸 **Visual Guide**

```
Vercel Dashboard
  └── Your Project (astrosetu-app)
      └── Settings
          └── Environment Variables
              └── [Select "Production" tab]
                  └── [View list of variables]
                      └── [Check each variable exists]
```

---

## ✅ **Verification Complete**

After checking:
- ✅ All required variables exist
- ✅ They're set for Production environment
- ✅ Values are real (not placeholders)

**You're good to go!** 🚀

---

## 🆘 **Can't Find Environment Variables?**

**Alternative Method**:
1. Go to your project in Vercel
2. Click **"Deployments"** tab
3. Click on latest deployment
4. Check **"Environment Variables"** section in deployment details
5. Or use Vercel CLI:
   ```bash
   vercel env ls
   ```

---

**Last Updated**: January 6, 2026

