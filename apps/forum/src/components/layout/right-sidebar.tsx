'use client';

import { LeaderboardWidget } from '@/components/widgets/leaderboard';
import { CampaignWidget } from '@/components/widgets/campaign-widget';
import { CommunityStatsWidget } from '@/components/widgets/community-stats';
import { WhatsVibingWidget } from '@/components/widgets/whats-vibing';
import { cn } from '@/lib/utils';

interface RightSidebarProps {
  className?: string;
}

/**
 * RightSidebar - Redesigned right sidebar matching reference design
 * Features: What's Vibing, Leaderboard, Campaign widget, Community stats
 */
export function RightSidebar({ className }: RightSidebarProps) {
  return (
    <aside className={cn('flex flex-col gap-4', className)}>
      {/* What's Vibing Widget - Top position */}
      <WhatsVibingWidget />

      {/* Leaderboard Widget */}
      <LeaderboardWidget />

      {/* Campaign Widget */}
      <CampaignWidget />

      {/* Community Stats Widget */}
      <CommunityStatsWidget />
    </aside>
  );
}

export default RightSidebar;
