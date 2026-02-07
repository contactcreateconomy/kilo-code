'use client';

import { Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { PostList } from '@/components/forum/post-list';
import { ReplyForm } from '@/components/forum/reply-form';
import { UserBadge } from '@/components/forum/user-badge';
import { Sidebar } from '@/components/layout/sidebar';
import { Button, Skeleton } from '@createconomy/ui';
import { useThread, useForum } from '@/hooks/use-forum';
import { Loader2 } from 'lucide-react';

function PostListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="rounded-lg border p-4">
          <div className="flex items-start gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * ThreadPage - Thread detail page
 *
 * Fetches thread data from Convex via useThread hook. Tracks view count.
 */
export default function ThreadPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const id = params.id;
  const page = searchParams.get('page') ?? '1';
  const currentPage = parseInt(page, 10);

  const { thread, isLoading } = useThread(id);
  const { viewThread } = useForum();

  // Track view
  useEffect(() => {
    if (id) {
      viewThread(id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-2">Thread Not Found</h1>
        <p className="text-muted-foreground mb-4">
          This thread may have been deleted or doesn&apos;t exist.
        </p>
        <Button asChild>
          <Link href="/">Back to Forum</Link>
        </Button>
      </div>
    );
  }

  // Extract enriched fields from the Convex getThread response.
  // The thread object has nested `category`, `author`, and `posts` fields.
  const threadAny = thread as Record<string, unknown>;
  const category = threadAny['category'] as { id: string; name: string; slug: string } | null | undefined;
  const author = threadAny['author'] as { id: string; name: string; displayName?: string; avatarUrl?: string } | null | undefined;
  const posts = threadAny['posts'] as Array<Record<string, unknown>> | undefined;
  const firstPost = posts?.find((p) => p['isFirstPost'] === true);
  const content = firstPost ? (firstPost['content'] as string) : undefined;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground mb-4">
        <Link href="/" className="hover:text-foreground">
          Forum
        </Link>
        {category?.slug && (
          <>
            <span className="mx-2">/</span>
            <Link
              href={`/c/${category.slug}`}
              className="hover:text-foreground"
            >
              {category.name ?? category.slug}
            </Link>
          </>
        )}
        <span className="mx-2">/</span>
        <span className="truncate max-w-[200px] inline-block align-bottom">
          {thread.title}
        </span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="flex-1">
          {/* Thread Header */}
          <article className="mb-8">
            <div className="flex items-start gap-2 mb-2">
              {thread.isPinned && (
                <span className="text-primary" title="Pinned">
                  📌
                </span>
              )}
              {thread.isLocked && (
                <span className="text-muted-foreground" title="Locked">
                  🔒
                </span>
              )}
              <h1 className="text-3xl font-bold tracking-tight">
                {thread.title}
              </h1>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
              <UserBadge
                username={author?.displayName ?? author?.name ?? 'unknown'}
                avatar={author?.avatarUrl}
                role={'Member'}
              />
              <span>•</span>
              <time>
                {new Date(thread.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
              <span>•</span>
              <span>{thread.viewCount} views</span>
              <span>•</span>
              <span>{thread.postCount} replies</span>
            </div>

            {/* Thread Content */}
            <div className="rounded-lg border bg-card p-6">
              <div className="markdown-content prose prose-sm dark:prose-invert max-w-none">
                <div className="whitespace-pre-wrap">{content ?? ''}</div>
              </div>
              <div className="mt-6 pt-4 border-t flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    👍 Like
                  </Button>
                  <Button variant="ghost" size="sm">
                    🔗 Share
                  </Button>
                  <Button variant="ghost" size="sm">
                    🚩 Report
                  </Button>
                </div>
              </div>
            </div>
          </article>

          {/* Replies Section */}
          <section>
            <h2 className="text-xl font-semibold mb-4">
              Replies ({thread.postCount})
            </h2>

            <Suspense fallback={<PostListSkeleton />}>
              <PostList posts={[]} originalPostId={id} />
            </Suspense>

            {/* Pagination */}
            {thread.postCount > 10 && (
              <div className="mt-8 flex justify-center gap-2">
                <Button
                  variant="outline"
                  disabled={currentPage <= 1}
                  asChild={currentPage > 1}
                >
                  {currentPage > 1 ? (
                    <Link href={`/t/${id}?page=${currentPage - 1}`}>
                      Previous
                    </Link>
                  ) : (
                    'Previous'
                  )}
                </Button>
                <span className="flex items-center px-4 text-sm text-muted-foreground">
                  Page {currentPage}
                </span>
                <Button variant="outline" asChild>
                  <Link href={`/t/${id}?page=${currentPage + 1}`}>Next</Link>
                </Button>
              </div>
            )}
          </section>

          {/* Reply Form */}
          {!thread.isLocked ? (
            <section className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Post a Reply</h2>
              <ReplyForm threadId={id} />
            </section>
          ) : (
            <div className="mt-8 rounded-lg border bg-muted/50 p-6 text-center">
              <span className="text-2xl mb-2 block">🔒</span>
              <p className="text-muted-foreground">
                This thread is locked. No new replies can be posted.
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="w-full lg:w-80">
          <Sidebar currentCategory={category?.slug} />
        </aside>
      </div>
    </div>
  );
}
