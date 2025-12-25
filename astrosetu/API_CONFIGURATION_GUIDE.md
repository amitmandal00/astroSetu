# 🔧 API Configuration Guide

Complete step-by-step guide to configure all APIs for AstroSetu.

---

## 📋 Overview

AstroSetu uses three main APIs:
1. **Supabase** - Database & Authentication (Recommended)
2. **Razorpay** - Payment Gateway (Recommended)
3. **Prokerala** - Astrology API (Optional)

**Important**: The app works without any APIs (mock mode), but real features require API configuration.

---

## 1️⃣ Supabase Setup (Database & Auth)

### Why Supabase?
- User authentication
- Data persistence
- Chat history
- Transaction records
- Free tier available (500MB, 50K users)

### Step-by-Step:

1. **Create Account**
   - Go to https://supabase.com
   - Click "Start your project"
   - Sign up with GitHub/Email

2. **Create Project**
   - Click "New Project"
   - Enter project name: `astrosetu`
   - Enter database password (save it!)
   - Select region (closest to you)
   - Click "Create new project"
   - Wait ~2 minutes for setup

3. **Get Credentials**
   - Go to **Settings** → **API**
   - Copy **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - Copy **anon/public key** (starts with `eyJ...`)

4. **Run Database Schema**
   - Go to **SQL Editor** in Supabase dashboard
   - Click "New Query"
   - Copy entire SQL from `SUPABASE_SETUP.md`
   - Paste and click "Run"
   - Verify 5 tables created: `profiles`, `transactions`, `saved_reports`, `chat_sessions`, `chat_messages`

5. **Configure Environment**
   ```bash
   # Add to .env.local
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```

6. **Test**
   - Restart dev server: `npm run dev`
   - Go to http://localhost:3001/login
   - Register a new account
   - Check Supabase dashboard → Table Editor → `profiles` (should see your user)

### Troubleshooting:
- **"Invalid API key"**: Check you copied the full key
- **"Table doesn't exist"**: Run SQL schema again
- **"RLS policy error"**: Verify SQL schema ran completely

---

## 2️⃣ Razorpay Setup (Payments)

### Why Razorpay?
- Indian payment gateway
- UPI, Cards, Netbanking support
- Easy integration
- Test mode available

### Step-by-Step:

1. **Create Account**
   - Go to https://razorpay.com
   - Click "Sign Up"
   - Complete registration

2. **Get Test Keys** (For Development)
   - Log in to Razorpay Dashboard
   - Go to **Settings** → **API Keys**
   - Click "Generate Test Key"
   - Copy **Key ID** (starts with `rzp_test_...`)
   - Copy **Key Secret** (long string)

3. **Get Live Keys** (For Production)
   - Complete KYC verification
   - Go to **Settings** → **API Keys**
   - Click "Generate Live Key"
   - Copy **Key ID** and **Key Secret**

4. **Configure Environment**
   ```bash
   # Add to .env.local (use test keys for development)
   RAZORPAY_KEY_ID=rzp_test_xxxxx
   RAZORPAY_SECRET=your_secret_here
   ```

5. **Test Payment**
   - Restart dev server
   - Go to Wallet page
   - Click "Add Money"
   - Enter amount (min ₹100)
   - Use test card: `4111 1111 1111 1111`
   - CVV: Any 3 digits
   - Expiry: Any future date
   - Complete payment
   - Verify wallet balance updates

### Test Cards:
- **Success**: `4111 1111 1111 1111`
- **Failure**: `4000 0000 0000 0002`
- CVV: Any 3 digits
- Expiry: Any future date

### Troubleshooting:
- **"Invalid key"**: Check you're using test keys for test mode
- **"Payment failed"**: Use correct test card number
- **"Signature error"**: Verify secret key is correct

---

## 3️⃣ Prokerala Setup (Astrology API)

### Why Prokerala?
- Real Vedic astrology calculations
- Accurate Kundli/Match results
- Panchang, Muhurat data
- Free tier available

### Step-by-Step:

1. **Sign Up**
   - Go to https://www.prokerala.com/api/
   - Click "Sign Up" or "Get API Key"
   - Complete registration

2. **Get API Key**
   - Log in to your account
   - Navigate to API Dashboard
   - Copy your **API Key**

3. **Configure Environment**
   ```bash
   # Add to .env.local
   PROKERALA_API_KEY=your_api_key_here
   ```

4. **Test**
   - Restart dev server
   - Generate a Kundli
   - Verify results are from real API (not mock)

### Note:
- App works without Prokerala (uses mock calculations)
- Mock data is fine for development
- Real API needed for production accuracy

### Troubleshooting:
- **"API key invalid"**: Check key is correct
- **"Rate limit"**: Free tier has limits
- **"No response"**: Check API status

---

## 🔄 Quick Configuration

### Using Setup Script:

```bash
./setup-apis.sh
```

This interactive script guides you through all configurations.

### Manual Configuration:

1. Copy environment template:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local`:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key

   # Razorpay
   RAZORPAY_KEY_ID=your_key_id
   RAZORPAY_SECRET=your_secret

   # Prokerala (Optional)
   PROKERALA_API_KEY=your_key
   ```

3. Restart server:
   ```bash
   npm run dev
   ```

---

## ✅ Verification Checklist

After configuration, verify:

- [ ] Supabase: Can register/login
- [ ] Supabase: Data persists (check dashboard)
- [ ] Razorpay: Payment modal opens
- [ ] Razorpay: Test payment works
- [ ] Prokerala: Kundli uses real API (optional)

---

## 🎯 Configuration Modes

### Mode 1: No APIs (Mock Mode)
- ✅ All features work
- ✅ Mock data everywhere
- ✅ Good for development
- ❌ No persistence
- ❌ No real payments
- ❌ Mock calculations

### Mode 2: Supabase Only
- ✅ User accounts work
- ✅ Data persists
- ✅ Chat history saved
- ❌ Mock payments
- ❌ Mock calculations

### Mode 3: Supabase + Razorpay
- ✅ Everything from Mode 2
- ✅ Real payments
- ✅ Wallet works
- ❌ Mock calculations

### Mode 4: All APIs (Production)
- ✅ Everything works
- ✅ Real data
- ✅ Real payments
- ✅ Real calculations
- ✅ Production ready

---

## 📚 Additional Resources

- `SUPABASE_SETUP.md` - Detailed Supabase guide
- `RAZORPAY_SETUP.md` - Detailed Razorpay guide
- `PROKERALA_SETUP.md` - Detailed Prokerala guide
- `QUICK_START_GUIDE.md` - Quick setup guide

---

**Need help?** Check the detailed setup guides or run `./setup-apis.sh` for interactive help.

