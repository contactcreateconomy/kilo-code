"use client";

import { useCallback } from "react";
import { useConvexAuth, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { api } from "@createconomy/convex";

interface User {
  _id: string;
  email?: string;
  name?: string;
  image?: string;
  profile?: {
    defaultRole?: string;
  } | null;
}

/**
 * useAuth - Authentication hook for the seller app.
 *
 * Provides authentication state and methods using Convex Auth.
 * Includes seller-specific role checks.
 */
export function useAuth() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const { signIn: convexSignIn, signOut: convexSignOut } = useAuthActions();

  const user = useQuery(
    api.functions.users.getCurrentUser,
    isAuthenticated ? {} : "skip"
  ) as User | null | undefined;

  const signIn = useCallback(
    async (email: string, password: string) => {
      await convexSignIn("password", { email, password, flow: "signIn" });
    },
    [convexSignIn]
  );

  const signUp = useCallback(
    async (email: string, password: string, username: string) => {
      await convexSignIn("password", {
        email,
        password,
        username,
        flow: "signUp",
      });
    },
    [convexSignIn]
  );

  const signInWithGoogle = useCallback(async () => {
    const siteUrl = process.env['NEXT_PUBLIC_SITE_URL'] ?? window.location.origin;
    await convexSignIn("google", { redirectTo: siteUrl });
  }, [convexSignIn]);

  const signInWithGitHub = useCallback(async () => {
    const siteUrl = process.env['NEXT_PUBLIC_SITE_URL'] ?? window.location.origin;
    await convexSignIn("github", { redirectTo: siteUrl });
  }, [convexSignIn]);

  const signOut = useCallback(async () => {
    await convexSignOut();
  }, [convexSignOut]);

  const role = user?.profile?.defaultRole;

  return {
    user: user ?? null,
    isLoading,
    isAuthenticated,
    isSeller: role === "seller" || role === "admin",
    signIn,
    signUp,
    signInWithGoogle,
    signInWithGitHub,
    signOut,
  };
}

export function useRequireAuth(redirectTo: string = "/auth/signin") {
  const { isAuthenticated, isLoading, isSeller } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isLoading, isAuthenticated, router, redirectTo]);

  return { isAuthenticated, isLoading, isSeller };
}

export function useRequireSeller(redirectTo: string = "/auth/signin") {
  const { isAuthenticated, isLoading, isSeller } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push(redirectTo);
      } else if (!isSeller) {
        router.push("/auth/pending");
      }
    }
  }, [isLoading, isAuthenticated, isSeller, router, redirectTo]);

  return { isAuthenticated, isLoading, isSeller };
}
