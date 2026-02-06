"use client";

import { useQuery, useMutation } from "convex/react";
import { useConvexAuth } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface User {
  _id: string;
  email: string;
  name?: string;
  role: "user" | "seller" | "admin";
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  isSeller: boolean;
  signOut: () => Promise<void>;
}

export function useAuth(): AuthState {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // TODO: Replace with actual Convex query
  // const currentUser = useQuery(api.users.current);

  useEffect(() => {
    if (!authLoading) {
      // Simulated user fetch - replace with actual Convex query
      if (isAuthenticated) {
        // setUser(currentUser);
        setUser(null); // Placeholder
      } else {
        setUser(null);
      }
      setIsLoading(false);
    }
  }, [authLoading, isAuthenticated]);

  const signOut = async () => {
    // TODO: Replace with actual sign out logic
    // This would typically call a Convex mutation or auth provider's signOut
    setUser(null);
  };

  return {
    isAuthenticated,
    isLoading: isLoading || authLoading,
    user,
    isSeller: user?.role === "seller" || user?.role === "admin",
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
