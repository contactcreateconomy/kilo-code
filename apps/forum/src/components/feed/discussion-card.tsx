'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowBigUp, ArrowBigDown, MessageCircle, Bookmark, MoreVertical, Share2, Flag, EyeOff } from 'lucide-react';
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
import { CommentsPreviewCycler } from './comments-preview-cycler';
import type { CommentPreviewItem } from './comments-preview-cycler';
import type { Discussion } from '@/types/forum';

interface DiscussionCardProps {
  discussion: Discussion;
  index?: number;
  commentsPreview?: CommentPreviewItem[];
  onHide?: (discussionId: string) => void;
  onReport?: (discussionId: string) => void;
}

function formatScore(score: number): string {
  if (score >= 10000) return `${(score / 1000).toFixed(0)}k`;
  if (score >= 1000) return `${(score / 1000).toFixed(1)}k`;
  return score.toString();
}

export function DiscussionCard({
  discussion,
  index = 0,
  commentsPreview = [],
  onHide,
  onReport,
}: DiscussionCardProps) {
  const { requireAuth } = useAuthAction();
  const { hasUpvote, hasDownvote, hasReaction, toggle } = useReactions('thread', [discussion.id]);

  const isUpvoted = hasUpvote(discussion.id);
  const isDownvoted = hasDownvote(discussion.id);
  const isBookmarked = hasReaction(discussion.id, 'bookmark');

  const [isHovered, setIsHovered] = useState(false);

  const handleUpvote = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    requireAuth(async () => {
      await toggle(discussion.id, 'upvote');
    });
  };

  const handleDownvote = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    requireAuth(async () => {
      await toggle(discussion.id, 'downvote');
    });
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    requireAuth(async () => {
      await toggle(discussion.id, 'bookmark');
    });
  };

  const handleReport = () => {
    if (!onReport) return;
    requireAuth(() => {
      onReport(discussion.id);
    });
  };

  const handleHide = () => {
    if (!onHide) return;
    requireAuth(() => {
      onHide(discussion.id);
    });
  };

  const handleShare = async () => {
    if (typeof window === 'undefined') return;
    const shareUrl = `${window.location.origin}/t/${discussion.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: discussion.title,
          text: discussion.aiSummary || discussion.title,
          url: shareUrl,
        });
        return;
      } catch {
        // fallback to clipboard
      }
    }

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareUrl);
    }
  };

  const score = discussion.score ?? discussion.upvotes ?? 0;
  const timeAgo = getTimeAgo(discussion.createdAt);

  return (
    <Link href={`/t/${discussion.id}`}>
      <article
        className="group overflow-hidden rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:-translate-y-[2px] hover:border-primary/40"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ animation: `fadeInUp 0.4s ease-out ${index * 80}ms both` }}
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <Avatar className="h-8 w-8">
              <AvatarImage src={discussion.author.avatarUrl} alt={discussion.author.name} />
              <AvatarFallback>{discussion.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{discussion.author.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                @{discussion.author.username} · {timeAgo}
              </p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => void handleShare()}>
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleReport}>
                <Flag className="mr-2 h-4 w-4" />
                Report
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleHide}>
                <EyeOff className="mr-2 h-4 w-4" />
                Not interested
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <h3 className="line-clamp-2 text-xl font-bold leading-snug text-foreground">{discussion.title}</h3>
        {discussion.aiSummary ? (
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{discussion.aiSummary}</p>
        ) : null}

        <div className="mt-4">
          <CommentsPreviewCycler comments={commentsPreview} isActive={isHovered} />
        </div>

        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={handleUpvote}
            className={cn('rounded-md p-1 transition-colors hover:bg-upvote/10', isUpvoted && 'text-upvote')}
            aria-label="Upvote"
          >
            <ArrowBigUp className={cn('h-6 w-6', isUpvoted && 'fill-current')} />
          </button>

          <span
            className={cn(
              'min-w-10 text-center text-sm font-bold tabular-nums',
              isUpvoted && 'text-upvote',
              isDownvoted && 'text-downvote',
              !isUpvoted && !isDownvoted && 'text-muted-foreground'
            )}
          >
            {formatScore(score)}
          </span>

          <button
            onClick={handleDownvote}
            className={cn('rounded-md p-1 transition-colors hover:bg-downvote/10', isDownvoted && 'text-downvote')}
            aria-label="Downvote"
          >
            <ArrowBigDown className={cn('h-6 w-6', isDownvoted && 'fill-current')} />
          </button>

          <Button variant="ghost" size="sm" className="ml-2 gap-1.5">
            <MessageCircle className="h-4 w-4" />
            <span>{discussion.comments}</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleBookmark}
            className={cn('ml-auto h-8 w-8', isBookmarked && 'text-primary')}
          >
            <Bookmark className={cn('h-5 w-5', isBookmarked && 'fill-primary')} />
          </Button>
        </div>
      </article>
    </Link>
  );
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(date).toLocaleDateString();
}

export default DiscussionCard;
