import { API_BASE_URL } from '../constants/config';

type TelemetryEvent = {
  type: string;
  payload?: Record<string, unknown>;
};

const TELEMETRY_URL = `${API_BASE_URL.replace(/\/$/, '')}/telemetry`;

async function sendEvent(event: TelemetryEvent) {
  try {
    await fetch(TELEMETRY_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...event, ts: Date.now(), source: 'mobile' }),
    });
  } catch (e) {
    if (__DEV__) {
      console.warn('[telemetry-mobile] failed', e);
    }
  }
}

export function trackEvent(type: string, payload?: Record<string, unknown>) {
  void sendEvent({ type, payload });
}

export function trackError(type: string, error: unknown, extra?: Record<string, unknown>) {
  const base: Record<string, unknown> = {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    ...extra,
  };
  void sendEvent({ type: `error:${type}`, payload: base });
}

