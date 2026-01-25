# 📋 How to View Vercel Function Logs

## Method 1: Runtime Logs (Recommended)

### Step-by-Step:

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/dashboard
   - Click on your project: **"astrosetu-app"**

2. **Go to Deployments Tab:**
   - Click **"Deployments"** in the top navigation
   - Find the latest deployment (should show "Ready" with green dot)
   - The deployment should show commit: **"Fix panchang: Use datetime object format and add debug logging"**

3. **Click on the Deployment:**
   - Click on the deployment card/row
   - This opens the deployment details page

4. **Click "Runtime Logs" Button:**
   - On the deployment details page, you'll see buttons:
     - **"Build Logs"** (for build process)
     - **"Runtime Logs"** ← **Click this one!**
     - "Instant Rollback"

5. **View the Logs:**
   - The Runtime Logs will show all console.log output from your functions
   - Look for messages starting with `[AstroSetu]`
   - You should see:
     - `"[AstroSetu] Calling panchang with GET method"`
     - `"[AstroSetu] prokeralaRequest called with method: GET"`
     - `"[AstroSetu] Fetching URL: ... Method: GET"`

---

## Method 2: Via Overview Page

### Alternative Path:

1. **Go to Project Overview:**
   - Vercel Dashboard → Your Project → **"Overview"** tab

2. **Scroll to Production Deployment:**
   - You'll see a screenshot of your deployed app
   - Below it, there are buttons:
     - **"Build Logs"**
     - **"Runtime Logs"** ← **Click this!**
     - "Instant Rollback"

3. **View Logs:**
   - Same as Method 1, step 5

---

## Method 3: Via Logs Tab (Observability)

### Another Option:

1. **Go to Logs Tab:**
   - Vercel Dashboard → Your Project
   - Click **"Logs"** or **"Observability"** in the top navigation

2. **Filter Logs:**
   - You can filter by:
     - Function name (e.g., `/api/astrology/diagnostic`)
     - Time range
     - Log level

3. **View Function Logs:**
   - Look for logs from your API routes
   - Filter for: `/api/astrology/diagnostic`

---

## Method 4: Test Endpoint and Check Logs

### Real-time Testing:

1. **Open Runtime Logs First:**
   - Follow Method 1 or 2 to open Runtime Logs
   - Keep this tab open

2. **Test the Diagnostic Endpoint:**
   - Open a new tab
   - Visit: `https://astrosetu-app.vercel.app/api/astrology/diagnostic`
   - Or use curl:
     ```bash
     curl https://astrosetu-app.vercel.app/api/astrology/diagnostic
     ```

3. **Watch the Logs:**
   - Go back to the Runtime Logs tab
   - You should see new log entries appear in real-time
   - Look for the `[AstroSetu]` debug messages

---

## What to Look For in Logs

### ✅ Good Signs (Should See):
```
[AstroSetu] Calling panchang with GET method: { date: '2025-01-15', year: 2025, month: 1, day: 15, ... }
[AstroSetu] prokeralaRequest called with method: GET endpoint: /panchang
[AstroSetu] Fetching URL: https://api.prokerala.com/v2/astrology/panchang?... Method: GET Has body: false
```

### ❌ Bad Signs (Problem):
```
[AstroSetu] Fetching URL: ... Method: POST Has body: true
```
If you see `Method: POST`, the code isn't working correctly.

---

## If You Can't Find Logs

### Option A: Check Build Logs Instead
1. Click **"Build Logs"** instead of "Runtime Logs"
2. This shows the build process, not runtime
3. Not as useful for debugging, but confirms the code was built

### Option B: Use Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# View logs
cd /Users/amitkumarmandal/Documents/astroCursor/astrosetu
vercel logs --follow
```

### Option C: Add More Visible Logging
We can add logging that returns in the API response itself, so you can see it without checking logs.

---

## Quick Test Without Logs

### Test the Diagnostic Endpoint Directly:

```bash
curl https://astrosetu-app.vercel.app/api/astrology/diagnostic | jq
```

**Expected Response (Success):**
```json
{
  "ok": true,
  "data": {
    "prokeralaTest": {
      "status": "connected",
      "panchangTest": "passed"
    }
  }
}
```

**If Still Failing:**
```json
{
  "prokeralaTest": {
    "status": "error",
    "error": "...POST...Method Not Allowed..."
  }
}
```

---

## Screenshot Guide

The logs should be visible:
- **On Deployment Page:** Click deployment → "Runtime Logs" button
- **On Overview Page:** Scroll down → "Runtime Logs" button (next to Build Logs)

If you still can't find it, let me know and I can help you add logging that appears in the API response itself!

