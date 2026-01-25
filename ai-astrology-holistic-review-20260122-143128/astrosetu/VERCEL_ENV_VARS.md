# Vercel Environment Variables Configuration

## ✅ Correct Vercel Environment Variables

Update your Vercel Dashboard → Settings → Environment Variables with these **exact** variable names:

```env
# Required - Resend API Key
RESEND_API_KEY=re_your_api_key_here

# Optional - Email Sender Configuration (uses defaults if not set)
RESEND_FROM_EMAIL=no-reply@mindveda.net
RESEND_FROM_NAME=AstroSetu AI
RESEND_REPLY_TO=privacy@mindveda.net

# Optional - Compliance Email Routing
COMPLIANCE_TO=privacy@mindveda.net
COMPLIANCE_CC=legal@mindveda.net
BRAND_NAME=AstroSetu AI

# Optional - Category-specific emails (for auto-routing)
PRIVACY_EMAIL=privacy@mindveda.net
LEGAL_EMAIL=legal@mindveda.net
SECURITY_EMAIL=security@mindveda.net
SUPPORT_EMAIL=support@mindveda.net
ADMIN_EMAIL=privacy@mindveda.net
```

## ⚠️ Important Notes

### Variable Name Compatibility

**Current Vercel setup:**
- ✅ `EMAIL_FROM` - **Supported** (backwards compatibility)
- ✅ `RESEND_FROM_EMAIL` - **Preferred** (recommended for clarity)

**Recommendation:** Use `RESEND_FROM_EMAIL` for consistency with other Resend variables (`RESEND_FROM_NAME`, `RESEND_REPLY_TO`), but `EMAIL_FROM` will also work.

**Note:** The code supports both `EMAIL_FROM` and `RESEND_FROM_EMAIL` for backwards compatibility. If both are set, `RESEND_FROM_EMAIL` takes priority.

### Minimum Required Variables

**Minimum setup (only required variable):**
```env
RESEND_API_KEY=re_your_api_key_here
```

All other variables are optional and will use defaults:
- `RESEND_FROM_EMAIL` → Defaults to: `no-reply@mindveda.net`
- `RESEND_FROM_NAME` → Defaults to: `AstroSetu AI`
- `RESEND_REPLY_TO` → Defaults to: `privacy@mindveda.net`
- `COMPLIANCE_TO` → Defaults to category-based email
- `COMPLIANCE_CC` → Optional, no default
- `BRAND_NAME` → Defaults to: `AstroSetu AI`

## 🔧 Recommended Vercel Configuration

For production, use these values:

```env
# Required
RESEND_API_KEY=re_your_api_key_here

# Recommended (matches defaults but explicit)
RESEND_FROM_EMAIL=no-reply@mindveda.net
RESEND_FROM_NAME=AstroSetu AI
RESEND_REPLY_TO=privacy@mindveda.net
COMPLIANCE_TO=privacy@mindveda.net
COMPLIANCE_CC=legal@mindveda.net
BRAND_NAME=AstroSetu AI
```

## 📋 Variable Reference

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `RESEND_API_KEY` | ✅ Yes | - | Resend API key for sending emails |
| `RESEND_FROM_EMAIL` | ❌ No | `no-reply@mindveda.net` | From email address |
| `RESEND_FROM_NAME` | ❌ No | `AstroSetu AI` | From display name |
| `RESEND_REPLY_TO` | ❌ No | `privacy@mindveda.net` | Reply-to address |
| `COMPLIANCE_TO` | ❌ No | Category-based | Primary compliance recipient |
| `COMPLIANCE_CC` | ❌ No | - | CC recipient for compliance emails |
| `BRAND_NAME` | ❌ No | `AstroSetu AI` | Brand name for email templates |
| `PRIVACY_EMAIL` | ❌ No | `privacy@mindveda.net` | Privacy request emails |
| `LEGAL_EMAIL` | ❌ No | `legal@mindveda.net` | Legal notice emails |
| `SECURITY_EMAIL` | ❌ No | `security@mindveda.net` | Security issue emails |
| `SUPPORT_EMAIL` | ❌ No | `support@mindveda.net` | General support emails |
| `ADMIN_EMAIL` | ❌ No | Category-based | Admin notification email |

## ✅ Your Current Vercel Setup (Compatible)

Your current Vercel environment variables will work correctly:

```env
RESEND_API_KEY=your_key                    # ✅ Required - Update with actual key
EMAIL_FROM=no-reply@mindveda.net          # ✅ Supported (backwards compatible)
COMPLIANCE_TO=privacy@mindveda.net        # ✅ Correct
COMPLIANCE_CC=legal@mindveda.net          # ✅ Correct
BRAND_NAME=AstroSetu AI                   # ✅ Correct
```

### Optional Enhancement (Recommended)

For better consistency, you can optionally add:
```env
RESEND_FROM_NAME=AstroSetu AI             # Optional (defaults to "AstroSetu AI")
RESEND_REPLY_TO=privacy@mindveda.net      # Optional (defaults to "privacy@mindveda.net")
```

**Note:** Your current setup with `EMAIL_FROM` works perfectly. Adding `RESEND_FROM_NAME` and `RESEND_REPLY_TO` provides explicit configuration, but defaults will be used if omitted.

---

**Last Updated:** 2025-01-29
**Status:** ✅ Ready for Vercel deployment

