"use client";

import { ReactNode, useCallback } from "react";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import {
  AuthProvider,
  SessionSync,
  LoginRedirect,
} from "@createconomy/ui/components/auth";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

interface ConvexClientProviderProps {
  children: ReactNode;
}

/**
 * Convex Client Provider for Seller App
 *
 * Provides Convex client, authentication, and cross-subdomain session management.
 * Includes:
 * - Convex React client
 * - Convex Auth provider
 * - Cross-subdomain auth provider
 * - Session synchronization across tabs
 * - Login redirect handling
 *
 * Seller-specific: Redirects to seller sign-in page on logout
 */
export function ConvexClientProvider({ children }: ConvexClientProviderProps) {
  // Handle logout sync from other tabs
  const handleLogoutSync = useCallback(() => {
    // Redirect to seller sign in page when logged out from another tab
    window.location.href = "/auth/signin";
  }, []);

  // Handle auth errors
  const handleAuthError = useCallback((error: string) => {
    console.error("Auth error:", error);
    // Could show a toast notification here
  }, []);

  return (
    <ConvexProvider client={convex}>
      <ConvexAuthProvider client={convex}>
        <AuthProvider
          convexUrl={process.env.NEXT_PUBLIC_CONVEX_URL!}
          onAuthError={handleAuthError}
        >
          <SessionSync onLogoutSync={handleLogoutSync} />
          <LoginRedirect defaultRedirect="/dashboard">
            {children}
          </LoginRedirect>
        </AuthProvider>
      </ConvexAuthProvider>
    </ConvexProvider>
  );
}
