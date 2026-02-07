import type { Metadata } from "next";
import Link from "next/link";
import { AuthPageWrapper } from "@createconomy/ui/components/auth";
import { SignUpForm } from "@/components/auth/sign-up-form";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create your Createconomy account.",
};

export default function SignUpPage() {
  return (
    <AuthPageWrapper
      title="Join the community"
      subtitle="Create an account to discover and purchase digital products"
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
