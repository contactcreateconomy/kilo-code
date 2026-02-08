'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowBigUp, ArrowBigDown, Bookmark, Share2, Flag, Loader2, ExternalLink } from 'lucide-react';
import { cn, Button, Skeleton } from '@createconomy/ui';
import { CommentTree } from '@/components/comments/comment-tree';
import { UserBadge } from '@/components/forum/user-badge';
import { Sidebar } from '@/components/layout/sidebar';
import { EmbedRenderer } from '@/components/embeds';
import { ImageGalleryPreview } from '@/components/post-types/image-gallery-preview';
import { PollWidget } from '@/components/post-types/poll-widget';
import { FlairBadge } from '@/components/flairs';
import { TagList } from '@/components/tags';
import { useThreadComments, type CommentSortBy } from '@/hooks/use-comments';
import { useReactions } from '@/hooks/use-reactions';
import { useAuthAction } from '@/hooks/use-auth-action';
import { useForum } from '@/hooks/use-forum';

function ThreadSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-32 w-full rounded-lg" />
      <Skeleton className="h-6 w-1/4" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-lg border p-4">
          <div className="flex items-start gap-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-3 w-24 mb-2" />
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
 * Format a score for display.
 */
function formatScore(score: number): string {
  if (score >= 10000) return `${(score / 1000).toFixed(0)}k`;
  if (score >= 1000) return `${(score / 1000).toFixed(1)}k`;
  return score.toString();
}

/**
 * ThreadPage — Thread detail page using the new Reddit-style comment system.
 *
 * Fetches thread data + comments from the new `comments` table via useThreadComments.
 */
export default function ThreadPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [commentSort, setCommentSort] = useState<CommentSortBy>('best');
  const { thread, comments, hasMore, isLoading } = useThreadComments(
    id,
    commentSort,
    20
  );
  const { viewThread } = useForum();
  const { requireAuth } = useAuthAction();
  const { hasUpvote, hasDownvote, hasReaction, toggle } = useReactions(
    'thread',
    id ? [id] : []
  );

  const isUpvoted = id ? hasUpvote(id) : false;
  const isDownvoted = id ? hasDownvote(id) : false;
  const isBookmarked = id ? hasReaction(id, 'bookmark') : false;

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
        <ThreadSkeleton />
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

  const handleUpvote = () => {
    requireAuth(async () => {
      await toggle(id, 'upvote');
    });
  };

  const handleDownvote = () => {
    requireAuth(async () => {
      await toggle(id, 'downvote');
    });
  };

  const handleBookmark = () => {
    requireAuth(async () => {
      await toggle(id, 'bookmark');
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground mb-4">
        <Link href="/" className="hover:text-foreground">
          Forum
        </Link>
        {thread.category?.slug && (
          <>
            <span className="mx-2">/</span>
            <Link
              href={`/c/${thread.category.slug}`}
              className="hover:text-foreground"
            >
              {thread.category.name ?? thread.category.slug}
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
          {/* Thread Article */}
          <article className="mb-8">
            {/* Thread header with voting */}
            <div className="flex gap-4">
              {/* Voting column */}
              <div className="flex flex-col items-center gap-0.5 pt-1">
                <button
                  onClick={handleUpvote}
                  className={cn(
                    'p-1 rounded-md transition-colors hover:bg-orange-100 dark:hover:bg-orange-900/30',
                    isUpvoted && 'text-orange-500'
                  )}
                  aria-label="Upvote"
                >
                  <ArrowBigUp
                    className={cn(
                      'h-7 w-7',
                      isUpvoted && 'fill-current'
                    )}
                  />
                </button>
                <span
                  className={cn(
                    'text-sm font-bold tabular-nums',
                    isUpvoted && 'text-orange-500',
                    isDownvoted && 'text-blue-500',
                    !isUpvoted && !isDownvoted && 'text-muted-foreground'
                  )}
                >
                  {formatScore(thread.score)}
                </span>
                <button
                  onClick={handleDownvote}
                  className={cn(
                    'p-1 rounded-md transition-colors hover:bg-blue-100 dark:hover:bg-blue-900/30',
                    isDownvoted && 'text-blue-500'
                  )}
                  aria-label="Downvote"
                >
                  <ArrowBigDown
                    className={cn(
                      'h-7 w-7',
                      isDownvoted && 'fill-current'
                    )}
                  />
                </button>
              </div>

              {/* Thread content */}
              <div className="flex-1 min-w-0">
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
                  {thread.flair && (
                    <FlairBadge
                      flair={{
                        displayName: thread.flair.displayName,
                        backgroundColor: thread.flair.backgroundColor,
                        textColor: thread.flair.textColor,
                        emoji: thread.flair.emoji ?? undefined,
                      }}
                    />
                  )}
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                    {thread.title}
                  </h1>
                </div>

                <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
                  {thread.author && (
                    <UserBadge
                      username={
                        thread.author.name
                      }
                      avatar={thread.author.avatarUrl ?? undefined}
                      role={thread.author.role ?? 'Member'}
                    />
                  )}
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
                </div>

                {/* Phase 10: Tags */}
                {thread.tags && thread.tags.length > 0 && (
                  <div className="mb-4">
                    <TagList tags={thread.tags} />
                  </div>
                )}

                {/* Thread body — type-specific content */}
                <div className="rounded-lg border bg-card p-6">
                  {/* Text body (shown for text posts and as description for others) */}
                  {thread.body && (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <div className="whitespace-pre-wrap">{thread.body}</div>
                    </div>
                  )}

                  {/* Link post content — with rich embeds for YouTube, Vimeo, etc. */}
                  {thread.postType === 'link' && thread.linkUrl && (
                    <div className={thread.body ? 'mt-4' : ''}>
                      <EmbedRenderer
                        url={thread.linkUrl}
                        title={thread.linkTitle}
                        description={thread.linkDescription}
                        image={thread.linkImage}
                        domain={thread.linkDomain}
                      />
                    </div>
                  )}

                  {/* Image post content */}
                  {thread.postType === 'image' && thread.images && thread.images.length > 0 && (
                    <div className={thread.body ? 'mt-4' : ''}>
                      <ImageGalleryPreview images={thread.images} />
                    </div>
                  )}

                  {/* Poll post content */}
                  {thread.postType === 'poll' && (
                    <div className={thread.body ? 'mt-4' : ''}>
                      <PollWidget threadId={id} />
                    </div>
                  )}

                  {/* Thread actions */}
                  <div className="mt-6 pt-4 border-t flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleBookmark}
                      className={cn(isBookmarked && 'text-primary')}
                    >
                      <Bookmark
                        className={cn(
                          'h-4 w-4 mr-1',
                          isBookmarked && 'fill-current'
                        )}
                      />
                      {isBookmarked ? 'Saved' : 'Save'}
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Share2 className="h-4 w-4 mr-1" />
                      Share
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        requireAuth(() => {
                          // TODO: implement report
                        })
                      }
                    >
                      <Flag className="h-4 w-4 mr-1" />
                      Report
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </article>

          {/* Comments Section — Reddit-style threaded */}
          <CommentTree
            threadId={id}
            comments={comments}
            commentCount={thread.commentCount}
            hasMore={hasMore}
            isLoading={isLoading}
            isThreadLocked={thread.isLocked}
            sortBy={commentSort}
            onSortChange={setCommentSort}
          />
        </div>

        {/* Sidebar */}
        <aside className="w-full lg:w-80">
          <Sidebar currentCategory={thread.category?.slug} />
        </aside>
      </div>
    </div>
  );
}
