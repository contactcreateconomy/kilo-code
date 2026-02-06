"use client";

import { type ReactNode, useCallback } from "react";
import { ConvexProvider as ConvexClientProvider, ConvexReactClient } from "convex/react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import {
  AuthProvider,
  SessionSync,
  LoginRedirect,
} from "@createconomy/ui/components/auth";

const convex = new ConvexReactClient(process.env['NEXT_PUBLIC_CONVEX_URL']!);

interface ConvexProviderProps {
  children: ReactNode;
}

/**
 * Convex Provider for Forum App
 *
 * Provides Convex client, authentication, and cross-subdomain session management.
 * Includes:
 * - Convex React client
 * - Convex Auth provider
 * - Cross-subdomain auth provider
 * - Session synchronization across tabs
 * - Login redirect handling
 */
export function ConvexProvider({ children }: ConvexProviderProps) {
  // Handle logout sync from other tabs
  const handleLogoutSync = useCallback(() => {
    // Redirect to sign in page when logged out from another tab
    window.location.href = "/auth/signin";
  }, []);

  // Handle auth errors
  const handleAuthError = useCallback((error: string) => {
    console.error("Auth error:", error);
    // Could show a toast notification here
  }, []);

  return (
    <ConvexClientProvider client={convex}>
      <ConvexAuthProvider client={convex}>
        <AuthProvider
          convexUrl={process.env['NEXT_PUBLIC_CONVEX_URL']!}
          onAuthError={handleAuthError}
        >
          <SessionSync onLogoutSync={handleLogoutSync} />
          <LoginRedirect defaultRedirect="/">
            {children}
          </LoginRedirect>
        </AuthProvider>
      </ConvexAuthProvider>
    </ConvexClientProvider>
  );
}
