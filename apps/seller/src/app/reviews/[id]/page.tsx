"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@createconomy/convex";
import { Loader2 } from "lucide-react";

export default function ReviewDetailPage() {
  const params = useParams();
  const reviewId = params["id"] as string;

  const reviews = useQuery(api.functions.orders.getSellerProductReviews, {});

  const review = reviews?.find((r) => r._id === reviewId);

  if (reviews === undefined) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!review) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold">Review not found</h2>
        <Link
          href="/reviews"
          className="mt-4 inline-block text-primary hover:underline"
        >
          ← Back to reviews
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
        <Link href="/reviews" className="hover:text-[var(--foreground)]">
          Reviews
        </Link>
        <span>/</span>
        <span>Review Detail</span>
      </nav>

      {/* Review Card */}
      <div className="seller-card">
        <div className="flex items-start gap-6">
          {/* Product placeholder */}
          <div className="w-24 h-24 bg-[var(--muted)] rounded-lg flex-shrink-0 flex items-center justify-center">
            <span className="text-4xl">📦</span>
          </div>

          {/* Review Content */}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <Link
                  href={
                    review.product
                      ? `/products/${review.product.id}`
                      : "#"
                  }
                  className="text-lg font-semibold hover:text-[var(--primary)]"
                >
                  {review.product?.name ?? "Unknown Product"}
                </Link>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-5 h-5 ${star <= review.rating ? "text-warning" : "text-muted-foreground/40"} fill-current`}
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm text-[var(--muted-foreground)]">
                    {review.rating} out of 5
                  </span>
                </div>
              </div>
              <span className="text-sm text-[var(--muted-foreground)]">
                {new Date(review.createdAt).toLocaleDateString()}
              </span>
            </div>

            <div className="mt-4">
              <p className="text-sm text-[var(--muted-foreground)] mb-2">
                {review.user?.name ?? review.user?.email ?? "Anonymous"}
              </p>
              {review.title && (
                <p className="font-medium mb-2">{review.title}</p>
              )}
              <p className="text-[var(--foreground)]">{review.content}</p>
            </div>

            <div className="flex items-center gap-4 mt-4 text-sm text-[var(--muted-foreground)]">
              <span>{review.helpfulCount ?? 0} people found this helpful</span>
              {review.isVerifiedPurchase && (
                <>
                  <span>•</span>
                  <span className="text-emerald-500">✓ Verified Purchase</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Review Info */}
      <div className="seller-card">
        <h2 className="text-lg font-semibold mb-4">Review Information</h2>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-[var(--muted-foreground)]">Status</dt>
            <dd className="mt-1">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  review.isApproved
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                }`}
              >
                {review.isApproved ? "Approved" : "Pending Approval"}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-[var(--muted-foreground)]">Date</dt>
            <dd className="mt-1">{new Date(review.createdAt).toLocaleDateString()}</dd>
          </div>
          <div>
            <dt className="text-[var(--muted-foreground)]">Verified Purchase</dt>
            <dd className="mt-1">{review.isVerifiedPurchase ? "Yes" : "No"}</dd>
          </div>
          <div>
            <dt className="text-[var(--muted-foreground)]">Helpful Votes</dt>
            <dd className="mt-1">{review.helpfulCount ?? 0}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
