'use client';

import Link from 'next/link';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@createconomy/convex';
import { Loader2 } from 'lucide-react';
import type { Id } from '@createconomy/convex/dataModel';

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={
            star <= rating ? 'text-warning' : 'text-muted-foreground/40'
          }
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default function PendingReviewsPage() {
  const pendingReviews = useQuery(api.functions.admin.listPendingReviews, {});
  const moderate = useMutation(api.functions.admin.moderateReview);

  const handleApprove = async (reviewId: Id<'reviews'>) => {
    await moderate({ reviewId, approved: true });
  };

  const handleReject = async (reviewId: Id<'reviews'>) => {
    await moderate({ reviewId, approved: false });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/moderation"
            className="text-muted-foreground hover:text-foreground"
          >
            ← Back to Moderation
          </Link>
          <span className="text-muted-foreground">/</span>
          <h1 className="text-3xl font-bold tracking-tight">Pending Reviews</h1>
          {pendingReviews && (
            <span className="badge badge-warning">
              {pendingReviews.length} pending
            </span>
          )}
        </div>
      </div>

      <div className="rounded-lg border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="text-primary">ℹ️</span>
          <span>
            Reviews from verified purchases are generally safe to approve.
            Flagged reviews require careful examination.
          </span>
        </div>
      </div>

      {!pendingReviews ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : pendingReviews.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center shadow-sm">
          <div className="mb-4 text-4xl">✅</div>
          <h2 className="mb-2 text-xl font-semibold">All caught up!</h2>
          <p className="text-muted-foreground">
            There are no pending reviews to moderate.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingReviews.map((review) => (
            <div
              key={String(review._id)}
              className="overflow-hidden rounded-lg border bg-card shadow-sm"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <StarRating rating={review.rating} />
                      <h2 className="font-semibold">
                        {review.title ?? 'No title'}
                      </h2>
                      {review.isVerifiedPurchase && (
                        <span className="badge badge-success">
                          Verified Purchase
                        </span>
                      )}
                      {!review.isVerifiedPurchase && (
                        <span className="badge badge-warning">Unverified</span>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {review.content}
                    </p>
                    <div className="mt-4 flex items-center gap-6 text-sm">
                      {review.product && (
                        <div>
                          <span className="text-muted-foreground">
                            Product:{' '}
                          </span>
                          <Link
                            href={`/products/${String(review.product.id)}`}
                            className="text-primary hover:underline"
                          >
                            {review.product.name}
                          </Link>
                        </div>
                      )}
                      {review.user && (
                        <div>
                          <span className="text-muted-foreground">
                            Reviewer:{' '}
                          </span>
                          <span className="font-medium">
                            {review.user.name ?? review.user.email ?? 'Unknown'}
                          </span>
                        </div>
                      )}
                      <div>
                        <span className="text-muted-foreground">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 border-t bg-muted/30 px-6 py-4">
                <button
                  onClick={() => handleReject(review._id)}
                  className="rounded-md border border-destructive px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleApprove(review._id)}
                  className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                >
                  Approve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
