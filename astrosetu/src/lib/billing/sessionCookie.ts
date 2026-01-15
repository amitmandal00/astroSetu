export const BILLING_SESSION_COOKIE = "aiAstrologyBillingSessionId";

export function getBillingSessionIdFromRequest(req: Request): string | null {
  const cookieHeader = req.headers.get("cookie");
  if (!cookieHeader) return null;

  const parts = cookieHeader.split(";").map((p) => p.trim());
  const hit = parts.find((p) => p.startsWith(`${BILLING_SESSION_COOKIE}=`));
  if (!hit) return null;

  const raw = hit.slice(BILLING_SESSION_COOKIE.length + 1);
  if (!raw) return null;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export function buildBillingSessionCookie(sessionId: string): string {
  const maxAgeSeconds = 60 * 60 * 24 * 30; // 30 days
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${BILLING_SESSION_COOKIE}=${encodeURIComponent(sessionId)}; Path=/; HttpOnly; SameSite=Lax${secure}; Max-Age=${maxAgeSeconds}`;
}


