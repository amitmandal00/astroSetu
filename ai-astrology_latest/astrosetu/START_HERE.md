# 🚀 Quick Start Guide - Local Stack

## Start Everything for Testing

### Option 1: Start Full Stack (Backend + Mobile) ⭐ RECOMMENDED

```bash
cd /Users/amitkumarmandal/Documents/astroCursor/astrosetu
./start-stack.sh
```

This will:
- ✅ Start Next.js backend on port 3001
- ✅ Start mobile Metro bundler
- ✅ Check and initialize React Native project if needed

---

### Option 2: Start Components Separately

#### Start Backend Only
```bash
cd /Users/amitkumarmandal/Documents/astroCursor/astrosetu
npm run dev
```

Backend will run on: **http://localhost:3001**

#### Start Mobile App Only
```bash
cd /Users/amitkumarmandal/Documents/astroCursor/astrosetu/mobile
./quick-start.sh
```

---

## 🔧 First Time Setup

### If React Native Project Not Initialized

The mobile app needs to be initialized as a React Native project. You have two options:

#### Option A: Use Expo (Easier) ⭐ RECOMMENDED
```bash
cd mobile
npm install -g expo-cli
npx expo start
```

Then:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on your phone

#### Option B: React Native CLI
```bash
cd mobile
./quick-start.sh
# Choose option 2
```

---

## 📱 Testing the Mobile App

### With Expo (Easier)
1. Install Expo Go app on your phone
2. Run `npx expo start` in mobile directory
3. Scan QR code with Expo Go

### With React Native CLI
1. Make sure iOS Simulator or Android Emulator is running
2. Run `npm run ios` or `npm run android`

---

## 🌐 Testing the Web App

1. Start backend: `npm run dev`
2. Open: http://localhost:3001
3. Test all features

---

## ✅ Verify Everything is Running

### Backend Health Check
```bash
curl http://localhost:3001/api/health
```

Should return: `{"ok":true,"status":"healthy"}`

### API Overview
Open in browser: http://localhost:3001/api

### Mobile App
- Metro bundler should show "Metro waiting on..."
- App should load in simulator/emulator/phone

---

## 🐛 Troubleshooting

### Backend Issues
- **Port 3001 already in use**: Kill the process or change port
- **Missing dependencies**: Run `npm install`
- **API errors**: Check `.env.local` configuration

### Mobile Issues
- **"iOS project folder not found"**: Run `./quick-start.sh` to initialize
- **Metro bundler errors**: Clear cache with `npm start -- --reset-cache`
- **Build errors**: Check that all dependencies are installed

### Quick Fixes
```bash
# Clear all caches
cd mobile
rm -rf node_modules
npm install
npm start -- --reset-cache

# For backend
cd ..
rm -rf .next
npm install
npm run dev
```

---

## 📝 Next Steps

1. ✅ Start backend: `npm run dev`
2. ✅ Start mobile: `cd mobile && ./quick-start.sh`
3. ✅ Test features
4. ✅ Compare with AstroSage/AstroTalk apps
5. ✅ Fill in test results

---

**Ready to test!** 🧪

