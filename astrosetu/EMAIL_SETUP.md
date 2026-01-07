# Email Configuration for Contact Form

## Current Status

The contact form is **not sending emails** because `RESEND_API_KEY` is not configured.

When `RESEND_API_KEY` is missing:
- ✅ Form submissions are **saved to database** (if Supabase is configured)
- ✅ Form submissions are **logged to console** (server logs)
- ❌ **No emails are sent** to users or admins

## Where Submissions Are Going

### 1. Database (if Supabase configured)
- Table: `contact_submissions`
- Check your Supabase dashboard → Table Editor → `contact_submissions`

### 2. Server Logs
- Check your Vercel/deployment logs
- Look for: `[Contact API] Email service not configured. Submission details:`

### 3. Emails (NOT WORKING - needs setup)
- User auto-reply: Should go to the email address submitted
- Admin notification: Should go to `ADMIN_EMAIL` or compliance email

## How to Fix: Set Up Resend API

### Step 1: Get Resend API Key

1. Go to https://resend.com
2. Sign up for a free account (100 emails/day free)
3. Go to API Keys section
4. Create a new API key
5. Copy the key (starts with `re_...`)

### Step 2: Add to Environment Variables

#### For Local Development (.env.local):
```bash
# Email Service (Resend)
RESEND_API_KEY=re_your_api_key_here

# Optional: Configure admin email
ADMIN_EMAIL=your-email@example.com

# Optional: Override default compliance emails
PRIVACY_EMAIL=privacy@mindveda.net
LEGAL_EMAIL=legal@mindveda.net
SUPPORT_EMAIL=support@mindveda.net
SECURITY_EMAIL=security@mindveda.net
```

#### For Production (Vercel):
1. Go to your Vercel project dashboard
2. Settings → Environment Variables
3. Add:
   - `RESEND_API_KEY` = `re_your_api_key_here`
   - `ADMIN_EMAIL` = `your-email@example.com` (optional)
4. Redeploy your application

### Step 3: Verify Domain (Important!)

Resend requires domain verification to send emails:

1. Go to Resend dashboard → Domains
2. Add your domain (e.g., `mindveda.net` or `astrosetu.app`)
3. Add DNS records as instructed
4. Wait for verification (usually a few minutes)

**Note:** Until domain is verified, you can only send to verified email addresses (your own email).

### Step 4: Test

1. Restart your dev server (if local)
2. Submit the contact form
3. Check:
   - Your email inbox (auto-reply)
   - Admin email inbox (notification)
   - Server logs (should show "Emails sent")

## Alternative: Use Different Email Service

If you prefer not to use Resend, you can modify `/src/app/api/contact/route.ts` to use:
- SendGrid
- AWS SES
- Mailgun
- Nodemailer (with SMTP)

## Current Email Routing

Based on request category:
- **Privacy/Data Deletion** → `privacy@mindveda.net`
- **Legal/Disputes** → `legal@mindveda.net`
- **Security/Breaches** → `security@mindveda.net`
- **General/Support** → `support@mindveda.net`
- **Admin notifications** → `ADMIN_EMAIL` or compliance email

## Troubleshooting

### Issue: Emails not received
1. Check `RESEND_API_KEY` is set correctly
2. Check domain is verified in Resend
3. Check spam folder
4. Check server logs for errors
5. Verify email addresses are correct

### Issue: "Email service not configured" in logs
- `RESEND_API_KEY` is missing or incorrect
- Add it to `.env.local` (local) or Vercel environment variables (production)

### Issue: "Resend API error" in logs
- Check API key is valid
- Check domain is verified
- Check you're not exceeding rate limits (100/day free tier)

## Quick Check

To see if emails are configured, check your server logs after submitting the form:

✅ **Configured:** `[Contact API] Emails sent for submission: ...`
❌ **Not configured:** `[Contact API] Email service not configured. Submission details: ...`

