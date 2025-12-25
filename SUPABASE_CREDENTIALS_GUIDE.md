# 📋 Step-by-Step Guide: Get Supabase Credentials

This guide will walk you through getting all your Supabase API credentials for Vercel.

---

## Prerequisites

- A Supabase account (sign up at https://supabase.com if you don't have one)
- A Supabase project created (or create one during this process)

---

## Step 1: Sign In to Supabase

1. Go to **https://supabase.com**
2. Click **"Sign In"** (top right corner)
3. Sign in with:
   - GitHub (recommended)
   - Email
   - Google

---

## Step 2: Access Your Project

### If You Already Have a Project:

1. After signing in, you'll see your **Dashboard**
2. Click on your project name (e.g., "astrosetu" or "My Project")
3. You'll be taken to your project dashboard

### If You Need to Create a Project:

1. Click **"New Project"** button (top right)
2. Fill in the form:
   - **Name**: `astrosetu` (or any name you prefer)
   - **Database Password**: Create a strong password (⚠️ **Save this password!** You'll need it)
   - **Region**: Choose closest to your users (e.g., "Southeast Asia (Mumbai)" for India)
3. Click **"Create new project"**
4. Wait 2-3 minutes for the project to initialize
5. You'll be automatically taken to your project dashboard

---

## Step 3: Navigate to API Settings

Once you're in your project dashboard:

1. Look at the **left sidebar** menu
2. Find and click on **"Settings"** (gear icon ⚙️)
   - It's usually near the bottom of the sidebar
   - Icon looks like a gear/cog
3. In the Settings submenu, click on **"API"**
   - This will show you all your API credentials

---

## Step 4: Find Your Credentials

You should now see the **API Settings** page with several sections:

### Section 1: Project URL

**What to look for:**
- Label: **"Project URL"** or **"Project API URL"**
- Format: `https://xxxxxxxxxxxxx.supabase.co`
- Example: `https://abcdefghijklmnop.supabase.co`

**What to do:**
1. Find the text box with your Project URL
2. Click the **copy icon** (📋) next to it, OR
3. Select all the text and copy it (Ctrl+C / Cmd+C)
4. This is your **`NEXT_PUBLIC_SUPABASE_URL`** value

**Visual Guide:**
```
┌─────────────────────────────────────────┐
│ Project URL                             │
│ ┌─────────────────────────────────────┐ │
│ │ https://xxxxx.supabase.co      [📋] │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

### Section 2: API Keys

You'll see multiple API keys listed. Here's what each one is:

#### A. anon / public Key

**What to look for:**
- Label: **"anon"** or **"public"** or **"anon public"**
- Description: "This key is safe to use in a browser"
- Format: Very long string starting with `eyJhbGci...`
- Length: 200+ characters

**What to do:**
1. Find the key labeled **"anon"** or **"public"**
2. Click the **copy icon** (📋) next to it, OR
3. Select all the text and copy it
4. This is your **`NEXT_PUBLIC_SUPABASE_ANON_KEY`** value

**Visual Guide:**
```
┌─────────────────────────────────────────┐
│ anon public                             │
│ This key is safe to use in a browser    │
│ ┌─────────────────────────────────────┐ │
│ │ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9│ │
│ │ .eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6... │ │
│ │ ...very long string...          [📋] │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

#### B. service_role Key

**What to look for:**
- Label: **"service_role"** or **"service_role secret"**
- Description: "This key has admin privileges" or "⚠️ Secret key"
- Format: Very long string starting with `eyJhbGci...`
- Length: 200+ characters
- ⚠️ **Warning**: This key has admin access - keep it secret!

**What to do:**
1. Find the key labeled **"service_role"**
2. Click the **copy icon** (📋) next to it, OR
3. Select all the text and copy it
4. This is your **`SUPABASE_SERVICE_ROLE_KEY`** value
5. ⚠️ **Important**: Never share this key publicly!

**Visual Guide:**
```
┌─────────────────────────────────────────┐
│ service_role secret                     │
│ ⚠️ This key has admin privileges        │
│ ┌─────────────────────────────────────┐ │
│ │ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9│ │
│ │ .eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6... │ │
│ │ ...very long string...          [📋] │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

## Step 5: Verify Your Credentials

Before using them, verify the format:

### ✅ NEXT_PUBLIC_SUPABASE_URL
- ✅ Starts with `https://`
- ✅ Contains `.supabase.co`
- ✅ Example: `https://abcdefghijklmnop.supabase.co`

### ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
- ✅ Starts with `eyJ` (JWT token)
- ✅ Very long (200+ characters)
- ✅ Contains dots (`.`) separating parts
- ✅ Example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.xxxxx`

### ✅ SUPABASE_SERVICE_ROLE_KEY
- ✅ Starts with `eyJ` (JWT token)
- ✅ Very long (200+ characters)
- ✅ Contains dots (`.`) separating parts
- ✅ Similar format to anon key but different content

---

## Step 6: Add to Vercel

Now that you have all three credentials:

1. Go to your **Vercel project** → **Settings** → **Environment Variables**
2. Update/add these variables:

### Variable 1: NEXT_PUBLIC_SUPABASE_URL
```
Key: NEXT_PUBLIC_SUPABASE_URL
Value: [Paste your Project URL from Step 4, Section 1]
Example: https://abcdefghijklmnop.supabase.co
```

### Variable 2: NEXT_PUBLIC_SUPABASE_ANON_KEY
```
Key: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: [Paste your anon/public key from Step 4, Section 2A]
Example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.xxxxx
```

### Variable 3: SUPABASE_SERVICE_ROLE_KEY
```
Key: SUPABASE_SERVICE_ROLE_KEY
Value: [Paste your service_role key from Step 4, Section 2B]
Example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjE2MjM5MDIyLCJleHAiOjE5MzE4MTUwMjJ9.xxxxx
```

3. For each variable, make sure to:
   - Select **"Production"** environment (at minimum)
   - Optionally select **"Preview"** and **"Development"** if needed
4. Click **"Save"** or **"Finish update"**

---

## Step 7: Set Up Database Tables (Important!)

After adding credentials, you need to set up your database:

1. In Supabase dashboard, go to **"SQL Editor"** (left sidebar)
2. Click **"New Query"**
3. Open the file `SUPABASE_SETUP.md` from your project
4. Copy the entire SQL script
5. Paste it into the SQL Editor
6. Click **"Run"** or press `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)
7. Wait for success message
8. Verify tables were created:
   - Go to **"Table Editor"** (left sidebar)
   - You should see tables: `profiles`, `transactions`, `saved_reports`, `chat_sessions`, `chat_messages`

---

## Troubleshooting

### "I can't find the Settings menu"
- Look for a **gear icon (⚙️)** in the left sidebar
- It's usually at the bottom of the sidebar
- If you're on mobile, it might be in a hamburger menu (☰)

### "I don't see the API section"
- Make sure you clicked on **"Settings"** first
- Then look for **"API"** in the submenu
- It should be one of the first options under Settings

### "The keys look the same"
- They're both JWT tokens, so they look similar
- The **anon key** is safe to expose (public)
- The **service_role key** is secret (admin access)
- Double-check the labels - they should say "anon" vs "service_role"

### "I copied the wrong key"
- Go back to Settings → API
- Make sure you're copying from the correct section
- The **anon** key is for `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- The **service_role** key is for `SUPABASE_SERVICE_ROLE_KEY`

### "My project isn't showing up"
- Make sure you're signed in to the correct account
- Check if you have multiple organizations/teams
- Switch between organizations if needed (top left dropdown)

---

## Security Reminders

### ✅ Safe to Expose (Public):
- `NEXT_PUBLIC_SUPABASE_URL` - This is your public project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - This is designed to be public

### 🔒 Keep Secret:
- `SUPABASE_SERVICE_ROLE_KEY` - ⚠️ **NEVER expose this!**
  - Only use in server-side code
  - Never commit to Git
  - Only add to Vercel environment variables (server-side)

---

## Next Steps

After adding credentials to Vercel:

1. **Redeploy your application:**
   - Go to Vercel → Deployments
   - Click three dots (⋯) → Redeploy

2. **Test your setup:**
   - Visit your deployment URL
   - Try to register a new account
   - Check if it works without errors

3. **Verify in Supabase:**
   - Go to Supabase → Table Editor → `profiles`
   - You should see your registered user

---

## Quick Reference

| Variable Name | Where to Find | Format |
|--------------|---------------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Settings → API → Project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Settings → API → anon public | `eyJ...` (JWT token) |
| `SUPABASE_SERVICE_ROLE_KEY` | Settings → API → service_role | `eyJ...` (JWT token) |

---

**Need more help?** See `SUPABASE_SETUP.md` for detailed database setup instructions.
