# 🔑 Add Prokerala Credentials to .env.local

## Quick Setup Instructions

### Step 1: Open .env.local File

Open the `.env.local` file in your project root (`astrosetu/.env.local`)

### Step 2: Add These Lines

Add or update these lines in your `.env.local` file:

```bash
# Prokerala API Configuration
PROKERALA_CLIENT_ID=4aedeb7a-2fd2-4cd4-a0ec-11b01a895749
PROKERALA_CLIENT_SECRET=06SCo9ssJB0nQWYbDWx7GXvnNAc0dqMhDrvIYZ6o
```

### Step 3: Save the File

Save the `.env.local` file.

### Step 4: Restart Server

```bash
cd astrosetu
npm run dev
```

---

## Complete .env.local Example

Your `.env.local` should look like this:

```bash
# Prokerala API Configuration
PROKERALA_CLIENT_ID=4aedeb7a-2fd2-4cd4-a0ec-11b01a895749
PROKERALA_CLIENT_SECRET=06SCo9ssJB0nQWYbDWx7GXvnNAc0dqMhDrvIYZ6o

# Razorpay Configuration (if you have it)
# RAZORPAY_KEY_ID=your_razorpay_key_id
# RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Supabase Configuration (if you have it)
# NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## ✅ Verification

After adding credentials and restarting:

1. **Check server starts without errors**
2. **Visit:** `http://localhost:3001/test-comparison`
3. **Generate Kundli** - should use Prokerala API (not mock)
4. **Check browser console** - should see API calls

---

## 🎯 Your Prokerala Client Details

- **Client Name:** AstroSetu
- **Client ID:** `4aedeb7a-2fd2-4cd4-a0ec-11b01a895749`
- **Client Secret:** `06SCo9ssJB0nQWYbDWx7GXvnNAc0dqMhDrvIYZ6o`
- **Status:** Live Client ✅
- **JavaScript Origins:** `http://localhost:3001` ✅

---

**Ready to proceed!** Add the credentials above to `.env.local` and restart your server.

