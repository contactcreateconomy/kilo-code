import { SignUpForm } from "@/components/auth/sign-up-form";
import { AuthPageWrapper } from "@createconomy/ui/components/auth";
import Link from "next/link";

export const metadata = {
  title: "Create Account",
  description: "Create an account to become a seller on Createconomy",
};

export default function SignUpPage() {
  return (
    <AuthPageWrapper
      title="Create an account"
      subtitle="Sign up to start selling on Createconomy"
      footer={
        <p>
          Already have an account?{" "}
          <Link href="/auth/signin" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      }
    >
      <SignUpForm />
    </AuthPageWrapper>
  );
}
