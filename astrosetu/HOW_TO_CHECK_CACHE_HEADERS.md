# 🔍 How to Check Cache Headers

**Guide**: Verify that cache-control headers are properly set on your production site.

---

## 🖥️ **Method 1: Using curl (Command Line)**

### **On Mac/Linux:**
```bash
curl -I https://www.mindveda.net/ai-astrology
```

### **On Windows:**
```powershell
# If you have curl installed (Windows 10+)
curl -I https://www.mindveda.net/ai-astrology

# Or using PowerShell's Invoke-WebRequest
Invoke-WebRequest -Uri https://www.mindveda.net/ai-astrology -Method Head | Select-Object -ExpandProperty Headers
```

### **What to Look For:**
In the output, you should see a line like:
```
Cache-Control: no-cache, no-store, must-revalidate, max-age=0
```

---

## 🌐 **Method 2: Using Browser DevTools (Easiest)**

### **Chrome/Edge/Brave:**
1. Open your website: https://www.mindveda.net/ai-astrology
2. Press `F12` (or `Right-click` → `Inspect`)
3. Go to the **Network** tab
4. **Refresh the page** (`F5` or `Ctrl+R`)
5. Click on the first request (usually the document request)
6. Look at the **Headers** section
7. Scroll down to **Response Headers**
8. Find `Cache-Control` header

### **Firefox:**
1. Open your website: https://www.mindveda.net/ai-astrology
2. Press `F12` (or `Right-click` → `Inspect Element`)
3. Go to the **Network** tab
4. **Refresh the page** (`F5` or `Ctrl+R`)
5. Click on the main document request
6. Go to **Headers** tab
7. Scroll to **Response Headers**
8. Find `Cache-Control` header

### **Safari:**
1. Enable Developer menu: Preferences → Advanced → "Show Develop menu"
2. Open your website: https://www.mindveda.net/ai-astrology
3. Press `Cmd+Option+I` (or Develop → Show Web Inspector)
4. Go to the **Network** tab
5. **Refresh the page** (`Cmd+R`)
6. Click on the main document request
7. Check **Headers** section for `Cache-Control`

---

## 🧪 **Method 3: Online Tools**

### **Option A: Web Sniffer**
1. Go to: https://websniffer.cc/
2. Enter URL: `https://www.mindveda.net/ai-astrology`
3. Select "HEAD" method
4. Click "Submit"
5. Check the response headers for `Cache-Control`

### **Option B: HTTP Status**
1. Go to: https://httpstatus.io/
2. Enter URL: `https://www.mindveda.net/ai-astrology`
3. Click "Check"
4. View response headers

---

## ✅ **Expected Result**

After the caching fixes are deployed, you should see:

```
Cache-Control: no-cache, no-store, must-revalidate, max-age=0
```

Or in the full response:
```
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
Cache-Control: no-cache, no-store, must-revalidate, max-age=0
X-Content-Type-Options: nosniff
...
```

---

## 📋 **Quick Test Checklist**

- [ ] Run curl command or check in browser DevTools
- [ ] Verify `Cache-Control` header is present
- [ ] Verify header contains: `no-cache, no-store, must-revalidate, max-age=0`
- [ ] Test in incognito/private mode to see fresh content
- [ ] Make a small change, deploy, and verify it appears immediately

---

## 🔧 **Troubleshooting**

### **If Cache-Control header is missing:**
1. Wait a few minutes after deployment (edge cache may take time)
2. Verify the deployment succeeded in Vercel dashboard
3. Check that `next.config.mjs` changes were included in deployment

### **If you see different cache values:**
- Old deployments may still have cached headers
- Wait 5-10 minutes and check again
- Clear browser cache and hard refresh

---

**Note**: The `-I` flag in curl sends a HEAD request (only headers, no body), which is faster and sufficient for checking headers.

