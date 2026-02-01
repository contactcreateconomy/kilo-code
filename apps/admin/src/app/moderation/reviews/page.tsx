import type { Metadata } from 'next';
import Link from 'next/link';
import { Pagination } from '@/components/tables/pagination';

export const metadata: Metadata = {
  title: 'Pending Reviews',
  description: 'Approve or reject product reviews',
};

// Mock data - in production this would come from Convex
const pendingReviews = [
  {
    id: '1',
    product: {
      id: 'prod-1',
      name: 'Premium UI Kit',
      seller: 'Creative Designs',
    },
    reviewer: {
      name: 'John Doe',
      email: 'john@example.com',
      purchaseVerified: true,
    },
    rating: 5,
    title: 'Excellent quality and great value!',
    content:
      'This UI kit has everything I needed for my project. The components are well-designed and easy to customize. Highly recommended for any designer or developer.',
    createdAt: '2024-01-25 14:30',
    flags: [],
  },
  {
    id: '2',
    product: {
      id: 'prod-2',
      name: 'Icon Pack Pro',
      seller: 'Digital Assets Pro',
    },
    reviewer: {
      name: 'Alice Brown',
      email: 'alice@example.com',
      purchaseVerified: true,
    },
    rating: 4,
    title: 'Good icons but missing some categories',
    content:
      'The icons are high quality and look great. However, I wish there were more icons in the finance and healthcare categories. Overall a solid purchase.',
    createdAt: '2024-01-25 12:15',
    flags: [],
  },
  {
    id: '3',
    product: {
      id: 'prod-3',
      name: 'Landing Page Templates',
      seller: 'Creative Designs',
    },
    reviewer: {
      name: 'Bob Wilson',
      email: 'bob@example.com',
      purchaseVerified: false,
    },
    rating: 1,
    title: 'Terrible product, do not buy!',
    content:
      'This is the worst template I have ever seen. Complete waste of money. The seller is a scammer.',
    createdAt: '2024-01-25 10:00',
    flags: ['unverified_purchase', 'potentially_fake', 'harsh_language'],
  },
  {
    id: '4',
    product: {
      id: 'prod-4',
      name: 'Photo Presets Collection',
      seller: 'Photo Presets Hub',
    },
    reviewer: {
      name: 'Emily Davis',
      email: 'emily@example.com',
      purchaseVerified: true,
    },
    rating: 5,
    title: 'Perfect for portrait photography',
    content:
      'These presets have transformed my portrait photography workflow. The colors are beautiful and the adjustments are subtle yet impactful. Love it!',
    createdAt: '2024-01-24 16:45',
    flags: [],
  },
];

const flagLabels: Record<string, string> = {
  unverified_purchase: 'Unverified Purchase',
  potentially_fake: 'Potentially Fake',
  harsh_language: 'Harsh Language',
  promotional: 'Promotional Content',
  duplicate: 'Duplicate Review',
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={star <= rating ? 'text-yellow-500' : 'text-gray-300'}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default function PendingReviewsPage() {
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
          <span className="badge badge-warning">
            {pendingReviews.length} pending
          </span>
        </div>
        <div className="flex items-center gap-2">
          <select className="rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
          <select className="rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="">All Flags</option>
            <option value="flagged">Flagged Only</option>
            <option value="clean">No Flags</option>
          </select>
          <button className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
            Approve All Clean
          </button>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="text-blue-500">ℹ️</span>
          <span>
            Reviews from verified purchases are generally safe to approve.
            Flagged reviews require careful examination.
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {pendingReviews.map((review) => (
          <div
            key={review.id}
            className={`rounded-lg border bg-card shadow-sm overflow-hidden ${
              review.flags.length > 0 ? 'border-yellow-300' : ''
            }`}
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <StarRating rating={review.rating} />
                    <h2 className="font-semibold">{review.title}</h2>
                    {review.reviewer.purchaseVerified && (
                      <span className="badge badge-success">
                        Verified Purchase
                      </span>
                    )}
                    {!review.reviewer.purchaseVerified && (
                      <span className="badge badge-warning">Unverified</span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {review.content}
                  </p>
                  <div className="mt-4 flex items-center gap-6 text-sm">
                    <div>
                      <span className="text-muted-foreground">Product: </span>
                      <Link
                        href={`/products/${review.product.id}`}
                        className="text-primary hover:underline"
                      >
                        {review.product.name}
                      </Link>
                      <span className="text-muted-foreground">
                        {' '}
                        by {review.product.seller}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Reviewer: </span>
                      <span className="font-medium">{review.reviewer.name}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        {review.createdAt}
                      </span>
                    </div>
                  </div>
                  {review.flags.length > 0 && (
                    <div className="mt-4 flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        Flags:
                      </span>
                      {review.flags.map((flag) => (
                        <span
                          key={flag}
                          className="badge badge-error text-xs"
                        >
                          {flagLabels[flag] || flag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="border-t px-6 py-4 bg-muted/30 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button className="text-sm text-muted-foreground hover:text-foreground">
                  View Product
                </button>
                <button className="text-sm text-muted-foreground hover:text-foreground">
                  View Reviewer History
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted">
                  Request Edit
                </button>
                <button className="rounded-md border border-red-500 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50">
                  Reject
                </button>
                <button className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
                  Approve
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Pagination
        currentPage={1}
        totalPages={3}
        totalItems={24}
        itemsPerPage={10}
      />
    </div>
  );
}
