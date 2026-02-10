import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@createconomy/ui";
import { Newspaper, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Stay updated with the latest news, tips, and stories from the Createconomy community.",
};

export default function BlogPage() {
  return (
    <div className="container py-12">
      <div className="mx-auto flex min-h-[40vh] max-w-2xl flex-col items-center justify-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Newspaper className="h-8 w-8 text-primary" />
        </div>
        <h1 className="mt-6 text-3xl font-bold tracking-tight">
          Blog Coming Soon
        </h1>
        <p className="mt-4 text-muted-foreground">
          We&apos;re working on bringing you creator spotlights, product tips,
          marketplace insights, and community stories. Stay tuned!
        </p>

        <div className="mt-8 w-full max-w-sm">
          <p className="text-sm font-medium text-muted-foreground">
            In the meantime, explore what&apos;s available:
          </p>
          <div className="mt-4 flex flex-col gap-3">
            <Button asChild variant="outline" className="w-full justify-between">
              <Link href="/products">
                Browse Products
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-between">
              <Link href="/categories">
                Explore Categories
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-between">
              <Link href="/about">
                Learn About Us
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
