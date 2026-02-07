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

// ---------- Auth Form Components ----------

// Icons
export { GoogleIcon, GitHubIcon, SpinnerIcon } from "./auth-icons";

// Error Alert
export { AuthErrorAlert, type AuthErrorAlertProps } from "./auth-error-alert";

// OAuth Divider
export { OAuthDivider, type OAuthDividerProps } from "./oauth-divider";

// Social Login Grid
export {
  SocialLoginGrid,
  type SocialLoginGridProps,
} from "./social-login-grid";

// Shared Sign-In Form
export {
  SharedSignInForm,
  type SharedSignInFormProps,
} from "./sign-in-form";

// Shared Sign-Up Form
export {
  SharedSignUpForm,
  type SharedSignUpFormProps,
  type SignUpData,
} from "./sign-up-form";

// Admin Sign-In Form (Google-only)
export {
  AdminSignInForm,
  type AdminSignInFormProps,
} from "./admin-sign-in-form";

// Auth Page Wrapper
export {
  AuthPageWrapper,
  type AuthPageWrapperProps,
} from "./auth-page-wrapper";
