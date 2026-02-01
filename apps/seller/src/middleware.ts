import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Cookie name for session token
 */
const SESSION_COOKIE_NAME = "createconomy_session";

/**
 * Routes that don't require authentication
 */
const publicRoutes = [
  "/auth/signin",
  "/auth/signup",
  "/auth/signout",
  "/auth/pending",
  "/auth/callback",
];

/**
 * Routes that require seller approval (not just authentication)
 */
const approvedSellerRoutes = [
  "/products",
  "/orders",
  "/analytics",
  "/payouts",
  "/reviews",
  "/settings",
];

/**
 * Middleware for the seller app
 *
 * Handles:
 * - Session validation for all routes (seller portal requires auth)
 * - Security headers
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

  // Add security headers for seller dashboard
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  // Prevent search engine indexing for seller portal
  response.headers.set("X-Robots-Tag", "noindex, nofollow");

  // Content Security Policy for seller portal
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Required for Next.js
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

  // Note: Seller role and approval status verification happens in the API route
  // and client-side SellerGuard component. Middleware only checks for session presence.
  // This is because middleware runs on the edge and cannot make database calls.

  // For approved seller routes, the client-side will verify seller status
  // and redirect to /auth/pending if the seller is not yet approved

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
