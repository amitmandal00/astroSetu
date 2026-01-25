# Email Testing Guide - Contact Form

## Issue: "Too many submissions" Error

The contact form has spam detection that blocks submissions if there are too many from the same IP address in a short time.

### Current Settings
- **Spam Limit**: 10 submissions per hour (configurable via `CONTACT_SPAM_LIMIT` env var)
- **Time Window**: 1 hour
- **Check**: Based on IP address

## Solutions

### Option 1: Clear Old Test Submissions (Recommended)

Run this SQL in Supabase SQL Editor to clear recent test submissions:

```sql
-- Delete all submissions from the last hour
DELETE FROM contact_submissions 
WHERE created_at >= NOW() - INTERVAL '1 hour';
```

### Option 2: Increase Spam Limit

Add to Vercel environment variables:
- `CONTACT_SPAM_LIMIT=20` (or higher for testing)

### Option 3: Wait 1 Hour

The spam check only looks at submissions from the last hour. Wait 1 hour and try again.

## Enhanced Logging Added

The latest changes include comprehensive logging to help diagnose email issues:

### Log Entries to Look For

1. **Function Entry**
   ```
   📧 Calling sendContactNotifications with category: data_deletion
   ```

2. **Function Start**
   ```
   📧 sendContactNotifications STARTED with category: data_deletion
   ```

3. **API Key Check**
   ```
   ✅ RESEND_API_KEY is configured, proceeding with email sending
   ```

4. **Resend API Response**
   ```
   Resend API raw response text: {...}
   Resend API response parsed: { hasId: true, id: "..." }
   ```

5. **Success**
   ```
   ✅ Email sent successfully to Resend: { id: "...", to: "...", from: "..." }
   ✅ sendContactNotifications completed successfully
   ```

### What to Check in Vercel Logs

After submitting the form, check Vercel logs for:

1. **Spam Check Logs**
   ```
   [Contact API] Spam check: { ip: "...", recentCount: X, spamLimit: 10, withinLimit: true/false }
   ```

2. **Email Sending Logs**
   - Look for `📧` emoji entries (function calls)
   - Look for `✅` emoji entries (success)
   - Look for `❌` emoji entries (errors)

3. **Resend API Response**
   - Check if `hasId: true` and `id` is present
   - This confirms Resend accepted the email

## Testing Steps

1. **Clear old submissions** (run SQL in Supabase)
2. **Submit test form** with a valid email
3. **Check Vercel logs** for the log entries above
4. **Check Resend dashboard** for sent emails
5. **Check email inbox** for received emails

## Troubleshooting

### No logs appearing?
- Check if the function is being called
- Check if there are any errors before the email sending code

### Logs show "RESEND_API_KEY is missing"?
- Verify `RESEND_API_KEY` is set in Vercel environment variables
- Check that the variable name is exactly `RESEND_API_KEY`

### Logs show "Resend API error"?
- Check the error message in logs
- Verify domain is verified in Resend dashboard
- Check Resend API key is valid

### Logs show success but no email received?
- Check Resend dashboard for email delivery status
- Check spam/junk folder
- Verify recipient email address is correct
- Check Resend logs for delivery issues

## Next Steps

1. Clear old submissions using the SQL script
2. Deploy the latest changes with enhanced logging
3. Submit a test form
4. Check Vercel logs for detailed email flow
5. Share logs if emails still not working

