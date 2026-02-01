import type { Metadata } from 'next';
import Link from 'next/link';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Order ${id}`,
    description: 'View order details',
  };
}

// Mock order data - in production this would come from Convex
const mockOrder = {
  id: 'ORD-001',
  status: 'processing',
  createdAt: '2024-01-25 10:30 AM',
  updatedAt: '2024-01-25 2:15 PM',
  customer: {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
  },
  items: [
    {
      id: 'item-1',
      name: 'Digital Art Collection',
      price: 49.99,
      quantity: 1,
      seller: 'Jane Smith',
    },
    {
      id: 'item-2',
      name: 'UI Kit Pro',
      price: 79.99,
      quantity: 1,
      seller: 'Bob Wilson',
    },
    {
      id: 'item-3',
      name: 'Icon Pack Bundle',
      price: 19.99,
      quantity: 1,
      seller: 'Alice Brown',
    },
  ],
  subtotal: 149.97,
  fees: 7.50,
  total: 157.47,
  paymentMethod: 'Credit Card (**** 4242)',
  paymentStatus: 'paid',
  timeline: [
    { status: 'Order placed', date: '2024-01-25 10:30 AM' },
    { status: 'Payment confirmed', date: '2024-01-25 10:31 AM' },
    { status: 'Processing started', date: '2024-01-25 2:15 PM' },
  ],
};

const statusColors: Record<string, string> = {
  completed: 'badge-success',
  processing: 'badge-info',
  pending: 'badge-warning',
  refunded: 'badge-error',
  cancelled: 'badge-error',
};

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;
  const order = mockOrder; // In production: await fetchOrder(id)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/orders"
            className="text-muted-foreground hover:text-foreground"
          >
            ← Back to Orders
          </Link>
          <h1 className="text-2xl font-bold">{order.id}</h1>
          <span className={`badge ${statusColors[order.status]}`}>
            {order.status}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent">
            Send Receipt
          </button>
          <button className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90">
            Issue Refund
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Order Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Items */}
          <div className="rounded-lg border bg-card shadow-sm">
            <div className="p-6 border-b">
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
                  <tr key={item.id}>
                    <td className="font-medium">{item.name}</td>
                    <td className="text-muted-foreground">{item.seller}</td>
                    <td>${item.price.toFixed(2)}</td>
                    <td>{item.quantity}</td>
                    <td className="font-medium">
                      ${(item.price * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={4} className="text-right font-medium">
                    Subtotal
                  </td>
                  <td className="font-medium">${order.subtotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colSpan={4} className="text-right text-muted-foreground">
                    Platform Fees
                  </td>
                  <td className="text-muted-foreground">
                    ${order.fees.toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td colSpan={4} className="text-right font-bold">
                    Total
                  </td>
                  <td className="font-bold">${order.total.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Timeline */}
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h3 className="font-semibold mb-4">Order Timeline</h3>
            <div className="space-y-4">
              {order.timeline.map((event, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="h-2 w-2 mt-2 rounded-full bg-primary" />
                  <div>
                    <p className="font-medium">{event.status}</p>
                    <p className="text-sm text-muted-foreground">{event.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status Update */}
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h3 className="font-semibold mb-4">Update Status</h3>
            <div className="flex items-center gap-4">
              <select className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="pending">Pending</option>
                <option value="processing" selected>
                  Processing
                </option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                Update Status
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h3 className="font-semibold mb-4">Customer</h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                {order.customer.name.charAt(0)}
              </div>
              <div>
                <p className="font-medium">{order.customer.name}</p>
                <p className="text-sm text-muted-foreground">
                  {order.customer.email}
                </p>
              </div>
            </div>
            <Link
              href={`/users/${order.customer.id}`}
              className="text-primary hover:underline text-sm"
            >
              View Customer Profile →
            </Link>
          </div>

          {/* Payment Info */}
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h3 className="font-semibold mb-4">Payment</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Method</span>
                <span className="font-medium">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="badge badge-success">{order.paymentStatus}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-medium">${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Order Info */}
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h3 className="font-semibold mb-4">Order Info</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span>{order.createdAt}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Updated</span>
                <span>{order.updatedAt}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
