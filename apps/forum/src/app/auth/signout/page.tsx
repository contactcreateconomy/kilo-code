"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@createconomy/ui";

export default function SignOutPage() {
  const router = useRouter();

  useEffect(() => {
    // In production, this would call the Convex auth signOut function
    const signOut = async () => {
      try {
        // await convexAuth.signOut();
        // Simulated sign out delay
        await new Promise((resolve) => setTimeout(resolve, 1000));
        router.push("/");
      } catch (error) {
        console.error("Sign out failed:", error);
        router.push("/");
      }
    };

    signOut();
  }, [router]);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-md text-center">
        <div className="mb-8">
          <Skeleton className="h-16 w-16 rounded-full mx-auto mb-4" />
          <h1 className="text-2xl font-bold tracking-tight mb-2">
            Signing out...
          </h1>
          <p className="text-muted-foreground">
            Please wait while we sign you out.
          </p>
        </div>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    </div>
  );
}
