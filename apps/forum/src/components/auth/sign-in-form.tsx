"use client";

import { useRouter } from "next/navigation";
import { SharedSignInForm } from "@createconomy/ui/components/auth";
import { useAuth } from "@/hooks/use-auth";

interface SignInFormProps {
  callbackUrl?: string;
}

/**
 * SignInForm - Forum app sign-in form wrapper.
 *
 * Thin wrapper around the shared SharedSignInForm component
 * that wires in the forum's useAuth hook for Convex authentication.
 */
export function SignInForm({ callbackUrl = "/" }: SignInFormProps) {
  const router = useRouter();
  const { signIn, signInWithGoogle, signInWithGitHub } = useAuth();

  return (
    <SharedSignInForm
      onSubmit={async (email, password) => {
        await signIn(email, password);
        router.push(callbackUrl);
      }}
      onGoogleSignIn={async () => {
        await signInWithGoogle();
        router.push(callbackUrl);
      }}
      onGitHubSignIn={async () => {
        await signInWithGitHub();
        router.push(callbackUrl);
      }}
    />
  );
}
