"use client";

import { useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@createconomy/convex";
import { ProductCard } from "@/components/products/product-card";
import { mapConvexProductListItem } from "@/lib/convex-mappers";
import { Skeleton } from "@createconomy/ui";
import { Input } from "@createconomy/ui/components/input";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@createconomy/ui/components/breadcrumb";
import { Search, PackageSearch } from "lucide-react";
import Link from "next/link";

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function SearchResultsSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
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

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") ?? "";
  const [inputValue, setInputValue] = useState(query);

  // Run search query
  const searchResults = useQuery(
    api.functions.products.searchProducts,
    query ? { query, limit: 20 } : "skip"
  );

  // Handle form submission
  const handleSubmit = useCallback(
    (e: React.SyntheticEvent) => {
      e.preventDefault();
      const trimmed = inputValue.trim();
      if (trimmed) {
        router.push(`/search?q=${encodeURIComponent(trimmed)}`);
      }
    },
    [inputValue, router]
  );

  // Map results to Product type
  const products = (searchResults ?? []).map(mapConvexProductListItem);

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
            <BreadcrumbPage>Search</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Search input */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="relative mx-auto max-w-2xl">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search for products..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="h-12 pl-10 text-base"
            autoFocus
          />
        </div>
      </form>

      {/* Results */}
      {!query ? (
        // No query yet — prompt
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <PackageSearch className="h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-lg text-muted-foreground">
            Search for products...
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter a keyword above to find digital products on our marketplace.
          </p>
        </div>
      ) : searchResults === undefined ? (
        // Loading
        <>
          <p className="mb-6 text-muted-foreground">
            Searching for &ldquo;{query}&rdquo;...
          </p>
          <SearchResultsSkeleton />
        </>
      ) : products.length > 0 ? (
        // Results found
        <>
          <p className="mb-6 text-muted-foreground">
            {products.length} {products.length === 1 ? "result" : "results"} for
            &ldquo;{query}&rdquo;
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      ) : (
        // No results
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <PackageSearch className="h-12 w-12 text-muted-foreground/50" />
          <h2 className="mt-4 text-xl font-semibold">No results found</h2>
          <p className="mt-2 max-w-md text-muted-foreground">
            No products matched &ldquo;{query}&rdquo;. Try different keywords or
            browse our categories.
          </p>
        </div>
      )}
    </div>
  );
}
