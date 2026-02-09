import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@createconomy/ui";

export const metadata: Metadata = {
  title: "Checkout Cancelled",
  description: "Your checkout was cancelled.",
};

export default function CheckoutCancelPage() {
  return (
    <div className="container py-16">
      <div className="mx-auto max-w-lg text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-warning/10">
          <XIcon className="h-8 w-8 text-warning" />
        </div>
        <h1 className="mt-6 text-3xl font-bold tracking-tight">
          Checkout Cancelled
        </h1>
        <p className="mt-4 text-muted-foreground">
          Your checkout was cancelled. Don&apos;t worry, your cart items are
          still saved and you can complete your purchase anytime.
        </p>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href="/cart">Return to Cart</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
