"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "./use-auth";

/**
 * useRequireAuth — Page-level auth guard hook.
 *
 * Checks if the user is authenticated. If not (and auth state has finished
 * loading), redirects to `/auth/signin?returnTo=<currentPath>`.
 *
 * Usage:
 * ```tsx
 * export default function ProtectedPage() {
 *   const { isLoading, isAuthenticated, user } = useRequireAuth();
 *
 *   if (isLoading || !isAuthenticated) {
 *     return <Spinner />;
 *   }
 *
 *   return <ProtectedContent user={user} />;
 * }
 * ```
 */
export function useRequireAuth() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(
        `/auth/signin?returnTo=${encodeURIComponent(pathname)}`
      );
    }
  }, [isLoading, isAuthenticated, router, pathname]);

  return { isAuthenticated, isLoading, user };
}
