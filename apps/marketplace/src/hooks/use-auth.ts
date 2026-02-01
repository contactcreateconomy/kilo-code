"use client";

import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "@createconomy/convex";

export interface User {
  id: string;
  name?: string;
  email?: string;
  image?: string;
  role?: "user" | "seller" | "admin";
}

export function useAuth() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signIn: convexSignIn, signOut: convexSignOut } = useAuthActions();

  // Get current user data from Convex
  const user = useQuery(
    api.functions.users.getCurrentUser,
    isAuthenticated ? {} : "skip"
  ) as User | null | undefined;

  const signIn = async (email: string, password: string) => {
    await convexSignIn("password", { email, password, flow: "signIn" });
  };

  const signUp = async (name: string, email: string, password: string) => {
    await convexSignIn("password", { email, password, name, flow: "signUp" });
  };

  const signInWithGoogle = async () => {
    await convexSignIn("google");
  };

  const signInWithGitHub = async () => {
    await convexSignIn("github");
  };

  const signOut = async () => {
    await convexSignOut();
  };

  return {
    user: user ?? null,
    isAuthenticated,
    isLoading: isLoading || (isAuthenticated && user === undefined),
    signIn,
    signUp,
    signInWithGoogle,
    signInWithGitHub,
    signOut,
  };
}
