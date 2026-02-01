"use client";

import { useState } from "react";
import Link from "next/link";

const mockReviews = [
  {
    id: "1",
    productName: "Handcrafted Wooden Bowl",
    productId: "prod-1",
    customerName: "Sarah M.",
    rating: 5,
    comment: "Absolutely beautiful craftsmanship! The bowl is even more stunning in person. Will definitely order again.",
    date: "2024-01-18",
    hasResponse: true,
    response: "Thank you so much for your kind words, Sarah! We're thrilled you love the bowl.",
  },
  {
    id: "2",
    productName: "Ceramic Vase Set",
    productId: "prod-2",
    customerName: "Michael R.",
    rating: 4,
    comment: "Great quality vases. Shipping was a bit slow but the product is worth the wait.",
    date: "2024-01-15",
    hasResponse: false,
    response: null,
  },
  {
    id: "3",
    productName: "Woven Wall Hanging",
    productId: "prod-3",
    customerName: "Emily K.",
    rating: 5,
    comment: "Perfect addition to my living room! The colors are exactly as shown in the photos.",
    date: "2024-01-12",
    hasResponse: true,
    response: "We're so happy it fits perfectly in your space, Emily! Thank you for sharing.",
  },
  {
    id: "4",
    productName: "Leather Journal",
    productId: "prod-4",
    customerName: "David L.",
    rating: 3,
    comment: "Good quality leather but the pages are thinner than expected.",
    date: "2024-01-10",
    hasResponse: false,
    response: null,
  },
];

export default function ReviewsPage() {
  const [filterRating, setFilterRating] = useState("all");
  const [filterResponse, setFilterResponse] = useState("all");

  const filteredReviews = mockReviews.filter((review) => {
    if (filterRating !== "all" && review.rating !== parseInt(filterRating)) {
      return false;
    }
    if (filterResponse === "responded" && !review.hasResponse) {
      return false;
    }
    if (filterResponse === "pending" && review.hasResponse) {
      return false;
    }
    return true;
  });

  const averageRating = (mockReviews.reduce((sum, r) => sum + r.rating, 0) / mockReviews.length).toFixed(1);
  const totalReviews = mockReviews.length;
  const pendingResponses = mockReviews.filter((r) => !r.hasResponse).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">Reviews</h1>
        <p className="text-[var(--muted-foreground)]">
          Manage and respond to customer reviews
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="seller-card">
          <p className="text-sm text-[var(--muted-foreground)]">Average Rating</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-3xl font-bold">{averageRating}</span>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`w-5 h-5 ${star <= Math.round(parseFloat(averageRating)) ? "text-yellow-400" : "text-gray-300"} fill-current`}
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
        <div className="seller-card">
          <p className="text-sm text-[var(--muted-foreground)]">Pending Responses</p>
          <p className="text-3xl font-bold mt-1">{pendingResponses}</p>
          {pendingResponses > 0 && (
            <p className="text-sm text-[var(--warning)] mt-1">Respond to improve engagement</p>
          )}
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
        <select
          value={filterResponse}
          onChange={(e) => setFilterResponse(e.target.value)}
          className="px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
        >
          <option value="all">All Reviews</option>
          <option value="pending">Needs Response</option>
          <option value="responded">Responded</option>
        </select>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <div key={review.id} className="seller-card">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Link
                    href={`/products/${review.productId}`}
                    className="font-medium hover:text-[var(--primary)]"
                  >
                    {review.productName}
                  </Link>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-4 h-4 ${star <= review.rating ? "text-yellow-400" : "text-gray-300"} fill-current`}
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-[var(--muted-foreground)] mb-2">
                  {review.customerName} • {new Date(review.date).toLocaleDateString()}
                </p>
                <p className="mb-3">{review.comment}</p>
                {review.hasResponse && (
                  <div className="bg-[var(--muted)] p-3 rounded-lg">
                    <p className="text-sm font-medium mb-1">Your Response:</p>
                    <p className="text-sm text-[var(--muted-foreground)]">{review.response}</p>
                  </div>
                )}
              </div>
              <Link
                href={`/reviews/${review.id}`}
                className="px-4 py-2 text-sm border border-[var(--border)] rounded-lg hover:bg-[var(--muted)] transition-colors"
              >
                {review.hasResponse ? "Edit Response" : "Respond"}
              </Link>
            </div>
          </div>
        ))}
      </div>

      {filteredReviews.length === 0 && (
        <div className="seller-card text-center py-12">
          <p className="text-[var(--muted-foreground)]">No reviews match your filters</p>
        </div>
      )}
    </div>
  );
}
