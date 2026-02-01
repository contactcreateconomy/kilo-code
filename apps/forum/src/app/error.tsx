"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@createconomy/ui";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="mb-8">
          <span className="text-6xl">😕</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Something went wrong!
        </h1>
        <p className="text-lg text-muted-foreground max-w-md mb-8">
          We encountered an unexpected error. Please try again or return to the
          forum homepage.
        </p>
        <div className="flex gap-4">
          <Button onClick={reset} variant="default">
            Try again
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Return to Forum</Link>
          </Button>
        </div>
        {process.env.NODE_ENV === "development" && error.message && (
          <div className="mt-8 p-4 bg-destructive/10 rounded-lg max-w-2xl">
            <p className="text-sm font-mono text-destructive">{error.message}</p>
          </div>
        )}
      </div>
    </div>
  );
}
