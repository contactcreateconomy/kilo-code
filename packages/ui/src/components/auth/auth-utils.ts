/**
 * Pure utility functions for evaluating auth access decisions
 * and computing redirect URLs.
 *
 * These functions contain no side effects and can be tested independently
 * of any React context or hook.
 */

/** The role union used across the auth system. */
export type AuthRole = "customer" | "seller" | "admin" | "moderator";

/** Outcome of an access evaluation. */
export type AccessDecision = "allowed" | "unauthenticated" | "unauthorized";

/**
 * Pure function to evaluate access based on auth state and role requirements.
 *
 * @returns An {@link AccessDecision} indicating whether access is allowed,
 *   the user is unauthenticated, or the user lacks the required role.
 */
export function evaluateAccess(options: {
  isAuthenticated: boolean;
  hasRole: (role: AuthRole) => boolean;
  hasAnyRole: (roles: AuthRole[]) => boolean;
  requiredRole?: AuthRole;
  requiredRoles?: AuthRole[];
}): AccessDecision {
  const { isAuthenticated, hasRole, hasAnyRole, requiredRole, requiredRoles } =
    options;

  if (!isAuthenticated) {
    return "unauthenticated";
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return "unauthorized";
  }

  if (requiredRoles && requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
    return "unauthorized";
  }

  return "allowed";
}

/**
 * Pure function to compute a redirect URL based on an access decision.
 *
 * @returns The URL to redirect to, or `null` when the decision is `"allowed"`.
 */
export function resolveRedirect(options: {
  decision: AccessDecision;
  loginUrl: string;
  unauthorizedUrl: string;
  currentHref?: string;
  origin?: string;
}): string | null {
  const { decision, loginUrl, unauthorizedUrl, currentHref, origin } = options;

  if (decision === "allowed") {
    return null;
  }

  if (decision === "unauthenticated") {
    if (origin) {
      const redirectUrl = new URL(loginUrl, origin);
      if (currentHref) {
        redirectUrl.searchParams.set("redirect", currentHref);
      }
      return redirectUrl.toString();
    }
    // Without an origin we cannot build an absolute URL; return as-is
    return loginUrl;
  }

  // "unauthorized"
  return unauthorizedUrl;
}
