"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { logError } from "@/lib/telemetry";

/**
 * Global Error Handler for Next.js App Router
 * This catches errors that escape the root layout error boundary
 * Only renders if there's a critical error in the root layout itself
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error boundary caught:", error);
    // Log to telemetry (which includes Sentry)
    logError("global_error_boundary", error, {
      digest: error.digest,
      severity: "critical",
    });
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-50 to-orange-50">
          <Card className="max-w-md w-full shadow-2xl border-2 border-red-200">
            <CardHeader 
              eyebrow="🚨 Critical Error" 
              title="Something went wrong" 
              subtitle="A critical error occurred. Our team has been notified."
            />
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-red-50 border-2 border-red-200">
                <p className="text-sm text-red-900 font-medium mb-2">
                  {error.message || "A critical error occurred"}
                </p>
                <p className="text-xs text-red-700">
                  This error has been automatically reported. You can try again or reload the page.
                </p>
                {error.digest && (
                  <p className="text-xs text-red-600 mt-2 font-mono">
                    Error ID: {error.digest}
                  </p>
                )}
              </div>
              <div className="flex gap-3">
                <Button 
                  onClick={reset} 
                  className="flex-1"
                >
                  🔄 Try Again
                </Button>
                <Button 
                  onClick={() => window.location.href = "/"} 
                  variant="secondary"
                  className="flex-1"
                >
                  🏠 Go Home
                </Button>
              </div>
              <Button 
                onClick={() => window.location.reload()} 
                variant="ghost"
                className="w-full text-xs"
              >
                🔃 Reload Page
              </Button>
            </CardContent>
          </Card>
        </div>
      </body>
    </html>
  );
}

