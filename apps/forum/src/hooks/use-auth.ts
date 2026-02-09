"use client";

import { useCallback } from "react";
import { useConvexAuth, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "@createconomy/convex";

/**
 * User interface matching the Convex getCurrentUser response
 */
export interface User {
  id: string;
  email?: string;
  name?: string;
  image?: string;
  emailVerificationTime?: number;
  profile?: {
    displayName?: string;
    bio?: string;
    avatarUrl?: string;
    phone?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
    };
    preferences?: {
      emailNotifications?: boolean;
      marketingEmails?: boolean;
      language?: string;
      currency?: string;
    };
    defaultRole?: string;
    isBanned?: boolean;
    createdAt?: number;
    updatedAt?: number;
  } | null;
}

/**
 * useAuth - Authentication hook for the forum app
 * 
 * Provides authentication state and methods using Convex Auth.
 * Supports email/password, Google OAuth, and GitHub OAuth.
 * 
 * @example
 * ```tsx
 * const { user, isAuthenticated, isLoading, signInWithGoogle, signOut } = useAuth();
 * 
 * if (isLoading) return <Spinner />;
 * if (!isAuthenticated) return <SignInButton />;
 * return <UserProfile user={user} />;
 * ```
 */
export function useAuth() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const { signIn: convexSignIn, signOut: convexSignOut } = useAuthActions();
  
  // Get current user data from Convex
  const user = useQuery(
    api.functions.users.getCurrentUser,
    isAuthenticated ? {} : "skip"
  ) as User | null | undefined;

  /**
   * Sign in with email and password
   */
  const signIn = useCallback(
    async (email: string, password: string) => {
      await convexSignIn("password", { email, password, flow: "signIn" });
    },
    [convexSignIn]
  );

  /**
   * Sign up with email, password, and username
   */
  const signUp = useCallback(
    async (email: string, password: string, username: string) => {
      await convexSignIn("password", { email, password, username, flow: "signUp" });
    },
    [convexSignIn]
  );

  /**
   * Sign in with Google OAuth
   * Redirects to Google for authentication, then back to the forum app
   */
  const signInWithGoogle = useCallback(async () => {
    const siteUrl = process.env['NEXT_PUBLIC_SITE_URL'] ?? window.location.origin;
    await convexSignIn("google", { redirectTo: siteUrl });
  }, [convexSignIn]);

  /**
   * Sign in with GitHub OAuth
   * Redirects to GitHub for authentication, then back to the forum app
   */
  const signInWithGitHub = useCallback(async () => {
    const siteUrl = process.env['NEXT_PUBLIC_SITE_URL'] ?? window.location.origin;
    await convexSignIn("github", { redirectTo: siteUrl });
  }, [convexSignIn]);

  /**
   * Sign out the current user
   * Clears the session and redirects to home
   */
  const signOut = useCallback(async () => {
    await convexSignOut();
  }, [convexSignOut]);

  return {
    user: user ?? null,
    isLoading,
    isAuthenticated,
    signIn,
    signUp,
    signInWithGoogle,
    signInWithGitHub,
    signOut,
  };
}
