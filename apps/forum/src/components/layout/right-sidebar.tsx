'use client';

import { WhatsVibingWidget } from '@/components/widgets/whats-vibing';
import { LeaderboardWidget } from '@/components/widgets/leaderboard';
import { ActiveCampaignWidget } from '@/components/widgets/active-campaign';

/**
 * RightSidebar - Premium right sidebar with widgets
 */
export function RightSidebar() {
  return (
    <div className="space-y-6">
      {/* What's Vibing Widget */}
      <WhatsVibingWidget />

      {/* Leaderboard Widget */}
      <LeaderboardWidget />

      {/* Active Campaign Widget */}
      <ActiveCampaignWidget />
    </div>
  );
}
