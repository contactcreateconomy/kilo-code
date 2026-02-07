"use client";

import { useRouter } from "next/navigation";
import { SharedSignUpForm } from "@createconomy/ui/components/auth";
import { useAuth } from "@/hooks/use-auth";

interface SignUpFormProps {
  callbackUrl?: string;
}

/**
 * SignUpForm - Marketplace app sign-up form wrapper.
 *
 * Thin wrapper around the shared SharedSignUpForm component
 * that wires in the marketplace's useAuth hook for Convex authentication.
 */
export function SignUpForm({ callbackUrl = "/" }: SignUpFormProps) {
  const router = useRouter();
  const { signUp, signInWithGoogle, signInWithGitHub } = useAuth();

  return (
    <SharedSignUpForm
      onSubmit={async (data) => {
        // Marketplace signUp uses (name, email, password) signature
        await signUp(data.username ?? "", data.email, data.password);
        router.push(callbackUrl);
      }}
      onGoogleSignUp={async () => {
        await signInWithGoogle();
        router.push(callbackUrl);
      }}
      onGitHubSignUp={async () => {
        await signInWithGitHub();
        router.push(callbackUrl);
      }}
      fields={{
        showUsername: true,
        usernameLabel: "Username",
        usernamePlaceholder: "johndoe",
      }}
    />
  );
}
