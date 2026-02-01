'use client';

import { useConvexAuth } from 'convex/react';
import { useQuery } from 'convex/react';
import { api } from '@createconomy/convex';

export type UserRole = 'user' | 'seller' | 'moderator' | 'admin';

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
  const user = useQuery(api.functions.users.getCurrentUser);

  const isAdmin = user?.role === 'admin';
  const isModerator = user?.role === 'moderator';
  const hasAdminAccess = isAdmin || isModerator;

  return {
    user: user as User | null | undefined,
    isAuthenticated,
    isLoading: isLoading || user === undefined,
    isAdmin,
    isModerator,
    hasAdminAccess,
  };
}
