import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Logo, LogoWithText } from "@createconomy/ui/components/logo";
import { SignUpForm } from "@/components/auth/sign-up-form";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create an account to become a seller on Createconomy",
};

const benefits = [
  "No monthly fees — only pay when you sell",
  "Instant payouts via Stripe Connect",
  "Built-in analytics and sales tools",
  "Reach a global audience of buyers",
] as const;

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
        <div className="relative z-20 mt-auto">
          <p className="mb-4 text-lg font-medium">
            Everything you need to start selling
          </p>
          <ul className="space-y-3">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-center gap-3 text-sm">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                <span className="text-zinc-300">{benefit}</span>
              </li>
            ))}
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
            <LogoWithText size={40} appName="Seller" />
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-2 text-center">
              <h1 className="text-2xl font-bold">Create Account</h1>
              <p className="text-balance text-sm text-muted-foreground">
                Start selling on Createconomy today
              </p>
            </div>

            <SignUpForm />

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
              By creating an account, you agree to our{" "}
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
