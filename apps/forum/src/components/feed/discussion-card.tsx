'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowBigUp, ArrowBigDown, MessageCircle, Bookmark, Sparkles, MoreVertical, Share2, Flag, EyeOff, Link2, Images, BarChart } from 'lucide-react';
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
import { LinkPreviewCard } from '@/components/post-types/link-preview-card';
import { ImageGalleryPreview } from '@/components/post-types/image-gallery-preview';
import { PollPreview } from '@/components/post-types/poll-widget';
import { EmbedRenderer } from '@/components/embeds';
import { FlairBadge } from '@/components/flairs';
import { TagList } from '@/components/tags';
import { ReportDialog } from '@/components/moderation/report-dialog';
import type { Discussion } from '@/types/forum';

interface DiscussionCardProps {
  discussion: Discussion;
  index?: number;
}

// Category color mapping
const categoryColors: Record<string, string> = {
  'Programming': 'bg-blue-500 text-white hover:bg-blue-600',
  'Design': 'bg-pink-500 text-white hover:bg-pink-600',
  'Startups': 'bg-orange-500 text-white hover:bg-orange-600',
  'AI & ML': 'bg-violet-500 text-white hover:bg-violet-600',
  'Gaming': 'bg-green-500 text-white hover:bg-green-600',
  'Learning': 'bg-cyan-500 text-white hover:bg-cyan-600',
};

/**
 * Format a score number for display (e.g. 1200 → "1.2k", 15000 → "15k")
 */
function formatScore(score: number): string {
  if (score >= 10000) return `${(score / 1000).toFixed(0)}k`;
  if (score >= 1000) return `${(score / 1000).toFixed(1)}k`;
  return score.toString();
}

/**
 * DiscussionCard - Redesigned discussion card matching reference design
 * Features: AI summary, colored category badge, hover glow effect, three-dot menu
 *
 * Upvote, downvote, and bookmark actions are persisted to Convex via useReactions.
 * Shows net score (upvotes − downvotes) with Reddit-style orange/blue coloring.
 */
export function DiscussionCard({ discussion, index = 0 }: DiscussionCardProps) {
  const { requireAuth } = useAuthAction();
  const { hasUpvote, hasDownvote, hasReaction, toggle } = useReactions('thread', [discussion.id]);
  const isUpvoted = hasUpvote(discussion.id);
  const isDownvoted = hasDownvote(discussion.id);
  const isBookmarked = hasReaction(discussion.id, 'bookmark');

  const [isHovered, setIsHovered] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const cardRef = useRef<HTMLElement>(null);

  // Track mouse position for glow effect
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mouse-x', `${x}%`);
      card.style.setProperty('--mouse-y', `${y}%`);
    };

    card.addEventListener('mousemove', handleMouseMove);
    return () => card.removeEventListener('mousemove', handleMouseMove);
  }, []);

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

  const timeAgo = getTimeAgo(discussion.createdAt);
  const score = discussion.score ?? discussion.upvotes ?? 0;

  return (
    <Link href={`/t/${discussion.id}`}>
      <article
        ref={cardRef}
        className={cn(
          'group relative overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-all duration-300',
          isHovered && 'border-primary/30 shadow-md'
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          animation: `fadeInUp 0.5s ease-out ${index * 100}ms both`,
        }}
      >
        <div className="flex">
          {/* Voting column — Reddit-style vertical layout */}
          <div className="flex flex-col items-center gap-0.5 px-2 py-4 bg-muted/30">
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
                  'h-6 w-6 transition-transform duration-200',
                  isUpvoted && 'fill-current scale-110'
                )}
              />
            </button>

            <span
              className={cn(
                'text-sm font-bold tabular-nums select-none',
                isUpvoted && 'text-orange-500',
                isDownvoted && 'text-blue-500',
                !isUpvoted && !isDownvoted && 'text-muted-foreground'
              )}
            >
              {formatScore(score)}
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
                  'h-6 w-6 transition-transform duration-200',
                  isDownvoted && 'fill-current scale-110'
                )}
              />
            </button>
          </div>

          {/* Card content */}
          <div className="flex-1 p-4 pl-3">
            {/* Header with Author info and Three-dot menu */}
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8 ring-2 ring-border">
                  <AvatarImage
                    src={discussion.author.avatarUrl}
                    alt={discussion.author.name}
                  />
                  <AvatarFallback>{discussion.author.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">{discussion.author.name}</span>
                  <span className="text-xs text-muted-foreground">@{discussion.author.username} · {timeAgo}</span>
                </div>
              </div>
              
              {/* Three-dot menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    requireAuth(() => {
                      setShowReportDialog(true);
                    });
                  }}>
                    <Flag className="h-4 w-4 mr-2" />
                    Report
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    requireAuth(() => {
                      // TODO: implement not interested
                    });
                  }}>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Not interested
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Title with post type badge */}
            <div className="mb-2 flex items-start gap-2">
              {discussion.flair && (
                <FlairBadge flair={discussion.flair} className="shrink-0 mt-1" />
              )}
              {discussion.postType && discussion.postType !== 'text' && (
                <span
                  className={cn(
                    'inline-flex items-center gap-1 shrink-0 mt-1 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase',
                    discussion.postType === 'link' && 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                    discussion.postType === 'image' && 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                    discussion.postType === 'poll' && 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                  )}
                >
                  {discussion.postType === 'link' && <Link2 className="h-3 w-3" />}
                  {discussion.postType === 'image' && <Images className="h-3 w-3" />}
                  {discussion.postType === 'poll' && <BarChart className="h-3 w-3" />}
                  {discussion.postType}
                </span>
              )}
              <h3 className="line-clamp-2 text-lg font-bold text-foreground transition-colors duration-200 group-hover:text-primary">
                {discussion.title}
              </h3>
            </div>

            {/* Tags */}
            {discussion.tags && discussion.tags.length > 0 && (
              <div className="mb-2" onClick={(e) => e.stopPropagation()}>
                <TagList tags={discussion.tags} size="sm" />
              </div>
            )}

            {/* AI Summary */}
            {discussion.aiSummary && (
              <div className="mb-4 flex items-start gap-2 rounded-lg bg-muted/50 p-3">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p className="line-clamp-2 text-sm text-muted-foreground">{discussion.aiSummary}</p>
              </div>
            )}

            {/* Post type content */}
            {discussion.postType === 'link' && discussion.linkUrl && (
              <div className="mb-4" onClick={(e) => e.stopPropagation()}>
                <EmbedRenderer
                  url={discussion.linkUrl}
                  title={discussion.linkTitle}
                  description={discussion.linkDescription}
                  image={discussion.linkImage}
                  domain={discussion.linkDomain}
                />
              </div>
            )}

            {discussion.postType === 'image' && discussion.images && discussion.images.length > 0 && (
              <div className="mb-4">
                <ImageGalleryPreview images={discussion.images} compact />
              </div>
            )}

            {discussion.postType === 'poll' && discussion.pollOptions && (
              <div className="mb-4">
                <PollPreview
                  options={discussion.pollOptions}
                  endsAt={discussion.pollEndsAt}
                />
              </div>
            )}

            {/* Preview Image (for text posts or when imageUrl exists) */}
            {(!discussion.postType || discussion.postType === 'text') && discussion.imageUrl && (
              <div className="mb-4 overflow-hidden rounded-lg">
                <Image
                  src={discussion.imageUrl}
                  alt=""
                  width={600}
                  height={338}
                  className="aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Comments */}
              <Button variant="ghost" size="sm" className="gap-1.5">
                <MessageCircle className="h-4 w-4" />
                <span>{discussion.comments}</span>
              </Button>

              {/* Bookmark */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBookmark}
                className={cn(
                  'ml-auto h-8 w-8',
                  isBookmarked && 'text-primary'
                )}
              >
                <Bookmark
                  className={cn(
                    'h-5 w-5 transition-all duration-300',
                    isBookmarked && 'fill-primary scale-110'
                  )}
                />
              </Button>
            </div>
          </div>
        </div>

        {/* Hover glow effect */}
        <div
          className={cn(
            'pointer-events-none absolute inset-0 rounded-lg transition-opacity duration-500',
            isHovered ? 'opacity-100' : 'opacity-0'
          )}
          style={{
            background:
              'radial-gradient(800px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(99, 102, 241, 0.06), transparent 40%)',
          }}
        />
      </article>

      {/* Report dialog */}
      <ReportDialog
        targetType="thread"
        targetId={discussion.id}
        isOpen={showReportDialog}
        onClose={() => setShowReportDialog(false)}
      />
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
