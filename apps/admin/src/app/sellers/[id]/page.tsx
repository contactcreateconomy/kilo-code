'use client';

import { use } from 'react';
import Link from 'next/link';
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

const statusColors: Record<string, string> = {
  active: 'badge-success',
  suspended: 'badge-error',
  pending: 'badge-warning',
  draft: 'badge-secondary',
};

export default function SellerDetailPage({ params }: Props) {
  const { id } = use(params);
  const seller = useQuery(api.functions.admin.getSellerById, {
    sellerId: id as Id<'sellers'>,
  });

  if (seller === undefined) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (seller === null) {
    return (
      <div className="space-y-4">
        <Link href="/sellers" className="text-muted-foreground hover:text-foreground">
          ← Back to Sellers
        </Link>
        <p className="py-20 text-center text-muted-foreground">Seller not found</p>
      </div>
    );
  }

  const sellerStatus = !seller.isApproved
    ? 'pending'
    : seller.isActive
      ? 'active'
      : 'suspended';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/sellers"
            className="text-muted-foreground hover:text-foreground"
          >
            ← Back to Sellers
          </Link>
          <span className="text-muted-foreground">/</span>
          <h1 className="text-3xl font-bold tracking-tight">
            {seller.businessName ?? 'Unnamed Store'}
          </h1>
          <span className={`badge ${statusColors[sellerStatus] ?? ''}`}>
            {sellerStatus}
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Seller Profile */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted text-2xl font-bold">
                {(seller.user?.name ?? '?').charAt(0)}
              </div>
              <h2 className="mt-4 text-xl font-semibold">
                {seller.user?.name ?? 'Unknown'}
              </h2>
              <p className="text-muted-foreground">{seller.user?.email}</p>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Joined</span>
                <span>{formatDate(seller.createdAt)}</span>
              </div>
              {seller.approvedAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Approved</span>
                  <span>{formatDate(seller.approvedAt)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Stripe Onboarded</span>
                <span>{seller.stripeOnboarded ? 'Yes' : 'No'}</span>
              </div>
              {seller.connectAccount && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Charges Enabled</span>
                    <span>{seller.connectAccount.chargesEnabled ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payouts Enabled</span>
                    <span>{seller.connectAccount.payoutsEnabled ? 'Yes' : 'No'}</span>
                  </div>
                </>
              )}
            </div>

            {(seller.websiteUrl || seller.twitterHandle) && (
              <div className="mt-6 border-t pt-6">
                <h3 className="mb-3 font-medium">Social Links</h3>
                <div className="space-y-2 text-sm">
                  {seller.websiteUrl && (
                    <a
                      href={seller.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-primary hover:underline"
                    >
                      🌐 {seller.websiteUrl}
                    </a>
                  )}
                  {seller.twitterHandle && (
                    <p className="text-muted-foreground">
                      𝕏 {seller.twitterHandle}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Store Description */}
          {seller.description && (
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <h3 className="mb-3 font-semibold">Store Description</h3>
              <p className="text-sm text-muted-foreground">
                {seller.description}
              </p>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-lg border bg-card p-4 shadow-sm">
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold">
                ${centsToDollars(seller.totalRevenue ?? 0)}
              </p>
            </div>
            <div className="rounded-lg border bg-card p-4 shadow-sm">
              <p className="text-sm text-muted-foreground">Total Sales</p>
              <p className="text-2xl font-bold">{seller.totalSales ?? 0}</p>
            </div>
            <div className="rounded-lg border bg-card p-4 shadow-sm">
              <p className="text-sm text-muted-foreground">Products</p>
              <p className="text-2xl font-bold">{seller.products.length}</p>
            </div>
            <div className="rounded-lg border bg-card p-4 shadow-sm">
              <p className="text-sm text-muted-foreground">Recent Orders</p>
              <p className="text-2xl font-bold">{seller.recentOrders.length}</p>
            </div>
          </div>

          {/* Products */}
          <div className="rounded-lg border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b p-4">
              <h3 className="font-semibold">Products</h3>
            </div>
            {seller.products.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No products yet
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Sales</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {seller.products.map((product) => (
                    <tr key={String(product.id)}>
                      <td className="font-medium">{product.name}</td>
                      <td>${centsToDollars(product.price)}</td>
                      <td>{product.salesCount}</td>
                      <td>
                        <span
                          className={`badge ${statusColors[product.status] ?? ''}`}
                        >
                          {product.status}
                        </span>
                      </td>
                      <td>
                        <Link
                          href={`/products/${String(product.id)}`}
                          className="text-sm text-primary hover:underline"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Recent Orders */}
          <div className="rounded-lg border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b p-4">
              <h3 className="font-semibold">Recent Orders</h3>
            </div>
            {seller.recentOrders.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No orders yet
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Product</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {seller.recentOrders.map((order) =>
                    order ? (
                      <tr key={String(order.id)}>
                        <td>
                          <Link
                            href={`/orders/${String(order.id)}`}
                            className="text-primary hover:underline"
                          >
                            {order.orderNumber}
                          </Link>
                        </td>
                        <td>{order.productName}</td>
                        <td>{order.buyerName ?? 'Unknown'}</td>
                        <td className="font-medium">
                          ${centsToDollars(order.total)}
                        </td>
                        <td>
                          <span className="badge badge-secondary capitalize">
                            {order.status}
                          </span>
                        </td>
                        <td className="text-muted-foreground">
                          {formatDate(order.createdAt)}
                        </td>
                      </tr>
                    ) : null
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
