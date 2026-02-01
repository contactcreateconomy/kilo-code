"use client";

import { useCallback } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "@createconomy/convex";

interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  role?: string;
}

export function useAuth() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const { signIn: convexSignIn, signOut: convexSignOut } = useAuthActions();
  
  // Get current user data
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
      await convexSignIn("password", { email, password, username, flow: "signUp" });
    },
    [convexSignIn]
  );

  const signInWithGoogle = useCallback(async () => {
    await convexSignIn("google");
  }, [convexSignIn]);

  const signInWithGitHub = useCallback(async () => {
    await convexSignIn("github");
  }, [convexSignIn]);

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
