# Autonomous Contact Information System

## Overview

The contact information system is now **fully autonomous** - all contact details are managed via environment variables with zero manual intervention required.

## Features

✅ **Zero Manual Updates**: All contact information is managed via environment variables  
✅ **Auto-Availability Detection**: Real-time business hours checking with timezone awareness  
✅ **Auto-Validation**: Contact details validated during configuration  
✅ **Dynamic Status Indicators**: Shows "Open/Closed" status in real-time  
✅ **Auto-Refresh**: Availability status updates every minute  
✅ **WhatsApp 24/7 Support**: Configurable 24/7 availability  
✅ **Timezone-Aware**: Business hours respect timezone settings  

---

## Environment Variables

### Required (with defaults)

```bash
# Email addresses
SUPPORT_EMAIL=support@astrosetu.app
PRIVACY_EMAIL=privacy@astrosetu.app
ADMIN_EMAIL=admin@astrosetu.app

# Phone numbers (E.164 format)
PHONE_NUMBER=+918001234567
WHATSAPP_NUMBER=+918001234567

# Company information
COMPANY_NAME=AstroSetu Services Pvt. Ltd.
ADDRESS_CITY=Mumbai
ADDRESS_STATE=Maharashtra
ADDRESS_COUNTRY=India
JURISDICTION=Australia (primary) / India (international operations)

# Business hours
BUSINESS_HOURS_TIMEZONE=Asia/Kolkata
BUSINESS_HOURS_WEEKDAY_OPEN=09:00
BUSINESS_HOURS_WEEKDAY_CLOSE=18:00
BUSINESS_HOURS_SATURDAY_OPEN=10:00
BUSINESS_HOURS_SATURDAY_CLOSE=16:00

# Auto-response settings
CONTACT_AUTO_REPLY_ENABLED=true
CONTACT_RESPONSE_TIME=24-48 hours

# Availability flags
WHATSAPP_24X7=true
PHONE_AVAILABLE=true
```

### Optional

```bash
# Full address (if different from city/state/country)
ADDRESS_STREET=123 Main Street
ADDRESS_POSTAL_CODE=400001

# Business holidays (JSON array of ISO dates)
BUSINESS_HOLIDAYS=["2024-12-25","2025-01-01"]
```

### Public Variables (for client-side access)

If you want contact info available on the client side, prefix with `NEXT_PUBLIC_`:

```bash
NEXT_PUBLIC_SUPPORT_EMAIL=support@astrosetu.app
NEXT_PUBLIC_PHONE_NUMBER=+918001234567
NEXT_PUBLIC_COMPANY_NAME=AstroSetu Services Pvt. Ltd.
```

---

## API Endpoint

### `GET /api/contact/info`

Returns dynamic contact information with current availability status.

**Response:**
```json
{
  "ok": true,
  "data": {
    "emails": {
      "support": {
        "address": "support@astrosetu.app",
        "label": "For general inquiries",
        "validated": true
      },
      "privacy": {
        "address": "privacy@astrosetu.app",
        "label": "For privacy-related inquiries or complaints",
        "validated": true
      }
    },
    "phone": {
      "number": "+918001234567",
      "display": "+91 800 123 4567",
      "telLink": "tel:+918001234567",
      "available": true,
      "label": "Available now"
    },
    "whatsapp": {
      "number": "+918001234567",
      "display": "+91 800 123 4567",
      "link": "https://wa.me/918001234567",
      "available24x7": true,
      "label": "24/7 support available"
    },
    "company": {
      "name": "AstroSetu Services Pvt. Ltd.",
      "address": {
        "full": "Mumbai, Maharashtra, India",
        "city": "Mumbai",
        "state": "Maharashtra",
        "country": "India"
      },
      "jurisdiction": "Australia (primary) / India (international operations)"
    },
    "businessHours": {
      "timezone": "Asia/Kolkata",
      "weekdays": {
        "open": "09:00",
        "close": "18:00",
        "days": "Monday, Tuesday, Wednesday, Thursday, Friday"
      },
      "saturday": "10:00 - 16:00",
      "sunday": "Closed"
    },
    "availability": {
      "isOpen": true,
      "status": "open",
      "message": "Open now",
      "currentTime": "2024-12-26T14:30:00.000Z",
      "timezone": "Asia/Kolkata"
    },
    "autoResponse": {
      "enabled": true,
      "responseTime": "24-48 hours"
    }
  }
}
```

---

## How It Works

### 1. Configuration Loading
- Contact details loaded from environment variables at startup
- Falls back to sensible defaults if not configured
- Validates email and phone formats

### 2. Availability Detection
- Calculates current time in business timezone
- Checks day of week (Monday-Saturday business hours, Sunday closed)
- Checks if current time is within business hours
- Accounts for holidays
- Updates automatically every minute

### 3. Dynamic Display
- Contact page fetches latest info from API
- Shows real-time availability status
- Displays formatted phone numbers
- Generates clickable links (tel:, mailto:, WhatsApp)

### 4. Auto-Validation
- Email addresses validated via regex
- Phone numbers validated for E.164 format
- Invalid formats flagged in response

---

## Updating Contact Information

### To Update Contact Details:

1. **Via Vercel Dashboard**:
   - Go to Project Settings → Environment Variables
   - Update the relevant variables
   - Redeploy (or let auto-deploy handle it)

2. **Via `.env.local`** (development):
   ```bash
   SUPPORT_EMAIL=newemail@astrosetu.app
   PHONE_NUMBER=+919876543210
   ```

3. **No Code Changes Required**:
   - All updates are via environment variables
   - No code deployment needed (unless changing business logic)
   - Changes take effect on next deployment

---

## Testing

### Test Contact Info API:
```bash
curl https://your-deployment.vercel.app/api/contact/info
```

### Verify Business Hours:
- Check `/contact` page during business hours (should show "Open Now")
- Check outside business hours (should show "Closed" with next open time)
- Test different timezones by changing `BUSINESS_HOURS_TIMEZONE`

### Verify Contact Form Integration:
- Contact form already uses autonomous email system
- Form submissions auto-categorized
- Auto-replies sent automatically

---

## Benefits

✅ **Zero Maintenance**: Update environment variables, no code changes  
✅ **Always Accurate**: Real-time availability status  
✅ **Timezone-Aware**: Works globally with proper timezone handling  
✅ **Auto-Validated**: Invalid contact details flagged  
✅ **Flexible**: Easy to add new contact methods or update existing ones  
✅ **Scalable**: Can handle multiple timezones, holidays, etc.  

---

## Future Enhancements (Optional)

- [ ] Multi-language support for business hours
- [ ] Holiday calendar integration
- [ ] Live chat availability integration
- [ ] Social media links from config
- [ ] Contact method preferences (email vs phone vs WhatsApp)

---

**Last Updated:** December 26, 2024
