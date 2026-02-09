'use client';

import { useState } from 'react';
import { Tag } from 'lucide-react';
import { cn, Button } from '@createconomy/ui';
import { useCategoryFlairs } from '@/hooks/use-flairs';
import { FlairBadge } from './flair-badge';

interface FlairSelectorProps {
  categoryId: string | undefined;
  value?: string;
  onChange: (flairId: string | undefined) => void;
  className?: string;
}

/**
 * FlairSelector — Dropdown to pick a post flair from a category's available flairs.
 */
export function FlairSelector({
  categoryId,
  value,
  onChange,
  className,
}: FlairSelectorProps) {
  const { flairs, isLoading } = useCategoryFlairs(categoryId);
  const [open, setOpen] = useState(false);

  const selectedFlair = flairs.find((f) => f._id === value);

  if (!categoryId || (flairs.length === 0 && !isLoading)) return null;

  return (
    <div className={cn('relative', className)}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(!open)}
        className="justify-start gap-2"
      >
        <Tag className="h-3.5 w-3.5" />
        {selectedFlair ? (
          <FlairBadge flair={selectedFlair} />
        ) : (
          <span className="text-muted-foreground">Add flair</span>
        )}
      </Button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-popover border rounded-lg shadow-lg z-50 overflow-hidden">
          {/* None option */}
          <button
            type="button"
            onClick={() => {
              onChange(undefined);
              setOpen(false);
            }}
            className={cn(
              'w-full px-3 py-2 text-left text-sm hover:bg-accent',
              !value && 'bg-accent'
            )}
          >
            <span className="text-muted-foreground">No flair</span>
          </button>

          {/* Flair options */}
          {flairs.map((flair) => (
            <button
              key={flair._id}
              type="button"
              onClick={() => {
                onChange(flair._id);
                setOpen(false);
              }}
              className={cn(
                'w-full px-3 py-2 text-left hover:bg-accent flex items-center gap-2',
                value === flair._id && 'bg-accent'
              )}
            >
              <FlairBadge flair={flair} />
              {flair.isModOnly && (
                <span className="text-xs text-muted-foreground ml-auto">
                  Mod only
                </span>
              )}
            </button>
          ))}

          {isLoading && (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              Loading...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
