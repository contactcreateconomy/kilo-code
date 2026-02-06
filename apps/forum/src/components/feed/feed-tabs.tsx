'use client';

import { Flame, Clock, TrendingUp, Heart } from 'lucide-react';
import { cn, Button } from '@createconomy/ui';
import type { FeedTabType } from '@/types/forum';

interface FeedTabsProps {
  activeTab: FeedTabType;
  onTabChange: (tab: FeedTabType) => void;
}

const tabs: { id: FeedTabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'top', label: 'Top', icon: TrendingUp },
  { id: 'hot', label: 'Hot', icon: Flame },
  { id: 'new', label: 'New', icon: Clock },
  { id: 'fav', label: 'Fav', icon: Heart },
];

/**
 * FeedTabs - Tab switcher for feed filtering (Hot/New/Top)
 */
export function FeedTabs({ activeTab, onTabChange }: FeedTabsProps) {
  return (
    <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <Button
            key={tab.id}
            variant={isActive ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'flex-1 gap-2',
              isActive
                ? 'bg-card text-foreground shadow-sm hover:bg-card'
                : 'text-muted-foreground hover:text-foreground hover:bg-transparent'
            )}
          >
            <Icon
              className={cn(
                'h-4 w-4 transition-all duration-300',
                isActive && 'text-primary'
              )}
            />
            {tab.label}
          </Button>
        );
      })}
    </div>
  );
}

export default FeedTabs;
