# 📦 Install 2FA Packages

To enable 2FA functionality, install the required packages:

```bash
cd astrosetu
npm install otplib qrcode @types/qrcode
```

## Packages Required:
- **otplib**: Industry-standard TOTP (Time-based One-Time Password) library
- **qrcode**: QR code generation for authenticator app setup
- **@types/qrcode**: TypeScript types for qrcode

## After Installation:
1. Restart the dev server: `npm run dev`
2. The 2FA features will be available
3. Users can setup 2FA from their profile
4. Login will prompt for 2FA if enabled

