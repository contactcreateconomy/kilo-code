'use client';

import Link from 'next/link';
import { Hash } from 'lucide-react';
import { cn } from '@createconomy/ui';
import { usePopularTags } from '@/hooks/use-tags';

interface PopularTagsWidgetProps {
  limit?: number;
  className?: string;
}

/**
 * PopularTagsWidget — Sidebar widget showing popular/trending tags.
 */
export function PopularTagsWidget({ limit = 10, className }: PopularTagsWidgetProps) {
  const { tags, isLoading } = usePopularTags(limit);

  if (isLoading || tags.length === 0) return null;

  return (
    <div className={cn('rounded-lg border bg-card p-4', className)}>
      <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
        <Hash className="h-4 w-4 text-primary" />
        Popular Tags
      </h3>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Link
            key={tag._id}
            href={`/search?tag=${tag.slug}`}
            className={cn(
              'inline-flex items-center gap-1 rounded-full border px-2.5 py-1',
              'text-xs font-medium text-muted-foreground',
              'hover:bg-accent hover:text-foreground transition-colors'
            )}
          >
            #{tag.displayName}
            <span className="text-[10px] text-muted-foreground/70">
              {tag.usageCount}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
