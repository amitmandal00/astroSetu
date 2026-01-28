# Simple Start Guide
## Get the Stack Running Quickly

---

## 🚀 Quick Start (3 Steps)

### Step 1: Start Backend
```bash
cd /Users/amitkumarmandal/Documents/astroCursor/astrosetu
npm run dev
```

**Backend will run on: http://localhost:3001**

---

### Step 2: Start Mobile App (Choose One)

#### Option A: Use Expo (Easiest) ⭐ RECOMMENDED
```bash
cd /Users/amitkumarmandal/Documents/astroCursor/astrosetu/mobile

# Install Expo CLI if needed
npm install -g expo-cli

# Start Expo
npx expo start
```

Then:
- Press `i` for iOS simulator
- Press `a` for Android emulator  
- Scan QR code with Expo Go app on your phone

#### Option B: Initialize React Native CLI
```bash
cd /Users/amitkumarmandal/Documents/astroCursor/astrosetu/mobile

# Initialize project (one time)
cd ..
npx react-native@latest init AstroSetuMobile --skip-install

# Copy code
cp -r mobile/src AstroSetuMobile/
cp mobile/package.json AstroSetuMobile/
cp mobile/tsconfig.json AstroSetuMobile/
cp mobile/babel.config.js AstroSetuMobile/
cp mobile/metro.config.js AstroSetuMobile/

# Install and run
cd AstroSetuMobile
npm install
npm start
# In another terminal: npm run ios or npm run android
```

---

### Step 3: Verify

**Backend:**
- Open: http://localhost:3001
- Health check: http://localhost:3001/api/health

**Mobile:**
- App should load in simulator/emulator/phone
- Metro bundler should show "Metro waiting on..."

---

## 🔧 Configuration

### Backend API URL
Make sure `mobile/src/constants/config.ts` has:
```typescript
export const API_BASE_URL = __DEV__
  ? 'http://localhost:3001/api'
  : 'https://your-production-domain.com/api';
```

### For Physical Device Testing
If testing on a physical device, use your computer's IP address:
```typescript
export const API_BASE_URL = __DEV__
  ? 'http://192.168.1.X:3001/api'  // Replace X with your IP
  : 'https://your-production-domain.com/api';
```

Find your IP:
```bash
# macOS
ipconfig getifaddr en0

# Linux
hostname -I | awk '{print $1}'
```

---

## ✅ That's It!

You should now have:
- ✅ Backend running on port 3001
- ✅ Mobile app running in simulator/emulator/phone
- ✅ Ready for testing!

---

## 🐛 Common Issues

### "iOS project folder not found"
**Solution**: Use Expo (Option A) or initialize React Native project (Option B)

### "Cannot connect to backend"
**Solution**: 
- Check backend is running on port 3001
- For physical device, use IP address instead of localhost
- Check firewall settings

### "Metro bundler errors"
**Solution**:
```bash
cd mobile
npm start -- --reset-cache
```

---

**Ready to test!** 🧪

