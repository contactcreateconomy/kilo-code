'use client';

import { AdminSignInForm as SharedAdminSignInForm } from '@createconomy/ui/components/auth';
import { useAuth } from '@/hooks/use-auth';

/**
 * SignInForm - Admin app sign-in form wrapper.
 *
 * Thin wrapper around the shared AdminSignInForm component
 * that wires in the admin's useAuth hook for Google-only authentication.
 */
export function SignInForm() {
  const { signInWithGoogle } = useAuth();

  return (
    <SharedAdminSignInForm
      onGoogleSignIn={async () => {
        await signInWithGoogle();
      }}
    />
  );
}
