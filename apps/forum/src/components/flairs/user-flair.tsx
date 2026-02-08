'use client';

import { cn } from '@createconomy/ui';
import { useUserFlair } from '@/hooks/use-flairs';

interface UserFlairProps {
  userId: string;
  categoryId?: string;
  className?: string;
}

/**
 * UserFlair — Displays a user's flair badge next to their name.
 * Checks category-specific first, falls back to global flair.
 */
export function UserFlair({ userId, categoryId, className }: UserFlairProps) {
  const { flair, isLoading } = useUserFlair(userId, categoryId);

  if (!flair || isLoading) return null;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium',
        className
      )}
      style={{
        backgroundColor: flair.backgroundColor ?? '#e5e7eb',
        color: flair.textColor ?? '#374151',
      }}
    >
      {flair.emoji && <span className="mr-1">{flair.emoji}</span>}
      {flair.text}
    </span>
  );
}
