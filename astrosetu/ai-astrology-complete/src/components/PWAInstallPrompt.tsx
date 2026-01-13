/**
 * PWA Install Prompt Component
 * Shows install button when PWA can be installed
 */

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing
      e.preventDefault();
      // Save the event so it can be triggered later
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if app was installed
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    // Clear the deferredPrompt
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Store dismissal in localStorage to avoid showing again for a while
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // Don't show if already installed or if user dismissed recently
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      // Don't show again for 7 days
      if (daysSinceDismissed < 7) {
        setShowPrompt(false);
      }
    }
  }, []);

  if (isInstalled || !showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-50 animate-slide-up">
      <div className="bg-white rounded-xl shadow-2xl border-2 border-purple-200 p-4 sm:p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="text-3xl">📱</div>
          <div className="flex-1">
            <h3 className="font-bold text-slate-800 mb-1 text-lg">
              Install AstroSetu AI
            </h3>
            <p className="text-sm text-slate-600">
              Install our app for a faster, app-like experience with offline access.
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="text-slate-400 hover:text-slate-600 transition-colors text-xl leading-none"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={handleInstallClick}
            className="flex-1 cosmic-button py-3 text-sm font-semibold min-h-[44px]"
          >
            Install App
          </Button>
          <Button
            onClick={handleDismiss}
            className="cosmic-button-secondary py-3 px-4 text-sm min-h-[44px]"
          >
            Later
          </Button>
        </div>
      </div>
    </div>
  );
}

