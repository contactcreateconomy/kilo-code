'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { GlowCard } from '@/components/ui/glow-card';
import { mockLeaderboard } from '@/data/mock-data';
import type { LeaderboardEntry } from '@/types/forum';

interface LeaderboardWidgetProps {
  entries?: LeaderboardEntry[];
  maxEntries?: number;
}

/**
 * LeaderboardWidget - Weekly top creators with rank badges
 */
export function LeaderboardWidget({
  entries = mockLeaderboard,
  maxEntries = 5,
}: LeaderboardWidgetProps) {
  const displayEntries = entries.slice(0, maxEntries);

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return { emoji: '🥇', color: 'text-yellow-500', bg: 'bg-yellow-500/10' };
      case 2:
        return { emoji: '🥈', color: 'text-gray-400', bg: 'bg-gray-400/10' };
      case 3:
        return { emoji: '🥉', color: 'text-amber-600', bg: 'bg-amber-600/10' };
      default:
        return { emoji: `#${rank}`, color: 'text-muted-foreground', bg: 'bg-muted' };
    }
  };

  const getTrendIcon = (trend: LeaderboardEntry['trend']) => {
    switch (trend) {
      case 'up':
        return <span className="text-green-500 text-xs">↑</span>;
      case 'down':
        return <span className="text-red-500 text-xs">↓</span>;
      case 'stable':
        return <span className="text-muted-foreground text-xs">→</span>;
    }
  };

  return (
    <GlowCard>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <span>🏆</span>
          <span>Weekly Top Creators</span>
        </h3>
      </div>

      {/* Leaderboard List */}
      <div className="space-y-3">
        {displayEntries.map((entry, index) => {
          const badge = getRankBadge(entry.rank);

          return (
            <motion.a
              key={entry.user.id}
              href={`/u/${entry.user.username}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
            >
              {/* Rank Badge */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${badge.bg} ${badge.color}`}
              >
                {entry.rank <= 3 ? badge.emoji : entry.rank}
              </div>

              {/* Avatar */}
              <Image
                src={entry.user.avatarUrl}
                alt={entry.user.name}
                width={40}
                height={40}
                className="rounded-full ring-2 ring-transparent group-hover:ring-primary/50 transition-all"
              />

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="font-medium text-sm truncate">
                    {entry.user.name}
                  </span>
                  {getTrendIcon(entry.trend)}
                </div>
                <span className="text-xs text-muted-foreground">
                  @{entry.user.username}
                </span>
              </div>

              {/* Points */}
              <div className="text-right">
                <div className="font-semibold text-sm text-primary">
                  {entry.points.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">points</div>
              </div>
            </motion.a>
          );
        })}
      </div>

      {/* Mini Trend Chart (simplified visual) */}
      <div className="mt-4 pt-4 border-t">
        <div className="flex items-end justify-between h-8 gap-1">
          {[40, 65, 45, 80, 55, 90, 70].map((height, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${height}%` }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className="flex-1 bg-primary/20 rounded-t hover:bg-primary/40 transition-colors"
            />
          ))}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>Mon</span>
          <span>Sun</span>
        </div>
      </div>

      {/* View Full Link */}
      <a
        href="/leaderboard"
        className="block text-center text-sm text-primary hover:underline mt-4"
      >
        View Full Leaderboard →
      </a>
    </GlowCard>
  );
}
