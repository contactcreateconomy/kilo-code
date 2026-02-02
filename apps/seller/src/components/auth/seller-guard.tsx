"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface SellerGuardProps {
  children: React.ReactNode;
  requireApproved?: boolean;
}

interface SellerData {
  status: "pending" | "approved" | "suspended";
}

export function SellerGuard({ children, requireApproved = true }: SellerGuardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // TODO: Replace with actual Convex auth check
    const checkAuth = async () => {
      try {
        // Simulated auth check - replace with actual Convex query
        const user = null as unknown | null; // await convex.query(api.users.current);
        const seller = null as SellerData | null; // await convex.query(api.sellers.current);

        if (!user) {
          router.push("/auth/signin");
          return;
        }

        if (!seller) {
          router.push("/auth/signup");
          return;
        }

        if (requireApproved && seller.status !== "approved") {
          router.push("/auth/pending");
          return;
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error("Auth check failed:", error);
        router.push("/auth/signin");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, requireApproved]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[var(--muted-foreground)]">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
