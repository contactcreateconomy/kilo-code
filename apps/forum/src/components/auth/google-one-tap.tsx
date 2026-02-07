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
  nonce?: string;
  state_cookie_domain?: string;
  ux_mode?: 'popup' | 'redirect';
  login_uri?: string;
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
 * GoogleOneTap - Google One Tap sign-in component
 * 
 * Automatically shows Google One Tap prompt for users signed into Chrome
 * with their Google account. Falls back gracefully if One Tap is not available.
 * 
 * @example
 * ```tsx
 * <GoogleOneTap 
 *   onSuccess={() => console.log('Signed in!')}
 *   onError={(err) => console.error(err)}
 * />
 * ```
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

  /**
   * Handle the credential response from Google One Tap
   */
  const handleCredentialResponse = useCallback(
    async (response: GoogleCredentialResponse) => {
      try {
        // The credential is a JWT token from Google
        // We need to pass it to Convex Auth for verification
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

  /**
   * Handle prompt notification (for debugging and fallback)
   */
  const handlePromptNotification = useCallback(
    (notification: PromptNotification) => {
      if (notification.isNotDisplayed()) {
        const reason = notification.getNotDisplayedReason();
        console.debug('Google One Tap not displayed:', reason);
        
        // Common reasons:
        // - 'browser_not_supported'
        // - 'invalid_client'
        // - 'missing_client_id'
        // - 'opt_out_or_no_session' - User not signed into Chrome with Google
        // - 'suppressed_by_user' - User previously dismissed
        // - 'secure_origin_required'
        
        if (reason === 'opt_out_or_no_session') {
          // User is not signed into Chrome with Google
          // They can still use the Sign In button
          console.debug('User not signed into Chrome with Google account');
        }
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

  /**
   * Load the Google Identity Services script
   */
  useEffect(() => {
    // Don't load if already authenticated or still loading
    if (isAuthenticated || isLoading) {
      return;
    }

    // Don't load if no client ID
    if (!clientId) {
      console.warn('Google One Tap: NEXT_PUBLIC_GOOGLE_CLIENT_ID not configured');
      return;
    }

    // Check if script is already loaded
    if (window.google?.accounts?.id) {
      setIsScriptLoaded(true);
      return;
    }

    // Check if script tag already exists
    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => setIsScriptLoaded(true));
      return;
    }

    // Load the Google Identity Services script
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
      // Cleanup: cancel any pending prompts
      if (window.google?.accounts?.id) {
        window.google.accounts.id.cancel();
      }
    };
  }, [isAuthenticated, isLoading, clientId, onError]);

  /**
   * Initialize Google One Tap when script is loaded
   */
  useEffect(() => {
    // Don't initialize if already authenticated, still loading, or already initialized
    if (isAuthenticated || isLoading || !isScriptLoaded || isInitialized) {
      return;
    }

    // Prevent multiple initialization attempts
    if (initAttempted.current) {
      return;
    }
    initAttempted.current = true;

    if (!clientId) {
      return;
    }

    if (!window.google?.accounts?.id) {
      console.error('Google Identity Services not available');
      return;
    }

    try {
      // Initialize Google One Tap
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: autoSelect,
        cancel_on_tap_outside: true,
        context: context,
        itp_support: true,
        ...(promptParentId && { prompt_parent_id: promptParentId }),
      });

      setIsInitialized(true);

      // Show the One Tap prompt
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

  /**
   * Cancel One Tap when user becomes authenticated
   */
  useEffect(() => {
    if (isAuthenticated && window.google?.accounts?.id) {
      window.google.accounts.id.cancel();
    }
  }, [isAuthenticated]);

  // This component doesn't render anything visible
  // The One Tap prompt is rendered by Google's SDK
  return null;
}

/**
 * GoogleSignInButton - Renders a Google Sign-In button
 * 
 * Alternative to One Tap for explicit sign-in action
 */
interface GoogleSignInButtonProps {
  /** Button theme */
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  /** Button size */
  size?: 'large' | 'medium' | 'small';
  /** Button text */
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  /** Button shape */
  shape?: 'rectangular' | 'pill';
  /** Button width */
  width?: number;
  /** Callback when sign-in is successful */
  onSuccess?: () => void;
  /** Callback when sign-in fails */
  onError?: (error: string) => void;
}

export function GoogleSignInButton({
  theme = 'outline',
  size = 'large',
  text = 'signin_with',
  shape = 'rectangular',
  width,
  onSuccess,
  onError,
}: GoogleSignInButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const { signInWithGoogle } = useAuth();
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  const clientId = process.env['NEXT_PUBLIC_GOOGLE_CLIENT_ID'];

  // Load script
  useEffect(() => {
    if (!clientId) return;

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
    document.head.appendChild(script);
  }, [clientId]);

  // Render button
  useEffect(() => {
    if (!isScriptLoaded || !buttonRef.current || !clientId) return;

    const handleCredential = async () => {
      try {
        await signInWithGoogle();
        onSuccess?.();
      } catch (error) {
        onError?.(error instanceof Error ? error.message : 'Sign-in failed');
      }
    };

    window.google?.accounts.id.initialize({
      client_id: clientId,
      callback: handleCredential,
    });

    window.google?.accounts.id.renderButton(buttonRef.current, {
      theme,
      size,
      text,
      shape,
      ...(width && { width }),
    });
  }, [isScriptLoaded, clientId, theme, size, text, shape, width, signInWithGoogle, onSuccess, onError]);

  if (!clientId) {
    return null;
  }

  return <div ref={buttonRef} />;
}

export default GoogleOneTap;
