import PushNotification from 'react-native-push-notification';
import { Platform } from 'react-native';
import { apiService } from './api';

interface NotificationPreferences {
  enabled: boolean;
  weeklyInsights: boolean;
  dailyHoroscope: boolean;
  astrologicalEvents: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  timezone?: string;
}

class NotificationService {
  private channelId = 'astrosetu-default';
  private deviceToken: string | null = null;

  constructor() {
    this.configure();
  }

  private configure() {
    PushNotification.configure({
      onRegister: async (token) => {
        console.log('Push notification token:', token);
        this.deviceToken = token.token;
        // Send token to backend
        await this.sendDeviceTokenToBackend(token.token);
      },
      onNotification: function (notification) {
        console.log('Notification:', notification);
        // Handle notification
        if (notification.userInteraction) {
          // User tapped the notification
          // Navigate to appropriate screen based on notification data
        }
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: Platform.OS === 'ios',
    });

    // Create notification channel for Android
    if (Platform.OS === 'android') {
      PushNotification.createChannel(
        {
          channelId: this.channelId,
          channelName: 'AstroSetu Notifications',
          channelDescription: 'Notifications for AstroSetu app',
          playSound: true,
          soundName: 'default',
          importance: 4,
          vibrate: true,
        },
        (created) => console.log(`Channel created: ${created}`)
      );
    }
  }

  /**
   * Schedule daily horoscope notification
   */
  scheduleDailyHoroscope(time: string = '08:00') {
    const [hours, minutes] = time.split(':').map(Number);
    
    PushNotification.localNotificationSchedule({
      channelId: this.channelId,
      title: 'Your Daily Horoscope',
      message: 'Check your daily horoscope for today\'s predictions',
      date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      repeatType: 'day',
      repeatTime: 24 * 60 * 60 * 1000, // Every 24 hours
      userInfo: { type: 'daily_horoscope' },
    });
  }

  /**
   * Schedule reminder notification
   */
  scheduleReminder(title: string, message: string, date: Date) {
    PushNotification.localNotificationSchedule({
      channelId: this.channelId,
      title,
      message,
      date,
      userInfo: { type: 'reminder' },
    });
  }

  /**
   * Send immediate notification
   */
  sendNotification(title: string, message: string, data?: any) {
    PushNotification.localNotification({
      channelId: this.channelId,
      title,
      message,
      userInfo: data,
    });
  }

  /**
   * Cancel all notifications
   */
  cancelAll() {
    PushNotification.cancelAllLocalNotifications();
  }

  /**
   * Cancel specific notification
   */
  cancelNotification(id: string) {
    PushNotification.cancelLocalNotifications({ id });
  }

  /**
   * Request permissions
   */
  async requestPermissions() {
    return new Promise((resolve) => {
      PushNotification.requestPermissions((permissions) => {
        resolve(permissions);
      });
    });
  }

  /**
   * Send device token to backend
   */
  private async sendDeviceTokenToBackend(token: string) {
    try {
      // This would be called from the backend to register the device
      // For now, we'll store it locally and it can be sent when user logs in
      await apiService.post('/notifications/device-token', {
        token,
        platform: Platform.OS,
      });
    } catch (error) {
      console.error('Failed to send device token to backend:', error);
    }
  }

  /**
   * Schedule weekly insight notification
   * Fetches personalized content from backend and schedules it
   */
  async scheduleWeeklyInsight() {
    try {
      // Fetch notification content from backend
      const response = await apiService.post<{
        ok: boolean;
        data: {
          notification: {
            title: string;
            body: string;
            data?: any;
          };
          scheduledFor: string;
        };
      }>('/notifications/schedule', {
        type: 'weekly_insight',
      });

      if (response.ok && response.data) {
        const { notification, scheduledFor } = response.data;
        const scheduledDate = new Date(scheduledFor);

        // Schedule the notification
        PushNotification.localNotificationSchedule({
          channelId: this.channelId,
          title: notification.title,
          message: notification.body,
          date: scheduledDate,
          repeatType: 'week',
          repeatTime: 7 * 24 * 60 * 60 * 1000, // Every 7 days
          userInfo: {
            type: 'weekly_insight',
            ...notification.data,
          },
        });

        console.log('Weekly insight scheduled for:', scheduledDate);
        return true;
      }
    } catch (error) {
      console.error('Failed to schedule weekly insight:', error);
      // Fallback: schedule a generic weekly notification
      this.scheduleWeeklyInsightFallback();
    }
    return false;
  }

  /**
   * Fallback weekly insight notification (if backend is unavailable)
   */
  private scheduleWeeklyInsightFallback() {
    // Schedule for next week, same day and time
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    nextWeek.setHours(9, 0, 0, 0); // 9:00 AM

    PushNotification.localNotificationSchedule({
      channelId: this.channelId,
      title: '🌟 Your Weekly Astrological Insight',
      message: 'Discover what the stars have in store for you this week',
      date: nextWeek,
      repeatType: 'week',
      repeatTime: 7 * 24 * 60 * 60 * 1000,
      userInfo: { type: 'weekly_insight' },
    });
  }

  /**
   * Schedule weekly insights based on user preferences
   */
  async setupWeeklyInsights() {
    try {
      // Get user preferences
      const preferences = await this.getPreferences();
      
      if (preferences.enabled && preferences.weeklyInsights) {
        // Cancel existing weekly insights
        this.cancelNotification('weekly_insight');
        
        // Schedule new weekly insight
        await this.scheduleWeeklyInsight();
      } else {
        // Cancel if disabled
        this.cancelNotification('weekly_insight');
      }
    } catch (error) {
      console.error('Failed to setup weekly insights:', error);
    }
  }

  /**
   * Get notification preferences from backend
   */
  async getPreferences(): Promise<NotificationPreferences> {
    try {
      const response = await apiService.get<{
        ok: boolean;
        data: NotificationPreferences;
      }>('/notifications/preferences');

      if (response.ok && response.data) {
        return response.data;
      }
    } catch (error) {
      console.error('Failed to get preferences:', error);
    }

    // Return default preferences
    return {
      enabled: true,
      weeklyInsights: true,
      dailyHoroscope: false,
      astrologicalEvents: true,
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00',
      },
    };
  }

  /**
   * Save notification preferences to backend
   */
  async savePreferences(preferences: NotificationPreferences): Promise<boolean> {
    try {
      const response = await apiService.post<{ ok: boolean }>(
        '/notifications/preferences',
        { preferences }
      );

      if (response.ok) {
        // Update local schedules based on preferences
        await this.setupWeeklyInsights();
        return true;
      }
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
    return false;
  }

  /**
   * Get device token
   */
  getDeviceToken(): string | null {
    return this.deviceToken;
  }

  /**
   * Cancel notification by type
   */
  cancelNotificationByType(type: string) {
    // Note: react-native-push-notification doesn't support canceling by type directly
    // This would require storing notification IDs and canceling them individually
    // For now, we'll cancel all and reschedule
    console.log(`Canceling notifications of type: ${type}`);
  }
}

export const notificationService = new NotificationService();

