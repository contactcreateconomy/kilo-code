'use client';

import { cn } from '@/lib/utils';
import type { User } from '@/types/forum';

interface AvatarStackProps {
  users: User[];
  max?: number;
  size?: 'sm' | 'md';
}

/**
 * AvatarStack - Stacked user avatars with overflow indicator
 */
export function AvatarStack({ users, max = 5, size = 'sm' }: AvatarStackProps) {
  const displayUsers = users.slice(0, max);
  const remaining = users.length - max;

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
  };

  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {displayUsers.map((user, index) => (
          <img
            key={user.id}
            src={user.avatarUrl}
            alt={user.name}
            className={cn(
              'rounded-full border-2 border-background',
              sizeClasses[size]
            )}
            style={{ zIndex: displayUsers.length - index }}
            title={user.name}
          />
        ))}
        {remaining > 0 && (
          <div
            className={cn(
              'rounded-full border-2 border-background bg-muted flex items-center justify-center font-medium text-muted-foreground',
              sizeClasses[size]
            )}
            style={{ zIndex: 0 }}
          >
            +{remaining}
          </div>
        )}
      </div>
    </div>
  );
}
