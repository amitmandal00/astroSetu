"use client";

import { useEffect } from "react";
import { webPushService } from "@/lib/notifications/webPush";
import { session } from "@/lib/session";

/**
 * NotificationInitializer
 * 
 * Initializes web push notifications when the app loads.
 * This component should be included in the root layout.
 */
export function NotificationInitializer() {
  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") {
      return;
    }

    // Check if service worker is supported
    if (!("serviceWorker" in navigator)) {
      console.log("Service workers not supported");
      return;
    }

    // Initialize web push service
    async function initialize() {
      try {
        const initialized = await webPushService.initialize();
        if (initialized) {
          console.log("Web push service initialized");

          // Check if user is already subscribed
          const isSubscribed = await webPushService.isSubscribed();
          if (isSubscribed) {
            // Get current subscription and save to backend if user is logged in
            const subscription = await webPushService.getSubscription();
            if (subscription) {
              const user = session.getUser();
              if (user?.id) {
                await webPushService.saveSubscription(subscription, user.id);
              }
            }
          }
        }
      } catch (error) {
        console.error("Failed to initialize web push service:", error);
      }
    }

    // Initialize after a short delay to avoid blocking page load
    const timeoutId = setTimeout(initialize, 1000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  // This component doesn't render anything
  return null;
}
