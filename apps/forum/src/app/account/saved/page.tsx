'use client';

import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '@createconomy/convex';
import { Spinner } from '@createconomy/ui';
import { Bookmark, MessageSquare, Eye, ArrowUp } from 'lucide-react';

/**
 * SavedPage — Displays the current user's bookmarked threads.
 *
 * Uses the `getBookmarkedThreads` query from forum.ts which fetches
 * all "bookmark" reactions by the authenticated user on threads,
 * enriched with thread + author + category data.
 */
export default function SavedPage() {
  const bookmarks = useQuery(api.functions.forum.getBookmarkedThreads, { limit: 50 });

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Bookmark className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">Saved Threads</h1>
      </div>

      <p className="text-sm text-muted-foreground mb-6">
        Threads you&apos;ve bookmarked for later. Click the bookmark icon on any thread to save it here.
      </p>

      {bookmarks === undefined ? (
        <div className="flex justify-center py-16">
          <Spinner size="xl" className="text-muted-foreground" />
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="rounded-lg border bg-card p-8 text-center">
          <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">No saved threads yet</h2>
          <p className="text-sm text-muted-foreground mb-4">
            When you bookmark a thread, it will appear here for easy access.
          </p>
          <Link
            href="/"
            className="text-primary hover:underline text-sm"
          >
            Browse discussions →
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {bookmarks.map((item) => {
            if (!item) return null;
            const { thread, bookmarkedAt } = item;
            return (
              <Link
                key={thread.id}
                href={`/t/${thread.id}`}
                className="block rounded-lg border bg-card p-4 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  {thread.category && (
                    <span className="text-sm shrink-0">
                      {thread.category.icon ?? '💬'}
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm line-clamp-2">
                      {thread.isPinned && <span className="text-primary mr-1">📌</span>}
                      {thread.isLocked && <span className="text-muted-foreground mr-1">🔒</span>}
                      {thread.title}
                    </h3>

                    {/* Author & Category */}
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      {thread.author && (
                        <span>by {thread.author.name}</span>
                      )}
                      {thread.category && (
                        <>
                          <span>•</span>
                          <span>{thread.category.name}</span>
                        </>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <ArrowUp className="h-3 w-3" />
                        {thread.upvoteCount}
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
                        Saved{' '}
                        {new Date(bookmarkedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
