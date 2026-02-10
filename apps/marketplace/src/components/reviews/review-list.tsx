"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@createconomy/convex";
import type { Id } from "@createconomy/convex/dataModel";
import { useAuth } from "@/hooks/use-auth";
import { cn, formatDate, getInitials } from "@/lib/utils";
import { Button, Skeleton } from "@createconomy/ui";
import { useToast } from "@createconomy/ui";
import { Badge } from "@createconomy/ui/components/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@createconomy/ui/components/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@createconomy/ui/components/select";
import { Star, ThumbsUp, ShieldCheck, MessageSquareOff } from "lucide-react";

interface ReviewListProps {
  productId: string;
}

type SortOption = "recent" | "helpful" | "rating_high" | "rating_low";

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "recent", label: "Most Recent" },
  { value: "helpful", label: "Most Helpful" },
  { value: "rating_high", label: "Highest Rated" },
  { value: "rating_low", label: "Lowest Rated" },
];

function ReviewListSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-9 w-[180px]" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-3 border-b pb-6 last:border-0">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  );
}

export function ReviewList({ productId }: ReviewListProps) {
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const { isAuthenticated } = useAuth();
  const toast = useToast();

  const reviews = useQuery(api.functions.reviews.getProductReviews, {
    productId: productId as Id<"products">,
    sortBy,
  });

  const markHelpful = useMutation(api.functions.reviews.markReviewHelpful);

  async function handleMarkHelpful(reviewId: string) {
    if (!isAuthenticated) {
      toast.addToast("Sign in to mark reviews as helpful", "error");
      return;
    }
    try {
      await markHelpful({ reviewId: reviewId as Id<"reviews"> });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to mark review as helpful";
      toast.addToast(message, "error");
    }
  }

  if (reviews === undefined) {
    return <ReviewListSkeleton />;
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <MessageSquareOff className="h-12 w-12 text-muted-foreground/50" />
        <p className="mt-4 text-lg font-medium">No reviews yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Be the first to review this product!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sort controls */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
        </p>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Review cards */}
      <div className="divide-y">
        {reviews.map((review) => {
          const displayName = review.user?.displayName || review.user?.name || "Anonymous";
          const initials = getInitials(displayName);

          return (
            <div key={review.id} className="py-6 first:pt-0 last:pb-0">
              {/* User info */}
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  {review.user?.avatarUrl && (
                    <AvatarImage src={review.user.avatarUrl} alt={displayName} />
                  )}
                  <AvatarFallback className="text-xs font-medium">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{displayName}</span>
                    {review.isVerifiedPurchase && (
                      <Badge
                        variant="secondary"
                        className="gap-1 text-xs font-normal"
                      >
                        <ShieldCheck className="h-3 w-3 text-green-600" />
                        Verified Purchase
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(new Date(review.createdAt))}
                  </p>
                </div>
              </div>

              {/* Star rating */}
              <div className="mt-3 flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-4 w-4",
                      i < review.rating
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground/30"
                    )}
                  />
                ))}
              </div>

              {/* Title & content */}
              {review.title && (
                <h4 className="mt-2 font-semibold">{review.title}</h4>
              )}
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {review.content}
              </p>

              {/* Helpful button */}
              <div className="mt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-muted-foreground hover:text-foreground"
                  onClick={() => handleMarkHelpful(review.id)}
                >
                  <ThumbsUp className="h-3.5 w-3.5" />
                  <span className="text-xs">
                    Helpful{review.helpfulCount > 0 ? ` (${review.helpfulCount})` : ""}
                  </span>
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
