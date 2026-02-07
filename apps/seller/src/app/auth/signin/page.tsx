import { SignInForm } from "@/components/auth/sign-in-form";
import { AuthPageWrapper } from "@createconomy/ui/components/auth";
import Link from "next/link";

export const metadata = {
  title: "Sign In",
  description: "Sign in to your seller account",
};

export default function SignInPage() {
  return (
    <AuthPageWrapper
      title="Welcome back"
      subtitle="Sign in to your seller account"
      footer={
        <p>
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="text-primary hover:underline">
            Create account
          </Link>
        </p>
      }
    >
      <SignInForm />
    </AuthPageWrapper>
  );
}
