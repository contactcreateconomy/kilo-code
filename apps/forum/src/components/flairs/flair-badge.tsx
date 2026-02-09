'use client';

import { cn } from '@createconomy/ui';

interface FlairBadgeProps {
  flair: {
    displayName: string;
    backgroundColor: string;
    textColor: string;
    emoji?: string | null;
  };
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * FlairBadge — Colored badge for post flairs.
 * Renders inline with custom background/text colors.
 */
export function FlairBadge({ flair, size = 'sm', className }: FlairBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded font-medium whitespace-nowrap',
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1',
        className
      )}
      style={{
        backgroundColor: flair.backgroundColor,
        color: flair.textColor,
      }}
    >
      {flair.emoji && <span className="mr-1">{flair.emoji}</span>}
      {flair.displayName}
    </span>
  );
}
