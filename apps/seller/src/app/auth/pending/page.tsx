import type { Metadata } from "next";
import Link from "next/link";
import { Clock } from "lucide-react";
import { Logo } from "@createconomy/ui/components/logo";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@createconomy/ui/components/card";

export const metadata: Metadata = {
  title: "Application Pending",
  description: "Your seller application is being reviewed",
};

const steps = [
  "Our team reviews your application and business information",
  "You\u2019ll receive an email notification about your application status",
  "Once approved, you can start listing products and selling",
] as const;

export default function PendingPage() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-6 md:p-10">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <Link href="/" aria-label="Home">
            <Logo size={40} />
          </Link>
          <div className="mt-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10">
            <Clock className="h-8 w-8 text-amber-500" />
          </div>
          <CardTitle className="mt-4">Application Under Review</CardTitle>
          <CardDescription className="text-balance">
            Thank you for applying to become a seller on Createconomy! Our team
            is currently reviewing your application. This usually takes 1–2
            business days.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <h2 className="mb-3 text-sm font-semibold">What happens next?</h2>
          <ol className="space-y-3">
            {steps.map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                  {i + 1}
                </span>
                <span className="text-muted-foreground">{step}</span>
              </li>
            ))}
          </ol>
        </CardContent>

        <CardFooter className="flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Have questions about your application?
          </p>
          <div className="flex gap-3">
            <Link
              href="/support/contact"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
            >
              Contact Support
            </Link>
            <Link
              href={process.env["NEXT_PUBLIC_MARKETPLACE_URL"] || "/"}
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Back to Marketplace
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
