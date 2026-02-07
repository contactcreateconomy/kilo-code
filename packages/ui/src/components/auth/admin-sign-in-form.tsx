"use client";

import { useState } from "react";
import { Button } from "../button";
import { AuthErrorAlert } from "./auth-error-alert";
import { OAuthDivider } from "./oauth-divider";
import { GoogleIcon, SpinnerIcon } from "./auth-icons";

export interface AdminSignInFormProps {
  /** Handler for Google OAuth sign-in */
  onGoogleSignIn: () => Promise<void>;
  /** External loading state */
  isLoading?: boolean;
  /** External error message */
  error?: string | null;
}

/**
 * AdminSignInForm — Minimal Google-only sign-in form for the admin app.
 *
 * Displays a single Google sign-in button styled identically to the
 * forum app's Google button, with no other form fields or OAuth providers.
 */
export function AdminSignInForm({
  onGoogleSignIn,
  isLoading: externalIsLoading,
  error: externalError,
}: AdminSignInFormProps) {
  const [internalError, setInternalError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loading = externalIsLoading ?? isLoading;
  const error = externalError ?? internalError;

  const handleGoogleSignIn = async () => {
    setInternalError(null);
    setIsLoading(true);

    try {
      await onGoogleSignIn();
    } catch (err) {
      setInternalError(
        err instanceof Error ? err.message : "Failed to sign in with Google. Please try again."
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <AuthErrorAlert error={error} />

      <div className="space-y-4">
        <Button
          variant="outline"
          type="button"
          className="w-full py-3"
          disabled={loading}
          onClick={handleGoogleSignIn}
        >
          {loading ? (
            <SpinnerIcon className="mr-2 h-5 w-5" />
          ) : (
            <GoogleIcon className="mr-2 h-5 w-5" />
          )}
          <span>{loading ? "Signing in..." : "Continue with Google"}</span>
        </Button>
      </div>

      <OAuthDivider text="Secure Admin Access" />

      <div className="space-y-2 text-center text-sm text-muted-foreground">
        <p>
          <strong>Google authentication only</strong> for enhanced security.
        </p>
        <p>
          Only authorized administrators with approved Google accounts can
          access this dashboard.
        </p>
      </div>
    </div>
  );
}
