# Email Debug Checklist

## Issue: No Email Received After Form Submission

### Test Data Used:
- Email: `amitmandal00@gmail.com`
- Category: `data_deletion`
- Message: `data deletion test`

## Step-by-Step Debugging

### 1. Check Vercel Logs
Go to Vercel Dashboard → Your Project → Logs

**Look for these log entries:**
- `[Contact API] Regulatory request received:` - Form was submitted
- `[Contact API] Email sent successfully:` - Email was sent
- `[Contact API] Resend API error details:` - Email failed (check error)
- `[Contact API] Email sending failed:` - Error occurred

### 2. Verify Environment Variables in Vercel
Check that these are set:
- ✅ `RESEND_API_KEY` - Must be set
- ✅ `RESEND_FROM` - Format: `AstroSetu AI <no-reply@mindveda.net>`
- ✅ `COMPLIANCE_TO` - Should be `privacy@mindveda.net`
- ✅ `COMPLIANCE_CC` - Should be `legal@mindveda.net`

### 3. Check Resend Dashboard
1. Go to Resend Dashboard → Emails
2. Check if emails were sent
3. Check delivery status
4. Check for bounces or failures

### 4. Verify Domain Status
1. Go to Resend Dashboard → Domains
2. Check if `mindveda.net` is verified
3. If not verified, emails will fail with 403 error

### 5. Test Resend API Directly
Run the test script:
```bash
cd astrosetu
RESEND_API_KEY=your_key node test-resend.js
```

### 6. Common Issues and Solutions

#### Issue: Domain Not Verified
**Error in logs:** `403 Forbidden` or `Domain not verified`
**Solution:** 
1. Go to Resend Dashboard → Domains
2. Add `mindveda.net`
3. Add DNS records (SPF, DKIM, DMARC)
4. Wait for verification (24-48 hours)

#### Issue: Invalid RESEND_FROM Format
**Error in logs:** `422 Unprocessable Entity`
**Solution:** 
- Check `RESEND_FROM` format in Vercel
- Must be: `AstroSetu AI <no-reply@mindveda.net>`
- Include quotes if needed: `"AstroSetu AI <no-reply@mindveda.net>"`

#### Issue: API Key Invalid
**Error in logs:** `401 Unauthorized`
**Solution:**
- Verify `RESEND_API_KEY` in Vercel matches Resend Dashboard
- Check for typos or extra spaces

#### Issue: Email in Spam
**No error in logs, but no email received**
**Solution:**
- Check spam/junk folder
- Check Promotions tab (Gmail)
- Try a different email address
- Check if email provider is blocking `mindveda.net`

### 7. Enhanced Logging
The code now includes detailed logging:
- Email sending attempts are logged
- Resend API errors include full details
- Success confirmations include email IDs

### 8. Check Form Submission Response
The form should show:
- Success message if submission worked
- Email status indicators
- Error messages if something failed

## Quick Test

To test if the issue is with Resend or the code:

1. **Check Vercel Logs** for `[Contact API]` entries
2. **Check Resend Dashboard** → Emails for sent emails
3. **Verify domain** is verified in Resend
4. **Test with minimal script** to isolate the issue

---

**Next Steps:**
1. Check Vercel logs for specific error messages
2. Verify domain verification in Resend
3. Test with the minimal Resend script
4. Check spam folder

