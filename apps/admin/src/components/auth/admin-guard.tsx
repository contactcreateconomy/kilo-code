'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';

interface AdminGuardProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'moderator';
}

export function AdminGuard({
  children,
  requiredRole = 'moderator',
}: AdminGuardProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/auth/signin');
        return;
      }

      const allowedRoles =
        requiredRole === 'admin' ? ['admin'] : ['admin', 'moderator'];

      if (!user?.role || !allowedRoles.includes(user.role)) {
        router.push('/auth/unauthorized');
      }
    }
  }, [isLoading, isAuthenticated, user, requiredRole, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const allowedRoles =
    requiredRole === 'admin' ? ['admin'] : ['admin', 'moderator'];

  if (!user?.role || !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
