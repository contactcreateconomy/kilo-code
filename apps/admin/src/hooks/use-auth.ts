'use client';

import { useCallback } from 'react';
import { useConvexAuth, useQuery } from 'convex/react';
import { useAuthActions } from '@convex-dev/auth/react';
import { api } from '@createconomy/convex';

export type UserRole = 'customer' | 'seller' | 'moderator' | 'admin';

export interface User {
  _id: string;
  email: string;
  name?: string;
  role: UserRole;
  avatar?: string;
  createdAt: number;
}

export function useAuth() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signIn: convexSignIn, signOut: convexSignOut } = useAuthActions();

  const user = useQuery(
    api.functions.users.getCurrentUser,
    isAuthenticated ? {} : 'skip'
  );

  const role = user?.profile?.defaultRole;
  const isAdmin = role === 'admin';
  const isModerator = role === 'moderator';
  const hasAdminAccess = isAdmin || isModerator;

  const signInWithGoogle = useCallback(async () => {
    const siteUrl = process.env['NEXT_PUBLIC_SITE_URL'] ?? window.location.origin;
    await convexSignIn('google', { redirectTo: siteUrl });
  }, [convexSignIn]);

  const signOut = useCallback(async () => {
    await convexSignOut();
  }, [convexSignOut]);

  return {
    user,
    isAuthenticated,
    isLoading: isLoading || (isAuthenticated && user === undefined),
    isAdmin,
    isModerator,
    hasAdminAccess,
    signInWithGoogle,
    signOut,
  };
}
