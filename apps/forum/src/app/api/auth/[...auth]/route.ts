import { type NextRequest, NextResponse } from "next/server";
import {
  serializeCookie,
  parseCookies,
  getCookieOptions,
  COOKIE_NAMES,
} from "@createconomy/ui/lib/auth-cookies";

/**
 * Allowed origins for CORS
 */
const ALLOWED_ORIGINS = [
  "https://createconomy.com",
  "https://discuss.createconomy.com",
  "https://console.createconomy.com",
  "https://seller.createconomy.com",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:3003",
];

/**
 * Get CORS headers for the response
 */
function getCorsHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Session-Token",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400",
  };

  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  return headers;
}

/**
 * Handle CORS preflight requests
 */
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("Origin");
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
}

/**
 * GET /api/auth/[...auth]
 *
 * Get current session from cookies
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ auth: string[] }> }
) {
  const origin = request.headers.get("Origin");
  const corsHeaders = getCorsHeaders(origin);
  const { auth } = await params;
  const action = auth[0];

  try {
    switch (action) {
      case "session": {
        // Get session token from cookie
        const cookies = parseCookies(request.headers.get("Cookie") || "");
        const sessionToken = cookies[COOKIE_NAMES.SESSION_TOKEN];

        if (!sessionToken) {
          return NextResponse.json(
            { authenticated: false, error: "No session" },
            { status: 200, headers: corsHeaders }
          );
        }

        // Validate session with Convex
        const convexUrl = process.env['NEXT_PUBLIC_CONVEX_URL']!.replace(
          ".convex.cloud",
          ".convex.site"
        );

        const response = await fetch(`${convexUrl}/auth/session`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${sessionToken}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        return NextResponse.json(data, {
          status: 200,
          headers: corsHeaders,
        });
      }

      default:
        return NextResponse.json(
          { error: "Unknown action" },
          { status: 400, headers: corsHeaders }
        );
    }
  } catch (error) {
    console.error("Auth API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * POST /api/auth/[...auth]
 *
 * Handle auth actions: login, logout, refresh
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ auth: string[] }> }
) {
  const origin = request.headers.get("Origin");
  const corsHeaders = getCorsHeaders(origin);
  const { auth } = await params;
  const action = auth[0];
  const isProduction = process.env.NODE_ENV === "production";
  const cookieOptions = getCookieOptions(isProduction);

  try {
    switch (action) {
      case "session": {
        // Create a new session (set cookie)
        const body = await request.json();
        const { token, expiresAt } = body;

        if (!token) {
          return NextResponse.json(
            { success: false, error: "Token required" },
            { status: 400, headers: corsHeaders }
          );
        }

        // Create response with session cookie
        const response = NextResponse.json(
          { success: true },
          { status: 200, headers: corsHeaders }
        );

        // Set the session cookie (HttpOnly for security)
        response.headers.set(
          "Set-Cookie",
          serializeCookie(COOKIE_NAMES.SESSION_TOKEN, token, {
            ...cookieOptions,
            maxAge: expiresAt
              ? Math.floor((expiresAt - Date.now()) / 1000)
              : cookieOptions.maxAge,
          })
        );

        return response;
      }

      case "refresh": {
        // Refresh the session
        const cookies = parseCookies(request.headers.get("Cookie") || "");
        const sessionToken = cookies[COOKIE_NAMES.SESSION_TOKEN];

        if (!sessionToken) {
          return NextResponse.json(
            { success: false, error: "No session" },
            { status: 401, headers: corsHeaders }
          );
        }

        // Refresh session with Convex
        const convexUrl = process.env['NEXT_PUBLIC_CONVEX_URL']!.replace(
          ".convex.cloud",
          ".convex.site"
        );

        const refreshResponse = await fetch(`${convexUrl}/auth/refresh`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${sessionToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ rotateToken: true }),
        });

        const data = await refreshResponse.json();

        if (!data.success || !data.session) {
          return NextResponse.json(
            { success: false, error: "Refresh failed" },
            { status: 401, headers: corsHeaders }
          );
        }

        // Create response with new session cookie
        const response = NextResponse.json(
          { success: true, session: data.session },
          { status: 200, headers: corsHeaders }
        );

        // Update the session cookie
        response.headers.set(
          "Set-Cookie",
          serializeCookie(COOKIE_NAMES.SESSION_TOKEN, data.session.token, {
            ...cookieOptions,
            maxAge: Math.floor((data.session.expiresAt - Date.now()) / 1000),
          })
        );

        return response;
      }

      case "logout": {
        // Logout (revoke session and clear cookie)
        const cookies = parseCookies(request.headers.get("Cookie") || "");
        const sessionToken = cookies[COOKIE_NAMES.SESSION_TOKEN];

        if (sessionToken) {
          // Revoke session with Convex
          const convexUrl = process.env['NEXT_PUBLIC_CONVEX_URL']!.replace(
            ".convex.cloud",
            ".convex.site"
          );

          try {
            await fetch(`${convexUrl}/auth/logout`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${sessionToken}`,
                "Content-Type": "application/json",
              },
            });
          } catch (error) {
            console.error("Failed to revoke session:", error);
          }
        }

        // Create response that clears the session cookie
        const response = NextResponse.json(
          { success: true },
          { status: 200, headers: corsHeaders }
        );

        // Clear the session cookie
        response.headers.set(
          "Set-Cookie",
          serializeCookie(COOKIE_NAMES.SESSION_TOKEN, "", {
            ...cookieOptions,
            maxAge: 0,
            expires: new Date(0),
          })
        );

        return response;
      }

      default:
        return NextResponse.json(
          { error: "Unknown action" },
          { status: 400, headers: corsHeaders }
        );
    }
  } catch (error) {
    console.error("Auth API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * DELETE /api/auth/[...auth]
 *
 * Handle session deletion
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ auth: string[] }> }
) {
  const origin = request.headers.get("Origin");
  const corsHeaders = getCorsHeaders(origin);
  const { auth } = await params;
  const action = auth[0];
  const isProduction = process.env.NODE_ENV === "production";
  const cookieOptions = getCookieOptions(isProduction);

  try {
    if (action === "session") {
      // Same as logout
      const cookies = parseCookies(request.headers.get("Cookie") || "");
      const sessionToken = cookies[COOKIE_NAMES.SESSION_TOKEN];

      if (sessionToken) {
        const convexUrl = process.env['NEXT_PUBLIC_CONVEX_URL']!.replace(
          ".convex.cloud",
          ".convex.site"
        );

        try {
          await fetch(`${convexUrl}/auth/logout`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${sessionToken}`,
              "Content-Type": "application/json",
            },
          });
        } catch (error) {
          console.error("Failed to revoke session:", error);
        }
      }

      const response = NextResponse.json(
        { success: true },
        { status: 200, headers: corsHeaders }
      );

      response.headers.set(
        "Set-Cookie",
        serializeCookie(COOKIE_NAMES.SESSION_TOKEN, "", {
          ...cookieOptions,
          maxAge: 0,
          expires: new Date(0),
        })
      );

      return response;
    }

    return NextResponse.json(
      { error: "Unknown action" },
      { status: 400, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Auth API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}
