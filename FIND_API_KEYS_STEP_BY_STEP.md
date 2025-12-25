# 🔍 How to Find API Keys in Supabase (Step-by-Step)

## You're Almost There! 

You're currently on the **"General"** settings page. The API credentials are just one click away!

---

## Step-by-Step Instructions

### Step 1: Look at the Left Sidebar

You should see a left sidebar with "PROJECT SETTINGS" section. Under it, you'll see:

```
PROJECT SETTINGS
├── General          ← You are here
├── Compute and Disk
├── Infrastructure
├── Integrations
├── Data API
├── API Keys         ← Click here! ⬅️
├── JWT Keys
└── ...
```

### Step 2: Click on "API Keys"

1. In the **left sidebar**, scroll down if needed
2. Find **"API Keys"** under "PROJECT SETTINGS"
3. Click on **"API Keys"**

### Step 3: You'll See Your Credentials

After clicking "API Keys", you'll see a page with:

1. **Project URL** section
   - Shows: `https://xxxxx.supabase.co`
   - Copy this for `NEXT_PUBLIC_SUPABASE_URL`

2. **API Keys** section with:
   - **anon public** key (long string starting with `eyJ...`)
     - Copy this for `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key (long string starting with `eyJ...`)
     - Copy this for `SUPABASE_SERVICE_ROLE_KEY`

---

## Visual Guide

### Current Page (General):
```
┌─────────────────────────────────────┐
│ Settings                            │
│                                     │
│ PROJECT SETTINGS                    │
│ ├── General          ← You are here│
│ ├── Compute and Disk                │
│ ├── Infrastructure                  │
│ ├── Integrations                    │
│ ├── Data API                        │
│ ├── API Keys         ← Click this! │
│ └── JWT Keys                        │
└─────────────────────────────────────┘
```

### After Clicking "API Keys":
```
┌─────────────────────────────────────┐
│ API Keys                            │
│                                     │
│ Project URL                         │
│ ┌─────────────────────────────────┐ │
│ │ https://xxxxx.supabase.co  [📋]│ │
│ └─────────────────────────────────┘ │
│                                     │
│ anon public                         │
│ ┌─────────────────────────────────┐ │
│ │ eyJhbGci... (long string)  [📋] │ │
│ └─────────────────────────────────┘ │
│                                     │
│ service_role secret                 │
│ ┌─────────────────────────────────┐ │
│ │ eyJhbGci... (long string)  [📋] │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

## Quick Action Steps

1. ✅ You're on: **Settings → General**
2. 👆 Click: **"API Keys"** (in left sidebar, under PROJECT SETTINGS)
3. 📋 Copy: Project URL, anon key, and service_role key
4. ✅ Done!

---

## Alternative Navigation

If you can't find "API Keys" in the sidebar:

1. Look for a **search bar** at the top of the Supabase dashboard
2. Type: **"API"** or **"API Keys"**
3. Click on the result that says "API Keys"

OR

1. In the URL bar, you're currently at:
   ```
   .../settings/general
   ```
2. Change it to:
   ```
   .../settings/api
   ```
3. Press Enter

---

## What You'll See on the API Keys Page

Once you click "API Keys", you'll see:

### Section 1: Project URL
- A text box with your Supabase project URL
- Format: `https://nwbggplcxcsrwooeazdb.supabase.co` (or similar)
- Has a copy button (📋) next to it

### Section 2: API Keys
- **anon public** key
  - Description: "This key is safe to use in a browser"
  - Very long string (200+ characters)
  - Starts with `eyJhbGci...`
  
- **service_role** key
  - Description: "This key has admin privileges" or "⚠️ Secret key"
  - Very long string (200+ characters)
  - Starts with `eyJhbGci...`
  - ⚠️ Keep this secret!

---

## Still Can't Find It?

### Option 1: Use Direct URL
Replace `nwbggplcxcsrwooeazdb` with your actual project ID:

```
https://supabase.com/dashboard/project/nwbggplcxcsrwooeazdb/settings/api
```

### Option 2: Check Your Access
- Make sure you're the project owner or have admin access
- If you're a team member, you might need owner permissions

### Option 3: Try Different Navigation
1. Click the **Supabase logo** (top left) to go to dashboard
2. Click on your project
3. Look for **"Settings"** in the left sidebar
4. Click **"API"** or **"API Keys"**

---

## Summary

**Current Location:** Settings → General  
**Where to Go:** Settings → API Keys (in left sidebar)  
**What to Copy:** Project URL, anon key, service_role key

**Just click "API Keys" in the left sidebar!** 👆
