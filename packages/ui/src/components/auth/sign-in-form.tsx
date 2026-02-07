"use client";

import { useState } from "react";
import { Button } from "../button";
import { Input } from "../input";
import { Label } from "../label";
import { AuthErrorAlert } from "./auth-error-alert";
import { OAuthDivider } from "./oauth-divider";
import { SocialLoginGrid } from "./social-login-grid";

export interface SharedSignInFormProps {
  /** Handler for email/password form submission */
  onSubmit: (email: string, password: string) => Promise<void>;
  /** Handler for Google OAuth sign-in */
  onGoogleSignIn: () => Promise<void>;
  /** Handler for GitHub OAuth sign-in */
  onGitHubSignIn: () => Promise<void>;
  /** External error message (overrides internal error state) */
  error?: string | null;
  /** External loading state for form submission */
  isLoading?: boolean;
  /** External loading state for Google OAuth */
  isGoogleLoading?: boolean;
  /** External loading state for GitHub OAuth */
  isGitHubLoading?: boolean;
}

/**
 * SharedSignInForm — Presentational sign-in form with email/password + OAuth.
 *
 * Matches the forum app's sign-in form design exactly.
 * Auth logic is delegated to parent via callbacks.
 *
 * This component manages its own internal form state (email, password, error, loading)
 * but also accepts external overrides for error and loading states.
 */
export function SharedSignInForm({
  onSubmit,
  onGoogleSignIn,
  onGitHubSignIn,
  error: externalError,
  isLoading: externalIsLoading,
  isGoogleLoading: externalIsGoogleLoading,
  isGitHubLoading: externalIsGitHubLoading,
}: SharedSignInFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [internalError, setInternalError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGitHubLoading, setIsGitHubLoading] = useState(false);

  const loading = externalIsLoading ?? isLoading;
  const googleLoading = externalIsGoogleLoading ?? isGoogleLoading;
  const gitHubLoading = externalIsGitHubLoading ?? isGitHubLoading;
  const error = externalError ?? internalError;
  const isAnyLoading = loading || googleLoading || gitHubLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInternalError(null);
    setIsLoading(true);

    try {
      await onSubmit(email, password);
    } catch (err) {
      setInternalError(
        err instanceof Error ? err.message : "Failed to sign in"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setInternalError(null);
    setIsGoogleLoading(true);

    try {
      await onGoogleSignIn();
    } catch (err) {
      setInternalError(
        err instanceof Error ? err.message : "Google sign-in failed"
      );
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGitHubSignIn = async () => {
    setInternalError(null);
    setIsGitHubLoading(true);

    try {
      await onGitHubSignIn();
    } catch (err) {
      setInternalError(
        err instanceof Error ? err.message : "GitHub sign-in failed"
      );
    } finally {
      setIsGitHubLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthErrorAlert error={error} />

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            disabled={isAnyLoading}
            autoComplete="email"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            disabled={isAnyLoading}
            autoComplete="current-password"
          />
        </div>

        <Button type="submit" className="w-full" disabled={isAnyLoading}>
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <OAuthDivider />

      <SocialLoginGrid
        onGoogleClick={handleGoogleSignIn}
        onGitHubClick={handleGitHubSignIn}
        isGoogleLoading={googleLoading}
        isGitHubLoading={gitHubLoading}
        disabled={isAnyLoading}
      />
    </div>
  );
}
