'use client';

import { useState } from 'react';
import { Button, Spinner } from '@createconomy/ui';
import { useCommentActions } from '@/hooks/use-comments';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';

interface CommentFormProps {
  threadId: string;
  parentId?: string;
  onSubmitted?: () => void;
  onCancel?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  compact?: boolean;
}

/**
 * CommentForm — Inline form for posting a new comment or reply.
 *
 * Used both at the bottom of a thread and as an inline reply form
 * when the user clicks "Reply" on a comment.
 */
export function CommentForm({
  threadId,
  parentId,
  onSubmitted,
  onCancel,
  placeholder = 'What are your thoughts?',
  autoFocus = false,
  compact = false,
}: CommentFormProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { createComment } = useCommentActions();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await createComment({
        threadId,
        content: content.trim(),
        parentId,
      });
      setContent('');
      onSubmitted?.();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to post comment'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center py-4">
        <Spinner size="md" className="text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="rounded-lg border bg-card p-4 text-center">
        <p className="text-sm text-muted-foreground mb-2">
          Sign in to join the conversation
        </p>
        <Button asChild size="sm">
          <Link href={`/auth/signin?returnTo=${encodeURIComponent(`/t/${threadId}`)}`}>
            Sign In
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        rows={compact ? 3 : 5}
        autoFocus={autoFocus}
        className="w-full rounded-md border bg-background px-3 py-2 text-sm resize-y min-h-[80px] focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground"
        disabled={isSubmitting}
      />

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {content.length} / 10,000
        </span>
        <div className="flex items-center gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting || !content.trim()}
          >
            {isSubmitting ? (
              <>
                <Spinner size="xs" className="mr-1" />
                Posting...
              </>
            ) : (
              'Comment'
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
