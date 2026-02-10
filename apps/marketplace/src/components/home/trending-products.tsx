"use client";

import Link from "next/link";
import Image from "next/image";
import { useQuery } from "convex/react";
import { api } from "@createconomy/convex";
import { Card, CardContent, Skeleton } from "@createconomy/ui";
import { Star } from "lucide-react";
import { centsToDollars, formatPrice } from "@/lib/utils";

function TrendingProductsSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-0">
          <Skeleton className="aspect-[4/3] rounded-t-lg" />
          <div className="space-y-2 p-4">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-4 w-12" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Client component that fetches and displays trending products from Convex.
 * Used on the home page in the "Trending Now" section.
 */
export function TrendingProducts() {
  const result = useQuery(api.functions.products.listProducts, {
    status: "active" as const,
    limit: 4,
    includeDetails: true,
  });

  if (result === undefined) {
    return <TrendingProductsSkeleton />;
  }

  const products = result.items;

  if (products.length === 0) {
    return (
      <p className="py-8 text-center text-muted-foreground">
        No products available yet. Check back soon!
      </p>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {products.map((product) => (
        <Link
          key={product._id}
          href={`/products/${product.slug}`}
          className="group"
        >
          <Card className="overflow-hidden transition-shadow hover:shadow-lg">
            <div className="relative aspect-[4/3] overflow-hidden bg-muted">
              {product.primaryImage && (
                <Image
                  src={product.primaryImage}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
              )}
            </div>
            <CardContent className="p-4">
              <h3 className="line-clamp-1 font-semibold group-hover:text-primary">
                {product.name}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                by {product.sellerName ?? "Seller"}
              </p>
              <div className="mt-2 flex items-center justify-between">
                <span className="font-bold">
                  {formatPrice(centsToDollars(product.price))}
                </span>
                <div className="flex items-center gap-1 text-sm">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span>{product.averageRating ?? 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
