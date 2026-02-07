'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Trophy, Zap, Crown, Medal, Award, Loader2 } from 'lucide-react';
import { cn, Card, CardContent, CardHeader, CardTitle, Avatar, AvatarImage, AvatarFallback } from '@createconomy/ui';
import { useLeaderboard } from '@/hooks/use-leaderboard';

interface LeaderboardWidgetProps {
  maxEntries?: number;
}

/**
 * LeaderboardWidget - Weekly top creators with rank badges
 *
 * Fetches real leaderboard data from Convex via useLeaderboard hook.
 */
export function LeaderboardWidget({ maxEntries = 10 }: LeaderboardWidgetProps) {
  const [hoveredUser, setHoveredUser] = useState<number | null>(null);
  const { entries, isLoading } = useLeaderboard('weekly', maxEntries);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 2:
        return <Medal className="h-4 w-4 text-gray-400" />;
      case 3:
        return <Award className="h-4 w-4 text-amber-600" />;
      default:
        return <span className="text-xs font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Trophy className="h-5 w-5 text-primary" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : entries.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No leaderboard data yet
          </p>
        ) : (
          <div className="space-y-2">
            {entries.map((entry, index) => (
              <Link
                key={entry.user.id}
                href={`/u/${entry.user.username}`}
                className={cn(
                  'group flex items-center gap-3 rounded-lg px-2 py-2 transition-all duration-200',
                  hoveredUser === entry.rank ? 'bg-accent' : '',
                  entry.rank <= 3 && 'bg-muted/50'
                )}
                onMouseEnter={() => setHoveredUser(entry.rank)}
                onMouseLeave={() => setHoveredUser(null)}
                style={{
                  animation: `fadeInRight 0.4s ease-out ${index * 50}ms both`,
                }}
              >
                {/* Rank Icon */}
                <div className="flex h-6 w-6 items-center justify-center">
                  {getRankIcon(entry.rank)}
                </div>

                {/* Avatar */}
                <Avatar
                  className={cn(
                    'h-8 w-8 ring-2 transition-all duration-300',
                    hoveredUser === entry.rank ? 'scale-110 ring-primary/50' : 'ring-transparent'
                  )}
                >
                  <AvatarImage src={entry.user.avatarUrl} alt={entry.user.name} />
                  <AvatarFallback>{entry.user.name.charAt(0)}</AvatarFallback>
                </Avatar>

                {/* User Info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{entry.user.name}</p>
                  <p className="truncate text-xs text-muted-foreground">@{entry.user.username}</p>
                </div>

                {/* Points */}
                <div className="flex items-center gap-1">
                  <Zap className="h-3 w-3 text-primary" />
                  <span className="text-xs font-semibold text-foreground">
                    {entry.points.toLocaleString()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default LeaderboardWidget;
