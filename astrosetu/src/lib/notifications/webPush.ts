/**
 * Web Push Notification Service
 * Handles browser push notifications using Web Push API
 */

import { ENABLE_PUSH } from '@/lib/feature-flags';

export interface NotificationSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface NotificationPreferences {
  enabled: boolean;
  weeklyInsights: boolean;
  dailyHoroscope: boolean;
  astrologicalEvents: boolean;
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm format
    end: string; // HH:mm format
  };
  timezone?: string;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  enabled: true,
  weeklyInsights: true,
  dailyHoroscope: false,
  astrologicalEvents: true,
  quietHours: {
    enabled: false,
    start: "22:00",
    end: "08:00",
  },
};

class WebPushService {
  private vapidPublicKey: string | null = null;
  private registration: ServiceWorkerRegistration | null = null;
  private subscription: NotificationSubscription | null = null;

  /**
   * Initialize the service worker and get VAPID public key
   */
  async initialize(): Promise<boolean> {
    // CRITICAL FIX (2026-01-18): Check feature flag before initializing push service
    // Prevents console errors and unnecessary API calls when push is disabled
    if (!ENABLE_PUSH) {
      console.log("[WebPush] Push notifications disabled (NEXT_PUBLIC_ENABLE_PUSH=false)");
      return false;
    }
    
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      console.warn("Service workers not supported");
      return false;
    }

    try {
      // Register service worker - try to get existing first
      let registration = await navigator.serviceWorker.getRegistration("/");
      
      if (!registration) {
        // Register new service worker if none exists
        registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });
      }
      
      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;
      
      this.registration = registration;

      // Get VAPID public key from server
      const response = await fetch("/api/notifications/vapid-public-key");
      if (response.ok) {
        // CRITICAL FIX (2026-01-18): Defensive JSON parsing - check content-type before calling response.json()
        // Prevents SyntaxError when API returns HTML (e.g., 307 redirect)
        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          // Not JSON - likely HTML from redirect
          const text = await response.text();
          const preview = text.substring(0, 200);
          console.error('[WebPush] Non-JSON response from VAPID endpoint:', {
            status: response.status,
            contentType,
            finalUrl: response.url,
            preview
          });
          return false;
        }
        
        const data = await response.json();
        this.vapidPublicKey = data.publicKey;
      } else {
        console.warn("Failed to get VAPID public key");
        return false;
      }

      return true;
    } catch (error) {
      console.error("Failed to initialize web push service:", error);
      return false;
    }
  }

  /**
   * Request notification permission from user
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!("Notification" in window)) {
      return "denied";
    }

    if (Notification.permission === "default") {
      return await Notification.requestPermission();
    }

    return Notification.permission;
  }

  /**
   * Subscribe to push notifications
   */
  async subscribe(): Promise<NotificationSubscription | null> {
    if (!this.registration || !this.vapidPublicKey) {
      const initialized = await this.initialize();
      if (!initialized) {
        return null;
      }
    }

    if (!this.registration || !this.vapidPublicKey) {
      return null;
    }

    try {
      const permission = await this.requestPermission();
      if (permission !== "granted") {
        console.warn("Notification permission not granted");
        return null;
      }

      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey),
      });

      const subscriptionData: NotificationSubscription = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(subscription.getKey("p256dh")!),
          auth: this.arrayBufferToBase64(subscription.getKey("auth")!),
        },
      };

      this.subscription = subscriptionData;
      return subscriptionData;
    } catch (error) {
      console.error("Failed to subscribe to push notifications:", error);
      return null;
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribe(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      const subscription = await this.registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        this.subscription = null;
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to unsubscribe from push notifications:", error);
      return false;
    }
  }

  /**
   * Check if user is subscribed
   */
  async isSubscribed(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      const subscription = await this.registration.pushManager.getSubscription();
      return subscription !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get current subscription
   */
  async getSubscription(): Promise<NotificationSubscription | null> {
    if (!this.registration) {
      return null;
    }

    try {
      const subscription = await this.registration.pushManager.getSubscription();
      if (!subscription) {
        return null;
      }

      return {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(subscription.getKey("p256dh")!),
          auth: this.arrayBufferToBase64(subscription.getKey("auth")!),
        },
      };
    } catch (error) {
      console.error("Failed to get subscription:", error);
      return null;
    }
  }

  /**
   * Save subscription to backend
   */
  async saveSubscription(
    subscription: NotificationSubscription,
    userId?: string
  ): Promise<boolean> {
    try {
      const response = await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscription,
          userId,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error("Failed to save subscription:", error);
      return false;
    }
  }

  /**
   * Save notification preferences
   */
  async savePreferences(
    preferences: NotificationPreferences,
    userId?: string
  ): Promise<boolean> {
    try {
      // Save to localStorage for immediate access
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "astrosetu_notification_preferences",
          JSON.stringify(preferences)
        );
      }

      // Save to backend
      const response = await fetch("/api/notifications/preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          preferences,
          userId,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error("Failed to save preferences:", error);
      return false;
    }
  }

  /**
   * Get notification preferences
   */
  getPreferences(): NotificationPreferences {
    if (typeof window === "undefined") {
      return DEFAULT_PREFERENCES;
    }

    try {
      const stored = localStorage.getItem("astrosetu_notification_preferences");
      if (stored) {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error("Failed to get preferences:", error);
    }

    return DEFAULT_PREFERENCES;
  }

  /**
   * Check if notifications are enabled and not in quiet hours
   */
  canSendNotification(): boolean {
    const preferences = this.getPreferences();
    if (!preferences.enabled) {
      return false;
    }

    if (preferences.quietHours.enabled) {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const { start, end } = preferences.quietHours;

      // Handle quiet hours that span midnight
      if (start > end) {
        // Quiet hours: 22:00 - 08:00
        if (currentTime >= start || currentTime < end) {
          return false;
        }
      } else {
        // Quiet hours: 08:00 - 22:00
        if (currentTime >= start && currentTime < end) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Convert VAPID key from URL-safe base64 to Uint8Array
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }

  /**
   * Convert ArrayBuffer to base64
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }
}

export const webPushService = new WebPushService();
