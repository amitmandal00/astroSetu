# 🌐 Prokerala Authorized JavaScript Origins

## What to Enter

### For Development (Local Testing)

Enter these origins in the **"Authorized Javascript Origins"** field:

```
http://localhost:3001
http://localhost:3000
https://localhost
```

**Or if you want to be more specific:**
```
http://localhost:3001
```

---

### For Production (Live Website)

Enter your actual domain origins:

```
https://yourdomain.com
https://www.yourdomain.com
```

**Example:**
```
https://astrosetu.com
https://www.astrosetu.com
```

---

## Complete Setup Example

### Development Setup:

1. **App Name:** `AstroSetu`
2. **Authorized Javascript Origins:** 
   ```
   http://localhost:3001
   ```
3. **Environment:** `Production` (or `Sandbox` for testing)

### Production Setup:

1. **App Name:** `AstroSetu`
2. **Authorized Javascript Origins:** 
   ```
   https://astrosetu.com
   https://www.astrosetu.com
   ```
3. **Environment:** `Production`

---

## Important Notes

### ✅ What This Field Does:
- Allows browser-based API requests from these origins
- Required for Prokerala's location search widget
- Prevents unauthorized domains from using your API

### ⚠️ Important:
- **Include both www and non-www versions** if you use both
- **Use `https://localhost`** if you don't have a valid domain yet
- **Add all environments** you'll use (dev, staging, production)
- **No trailing slashes** - just the domain origin

### 🔒 Security:
- Only origins listed here can make requests
- Protects your API credentials
- Prevents unauthorized usage

---

## Quick Copy-Paste Values

### For Local Development:
```
http://localhost:3001
```

### For Production (Replace with your domain):
```
https://yourdomain.com
https://www.yourdomain.com
```

---

## Multiple Environments

If you need to support multiple environments, add all of them:

```
http://localhost:3001
http://localhost:3000
https://staging.yourdomain.com
https://yourdomain.com
https://www.yourdomain.com
```

---

## Current AstroSetu Configuration

Based on your setup:

**Development Server Port:** `3001`

**Recommended Entry:**
```
http://localhost:3001
```

---

## Troubleshooting

### Error: "Origin not authorized"
**Solution:** 
- Check that your origin exactly matches what's in the list
- Include protocol (`http://` or `https://`)
- No trailing slash
- Check for typos

### Error: "CORS error"
**Solution:**
- Ensure origin is added to Authorized JavaScript Origins
- Verify you're using the correct protocol (http vs https)
- Check that port number matches

---

## Next Steps

1. ✅ Enter the origins above in Prokerala dashboard
2. ✅ Save your application
3. ✅ Copy Client ID and Client Secret
4. ✅ Add to `.env.local`
5. ✅ Restart server
6. ✅ Test at `http://localhost:3001/test-comparison`

---

**Last Updated**: December 2024

