# Quick Start - Local Stack
## Get Everything Running for Testing

---

## 🎯 Two Terminal Windows Needed

### Terminal 1: Backend (Next.js)
```bash
cd /Users/amitkumarmandal/Documents/astroCursor/astrosetu
npm run dev
```

**✅ Backend will run on: http://localhost:3001**

---

### Terminal 2: Mobile App

#### Option A: Use Expo (Easiest) ⭐ RECOMMENDED
```bash
cd /Users/amitkumarmandal/Documents/astroCursor/astrosetu/mobile

# First time only - install Expo CLI
npm install -g expo-cli

# Start Expo
npx expo start
# OR
npm run expo
```

**Then:**
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app

#### Option B: React Native CLI (If you have native projects)
```bash
cd /Users/amitkumarmandal/Documents/astroCursor/astrosetu/mobile

# Start Metro bundler
npm start

# In another terminal (Terminal 3):
npm run ios    # For iOS
# OR
npm run android  # For Android
```

---

## ✅ Verify Everything is Running

### 1. Check Backend
Open browser: http://localhost:3001/api/health

Should see: `{"ok":true,"status":"healthy"}`

### 2. Check Mobile
- Metro bundler should show "Metro waiting on..."
- App should load in simulator/emulator/phone

---

## 🔧 First Time Setup

### If Mobile App Shows "iOS project folder not found"

**Quick Fix - Use Expo:**
```bash
cd mobile
npm install -g expo-cli
npx expo start
```

This doesn't require iOS/Android native folders!

---

## 📱 Testing Checklist

- [ ] Backend running on port 3001
- [ ] Mobile app loaded in simulator/emulator
- [ ] Can navigate between screens
- [ ] Can generate Kundli
- [ ] API calls working
- [ ] Share functionality works
- [ ] Settings accessible

---

## 🐛 Troubleshooting

### Backend Issues
```bash
# Port already in use?
lsof -ti:3001 | xargs kill -9

# Missing dependencies?
npm install

# Clear cache?
rm -rf .next
npm run dev
```

### Mobile Issues
```bash
# Clear Metro cache
cd mobile
npm start -- --reset-cache

# Reinstall dependencies
rm -rf node_modules
npm install
```

### Can't Connect Mobile to Backend
- **For Simulator/Emulator**: Use `http://localhost:3001/api`
- **For Physical Device**: Use `http://YOUR_IP:3001/api`
  - Find IP: `ipconfig getifaddr en0` (macOS)

---

## 🚀 That's It!

You should now have:
- ✅ Backend: http://localhost:3001
- ✅ Mobile: Running in simulator/emulator
- ✅ Ready for testing!

---

**Start testing!** 🧪

