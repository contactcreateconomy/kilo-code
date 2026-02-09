import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ProductGrid } from "@/components/products/product-grid";
import { ProductFilters } from "@/components/products/product-filters";
import { ProductSortToolbar } from "@/components/products/product-sort-toolbar";
import { Skeleton } from "@createconomy/ui";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@createconomy/ui/components/breadcrumb";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Browse our collection of premium digital products, templates, courses, and resources.",
};

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
    sort?: string;
    page?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  
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
            <BreadcrumbPage>Products</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
        <p className="mt-2 text-muted-foreground">
          Browse our collection of premium digital products from talented creators
        </p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Filters Sidebar */}
        <aside className="w-full shrink-0 lg:w-64">
          <ProductFilters
            selectedCategory={params.category}
            minPrice={params.minPrice}
            maxPrice={params.maxPrice}
          />
        </aside>

        {/* Products Grid */}
        <main className="flex-1">
          {/* Sort Toolbar */}
          <ProductSortToolbar currentSort={params.sort} />

          <Suspense fallback={<ProductGridSkeleton />}>
            <ProductGrid
              category={params.category}
              search={params.search}
              sort={params.sort}
              page={params.page ? parseInt(params.page) : 1}
              minPrice={params.minPrice ? parseFloat(params.minPrice) : undefined}
              maxPrice={params.maxPrice ? parseFloat(params.maxPrice) : undefined}
            />
          </Suspense>
        </main>
      </div>
    </div>
  );
}

function ProductGridSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 9 }).map((_, i) => (
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
