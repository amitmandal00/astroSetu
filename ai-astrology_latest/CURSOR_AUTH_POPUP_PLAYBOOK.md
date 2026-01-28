# Cursor in-app “Allow popups safely” — Playbook

Goal: when Cursor’s embedded auth/webview blocks a login with **“Allow popups safely”**, use the **lowest-friction + safest** path and record it once so it doesn’t stall you again.

## What to capture (every time it happens)
Add an entry to `CURSOR_ACTIONS_REQUIRED.md` with:
- provider (GitHub/Google/Supabase/Stripe/etc.)
- the **exact domain** shown in the embedded page (copy/paste)
- what you clicked (Allow once / Always allow / Open in browser)

## Preferred fixes (in order)
1. **Open in browser** (best): use “Open in browser / external link” in the auth UI, complete login in your normal browser, return to Cursor.
2. **Allow popups for this provider only** (ok): allow popups only for the auth domain involved.
3. **Fallback**: retry the auth flow after restarting Cursor (only if it’s glitchy).

## Provider notes (fill in as you encounter)

### GitHub OAuth
- **Common domains**: `github.com`, `githubusercontent.com`
- **Preferred**: Open in browser.
- **Allow**: only GitHub domains if you choose allow-popups.

### Google OAuth
- **Common domains**: `accounts.google.com`
- **Preferred**: Open in browser (Google popups are frequently blocked in embedded views).

### Supabase (dashboard/auth)
- **Common domains**: `supabase.com`, `<project-ref>.supabase.co`
- **Preferred**: Open in browser for the sign-in, then return.

### Stripe (if used for auth/checkout tools)
- **Common domains**: `stripe.com`, `checkout.stripe.com`
- **Preferred**: Open in browser.

## “Always allow” safety rule
- Only use “Always allow” if the domain is **exactly** one of your known auth providers and you trust the workspace.


