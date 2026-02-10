"use client";

import { useQuery } from "convex/react";
import { api } from "@createconomy/convex";
import { ProductCard } from "./product-card";
import { Skeleton } from "@createconomy/ui";
import { mapConvexProductListItem } from "@/lib/convex-mappers";
import type { Id } from "@createconomy/convex/dataModel";

interface ProductGridProps {
  category?: string;
  categoryId?: string;
  search?: string;
  sort?: string;
  page?: number;
  minPrice?: number;
  maxPrice?: number;
}

function ProductGridSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="aspect-[4/3] rounded-lg" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-6 w-1/4" />
        </div>
      ))}
    </div>
  );
}

export function ProductGrid({
  categoryId,
  search,
}: ProductGridProps) {
  // Use search query when there's a search term, otherwise list products
  const listResult = useQuery(
    api.functions.products.listProducts,
    !search
      ? {
          status: "active" as const,
          includeDetails: true,
          ...(categoryId
            ? { categoryId: categoryId as Id<"productCategories"> }
            : {}),
        }
      : "skip"
  );

  const searchResult = useQuery(
    api.functions.products.searchProducts,
    search
      ? {
          query: search,
          ...(categoryId
            ? { categoryId: categoryId as Id<"productCategories"> }
            : {}),
        }
      : "skip"
  );

  // Determine loading/data state
  const isLoading = search ? searchResult === undefined : listResult === undefined;
  const rawProducts = search
    ? searchResult ?? []
    : listResult?.items ?? [];

  if (isLoading) {
    return <ProductGridSkeleton />;
  }

  if (rawProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-lg font-medium">No products found</p>
        <p className="mt-2 text-sm text-muted-foreground">
          {search
            ? `No results for "${search}". Try a different search term.`
            : "Try adjusting your filters or check back later."}
        </p>
      </div>
    );
  }

  const products = rawProducts.map(mapConvexProductListItem);

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
