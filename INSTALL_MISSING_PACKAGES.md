# Install Missing Packages

The build requires two additional packages that need to be installed:

```bash
cd astrosetu
npm install qrcode otplib
```

Or add them manually to `package.json` and run `npm install`.

These packages are used for:
- **qrcode**: Generating QR codes for 2FA setup
- **otplib**: Time-based One-Time Password (TOTP) for 2FA

After installing, the build should succeed.
