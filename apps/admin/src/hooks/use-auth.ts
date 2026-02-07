'use client';

import { useConvexAuth } from 'convex/react';
import { useQuery } from 'convex/react';
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
  const user = useQuery(api.functions.users.getCurrentUser);

  const role = user?.profile?.defaultRole;
  const isAdmin = role === 'admin';
  const isModerator = role === 'moderator';
  const hasAdminAccess = isAdmin || isModerator;

  return {
    user,
    isAuthenticated,
    isLoading: isLoading || user === undefined,
    isAdmin,
    isModerator,
    hasAdminAccess,
  };
}
