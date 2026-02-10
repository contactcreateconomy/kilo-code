import type { Metadata } from "next";
import Link from "next/link";
import { ProductGrid } from "@/components/products/product-grid";
import { ProductFilters } from "@/components/products/product-filters";
import { ProductSortToolbar } from "@/components/products/product-sort-toolbar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@createconomy/ui/components/breadcrumb";
import { CategoryResolver } from "@/components/products/category-resolver";

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

          {/*
            CategoryResolver is a client component that resolves category slug → ID
            then renders ProductGrid with the resolved categoryId.
            When there's no category filter, it passes undefined.
          */}
          <CategoryResolver
            categorySlug={params.category}
            search={params.search}
            sort={params.sort}
          />
        </main>
      </div>
    </div>
  );
}
