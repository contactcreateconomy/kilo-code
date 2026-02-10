'use client';

import Link from 'next/link';
import { use, useState, useCallback } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@createconomy/convex';
import { Loader2 } from 'lucide-react';
import type { Id } from '@createconomy/convex/dataModel';

type Props = {
  params: Promise<{ id: string }>;
};

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
  return new Date(timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function OrderDetailPage({ params }: Props) {
  const { id } = use(params);
  const order = useQuery(api.functions.admin.getOrderById, {
    orderId: id as Id<'orders'>,
  });
  const forceUpdate = useMutation(api.functions.admin.forceUpdateOrderStatus);

  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusUpdate = useCallback(async () => {
    if (!selectedStatus) return;
    setIsUpdating(true);
    try {
      await forceUpdate({
        orderId: id as Id<'orders'>,
        status: selectedStatus as 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded' | 'partially_refunded' | 'disputed',
      });
    } finally {
      setIsUpdating(false);
    }
  }, [forceUpdate, id, selectedStatus]);

  if (order === undefined) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (order === null) {
    return (
      <div className="space-y-4">
        <Link href="/orders" className="text-muted-foreground hover:text-foreground">
          ← Back to Orders
        </Link>
        <p className="py-20 text-center text-muted-foreground">Order not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/orders" className="text-muted-foreground hover:text-foreground">
            ← Back to Orders
          </Link>
          <h1 className="text-2xl font-bold">{order.orderNumber}</h1>
          <span className={`badge ${statusColors[order.status] ?? ''}`}>
            {order.status}
          </span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Order Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Items */}
          <div className="rounded-lg border bg-card shadow-sm">
            <div className="border-b p-6">
              <h3 className="font-semibold">Order Items</h3>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Seller</th>
                  <th>Price</th>
                  <th>Qty</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={String(item._id)}>
                    <td className="font-medium">{item.productName}</td>
                    <td className="text-muted-foreground">{item.sellerName}</td>
                    <td>${centsToDollars(item.price)}</td>
                    <td>{item.quantity}</td>
                    <td className="font-medium">
                      ${centsToDollars(item.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={4} className="text-right font-medium">
                    Subtotal
                  </td>
                  <td className="font-medium">
                    ${centsToDollars(order.subtotal)}
                  </td>
                </tr>
                {order.tax > 0 && (
                  <tr>
                    <td colSpan={4} className="text-right text-muted-foreground">
                      Tax
                    </td>
                    <td className="text-muted-foreground">
                      ${centsToDollars(order.tax)}
                    </td>
                  </tr>
                )}
                {order.discount > 0 && (
                  <tr>
                    <td colSpan={4} className="text-right text-muted-foreground">
                      Discount
                    </td>
                    <td className="text-muted-foreground">
                      -${centsToDollars(order.discount)}
                    </td>
                  </tr>
                )}
                <tr>
                  <td colSpan={4} className="text-right font-bold">
                    Total
                  </td>
                  <td className="font-bold">${centsToDollars(order.total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Status Update */}
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h3 className="mb-4 font-semibold">Update Status</h3>
            <div className="flex items-center gap-4">
              <select
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={selectedStatus || order.status}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
              </select>
              <button
                onClick={handleStatusUpdate}
                disabled={
                  isUpdating ||
                  !selectedStatus ||
                  selectedStatus === order.status
                }
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {isUpdating ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h3 className="mb-4 font-semibold">Customer</h3>
            {order.user ? (
              <>
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    {(order.user.name ?? '?').charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{order.user.name ?? 'Unknown'}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.user.email ?? '—'}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/users/${String(order.user.id)}`}
                  className="text-sm text-primary hover:underline"
                >
                  View Customer Profile →
                </Link>
              </>
            ) : (
              <p className="text-muted-foreground">Customer info unavailable</p>
            )}
          </div>

          {/* Payment Info */}
          {order.payment && (
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <h3 className="mb-4 font-semibold">Payment</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Method</span>
                  <span className="font-medium">
                    {order.payment.paymentMethod ?? 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className="badge badge-success">
                    {order.payment.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-medium">
                    ${centsToDollars(order.payment.amount)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Order Info */}
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h3 className="mb-4 font-semibold">Order Info</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span>{formatDate(order.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Updated</span>
                <span>{formatDate(order.updatedAt)}</span>
              </div>
              {order.paidAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Paid</span>
                  <span>{formatDate(order.paidAt)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
