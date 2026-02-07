'use client';

import { Users, FileText, MessageSquare, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@createconomy/ui';
import { useCommunityStats } from '@/hooks/use-community-stats';

const statItems = [
  { key: 'members' as const, label: 'Members', icon: Users },
  { key: 'discussions' as const, label: 'Discussions', icon: FileText },
  { key: 'comments' as const, label: 'Comments', icon: MessageSquare },
];

/**
 * CommunityStatsWidget - Shows community statistics from Convex
 */
export function CommunityStatsWidget() {
  const { stats, isLoading } = useCommunityStats();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Community Stats</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {statItems.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.key}
                  className="group flex flex-col items-center rounded-lg bg-muted/50 p-3 transition-all duration-200 hover:bg-accent"
                  style={{
                    animation: `fadeInUp 0.4s ease-out ${index * 100}ms both`,
                  }}
                >
                  <Icon className="mb-1 h-4 w-4 text-muted-foreground transition-colors duration-200 group-hover:text-primary" />
                  <span className="text-lg font-bold text-foreground">
                    {stats ? stats[stat.key] : '--'}
                  </span>
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default CommunityStatsWidget;
