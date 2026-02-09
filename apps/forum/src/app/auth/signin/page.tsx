import Link from "next/link";
import { AuthPageWrapper } from "@createconomy/ui/components/auth";
import { SignInForm } from "@/components/auth/sign-in-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your Createconomy Forum account",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const { returnTo } = await searchParams;
  const callbackUrl = returnTo ?? "/";

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
      <SignInForm callbackUrl={callbackUrl} />

      {/* Sign Up Link */}
      <div className="mt-4 text-center text-sm">
        <span className="text-muted-foreground">
          Don&apos;t have an account?{" "}
        </span>
        <Link
          href={`/auth/signup${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`}
          className="text-primary hover:underline"
        >
          Sign up
        </Link>
      </div>
    </AuthPageWrapper>
  );
}
