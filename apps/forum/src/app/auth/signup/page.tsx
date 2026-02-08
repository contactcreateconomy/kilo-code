import Link from "next/link";
import { AuthPageWrapper } from "@createconomy/ui/components/auth";
import { SignUpForm } from "@/components/auth/sign-up-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create a new Createconomy Forum account",
};

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const { returnTo } = await searchParams;
  const callbackUrl = returnTo ?? "/";

  return (
    <AuthPageWrapper
      title="Join the community"
      subtitle="Create an account to start participating in discussions"
    >
      <SignUpForm callbackUrl={callbackUrl} />

      {/* Sign In Link */}
      <div className="mt-4 text-center text-sm">
        <span className="text-muted-foreground">
          Already have an account?{" "}
        </span>
        <Link
          href={`/auth/signin${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`}
          className="text-primary hover:underline"
        >
          Sign in
        </Link>
      </div>
    </AuthPageWrapper>
  );
}
