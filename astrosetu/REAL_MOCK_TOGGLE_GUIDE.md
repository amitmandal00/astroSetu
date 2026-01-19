# Real/Mock Report Toggle - User Guide

**Date**: 2026-01-19  
**Status**: ✅ Implemented

---

## Overview

A UI toggle switch has been added to the preview page that allows you to easily switch between **Mock Reports** (fast, free) and **Real AI Reports** (slower, costs money) for test sessions.

---

## How to Use

### 1. Access the Toggle

The toggle is **only visible for test sessions** (when `session_id` starts with `test_session_`).

**Example test session URL:**
```
https://www.mindveda.net/ai-astrology/preview?session_id=test_session_decision-support_req-123&reportType=decision-support&auto_generate=true
```

### 2. Locate the Toggle

The toggle appears as a **banner at the top** of the preview page (above the download PDF buttons), only visible when:
- You're using a test session (`test_session_*`)
- The page has loaded

**Visual Appearance:**
- **Left side**: Label and description
- **Right side**: Toggle switch (Mock ↔ Real AI)
- **Color-coded**: 
  - Gray = Mock mode
  - Purple = Real AI mode

### 3. Toggle Between Modes

**To Switch to Real AI:**
1. Click the toggle switch to the right (turns purple)
2. Label changes to "Real AI"
3. URL automatically updates with `?use_real=true`
4. Warning message appears below the toggle

**To Switch Back to Mock:**
1. Click the toggle switch to the left (turns gray)
2. Label changes to "Mock"
3. URL automatically removes `use_real=true`
4. Warning message disappears

### 4. Generate Report

**After toggling:**
1. Toggle persists across page navigation (URL-based)
2. Next report generation uses the selected mode
3. No need to manually edit URLs
4. Toggle state is saved in URL (bookmarkable)

---

## Visual Guide

### Mock Mode (Default)
```
🧪 Test Mode: Report Generation
Toggle between Mock Reports (fast, free) and Real AI Reports (30-60s, costs ~$0.01-0.05)

Mock  [●────────]  Real AI
```

### Real AI Mode (Active)
```
🧪 Test Mode: Report Generation
Toggle between Mock Reports (fast, free) and Real AI Reports (30-60s, costs ~$0.01-0.05)

Mock  [──────●]  Real AI

⚠️ Real AI Mode Active: Next report generation will use OpenAI API (costs money, takes longer).
Mock content will be stripped from results.
```

---

## Technical Details

### URL Parameter
The toggle automatically manages the URL parameter:
- **Mock Mode**: No `use_real` parameter (or removed if present)
- **Real AI Mode**: Adds `?use_real=true` to URL

### State Management
- Toggle state is **URL-based** (persists across navigation)
- Reads from URL on page load
- Updates URL when toggled (no page reload)
- Syncs with generation controller automatically

### Generation Behavior
- **Mock Mode**: Uses mock fixtures (`getMockReport`) - 2-3 seconds
- **Real AI Mode**: Calls OpenAI API - 30-60 seconds, costs ~$0.01-0.05 per report

---

## Comparison of Methods

### Method 1: UI Toggle (RECOMMENDED ✅)
**Pros:**
- ✅ Easy to use (just click a switch)
- ✅ Visual feedback (color-coded)
- ✅ No manual URL editing
- ✅ Clear warnings about costs
- ✅ URL persists across navigation

**Cons:**
- Only available on preview page (for test sessions)

**Best For:** Interactive testing, quick switching between modes

---

### Method 2: URL Query Parameter (Manual)
**Pros:**
- ✅ Works from any page
- ✅ Can bookmark/share URLs
- ✅ No UI changes needed

**Cons:**
- ❌ Requires manual URL editing
- ❌ Easy to forget parameter
- ❌ No visual feedback

**Best For:** Scripted testing, sharing test URLs, CI/CD pipelines

**Usage:**
```
?use_real=true
```

---

### Method 3: Environment Variable (Global)
**Pros:**
- ✅ Affects all test sessions globally
- ✅ No per-session configuration
- ✅ Good for bulk testing

**Cons:**
- ❌ Requires deployment/redeploy
- ❌ Affects ALL test sessions (can't mix)
- ❌ No per-session control

**Best For:** Extended real AI testing phases, production validation

**Usage:**
Set in Vercel or `.env.local`:
```
ALLOW_REAL_FOR_TEST_SESSIONS=true
```

---

## Recommendation

**For interactive testing**: Use **Method 1 (UI Toggle)** - Easy, visual, no manual work.

**For automated/scripted testing**: Use **Method 2 (URL Parameter)** - Flexible, bookmarkable, CI/CD friendly.

**For bulk real AI testing**: Use **Method 3 (Environment Variable)** - Set once, affects all test sessions.

---

## Examples

### Example 1: Quick Toggle Test
1. Open test session URL (without `use_real`)
2. See toggle shows "Mock" mode
3. Click toggle to switch to "Real AI"
4. URL updates to include `?use_real=true`
5. Generate report → Uses real AI

### Example 2: Bookmark Real AI Mode
1. Open test session URL
2. Toggle to "Real AI" mode
3. Copy URL (now includes `?use_real=true`)
4. Bookmark for future use
5. Bookmarked URL always generates real reports

### Example 3: Mixed Testing
1. Generate report with Mock mode (fast, verify structure)
2. Toggle to Real AI mode
3. Generate same report with Real AI (verify content quality)
4. Compare both reports side-by-side

---

## Troubleshooting

### Toggle Not Visible
**Problem**: Toggle doesn't appear
**Solution**: 
- Ensure you're using a test session URL (`test_session_*`)
- Check that `session_id` parameter is in URL
- Refresh the page

### Toggle State Not Persisting
**Problem**: Toggle resets after page reload
**Solution**:
- Toggle updates URL automatically
- Check URL contains `?use_real=true` in Real AI mode
- URL is the source of truth (not localStorage)

### Real AI Not Generating
**Problem**: Real AI mode selected but still getting mock reports
**Solution**:
- Verify URL contains `?use_real=true`
- Check browser console for `[TEST MODE]` log messages
- Ensure OpenAI API key is configured
- Check server logs for `[TEST SESSION - REAL MODE FORCED]`

---

## Implementation Details

**File**: `src/app/ai-astrology/preview/page.tsx`

**Changes**:
- Added toggle state management
- Added UI component (only visible for test sessions)
- URL parameter sync (automatic updates)
- Visual feedback and warnings

**Related Files**:
- `src/app/api/ai-astrology/generate-report/route.ts` - Backend logic
- `src/hooks/useReportGenerationController.ts` - Generation controller

---

**Last Updated**: 2026-01-19  
**Status**: ✅ Implemented and Ready for Use

