import { Suspense } from "react";
import Link from "next/link";
import { ThreadList } from "@/components/forum/thread-list";
import { SearchBar } from "@/components/forum/search-bar";
import { Skeleton } from "@createconomy/ui";
import type { Metadata } from "next";

type Props = {
  searchParams: Promise<{ q?: string; category?: string; sort?: string; page?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;

  return {
    title: q ? `Search: ${q}` : "Search Forum",
    description: q
      ? `Search results for "${q}" on Createconomy Forum`
      : "Search discussions, threads, and posts on Createconomy Forum",
  };
}

function SearchResultsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="rounded-lg border p-4">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <div className="flex gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function SearchPage({ searchParams }: Props) {
  const { q = "", category = "", sort = "relevance", page = "1" } = await searchParams;
  const currentPage = parseInt(page, 10);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground">
          Forum
        </Link>
        <span className="mx-2">/</span>
        <span>Search</span>
      </nav>

      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-4">
          {q ? `Search results for "${q}"` : "Search Forum"}
        </h1>
        <div className="max-w-2xl">
          <SearchBar
            placeholder="Search threads, posts, and users..."
            defaultValue={q}
            autoFocus
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6 pb-6 border-b">
        <div className="flex items-center gap-2">
          <label htmlFor="category" className="text-sm text-muted-foreground">
            Category:
          </label>
          <select
            id="category"
            defaultValue={category}
            className="rounded-md border bg-background px-3 py-1.5 text-sm"
          >
            <option value="">All Categories</option>
            <option value="general">General Discussion</option>
            <option value="product-help">Product Help</option>
            <option value="creator-tools">Creator Tools</option>
            <option value="announcements">Announcements</option>
            <option value="feedback">Feedback</option>
            <option value="showcase">Showcase</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="sort" className="text-sm text-muted-foreground">
            Sort by:
          </label>
          <select
            id="sort"
            defaultValue={sort}
            className="rounded-md border bg-background px-3 py-1.5 text-sm"
          >
            <option value="relevance">Relevance</option>
            <option value="recent">Most Recent</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
      </div>

      {/* Search Results */}
      {q ? (
        <Suspense fallback={<SearchResultsSkeleton />}>
          <ThreadList
            searchQuery={q}
            categorySlug={category}
            sort={sort}
            page={currentPage}
          />
        </Suspense>
      ) : (
        <div className="text-center py-12">
          <span className="text-6xl mb-4 block">🔍</span>
          <h2 className="text-xl font-semibold mb-2">Start searching</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Enter a search term above to find threads, posts, and discussions
            across the forum.
          </p>
        </div>
      )}

      {/* Pagination */}
      {q && (
        <div className="mt-8 flex justify-center gap-2">
          <Link
            href={`/search?q=${encodeURIComponent(q)}&category=${category}&sort=${sort}&page=${currentPage - 1}`}
            className={`px-4 py-2 rounded-md border ${currentPage <= 1 ? "pointer-events-none opacity-50" : "hover:bg-accent"}`}
          >
            Previous
          </Link>
          <span className="flex items-center px-4 text-sm text-muted-foreground">
            Page {currentPage}
          </span>
          <Link
            href={`/search?q=${encodeURIComponent(q)}&category=${category}&sort=${sort}&page=${currentPage + 1}`}
            className="px-4 py-2 rounded-md border hover:bg-accent"
          >
            Next
          </Link>
        </div>
      )}

      {/* Search Tips */}
      <div className="mt-12 rounded-lg border bg-muted/50 p-6">
        <h3 className="font-semibold mb-3">Search Tips</h3>
        <ul className="text-sm text-muted-foreground space-y-2">
          <li>
            • Use quotes for exact phrases: <code>&quot;digital products&quot;</code>
          </li>
          <li>
            • Use minus to exclude words: <code>templates -free</code>
          </li>
          <li>
            • Search by author: <code>author:username</code>
          </li>
          <li>
            • Search in category: <code>category:showcase</code>
          </li>
        </ul>
      </div>
    </div>
  );
}
