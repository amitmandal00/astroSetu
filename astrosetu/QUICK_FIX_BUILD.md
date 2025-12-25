# Quick Fix for Build Errors

## Issue
The build is failing because `qrcode` and `otplib` packages are not installed.

## Solution

Run this command to install the missing packages:

```bash
cd astrosetu
npm install
```

This will install:
- `qrcode` - For generating QR codes for 2FA
- `otplib` - For TOTP (Time-based One-Time Password) functionality

## After Installation

Run the build again:

```bash
npm run build
```

The build should now succeed!

## Note

The code has been updated to handle these packages gracefully - if they're not installed, the app will use fallback implementations. However, for production, these packages should be installed for full 2FA functionality.
