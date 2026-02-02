'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { FeedTabType } from '@/types/forum';

interface FeedTabsProps {
  activeTab: FeedTabType;
  onTabChange: (tab: FeedTabType) => void;
}

const tabs: { id: FeedTabType; label: string; icon: string }[] = [
  { id: 'top', label: 'Top', icon: '🏆' },
  { id: 'hot', label: 'Hot', icon: '🔥' },
  { id: 'new', label: 'New', icon: '🆕' },
  { id: 'fav', label: 'Favorites', icon: '⭐' },
];

/**
 * FeedTabs - Animated tab switcher for feed filtering
 */
export function FeedTabs({ activeTab, onTabChange }: FeedTabsProps) {
  return (
    <div className="flex items-center gap-2 p-1 bg-muted/50 rounded-xl">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            'relative px-4 py-2 text-sm font-medium rounded-lg transition-colors',
            activeTab === tab.id
              ? 'text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {activeTab === tab.id && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-primary rounded-lg shadow-glow-sm"
              transition={{ type: 'spring', duration: 0.5 }}
            />
          )}
          <span className="relative flex items-center gap-2">
            <span>{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
