"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { webPushService, type NotificationPreferences } from "@/lib/notifications/webPush";
import { session } from "@/lib/session";

export default function NotificationSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>("default");
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    enabled: true,
    weeklyInsights: true,
    dailyHoroscope: false,
    astrologicalEvents: true,
    quietHours: {
      enabled: false,
      start: "22:00",
      end: "08:00",
    },
  });

  useEffect(() => {
    initializeNotifications();
  }, []);

  async function initializeNotifications() {
    try {
      setLoading(true);

      // Check if service worker is supported
      if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
        setError("Push notifications are not supported in this browser");
        setLoading(false);
        return;
      }

      // Check permission status
      if ("Notification" in window) {
        setPermissionStatus(Notification.permission);
      }

      // Initialize web push service
      const initialized = await webPushService.initialize();
      if (!initialized) {
        // Check if service worker failed
        if (typeof window !== "undefined" && "serviceWorker" in navigator) {
          try {
            const registration = await navigator.serviceWorker.getRegistration();
            if (!registration) {
              setError("Service worker registration failed. Please check browser console for details.");
            } else {
              setError("Failed to initialize push notifications. VAPID keys may not be configured.");
            }
          } catch (swError) {
            setError("Service worker not available. Please refresh the page and try again.");
          }
        } else {
          setError("Push notifications are not supported in this browser");
        }
        setLoading(false);
        return;
      }

      // Check subscription status
      const subscribed = await webPushService.isSubscribed();
      setIsSubscribed(subscribed);

      // Load preferences
      const prefs = webPushService.getPreferences();
      setPreferences(prefs);

      // Try to load preferences from backend
      try {
        const user = session.getUser();
        if (user?.id) {
          const response = await fetch(`/api/notifications/preferences?userId=${user.id}`);
          if (response.ok) {
            const data = await response.json();
            if (data.ok && data.data) {
              setPreferences(data.data);
            }
          }
        }
      } catch (err) {
        console.warn("Failed to load preferences from backend:", err);
      }
    } catch (err: any) {
      console.error("Error initializing notifications:", err);
      setError(err?.message || "Failed to initialize notifications");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubscribe() {
    try {
      setError(null);
      setSuccess(null);

      // Request permission
      const permission = await webPushService.requestPermission();
      setPermissionStatus(permission);

      if (permission !== "granted") {
        setError("Notification permission was denied");
        return;
      }

      // Subscribe
      const subscription = await webPushService.subscribe();
      if (!subscription) {
        setError("Failed to subscribe to push notifications");
        return;
      }

      // Save subscription to backend
      const user = session.getUser();
      const saved = await webPushService.saveSubscription(subscription, user?.id);
      if (saved) {
        setIsSubscribed(true);
        setSuccess("Successfully subscribed to push notifications!");
      } else {
        setError("Subscribed locally but failed to save to server");
      }
    } catch (err: any) {
      console.error("Error subscribing:", err);
      setError(err?.message || "Failed to subscribe");
    }
  }

  async function handleUnsubscribe() {
    try {
      setError(null);
      setSuccess(null);

      const unsubscribed = await webPushService.unsubscribe();
      if (unsubscribed) {
        setIsSubscribed(false);
        setSuccess("Successfully unsubscribed from push notifications");

        // Delete subscription from backend
        const user = session.getUser();
        if (user?.id) {
          const subscription = await webPushService.getSubscription();
          if (subscription) {
            await fetch(
              `/api/notifications/subscribe?userId=${user.id}&endpoint=${encodeURIComponent(subscription.endpoint)}`,
              { method: "DELETE" }
            );
          }
        }
      } else {
        setError("Failed to unsubscribe");
      }
    } catch (err: any) {
      console.error("Error unsubscribing:", err);
      setError(err?.message || "Failed to unsubscribe");
    }
  }

  async function handleSavePreferences() {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      // Save to localStorage
      await webPushService.savePreferences(preferences);

      // Save to backend
      const user = session.getUser();
      const saved = await webPushService.savePreferences(preferences, user?.id);
      if (saved) {
        setSuccess("Preferences saved successfully!");
      } else {
        setError("Saved locally but failed to save to server");
      }
    } catch (err: any) {
      console.error("Error saving preferences:", err);
      setError(err?.message || "Failed to save preferences");
    } finally {
      setSaving(false);
    }
  }

  function updatePreference<K extends keyof NotificationPreferences>(
    key: K,
    value: NotificationPreferences[K]
  ) {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  }

  function updateQuietHours<K extends keyof NotificationPreferences["quietHours"]>(
    key: K,
    value: NotificationPreferences["quietHours"][K]
  ) {
    setPreferences((prev) => ({
      ...prev,
      quietHours: { ...prev.quietHours, [key]: value },
    }));
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-slate-600">Loading notification settings...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Notification Settings</h1>
        <p className="text-slate-600">Manage your push notification preferences</p>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <span className="text-xl">⚠️</span>
              <div className="flex-1">
                <div className="text-sm font-semibold text-red-900 mb-1">Notification Error</div>
                <div className="text-sm text-red-800">{error}</div>
                {error.includes("permission was denied") && (
                  <div className="mt-3 text-xs text-red-700">
                    <div className="font-semibold mb-1">How to enable notifications:</div>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>Click the lock/info icon in your browser&apos;s address bar</li>
                      <li>Find &quot;Notifications&quot; in the site settings</li>
                      <li>Change it to &quot;Allow&quot;</li>
                      <li>Refresh this page and try again</li>
                    </ol>
                  </div>
                )}
                {error.includes("not supported") && (
                  <div className="mt-3 text-xs text-red-700">
                    Push notifications require a modern browser with service worker support. Please try using Chrome, Firefox, or Edge.
                  </div>
                )}
                {error.includes("initialize") && (
                  <div className="mt-3 text-xs text-red-700">
                    Unable to set up push notifications. This may be due to missing service worker or VAPID configuration. Please contact support if this persists.
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {success && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="text-sm text-green-800">{success}</div>
          </CardContent>
        </Card>
      )}

      {/* Subscription Status */}
      <Card>
        <CardHeader
          eyebrow="Push Notifications"
          title="Subscription Status"
          subtitle="Enable push notifications to receive weekly insights and updates"
        />
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <div className="font-semibold text-slate-900">
                {isSubscribed ? "Subscribed" : "Not Subscribed"}
              </div>
              <div className="text-sm text-slate-600">
                Permission: {permissionStatus}
              </div>
            </div>
            {isSubscribed ? (
              <Button onClick={handleUnsubscribe} variant="secondary">
                Unsubscribe
              </Button>
            ) : (
              <Button onClick={handleSubscribe} disabled={permissionStatus === "denied"}>
                Subscribe
              </Button>
            )}
          </div>

          {permissionStatus === "denied" && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-3">
                <span className="text-lg">🔔</span>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-amber-900 mb-1">
                    Notifications are blocked
                  </div>
                  <div className="text-sm text-amber-800 mb-3">
                    Please enable notifications in your browser settings to receive updates.
                  </div>
                  <div className="text-xs text-amber-700">
                    <div className="font-semibold mb-1">How to enable:</div>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>Look for the lock 🔒 or info ℹ️ icon in your browser&apos;s address bar</li>
                      <li>Click on it and find &quot;Notifications&quot; or &quot;Site settings&quot;</li>
                      <li>Change the notification permission to &quot;Allow&quot;</li>
                      <li>Refresh this page</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader
          eyebrow="Preferences"
          title="Notification Types"
          subtitle="Choose which notifications you want to receive"
        />
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
            <div>
              <div className="font-semibold text-slate-900">Enable Notifications</div>
              <div className="text-sm text-slate-600">Master switch for all notifications</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.enabled}
                onChange={(e) => updatePreference("enabled", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-saffron-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-saffron-600"></div>
            </label>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
              <div>
                <div className="font-semibold text-slate-900">Weekly Insights</div>
                <div className="text-sm text-slate-600">Gentle astrological insights every week</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.weeklyInsights}
                  onChange={(e) => updatePreference("weeklyInsights", e.target.checked)}
                  disabled={!preferences.enabled}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-saffron-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-saffron-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
              <div>
                <div className="font-semibold text-slate-900">Daily Horoscope</div>
                <div className="text-sm text-slate-600">Daily horoscope predictions</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.dailyHoroscope}
                  onChange={(e) => updatePreference("dailyHoroscope", e.target.checked)}
                  disabled={!preferences.enabled}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-saffron-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-saffron-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
              <div>
                <div className="font-semibold text-slate-900">Astrological Events</div>
                <div className="text-sm text-slate-600">Important planetary events and transits</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.astrologicalEvents}
                  onChange={(e) => updatePreference("astrologicalEvents", e.target.checked)}
                  disabled={!preferences.enabled}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-saffron-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-saffron-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card>
        <CardHeader
          eyebrow="Quiet Hours"
          title="Do Not Disturb"
          subtitle="Set times when you don&apos;t want to receive notifications"
        />
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
            <div>
              <div className="font-semibold text-slate-900">Enable Quiet Hours</div>
              <div className="text-sm text-slate-600">Pause notifications during specific times</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.quietHours.enabled}
                onChange={(e) => updateQuietHours("enabled", e.target.checked)}
                disabled={!preferences.enabled}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-saffron-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-saffron-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
            </label>
          </div>

          {preferences.quietHours.enabled && (
            <div className="grid sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Start Time
                </label>
                <Input
                  type="time"
                  value={preferences.quietHours.start}
                  onChange={(e) => updateQuietHours("start", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  End Time
                </label>
                <Input
                  type="time"
                  value={preferences.quietHours.end}
                  onChange={(e) => updateQuietHours("end", e.target.value)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-4">
        <Button onClick={() => router.back()} variant="secondary">
          Cancel
        </Button>
        <Button onClick={handleSavePreferences} disabled={saving}>
          {saving ? "Saving..." : "Save Preferences"}
        </Button>
      </div>
    </div>
  );
}
