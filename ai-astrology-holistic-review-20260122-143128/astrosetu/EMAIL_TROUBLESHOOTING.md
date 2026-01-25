# Email Troubleshooting Guide

## Issue: No Email Received After Submitting Regulatory Request Form

### Step 1: Check Vercel Logs

1. Go to Vercel Dashboard → Your Project → Logs
2. Look for entries containing `[Contact API]`
3. Check for:
   - `Resend API not configured` - API key missing
   - `Email sending failed` - Resend API error
   - `Resend API error: 403` - Domain not verified
   - `Resend API error: 422` - Invalid email format

### Step 2: Verify Environment Variables

**Required in Vercel:**
```env
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM=AstroSetu AI <no-reply@mindveda.net>
COMPLIANCE_TO=privacy@mindveda.net
COMPLIANCE_CC=legal@mindveda.net
```

**Check:**
- All variables are set in Vercel Dashboard
- Variables are set for "All Environments" or "Production"
- No typos in variable names
- `RESEND_FROM` format is correct: `"Name <email@domain.com>"`

### Step 3: Verify Domain in Resend Dashboard

1. Go to Resend Dashboard → Domains
2. Check if `mindveda.net` is verified
3. If not verified:
   - Add domain
   - Add DNS records (SPF, DKIM, DMARC)
   - Wait for verification (24-48 hours)

### Step 4: Test Resend API Directly

Run this test script to verify Resend works:

```bash
cd astrosetu
node test-resend.js
```

Or use the inline command:
```bash
node -e "import('resend').then(({ Resend }) => { const resend = new Resend(process.env.RESEND_API_KEY); resend.emails.send({ from: 'AstroSetu AI <no-reply@mindveda.net>', to: ['your_email@gmail.com'], subject: 'Resend test', html: '<strong>Test</strong>' }).then(() => console.log('Sent')).catch(e => console.error('Error:', e)); });"
```

### Step 5: Check Common Issues

#### Issue: Domain Not Verified
**Error:** `403 Forbidden` or `Domain not verified`
**Solution:** Verify `mindveda.net` in Resend Dashboard

#### Issue: Invalid From Address
**Error:** `422 Unprocessable Entity`
**Solution:** Check `RESEND_FROM` format: `"AstroSetu AI <no-reply@mindveda.net>"`

#### Issue: API Key Invalid
**Error:** `401 Unauthorized`
**Solution:** Verify `RESEND_API_KEY` in Vercel matches Resend Dashboard

#### Issue: Rate Limit
**Error:** `429 Too Many Requests`
**Solution:** Wait a few minutes and try again

### Step 6: Enhanced Logging

The code now includes enhanced error logging. Check Vercel logs for:
- `[Contact API] Email sent successfully:` - Email was sent
- `[Contact API] Resend API error details:` - Detailed error information
- `[Contact API] Email sending failed:` - Error with context

### Step 7: Check Spam Folder

- Check spam/junk folder
- Check Promotions tab (Gmail)
- Check if email provider is blocking `mindveda.net`

### Step 8: Verify Email Address

- Ensure the email address you're testing with is correct
- Try a different email address
- Check if email domain accepts external emails

## Quick Diagnostic Commands

### Check if API key is set (local):
```bash
cd astrosetu
grep RESEND_API_KEY .env.local
```

### Check Resend API status:
```bash
curl -H "Authorization: Bearer $RESEND_API_KEY" https://api.resend.com/domains
```

### Test email sending:
```bash
cd astrosetu
RESEND_API_KEY=your_key node test-resend.js
```

## Next Steps

1. Check Vercel logs for specific error messages
2. Verify all environment variables are set correctly
3. Ensure `mindveda.net` domain is verified in Resend
4. Test with the minimal Resend test script
5. Check spam folder
6. Try a different email address

---

**Last Updated:** 2025-01-29

