'use client';

import Link from 'next/link';
import { use } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@createconomy/convex';
import { Loader2 } from 'lucide-react';
import type { Id } from '@createconomy/convex/dataModel';

type Props = {
  params: Promise<{ id: string }>;
};

function centsToDollars(cents: number): string {
  return (cents / 100).toFixed(2);
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function ProductDetailPage({ params }: Props) {
  const { id } = use(params);
  const product = useQuery(api.functions.admin.getProductById, {
    productId: id as Id<'products'>,
  });

  if (product === undefined) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (product === null) {
    return (
      <div className="space-y-4">
        <Link href="/products" className="text-muted-foreground hover:text-foreground">
          ← Back to Products
        </Link>
        <p className="py-20 text-center text-muted-foreground">Product not found</p>
      </div>
    );
  }

  const conversionRate =
    product.viewCount > 0
      ? ((product.salesCount / product.viewCount) * 100).toFixed(1)
      : '0';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/products" className="text-muted-foreground hover:text-foreground">
          ← Back to Products
        </Link>
        <div className="flex items-center gap-2">
          <a
            href={`${process.env['NEXT_PUBLIC_MARKETPLACE_URL']}/products/${product.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            View on Marketplace
          </a>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Product Stats */}
        <div className="md:col-span-1 space-y-4">
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h3 className="mb-4 font-semibold">Product Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Sales</span>
                <span className="font-medium">{product.salesCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Views</span>
                <span className="font-medium">{product.viewCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Conversion Rate</span>
                <span className="font-medium">{conversionRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Revenue</span>
                <span className="font-medium">
                  ${centsToDollars(product.salesCount * product.price)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reviews</span>
                <span className="font-medium">
                  {product.reviewCount}
                  {product.averageRating
                    ? ` (${product.averageRating.toFixed(1)}★)`
                    : ''}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium capitalize">{product.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span className="font-medium">
                  {formatDate(product.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {product.seller && (
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <h3 className="mb-4 font-semibold">Seller Info</h3>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  {(product.seller.name ?? '?').charAt(0)}
                </div>
                <div>
                  <p className="font-medium">
                    {product.seller.name ?? 'Unknown'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {product.seller.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          {product.category && (
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <h3 className="mb-4 font-semibold">Category</h3>
              <Link
                href={`/categories/${String(product.category.id)}`}
                className="text-primary hover:underline"
              >
                {product.category.name}
              </Link>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h3 className="mb-4 text-xl font-semibold">{product.name}</h3>
            <p className="text-2xl font-bold">
              ${centsToDollars(product.price)}
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                {product.currency}
              </span>
            </p>
            {product.shortDescription && (
              <p className="mt-4 text-muted-foreground">
                {product.shortDescription}
              </p>
            )}
            <div className="mt-4">
              <h4 className="mb-2 font-medium">Description</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {product.description}
              </p>
            </div>
            {product.tags && product.tags.length > 0 && (
              <div className="mt-4">
                <h4 className="mb-2 font-medium">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-muted px-3 py-1 text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Images */}
          {product.images.length > 0 && (
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <h3 className="mb-4 font-semibold">Product Images</h3>
              <div className="grid grid-cols-3 gap-4">
                {product.images.map((img) => (
                  <div
                    key={String(img.id)}
                    className="aspect-square rounded-lg bg-muted overflow-hidden"
                  >
                    <img
                      src={img.url}
                      alt={img.altText ?? product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
