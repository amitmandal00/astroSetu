"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to error reporting service (Sentry)
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    
    // Send to Sentry if configured
    if (typeof window !== "undefined") {
      try {
        const Sentry = require("@sentry/nextjs");
        Sentry.captureException(error, {
          contexts: {
            react: {
              componentStack: errorInfo.componentStack,
            },
          },
        });
      } catch (e) {
        // Sentry not available, continue without it
        console.warn("Sentry not available:", e);
      }
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-white">
          <Card className="max-w-md w-full shadow-xl">
            <CardHeader 
              eyebrow="⚠️ Oops!" 
              title="Something went wrong" 
              subtitle="Don&apos;t worry, we&apos;ve been notified and are looking into it."
            />
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-50 border-2 border-amber-200">
                <p className="text-sm text-slate-700 font-medium mb-2">
                  {this.state.error?.message || "An unexpected error occurred."}
                </p>
                <p className="text-xs text-slate-600">
                  This error has been automatically reported. You can try again or go back to the home page.
                </p>
              </div>
              <div className="flex gap-3">
                <Button 
                  onClick={this.handleReset} 
                  className="flex-1 bg-gradient-to-r from-saffron-500 to-orange-500 hover:from-saffron-600 hover:to-orange-600"
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
              {process.env.NODE_ENV === "development" && this.state.error && (
                <details className="mt-4">
                  <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-700">
                    🔍 Error Details (Development Only)
                  </summary>
                  <pre className="mt-2 text-xs bg-slate-100 p-2 rounded overflow-auto max-h-40 font-mono">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook to manually trigger error boundary
 * Useful for async error handling
 */
export function useErrorHandler() {
  return (error: Error) => {
    throw error;
  };
}

