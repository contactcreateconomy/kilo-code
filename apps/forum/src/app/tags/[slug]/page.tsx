'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '@createconomy/convex';
import { Spinner } from '@createconomy/ui';
import { Hash, ArrowLeft, MessageSquare, Eye, ArrowUp } from 'lucide-react';

/**
 * TagDetailPage — Shows all threads tagged with a specific tag.
 *
 * Uses `getThreadsByTag` query from tags.ts which finds the tag by slug,
 * fetches thread-tag junctions, and returns enriched thread data.
 */
export default function TagDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const data = useQuery(
    api.functions.tags.getThreadsByTag,
    slug ? { tagSlug: slug, limit: 50 } : 'skip'
  );

  if (data === undefined) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center py-16">
          <Spinner size="xl" className="text-muted-foreground" />
        </div>
      </div>
    );
  }

  const tag = data?.tag;
  const threads = data?.threads ?? [];

  if (!tag) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-2">Tag Not Found</h1>
        <p className="text-muted-foreground mb-4">
          The tag &quot;{slug}&quot; doesn&apos;t exist.
        </p>
        <Link href="/tags" className="text-primary hover:underline">
          Browse all tags
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground">
          Forum
        </Link>
        <span className="mx-2">/</span>
        <Link href="/tags" className="hover:text-foreground">
          Tags
        </Link>
        <span className="mx-2">/</span>
        <span>{tag.displayName}</span>
      </nav>

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/tags"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-4 w-4 rounded-full"
            style={{ backgroundColor: tag.color ?? '#6366f1' }}
          />
          <Hash className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{tag.displayName}</h1>
          <p className="text-sm text-muted-foreground">
            {tag.usageCount} thread{tag.usageCount !== 1 ? 's' : ''} tagged
          </p>
        </div>
      </div>

      {/* Thread List */}
      {threads.length === 0 ? (
        <div className="rounded-lg border bg-card p-8 text-center">
          <Hash className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">No threads yet</h2>
          <p className="text-sm text-muted-foreground mb-4">
            No discussions have been tagged with &quot;{tag.displayName}&quot; yet.
          </p>
          <Link href="/t/new" className="text-primary hover:underline text-sm">
            Start a discussion →
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {threads.map((thread) => (
            <Link
              key={thread._id}
              href={`/t/${thread._id}`}
              className="block rounded-lg border bg-card p-4 hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm line-clamp-2">
                    {thread.isPinned && <span className="text-primary mr-1">📌</span>}
                    {thread.isLocked && <span className="text-muted-foreground mr-1">🔒</span>}
                    {thread.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <ArrowUp className="h-3 w-3" />
                      {thread.upvoteCount ?? 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {thread.postCount} replies
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {thread.viewCount} views
                    </span>
                    <span>
                      {new Date(thread.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
