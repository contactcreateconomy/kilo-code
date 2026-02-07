'use client';

import { useAuthActions } from '@convex-dev/auth/react';
import { AdminSignInForm as SharedAdminSignInForm } from '@createconomy/ui/components/auth';

/**
 * SignInForm - Admin app sign-in form wrapper.
 *
 * Thin wrapper around the shared AdminSignInForm component
 * that wires in Convex auth for Google-only authentication.
 */
export function SignInForm() {
  const { signIn } = useAuthActions();

  return (
    <SharedAdminSignInForm
      onGoogleSignIn={async () => {
        await signIn('google', { redirectTo: '/' });
      }}
    />
  );
}
