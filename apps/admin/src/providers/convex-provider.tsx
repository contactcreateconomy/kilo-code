'use client';

import { useCallback } from 'react';
import type { ReactNode } from 'react';
import { ConvexProvider as ConvexProviderBase, ConvexReactClient } from 'convex/react';
import { ConvexAuthProvider } from '@convex-dev/auth/react';
import {
  AuthProvider,
  SessionSync,
  LoginRedirect,
} from '@createconomy/ui/components/auth';

const convex = new ConvexReactClient(process.env['NEXT_PUBLIC_CONVEX_URL']!);

interface ConvexProviderProps {
  children: React.ReactNode;
}

/**
 * Convex Provider for Admin App
 *
 * Provides Convex client, authentication, and cross-subdomain session management.
 * Includes:
 * - Convex React client
 * - Convex Auth provider
 * - Cross-subdomain auth provider
 * - Session synchronization across tabs
 * - Login redirect handling
 *
 * Admin-specific: Redirects to admin sign-in page on logout
 */
export function ConvexProvider({ children }: ConvexProviderProps) {
  // Handle logout sync from other tabs
  const handleLogoutSync = useCallback(() => {
    // Redirect to admin sign in page when logged out from another tab
    window.location.href = '/auth/signin';
  }, []);

  // Handle auth errors
  const handleAuthError = useCallback((error: string) => {
    console.error('Auth error:', error);
    // Could show a toast notification here
  }, []);

  return (
    <ConvexProviderBase client={convex}>
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
    </ConvexProviderBase>
  );
}
