import Link from "next/link";
import { AuthPageWrapper } from "@createconomy/ui/components/auth";
import { SignUpForm } from "@/components/auth/sign-up-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create a new Createconomy Forum account",
};

export default function SignUpPage() {
  return (
    <AuthPageWrapper
      title="Join the community"
      subtitle="Create an account to start participating in discussions"
    >
      <SignUpForm />

      {/* Sign In Link */}
      <div className="mt-4 text-center text-sm">
        <span className="text-muted-foreground">
          Already have an account?{" "}
        </span>
        <Link href="/auth/signin" className="text-primary hover:underline">
          Sign in
        </Link>
      </div>
    </AuthPageWrapper>
  );
}
