"use client";

import Link from "next/link";
import Image from "next/image";
import { useQuery } from "convex/react";
import { api } from "@createconomy/convex";
import { centsToDollars } from "@/lib/utils";
import {
  Card,
  CardContent,
  Skeleton,
} from "@createconomy/ui";
import { Star, TrendingUp, Clock, Zap } from "lucide-react";
import { WishlistButton } from "@/components/products/wishlist-button";

interface ProductCardData {
  _id: string;
  name: string;
  slug: string;
  price: number;
  currency: string;
  averageRating?: number;
  reviewCount: number;
  salesCount: number;
  primaryImage?: string;
  pricingType?: string;
  minPrice?: number;
}

function ProductCard({ product }: { product: ProductCardData }) {
  const isFree = product.pricingType === "free" || product.price === 0;
  const isPWYW = product.pricingType === "pwyw";

  return (
    <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-[4/3] bg-muted">
          {product.primaryImage ? (
            <Image
              src={product.primaryImage}
              alt={product.name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              No image
            </div>
          )}
          {/* Wishlist button overlay */}
          <div className="absolute right-2 top-2 z-10">
            <WishlistButton
              productId={product._id}
              variant="icon"
              className="bg-white/80 backdrop-blur-sm hover:bg-white dark:bg-black/50 dark:hover:bg-black/70"
            />
          </div>
        </div>
      </Link>
      <CardContent className="p-4">
        <Link href={`/products/${product.slug}`}>
          <h3 className="line-clamp-2 font-medium leading-tight group-hover:underline">
            {product.name}
          </h3>
        </Link>

        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {isFree ? (
              <span className="text-sm font-semibold text-green-600">Free</span>
            ) : isPWYW ? (
              <span className="text-sm font-semibold">
                ${centsToDollars(product.minPrice ?? 0)}+
              </span>
            ) : (
              <span className="text-sm font-semibold">
                ${centsToDollars(product.price)}
              </span>
            )}
          </div>

          {product.averageRating && product.reviewCount > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span>{product.averageRating.toFixed(1)}</span>
              <span>({product.reviewCount})</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function DiscoverSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="aspect-[4/3]" />
            <CardContent className="p-4 space-y-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-4 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function DiscoverContent() {
  // Fetch top-selling products
  const topProducts = useQuery(api.functions.products.listProducts, {
    status: "active",
    limit: 12,
  });

  // Fetch newest products
  const newProducts = useQuery(api.functions.products.listProducts, {
    status: "active",
    limit: 8,
  });

  // Fetch categories
  const categories = useQuery(api.functions.categories.listCategories, {});

  if (topProducts === undefined || newProducts === undefined) {
    return <DiscoverSkeleton />;
  }

  return (
    <div className="space-y-12">
      {/* Hero section */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Discover
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Browse digital products from independent creators. Find ebooks, courses,
          software, templates, and more.
        </p>
      </div>

      {/* Categories quick links */}
      {categories && categories.length > 0 && (
        <div className="space-y-4">
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <Zap className="h-5 w-5" />
            Categories
          </h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat: { _id: string; name: string; slug: string }) => (
              <Link
                key={cat._id}
                href={`/categories/${cat.slug}`}
                className="rounded-full border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Trending products */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <TrendingUp className="h-5 w-5" />
            Trending
          </h2>
          <Link
            href="/products"
            className="text-sm text-muted-foreground hover:underline"
          >
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {topProducts.items.map((product: ProductCardData) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>

      {/* New arrivals */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <Clock className="h-5 w-5" />
            New Arrivals
          </h2>
          <Link
            href="/products"
            className="text-sm text-muted-foreground hover:underline"
          >
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {newProducts.items.map((product: ProductCardData) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
