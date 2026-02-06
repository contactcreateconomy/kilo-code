import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Cookie name for session token
 */
const SESSION_COOKIE_NAME = "createconomy_session";

/**
 * Routes that don't require authentication
 */
const publicRoutes = ["/auth/signin", "/auth/unauthorized", "/auth/callback"];

/**
 * Middleware for the admin app
 *
 * Handles:
 * - Session validation for all routes (admin requires auth)
 * - Security headers (strict for admin)
 * - CORS for cross-subdomain requests
 * - Prevents search engine indexing
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const origin = request.headers.get("Origin");

  // Get session token from cookie
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  // Create response
  const response = NextResponse.next();

  // Add strict security headers for admin dashboard
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  // Prevent search engine indexing for admin
  response.headers.set("X-Robots-Tag", "noindex, nofollow");

  // Content Security Policy for admin
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      // Security fix (S6): Removed 'unsafe-eval' from script-src.
      // TODO: Replace 'unsafe-inline' with nonce-based CSP in a future iteration.
      "script-src 'self' 'unsafe-inline'", // Required for Next.js
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.convex.cloud https://*.convex.site wss://*.convex.cloud",
      "frame-ancestors 'none'",
    ].join("; ")
  );

  // Add CORS headers for cross-subdomain requests
  const allowedOrigins = [
    "https://createconomy.com",
    "https://discuss.createconomy.com",
    "https://console.createconomy.com",
    "https://seller.createconomy.com",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://localhost:3003",
  ];

  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Session-Token"
    );
  }

  // Handle preflight requests
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: response.headers,
    });
  }

  // Allow public routes without authentication
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return response;
  }

  // All other routes require authentication
  if (!sessionToken) {
    // Redirect to signin with return URL
    const signinUrl = new URL("/auth/signin", request.url);
    signinUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(signinUrl);
  }

  // Note: Admin role verification happens in the API route and client-side
  // AdminGuard component. Middleware only checks for session presence.
  // This is because middleware runs on the edge and cannot make database calls.

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder assets
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next).*)",
  ],
};
