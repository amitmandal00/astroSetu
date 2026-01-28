# Gmail SMTP Setup for Regulatory Request Form

## ✅ Status: Gmail SMTP Support Added

The regulatory request form now supports **both Gmail SMTP and Resend API**:
- **Option A:** Gmail SMTP (Google Workspace) - **PRIORITY** (checked first)
- **Option B:** Resend API (fallback if SMTP not configured)

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Create App Password in Google Workspace

1. Go to your Google Account (the mailbox you'll send from)
2. **Security** → **2-Step Verification** → Turn ON (if not already)
3. **Security** → **App passwords**
4. Create new app password:
   - **App:** "Mail"
   - **Device:** "Other" → Name it: `AstroSetu Web SMTP`
5. **Copy the 16-character password** (save it - you won't see it again!)

**Note:** If you don't see "App passwords":
- Your Workspace admin may have disabled it, OR
- 2-Step Verification isn't enabled yet, OR
- Your org blocks "Less secure" auth

**Solution:** Enable 2-Step Verification first, then App passwords will appear.

---

### Step 2: Choose Sender Email

**Recommended:** Use a dedicated sender identity:
- `no-reply@mindveda.net` (professional, avoids clutter)
- `compliance@mindveda.net` (alternative)
- `admin@mindveda.net` (if you prefer)

**Important:** This email must:
- Be a Google Workspace email (not personal Gmail)
- Have 2-Step Verification enabled
- Have App Password created

---

### Step 3: Add Environment Variables

#### For Local Development (.env.local):

```bash
# Gmail SMTP Configuration (Option A - Priority)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=no-reply@mindveda.net
SMTP_PASS=your_16_character_app_password_here

# Compliance Email Routing
COMPLIANCE_TO=privacy@mindveda.net
COMPLIANCE_CC=legal@mindveda.net
BRAND_NAME=AstroSetu AI

# Optional: Override default compliance emails
PRIVACY_EMAIL=privacy@mindveda.net
LEGAL_EMAIL=legal@mindveda.net
SUPPORT_EMAIL=support@mindveda.net
SECURITY_EMAIL=security@mindveda.net
```

#### For Production (Vercel):

1. Go to your Vercel project dashboard
2. **Settings** → **Environment Variables**
3. Add all the variables above
4. **Redeploy** your application

---

### Step 4: Test the Form

1. Submit the regulatory request form
2. Check:
   - ✅ **Internal email** received at `privacy@mindveda.net`
   - ✅ **Acknowledgement email** received at user's email
3. If emails land in spam:
   - Add SPF/DKIM in Google Workspace Admin
   - Domain → Gmail authentication

---

## 📧 How It Works

### Email Priority Logic:

1. **First Check:** Is SMTP configured?
   - ✅ **YES** → Use Gmail SMTP
   - ❌ **NO** → Check Resend

2. **Second Check:** Is Resend configured?
   - ✅ **YES** → Use Resend API
   - ❌ **NO** → Log to console (no emails sent)

### What Gets Sent:

#### 1. Internal Compliance Notification
- **To:** `COMPLIANCE_TO` (default: `privacy@mindveda.net`)
- **CC:** `COMPLIANCE_CC` (default: `legal@mindveda.net` for legal requests)
- **Subject:** `Regulatory Request – [Category]`
- **From:** `"AstroSetu AI Compliance" <no-reply@mindveda.net>`
- **Reply-To:** User's email (for direct response)

#### 2. User Acknowledgement Email
- **To:** User's submitted email
- **Subject:** `Request Received – AstroSetu AI`
- **From:** `"AstroSetu AI" <no-reply@mindveda.net>`
- **Content:** Automated acknowledgement with compliance notice

---

## 🔧 SMTP Configuration Details

### Gmail SMTP Settings:

```
Host: smtp.gmail.com
Port: 587 (TLS) or 465 (SSL)
Username: your full email (e.g., no-reply@mindveda.net)
Password: App Password (16 characters, not your login password)
```

**Port Selection:**
- **587 (TLS):** Recommended, more compatible
- **465 (SSL):** Alternative, requires `secure: true`

The code automatically detects port and sets `secure` flag correctly.

---

## ⚠️ Important Notes

### Do NOT Use Gmail Auto-Reply

**❌ Wrong:** Setting up Gmail "Out of office" auto-reply for form submissions
- Forms don't trigger auto-replies
- Creates email loops
- Not reliable

**✅ Correct:** Use backend SMTP (what we implemented)
- Sends emails programmatically
- No loops
- Reliable and compliant

### Prevent "Message Blocked" Errors

To avoid Gmail blocking messages:

1. **Send from same domain:** Use `no-reply@mindveda.net` (same as `SMTP_USER`)
2. **Don't use canned responses:** All emails sent via backend
3. **Avoid testing loops:** Don't send to yourself repeatedly
4. **Verify domain:** Set up SPF/DKIM in Google Workspace

---

## 🐛 Troubleshooting

### Issue: "Email service not configured"

**Check:**
1. Are all SMTP variables set? (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`)
2. Did you restart the server after adding variables?
3. Check server logs for specific errors

### Issue: "Authentication failed"

**Check:**
1. Is App Password correct? (16 characters, no spaces)
2. Is 2-Step Verification enabled?
3. Is the email a Google Workspace email (not personal Gmail)?
4. Try generating a new App Password

### Issue: Emails go to spam

**Solutions:**
1. Add SPF record in Google Workspace Admin
2. Add DKIM authentication
3. Verify domain in Google Workspace
4. Check sender reputation

### Issue: "Connection timeout"

**Check:**
1. Is port 587 or 465 open?
2. Is `SMTP_HOST` correct? (`smtp.gmail.com`)
3. Check firewall settings
4. Try port 465 with SSL instead

---

## 📋 Environment Variables Reference

### Required for SMTP:

```bash
SMTP_HOST=smtp.gmail.com          # Gmail SMTP server
SMTP_PORT=587                      # Port (587 for TLS, 465 for SSL)
SMTP_USER=no-reply@mindveda.net   # Your Google Workspace email
SMTP_PASS=xxxx xxxx xxxx xxxx      # App Password (16 chars)
```

### Optional (for customization):

```bash
COMPLIANCE_TO=privacy@mindveda.net    # Primary compliance inbox
COMPLIANCE_CC=legal@mindveda.net      # CC for legal requests
BRAND_NAME=AstroSetu AI               # Brand name in emails
PRIVACY_EMAIL=privacy@mindveda.net    # Privacy requests
LEGAL_EMAIL=legal@mindveda.net         # Legal requests
SUPPORT_EMAIL=support@mindveda.net      # General support
SECURITY_EMAIL=security@mindveda.net   # Security reports
```

---

## ✅ Verification Checklist

After setup, verify:

- [ ] App Password created in Google Account
- [ ] All SMTP environment variables added
- [ ] Server restarted (if local) or redeployed (if Vercel)
- [ ] Form submission test completed
- [ ] Internal email received at compliance inbox
- [ ] User acknowledgement email received
- [ ] No errors in server logs
- [ ] Emails not going to spam

---

## 🔄 Switching Between SMTP and Resend

### Use SMTP (Current):
- Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
- Leave `RESEND_API_KEY` unset or remove it

### Use Resend (Fallback):
- Set `RESEND_API_KEY`
- Leave SMTP variables unset or remove them

**Priority:** SMTP is checked first. If SMTP is configured, Resend won't be used even if `RESEND_API_KEY` is set.

---

## 📝 Code Implementation

The implementation automatically:
1. Checks for SMTP configuration first
2. Falls back to Resend if SMTP not available
3. Logs which service was used
4. Handles errors gracefully
5. Sends both internal and user emails
6. Maintains audit trail

**No code changes needed** - just configure environment variables!

---

## 🎯 Next Steps

1. **Create App Password** in Google Workspace
2. **Add environment variables** to `.env.local` (local) and Vercel (production)
3. **Test form submission**
4. **Verify emails received**
5. **Check spam folder** if emails don't arrive
6. **Set up SPF/DKIM** if emails go to spam

---

**Status:** ✅ Gmail SMTP support fully implemented and ready to use!

