'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '@createconomy/convex';
import { Loader2 } from 'lucide-react';

type StatusFilter =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'
  | 'partially_refunded'
  | 'disputed'
  | undefined;

const statusColors: Record<string, string> = {
  delivered: 'badge-success',
  shipped: 'badge-success',
  confirmed: 'badge-info',
  processing: 'badge-info',
  pending: 'badge-warning',
  refunded: 'badge-error',
  cancelled: 'badge-error',
  partially_refunded: 'badge-warning',
  disputed: 'badge-error',
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

export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(undefined);

  const orders = useQuery(api.functions.admin.listAllOrders, {
    limit: 20,
    status: statusFilter,
  });
  const stats = useQuery(api.functions.admin.getDashboardStats, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">
            View and manage customer orders
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={statusFilter ?? ''}
            onChange={(e) =>
              setStatusFilter((e.target.value as StatusFilter) || undefined)
            }
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* Order Stats */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">Total Orders</p>
            <p className="text-2xl font-bold">
              {stats.orders.total.toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold">{stats.orders.pending}</p>
            <p className="text-xs text-muted-foreground">
              Awaiting processing
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">Processing</p>
            <p className="text-2xl font-bold">{stats.orders.processing}</p>
            <p className="text-xs text-muted-foreground">In progress</p>
          </div>
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">Cancelled</p>
            <p className="text-2xl font-bold">{stats.orders.cancelled}</p>
          </div>
        </div>
      )}

      <div className="rounded-lg border bg-card shadow-sm">
        {!orders ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : orders.items.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            No orders found
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.items.map((order) => (
                <tr key={String(order._id)}>
                  <td>
                    <Link
                      href={`/orders/${String(order._id)}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td>
                    <div>
                      <span className="font-medium">
                        {order.user?.name ?? 'Unknown'}
                      </span>
                      {order.user?.email && (
                        <p className="text-xs text-muted-foreground">
                          {order.user.email}
                        </p>
                      )}
                    </div>
                  </td>
                  <td>{order.itemCount} items</td>
                  <td className="font-medium">
                    ${centsToDollars(order.total)}
                  </td>
                  <td>
                    <span
                      className={`badge ${statusColors[order.status] ?? ''}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="text-muted-foreground">
                    {formatDate(order.createdAt)}
                  </td>
                  <td>
                    <Link
                      href={`/orders/${String(order._id)}`}
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

      {orders && orders.hasMore && (
        <p className="text-center text-sm text-muted-foreground">
          Showing first {orders.items.length} orders. More results available.
        </p>
      )}
    </div>
  );
}
