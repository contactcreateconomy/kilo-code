"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@createconomy/convex";
import type { Id } from "@createconomy/convex/dataModel";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Button, Input, Label, Skeleton } from "@createconomy/ui";
import { useToast } from "@createconomy/ui";
import { Badge } from "@createconomy/ui/components/badge";
import { Textarea } from "@createconomy/ui/components/textarea";
import { Star, ShieldCheck, Loader2, LogIn } from "lucide-react";
import Link from "next/link";

interface ReviewFormProps {
  productId: string;
}

function ReviewFormSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-10 w-32" />
    </div>
  );
}

export function ReviewForm({ productId }: ReviewFormProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const toast = useToast();

  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canReview = useQuery(
    api.functions.reviews.canReviewProduct,
    isAuthenticated ? { productId: productId as Id<"products"> } : "skip"
  );

  const createReview = useMutation(api.functions.reviews.createReview);

  // Auth loading
  if (authLoading) {
    return <ReviewFormSkeleton />;
  }

  // Not signed in
  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-dashed p-4">
        <LogIn className="h-5 w-5 text-muted-foreground" />
        <div className="flex-1">
          <p className="text-sm font-medium">Sign in to leave a review</p>
          <p className="text-xs text-muted-foreground">
            Share your experience with this product
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/auth/signin">Sign In</Link>
        </Button>
      </div>
    );
  }

  // Loading canReview
  if (canReview === undefined) {
    return <ReviewFormSkeleton />;
  }

  // Cannot review
  if (!canReview.canReview) {
    return (
      <div className="rounded-lg border border-dashed p-4">
        <p className="text-sm text-muted-foreground">{canReview.reason}</p>
      </div>
    );
  }

  const isVerifiedPurchase = canReview.isVerifiedPurchase === true;
  const contentLength = content.trim().length;
  const isValid = rating >= 1 && rating <= 5 && contentLength >= 10 && contentLength <= 5000;

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();

    if (!isValid) {
      if (rating === 0) {
        toast.addToast("Please select a star rating", "error");
        return;
      }
      if (contentLength < 10) {
        toast.addToast("Review must be at least 10 characters", "error");
        return;
      }
      return;
    }

    setIsSubmitting(true);
    try {
      await createReview({
        productId: productId as Id<"products">,
        rating,
        title: title.trim() || undefined,
        content: content.trim(),
      });
      toast.addToast("Review submitted successfully!", "success");
      // Reset form
      setRating(0);
      setHoveredRating(0);
      setTitle("");
      setContent("");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to submit review";
      toast.addToast(message, "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-3">
        <h3 className="text-lg font-semibold">Write a Review</h3>
        {isVerifiedPurchase && (
          <Badge variant="secondary" className="gap-1 text-xs font-normal">
            <ShieldCheck className="h-3 w-3 text-green-600" />
            Verified Purchase
          </Badge>
        )}
      </div>

      {/* Star rating selector */}
      <div className="space-y-2">
        <Label>Rating</Label>
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => {
            const starValue = i + 1;
            const isFilled = starValue <= (hoveredRating || rating);
            return (
              <button
                key={i}
                type="button"
                className="rounded-sm p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => setRating(starValue)}
                onMouseEnter={() => setHoveredRating(starValue)}
                onMouseLeave={() => setHoveredRating(0)}
                aria-label={`Rate ${starValue} star${starValue !== 1 ? "s" : ""}`}
              >
                <Star
                  className={cn(
                    "h-7 w-7 transition-colors",
                    isFilled
                      ? "fill-amber-400 text-amber-400"
                      : "text-muted-foreground/30 hover:text-amber-200"
                  )}
                />
              </button>
            );
          })}
          {rating > 0 && (
            <span className="ml-2 text-sm text-muted-foreground">
              {rating} of 5 stars
            </span>
          )}
        </div>
      </div>

      {/* Title (optional) */}
      <div className="space-y-2">
        <Label htmlFor="review-title">
          Title <span className="text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id="review-title"
          placeholder="Summarize your experience"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          disabled={isSubmitting}
        />
      </div>

      {/* Content */}
      <div className="space-y-2">
        <Label htmlFor="review-content">Review</Label>
        <Textarea
          id="review-content"
          placeholder="What did you like or dislike about this product?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          maxLength={5000}
          disabled={isSubmitting}
          className="resize-y"
        />
        <p className="text-xs text-muted-foreground">
          {contentLength}/5000 characters
          {contentLength > 0 && contentLength < 10 && (
            <span className="text-destructive"> (minimum 10)</span>
          )}
        </p>
      </div>

      <Button type="submit" disabled={isSubmitting || !isValid}>
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isSubmitting ? "Submitting..." : "Submit Review"}
      </Button>
    </form>
  );
}
