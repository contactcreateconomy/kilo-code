'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

/**
 * Skeleton - Base skeleton component with shimmer animation
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-muted',
        className
      )}
    />
  );
}

/**
 * DiscussionCardSkeleton - Loading skeleton for discussion cards
 */
export function DiscussionCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>

      {/* Content */}
      <div className="space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t">
        <div className="flex items-center gap-4">
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-5 w-20" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6 rounded" />
          <Skeleton className="h-6 w-6 rounded" />
        </div>
      </div>
    </div>
  );
}

/**
 * FeaturedSliderSkeleton - Loading skeleton for featured slider
 */
export function FeaturedSliderSkeleton() {
  return (
    <div className="flex gap-4 overflow-hidden">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex-shrink-0 w-full md:w-1/2 lg:w-1/3"
        >
          <Skeleton className="h-[280px] rounded-xl" />
        </div>
      ))}
    </div>
  );
}

/**
 * SidebarSkeleton - Loading skeleton for sidebar
 */
export function SidebarSkeleton() {
  return (
    <div className="space-y-6">
      {/* Button */}
      <Skeleton className="h-12 w-full rounded-xl" />

      {/* Categories */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-20 mb-3" />
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-10 w-full rounded-lg" />
        ))}
      </div>

      {/* Campaign Card */}
      <Skeleton className="h-32 w-full rounded-xl" />
    </div>
  );
}

/**
 * LeaderboardSkeleton - Loading skeleton for leaderboard widget
 */
export function LeaderboardSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-4 space-y-4">
      <Skeleton className="h-6 w-40" />
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-5 w-12" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * WidgetSkeleton - Generic widget skeleton
 */
export function WidgetSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-4 space-y-4">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-[140px] w-full rounded-lg" />
      <Skeleton className="h-4 w-24 mx-auto" />
    </div>
  );
}

/**
 * NavbarSkeleton - Loading skeleton for navbar
 */
export function NavbarSkeleton() {
  return (
    <div className="h-16 border-b bg-background/80 backdrop-blur-md px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Skeleton className="w-8 h-8 rounded-full" />
        <Skeleton className="h-6 w-32" />
      </div>
      <div className="flex items-center gap-4">
        <Skeleton className="w-10 h-10 rounded-full" />
        <Skeleton className="w-10 h-10 rounded-full" />
        <Skeleton className="w-10 h-10 rounded-full" />
      </div>
    </div>
  );
}
