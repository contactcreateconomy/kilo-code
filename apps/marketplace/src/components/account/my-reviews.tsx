"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery, useMutation } from "convex/react";
import { api } from "@createconomy/convex";
import type { Id } from "@createconomy/convex/dataModel";
import { useAuth } from "@/hooks/use-auth";
import { cn, formatDate } from "@/lib/utils";
import {
  Card,
  CardContent,
  Button,
  Input,
  Label,
  Skeleton,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@createconomy/ui";
import { useToast } from "@createconomy/ui";
import { Badge } from "@createconomy/ui/components/badge";
import { Textarea } from "@createconomy/ui/components/textarea";
import {
  Star,
  Pencil,
  Trash2,
  ShieldCheck,
  MessageSquareOff,
  LogIn,
  X,
  Check,
  Loader2,
} from "lucide-react";

interface ReviewData {
  _id: string;
  rating: number;
  title: string;
  content: string;
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  createdAt: number;
  updatedAt: number;
  product: {
    id: string;
    name: string;
    slug: string;
    primaryImage?: string;
  };
}

function StarRatingInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (rating: number) => void;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => {
        const starValue = i + 1;
        return (
          <button
            key={i}
            type="button"
            className="p-0.5"
            onMouseEnter={() => setHovered(starValue)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(starValue)}
          >
            <Star
              className={cn(
                "h-5 w-5 transition-colors",
                starValue <= (hovered || value)
                  ? "fill-amber-400 text-amber-400"
                  : "text-muted-foreground/30"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

function StarRatingDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-4 w-4",
            i < rating
              ? "fill-amber-400 text-amber-400"
              : "text-muted-foreground/30"
          )}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: ReviewData }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editRating, setEditRating] = useState(review.rating);
  const [editTitle, setEditTitle] = useState(review.title);
  const [editContent, setEditContent] = useState(review.content);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const updateReview = useMutation(api.functions.reviews.updateReview);
  const deleteReview = useMutation(api.functions.reviews.deleteReview);
  const toast = useToast();

  function handleStartEdit() {
    setEditRating(review.rating);
    setEditTitle(review.title);
    setEditContent(review.content);
    setIsEditing(true);
  }

  function handleCancelEdit() {
    setIsEditing(false);
  }

  async function handleSaveEdit() {
    if (editRating < 1 || editRating > 5) {
      toast.addToast("Please select a rating", "error");
      return;
    }
    if (!editContent.trim()) {
      toast.addToast("Review content cannot be empty", "error");
      return;
    }

    setIsSaving(true);
    try {
      await updateReview({
        reviewId: review._id as Id<"reviews">,
        rating: editRating,
        title: editTitle.trim(),
        content: editContent.trim(),
      });
      toast.addToast("Review updated successfully", "success");
      setIsEditing(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update review";
      toast.addToast(message, "error");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await deleteReview({
        reviewId: review._id as Id<"reviews">,
      });
      toast.addToast("Review deleted successfully", "success");
      setDeleteDialogOpen(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete review";
      toast.addToast(message, "error");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        {/* Product info row */}
        <div className="flex items-start gap-4">
          {/* Product thumbnail */}
          <Link
            href={`/products/${review.product.slug}`}
            className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted"
          >
            {review.product.primaryImage ? (
              <Image
                src={review.product.primaryImage}
                alt={review.product.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                No image
              </div>
            )}
          </Link>

          <div className="min-w-0 flex-1">
            {/* Product name + badges */}
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/products/${review.product.slug}`}
                className="font-medium hover:underline"
              >
                {review.product.name}
              </Link>
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

            {/* Date */}
            <p className="mt-0.5 text-xs text-muted-foreground">
              {formatDate(new Date(review.createdAt))}
              {review.updatedAt > review.createdAt && " (edited)"}
            </p>
          </div>

          {/* Action buttons — desktop */}
          {!isEditing && (
            <div className="hidden shrink-0 items-center gap-1 sm:flex">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleStartEdit}
                className="gap-1.5"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Button>
              <Dialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Review</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete your review for &quot;
                      {review.product.name}&quot;? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline" disabled={isDeleting}>
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={isDeleting}
                    >
                      {isDeleting ? "Deleting..." : "Delete Review"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>

        {/* Review content */}
        {isEditing ? (
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label>Rating</Label>
              <StarRatingInput value={editRating} onChange={setEditRating} />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`edit-title-${review._id}`}>Title</Label>
              <Input
                id={`edit-title-${review._id}`}
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Review title (optional)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`edit-content-${review._id}`}>Review</Label>
              <Textarea
                id={`edit-content-${review._id}`}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Write your review..."
                rows={4}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="gap-1.5"
              >
                {isSaving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Check className="h-3.5 w-3.5" />
                )}
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="gap-1.5"
              >
                <X className="h-3.5 w-3.5" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-3">
            <StarRatingDisplay rating={review.rating} />
            {review.title && (
              <h4 className="mt-2 font-semibold">{review.title}</h4>
            )}
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {review.content}
            </p>

            {review.helpfulCount > 0 && (
              <p className="mt-2 text-xs text-muted-foreground">
                {review.helpfulCount}{" "}
                {review.helpfulCount === 1 ? "person" : "people"} found this
                helpful
              </p>
            )}

            {/* Action buttons — mobile */}
            <div className="mt-3 flex items-center gap-1 sm:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleStartEdit}
                className="gap-1.5"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Button>
              <Dialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Review</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete your review for &quot;
                      {review.product.name}&quot;? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline" disabled={isDeleting}>
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={isDeleting}
                    >
                      {isDeleting ? "Deleting..." : "Delete Review"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MyReviewsSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Reviews</h1>
        <p className="text-muted-foreground">
          Manage your product reviews
        </p>
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start gap-4">
                <Skeleton className="h-16 w-16 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <div className="hidden gap-1 sm:flex">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>
              <div className="mt-3 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-12 w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function MyReviews() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const reviews = useQuery(
    api.functions.reviews.getUserReviews,
    isAuthenticated ? {} : "skip"
  ) as ReviewData[] | undefined;

  // Auth loading state
  if (authLoading) {
    return <MyReviewsSkeleton />;
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Reviews</h1>
          <p className="text-muted-foreground">
            Manage your product reviews
          </p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <LogIn className="h-12 w-12 text-muted-foreground" />
            <h2 className="mt-4 text-lg font-semibold">Sign in required</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Please sign in to view your reviews.
            </p>
            <Button asChild className="mt-6">
              <Link href="/auth/signin">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Data loading state
  if (reviews === undefined) {
    return <MyReviewsSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Reviews</h1>
        <p className="text-muted-foreground">
          Manage your product reviews
        </p>
      </div>

      {reviews.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquareOff className="h-12 w-12 text-muted-foreground" />
            <h2 className="mt-4 text-lg font-semibold">
              You haven&apos;t written any reviews yet
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Purchase products and share your experience with others.
            </p>
            <Button asChild className="mt-6">
              <Link href="/products">Browse Products</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
          </p>
          {reviews.map((review) => (
            <ReviewCard key={review._id} review={review} />
          ))}
        </div>
      )}
    </div>
  );
}
