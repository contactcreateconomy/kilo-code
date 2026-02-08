'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { ThreadList } from '@/components/forum/thread-list';
import { Sidebar } from '@/components/layout/sidebar';
import { SearchBar } from '@/components/forum/search-bar';
import { Button, Skeleton } from '@createconomy/ui';
import { useCategoryThreads } from '@/hooks/use-category-threads';
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';
import { Loader2 } from 'lucide-react';

function ThreadListSkeleton() {
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

/**
 * CategoryPage - Category detail page with infinite scroll
 *
 * Fetches category and its threads from Convex via useCategoryThreads hook.
 * Replaces page-based pagination with infinite scroll.
 */
export default function CategoryPage() {
  const params = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const slug = params.slug;
  const sort = (searchParams.get('sort') ?? 'recent') as 'recent' | 'popular' | 'unanswered';

  const { category, threads, isLoading, hasMore, loadMore, isLoadingMore } =
    useCategoryThreads(slug, sort);

  const { ref: loadMoreRef } = useInfiniteScroll(
    async () => {
      await loadMore();
    },
    {
      enabled: hasMore && !isLoadingMore,
      threshold: 0.1,
      rootMargin: '200px',
    }
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-2">Category Not Found</h1>
        <p className="text-muted-foreground mb-4">
          This category doesn&apos;t exist or has been removed.
        </p>
        <Button asChild>
          <Link href="/c">Browse Categories</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground mb-4">
        <Link href="/" className="hover:text-foreground">
          Forum
        </Link>
        <span className="mx-2">/</span>
        <Link href="/c" className="hover:text-foreground">
          Categories
        </Link>
        <span className="mx-2">/</span>
        <span>{category.name}</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="flex-1">
          {/* Category Header */}
          <div className="mb-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{category.icon ?? '💬'}</span>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">
                    {category.name}
                  </h1>
                  <p className="text-muted-foreground">{category.description}</p>
                </div>
              </div>
              <Button asChild>
                <Link href={`/t/new?category=${slug}`}>New Thread</Link>
              </Button>
            </div>

            {/* Stats and Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-y">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{category.threadCount} threads</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-64">
                  <SearchBar
                    placeholder={`Search in ${category.name}...`}
                  />
                </div>
                <select
                  className="rounded-md border bg-background px-3 py-2 text-sm"
                  defaultValue={sort}
                >
                  <option value="recent">Most Recent</option>
                  <option value="popular">Most Popular</option>
                  <option value="unanswered">Unanswered</option>
                </select>
              </div>
            </div>
          </div>

          {/* Thread List */}
          {threads.length === 0 && !isLoading ? (
            <div className="py-12 text-center">
              <p className="text-lg font-medium text-foreground">No threads yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Be the first to start a discussion in {category.name}!
              </p>
            </div>
          ) : (
            <Suspense fallback={<ThreadListSkeleton />}>
              <ThreadList
                emptyMessage={`No threads found in ${category.name}`}
              />
            </Suspense>
          )}

          {/* Infinite scroll trigger */}
          {hasMore && (
            <div ref={loadMoreRef} className="flex justify-center py-6 mt-4">
              {isLoadingMore ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-sm">Loading more threads...</span>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">
                  Scroll for more
                </span>
              )}
            </div>
          )}

          {!hasMore && threads.length > 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">
              You&apos;ve reached the end!
            </p>
          )}
        </div>

        {/* Sidebar */}
        <aside className="w-full lg:w-80">
          <Sidebar currentCategory={slug} />
        </aside>
      </div>
    </div>
  );
}
