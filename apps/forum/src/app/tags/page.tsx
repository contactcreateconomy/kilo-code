'use client';

import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '@createconomy/convex';
import { Spinner } from '@createconomy/ui';
import { Hash, TrendingUp } from 'lucide-react';

/**
 * TagsPage — Browse all tags, ordered by usage (popular first).
 *
 * Uses `getPopularTags` query from tags.ts with a high limit to show
 * all available tags. Each tag links to `/tags/[slug]` for filtered view.
 */
export default function TagsPage() {
  const tags = useQuery(api.functions.tags.getPopularTags, { limit: 100 });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground">
          Forum
        </Link>
        <span className="mx-2">/</span>
        <span>Tags</span>
      </nav>

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Hash className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tags</h1>
          <p className="text-muted-foreground">
            Browse discussion topics and find conversations that interest you
          </p>
        </div>
      </div>

      {/* Tags Grid */}
      {tags === undefined ? (
        <div className="flex justify-center py-16">
          <Spinner size="xl" className="text-muted-foreground" />
        </div>
      ) : tags.length === 0 ? (
        <div className="rounded-lg border bg-card p-8 text-center">
          <Hash className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">No tags yet</h2>
          <p className="text-sm text-muted-foreground">
            Tags are created when users add them to their discussions.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {tags.map((tag) => (
            <Link
              key={tag._id}
              href={`/tags/${tag.slug}`}
              className="rounded-lg border bg-card p-4 hover:bg-accent/50 transition-colors group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="inline-block h-3 w-3 rounded-full"
                      style={{
                        backgroundColor: tag.color ?? '#6366f1',
                      }}
                    />
                    <h3 className="font-medium text-sm group-hover:text-primary transition-colors">
                      {tag.displayName}
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {tag.name}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                  <TrendingUp className="h-3 w-3" />
                  <span>{tag.usageCount} threads</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
