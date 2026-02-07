'use client';

import { useState } from 'react';
import { ChevronDown, Check, Loader2 } from 'lucide-react';
import { cn, Button } from '@createconomy/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@createconomy/ui';
import { useCategories } from '@/hooks/use-forum';

interface CommunityDropdownProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

/**
 * CommunityDropdown - Dropdown to select a community for the discussion
 * Populated with real categories from Convex via useCategories hook.
 */
export function CommunityDropdown({ value, onChange, className }: CommunityDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { categories, isLoading } = useCategories();

  // Map categories to items with emoji fallback
  const communityItems = (categories as Array<{
    _id: string;
    slug: string;
    name: string;
    icon?: string;
  }>).map((cat) => ({
    id: cat._id,
    slug: cat.slug,
    label: cat.name,
    emoji: cat.icon ?? '💬',
  }));

  const selectedCommunity = communityItems.find(item => item.slug === value);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-auto min-w-[200px] justify-between gap-2 bg-secondary hover:bg-secondary/80 border-border',
            className
          )}
        >
          <div className="flex items-center gap-2">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : selectedCommunity ? (
              <>
                <span className="text-base">{selectedCommunity.emoji}</span>
                <span className="font-medium">{selectedCommunity.label}</span>
              </>
            ) : (
              <>
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted">
                  <span className="text-xs font-bold text-muted-foreground">C</span>
                </div>
                <span className="text-muted-foreground">Select a community</span>
              </>
            )}
          </div>
          <ChevronDown className={cn(
            'h-4 w-4 text-muted-foreground transition-transform duration-200',
            isOpen && 'rotate-180'
          )} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="start" 
        className="w-[250px] bg-card border-border"
        sideOffset={4}
      >
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : communityItems.length === 0 ? (
          <div className="px-3 py-2 text-sm text-muted-foreground">
            No communities available
          </div>
        ) : (
          communityItems.map((item) => (
            <DropdownMenuItem
              key={item.slug}
              onClick={() => {
                onChange(item.slug);
                setIsOpen(false);
              }}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 cursor-pointer',
                value === item.slug && 'bg-primary/10'
              )}
            >
              <span className="text-lg">{item.emoji}</span>
              <span className="flex-1 font-medium">{item.label}</span>
              {value === item.slug && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default CommunityDropdown;
