"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@createconomy/convex";
import { ProductCard } from "@/components/products/product-card";
import { mapConvexProductListItem } from "@/lib/convex-mappers";
import { formatDate, getInitials } from "@/lib/utils";
import { Button, Skeleton } from "@createconomy/ui";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@createconomy/ui/components/avatar";
import { Card, CardContent } from "@createconomy/ui/components/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@createconomy/ui/components/breadcrumb";
import { Package, ShoppingBag, CalendarDays, UserX } from "lucide-react";
import type { Id } from "@createconomy/convex/dataModel";

interface SellerProfileContentProps {
  sellerId: string;
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function SellerProfileSkeleton() {
  return (
    <div className="container py-8">
      <Skeleton className="mb-6 h-5 w-48" />

      {/* Profile header */}
      <Card className="mb-8">
        <CardContent className="flex flex-col items-center gap-6 p-8 sm:flex-row sm:items-start">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="flex-1 space-y-3 text-center sm:text-left">
            <Skeleton className="mx-auto h-8 w-48 sm:mx-0" />
            <Skeleton className="mx-auto h-5 w-72 sm:mx-0" />
            <Skeleton className="mx-auto h-4 w-40 sm:mx-0" />
          </div>
          <div className="flex gap-6">
            <Skeleton className="h-16 w-24" />
            <Skeleton className="h-16 w-24" />
          </div>
        </CardContent>
      </Card>

      {/* Product grid */}
      <Skeleton className="mb-6 h-8 w-40" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-[4/3] rounded-lg" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-6 w-1/4" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function SellerProfileContent({ sellerId }: SellerProfileContentProps) {
  // Fetch seller info
  const seller = useQuery(api.functions.users.getUserById, {
    userId: sellerId as Id<"users">,
  });

  // Fetch seller's active products
  const sellerProducts = useQuery(api.functions.products.getProductsBySeller, {
    sellerId: sellerId as Id<"users">,
    status: "active" as const,
  });

  // ---------------------------------------------------------------------------
  // Loading
  // ---------------------------------------------------------------------------
  if (seller === undefined) {
    return <SellerProfileSkeleton />;
  }

  // ---------------------------------------------------------------------------
  // Not found
  // ---------------------------------------------------------------------------
  if (seller === null) {
    return (
      <div className="container flex flex-col items-center justify-center py-16 text-center">
        <UserX className="h-12 w-12 text-muted-foreground/50" />
        <h1 className="mt-4 text-2xl font-bold">Seller Not Found</h1>
        <p className="mt-2 text-muted-foreground">
          The seller you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Button asChild className="mt-6">
          <Link href="/products">Browse Products</Link>
        </Button>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Derived data
  // ---------------------------------------------------------------------------
  const displayName =
    seller.profile?.displayName ?? seller.name ?? "Unknown Seller";
  const avatarUrl = seller.profile?.avatarUrl ?? seller.image;
  const bio = seller.profile?.bio;
  const memberSince = seller.profile?.createdAt
    ? formatDate(new Date(seller.profile.createdAt))
    : null;
  const initials = getInitials(displayName);

  // Map products — override sellerName since we have it from the profile
  const products = (sellerProducts ?? []).map((p) =>
    mapConvexProductListItem({ ...p, sellerName: displayName })
  );

  const totalSales = products.reduce(
    (sum, product) => sum + product.salesCount,
    0
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="container py-8">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/products">Sellers</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{displayName}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Profile header card */}
      <Card className="mb-8">
        <CardContent className="flex flex-col items-center gap-6 p-8 sm:flex-row sm:items-start">
          <Avatar className="h-24 w-24 text-2xl">
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt={displayName} />
            ) : null}
            <AvatarFallback className="text-2xl font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-bold tracking-tight">
              {displayName}
            </h1>
            {bio && (
              <p className="mt-2 max-w-2xl text-muted-foreground">{bio}</p>
            )}
            {memberSince && (
              <p className="mt-2 flex items-center justify-center gap-1.5 text-sm text-muted-foreground sm:justify-start">
                <CalendarDays className="h-4 w-4" />
                Member since {memberSince}
              </p>
            )}
          </div>

          {/* Stats */}
          <div className="flex gap-6 text-center">
            <div>
              <div className="flex items-center justify-center gap-1.5 text-2xl font-bold">
                <Package className="h-5 w-5 text-muted-foreground" />
                {products.length}
              </div>
              <p className="text-sm text-muted-foreground">Products</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1.5 text-2xl font-bold">
                <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                {totalSales.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">Sales</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products section */}
      <section>
        <h2 className="mb-6 text-xl font-bold">
          Products by {displayName}
        </h2>

        {sellerProducts === undefined ? (
          // Products still loading
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[4/3] rounded-lg" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-6 w-1/4" />
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
            <Package className="h-10 w-10 text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">
              This seller hasn&apos;t listed any products yet.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
