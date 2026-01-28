# 📋 How to Get Debug Information

## Method 1: Using curl (Terminal/Command Line)

### Step 1: Open Terminal
Open your terminal/command line.

### Step 2: Run This Command
```bash
curl https://astrosetu-app.vercel.app/api/astrology/diagnostic
```

### Step 3: Format the Output (Optional but Recommended)
If you have `jq` installed (JSON formatter):
```bash
curl https://astrosetu-app.vercel.app/api/astrology/diagnostic | jq
```

### Step 4: Get Just the Debug Info
To see only the debug information:
```bash
curl https://astrosetu-app.vercel.app/api/astrology/diagnostic | jq '.data.prokeralaTest.debug'
```

### Step 5: Get Full prokeralaTest Object
```bash
curl https://astrosetu-app.vercel.app/api/astrology/diagnostic | jq '.data.prokeralaTest'
```

---

## Method 2: Using Browser (Easiest)

### Step 1: Open Your Browser
Chrome, Firefox, Safari, or any browser.

### Step 2: Go to This URL
```
https://astrosetu-app.vercel.app/api/astrology/diagnostic
```

### Step 3: View the Response
The browser will show the JSON response. You can:
- **Copy the entire JSON** and share it
- **Look for the `debug` object** in the response
- **Look for `debugInfo`** field if there's an error

---

## Method 3: Using Browser Developer Tools

### Step 1: Open Browser Developer Tools
- **Chrome/Edge:** Press `F12` or `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)
- **Firefox:** Press `F12` or `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)
- **Safari:** Press `Cmd+Option+I` (Mac)

### Step 2: Go to Network Tab
Click on the **"Network"** tab in developer tools.

### Step 3: Visit the Diagnostic URL
Go to: `https://astrosetu-app.vercel.app/api/astrology/diagnostic`

### Step 4: Find the Request
In the Network tab, find the request named **"diagnostic"**

### Step 5: Click on It
Click on the request to see details.

### Step 6: View Response
Click on the **"Response"** or **"Preview"** tab to see the JSON response.

### Step 7: Copy the Response
Right-click on the response → **"Copy"** → **"Copy response"**

---

## What to Look For in the Response

### Full Response Structure:
```json
{
  "ok": true,
  "data": {
    "prokeralaConfigured": true,
    "prokeralaTest": {
      "status": "error" or "connected",
      "panchangTest": "passed" or "failed",
      "panchangError": "...",
      "debug": {
        "method": "GET",
        "endpoint": "/panchang",
        "error": "...",
        "debugInfo": {
          "originalMethod": "...",
          "enforcedMethod": "...",
          "fetchMethod": "...",
          "fetchOptionsMethod": "..."
        }
      }
    }
  }
}
```

### Key Fields to Share:

1. **`debug` object** - Contains all debug information
2. **`debugInfo`** - Shows what methods were used at each step
3. **`panchangError`** - The error message (may contain `[PANCHANG_DEBUG:]`)

---

## Quick Test Commands

### Test 1: Full Response
```bash
curl https://astrosetu-app.vercel.app/api/astrology/diagnostic
```

### Test 2: Just prokeralaTest
```bash
curl https://astrosetu-app.vercel.app/api/astrology/diagnostic | jq '.data.prokeralaTest'
```

### Test 3: Just Debug Info
```bash
curl https://astrosetu-app.vercel.app/api/astrology/diagnostic | jq '.data.prokeralaTest.debug'
```

### Test 4: Just DebugInfo Field
```bash
curl https://astrosetu-app.vercel.app/api/astrology/diagnostic | jq '.data.prokeralaTest.debug.debugInfo'
```

---

## Example: What a Good Response Looks Like

### ✅ Success Response:
```json
{
  "ok": true,
  "data": {
    "prokeralaTest": {
      "status": "connected",
      "panchangTest": "passed",
      "debug": {
        "method": "GET",
        "endpoint": "/panchang",
        "result": "success"
      }
    }
  }
}
```

### ❌ Error Response (What We're Debugging):
```json
{
  "ok": true,
  "data": {
    "prokeralaTest": {
      "status": "connected",
      "panchangTest": "failed",
      "panchangError": "[PANCHANG_DEBUG: originalMethod=POST, enforcedMethod=GET, ...] | POST https://...",
      "debug": {
        "method": "GET",
        "endpoint": "/panchang",
        "debugInfo": {
          "originalMethod": "POST",
          "enforcedMethod": "GET",
          "fetchMethod": "GET",
          "fetchOptionsMethod": "GET"
        }
      }
    }
  }
}
```

---

## What to Share With Me

After running the test, please share:

1. **The entire `prokeralaTest` object** - This contains all the information
2. **Or just the `debug` object** - This has the debug info
3. **Or the full JSON response** - I can extract what I need

You can share it by:
- Copying and pasting the JSON
- Taking a screenshot
- Sharing the output from the curl command

---

## If You Don't Have `jq` Installed

### Install jq (Optional but Helpful):

**Mac:**
```bash
brew install jq
```

**Linux:**
```bash
sudo apt-get install jq
```

**Or just use the browser method** - it's the easiest!

---

## Quick Summary

**Easiest Method:**
1. Open browser
2. Go to: `https://astrosetu-app.vercel.app/api/astrology/diagnostic`
3. Copy the JSON response
4. Share it with me

**That's it!** The response will contain all the debug information we need.

