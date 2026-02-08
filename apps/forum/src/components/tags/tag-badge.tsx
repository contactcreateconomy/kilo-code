'use client';

import Link from 'next/link';
import { cn } from '@createconomy/ui';

interface TagBadgeProps {
  name: string;
  displayName?: string;
  color?: string;
  linked?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * TagBadge — Displays a single tag as a clickable badge.
 */
export function TagBadge({
  name,
  displayName,
  color,
  linked = true,
  size = 'sm',
  className,
}: TagBadgeProps) {
  const label = displayName ?? name;
  const slug = name.replace(/\s+/g, '-').toLowerCase();

  const badge = (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium transition-colors',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
        color
          ? ''
          : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground',
        className
      )}
      style={
        color
          ? {
              backgroundColor: `${color}20`,
              color: color,
              borderColor: `${color}40`,
            }
          : undefined
      }
    >
      #{label}
    </span>
  );

  if (linked) {
    return (
      <Link href={`/search?tag=${slug}`} className="no-underline">
        {badge}
      </Link>
    );
  }

  return badge;
}

interface TagListProps {
  tags: Array<{
    _id: string;
    name: string;
    displayName?: string;
    color?: string | null;
  }>;
  linked?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * TagList — Renders a row of tag badges.
 */
export function TagList({ tags, linked = true, size = 'sm', className }: TagListProps) {
  if (!tags || tags.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
      {tags.map((tag) => (
        <TagBadge
          key={tag._id}
          name={tag.name}
          displayName={tag.displayName}
          color={tag.color ?? undefined}
          linked={linked}
          size={size}
        />
      ))}
    </div>
  );
}
