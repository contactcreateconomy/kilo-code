import type { Metadata } from "next";
import Link from "next/link";
import { AuthPageWrapper } from "@createconomy/ui/components/auth";
import { SignInForm } from "@/components/auth/sign-in-form";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your Createconomy account.",
};

export default function SignInPage() {
  return (
    <AuthPageWrapper
      title="Welcome back"
      subtitle="Sign in to your account to continue"
      footer={
        <p>
          By signing in, you agree to our{" "}
          <Link href="/terms" className="text-primary hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
        </p>
      }
    >
      <SignInForm />

      {/* Forgot Password Link */}
      <div className="mt-4 text-center">
        <Link
          href="/auth/forgot-password"
          className="text-sm text-primary hover:underline"
        >
          Forgot your password?
        </Link>
      </div>

      {/* New user info */}
      <div className="mt-4 text-center text-sm">
        <span className="text-muted-foreground">
          Don&apos;t have an account?{" "}
        </span>
        <Link href="/auth/signup" className="text-primary hover:underline">
          Sign up
        </Link>
      </div>
    </AuthPageWrapper>
  );
}
