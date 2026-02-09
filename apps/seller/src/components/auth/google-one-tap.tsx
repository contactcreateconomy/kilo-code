'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

/**
 * Google Identity Services types
 */
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: GoogleOneTapConfig) => void;
          prompt: (callback?: (notification: PromptNotification) => void) => void;
          cancel: () => void;
          disableAutoSelect: () => void;
          renderButton: (
            parent: HTMLElement,
            options: GoogleButtonOptions
          ) => void;
        };
      };
    };
  }
}

interface GoogleOneTapConfig {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
  context?: 'signin' | 'signup' | 'use';
  itp_support?: boolean;
  prompt_parent_id?: string;
}

interface GoogleCredentialResponse {
  credential: string;
  select_by: string;
  clientId?: string;
}

interface PromptNotification {
  isDisplayMoment: () => boolean;
  isDisplayed: () => boolean;
  isNotDisplayed: () => boolean;
  getNotDisplayedReason: () => string;
  isSkippedMoment: () => boolean;
  getSkippedReason: () => string;
  isDismissedMoment: () => boolean;
  getDismissedReason: () => string;
  getMomentType: () => string;
}

interface GoogleButtonOptions {
  type?: 'standard' | 'icon';
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  logo_alignment?: 'left' | 'center';
  width?: number;
  locale?: string;
}

interface GoogleOneTapProps {
  /** Callback when sign-in is successful */
  onSuccess?: () => void;
  /** Callback when sign-in fails */
  onError?: (error: string) => void;
  /** ID of parent element to position the prompt near */
  promptParentId?: string;
  /** Whether to auto-select if only one account */
  autoSelect?: boolean;
  /** Context for the sign-in prompt */
  context?: 'signin' | 'signup' | 'use';
  /** Redirect URL after successful sign-in */
  redirectUrl?: string;
}

/**
 * GoogleOneTap - Google One Tap sign-in component for the seller app.
 *
 * Automatically shows Google One Tap prompt for users signed into Chrome
 * with their Google account. Falls back gracefully if One Tap is not available.
 */
export function GoogleOneTap({
  onSuccess,
  onError,
  promptParentId,
  autoSelect = false,
  context = 'signin',
  redirectUrl = '/',
}: GoogleOneTapProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, signInWithGoogle } = useAuth();
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const initAttempted = useRef(false);

  const clientId = process.env['NEXT_PUBLIC_GOOGLE_CLIENT_ID'];

  const handleCredentialResponse = useCallback(
    async (_response: GoogleCredentialResponse) => {
      try {
        await signInWithGoogle();
        onSuccess?.();
        router.push(redirectUrl);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Sign-in failed';
        console.error('Google One Tap sign-in error:', errorMessage);
        onError?.(errorMessage);
      }
    },
    [signInWithGoogle, onSuccess, onError, router, redirectUrl]
  );

  const handlePromptNotification = useCallback(
    (notification: PromptNotification) => {
      if (notification.isNotDisplayed()) {
        const reason = notification.getNotDisplayedReason();
        console.debug('Google One Tap not displayed:', reason);
      }
      if (notification.isSkippedMoment()) {
        console.debug('Google One Tap skipped:', notification.getSkippedReason());
      }
      if (notification.isDismissedMoment()) {
        console.debug('Google One Tap dismissed:', notification.getDismissedReason());
      }
    },
    []
  );

  // Load the Google Identity Services script
  useEffect(() => {
    if (isAuthenticated || isLoading) return;
    if (!clientId) {
      console.warn('Google One Tap: NEXT_PUBLIC_GOOGLE_CLIENT_ID not configured');
      return;
    }

    if (window.google?.accounts?.id) {
      setIsScriptLoaded(true);
      return;
    }

    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => setIsScriptLoaded(true));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => setIsScriptLoaded(true);
    script.onerror = () => {
      console.error('Failed to load Google Identity Services script');
      onError?.('Failed to load Google sign-in');
    };
    document.head.appendChild(script);

    return () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.cancel();
      }
    };
  }, [isAuthenticated, isLoading, clientId, onError]);

  // Initialize Google One Tap when script is loaded
  useEffect(() => {
    if (isAuthenticated || isLoading || !isScriptLoaded || isInitialized) return;
    if (initAttempted.current) return;
    initAttempted.current = true;

    if (!clientId || !window.google?.accounts?.id) return;

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: autoSelect,
        cancel_on_tap_outside: true,
        context,
        itp_support: true,
        ...(promptParentId && { prompt_parent_id: promptParentId }),
      });

      setIsInitialized(true);
      window.google.accounts.id.prompt(handlePromptNotification);
    } catch (error) {
      console.error('Failed to initialize Google One Tap:', error);
      onError?.('Failed to initialize Google sign-in');
    }
  }, [
    isAuthenticated,
    isLoading,
    isScriptLoaded,
    isInitialized,
    clientId,
    autoSelect,
    context,
    promptParentId,
    handleCredentialResponse,
    handlePromptNotification,
    onError,
  ]);

  // Cancel One Tap when user becomes authenticated
  useEffect(() => {
    if (isAuthenticated && window.google?.accounts?.id) {
      window.google.accounts.id.cancel();
    }
  }, [isAuthenticated]);

  return null;
}

export default GoogleOneTap;
