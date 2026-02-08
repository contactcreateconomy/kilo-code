"use client";

import { useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "./use-auth";

/**
 * useAuthAction — Action-level auth gate hook.
 *
 * Returns a `requireAuth` wrapper that checks authentication before executing
 * an action. If the user is not authenticated, they are redirected to the
 * sign-in page with a `returnTo` query parameter pointing back to the current
 * page.
 *
 * Usage:
 * ```tsx
 * const { requireAuth, isAuthenticated } = useAuthAction();
 *
 * const handleUpvote = (e: React.MouseEvent) => {
 *   e.preventDefault();
 *   requireAuth(async () => {
 *     await toggle(id, 'upvote');
 *   });
 * };
 * ```
 */
export function useAuthAction() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const requireAuth = useCallback(
    (action: () => void | Promise<void>) => {
      if (!isAuthenticated) {
        router.push(
          `/auth/signin?returnTo=${encodeURIComponent(pathname)}`
        );
        return;
      }
      action();
    },
    [isAuthenticated, router, pathname]
  );

  return { requireAuth, isAuthenticated };
}
