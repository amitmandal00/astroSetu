# React Native Mobile App - Initialization Guide

## ⚠️ Important Note

The mobile app structure has been created, but React Native requires **native Android and iOS projects** to run. You have two options:

## Option 1: Initialize New React Native Project (Recommended)

This is the cleanest approach - create a fresh React Native project and copy our code into it.

### Step 1: Initialize React Native Project

```bash
# Navigate to parent directory
cd /Users/amitkumarmandal/Documents/astroCursor/astrosetu

# Create new React Native project
npx @react-native-community/cli@latest init AstroSetuMobile --template react-native-template-typescript

# This will create a new folder: AstroSetuMobile/
```

### Step 2: Copy Our Code

```bash
# Copy our source code
cp -r mobile/src AstroSetuMobile/
cp mobile/App.tsx AstroSetuMobile/
cp mobile/index.js AstroSetuMobile/
cp mobile/package.json AstroSetuMobile/
cp mobile/tsconfig.json AstroSetuMobile/
cp mobile/babel.config.js AstroSetuMobile/
cp mobile/metro.config.js AstroSetuMobile/
cp mobile/.eslintrc.js AstroSetuMobile/
cp mobile/app.json AstroSetuMobile/

# Navigate to new project
cd AstroSetuMobile
```

### Step 3: Install Dependencies

```bash
# Install all dependencies
npm install

# Install additional dependencies we need
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/stack @react-navigation/native-stack
npm install @react-native-async-storage/async-storage
npm install react-native-gesture-handler react-native-reanimated react-native-safe-area-context react-native-screens
npm install react-native-vector-icons
npm install react-native-linear-gradient
npm install axios
npm install react-native-razorpay
npm install react-native-image-picker
npm install react-native-push-notification
npm install react-native-localize i18n-js
npm install date-fns
npm install react-native-shimmer-placeholder

# For iOS
cd ios && pod install && cd ..
```

### Step 4: Update package.json Scripts

Make sure `package.json` has these scripts:

```json
{
  "scripts": {
    "android": "react-native run-android",
    "ios": "react-native run-ios",
    "start": "react-native start",
    "test": "jest",
    "lint": "eslint ."
  }
}
```

### Step 5: Run the App

```bash
# Start Metro bundler
npm start

# In another terminal, run Android
npm run android

# Or run iOS
npm run ios
```

---

## Option 2: Use Expo (Alternative - Easier Setup)

If you prefer a simpler setup without native code management:

### Step 1: Install Expo CLI

```bash
npm install -g expo-cli
```

### Step 2: Create Expo Project

```bash
cd /Users/amitkumarmandal/Documents/astroCursor/astrosetu
npx create-expo-app AstroSetuMobile --template
# Choose "blank (TypeScript)"

cd AstroSetuMobile
```

### Step 3: Install Dependencies

```bash
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/stack
npm install @react-native-async-storage/async-storage
npm install react-native-vector-icons
npm install axios
# ... other dependencies
```

### Step 4: Copy Our Code

Copy all files from `mobile/src/` to `AstroSetuMobile/src/`

### Step 5: Run

```bash
npm start
# Then press 'a' for Android or 'i' for iOS
```

**Note**: Expo has limitations with some native modules (like Razorpay). You may need to use Expo's managed workflow or eject to bare React Native.

---

## Option 3: Manual Native Setup (Advanced)

If you want to keep the current structure, you need to create the native projects manually:

### For Android

1. Create `android/` folder structure
2. Add `build.gradle` files
3. Add `AndroidManifest.xml`
4. Configure Gradle wrapper

### For iOS

1. Create `ios/` folder structure
2. Add Xcode project files
3. Create `Podfile`
4. Configure Info.plist

This is complex and not recommended. Use Option 1 instead.

---

## Recommended Approach

**Use Option 1** - Initialize a fresh React Native project and copy our code. This ensures:
- ✅ Proper native project structure
- ✅ All build configurations correct
- ✅ Easy to run and debug
- ✅ Standard React Native setup

---

## Quick Start (After Initialization)

Once you've initialized the project:

```bash
cd AstroSetuMobile

# Install dependencies
npm install

# For iOS
cd ios && pod install && cd ..

# Start Metro
npm start

# Run on device/emulator
npm run android  # or npm run ios
```

---

## Troubleshooting

### Metro bundler port already in use
```bash
lsof -ti:8081 | xargs kill -9
```

### Android build fails
```bash
cd android
./gradlew clean
cd ..
npm run android
```

### iOS build fails
```bash
cd ios
pod deintegrate
pod install
cd ..
npm run ios
```

---

## Next Steps After Setup

1. ✅ Test authentication flow
2. ✅ Test Kundli generation
3. ✅ Test API connectivity
4. ✅ Complete remaining screens
5. ✅ Add payment integration
6. ✅ Add push notifications

---

**Need help?** Check the main `README_SETUP.md` for more details.

