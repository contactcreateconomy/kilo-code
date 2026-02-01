import Link from "next/link";
import { Button } from "@createconomy/ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you are looking for does not exist.",
};

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="mb-8">
          <span className="text-8xl font-bold text-muted-foreground">404</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Page Not Found
        </h1>
        <p className="text-lg text-muted-foreground max-w-md mb-8">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. The
          thread or category may have been moved or deleted.
        </p>
        <div className="flex gap-4">
          <Button asChild variant="default">
            <Link href="/">Return to Forum</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/c">Browse Categories</Link>
          </Button>
        </div>
        <div className="mt-12 text-sm text-muted-foreground">
          <p>Looking for something specific?</p>
          <Link href="/search" className="text-primary hover:underline">
            Try searching the forum →
          </Link>
        </div>
      </div>
    </div>
  );
}
