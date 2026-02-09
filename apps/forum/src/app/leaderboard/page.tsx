'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from 'convex/react';
import { api } from '@createconomy/convex';
import { Spinner } from '@createconomy/ui';
import { Trophy, Medal, Crown } from 'lucide-react';

type Period = 'weekly' | 'monthly' | 'allTime';

const PERIOD_LABELS: Record<Period, string> = {
  weekly: 'This Week',
  monthly: 'This Month',
  allTime: 'All Time',
};

/**
 * LeaderboardPage — Full leaderboard page showing top users by points.
 *
 * Fetches data from the `getLeaderboard` query with period tabs
 * (weekly, monthly, allTime). Displays user rank, avatar, name, and points.
 */
export default function LeaderboardPage() {
  const [period, setPeriod] = useState<Period>('weekly');

  const leaderboard = useQuery(api.functions.forum.getLeaderboard, {
    limit: 50,
    period,
  });

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
    return <span className="text-sm font-bold text-muted-foreground w-5 text-center">{rank}</span>;
  };

  const getRankBg = (rank: number) => {
    if (rank === 1) return 'bg-yellow-500/5 border-yellow-500/20';
    if (rank === 2) return 'bg-gray-500/5 border-gray-500/20';
    if (rank === 3) return 'bg-amber-500/5 border-amber-500/20';
    return '';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground">
          Forum
        </Link>
        <span className="mx-2">/</span>
        <span>Leaderboard</span>
      </nav>

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Trophy className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
          <p className="text-muted-foreground">
            Top community members ranked by contribution points
          </p>
        </div>
      </div>

      {/* Period Tabs */}
      <div className="border-b mb-6">
        <nav className="flex gap-1">
          {(Object.entries(PERIOD_LABELS) as [Period, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setPeriod(key)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 ${
                period === key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Leaderboard Content */}
      {leaderboard === undefined ? (
        <div className="flex justify-center py-16">
          <Spinner size="xl" className="text-muted-foreground" />
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="rounded-lg border bg-card p-8 text-center">
          <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">No data yet</h2>
          <p className="text-sm text-muted-foreground">
            Start participating in discussions to earn points and appear on the leaderboard!
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {leaderboard.map((entry) => (
            <Link
              key={entry.user?.id ?? entry.rank}
              href={entry.user ? `/u/${entry.user.username}` : '#'}
              className={`block rounded-lg border bg-card p-4 hover:bg-accent/50 transition-colors ${getRankBg(entry.rank)}`}
            >
              <div className="flex items-center gap-4">
                {/* Rank */}
                <div className="w-8 flex justify-center">
                  {getRankIcon(entry.rank)}
                </div>

                {/* Avatar */}
                <div className="relative h-10 w-10 shrink-0">
                  {entry.user?.avatarUrl ? (
                    <Image
                      src={entry.user.avatarUrl}
                      alt={entry.user.name}
                      fill
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground">
                      {entry.user?.name?.charAt(0).toUpperCase() ?? '?'}
                    </div>
                  )}
                </div>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {entry.user?.name ?? 'Anonymous'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    @{entry.user?.username ?? 'unknown'}
                  </p>
                </div>

                {/* Points */}
                <div className="text-right">
                  <p className="font-bold text-lg">{entry.points.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">points</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Info */}
      <div className="mt-8 rounded-lg border bg-muted/50 p-4">
        <h3 className="font-medium mb-2">How Points Work</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• <strong>+5 points</strong> for creating a new thread</li>
          <li>• <strong>+3 points</strong> for posting a reply</li>
          <li>• <strong>+1 point</strong> for each upvote you receive</li>
          <li>• <strong>+2 points</strong> for helpful answers marked by thread authors</li>
          <li>• Weekly and monthly points reset at the start of each period</li>
        </ul>
      </div>
    </div>
  );
}
