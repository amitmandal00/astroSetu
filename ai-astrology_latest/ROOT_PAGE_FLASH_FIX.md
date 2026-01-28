# Root Landing Page Flash Fix

## Problem
The root landing page (`/`) was showing a flash of orange header/footer on initial load. User wants the base URL landing page to also not show the orange Shell header/footer.

## Solution
Added root path (`/`) to the AI routes list so it doesn't render the Shell component with orange header/footer.

## Changes Made

### 1. `astrosetu/src/app/layout.tsx`
- Added `'/'` to `AI_ROUTES` array
- Updated `isAIRoute()` function to explicitly check for root path
- Updated inline script to include `'/'` in `aiRoutes` array and check

### 2. `astrosetu/src/components/layout/ConditionalShell.tsx`
- Updated `checkIfAIRoute()` helper function to return `true` for root path (`"/"`)

## Routes That Now Don't Show Orange Header/Footer

1. `/` - Root landing page ✅ **NEW**
2. `/ai-astrology/*` - All AI astrology pages
3. `/privacy` - Privacy policy
4. `/terms` - Terms & conditions
5. `/disclaimer` - Disclaimer
6. `/refund` - Refund policy
7. `/contact` - Contact page
8. `/disputes` - Disputes page
9. `/cookies` - Cookie policy
10. `/data-breach` - Data breach notification
11. `/compliance` - Compliance page

## How It Works

1. **Server-side**: Layout detects if pathname is `/` and sets `isAIRoute={true}`
2. **Client-side**: Script checks for `/` and sets `data-ai-route="true"`
3. **Component**: ConditionalShell checks pathname and returns children directly (no Shell)
4. **Result**: Root page renders without orange header/footer, no flash

## Testing

### Expected Behavior
- ✅ Visit `https://astrosetu-52hsqvj5v-amits-projects-a49d49fa.vercel.app/` directly
- ✅ No flash of orange header/footer on initial load
- ✅ Landing page renders cleanly without Shell component
- ✅ Works on hard refresh, navigation, and direct URL entry

### Verification
1. Hard refresh the root page: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
2. Navigate from another page to root: Should transition smoothly
3. Direct URL entry: Should load without flash

## Status
✅ **Fixed** - Root landing page now excluded from Shell rendering

