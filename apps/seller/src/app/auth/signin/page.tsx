import type { Metadata } from "next";
import Link from "next/link";
import { Logo, LogoWithText } from "@createconomy/ui/components/logo";
import { SignInForm } from "@/components/auth/sign-in-form";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your seller account on Createconomy",
};

export default function SignInPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Left dark panel — hidden on mobile */}
      <div className="relative hidden flex-col bg-zinc-900 p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center gap-2 text-lg font-medium">
          <Logo size={32} variant="light" />
          <span>Createconomy</span>
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;Join thousands of creators selling digital products on
              Createconomy.&rdquo;
            </p>
            <footer className="text-sm text-zinc-400">Seller Portal</footer>
          </blockquote>
        </div>
        <div className="relative z-20 mt-4 text-xs text-zinc-500">
          © 2026 Createconomy. All rights reserved.
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-col items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          {/* Mobile logo — shown only below lg */}
          <div className="flex justify-center mb-8 lg:hidden">
            <LogoWithText size={40} appName="Seller" />
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-2 text-center">
              <h1 className="text-2xl font-bold">Seller Portal</h1>
              <p className="text-balance text-sm text-muted-foreground">
                Sign in to manage your store
              </p>
            </div>

            <SignInForm />

            <div className="text-center text-sm">
              <span className="text-muted-foreground">
                Don&apos;t have a seller account?{" "}
              </span>
              <Link
                href="/auth/signup"
                className="underline underline-offset-4 hover:text-primary"
              >
                Sign up
              </Link>
            </div>

            <p className="text-center text-xs text-muted-foreground">
              By signing in, you agree to our{" "}
              <Link
                href="/terms"
                className="underline underline-offset-4 hover:text-primary"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="underline underline-offset-4 hover:text-primary"
              >
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
