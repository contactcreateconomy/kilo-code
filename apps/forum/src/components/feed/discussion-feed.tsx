'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { api } from '@createconomy/convex';
import { cn, Spinner } from '@createconomy/ui';
import { Users } from 'lucide-react';
import { DiscussionCard } from './discussion-card';
import { TrendSorter } from './trend-sorter';
import { FeedUndoToast } from './feed-undo-toast';
import { ReportPostDialog } from './report-post-dialog';
import { useDiscussionFeed } from '@/hooks/use-discussion-feed';
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';
import { useAuthAction } from '@/hooks/use-auth-action';
import type { FeedTabType } from '@/types/forum';
import type { CommentPreviewItem } from './comments-preview-cycler';

interface DiscussionFeedProps {
  className?: string;
}

interface UndoState {
  discussionId: string;
  action: 'hidden' | 'reported';
  timerId: number;
  message: string;
}

function isSorterTab(tab: FeedTabType): tab is 'top' | 'hot' | 'new' | 'fav' {
  return tab === 'top' || tab === 'hot' || tab === 'new' || tab === 'fav';
}

function readTab(searchParams: URLSearchParams): FeedTabType {
  const raw = searchParams.get('sort');
  if (raw === 'top' || raw === 'hot' || raw === 'new' || raw === 'fav') return raw;
  return 'top';
}

function reportReasonToMutationReason(reason: string) {
  if (reason.includes('Spam')) return 'spam' as const;
  if (reason.includes('Harassment')) return 'harassment' as const;
  if (reason.includes('Unsafe')) return 'violence' as const;
  return 'off_topic' as const;
}

export function DiscussionFeed({ className }: DiscussionFeedProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { requireAuth } = useAuthAction();

  const [activeTab, setActiveTab] = useState<FeedTabType>(() => readTab(new URLSearchParams(searchParams.toString())));
  const [undoState, setUndoState] = useState<UndoState | null>(null);
  const [hiddenLocalIds, setHiddenLocalIds] = useState<Set<string>>(new Set());
  const [reportDiscussionId, setReportDiscussionId] = useState<string | null>(null);

  const { discussions, isLoading, hasMore, loadMore, isLoadingMore } = useDiscussionFeed(activeTab, 20);

  const hiddenThreadIds = useQuery(api.functions.forum.getHiddenThreadIds, {});
  const commentPreviewsByThread = useQuery(
    api.functions.forum.getDiscussionCommentPreviews,
    discussions.length > 0
      ? { threadIds: discussions.map((discussion) => discussion.id), limitPerThread: 4 }
      : 'skip'
  );

  const hideThread = useMutation(api.functions.forum.hideThread);
  const unhideThread = useMutation(api.functions.forum.unhideThread);
  const createReport = useMutation(api.functions.moderation.createReport);

  useEffect(() => {
    const nextTab = readTab(new URLSearchParams(searchParams.toString()));
    setActiveTab(nextTab);
  }, [searchParams]);

  useEffect(() => {
    return () => {
      if (undoState) {
        window.clearTimeout(undoState.timerId);
      }
    };
  }, [undoState]);

  const { ref: loadMoreRef } = useInfiniteScroll(
    async () => {
      await loadMore();
    },
    {
      enabled: hasMore && !isLoadingMore && activeTab !== 'fav',
      threshold: 0.1,
      rootMargin: '200px',
    }
  );

  const hiddenIds = useMemo(() => {
    const next = new Set<string>(hiddenThreadIds ?? []);
    for (const id of hiddenLocalIds) next.add(id);
    return next;
  }, [hiddenThreadIds, hiddenLocalIds]);

  const visibleDiscussions = useMemo(
    () => discussions.filter((discussion) => !hiddenIds.has(discussion.id)),
    [discussions, hiddenIds]
  );

  const previews = (discussionId: string): CommentPreviewItem[] => {
    if (!commentPreviewsByThread) return [];
    return commentPreviewsByThread[discussionId] ?? [];
  };

  const syncTabInUrl = useCallback(
    (tab: FeedTabType) => {
      const next = new URLSearchParams(searchParams.toString());
      next.set('sort', tab);
      router.replace(`${pathname}?${next.toString()}`);
    },
    [pathname, router, searchParams]
  );

  const startUndo = useCallback((discussionId: string, action: 'hidden' | 'reported', message: string) => {
    setUndoState((current) => {
      if (current) window.clearTimeout(current.timerId);

      const timerId = window.setTimeout(() => {
        setUndoState(null);
      }, 5500);

      return {
        discussionId,
        action,
        timerId,
        message,
      };
    });
  }, []);

  const handleHide = useCallback(
    (discussionId: string) => {
      requireAuth(async () => {
        await hideThread({ threadId: discussionId, reason: 'hidden' });
        setHiddenLocalIds((current) => new Set(current).add(discussionId));
        startUndo(discussionId, 'hidden', 'Post hidden');
      });
    },
    [hideThread, requireAuth, startUndo]
  );

  const handleReportSubmit = useCallback(
    (reason: string) => {
      if (!reportDiscussionId) return;

      requireAuth(async () => {
        await createReport({
          targetType: 'thread',
          targetId: reportDiscussionId,
          reason: reportReasonToMutationReason(reason),
          details: reason,
        });

        await hideThread({ threadId: reportDiscussionId, reason: 'reported' });
        setHiddenLocalIds((current) => new Set(current).add(reportDiscussionId));
        startUndo(reportDiscussionId, 'reported', `Post reported (${reason}) and hidden`);
        setReportDiscussionId(null);
      });
    },
    [createReport, hideThread, reportDiscussionId, requireAuth, startUndo]
  );

  const handleUndo = useCallback(() => {
    setUndoState((current) => {
      if (!current) return null;
      window.clearTimeout(current.timerId);

      void unhideThread({ threadId: current.discussionId });
      setHiddenLocalIds((hidden) => {
        const next = new Set(hidden);
        next.delete(current.discussionId);
        return next;
      });

      return null;
    });
  }, [unhideThread]);

  const dismissUndo = useCallback(() => {
    setUndoState((current) => {
      if (!current) return null;
      window.clearTimeout(current.timerId);
      return null;
    });
  }, []);

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <TrendSorter
        activeTab={isSorterTab(activeTab) ? activeTab : 'top'}
        onChange={(tab) => {
          setActiveTab(tab);
          syncTabInUrl(tab);
        }}
      />

      <div className="flex flex-col gap-4">
        {isLoading && visibleDiscussions.length === 0 ? (
          <div className="flex justify-center py-12">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Spinner size="md" />
              <span className="text-sm">Loading discussions...</span>
            </div>
          </div>
        ) : visibleDiscussions.length === 0 ? (
          activeTab === 'following' ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-lg font-medium text-foreground">Nothing here yet</p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Follow some users to see their posts in your feed. Visit user profiles to follow them.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16 text-center">
              <p className="text-lg font-medium text-foreground">
                {activeTab === 'fav' ? 'No favorite posts yet' : 'No posts in this category yet'}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {activeTab === 'fav'
                  ? 'Bookmark posts as favorites and they will appear here.'
                  : 'Try another feed sort to discover more discussions.'}
              </p>
            </div>
          )
        ) : (
          <>
            {visibleDiscussions.map((discussion, index) => (
              <DiscussionCard
                key={discussion.id}
                discussion={discussion}
                index={index}
                commentsPreview={previews(discussion.id)}
                onHide={handleHide}
                onReport={setReportDiscussionId}
              />
            ))}

            {hasMore && activeTab !== 'fav' ? (
              <div ref={loadMoreRef} className="flex justify-center py-4">
                {isLoadingMore ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Spinner size="md" />
                    <span className="text-sm">Loading more...</span>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">Scroll for more</span>
                )}
              </div>
            ) : null}
          </>
        )}
      </div>

      <ReportPostDialog
        open={Boolean(reportDiscussionId)}
        onOpenChange={(open) => {
          if (!open) setReportDiscussionId(null);
        }}
        onSubmit={handleReportSubmit}
      />

      {undoState ? (
        <FeedUndoToast message={undoState.message} onUndo={handleUndo} onDismiss={dismissUndo} />
      ) : null}
    </div>
  );
}

export default DiscussionFeed;
