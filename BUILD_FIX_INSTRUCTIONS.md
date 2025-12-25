# Build Fix Instructions

## Critical: Install Missing Packages

The build is failing because `qrcode` and `otplib` packages are not installed.

### Quick Fix:

```bash
cd astrosetu
npm install
```

This will install the packages that were added to `package.json`:
- `qrcode` - For generating QR codes for 2FA
- `otplib` - For TOTP (Time-based One-Time Password) functionality

### After Installation:

```bash
npm run build
```

The build should now succeed!

## What Was Fixed

1. ✅ Added `qrcode` and `otplib` to `package.json`
2. ✅ Updated import syntax to use runtime `require()` instead of build-time imports
3. ✅ Fixed all ESLint unescaped entity errors
4. ✅ Fixed duplicate imports and exports
5. ✅ Fixed `"use client"` directive placement

## Note

The code has been updated to handle these packages gracefully - if they're not installed, the app will use fallback implementations. However, **you must install them for the build to succeed** because webpack tries to resolve all imports at build time.

## Alternative: Make Packages Optional

If you want to build without these packages (using fallbacks only), you would need to configure webpack to ignore them, but it's recommended to just install them since they're already in `package.json`.

---

**Run `npm install` now to fix the build!**
