# 🚀 Start Local Stack for Testing

## Simple 2-Step Process

---

## Step 1: Start Backend (Terminal 1)

```bash
cd /Users/amitkumarmandal/Documents/astroCursor/astrosetu
npm run dev
```

**✅ Backend will start on: http://localhost:3001**

Wait until you see: `✓ Ready in X seconds`

---

## Step 2: Start Mobile App (Terminal 2)

### Option A: Use Expo (Easiest - No Native Setup) ⭐ RECOMMENDED

```bash
cd /Users/amitkumarmandal/Documents/astroCursor/astrosetu/mobile

# Install Expo CLI (first time only)
npm install -g expo-cli

# Start Expo
npx expo start
```

**Then:**
- Press `i` for iOS simulator
- Press `a` for Android emulator
- OR scan QR code with Expo Go app on your phone

### Option B: Initialize React Native CLI (If you need native features)

```bash
# Go to parent directory
cd /Users/amitkumarmandal/Documents/astroCursor/astrosetu

# Create React Native project (one time)
npx react-native@latest init AstroSetuMobile --skip-install

# Copy your code
cp -r mobile/src AstroSetuMobile/
cp mobile/package.json AstroSetuMobile/
cp mobile/tsconfig.json AstroSetuMobile/
cp mobile/babel.config.js AstroSetuMobile/
cp mobile/metro.config.js AstroSetuMobile/
cp mobile/App.tsx AstroSetuMobile/
cp mobile/index.js AstroSetuMobile/

# Install dependencies
cd AstroSetuMobile
npm install

# For iOS (Mac only)
cd ios && pod install && cd ..

# Start Metro
npm start

# In Terminal 3, run:
npm run ios    # or npm run android
```

---

## ✅ Verify Everything Works

### Backend
Open browser: http://localhost:3001/api/health

Should see: `{"ok":true,"status":"healthy"}`

### Mobile
- App should load in simulator/emulator
- Metro bundler should show "Metro waiting on..."

---

## 🔧 Configuration

### Mobile API URL
Make sure `mobile/src/constants/config.ts` has:
```typescript
export const API_BASE_URL = __DEV__
  ? 'http://localhost:3001/api'  // For simulator/emulator
  : 'https://your-production-domain.com/api';
```

**For physical device**, use your computer's IP:
```typescript
export const API_BASE_URL = __DEV__
  ? 'http://192.168.1.XXX:3001/api'  // Replace XXX with your IP
  : 'https://your-production-domain.com/api';
```

Find your IP:
```bash
ipconfig getifaddr en0  # macOS
```

---

## 🐛 Troubleshooting

### "iOS project folder not found"
**Solution**: Use Expo (Option A) - it doesn't need native folders!

### "Cannot connect to backend"
- Check backend is running: http://localhost:3001
- For physical device, use IP address instead of localhost
- Check firewall settings

### "Metro bundler errors"
```bash
cd mobile
npm start -- --reset-cache
```

---

## 📝 Quick Commands Reference

```bash
# Backend
cd astrosetu && npm run dev

# Mobile (Expo)
cd astrosetu/mobile && npx expo start

# Mobile (React Native CLI)
cd astrosetu/mobile && npm start
# Then in another terminal: npm run ios
```

---

**That's it! You're ready to test!** 🧪

