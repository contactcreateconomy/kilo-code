import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProductGrid } from "@/components/products/product-grid";
import { ProductFilters } from "@/components/products/product-filters";
import { Skeleton } from "@createconomy/ui";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    search?: string;
    sort?: string;
    page?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
}

// Mock function to get category - replace with Convex query
async function getCategory(slug: string) {
  const categories = [
    {
      id: "1",
      slug: "templates",
      name: "Templates",
      description: "Website templates, landing pages, and UI kits",
    },
    {
      id: "2",
      slug: "courses",
      name: "Courses",
      description: "Online courses and educational content",
    },
    {
      id: "3",
      slug: "graphics",
      name: "Graphics",
      description: "Icons, illustrations, and design assets",
    },
    {
      id: "4",
      slug: "plugins",
      name: "Plugins",
      description: "WordPress, Figma, and other plugins",
    },
  ];

  return categories.find((c) => c.slug === slug) || null;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) {
    return {
      title: "Category Not Found",
    };
  }

  return {
    title: category.name,
    description: category.description,
    openGraph: {
      title: `${category.name} - Createconomy`,
      description: category.description,
    },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params;
  const search = await searchParams;
  const category = await getCategory(slug);

  if (!category) {
    notFound();
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{category.name}</h1>
        <p className="mt-2 text-muted-foreground">{category.description}</p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Filters Sidebar */}
        <aside className="w-full shrink-0 lg:w-64">
          <ProductFilters
            selectedCategory={slug}
            minPrice={search.minPrice}
            maxPrice={search.maxPrice}
          />
        </aside>

        {/* Products Grid */}
        <main className="flex-1">
          <Suspense fallback={<ProductGridSkeleton />}>
            <ProductGrid
              category={slug}
              search={search.search}
              sort={search.sort}
              page={search.page ? parseInt(search.page) : 1}
              minPrice={search.minPrice ? parseFloat(search.minPrice) : undefined}
              maxPrice={search.maxPrice ? parseFloat(search.maxPrice) : undefined}
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
