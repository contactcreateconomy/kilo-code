'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowBigUp,
  ArrowBigDown,
  MessageSquare,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  Pencil,
  Trash2,
  Flag,
} from 'lucide-react';
import {
  cn,
  Button,
  Avatar,
  AvatarImage,
  AvatarFallback,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@createconomy/ui';
import { useReactions } from '@/hooks/use-reactions';
import { useAuthAction } from '@/hooks/use-auth-action';
import { CommentForm } from './comment-form';
import { ReportDialog } from '@/components/moderation/report-dialog';

export interface CommentData {
  _id: string;
  threadId: string;
  parentId: string | null;
  content: string;
  depth: number;
  upvoteCount: number;
  downvoteCount: number;
  score: number;
  replyCount: number;
  isCollapsed: boolean;
  isDeleted: boolean;
  editedAt: number | null;
  createdAt: number;
  author: {
    id: string;
    name: string;
    username: string;
    avatarUrl: string | null;
  } | null;
  replies: CommentData[];
  moreRepliesCount: number;
  isTruncated: boolean;
}

interface CommentNodeProps {
  comment: CommentData;
  threadId: string;
  isThreadLocked?: boolean;
  onLoadMoreReplies?: (parentId: string) => void;
}

/**
 * Format a score number for compact display.
 */
function formatScore(score: number): string {
  if (score >= 10000) return `${(score / 1000).toFixed(0)}k`;
  if (score >= 1000) return `${(score / 1000).toFixed(1)}k`;
  return score.toString();
}

/**
 * Format relative time (e.g., "2h ago", "3d ago").
 */
function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 604800)}w ago`;
  return new Date(timestamp).toLocaleDateString();
}

/**
 * CommentNode — Renders a single comment with voting, reply, collapse, and nested replies.
 *
 * Recursive: each comment renders its replies as child CommentNodes.
 */
export function CommentNode({
  comment,
  threadId,
  isThreadLocked = false,
  onLoadMoreReplies,
}: CommentNodeProps) {
  const { requireAuth } = useAuthAction();
  const { hasUpvote, hasDownvote, toggle } = useReactions('comment', [
    comment._id,
  ]);
  const isUpvoted = hasUpvote(comment._id);
  const isDownvoted = hasDownvote(comment._id);

  const [isCollapsed, setIsCollapsed] = useState(comment.isCollapsed);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);

  const handleUpvote = (e: React.MouseEvent) => {
    e.preventDefault();
    requireAuth(async () => {
      await toggle(comment._id, 'upvote');
    });
  };

  const handleDownvote = (e: React.MouseEvent) => {
    e.preventDefault();
    requireAuth(async () => {
      await toggle(comment._id, 'downvote');
    });
  };

  // Indent based on depth (with max cap)
  const indentLevel = Math.min(comment.depth, 8);

  return (
    <div
      className={cn('relative', indentLevel > 0 && 'ml-4 sm:ml-6')}
    >
      {/* Thread line */}
      {indentLevel > 0 && (
        <div className="absolute left-[-12px] sm:left-[-16px] top-0 bottom-0 w-px bg-border hover:bg-primary/50 cursor-pointer transition-colors" 
          onClick={() => setIsCollapsed(!isCollapsed)}
        />
      )}

      <div className="py-2">
        {/* Comment header */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-0.5 -ml-1 text-muted-foreground hover:text-foreground"
          >
            {isCollapsed ? (
              <ChevronRight className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </button>

          {comment.author ? (
            <>
              <Avatar className="h-5 w-5">
                {comment.author.avatarUrl && (
                  <AvatarImage
                    src={comment.author.avatarUrl}
                    alt={comment.author.name}
                  />
                )}
                <AvatarFallback className="text-[10px]">
                  {comment.author.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <Link
                href={`/u/${comment.author.username}`}
                className="font-medium text-foreground hover:underline"
              >
                {comment.author.name}
              </Link>
            </>
          ) : (
            <span className="text-muted-foreground italic">[deleted]</span>
          )}

          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">
            {formatTimeAgo(comment.createdAt)}
          </span>
          {comment.editedAt && (
            <span className="text-muted-foreground italic">
              (edited)
            </span>
          )}

          {isCollapsed && (
            <span className="text-muted-foreground">
              ({comment.replyCount} {comment.replyCount === 1 ? 'reply' : 'replies'})
            </span>
          )}
        </div>

        {/* Collapsed state — hide body + actions */}
        {!isCollapsed && (
          <>
            {/* Comment body */}
            <div className="mt-1 text-sm whitespace-pre-wrap text-foreground leading-relaxed pl-6">
              {comment.content}
            </div>

            {/* Actions bar */}
            <div className="flex items-center gap-1 mt-1 pl-6">
              {/* Votes */}
              <div className="flex items-center gap-0.5">
                <button
                  onClick={handleUpvote}
                  className={cn(
                    'p-1 rounded hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors',
                    isUpvoted && 'text-orange-500'
                  )}
                  aria-label="Upvote"
                >
                  <ArrowBigUp
                    className={cn(
                      'h-4 w-4',
                      isUpvoted && 'fill-current'
                    )}
                  />
                </button>
                <span
                  className={cn(
                    'text-xs font-bold tabular-nums min-w-[20px] text-center',
                    isUpvoted && 'text-orange-500',
                    isDownvoted && 'text-blue-500',
                    !isUpvoted && !isDownvoted && 'text-muted-foreground'
                  )}
                >
                  {formatScore(comment.score)}
                </span>
                <button
                  onClick={handleDownvote}
                  className={cn(
                    'p-1 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors',
                    isDownvoted && 'text-blue-500'
                  )}
                  aria-label="Downvote"
                >
                  <ArrowBigDown
                    className={cn(
                      'h-4 w-4',
                      isDownvoted && 'fill-current'
                    )}
                  />
                </button>
              </div>

              {/* Reply button */}
              {!isThreadLocked && !comment.isDeleted && (
                <button
                  onClick={() => {
                    requireAuth(() => {
                      setShowReplyForm(!showReplyForm);
                    });
                  }}
                  className="flex items-center gap-1 px-2 py-1 rounded text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  Reply
                </button>
              )}

              {/* More actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1 rounded text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-40">
                  <DropdownMenuItem onClick={() => {
                    requireAuth(() => setShowReportDialog(true));
                  }}>
                    <Flag className="h-3.5 w-3.5 mr-2" />
                    Report
                  </DropdownMenuItem>
                  {/* TODO: Show edit/delete only for author or mod */}
                  <DropdownMenuItem>
                    <Pencil className="h-3.5 w-3.5 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Inline reply form */}
            {showReplyForm && (
              <div className="mt-2 pl-6">
                <CommentForm
                  threadId={threadId}
                  parentId={comment._id}
                  compact
                  autoFocus
                  placeholder={`Reply to ${comment.author?.name ?? 'comment'}...`}
                  onSubmitted={() => setShowReplyForm(false)}
                  onCancel={() => setShowReplyForm(false)}
                />
              </div>
            )}

            {/* Nested replies */}
            {comment.replies.length > 0 && (
              <div className="mt-1">
                {comment.replies.map((reply) => (
                  <CommentNode
                    key={reply._id}
                    comment={reply}
                    threadId={threadId}
                    isThreadLocked={isThreadLocked}
                    onLoadMoreReplies={onLoadMoreReplies}
                  />
                ))}
              </div>
            )}

            {/* Load more replies */}
            {comment.moreRepliesCount > 0 && (
              <button
                onClick={() => onLoadMoreReplies?.(comment._id)}
                className="mt-1 ml-6 text-xs text-primary hover:underline"
              >
                Load {comment.moreRepliesCount} more{' '}
                {comment.moreRepliesCount === 1 ? 'reply' : 'replies'}
              </button>
            )}

            {/* Continue thread link */}
            {comment.isTruncated && comment.replyCount > 0 && (
              <Link
                href={`/t/${threadId}?comment=${comment._id}`}
                className="mt-1 ml-6 text-xs text-primary hover:underline inline-block"
              >
                Continue this thread →
              </Link>
            )}
          </>
        )}
      </div>

      {/* Report dialog */}
      <ReportDialog
        targetType="comment"
        targetId={comment._id}
        isOpen={showReportDialog}
        onClose={() => setShowReportDialog(false)}
      />
    </div>
  );
}
