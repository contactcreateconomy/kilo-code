import Link from "next/link";
import { Suspense } from "react";
import { ThreadList } from "@/components/forum/thread-list";
import { CategoryList } from "@/components/forum/category-list";
import { SearchBar } from "@/components/forum/search-bar";
import { Sidebar } from "@/components/layout/sidebar";
import { Skeleton } from "@createconomy/ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Createconomy Forum - Community Discussions",
  description:
    "Join the Createconomy community forum. Discuss digital products, share knowledge, get help, and connect with creators and buyers.",
};

function ThreadListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="thread-card">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}

function CategoryListSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-lg border p-4">
          <Skeleton className="h-6 w-1/2 mb-2" />
          <Skeleton className="h-4 w-full" />
        </div>
      ))}
    </div>
  );
}

export default function ForumHomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Welcome to Createconomy Forum
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
          Connect with creators and buyers. Share knowledge, get help, and be
          part of our growing community.
        </p>
        <div className="max-w-xl mx-auto">
          <SearchBar placeholder="Search discussions..." />
        </div>
      </section>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="flex-1 space-y-8">
          {/* Featured/Pinned Threads */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">📌 Pinned Discussions</h2>
            </div>
            <Suspense fallback={<ThreadListSkeleton />}>
              <ThreadList filter="pinned" limit={3} />
            </Suspense>
          </section>

          {/* Categories Overview */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">Categories</h2>
              <Link
                href="/c"
                className="text-sm text-primary hover:underline"
              >
                View all →
              </Link>
            </div>
            <Suspense fallback={<CategoryListSkeleton />}>
              <CategoryList limit={6} />
            </Suspense>
          </section>

          {/* Recent Activity */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">Recent Discussions</h2>
              <Link
                href="/c"
                className="text-sm text-primary hover:underline"
              >
                View all →
              </Link>
            </div>
            <Suspense fallback={<ThreadListSkeleton />}>
              <ThreadList filter="recent" limit={10} />
            </Suspense>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="w-full lg:w-80">
          <Sidebar />
        </aside>
      </div>
    </div>
  );
}
