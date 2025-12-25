# 🔑 How to Get Prokerala API Credentials

## Step-by-Step Guide

### Step 1: Visit Prokerala API Website

1. Go to **https://api.prokerala.com/**
2. Click on **"Sign Up"** or **"Get Started"** button

---

### Step 2: Create an Account

1. **Sign Up Options:**
   - Email registration
   - Google account (if available)
   - GitHub account (if available)

2. **Fill in Required Information:**
   - Email address
   - Password
   - Name
   - Company/Organization (optional)

3. **Verify Your Email:**
   - Check your inbox for verification email
   - Click the verification link

---

### Step 3: Access Your Dashboard

1. **Login** to your Prokerala account
2. Navigate to **"Dashboard"** or **"API"** section
3. Look for **"API Credentials"** or **"Applications"** tab

---

### Step 4: Create an Application

1. Click **"Create New Application"** or **"Add Application"**
2. Fill in application details:
   - **Application Name**: e.g., "AstroSetu"
   - **Description**: Brief description of your app
   - **Redirect URI**: (optional, for OAuth flows)
   - **Website URL**: (optional)

3. **Save** the application

---

### Step 5: Get Your Credentials

After creating the application, you'll see:

1. **Client ID** (also called Application ID)
   - Example: `abc123xyz456`
   - Copy this value

2. **Client Secret** (also called Application Secret)
   - Example: `secret789def012`
   - **Important**: Copy this immediately - it's shown only once!
   - If you lose it, you'll need to regenerate it

---

### Step 6: Choose Your Plan

Prokerala offers different plans:

1. **Free Trial** (Recommended for testing)
   - Limited API calls per day
   - Good for development and testing
   - No credit card required

2. **Paid Plans** (For production)
   - Higher API limits
   - Better performance
   - Support included
   - Check pricing at: https://api.prokerala.com/api-credits/

---

### Step 7: Configure in AstroSetu

Once you have your credentials:

1. **Open `.env.local`** file in your project root
2. **Add your credentials** in one of these formats:

**Option 1: Separate Variables (Recommended)**
```bash
PROKERALA_CLIENT_ID=your_client_id_here
PROKERALA_CLIENT_SECRET=your_client_secret_here
```

**Option 2: Combined Format**
```bash
PROKERALA_API_KEY=your_client_id:your_client_secret
```

3. **Save** the file
4. **Restart** your development server:
   ```bash
   npm run dev
   ```

---

## 🔍 Where to Find Credentials in Dashboard

### Common Dashboard Locations:

1. **API Credentials Section**
   - Usually in the top navigation
   - Look for "API", "Credentials", or "Applications"

2. **Application Details Page**
   - Click on your application name
   - Credentials are shown in a table or card

3. **Settings/Profile**
   - Sometimes under "Settings" → "API"
   - Or "Profile" → "API Keys"

---

## 📸 Visual Guide

### Typical Dashboard Layout:

```
┌─────────────────────────────────────┐
│  Prokerala API Dashboard            │
├─────────────────────────────────────┤
│  [Applications] [API Keys] [Usage] │
├─────────────────────────────────────┤
│                                     │
│  Application: AstroSetu             │
│  ┌───────────────────────────────┐ │
│  │ Client ID: abc123xyz456        │ │
│  │ Client Secret: secret789def012 │ │
│  │ [Copy] [Regenerate]            │ │
│  └───────────────────────────────┘ │
│                                     │
│  API Calls Today: 45 / 1000        │
│  Plan: Free Trial                   │
└─────────────────────────────────────┘
```

---

## ⚠️ Important Security Notes

1. **Never Commit Credentials to Git**
   - `.env.local` is already in `.gitignore`
   - Never share credentials publicly
   - Use environment variables in production

2. **Keep Credentials Secret**
   - Client Secret is like a password
   - Don't share it with anyone
   - Regenerate if compromised

3. **Regenerate if Needed**
   - If you lose your secret, regenerate it
   - Old secret will stop working
   - Update `.env.local` with new secret

---

## 🧪 Testing Your Credentials

After adding credentials:

1. **Start the server:**
   ```bash
   npm run dev
   ```

2. **Check API status:**
   - Visit: `http://localhost:3001/test-comparison`
   - Try generating a Kundli
   - Check browser console for errors

3. **Verify in logs:**
   - Look for "Prokerala API" messages
   - Should see successful API calls
   - No "API not configured" errors

---

## 🐛 Troubleshooting

### Problem: "Credentials not found"
**Solution:**
- Check `.env.local` file exists
- Verify variable names are correct
- Restart server after adding credentials

### Problem: "Failed to get access token"
**Solution:**
- Verify Client ID and Secret are correct
- Check for extra spaces in credentials
- Ensure account is active

### Problem: "API quota exceeded"
**Solution:**
- Check your API usage in dashboard
- Wait for quota reset (usually daily)
- Consider upgrading plan

### Problem: "Invalid credentials"
**Solution:**
- Double-check Client ID and Secret
- Ensure no typos
- Try regenerating credentials

---

## 📞 Support

If you need help:

1. **Prokerala Support:**
   - Email: support@prokerala.com
   - Documentation: https://api.prokerala.com/
   - Community Forum: (if available)

2. **Check Documentation:**
   - Getting Started: https://api.prokerala.com/getting-started
   - API Reference: https://api.prokerala.com/docs

---

## ✅ Quick Checklist

- [ ] Created Prokerala account
- [ ] Verified email
- [ ] Created application
- [ ] Copied Client ID
- [ ] Copied Client Secret
- [ ] Added to `.env.local`
- [ ] Restarted server
- [ ] Tested API connection
- [ ] Verified calculations work

---

## 🎯 Next Steps

After getting credentials:

1. ✅ Add to `.env.local`
2. ✅ Restart server
3. ✅ Test at `/test-comparison`
4. ✅ Compare with AstroSage.com
5. ✅ Verify calculations match

---

**Last Updated**: December 2024
**Status**: Ready to Use

