# 🚀 Quick Start Guide - Testing & API Configuration

This guide will help you quickly set up and test AstroSetu.

---

## Step 1: Install Dependencies

```bash
cd astrosetu
npm install
```

---

## Step 2: Configure APIs (Choose Your Path)

### Option A: Automated Setup (Recommended)

Run the setup script:

```bash
./setup-apis.sh
```

This interactive script will guide you through:
- Supabase configuration
- Razorpay configuration
- Prokerala configuration (optional)

### Option B: Manual Setup

1. **Copy environment file:**
   ```bash
   cp .env.example .env.local
   ```

2. **Edit `.env.local`** and add your API keys:
   ```env
   # Supabase (Required for real data persistence)
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

   # Razorpay (Required for real payments)
   RAZORPAY_KEY_ID=rzp_test_xxxxx
   RAZORPAY_SECRET=your_secret

   # Prokerala (Optional - for real astrology data)
   PROKERALA_API_KEY=your_key
   ```

3. **See detailed setup guides:**
   - `SUPABASE_SETUP.md` - Database setup
   - `RAZORPAY_SETUP.md` - Payment setup
   - `PROKERALA_SETUP.md` - Astrology API setup

---

## Step 3: Set Up Supabase Database

If you configured Supabase:

1. Go to your Supabase dashboard
2. Open SQL Editor
3. Copy the entire SQL from `SUPABASE_SETUP.md`
4. Paste and run it
5. Verify tables are created (should see 5 tables)

**Note**: App works without Supabase (uses mock data), but real persistence requires this step.

---

## Step 4: Start Development Server

```bash
npm run dev
```

Server will start on http://localhost:3001

---

## Step 5: Test the Application

### Option A: Automated Testing

Run the test script:

```bash
./test-app.sh
```

This will test:
- Home page loading
- API endpoints
- Basic functionality

### Option B: Manual Testing

1. **Open http://localhost:3001 in your browser**

2. **Test Core Features:**
   - ✅ Home page loads
   - ✅ Navigate to Kundli page
   - ✅ Fill form and generate Kundli
   - ✅ Test Match compatibility
   - ✅ Check Horoscope for different signs
   - ✅ View Panchang
   - ✅ Test Numerology

3. **Test User Features:**
   - ✅ Register a new account
   - ✅ Login
   - ✅ View profile
   - ✅ Edit profile

4. **Test Payment:**
   - ✅ Go to Wallet page
   - ✅ Click "Add Money"
   - ✅ Test payment flow (or mock mode)

5. **Test Chat:**
   - ✅ Go to Astrologers page
   - ✅ Start a chat session
   - ✅ Send messages
   - ✅ Check real-time updates

---

## Step 6: Comprehensive Testing

Follow the detailed checklist:

```bash
# Open the testing checklist
cat FINAL_TESTING_CHECKLIST.md
```

Or view it in your editor and check off each item.

---

## 🎯 Testing Scenarios

### Scenario 1: Without Any APIs (Mock Mode)
- ✅ App should work completely
- ✅ All features functional with mock data
- ✅ No errors in console
- ✅ Good for development/testing

### Scenario 2: With Supabase Only
- ✅ User registration/login works
- ✅ Data persists in database
- ✅ Chat sessions saved
- ✅ Wallet transactions saved

### Scenario 3: With Supabase + Razorpay
- ✅ Everything from Scenario 2
- ✅ Real payment processing
- ✅ Wallet recharge works
- ✅ Transactions verified

### Scenario 4: With All APIs
- ✅ Everything from Scenario 3
- ✅ Real astrology calculations
- ✅ Accurate Kundli/Match results
- ✅ Production-ready

---

## 🔍 Troubleshooting

### Server Won't Start
```bash
# Check if port 3001 is in use
lsof -i :3001

# Kill process if needed
kill -9 <PID>

# Or use different port
npm run dev -- -p 3002
```

### API Errors
- Check `.env.local` has correct keys
- Verify API keys are valid
- Check browser console for errors
- Check server logs in terminal

### Database Errors
- Verify Supabase project is active
- Check SQL schema was run
- Verify RLS policies are enabled
- Check Supabase dashboard for errors

### Payment Errors
- Verify Razorpay keys are correct
- Check if using test keys (for development)
- Verify keys match environment (test/live)
- Check Razorpay dashboard for errors

---

## 📊 Testing Checklist Summary

Quick checklist - mark as you test:

### Core Features (7)
- [ ] Kundli Generation
- [ ] Marriage Matching
- [ ] Horoscope (Daily/Weekly/Monthly/Yearly)
- [ ] Panchang
- [ ] Muhurat
- [ ] Numerology
- [ ] Remedies

### User Features
- [ ] Registration
- [ ] Login
- [ ] Profile Management
- [ ] Chat Sessions
- [ ] Chat History

### Payment
- [ ] Wallet Display
- [ ] Add Money
- [ ] Payment Flow
- [ ] Transaction History

### UI/UX
- [ ] Mobile Responsive
- [ ] Desktop Layout
- [ ] Loading States
- [ ] Error Messages
- [ ] Navigation

---

## 🚀 Next Steps After Testing

1. **Fix any issues found**
2. **Configure production APIs** (if using)
3. **Deploy to Vercel/Netlify**
4. **Set up monitoring** (optional)
5. **Launch! 🎉**

---

## 📚 Need Help?

- See `FINAL_TESTING_CHECKLIST.md` for detailed testing
- See `SUPABASE_SETUP.md` for database help
- See `RAZORPAY_SETUP.md` for payment help
- See `PROKERALA_SETUP.md` for astrology API help
- Check browser console for errors
- Check server logs for API errors

---

**Happy Testing! 🧪**

