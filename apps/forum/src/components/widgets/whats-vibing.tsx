'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlowCard } from '@/components/ui/glow-card';
import { mockTrendingTopics } from '@/data/mock-data';
import type { TrendingTopic } from '@/types/forum';

interface WhatsVibingWidgetProps {
  topics?: TrendingTopic[];
  autoRotateInterval?: number;
}

/**
 * WhatsVibingWidget - Morphing card stack showing trending topics
 */
export function WhatsVibingWidget({
  topics = mockTrendingTopics,
  autoRotateInterval = 4000,
}: WhatsVibingWidgetProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (topics.length <= 1) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % topics.length);
    }, autoRotateInterval);

    return () => clearInterval(interval);
  }, [topics.length, autoRotateInterval]);

  const getTrendIcon = (trend: TrendingTopic['trend']) => {
    switch (trend) {
      case 'rising':
        return '📈';
      case 'hot':
        return '🔥';
      case 'new':
        return '✨';
      default:
        return '📊';
    }
  };

  const getTrendColor = (trend: TrendingTopic['trend']) => {
    switch (trend) {
      case 'rising':
        return 'text-green-500';
      case 'hot':
        return 'text-orange-500';
      case 'new':
        return 'text-blue-500';
      default:
        return 'text-muted-foreground';
    }
  };

  if (topics.length === 0) return null;

  return (
    <GlowCard className="relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <span>🎵</span>
          <span>What&apos;s Vibing</span>
        </h3>
        <div className="flex gap-1">
          {topics.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === activeIndex
                  ? 'bg-primary w-4'
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Card Stack */}
      <div className="relative h-[140px]">
        <AnimatePresence mode="popLayout">
          {topics.map((topic, index) => {
            const isActive = index === activeIndex;
            const offset = (index - activeIndex + topics.length) % topics.length;

            return (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{
                  opacity: isActive ? 1 : 0.5 - offset * 0.2,
                  y: offset * 8,
                  scale: 1 - offset * 0.05,
                  zIndex: topics.length - offset,
                }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="absolute inset-0 cursor-pointer"
                onClick={() => setActiveIndex(index)}
              >
                <div className="h-full p-4 rounded-lg bg-muted/50 border">
                  {/* Trend Badge */}
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-medium ${getTrendColor(topic.trend)}`}>
                      {getTrendIcon(topic.trend)} {topic.trend.charAt(0).toUpperCase() + topic.trend.slice(1)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {topic.engagement.toLocaleString()} engaged
                    </span>
                  </div>

                  {/* Title */}
                  <h4 className="font-semibold text-sm mb-2 line-clamp-2">
                    {topic.title}
                  </h4>

                  {/* Category */}
                  <span className="inline-block px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                    {topic.category}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* View All Link */}
      <a
        href="/trending"
        className="block text-center text-sm text-primary hover:underline mt-4"
      >
        View all trending →
      </a>
    </GlowCard>
  );
}
