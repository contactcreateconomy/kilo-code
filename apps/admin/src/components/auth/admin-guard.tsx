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
  const { isLoading, isAuthenticated, isAdmin, hasAdminAccess } = useAuth();
  const router = useRouter();

  const hasRequiredAccess = requiredRole === 'admin' ? isAdmin : hasAdminAccess;

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/auth/signin');
        return;
      }

      if (!hasRequiredAccess) {
        router.push('/auth/unauthorized');
      }
    }
  }, [isLoading, isAuthenticated, hasRequiredAccess, router]);

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

  if (!hasRequiredAccess) {
    return null;
  }

  return <>{children}</>;
}
