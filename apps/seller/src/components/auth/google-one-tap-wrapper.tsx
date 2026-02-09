"use client";

import { useAuth } from "@/hooks/use-auth";
import { GoogleOneTap } from "@/components/auth/google-one-tap";

/**
 * GoogleOneTapWrapper - Client component that conditionally renders
 * Google One Tap when the user is not authenticated.
 *
 * Added to the root layout so One Tap appears on every page.
 */
export function GoogleOneTapWrapper() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isAuthenticated || isLoading) {
    return null;
  }

  return (
    <GoogleOneTap
      onSuccess={() => {
        console.debug("Successfully signed in via Google One Tap");
      }}
      onError={(error) => {
        console.error("Google One Tap error:", error);
      }}
      context="signin"
      autoSelect={false}
    />
  );
}
