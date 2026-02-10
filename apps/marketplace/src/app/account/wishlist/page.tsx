import type { Metadata } from "next";
import Link from "next/link";
import { Heart } from "lucide-react";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "Save your favorite products for later.",
};

export default function WishlistPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Wishlist</h1>
        <p className="text-muted-foreground">
          Save your favorite products for later
        </p>
      </div>

      <div className="flex flex-col items-center justify-center rounded-lg border bg-card p-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Heart className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="mt-6 text-xl font-semibold">Wishlist Coming Soon</h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Save your favorite products for later. This feature is coming soon!
        </p>
        <Link
          href="/products"
          className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          Browse Products
        </Link>
      </div>
    </div>
  );
}
