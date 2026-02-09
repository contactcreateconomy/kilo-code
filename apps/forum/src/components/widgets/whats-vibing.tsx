'use client';

import Link from 'next/link';
import { Flame, TrendingUp, ArrowUpRight } from 'lucide-react';
import { cn, Card, CardContent, Badge, Spinner } from '@createconomy/ui';
import { useTrending } from '@/hooks/use-trending';

interface WhatsVibingWidgetProps {
  className?: string;
}

/**
 * WhatsVibingWidget - Shows trending topics from Convex
 * Features: Trending topics list, post counts, category badges
 */
export function WhatsVibingWidget({ className }: WhatsVibingWidgetProps) {
  const { topics, isLoading } = useTrending(5);

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">🔥</span>
            <h3 className="text-sm font-bold">What&apos;s Vibing</h3>
          </div>
          <Link 
            href="/trending" 
            className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
          >
            See all
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Trending Topics List */}
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Spinner className="text-muted-foreground" />
          </div>
        ) : topics.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No trending topics yet
          </p>
        ) : (
          <div className="space-y-3">
            {topics.map((topic, index) => (
              <Link
                key={topic.id}
                href={`/search?q=${encodeURIComponent(topic.title)}`}
                className="group flex items-start gap-3 p-2 -mx-2 rounded-lg hover:bg-accent transition-colors"
              >
                {/* Rank Number */}
                <span className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold shrink-0',
                  index === 0 && 'bg-upvote/20 text-upvote',
                  index === 1 && 'bg-warning/20 text-warning',
                  index === 2 && 'bg-warning/20 text-warning',
                  index > 2 && 'bg-muted text-muted-foreground'
                )}>
                  {index + 1}
                </span>

                {/* Topic Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                    {topic.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                      {topic.category}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {topic.engagement} posts
                    </span>
                  </div>
                </div>

                {/* Trend Indicator */}
                <div className="shrink-0">
                  {topic.trend === 'hot' ? (
                    <Flame className="h-4 w-4 text-upvote" />
                  ) : (
                    <TrendingUp className="h-4 w-4 text-success" />
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default WhatsVibingWidget;
