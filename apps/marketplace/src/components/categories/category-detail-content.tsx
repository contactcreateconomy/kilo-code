"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@createconomy/convex";
import { ProductGrid } from "@/components/products/product-grid";
import { ProductFilters } from "@/components/products/product-filters";
import { Button, Skeleton } from "@createconomy/ui";
import { FolderOpen } from "lucide-react";

interface CategoryDetailContentProps {
  slug: string;
  search?: string;
  sort?: string;
  minPrice?: string;
  maxPrice?: string;
}

function CategoryDetailSkeleton() {
  return (
    <div>
      <div className="mb-8">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="mt-2 h-5 w-96" />
      </div>
      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="w-full shrink-0 lg:w-64">
          <Skeleton className="h-80 rounded-lg" />
        </aside>
        <main className="flex-1">
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
        </main>
      </div>
    </div>
  );
}

export function CategoryDetailContent({
  slug,
  search,
  sort,
  minPrice,
  maxPrice,
}: CategoryDetailContentProps) {
  // Resolve slug to category
  const category = useQuery(api.functions.categories.getCategoryBySlug, {
    slug,
  });

  // Loading
  if (category === undefined) {
    return <CategoryDetailSkeleton />;
  }

  // Not found
  if (category === null) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FolderOpen className="h-12 w-12 text-muted-foreground/50" />
        <h1 className="mt-4 text-2xl font-bold">Category Not Found</h1>
        <p className="mt-2 text-muted-foreground">
          The category you&apos;re looking for doesn&apos;t exist.
        </p>
        <Button asChild className="mt-6">
          <Link href="/categories">Browse Categories</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{category.name}</h1>
        {category.description && (
          <p className="mt-2 text-muted-foreground">{category.description}</p>
        )}
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Filters Sidebar */}
        <aside className="w-full shrink-0 lg:w-64">
          <ProductFilters
            selectedCategory={slug}
            minPrice={minPrice}
            maxPrice={maxPrice}
          />
        </aside>

        {/* Products Grid */}
        <main className="flex-1">
          <ProductGrid
            category={slug}
            categoryId={category._id}
            search={search}
            sort={sort}
          />
        </main>
      </div>
    </div>
  );
}
