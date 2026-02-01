"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function ReviewDetailPage() {
  const params = useParams();
  const reviewId = params.id as string;

  // Mock review data
  const review = {
    id: reviewId,
    productName: "Handcrafted Wooden Bowl",
    productId: "prod-1",
    productImage: "/placeholder-product.jpg",
    customerName: "Sarah M.",
    customerEmail: "sarah.m@example.com",
    rating: 5,
    comment:
      "Absolutely beautiful craftsmanship! The bowl is even more stunning in person. The wood grain is gorgeous and the finish is smooth and professional. Will definitely order again.",
    date: "2024-01-18",
    hasResponse: true,
    response:
      "Thank you so much for your kind words, Sarah! We're thrilled you love the bowl. Each piece is handcrafted with care, and it means the world to us that you appreciate the details.",
    responseDate: "2024-01-19",
    helpful: 12,
    orderId: "ORD-12345",
  };

  const [response, setResponse] = useState(review.response || "");
  const [isEditing, setIsEditing] = useState(!review.hasResponse);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Response submitted:", response);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
        <Link href="/reviews" className="hover:text-[var(--foreground)]">
          Reviews
        </Link>
        <span>/</span>
        <span>Review #{reviewId}</span>
      </nav>

      {/* Review Card */}
      <div className="seller-card">
        <div className="flex items-start gap-6">
          {/* Product Image */}
          <div className="w-24 h-24 bg-[var(--muted)] rounded-lg flex-shrink-0 flex items-center justify-center">
            <span className="text-4xl">🖼️</span>
          </div>

          {/* Review Content */}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <Link
                  href={`/products/${review.productId}`}
                  className="text-lg font-semibold hover:text-[var(--primary)]"
                >
                  {review.productName}
                </Link>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-5 h-5 ${star <= review.rating ? "text-yellow-400" : "text-gray-300"} fill-current`}
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
                {new Date(review.date).toLocaleDateString()}
              </span>
            </div>

            <div className="mt-4">
              <p className="text-sm text-[var(--muted-foreground)] mb-2">
                {review.customerName}
              </p>
              <p className="text-[var(--foreground)]">{review.comment}</p>
            </div>

            <div className="flex items-center gap-4 mt-4 text-sm text-[var(--muted-foreground)]">
              <span>{review.helpful} people found this helpful</span>
              <span>•</span>
              <Link
                href={`/orders/${review.orderId}`}
                className="hover:text-[var(--primary)]"
              >
                Order #{review.orderId}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Response Section */}
      <div className="seller-card">
        <h2 className="text-lg font-semibold mb-4">Your Response</h2>

        {review.hasResponse && !isEditing ? (
          <div>
            <div className="bg-[var(--muted)] p-4 rounded-lg">
              <p>{review.response}</p>
              <p className="text-sm text-[var(--muted-foreground)] mt-2">
                Responded on {new Date(review.responseDate!).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="mt-4 px-4 py-2 border border-[var(--border)] rounded-lg hover:bg-[var(--muted)] transition-colors"
            >
              Edit Response
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              rows={5}
              className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none"
              placeholder="Write a thoughtful response to this review..."
            />
            <p className="text-sm text-[var(--muted-foreground)] mt-2">
              {response.length}/500 characters
            </p>

            <div className="flex items-center gap-4 mt-4">
              <button
                type="submit"
                className="px-6 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg hover:opacity-90 transition-opacity"
              >
                {review.hasResponse ? "Update Response" : "Post Response"}
              </button>
              {review.hasResponse && (
                <button
                  type="button"
                  onClick={() => {
                    setResponse(review.response || "");
                    setIsEditing(false);
                  }}
                  className="px-6 py-2 border border-[var(--border)] rounded-lg hover:bg-[var(--muted)] transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}
      </div>

      {/* Response Tips */}
      <div className="seller-card bg-[var(--muted)]">
        <h3 className="font-semibold mb-3">Tips for Responding to Reviews</h3>
        <ul className="space-y-2 text-sm text-[var(--muted-foreground)]">
          <li className="flex items-start gap-2">
            <span className="text-[var(--primary)]">•</span>
            <span>Thank the customer for their feedback</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[var(--primary)]">•</span>
            <span>Address any specific concerns they mentioned</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[var(--primary)]">•</span>
            <span>Keep your response professional and friendly</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[var(--primary)]">•</span>
            <span>Offer solutions for negative experiences</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
