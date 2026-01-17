import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Private Beta Access Middleware
 * Enforces gating for /ai-astrology/* UI routes and /api/(ai-astrology|billing)/* API routes
 * 
 * Gate is enabled when NEXT_PUBLIC_PRIVATE_BETA === "true"
 * Users with beta_access=1 cookie can access
 * Others are redirected to /ai-astrology/access (UI) or get 401 (API)
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if private beta gating is enabled
  const privateBetaEnabled = process.env.NEXT_PUBLIC_PRIVATE_BETA === "true";

  // If gating is disabled, allow all requests
  if (!privateBetaEnabled) {
    return NextResponse.next();
  }

  // Always allow access to /ai-astrology/access and /api/beta-access/verify
  if (
    pathname === "/ai-astrology/access" ||
    pathname.startsWith("/api/beta-access/")
  ) {
    return NextResponse.next();
  }

  // Check if user has beta access cookie
  const betaAccessCookie = request.cookies.get("beta_access");
  const hasAccess = betaAccessCookie?.value === "1";

  // If user has access, allow request
  if (hasAccess) {
    return NextResponse.next();
  }

  // Block UI routes: /ai-astrology/* (except /access)
  if (pathname.startsWith("/ai-astrology/")) {
    const returnTo = pathname + request.nextUrl.search;
    const accessUrl = new URL("/ai-astrology/access", request.url);
    if (returnTo !== "/ai-astrology/access") {
      accessUrl.searchParams.set("returnTo", returnTo);
    }
    return NextResponse.redirect(accessUrl);
  }

  // Block API routes: /api/ai-astrology/* and /api/billing/*
  if (
    pathname.startsWith("/api/ai-astrology/") ||
    pathname.startsWith("/api/billing/")
  ) {
    return NextResponse.json(
      { error: "private_beta", message: "Access restricted to private beta users" },
      { status: 401 }
    );
  }

  // Allow all other routes
  return NextResponse.next();
}

/**
 * Middleware matcher: only run on /ai-astrology/* and /api/(ai-astrology|billing)/*
 * This improves performance by not running middleware on every request
 */
export const config = {
  matcher: [
    "/ai-astrology/:path*",
    "/api/ai-astrology/:path*",
    "/api/billing/:path*",
    "/api/beta-access/:path*",
  ],
};

