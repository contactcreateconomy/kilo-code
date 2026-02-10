"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@createconomy/convex";
import { Loader2 } from "lucide-react";

export default function ReviewsPage() {
  const [filterRating, setFilterRating] = useState("all");

  const reviews = useQuery(api.functions.orders.getSellerProductReviews, {});

  if (!reviews) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const filteredReviews = reviews.filter((review) => {
    if (filterRating !== "all" && review.rating !== parseInt(filterRating)) {
      return false;
    }
    return true;
  });

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : "0.0";
  const totalReviews = reviews.length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">Reviews</h1>
        <p className="text-[var(--muted-foreground)]">
          View customer reviews for your products
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="seller-card">
          <p className="text-sm text-[var(--muted-foreground)]">Average Rating</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-3xl font-bold">{averageRating}</span>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`w-5 h-5 ${star <= Math.round(parseFloat(averageRating)) ? "text-warning" : "text-muted-foreground/40"} fill-current`}
                  viewBox="0 0 20 20"
                >
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
              ))}
            </div>
          </div>
        </div>
        <div className="seller-card">
          <p className="text-sm text-[var(--muted-foreground)]">Total Reviews</p>
          <p className="text-3xl font-bold mt-1">{totalReviews}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <select
          value={filterRating}
          onChange={(e) => setFilterRating(e.target.value)}
          className="px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
        >
          <option value="all">All Ratings</option>
          <option value="5">5 Stars</option>
          <option value="4">4 Stars</option>
          <option value="3">3 Stars</option>
          <option value="2">2 Stars</option>
          <option value="1">1 Star</option>
        </select>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <div key={review._id} className="seller-card">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Link
                    href={
                      review.product
                        ? `/products/${review.product.id}`
                        : "#"
                    }
                    className="font-medium hover:text-[var(--primary)]"
                  >
                    {review.product?.name ?? "Unknown Product"}
                  </Link>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-4 h-4 ${star <= review.rating ? "text-warning" : "text-muted-foreground/40"} fill-current`}
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-[var(--muted-foreground)] mb-2">
                  {review.user?.name ?? review.user?.email ?? "Anonymous"} •{" "}
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
                {review.title && (
                  <p className="font-medium mb-1">{review.title}</p>
                )}
                <p className="mb-3">{review.content}</p>
              </div>
              <Link
                href={`/reviews/${review._id}`}
                className="px-4 py-2 text-sm border border-[var(--border)] rounded-lg hover:bg-[var(--muted)] transition-colors"
              >
                View
              </Link>
            </div>
          </div>
        ))}
      </div>

      {filteredReviews.length === 0 && (
        <div className="seller-card text-center py-12">
          <p className="text-[var(--muted-foreground)]">
            {reviews.length === 0
              ? "No reviews yet for your products"
              : "No reviews match your filters"}
          </p>
        </div>
      )}
    </div>
  );
}
