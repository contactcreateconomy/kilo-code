"use client";

import {
  createContext,
  use,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import {
  getSessionToken,
  setSessionToken,
  clearSessionToken,
  getCookieDomain,
  COOKIE_NAMES,
} from "../../lib/auth-cookies";

/**
 * User information from the session
 */
export interface SessionUser {
  id: string;
  email?: string;
  name?: string;
}

/**
 * Session information
 */
export interface Session {
  sessionId: string;
  userId: string;
  tenantId?: string;
  role: "customer" | "seller" | "admin" | "moderator";
  expiresAt: number;
  user: SessionUser | null;
  token: string;
}

/**
 * Auth context state
 */
export interface AuthState {
  /** Whether the auth state is loading */
  isLoading: boolean;
  /** Whether the user is authenticated */
  isAuthenticated: boolean;
  /** Current session */
  session: Session | null;
  /** Current user */
  user: SessionUser | null;
  /** Error message if any */
  error: string | null;
}

/**
 * Auth context actions
 */
export interface AuthActions {
  /** Refresh the current session */
  refreshSession: () => Promise<boolean>;
  /** Sign out the current user */
  signOut: (options?: { revokeAll?: boolean }) => Promise<void>;
  /** Update the session token */
  setSession: (session: Session) => void;
  /** Clear the session */
  clearSession: () => void;
  /** Check if user has a specific role */
  hasRole: (role: "customer" | "seller" | "admin" | "moderator") => boolean;
  /** Check if user has any of the specified roles */
  hasAnyRole: (roles: Array<"customer" | "seller" | "admin" | "moderator">) => boolean;
}

/**
 * Auth context value
 */
export type AuthContextValue = AuthState & AuthActions;

/**
 * Auth context
 */
const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Auth provider props
 */
export interface AuthProviderProps {
  children: ReactNode;
  /** Convex HTTP URL for auth endpoints */
  convexUrl: string;
  /** Initial session token (from server-side) */
  initialToken?: string;
  /** Callback when session changes */
  onSessionChange?: (session: Session | null) => void;
  /** Callback when auth error occurs */
  onAuthError?: (error: string) => void;
  /** Session refresh interval in milliseconds (default: 5 minutes) */
  refreshInterval?: number;
}

/**
 * Auth Provider Component
 *
 * Provides authentication state and actions to the application.
 * Handles cross-subdomain session management.
 */
export function AuthProvider({
  children,
  convexUrl,
  initialToken,
  onSessionChange,
  onAuthError,
  refreshInterval = 5 * 60 * 1000, // 5 minutes
}: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    isLoading: true,
    isAuthenticated: false,
    session: null,
    user: null,
    error: null,
  });

  // Get the HTTP URL for auth endpoints
  const authBaseUrl = useMemo(() => {
    if (!convexUrl) {
      return "";
    }
    // Convert Convex URL to HTTP URL
    // e.g., https://xxx.convex.cloud -> https://xxx.convex.site
    return convexUrl.replace(".convex.cloud", ".convex.site");
  }, [convexUrl]);

  /**
   * Validate session with the server
   */
  const validateSession = useCallback(
    async (token: string): Promise<Session | null> => {
      try {
        const response = await fetch(`${authBaseUrl}/auth/session`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!response.ok) {
          return null;
        }

        const data = await response.json();

        if (!data.authenticated || !data.session) {
          return null;
        }

        return {
          ...data.session,
          token,
        };
      } catch (error) {
        console.error("Session validation error:", error);
        return null;
      }
    },
    [authBaseUrl]
  );

  /**
   * Refresh the current session
   */
  const refreshSession = useCallback(async (): Promise<boolean> => {
    const token = state.session?.token || getSessionToken();

    if (!token) {
      return false;
    }

    try {
      const response = await fetch(`${authBaseUrl}/auth/refresh`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ rotateToken: true }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();

      if (!data.success || !data.session) {
        return false;
      }

      const newSession: Session = {
        ...data.session,
        user: state.session?.user || null,
      };

      // Update the session token cookie
      setSessionToken(newSession.token);

      setState((prev) => ({
        ...prev,
        session: newSession,
        isAuthenticated: true,
        error: null,
      }));

      onSessionChange?.(newSession);

      return true;
    } catch (error) {
      console.error("Session refresh error:", error);
      return false;
    }
  }, [authBaseUrl, state.session, onSessionChange]);

  /**
   * Sign out the current user
   */
  const signOut = useCallback(
    async (options?: { revokeAll?: boolean }): Promise<void> => {
      const token = state.session?.token || getSessionToken();

      if (token) {
        try {
          await fetch(`${authBaseUrl}/auth/logout`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ revokeAll: options?.revokeAll ?? false }),
          });
        } catch (error) {
          console.error("Sign out error:", error);
        }
      }

      // Clear local state
      clearSessionToken();
      setState({
        isLoading: false,
        isAuthenticated: false,
        session: null,
        user: null,
        error: null,
      });

      onSessionChange?.(null);
    },
    [authBaseUrl, state.session, onSessionChange]
  );

  /**
   * Set the session
   */
  const setSession = useCallback(
    (session: Session) => {
      setSessionToken(session.token);
      setState({
        isLoading: false,
        isAuthenticated: true,
        session,
        user: session.user,
        error: null,
      });
      onSessionChange?.(session);
    },
    [onSessionChange]
  );

  /**
   * Clear the session
   */
  const clearSession = useCallback(() => {
    clearSessionToken();
    setState({
      isLoading: false,
      isAuthenticated: false,
      session: null,
      user: null,
      error: null,
    });
    onSessionChange?.(null);
  }, [onSessionChange]);

  /**
   * Check if user has a specific role
   */
  const hasRole = useCallback(
    (role: "customer" | "seller" | "admin" | "moderator"): boolean => {
      return state.session?.role === role;
    },
    [state.session]
  );

  /**
   * Check if user has any of the specified roles
   */
  const hasAnyRole = useCallback(
    (roles: Array<"customer" | "seller" | "admin" | "moderator">): boolean => {
      return state.session?.role ? roles.includes(state.session.role) : false;
    },
    [state.session]
  );

  // Initialize session on mount
  useEffect(() => {
    const initSession = async () => {
      const token = initialToken || getSessionToken();

      if (!token) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
        }));
        return;
      }

      const session = await validateSession(token);

      if (session) {
        setState({
          isLoading: false,
          isAuthenticated: true,
          session,
          user: session.user,
          error: null,
        });
        onSessionChange?.(session);
      } else {
        // Invalid session, clear it
        clearSessionToken();
        setState({
          isLoading: false,
          isAuthenticated: false,
          session: null,
          user: null,
          error: null,
        });
      }
    };

    initSession();
  }, [initialToken, validateSession, onSessionChange]);

  // Set up session refresh interval
  useEffect(() => {
    if (!state.isAuthenticated || !state.session) {
      return;
    }

    const intervalId = setInterval(async () => {
      // Check if session needs refresh (within 1 day of expiry)
      const timeUntilExpiry = state.session!.expiresAt - Date.now();
      const refreshThreshold = 24 * 60 * 60 * 1000; // 1 day

      if (timeUntilExpiry < refreshThreshold) {
        const success = await refreshSession();
        if (!success) {
          // Session refresh failed, sign out
          await signOut();
          onAuthError?.("Session expired. Please sign in again.");
        }
      }
    }, refreshInterval);

    return () => clearInterval(intervalId);
  }, [state.isAuthenticated, state.session, refreshSession, signOut, refreshInterval, onAuthError]);

  const contextValue = useMemo<AuthContextValue>(
    () => ({
      ...state,
      refreshSession,
      signOut,
      setSession,
      clearSession,
      hasRole,
      hasAnyRole,
    }),
    [state, refreshSession, signOut, setSession, clearSession, hasRole, hasAnyRole]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access auth context
 *
 * @returns Auth context value
 * @throws Error if used outside AuthProvider
 */
export function useAuth(): AuthContextValue {
  const context = use(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}

/**
 * Hook to check if user is authenticated
 *
 * @returns Whether user is authenticated
 */
export function useIsAuthenticated(): boolean {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
}

/**
 * Hook to get current user
 *
 * @returns Current user or null
 */
export function useUser(): SessionUser | null {
  const { user } = useAuth();
  return user;
}

/**
 * Hook to get current session
 *
 * @returns Current session or null
 */
export function useSession(): Session | null {
  const { session } = useAuth();
  return session;
}

export { AuthContext };
