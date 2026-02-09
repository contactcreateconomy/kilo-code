'use client';

import { useState } from 'react';
import { Gift } from 'lucide-react';
import { Button, Card, CardContent, Spinner } from '@createconomy/ui';
import { useActiveCampaign } from '@/hooks/use-campaign';

/**
 * CampaignWidget - Active campaign widget with progress bar
 *
 * Fetches real campaign data from Convex via useActiveCampaign hook.
 */
export function CampaignWidget() {
  const [isJoined, setIsJoined] = useState(false);
  const { campaign, isLoading } = useActiveCampaign();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-8">
          <Spinner className="text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!campaign) {
    return null; // No active campaign — hide the widget
  }

  const progressPercent = Math.round((campaign.progress / campaign.targetPoints) * 100);

  return (
    <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      {/* Decorative glow */}
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />

      <CardContent className="relative p-4">
        {/* Header */}
        <div className="mb-3 flex items-center gap-2">
          <Gift className="h-5 w-5 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            Active Campaign
          </span>
        </div>

        {/* Title & Description */}
        <h4 className="mb-2 text-lg font-bold text-foreground">{campaign.title}</h4>
        <p className="mb-4 text-sm text-muted-foreground">{campaign.description}</p>

        {/* Progress */}
        <div className="mb-4">
          <div className="mb-1 flex justify-between text-xs">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium text-foreground">
              {campaign.progress.toLocaleString()} / {campaign.targetPoints.toLocaleString()} pts
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-1000"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Join Button */}
        <Button
          variant={isJoined ? 'secondary' : 'default'}
          onClick={() => setIsJoined(!isJoined)}
          className="w-full"
        >
          {isJoined ? 'Joined' : 'Join Campaign'}
        </Button>
      </CardContent>
    </Card>
  );
}

export default CampaignWidget;
