'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { GlowCard } from '@/components/ui/glow-card';
import { AvatarStack } from './avatar-stack';
import { cn } from '@/lib/utils';
import type { Discussion } from '@/types/forum';

interface DiscussionCardProps {
  discussion: Discussion;
}

/**
 * DiscussionCard - Individual discussion post card with interactions
 */
export function DiscussionCard({ discussion }: DiscussionCardProps) {
  const [upvoted, setUpvoted] = useState(false);
  const [upvotes, setUpvotes] = useState(discussion.upvotes);
  const [bookmarked, setBookmarked] = useState(false);

  const handleUpvote = (e: React.MouseEvent) => {
    e.preventDefault();
    setUpvoted(!upvoted);
    setUpvotes(upvoted ? upvotes - 1 : upvotes + 1);
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    setBookmarked(!bookmarked);
  };

  const timeAgo = getTimeAgo(discussion.createdAt);

  return (
    <Link href={`/t/${discussion.id}`}>
      <GlowCard className="group">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <Image
            src={discussion.author.avatarUrl}
            alt={discussion.author.name}
            width={40}
            height={40}
            className="rounded-full"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm">{discussion.author.name}</span>
              <span className="text-muted-foreground text-sm">@{discussion.author.username}</span>
              <span className="text-muted-foreground text-sm">·</span>
              <span className="text-muted-foreground text-sm">{timeAgo}</span>
            </div>
          </div>
          <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full shrink-0">
            {discussion.category.icon} {discussion.category.name}
          </span>
        </div>

        {/* Content */}
        <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {discussion.title}
        </h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {discussion.summary}
        </p>

        {/* Optional Image */}
        {discussion.imageUrl && (
          <div className="mb-3 rounded-lg overflow-hidden relative h-48">
            <Image
              src={discussion.imageUrl}
              alt=""
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-4">
            {/* Upvote */}
            <motion.button
              onClick={handleUpvote}
              className={cn(
                'flex items-center gap-1 text-sm transition-colors',
                upvoted ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
              whileTap={{ scale: 1.2 }}
            >
              <motion.span
                animate={upvoted ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                ↑
              </motion.span>
              <span>{upvotes}</span>
            </motion.button>

            {/* Comments */}
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              💬 {discussion.comments}
            </span>

            {/* Participants */}
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">👥</span>
              <AvatarStack users={discussion.participants} max={4} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Bookmark */}
            <motion.button
              onClick={handleBookmark}
              className={cn(
                'p-1 rounded transition-colors',
                bookmarked ? 'text-yellow-500' : 'text-muted-foreground hover:text-foreground'
              )}
              whileTap={{ scale: 1.2 }}
            >
              {bookmarked ? '★' : '☆'}
            </motion.button>

            {/* More Options */}
            <button className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors">
              ⋮
            </button>
          </div>
        </div>
      </GlowCard>
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
