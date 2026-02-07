'use client';

import { ErrorBoundary } from '@/components/ui/error-boundary';
import { WidgetErrorFallback } from '@/components/ui/widget-error-fallback';
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
 *
 * Each widget is wrapped in its own ErrorBoundary so a single widget failure
 * does not bring down the entire sidebar.
 */
export function RightSidebar({ className }: RightSidebarProps) {
  return (
    <aside className={cn('flex flex-col gap-4', className)}>
      {/* What's Vibing Widget - Top position */}
      <ErrorBoundary fallback={<WidgetErrorFallback label="Trending" />}>
        <WhatsVibingWidget />
      </ErrorBoundary>

      {/* Leaderboard Widget */}
      <ErrorBoundary fallback={<WidgetErrorFallback label="Leaderboard" />}>
        <LeaderboardWidget />
      </ErrorBoundary>

      {/* Campaign Widget */}
      <ErrorBoundary fallback={<WidgetErrorFallback label="Campaign" />}>
        <CampaignWidget />
      </ErrorBoundary>

      {/* Community Stats Widget */}
      <ErrorBoundary fallback={<WidgetErrorFallback label="Community Stats" />}>
        <CommunityStatsWidget />
      </ErrorBoundary>
    </aside>
  );
}

export default RightSidebar;
