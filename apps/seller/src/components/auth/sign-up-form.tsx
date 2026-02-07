"use client";

import { useRouter } from "next/navigation";
import { SharedSignUpForm } from "@createconomy/ui/components/auth";
import { useAuth } from "@/hooks/use-auth";

interface SignUpFormProps {
  callbackUrl?: string;
}

/**
 * SignUpForm - Seller app sign-up form wrapper.
 *
 * Thin wrapper around the shared SharedSignUpForm component.
 * After account creation, redirects to the seller application form.
 */
export function SignUpForm({ callbackUrl = "/auth/apply" }: SignUpFormProps) {
  const router = useRouter();
  const { signUp, signInWithGoogle, signInWithGitHub } = useAuth();

  return (
    <SharedSignUpForm
      onSubmit={async (data) => {
        await signUp(data.email, data.password, data.username ?? "");
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

// Re-export the SellerApplicationData type for backward compatibility
export interface SellerApplicationData {
  email: string;
  password: string;
  storeName: string;
  storeDescription: string;
  businessType: string;
  website?: string;
  phone: string;
  agreeToTerms: boolean;
}
