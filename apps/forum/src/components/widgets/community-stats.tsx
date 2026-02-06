'use client';

import { Users, FileText, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@createconomy/ui';
import { mockCommunityStats } from '@/data/mock-data';
import type { CommunityStats } from '@/types/forum';

interface CommunityStatsWidgetProps {
  stats?: CommunityStats;
}

const statItems = [
  { key: 'members' as const, label: 'Members', icon: Users },
  { key: 'discussions' as const, label: 'Discussions', icon: FileText },
  { key: 'comments' as const, label: 'Comments', icon: MessageSquare },
];

/**
 * CommunityStatsWidget - Shows community statistics
 */
export function CommunityStatsWidget({ stats = mockCommunityStats }: CommunityStatsWidgetProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Community Stats</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
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
                <span className="text-lg font-bold text-foreground">{stats[stat.key]}</span>
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default CommunityStatsWidget;
