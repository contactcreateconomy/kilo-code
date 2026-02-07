"use client";

import { useState, useCallback } from "react";

export interface UseAuthFormOptions {
  /** Callback on successful auth operation */
  onSuccess?: () => void;
  /** Callback on auth error */
  onError?: (error: string) => void;
}

export interface UseAuthFormReturn {
  /** Current error message */
  error: string | null;
  /** Set the error message */
  setError: (error: string | null) => void;
  /** Clear the error message */
  clearError: () => void;
  /** Whether the primary form is submitting */
  isLoading: boolean;
  /** Whether Google OAuth is in progress */
  isGoogleLoading: boolean;
  /** Whether GitHub OAuth is in progress */
  isGitHubLoading: boolean;
  /** Whether any auth operation is in progress */
  isAnyLoading: boolean;
  /** Wrap a form submit handler with loading/error management */
  handleSubmit: (submitFn: () => Promise<void>) => Promise<void>;
  /** Wrap a Google auth handler with loading/error management */
  handleGoogleAuth: (authFn: () => Promise<void>) => Promise<void>;
  /** Wrap a GitHub auth handler with loading/error management */
  handleGitHubAuth: (authFn: () => Promise<void>) => Promise<void>;
}

/**
 * useAuthForm — Shared form state management hook for auth forms.
 *
 * Manages loading states per provider (form, Google, GitHub),
 * error handling, and success callbacks. Does NOT contain any
 * Convex or auth-provider-specific logic.
 *
 * @example
 * ```tsx
 * const { error, isAnyLoading, handleSubmit, handleGoogleAuth } = useAuthForm({
 *   onSuccess: () => router.push("/"),
 * });
 *
 * return (
 *   <form onSubmit={(e) => { e.preventDefault(); handleSubmit(() => signIn(email, password)); }}>
 *     ...
 *   </form>
 * );
 * ```
 */
export function useAuthForm(options?: UseAuthFormOptions): UseAuthFormReturn {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGitHubLoading, setIsGitHubLoading] = useState(false);

  const isAnyLoading = isLoading || isGoogleLoading || isGitHubLoading;

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleSubmit = useCallback(
    async (submitFn: () => Promise<void>) => {
      setError(null);
      setIsLoading(true);

      try {
        await submitFn();
        options?.onSuccess?.();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to sign in";
        setError(message);
        options?.onError?.(message);
      } finally {
        setIsLoading(false);
      }
    },
    [options]
  );

  const handleGoogleAuth = useCallback(
    async (authFn: () => Promise<void>) => {
      setError(null);
      setIsGoogleLoading(true);

      try {
        await authFn();
        options?.onSuccess?.();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Google sign-in failed";
        setError(message);
        options?.onError?.(message);
      } finally {
        setIsGoogleLoading(false);
      }
    },
    [options]
  );

  const handleGitHubAuth = useCallback(
    async (authFn: () => Promise<void>) => {
      setError(null);
      setIsGitHubLoading(true);

      try {
        await authFn();
        options?.onSuccess?.();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "GitHub sign-in failed";
        setError(message);
        options?.onError?.(message);
      } finally {
        setIsGitHubLoading(false);
      }
    },
    [options]
  );

  return {
    error,
    setError,
    clearError,
    isLoading,
    isGoogleLoading,
    isGitHubLoading,
    isAnyLoading,
    handleSubmit,
    handleGoogleAuth,
    handleGitHubAuth,
  };
}
