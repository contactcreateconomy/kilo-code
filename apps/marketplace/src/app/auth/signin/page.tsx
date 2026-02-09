import type { Metadata } from "next";
import Link from "next/link";
import { Logo, LogoWithText } from "@createconomy/ui/components/logo";
import { SignInForm } from "@/components/auth/sign-in-form";
import { ShoppingBag, Shield, Heart } from "lucide-react";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your Createconomy account.",
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
        <div className="relative z-20 mt-auto space-y-8">
          <p className="text-lg text-zinc-300">
            Your marketplace for digital products from independent creators.
          </p>
          <ul className="space-y-4 text-sm text-zinc-400">
            <li className="flex items-center gap-3">
              <ShoppingBag className="size-5 shrink-0 text-zinc-300" />
              <span>Discover unique digital products</span>
            </li>
            <li className="flex items-center gap-3">
              <Heart className="size-5 shrink-0 text-zinc-300" />
              <span>Support independent creators</span>
            </li>
            <li className="flex items-center gap-3">
              <Shield className="size-5 shrink-0 text-zinc-300" />
              <span>Secure checkout with Stripe</span>
            </li>
          </ul>
        </div>
        <div className="relative z-20 mt-8 text-xs text-zinc-500">
          © 2026 Createconomy. All rights reserved.
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-col items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          {/* Mobile logo — shown only below lg */}
          <div className="flex justify-center mb-8 lg:hidden">
            <LogoWithText size={40} />
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-2 text-center">
              <h1 className="text-2xl font-bold">Welcome back</h1>
              <p className="text-balance text-sm text-muted-foreground">
                Sign in to your Createconomy account
              </p>
            </div>

            <SignInForm />

            {/* Forgot password */}
            <div className="text-center">
              <Link
                href="/auth/forgot-password"
                className="text-sm text-muted-foreground underline underline-offset-4 hover:text-primary"
              >
                Forgot your password?
              </Link>
            </div>

            {/* Sign Up link */}
            <div className="text-center text-sm">
              <span className="text-muted-foreground">
                Don&apos;t have an account?{" "}
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
