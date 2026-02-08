'use client';

import { useState, useRef, useEffect } from 'react';
import { cn, Button } from '@createconomy/ui';
import { ArrowUpDown, Loader2 } from 'lucide-react';
import { CommentNode, type CommentData } from './comment-node';
import { CommentForm } from './comment-form';
import type { CommentSortBy } from '@/hooks/use-comments';

interface CommentTreeProps {
  threadId: string;
  comments: CommentData[];
  commentCount: number;
  hasMore: boolean;
  isLoading: boolean;
  isThreadLocked: boolean;
  sortBy: CommentSortBy;
  onSortChange: (sort: CommentSortBy) => void;
}

const sortOptions: { value: CommentSortBy; label: string }[] = [
  { value: 'best', label: 'Best' },
  { value: 'top', label: 'Top' },
  { value: 'new', label: 'New' },
  { value: 'controversial', label: 'Controversial' },
];

/**
 * CommentTree — Renders the full comment section for a thread.
 *
 * Includes:
 * - Comment count header
 * - Sort selector
 * - Top-level comment form
 * - Recursive comment tree
 */
export function CommentTree({
  threadId,
  comments,
  commentCount,
  hasMore,
  isLoading,
  isThreadLocked,
  sortBy,
  onSortChange,
}: CommentTreeProps) {
  const [showSortMenu, setShowSortMenu] = useState(false);
  const sortMenuRef = useRef<HTMLDivElement>(null);

  // Close sort menu when clicking outside
  useEffect(() => {
    if (!showSortMenu) return;

    function handleClickOutside(event: MouseEvent) {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target as Node)) {
        setShowSortMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSortMenu]);

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {commentCount} {commentCount === 1 ? 'Comment' : 'Comments'}
        </h2>

        {/* Sort selector */}
        <div ref={sortMenuRef} className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground"
            onClick={() => setShowSortMenu(!showSortMenu)}
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
            Sort by: {sortOptions.find((o) => o.value === sortBy)?.label}
          </Button>
          {showSortMenu && (
            <div className="absolute right-0 top-full z-10 mt-1 w-40 rounded-md border bg-card shadow-lg">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onSortChange(option.value);
                    setShowSortMenu(false);
                  }}
                  className={cn(
                    'block w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors',
                    sortBy === option.value &&
                      'font-medium text-primary bg-accent/50'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Comment form (top-level) */}
      {!isThreadLocked ? (
        <CommentForm threadId={threadId} placeholder="What are your thoughts?" />
      ) : (
        <div className="rounded-lg border bg-muted/50 p-4 text-center text-sm text-muted-foreground">
          🔒 This thread is locked. No new comments can be posted.
        </div>
      )}

      {/* Comment list */}
      {isLoading && comments.length === 0 ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : comments.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">
          <p className="text-lg mb-1">No comments yet</p>
          <p className="text-sm">Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-0">
          {comments.map((comment) => (
            <CommentNode
              key={comment._id}
              comment={comment}
              threadId={threadId}
              isThreadLocked={isThreadLocked}
            />
          ))}
        </div>
      )}

      {/* Load more */}
      {hasMore && (
        <div className="flex justify-center pt-2">
          <Button variant="outline" size="sm">
            Load more comments
          </Button>
        </div>
      )}
    </section>
  );
}
