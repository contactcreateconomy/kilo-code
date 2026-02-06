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
  "/",
  "/c", // Categories
  "/t", // Threads (read-only)
  "/u", // User profiles (public)
  "/search",
  "/auth/signin",
  "/auth/signup",
  "/auth/signout",
  "/auth/callback",
];

/**
 * Routes that require authentication
 */
const protectedRoutes = [
  "/account",
  "/t/new", // Create new thread
  "/messages",
  "/notifications",
  "/bookmarks",
];

/**
 * Check if a path matches any of the given routes
 */
function matchesRoute(pathname: string, routes: string[]): boolean {
  return routes.some((route) => {
    if (route === "/") {
      return pathname === "/";
    }
    return pathname === route || pathname.startsWith(`${route}/`);
  });
}

/**
 * Check if a path is a public thread view (read-only)
 */
function isPublicThreadView(pathname: string): boolean {
  // /t/[id] is public for reading, but /t/new requires auth
  const threadMatch = pathname.match(/^\/t\/([^/]+)$/);
  return threadMatch !== null && threadMatch[1] !== "new";
}

/**
 * Proxy for the forum app (migrated from middleware for Next.js 16+)
 *
 * Handles:
 * - Session validation for protected routes
 * - Security headers
 * - CORS for cross-subdomain requests
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const origin = request.headers.get("Origin");

  // Get session token from cookie
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  // Create response
  const response = NextResponse.next();

  // Add security headers
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
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
  if (matchesRoute(pathname, publicRoutes) || isPublicThreadView(pathname)) {
    return response;
  }

  // Check authentication for protected routes
  if (matchesRoute(pathname, protectedRoutes)) {
    if (!sessionToken) {
      // Redirect to signin with return URL
      const signinUrl = new URL("/auth/signin", request.url);
      signinUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(signinUrl);
    }

    // Note: Full session validation happens server-side in API routes
    // and client-side in the AuthProvider. Proxy only checks
    // for the presence of the session cookie for performance.
  }

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
