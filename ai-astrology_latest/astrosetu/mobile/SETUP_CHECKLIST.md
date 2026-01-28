# Mobile App Setup Checklist

## Pre-Setup Verification

Before running the setup, verify:

- [ ] Node.js >= 18 installed (`node -v`)
- [ ] npm installed (`npm -v`)
- [ ] Android Studio installed (for Android development)
- [ ] Xcode installed (for iOS, macOS only)
- [ ] Internet connection available
- [ ] Terminal access ready

## Setup Process

### Step 1: Run Setup Script

```bash
cd /Users/amitkumarmandal/Documents/astroCursor/astrosetu/mobile
./setup-step-by-step.sh
```

**Expected Output:**
- ✅ Caches cleared
- ✅ Project created
- ✅ Code copied
- ✅ Dependencies installed
- ✅ iOS pods installed (if macOS)

**Time:** 5-10 minutes

### Step 2: Verify Project Created

```bash
cd /Users/amitkumarmandal/Documents/astroCursor/astrosetu
ls -la AstroSetuMobile/
```

**Should see:**
- [ ] `android/` folder exists
- [ ] `ios/` folder exists (macOS)
- [ ] `src/` folder exists
- [ ] `App.tsx` exists
- [ ] `package.json` exists
- [ ] `node_modules/` exists

### Step 3: Verify Dependencies

```bash
cd AstroSetuMobile
npm list --depth=0
```

**Key packages should be installed:**
- [ ] react-native
- [ ] @react-navigation/native
- [ ] @react-native-async-storage/async-storage
- [ ] react-native-gesture-handler
- [ ] react-native-vector-icons
- [ ] axios

## Post-Setup Verification

### Check Android Setup

```bash
cd android
./gradlew --version
```

- [ ] Gradle is working
- [ ] Android SDK is configured

### Check iOS Setup (macOS only)

```bash
cd ios
pod --version
ls Pods/
```

- [ ] CocoaPods installed
- [ ] Pods directory exists

### Verify Code Structure

```bash
cd /Users/amitkumarmandal/Documents/astroCursor/astrosetu/AstroSetuMobile
ls -la src/
```

**Should see:**
- [ ] `screens/` folder
- [ ] `components/` folder
- [ ] `navigation/` folder
- [ ] `services/` folder
- [ ] `theme/` folder
- [ ] `context/` folder

## Running the App

### Start Metro Bundler

```bash
cd AstroSetuMobile
npm start
```

**Check:**
- [ ] Metro starts without errors
- [ ] Shows "Metro waiting on port 8081"
- [ ] No red error messages

### Run on Android

**Terminal 2:**
```bash
cd AstroSetuMobile
npm run android
```

**Check:**
- [ ] Android emulator starts OR device is connected
- [ ] App builds successfully
- [ ] App launches on device/emulator
- [ ] No red screen errors

### Run on iOS (macOS only)

**Terminal 2:**
```bash
cd AstroSetuMobile
npm run ios
```

**Check:**
- [ ] iOS simulator starts OR device is connected
- [ ] App builds successfully
- [ ] App launches on simulator/device
- [ ] No red screen errors

## Troubleshooting Checklist

If setup fails:

- [ ] Cleared npm cache: `npm cache clean --force`
- [ ] Cleared React Native temp files: `rm -rf /tmp/rncli-*`
- [ ] Tried Expo alternative: `./init-react-native-alternative.sh`
- [ ] Checked network connection
- [ ] Verified Node.js version >= 18
- [ ] Checked disk space (need ~2GB free)

## Success Criteria

Setup is successful when:

- ✅ Project directory exists
- ✅ All dependencies installed
- ✅ Metro bundler starts
- ✅ App builds without errors
- ✅ App launches on device/emulator
- ✅ No red screen errors
- ✅ Can navigate between screens
- ✅ API calls work (if backend is running)

## Next Steps After Setup

1. ✅ Test authentication flow
2. ✅ Test Kundli generation
3. ✅ Test API connectivity
4. ✅ Complete remaining screen implementations
5. ✅ Add payment integration
6. ✅ Add push notifications
7. ✅ Add video/voice calls

---

**Mark items as you complete them!** ✅

