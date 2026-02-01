"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

export default function SignOutPage() {
  const router = useRouter();
  const { signOut, isLoading } = useAuth();

  useEffect(() => {
    const handleSignOut = async () => {
      await signOut();
      router.push("/auth/signin");
    };

    handleSignOut();
  }, [signOut, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[var(--muted)] flex items-center justify-center">
          {isLoading ? (
            <svg
              className="w-8 h-8 animate-spin text-[var(--primary)]"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            <svg
              className="w-8 h-8 text-[var(--success)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </div>
        <h1 className="text-xl font-semibold mb-2">
          {isLoading ? "Signing out..." : "Signed out successfully"}
        </h1>
        <p className="text-[var(--muted-foreground)]">
          {isLoading
            ? "Please wait while we sign you out."
            : "You have been signed out of your account."}
        </p>
      </div>
    </div>
  );
}
