/**
 * Cross-Subdomain Authentication Components
 *
 * This module exports all authentication-related components and hooks
 * for the Createconomy platform's cross-subdomain authentication system.
 */

// Auth Provider and Context
export {
  AuthProvider,
  useAuth,
  useIsAuthenticated,
  useUser,
  useSession as useSessionContext,
  AuthContext,
  type AuthProviderProps,
  type AuthState,
  type AuthActions,
  type AuthContextValue,
  type Session,
  type SessionUser,
} from "./auth-provider";

// Session Hooks
export {
  useSession,
  useAuthStatus,
  useCurrentUser,
  useUserRole,
  useSessionExpiration,
  useRequireAuth,
  useRequireRole,
  useSessionToken,
  type UseSessionReturn,
} from "./use-session";

// Session Sync
export {
  SessionSync,
  useSessionSync,
  useStorageSync,
  type SessionSyncProps,
} from "./session-sync";

// Protected Routes
export {
  ProtectedRoute,
  AdminRoute,
  SellerRoute,
  ModeratorRoute,
  withAuth,
  type ProtectedRouteProps,
  type AdminRouteProps,
  type SellerRouteProps,
  type ModeratorRouteProps,
} from "./protected-route";

// Login Redirect
export {
  LoginRedirect,
  RedirectAfterLogin,
  useLoginRedirect,
  getRedirectFromQuery,
  buildLoginUrl,
  buildCrossSubdomainRedirect,
  type LoginRedirectProps,
  type RedirectAfterLoginProps,
} from "./login-redirect";
