import type { Metadata } from "next";
import { use } from "react";
import { convexClient, api } from "@/lib/convex";
import { CategoryDetailContent } from "@/components/categories/category-detail-content";

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

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const category = await convexClient.query(
      api.functions.categories.getCategoryBySlug,
      { slug }
    );

    if (!category) {
      return {
        title: "Category Not Found",
      };
    }

    return {
      title: category.name,
      description: category.description ?? `Browse ${category.name} products on Createconomy.`,
      openGraph: {
        title: `${category.name} - Createconomy`,
        description: category.description ?? `Browse ${category.name} products on Createconomy.`,
      },
    };
  } catch {
    return {
      title: "Category",
    };
  }
}

export default function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = use(params);
  const search = use(searchParams);

  return (
    <div className="container py-8">
      <CategoryDetailContent
        slug={slug}
        search={search.search}
        sort={search.sort}
        minPrice={search.minPrice}
        maxPrice={search.maxPrice}
      />
    </div>
  );
}
