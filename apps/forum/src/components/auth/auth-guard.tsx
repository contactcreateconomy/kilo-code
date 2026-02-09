"use client";

import { useRequireAuth } from "@/hooks/use-require-auth";
import { Spinner } from "@createconomy/ui";

/**
 * AuthGuard — Client component that redirects unauthenticated users to sign-in.
 *
 * Wrap any content that requires authentication. While the auth state is
 * loading, a centered spinner is shown. If the user is not authenticated,
 * `useRequireAuth` triggers a redirect and `null` is rendered.
 *
 * Usage:
 * ```tsx
 * <AuthGuard>
 *   <ProtectedContent />
 * </AuthGuard>
 * ```
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useRequireAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="xl" className="text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // useRequireAuth already triggered redirect
    return null;
  }

  return <>{children}</>;
}
