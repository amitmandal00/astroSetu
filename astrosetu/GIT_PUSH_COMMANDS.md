# Git Push Commands

## Complete Git Commands

```bash
cd astrosetu

# Stage all changes
git add -A

# Commit all fixes
git commit -m "Fix: Complete login functionality and data extraction

- Fix all login methods (Email, Phone, OTP) with lenient validation like AstroSage
- Implement phone login with OTP flow
- Enhanced ascendant and tithi extraction with calculation fallbacks
- Fix icon 404 errors (icon-192.png and icon-512.png created)
- Improve error handling and user-friendly messages
- Better phone number validation and formatting
- Demo mode always succeeds (like AstroSage/AstroTalk)"

# Push to remote
git push origin main
```

## Individual Commits (Optional)

If you prefer separate commits:

```bash
cd astrosetu

# Login fixes
git add src/lib/validation.ts src/app/api/auth/login/route.ts src/app/api/auth/send-otp/route.ts src/app/api/auth/verify-otp/route.ts src/app/api/auth/register/route.ts src/app/login/page.tsx src/lib/http.ts
git commit -m "Fix: All login methods (Email, Phone, OTP) with lenient validation"

# Data extraction fixes
git add src/lib/prokeralaTransform.ts src/app/kundli/page.tsx
git commit -m "Fix: Enhanced ascendant and tithi extraction with calculation fallbacks"

# Icon fixes
git add public/icon-*.png public/generate-icons.html public/create-icons.sh scripts/generate-icons.js
git commit -m "Fix: Add missing PWA icons (icon-192.png, icon-512.png)"

# Documentation
git add *.md
git commit -m "docs: Add fix documentation"

# Push all
git push origin main
```

## Quick One-Liner

```bash
cd astrosetu && git add -A && git commit -m "Fix: Complete login functionality and data extraction" && git push origin main
```
