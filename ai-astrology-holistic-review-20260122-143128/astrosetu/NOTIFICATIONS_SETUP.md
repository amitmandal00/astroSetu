# Push Notifications Setup Guide

This guide explains how to set up and configure push notifications for AstroSetu.

## Overview

AstroSetu supports push notifications for both web and mobile platforms:

- **Web**: Uses Web Push API with VAPID keys
- **Mobile**: Uses `react-native-push-notification` for local notifications and can integrate with backend for remote push

## Features

- ✅ Weekly gentle insights based on user goals
- ✅ Daily horoscope notifications
- ✅ Astrological event alerts
- ✅ Quiet hours (do not disturb)
- ✅ User preference management
- ✅ Subscription management

## Web Push Setup

### 1. Generate VAPID Keys

VAPID (Voluntary Application Server Identification) keys are required for web push notifications.

#### Option 1: Using web-push CLI

```bash
npm install -g web-push
web-push generate-vapid-keys
```

This will output:
```
Public Key: <your-public-key>
Private Key: <your-private-key>
```

#### Option 2: Using Node.js

```javascript
const webpush = require('web-push');
const vapidKeys = webpush.generateVAPIDKeys();
console.log('Public Key:', vapidKeys.publicKey);
console.log('Private Key:', vapidKeys.privateKey);
```

### 2. Add VAPID Keys to Environment Variables

Add to your `.env.local` file:

```env
VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
```

**Important**: 
- The public key is safe to expose (it's sent to clients)
- The private key must be kept secret (server-side only)

### 3. Update Supabase Schema

Run the SQL from `SUPABASE_SETUP.md` to create the notification tables:

- `notification_subscriptions` - Stores web push subscriptions
- `notification_preferences` - Stores user notification preferences
- `notification_queue` - Stores scheduled notifications

### 4. Service Worker

The service worker (`public/sw.js`) is automatically registered when the app loads. It handles:
- Push event reception
- Notification display
- Notification click handling
- Background sync (if needed)

## Mobile Push Setup

### 1. Install Dependencies

The mobile app already includes `react-native-push-notification`. Ensure it's configured in:
- `mobile/src/services/notificationService.ts`

### 2. Platform-Specific Setup

#### iOS
- Configure push notification certificates in Xcode
- Update `AppDelegate.mm` if needed
- Request permissions in app

#### Android
- Notification channels are automatically created
- Permissions are handled by the service

### 3. Backend Integration

The mobile notification service can:
- Send device tokens to backend (`/api/notifications/device-token`)
- Fetch personalized notification content (`/api/notifications/schedule`)
- Sync preferences with backend

## API Endpoints

### Web Push

- `GET /api/notifications/vapid-public-key` - Get VAPID public key
- `POST /api/notifications/subscribe` - Subscribe to push notifications
- `DELETE /api/notifications/subscribe` - Unsubscribe from push notifications
- `GET /api/notifications/preferences` - Get user preferences
- `POST /api/notifications/preferences` - Save user preferences
- `POST /api/notifications/schedule` - Schedule a notification

### Mobile

- `POST /api/notifications/device-token` - Register device token (to be implemented)
- `POST /api/notifications/schedule` - Schedule notification (same as web)

## User Interface

### Web

- **Settings Page**: `/notifications/settings`
  - Subscribe/unsubscribe
  - Configure notification types
  - Set quiet hours
  - View subscription status

- **Profile Page**: `/profile`
  - Link to notification settings
  - Quick status overview

### Mobile

- **Settings Screen**: `src/screens/settings/SettingsScreen.tsx`
  - Notification toggles
  - Daily horoscope reminder
  - Permission management

## Content Generation

Notification content is generated dynamically using:
- `src/lib/notifications/contentGenerator.ts`

It uses:
- User goals (from `goalPrioritization.ts`)
- Kundli data (if available)
- Astrological calculations

## Scheduling

### Weekly Insights

Weekly insights are scheduled via:
1. User subscribes to push notifications
2. Backend schedules weekly notifications
3. Content is generated based on user goals and Kundli
4. Notifications are sent at scheduled times

### Implementation

To send scheduled notifications, you'll need:

1. **Job Queue** (recommended for production):
   - Bull (Redis-based)
   - Agenda (MongoDB-based)
   - Or a cron job service

2. **Notification Sender**:
   - Use `web-push` library to send notifications
   - Query `notification_queue` table for pending notifications
   - Send notifications and update status

Example (pseudo-code):
```javascript
const webpush = require('web-push');
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

// Get pending notifications
const pending = await getPendingNotifications();

for (const notification of pending) {
  // Get user subscriptions
  const subscriptions = await getUserSubscriptions(notification.user_id);
  
  for (const subscription of subscriptions) {
    try {
      await webpush.sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: subscription.keys,
        },
        JSON.stringify({
          title: notification.title,
          body: notification.body,
          data: notification.data,
        }),
        {
          vapidDetails: {
            subject: 'mailto:your-email@example.com',
            publicKey: process.env.VAPID_PUBLIC_KEY,
            privateKey: vapidPrivateKey,
          },
        }
      );
      
      // Mark as sent
      await markNotificationAsSent(notification.id);
    } catch (error) {
      // Mark as failed
      await markNotificationAsFailed(notification.id, error.message);
    }
  }
}
```

## Testing

### Web

1. Open browser DevTools → Application → Service Workers
2. Check if service worker is registered
3. Go to `/notifications/settings`
4. Click "Subscribe"
5. Grant permission
6. Verify subscription in database

### Mobile

1. Run app on device/simulator
2. Go to Settings
3. Enable notifications
4. Check console for device token
5. Verify notification scheduling

## Troubleshooting

### Web Push Not Working

1. **Check VAPID keys**: Ensure they're set in `.env.local`
2. **Check service worker**: Verify `sw.js` is accessible at `/sw.js`
3. **Check permissions**: User must grant notification permission
4. **Check browser support**: Not all browsers support push notifications
5. **Check HTTPS**: Push notifications require HTTPS (except localhost)

### Mobile Notifications Not Working

1. **Check permissions**: Ensure app has notification permissions
2. **Check device token**: Verify token is being generated
3. **Check scheduling**: Verify notifications are being scheduled
4. **Check platform**: iOS and Android have different requirements

### Database Issues

1. **Check Supabase connection**: Verify credentials
2. **Check RLS policies**: Ensure policies allow operations
3. **Check table existence**: Verify tables are created

## Security Considerations

1. **VAPID Private Key**: Never expose in client code
2. **Subscription Endpoints**: Store securely, validate ownership
3. **User Preferences**: Respect user choices
4. **Rate Limiting**: Implement rate limits on API endpoints
5. **PII**: Don't include sensitive data in notifications

## Production Checklist

- [ ] VAPID keys generated and stored securely
- [ ] Supabase tables created with RLS policies
- [ ] Service worker deployed and accessible
- [ ] API endpoints tested
- [ ] Notification content generation tested
- [ ] Job queue/cron job configured for sending
- [ ] Error handling and logging implemented
- [ ] User preferences UI tested
- [ ] Mobile app permissions configured
- [ ] Analytics tracking implemented

## Next Steps

1. **Implement notification sender**: Create a job/cron to send scheduled notifications
2. **Add analytics**: Track notification delivery and engagement
3. **A/B testing**: Test different notification content
4. **Personalization**: Enhance content generation with more user data
5. **Rich notifications**: Add images, actions, and deep links

## Resources

- [Web Push API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [VAPID Specification](https://tools.ietf.org/html/rfc8292)
- [web-push Library](https://github.com/web-push-libs/web-push)
- [React Native Push Notification](https://github.com/zo0r/react-native-push-notification)
