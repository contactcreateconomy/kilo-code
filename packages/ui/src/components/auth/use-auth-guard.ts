"use client";

import { useEffect } from "react";
import { useAuth } from "./auth-provider";
import {
  evaluateAccess,
  resolveRedirect,
  type AccessDecision,
  type AuthRole,
} from "./auth-utils";

/**
 * Options accepted by the {@link useAuthGuard} hook.
 */
export interface UseAuthGuardOptions {
  /** Single role required to access the guarded content. */
  requiredRole?: AuthRole;
  /** Any of these roles grants access. */
  requiredRoles?: AuthRole[];
  /** URL to redirect unauthenticated users to. */
  loginUrl?: string;
  /** URL to redirect unauthorized (wrong role) users to. */
  unauthorizedUrl?: string;
  /** Callback fired when access is denied. */
  onAccessDenied?: (reason: "unauthenticated" | "unauthorized") => void;
  /**
   * When `true` a fallback UI will be rendered instead of redirecting.
   * The hook skips the redirect side-effect in this case.
   */
  hasFallback?: boolean;
}

/**
 * Return value of the {@link useAuthGuard} hook.
 */
export interface UseAuthGuardResult {
  /** The evaluated access decision. */
  decision: AccessDecision;
  /** Whether the auth state is still loading. */
  isLoading: boolean;
}

/**
 * Hook that evaluates auth access and optionally triggers a redirect.
 *
 * Composes {@link evaluateAccess} and {@link resolveRedirect} so that
 * consuming components only need to inspect `decision` and `isLoading`.
 */
export function useAuthGuard(options: UseAuthGuardOptions = {}): UseAuthGuardResult {
  const {
    requiredRole,
    requiredRoles,
    loginUrl = "/auth/signin",
    unauthorizedUrl = "/auth/unauthorized",
    onAccessDenied,
    hasFallback = false,
  } = options;

  const { isLoading, isAuthenticated, hasRole, hasAnyRole } = useAuth();

  const decision: AccessDecision = isLoading
    ? "allowed" // Treat loading as neutral; the caller renders a spinner
    : evaluateAccess({
        isAuthenticated,
        hasRole,
        hasAnyRole,
        requiredRole,
        requiredRoles,
      });

  // Side-effect: notify and optionally redirect on denied access
  useEffect(() => {
    if (isLoading) return;
    if (decision === "allowed") return;

    onAccessDenied?.(decision);

    if (!hasFallback && typeof window !== "undefined") {
      const redirectUrl = resolveRedirect({
        decision,
        loginUrl,
        unauthorizedUrl,
        currentHref: window.location.href,
        origin: window.location.origin,
      });

      if (redirectUrl) {
        window.location.href = redirectUrl;
      }
    }
  }, [
    isLoading,
    decision,
    loginUrl,
    unauthorizedUrl,
    hasFallback,
    onAccessDenied,
  ]);

  return { decision, isLoading };
}
