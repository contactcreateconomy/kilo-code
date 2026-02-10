"use client";

import { useQuery } from "convex/react";
import { api } from "@createconomy/convex";
import type { Id } from "@createconomy/convex/dataModel";
import { Skeleton } from "@createconomy/ui";
import { Star, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReviewStatsProps {
  productId: string;
}

function ReviewStatsSkeleton() {
  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
      {/* Average rating skeleton */}
      <div className="flex flex-col items-center gap-1">
        <Skeleton className="h-12 w-16" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
      </div>
      {/* Distribution bars skeleton */}
      <div className="flex-1 space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-3 flex-1" />
            <Skeleton className="h-4 w-8" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ReviewStats({ productId }: ReviewStatsProps) {
  const stats = useQuery(api.functions.reviews.getProductReviewStats, {
    productId: productId as Id<"products">,
  });

  if (stats === undefined) {
    return <ReviewStatsSkeleton />;
  }

  if (stats === null || stats.totalReviews === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground">No reviews yet</p>
      </div>
    );
  }

  const { averageRating, totalReviews, ratingDistribution, verifiedPurchaseCount } = stats;
  const maxCount = Math.max(...Object.values(ratingDistribution), 1);

  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
      {/* Average rating */}
      <div className="flex flex-col items-center gap-1 sm:min-w-[120px]">
        <div className="text-5xl font-bold tracking-tight">
          {averageRating.toFixed(1)}
        </div>
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                "h-4 w-4",
                i < Math.round(averageRating)
                  ? "fill-amber-400 text-amber-400"
                  : "text-muted-foreground/30"
              )}
            />
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
        </p>
        {verifiedPurchaseCount > 0 && (
          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-green-600" />
            <span>{verifiedPurchaseCount} verified</span>
          </div>
        )}
      </div>

      {/* Rating distribution */}
      <div className="flex-1 space-y-1.5">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = ratingDistribution[star as keyof typeof ratingDistribution] ?? 0;
          const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

          return (
            <div key={star} className="flex items-center gap-2">
              <span className="flex w-12 items-center justify-end gap-1 text-sm text-muted-foreground">
                {star}
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              </span>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-amber-400 transition-all duration-300"
                  style={{ width: `${(count / maxCount) * 100}%` }}
                />
              </div>
              <span className="w-10 text-right text-xs text-muted-foreground">
                {percentage.toFixed(0)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
