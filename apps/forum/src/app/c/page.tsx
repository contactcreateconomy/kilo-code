import { Suspense } from "react";
import Link from "next/link";
import { CategoryList } from "@/components/forum/category-list";
import { SearchBar } from "@/components/forum/search-bar";
import { Skeleton } from "@createconomy/ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Categories",
  description:
    "Browse all discussion categories on Createconomy Forum. Find topics about digital products, creator tools, marketplace help, and more.",
};

function CategoryListSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="rounded-lg border p-6">
          <Skeleton className="h-8 w-8 rounded mb-4" />
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-full mb-4" />
          <div className="flex gap-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <nav className="text-sm text-muted-foreground mb-4">
          <Link href="/" className="hover:text-foreground">
            Forum
          </Link>
          <span className="mx-2">/</span>
          <span>Categories</span>
        </nav>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              All Categories
            </h1>
            <p className="text-muted-foreground">
              Browse discussions by topic. Find the right place for your
              questions and conversations.
            </p>
          </div>
          <div className="w-full md:w-80">
            <SearchBar placeholder="Search categories..." />
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <Suspense fallback={<CategoryListSkeleton />}>
        <CategoryList />
      </Suspense>

      {/* Help Section */}
      <div className="mt-12 rounded-lg border bg-muted/50 p-6 text-center">
        <h2 className="text-xl font-semibold mb-2">
          Can&apos;t find what you&apos;re looking for?
        </h2>
        <p className="text-muted-foreground mb-4">
          Try searching the forum or start a new discussion in the General
          category.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/search"
            className="text-primary hover:underline font-medium"
          >
            Search Forum
          </Link>
          <span className="text-muted-foreground">•</span>
          <Link
            href="/t/new"
            className="text-primary hover:underline font-medium"
          >
            Start a Discussion
          </Link>
        </div>
      </div>
    </div>
  );
}
