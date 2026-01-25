"use client";

/**
 * Lightweight client-side telemetry for AstroSetu.
 * This is intentionally simple and can later be wired to
 * Sentry, Firebase, or any analytics platform.
 */

type TelemetryEvent = {
  type: string;
  payload?: Record<string, unknown>;
};

async function sendEvent(event: TelemetryEvent) {
  try {
    await fetch("/api/telemetry", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ...event,
        ts: Date.now(),
      }),
      keepalive: true,
    });
  } catch (e) {
    // Never break UX due to telemetry failure
    if (process.env.NODE_ENV === "development") {
      console.warn("[telemetry] failed", e);
    }
  }
}

export function logEvent(type: string, payload?: Record<string, unknown>) {
  void sendEvent({ type, payload });
}

export function logError(type: string, error: unknown, extra?: Record<string, unknown>) {
  const base: Record<string, unknown> = {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    ...extra,
  };
  void sendEvent({ type: `error:${type}`, payload: base });
  
  // Also send to Sentry if available
  if (typeof window !== "undefined") {
    try {
      const Sentry = require("@sentry/nextjs");
      if (error instanceof Error) {
        Sentry.captureException(error, {
          tags: { errorType: type },
          extra: extra || {},
        });
      } else {
        Sentry.captureMessage(String(error), {
          level: "error",
          tags: { errorType: type },
          extra: { ...base, ...extra },
        });
      }
    } catch (e) {
      // Sentry not available, continue without it
      if (process.env.NODE_ENV === "development") {
        console.warn("[telemetry] Sentry not available:", e);
      }
    }
  }
}

