# Fix Permission Error - npm Global Installation

## Problem

Getting permission error when installing packages globally:
```
EACCES: permission denied, mkdir '/usr/local/lib/node_modules/expo-cli'
```

This happens when npm tries to install packages globally without proper permissions.

## ✅ Solution: Use npx (No Global Installation Needed)

**Good news:** You don't need to install anything globally! Use `npx` instead:

```bash
cd /Users/amitkumarmandal/Documents/astroCursor/astrosetu/mobile
./init-react-native-alternative.sh
# Choose option 1 (Expo)
```

The script has been updated to use `npx` which doesn't require global installation.

## Alternative: Fix npm Permissions (If Needed)

If you still need global packages, fix npm permissions:

### Option 1: Use npm's Recommended Method

```bash
# Create a directory for global packages
mkdir ~/.npm-global

# Configure npm to use this directory
npm config set prefix '~/.npm-global'

# Add to your shell profile (~/.zshrc or ~/.bash_profile)
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc

# Reload your shell
source ~/.zshrc
```

### Option 2: Use sudo (Not Recommended)

```bash
sudo npm install -g expo-cli
```

**Note:** Using sudo with npm is not recommended as it can cause permission issues later.

### Option 3: Use npx (Recommended - No Installation)

Just use `npx` - it doesn't require global installation:

```bash
# Instead of: npm install -g expo-cli
# Just use: npx create-expo-app@latest

npx create-expo-app@latest AstroSetuMobile --template blank-typescript
```

## Quick Expo Setup (No Global Install)

```bash
# Step 1: Create Expo project (no global install needed)
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

# Step 3: Install dependencies (local, no permissions needed)
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
# Press 'a' for Android or 'i' for iOS
```

## Why npx is Better

- ✅ No global installation needed
- ✅ No permission issues
- ✅ Always uses latest version
- ✅ No conflicts with system packages
- ✅ Works out of the box

## Updated Script

The `init-react-native-alternative.sh` script has been updated to use `npx` instead of requiring global installation. Just run:

```bash
cd mobile
./init-react-native-alternative.sh
# Choose option 1
```

---

**No permission issues with npx!** 🚀

