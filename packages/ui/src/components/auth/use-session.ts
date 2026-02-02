"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth, type Session, type SessionUser } from "./auth-provider";
import { getSessionToken } from "../../lib/auth-cookies";

/**
 * Session state returned by useSession hook
 */
export interface UseSessionReturn {
  /** Current session data */
  session: Session | null;
  /** Current user data */
  user: SessionUser | null;
  /** Whether the session is loading */
  isLoading: boolean;
  /** Whether the user is authenticated */
  isAuthenticated: boolean;
  /** Session error if any */
  error: string | null;
  /** User's role */
  role: "customer" | "seller" | "admin" | "moderator" | null;
  /** Session expiration time */
  expiresAt: number | null;
  /** Whether the session needs refresh */
  needsRefresh: boolean;
  /** Refresh the session */
  refresh: () => Promise<boolean>;
  /** Sign out */
  signOut: (options?: { revokeAll?: boolean }) => Promise<void>;
  /** Check if user has a specific role */
  hasRole: (role: "customer" | "seller" | "admin" | "moderator") => boolean;
  /** Check if user has any of the specified roles */
  hasAnyRole: (roles: Array<"customer" | "seller" | "admin" | "moderator">) => boolean;
}

/**
 * Hook for accessing and managing the current session
 *
 * Provides session data, user info, and session management functions.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { session, user, isAuthenticated, signOut } = useSession();
 *
 *   if (!isAuthenticated) {
 *     return <LoginButton />;
 *   }
 *
 *   return (
 *     <div>
 *       <p>Welcome, {user?.name}</p>
 *       <button onClick={() => signOut()}>Sign Out</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useSession(): UseSessionReturn {
  const auth = useAuth();

  const needsRefresh = auth.session
    ? auth.session.expiresAt - Date.now() < 24 * 60 * 60 * 1000 // 1 day
    : false;

  return {
    session: auth.session,
    user: auth.user,
    isLoading: auth.isLoading,
    isAuthenticated: auth.isAuthenticated,
    error: auth.error,
    role: auth.session?.role || null,
    expiresAt: auth.session?.expiresAt || null,
    needsRefresh,
    refresh: auth.refreshSession,
    signOut: auth.signOut,
    hasRole: auth.hasRole,
    hasAnyRole: auth.hasAnyRole,
  };
}

/**
 * Hook for checking authentication status
 *
 * @returns Object with authentication status and loading state
 *
 * @example
 * ```tsx
 * function ProtectedContent() {
 *   const { isAuthenticated, isLoading } = useAuthStatus();
 *
 *   if (isLoading) return <Spinner />;
 *   if (!isAuthenticated) return <Redirect to="/login" />;
 *
 *   return <SecretContent />;
 * }
 * ```
 */
export function useAuthStatus(): {
  isAuthenticated: boolean;
  isLoading: boolean;
} {
  const { isAuthenticated, isLoading } = useAuth();
  return { isAuthenticated, isLoading };
}

/**
 * Hook for getting the current user
 *
 * @returns Current user or null
 *
 * @example
 * ```tsx
 * function UserProfile() {
 *   const user = useCurrentUser();
 *
 *   if (!user) return null;
 *
 *   return <p>Hello, {user.name}</p>;
 * }
 * ```
 */
export function useCurrentUser(): SessionUser | null {
  const { user } = useAuth();
  return user;
}

/**
 * Hook for checking user roles
 *
 * @returns Object with role checking functions
 *
 * @example
 * ```tsx
 * function AdminPanel() {
 *   const { isAdmin, isSeller, hasRole } = useUserRole();
 *
 *   if (!isAdmin) return <AccessDenied />;
 *
 *   return <AdminDashboard />;
 * }
 * ```
 */
export function useUserRole(): {
  role: "customer" | "seller" | "admin" | "moderator" | null;
  isCustomer: boolean;
  isSeller: boolean;
  isAdmin: boolean;
  isModerator: boolean;
  isAdminOrModerator: boolean;
  hasRole: (role: "customer" | "seller" | "admin" | "moderator") => boolean;
  hasAnyRole: (roles: Array<"customer" | "seller" | "admin" | "moderator">) => boolean;
} {
  const { session, hasRole, hasAnyRole } = useAuth();

  return {
    role: session?.role || null,
    isCustomer: session?.role === "customer",
    isSeller: session?.role === "seller",
    isAdmin: session?.role === "admin",
    isModerator: session?.role === "moderator",
    isAdminOrModerator: session?.role === "admin" || session?.role === "moderator",
    hasRole,
    hasAnyRole,
  };
}

/**
 * Hook for session expiration tracking
 *
 * @returns Object with expiration info and refresh function
 *
 * @example
 * ```tsx
 * function SessionWarning() {
 *   const { expiresIn, isExpiringSoon, refresh } = useSessionExpiration();
 *
 *   if (isExpiringSoon) {
 *     return (
 *       <Alert>
 *         Session expires in {Math.floor(expiresIn / 60000)} minutes
 *         <button onClick={refresh}>Extend Session</button>
 *       </Alert>
 *     );
 *   }
 *
 *   return null;
 * }
 * ```
 */
export function useSessionExpiration(): {
  expiresAt: number | null;
  expiresIn: number;
  isExpired: boolean;
  isExpiringSoon: boolean;
  refresh: () => Promise<boolean>;
} {
  const { session, refreshSession } = useAuth();
  const [now, setNow] = useState(Date.now());

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const expiresAt = session?.expiresAt || null;
  const expiresIn = expiresAt ? Math.max(0, expiresAt - now) : 0;
  const isExpired = expiresAt ? expiresAt <= now : false;
  const isExpiringSoon = expiresAt
    ? expiresAt - now < 24 * 60 * 60 * 1000 // 1 day
    : false;

  return {
    expiresAt,
    expiresIn,
    isExpired,
    isExpiringSoon,
    refresh: refreshSession,
  };
}

/**
 * Hook for requiring authentication
 *
 * Redirects to login if not authenticated.
 *
 * @param redirectUrl - URL to redirect to for login
 * @returns Session data if authenticated
 *
 * @example
 * ```tsx
 * function ProtectedPage() {
 *   const session = useRequireAuth("/login");
 *
 *   // This will only render if authenticated
 *   return <ProtectedContent session={session} />;
 * }
 * ```
 */
export function useRequireAuth(redirectUrl: string = "/auth/signin"): Session | null {
  const { session, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Store current URL for redirect after login
      if (typeof window !== "undefined") {
        const currentUrl = window.location.href;
        const loginUrl = new URL(redirectUrl, window.location.origin);
        loginUrl.searchParams.set("redirect", currentUrl);
        window.location.href = loginUrl.toString();
      }
    }
  }, [isLoading, isAuthenticated, redirectUrl]);

  return session;
}

/**
 * Hook for requiring a specific role
 *
 * Redirects to unauthorized page if user doesn't have the required role.
 *
 * @param requiredRole - Role required to access the content
 * @param unauthorizedUrl - URL to redirect to if unauthorized
 * @returns Session data if authorized
 *
 * @example
 * ```tsx
 * function AdminPage() {
 *   const session = useRequireRole("admin", "/unauthorized");
 *
 *   // This will only render if user is admin
 *   return <AdminDashboard />;
 * }
 * ```
 */
export function useRequireRole(
  requiredRole: "customer" | "seller" | "admin" | "moderator",
  unauthorizedUrl: string = "/auth/unauthorized"
): Session | null {
  const { session, isLoading, isAuthenticated, hasRole } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        // Not authenticated, redirect to login
        if (typeof window !== "undefined") {
          const currentUrl = window.location.href;
          const loginUrl = new URL("/auth/signin", window.location.origin);
          loginUrl.searchParams.set("redirect", currentUrl);
          window.location.href = loginUrl.toString();
        }
      } else if (!hasRole(requiredRole)) {
        // Authenticated but wrong role
        if (typeof window !== "undefined") {
          window.location.href = unauthorizedUrl;
        }
      }
    }
  }, [isLoading, isAuthenticated, hasRole, requiredRole, unauthorizedUrl]);

  return session;
}

/**
 * Hook for getting session token
 *
 * @returns Current session token or null
 */
export function useSessionToken(): string | null {
  const { session } = useAuth();
  return session?.token || getSessionToken();
}
