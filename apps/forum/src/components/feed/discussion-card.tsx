'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowBigUp, MessageCircle, Bookmark, Sparkles, MoreVertical, Share2, Flag, EyeOff } from 'lucide-react';
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
 * DiscussionCard - Redesigned discussion card matching reference design
 * Features: AI summary, colored category badge, hover glow effect, three-dot menu
 *
 * Upvote and bookmark actions are persisted to Convex via useReactions.
 */
export function DiscussionCard({ discussion, index = 0 }: DiscussionCardProps) {
  const { requireAuth } = useAuthAction();
  const { hasReaction, toggle } = useReactions('thread', [discussion.id]);
  const isUpvoted = hasReaction(discussion.id, 'upvote');
  const isBookmarked = hasReaction(discussion.id, 'bookmark');

  const [isHovered, setIsHovered] = useState(false);
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

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    requireAuth(async () => {
      await toggle(discussion.id, 'bookmark');
    });
  };

  const timeAgo = getTimeAgo(discussion.createdAt);

  return (
    <Link href={`/t/${discussion.id}`}>
      <article
        ref={cardRef}
        className={cn(
          'group relative overflow-hidden rounded-lg border border-border bg-card p-4 shadow-sm transition-all duration-300',
          isHovered && 'border-primary/30 shadow-md'
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          animation: `fadeInUp 0.5s ease-out ${index * 100}ms both`,
        }}
      >
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
                  // TODO: implement report
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

        {/* Title */}
        <h3 className="mb-2 line-clamp-2 text-lg font-bold text-foreground transition-colors duration-200 group-hover:text-primary">
          {discussion.title}
        </h3>

        {/* AI Summary */}
        {discussion.aiSummary && (
          <div className="mb-4 flex items-start gap-2 rounded-lg bg-muted/50 p-3">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p className="line-clamp-2 text-sm text-muted-foreground">{discussion.aiSummary}</p>
          </div>
        )}

        {/* Preview Image */}
        {discussion.imageUrl && (
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
          {/* Upvote */}
          <Button
            variant={isUpvoted ? 'default' : 'ghost'}
            size="sm"
            onClick={handleUpvote}
            className={cn(
              'gap-1.5',
              isUpvoted && 'bg-primary/10 text-primary hover:bg-primary/20'
            )}
          >
            <ArrowBigUp
              className={cn(
                'h-5 w-5 transition-transform duration-300',
                isUpvoted && 'fill-primary scale-110'
              )}
            />
            <span className={cn('transition-all duration-200', isUpvoted && 'font-bold')}>
              {discussion.upvotes}
            </span>
          </Button>

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
