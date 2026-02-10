"use client";

import Link from "next/link";
import Image from "next/image";
import { useQuery, useMutation } from "convex/react";
import { api } from "@createconomy/convex";
import type { Id } from "@createconomy/convex/dataModel";
import { useAuth } from "@/hooks/use-auth";
import { centsToDollars } from "@/lib/utils";
import {
  Card,
  CardContent,
  Button,
  Skeleton,
} from "@createconomy/ui";
import { useToast } from "@createconomy/ui";
import {
  Heart,
  ShoppingCart,
  Trash2,
  Star,
  LogIn,
  Loader2,
} from "lucide-react";
import { useState } from "react";

interface WishlistItemData {
  _id: string;
  productId: string;
  addedAt: number;
  product: {
    _id: string;
    name: string;
    slug: string;
    price: number;
    currency: string;
    status: string;
    averageRating?: number;
    reviewCount: number;
    primaryImage?: string;
  };
}

function WishlistItemCard({ item }: { item: WishlistItemData }) {
  const [isRemoving, setIsRemoving] = useState(false);
  const removeFromWishlist = useMutation(api.functions.wishlists.removeFromWishlist);
  const toast = useToast();

  async function handleRemove() {
    setIsRemoving(true);
    try {
      await removeFromWishlist({
        productId: item.productId as Id<"products">,
      });
      toast.addToast("Removed from wishlist", "success");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to remove from wishlist";
      toast.addToast(message, "error");
    } finally {
      setIsRemoving(false);
    }
  }

  const isAvailable = item.product.status === "active";

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center gap-4">
          {/* Product thumbnail */}
          <Link
            href={`/products/${item.product.slug}`}
            className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted"
          >
            {item.product.primaryImage ? (
              <Image
                src={item.product.primaryImage}
                alt={item.product.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                No image
              </div>
            )}
          </Link>

          {/* Product info */}
          <div className="min-w-0 flex-1">
            <Link
              href={`/products/${item.product.slug}`}
              className="font-medium hover:underline"
            >
              {item.product.name}
            </Link>

            <div className="mt-1 flex items-center gap-2 text-sm">
              <span className="font-semibold">
                ${centsToDollars(item.product.price)}
              </span>
              {item.product.averageRating && (
                <span className="flex items-center gap-0.5 text-muted-foreground">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  {item.product.averageRating.toFixed(1)}
                  <span className="text-xs">
                    ({item.product.reviewCount})
                  </span>
                </span>
              )}
            </div>

            {!isAvailable && (
              <p className="mt-1 text-xs text-destructive">
                Currently unavailable
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-2">
            {isAvailable && (
              <Button
                asChild
                size="sm"
                className="hidden gap-1.5 sm:inline-flex"
              >
                <Link href={`/products/${item.product.slug}`}>
                  <ShoppingCart className="h-3.5 w-3.5" />
                  View
                </Link>
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              disabled={isRemoving}
              className="gap-1.5 text-destructive hover:text-destructive"
            >
              {isRemoving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
              <span className="hidden sm:inline">Remove</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function WishlistSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Wishlist</h1>
        <p className="text-muted-foreground">
          Your saved products
        </p>
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function MyWishlist() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const wishlist = useQuery(
    api.functions.wishlists.getWishlist,
    isAuthenticated ? {} : "skip"
  ) as { items: WishlistItemData[] } | undefined;

  // Auth loading state
  if (authLoading) {
    return <WishlistSkeleton />;
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Wishlist</h1>
          <p className="text-muted-foreground">
            Save your favorite products for later
          </p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <LogIn className="h-12 w-12 text-muted-foreground" />
            <h2 className="mt-4 text-lg font-semibold">Sign in required</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Please sign in to view your wishlist.
            </p>
            <Button asChild className="mt-6">
              <Link href="/auth/signin">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Data loading state
  if (wishlist === undefined) {
    return <WishlistSkeleton />;
  }

  const items = wishlist.items;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Wishlist</h1>
        <p className="text-muted-foreground">
          Your saved products
        </p>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Heart className="h-12 w-12 text-muted-foreground" />
            <h2 className="mt-4 text-lg font-semibold">
              Your wishlist is empty
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Browse products and click the heart icon to save them for later.
            </p>
            <Button asChild className="mt-6">
              <Link href="/products">Browse Products</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {items.length} {items.length === 1 ? "item" : "items"} saved
          </p>
          {items.map((item) => (
            <WishlistItemCard key={item._id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
