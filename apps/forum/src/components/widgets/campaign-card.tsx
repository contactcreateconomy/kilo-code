'use client';

import { motion } from 'framer-motion';
import { GlowButton } from '@/components/ui/glow-button';
import type { Campaign } from '@/types/forum';

interface CampaignCardProps {
  campaign: Campaign;
}

/**
 * CampaignCard - Active campaign widget with gradient background
 */
export function CampaignCard({ campaign }: CampaignCardProps) {
  const daysLeft = Math.ceil(
    (new Date(campaign.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <motion.div
      className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {/* Decorative glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
      
      <div className="relative">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">🏆</span>
          <span className="text-xs font-medium text-primary uppercase tracking-wide">
            Active Campaign
          </span>
        </div>
        
        <h3 className="font-bold text-lg mb-1">{campaign.title}</h3>
        <p className="text-sm text-muted-foreground mb-3">{campaign.description}</p>
        
        {/* Prize */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl font-bold text-primary">{campaign.prize}</span>
        </div>
        
        {/* Progress */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>{campaign.totalParticipants} participants</span>
            <span>{daysLeft} days left</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${campaign.progress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>
        
        <GlowButton className="w-full" size="sm">
          Enter Now
        </GlowButton>
      </div>
    </motion.div>
  );
}
