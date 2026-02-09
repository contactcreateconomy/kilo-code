'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GlowButton } from '@/components/ui/glow-button';
import { useActiveCampaign } from '@/hooks/use-campaign';
import { Spinner } from '@createconomy/ui';

/**
 * ActiveCampaignWidget - Featured campaign with countdown and progress
 *
 * Fetches real campaign data from Convex via useActiveCampaign hook.
 */
export function ActiveCampaignWidget() {
  const { campaign, isLoading } = useActiveCampaign();
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!campaign) return;
    setTimeLeft(calculateTimeLeft(campaign.endDate));
  }, [campaign]);

  useEffect(() => {
    if (!mounted || !campaign) return;
    
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(campaign.endDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [campaign, mounted]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner className="text-muted-foreground" />
      </div>
    );
  }

  if (!campaign) {
    return null; // No active campaign — hide the widget
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-xl"
    >
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-500/20 to-pink-500/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />

      {/* Content */}
      <div className="relative p-5">
        {/* Badge */}
        <div className="inline-flex items-center gap-1 px-2 py-1 bg-primary/20 backdrop-blur-sm text-primary text-xs font-medium rounded-full mb-3">
          <span className="animate-pulse">🔴</span>
          <span>Active Campaign</span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold mb-2">{campaign.title}</h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {campaign.description}
        </p>

        {/* Prize */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🎁</span>
          <div>
            <div className="text-xs text-muted-foreground">Prize Pool</div>
            <div className="font-bold text-primary">{campaign.prize}</div>
          </div>
        </div>

        {/* Countdown */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            { value: timeLeft.days, label: 'Days' },
            { value: timeLeft.hours, label: 'Hours' },
            { value: timeLeft.minutes, label: 'Mins' },
            { value: timeLeft.seconds, label: 'Secs' },
          ].map((item) => (
            <div
              key={item.label}
              className="text-center p-2 bg-background/50 backdrop-blur-sm rounded-lg"
            >
              <div className="text-lg font-bold tabular-nums">
                {String(item.value).padStart(2, '0')}
              </div>
              <div className="text-xs text-muted-foreground">{item.label}</div>
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>{campaign.participantCount} participants</span>
            <span>{campaign.progress}% complete</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${campaign.progress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full"
            />
          </div>
        </div>

        {/* CTA Button */}
        <GlowButton className="w-full" size="lg">
          Enter Now 🚀
        </GlowButton>
      </div>
    </motion.div>
  );
}

function calculateTimeLeft(endDate: Date) {
  const difference = new Date(endDate).getTime() - Date.now();

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
}
