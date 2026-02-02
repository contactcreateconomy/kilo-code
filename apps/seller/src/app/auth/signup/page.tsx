import { SignUpForm } from "@/components/auth/sign-up-form";
import Link from "next/link";

export const metadata = {
  title: "Apply to Sell",
  description: "Apply to become a seller on Createconomy",
};

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 seller-gradient items-center justify-center p-12">
        <div className="max-w-md text-white">
          <h1 className="text-4xl font-bold mb-4">Start Selling Today</h1>
          <p className="text-lg opacity-90 mb-8">
            Join thousands of creators and businesses selling on Createconomy.
            Reach millions of customers worldwide.
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <span>No monthly fees - only pay when you sell</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <span>Powerful tools to manage your business</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <span>24/7 seller support</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <span>Fast payouts to your bank account</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Sign Up Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[var(--background)]">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Apply to Sell</h2>
            <p className="text-[var(--muted-foreground)]">
              Fill out the form below to start your seller application
            </p>
          </div>

          <SignUpForm />

          <div className="mt-6 text-center text-sm">
            <span className="text-[var(--muted-foreground)]">
              Already have a seller account?{" "}
            </span>
            <Link
              href="/auth/signin"
              className="text-[var(--primary)] hover:underline font-medium"
            >
              Sign in
            </Link>
          </div>

          <div className="mt-4 text-center text-sm">
            <Link
              href={process.env["NEXT_PUBLIC_MARKETPLACE_URL"] || "/"}
              className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            >
              ← Back to Marketplace
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
