import type { Metadata } from "next";
import Link from "next/link";
import { Logo, LogoWithText } from "@createconomy/ui/components/logo";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { Package, Shield, Heart, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create a new Createconomy account",
};

export default function SignUpPage() {
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
            Join thousands of creators and buyers on the Createconomy
            marketplace.
          </p>
          <ul className="space-y-4 text-sm text-zinc-400">
            <li className="flex items-center gap-3">
              <Package className="size-5 shrink-0 text-zinc-300" />
              <span>Access 10,000+ digital products</span>
            </li>
            <li className="flex items-center gap-3">
              <Shield className="size-5 shrink-0 text-zinc-300" />
              <span>Secure payments with buyer protection</span>
            </li>
            <li className="flex items-center gap-3">
              <Heart className="size-5 shrink-0 text-zinc-300" />
              <span>Support independent creators</span>
            </li>
            <li className="flex items-center gap-3">
              <Zap className="size-5 shrink-0 text-zinc-300" />
              <span>Instant digital delivery</span>
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
              <h1 className="text-2xl font-bold">Create your account</h1>
              <p className="text-balance text-sm text-muted-foreground">
                Join the Createconomy marketplace
              </p>
            </div>

            <SignUpForm />

            {/* Sign In link */}
            <div className="text-center text-sm">
              <span className="text-muted-foreground">
                Already have an account?{" "}
              </span>
              <Link
                href="/auth/signin"
                className="underline underline-offset-4 hover:text-primary"
              >
                Sign in
              </Link>
            </div>

            <p className="text-center text-xs text-muted-foreground">
              By signing up, you agree to our{" "}
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
