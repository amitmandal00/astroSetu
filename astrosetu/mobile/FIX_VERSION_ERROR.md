# Fix Version Error - React Native Setup

## Problem

The setup script failed with:
```
npm error notarget No matching version found for @react-native-community/cli@0.73.0
```

This happens because the specific version doesn't exist or isn't available.

## ✅ Solution: Use Expo (Recommended)

Expo is the most reliable way to set up React Native and avoids version issues:

```bash
cd /Users/amitkumarmandal/Documents/astroCursor/astrosetu/mobile
./init-react-native-alternative.sh
# Choose option 1 (Expo)
```

Then copy our code:
```bash
cd /Users/amitkumarmandal/Documents/astroCursor/astrosetu
cp -r mobile/src AstroSetuMobile/
cp mobile/App.tsx AstroSetuMobile/
cp mobile/index.js AstroSetuMobile/
cp mobile/package.json AstroSetuMobile/
cp mobile/tsconfig.json AstroSetuMobile/
cp mobile/babel.config.js AstroSetuMobile/
cp mobile/metro.config.js AstroSetuMobile/
```

## Alternative: Use Latest Version

The script has been updated to use `@latest` instead of a specific version. Try again:

```bash
cd /Users/amitkumarmandal/Documents/astroCursor/astrosetu/mobile
./setup-step-by-step.sh
```

## Why Expo is Better

1. ✅ No version conflicts
2. ✅ No template download issues
3. ✅ Easier setup
4. ✅ Better error messages
5. ✅ Works consistently

## Quick Expo Setup

```bash
# Step 1: Create Expo project
cd /Users/amitkumarmandal/Documents/astroCursor/astrosetu
npx create-expo-app@latest AstroSetuMobile --template blank-typescript

# Step 2: Copy our code
cp -r mobile/src AstroSetuMobile/
cp mobile/App.tsx AstroSetuMobile/
cp mobile/index.js AstroSetuMobile/
cp mobile/package.json AstroSetuMobile/
cp mobile/tsconfig.json AstroSetuMobile/
cp mobile/babel.config.js AstroSetuMobile/
cp mobile/metro.config.js AstroSetuMobile/

# Step 3: Install dependencies
cd AstroSetuMobile
npm install

# Step 4: Install additional packages
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/stack
npm install @react-native-async-storage/async-storage
npm install react-native-gesture-handler react-native-reanimated
npm install react-native-safe-area-context react-native-screens
npm install react-native-vector-icons react-native-linear-gradient
npm install axios date-fns

# Step 5: Run
npm start
# Then press 'a' for Android or 'i' for iOS
```

---

**Recommended: Use Expo for the most reliable setup!** 🚀

