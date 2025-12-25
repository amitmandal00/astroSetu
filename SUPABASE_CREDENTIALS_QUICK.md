# 🚀 Quick Checklist: Get Supabase Credentials

Follow these steps in order:

---

## ✅ Step-by-Step Checklist

### Step 1: Sign In
- [ ] Go to https://supabase.com
- [ ] Click "Sign In" (top right)
- [ ] Sign in with GitHub/Email/Google

### Step 2: Open Your Project
- [ ] Click on your project name in dashboard
- [ ] (If no project: Click "New Project" → Fill form → Create)

### Step 3: Navigate to API Settings
- [ ] Click **"Settings"** (⚙️ gear icon) in left sidebar
- [ ] Click **"API"** in the Settings submenu

### Step 4: Copy Project URL
- [ ] Find **"Project URL"** section
- [ ] Copy the URL (format: `https://xxxxx.supabase.co`)
- [ ] ✅ This is `NEXT_PUBLIC_SUPABASE_URL`

### Step 5: Copy anon/public Key
- [ ] Find **"anon public"** or **"anon"** key section
- [ ] Copy the key (long string starting with `eyJ...`)
- [ ] ✅ This is `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Step 6: Copy service_role Key
- [ ] Find **"service_role"** or **"service_role secret"** section
- [ ] Copy the key (long string starting with `eyJ...`)
- [ ] ⚠️ Keep this secret!
- [ ] ✅ This is `SUPABASE_SERVICE_ROLE_KEY`

### Step 7: Add to Vercel
- [ ] Go to Vercel → Your Project → Settings → Environment Variables
- [ ] Add/Update `NEXT_PUBLIC_SUPABASE_URL` with Project URL
- [ ] Add/Update `NEXT_PUBLIC_SUPABASE_ANON_KEY` with anon key
- [ ] Add/Update `SUPABASE_SERVICE_ROLE_KEY` with service_role key
- [ ] Set environment to "Production" (at minimum)
- [ ] Click "Save" or "Finish update"

### Step 8: Set Up Database
- [ ] In Supabase, go to **"SQL Editor"** (left sidebar)
- [ ] Click **"New Query"**
- [ ] Open `SUPABASE_SETUP.md` from your project
- [ ] Copy the SQL script
- [ ] Paste into SQL Editor
- [ ] Click **"Run"**
- [ ] Verify tables created in **"Table Editor"**

### Step 9: Redeploy
- [ ] Go to Vercel → Deployments
- [ ] Click three dots (⋯) on latest deployment
- [ ] Click **"Redeploy"**

---

## 📋 What Each Credential Looks Like

### Project URL
```
https://abcdefghijklmnop.supabase.co
```

### anon/public Key
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.xxxxx
```
(200+ characters, starts with `eyJ`)

### service_role Key
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjE2MjM5MDIyLCJleHAiOjE5MzE4MTUwMjJ9.xxxxx
```
(200+ characters, starts with `eyJ`)

---

## 🎯 Where to Find in Supabase Dashboard

```
Supabase Dashboard
├── Left Sidebar
│   ├── Table Editor
│   ├── SQL Editor
│   ├── Authentication
│   ├── ...
│   └── Settings (⚙️) ← Click here
│       ├── General
│       ├── API ← Click here for credentials
│       ├── Database
│       └── ...
```

---

## ⚠️ Common Mistakes to Avoid

- ❌ Don't copy the wrong key (anon vs service_role)
- ❌ Don't include extra spaces when copying
- ❌ Don't share service_role key publicly
- ❌ Don't forget to set environment scope in Vercel
- ❌ Don't forget to redeploy after adding variables

---

## 🔍 Verification

After adding to Vercel, verify:

- [ ] `NEXT_PUBLIC_SUPABASE_URL` starts with `https://` and ends with `.supabase.co`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` starts with `eyJ` and is 200+ characters
- [ ] `SUPABASE_SERVICE_ROLE_KEY` starts with `eyJ` and is 200+ characters
- [ ] All warnings in Vercel are gone
- [ ] Application redeployed successfully

---

**For detailed instructions, see `SUPABASE_CREDENTIALS_GUIDE.md`**
