"use client";

import { useState } from "react";
import { Button } from "../button";
import { Input } from "../input";
import { Label } from "../label";
import { AuthErrorAlert } from "./auth-error-alert";
import { OAuthDivider } from "./oauth-divider";
import { SocialLoginGrid } from "./social-login-grid";

export interface SignUpData {
  username?: string;
  email: string;
  password: string;
}

export interface SharedSignUpFormProps {
  /** Handler for form submission */
  onSubmit: (data: SignUpData) => Promise<void>;
  /** Handler for Google OAuth sign-up */
  onGoogleSignUp: () => Promise<void>;
  /** Handler for GitHub OAuth sign-up */
  onGitHubSignUp: () => Promise<void>;
  /** External error message (overrides internal error state) */
  error?: string | null;
  /** External loading state for form submission */
  isLoading?: boolean;
  /** External loading state for Google OAuth */
  isGoogleLoading?: boolean;
  /** External loading state for GitHub OAuth */
  isGitHubLoading?: boolean;
  /** Field configuration */
  fields?: {
    /** Whether to show the username field. Defaults to true */
    showUsername?: boolean;
    /** Label for the username field. Defaults to "Username" */
    usernameLabel?: string;
    /** Placeholder for the username field. Defaults to "johndoe" */
    usernamePlaceholder?: string;
  };
  /** URL path for Terms of Service. Defaults to "/terms" */
  termsUrl?: string;
  /** URL path for Privacy Policy. Defaults to "/privacy" */
  privacyUrl?: string;
}

/**
 * SharedSignUpForm — Presentational sign-up form with email/password + OAuth.
 *
 * Matches the forum app's sign-up form design exactly.
 * Includes client-side validation for username length, password length,
 * password confirmation, and terms agreement.
 *
 * Auth logic is delegated to parent via callbacks.
 */
export function SharedSignUpForm({
  onSubmit,
  onGoogleSignUp,
  onGitHubSignUp,
  error: externalError,
  isLoading: externalIsLoading,
  isGoogleLoading: externalIsGoogleLoading,
  isGitHubLoading: externalIsGitHubLoading,
  fields,
  termsUrl = "/terms",
  privacyUrl = "/privacy",
}: SharedSignUpFormProps) {
  const showUsername = fields?.showUsername ?? true;
  const usernameLabel = fields?.usernameLabel ?? "Username";
  const usernamePlaceholder = fields?.usernamePlaceholder ?? "johndoe";

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
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

    // Client-side validation
    if (showUsername && username.length < 3) {
      setInternalError("Username must be at least 3 characters");
      return;
    }

    if (password.length < 8) {
      setInternalError("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setInternalError("Passwords do not match");
      return;
    }

    if (!agreedToTerms) {
      setInternalError(
        "You must agree to the Terms of Service and Privacy Policy"
      );
      return;
    }

    setIsLoading(true);

    try {
      await onSubmit({
        username: showUsername ? username : undefined,
        email,
        password,
      });
    } catch (err) {
      setInternalError(
        err instanceof Error ? err.message : "Failed to create account"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setInternalError(null);
    setIsGoogleLoading(true);

    try {
      await onGoogleSignUp();
    } catch (err) {
      setInternalError(
        err instanceof Error ? err.message : "Google sign-up failed"
      );
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGitHubSignUp = async () => {
    setInternalError(null);
    setIsGitHubLoading(true);

    try {
      await onGitHubSignUp();
    } catch (err) {
      setInternalError(
        err instanceof Error ? err.message : "GitHub sign-up failed"
      );
    } finally {
      setIsGitHubLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthErrorAlert error={error} />

        {showUsername && (
          <div className="space-y-2">
            <Label htmlFor="username">{usernameLabel}</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={usernamePlaceholder}
              required
              disabled={isAnyLoading}
              autoComplete="username"
            />
            <p className="text-xs text-muted-foreground">
              This will be your public display name
            </p>
          </div>
        )}

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
            autoComplete="new-password"
          />
          <p className="text-xs text-muted-foreground">
            Must be at least 8 characters
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required
            disabled={isAnyLoading}
            autoComplete="new-password"
          />
        </div>

        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            id="terms"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="mt-1"
            disabled={isAnyLoading}
          />
          <label htmlFor="terms" className="text-sm text-muted-foreground">
            I agree to the{" "}
            <a href={termsUrl} className="text-primary hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href={privacyUrl} className="text-primary hover:underline">
              Privacy Policy
            </a>
          </label>
        </div>

        <Button type="submit" className="w-full" disabled={isAnyLoading}>
          {loading ? "Creating account..." : "Create Account"}
        </Button>
      </form>

      <OAuthDivider />

      <SocialLoginGrid
        onGoogleClick={handleGoogleSignUp}
        onGitHubClick={handleGitHubSignUp}
        isGoogleLoading={googleLoading}
        isGitHubLoading={gitHubLoading}
        disabled={isAnyLoading}
      />
    </div>
  );
}
