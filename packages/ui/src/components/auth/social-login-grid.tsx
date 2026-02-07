"use client";

import { Button } from "../button";
import { GoogleIcon, GitHubIcon, SpinnerIcon } from "./auth-icons";

export interface SocialLoginGridProps {
  /** Handler for Google OAuth button click */
  onGoogleClick: () => void;
  /** Handler for GitHub OAuth button click */
  onGitHubClick: () => void;
  /** Whether the Google button is in loading state */
  isGoogleLoading?: boolean;
  /** Whether the GitHub button is in loading state */
  isGitHubLoading?: boolean;
  /** Whether all buttons should be disabled */
  disabled?: boolean;
}

/**
 * Social login button grid — Google + GitHub OAuth buttons.
 * Matches the forum app's social login button layout.
 */
export function SocialLoginGrid({
  onGoogleClick,
  onGitHubClick,
  isGoogleLoading = false,
  isGitHubLoading = false,
  disabled = false,
}: SocialLoginGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Button
        variant="outline"
        type="button"
        disabled={disabled}
        onClick={onGoogleClick}
      >
        {isGoogleLoading ? (
          <SpinnerIcon className="mr-2" />
        ) : (
          <GoogleIcon className="mr-2" />
        )}
        Google
      </Button>
      <Button
        variant="outline"
        type="button"
        disabled={disabled}
        onClick={onGitHubClick}
      >
        {isGitHubLoading ? (
          <SpinnerIcon className="mr-2" />
        ) : (
          <GitHubIcon className="mr-2" />
        )}
        GitHub
      </Button>
    </div>
  );
}
