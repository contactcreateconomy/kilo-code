import type { Metadata } from 'next';
import Link from 'next/link';
import { Pagination } from '@/components/tables/pagination';

export const metadata: Metadata = {
  title: 'Orders',
  description: 'Manage orders on the platform',
};

// Mock data - in production this would come from Convex
const orders = [
  {
    id: 'ORD-001',
    customer: 'John Doe',
    email: 'john@example.com',
    total: 149.99,
    status: 'completed',
    items: 3,
    date: '2024-01-25',
  },
  {
    id: 'ORD-002',
    customer: 'Jane Smith',
    email: 'jane@example.com',
    total: 79.99,
    status: 'processing',
    items: 1,
    date: '2024-01-24',
  },
  {
    id: 'ORD-003',
    customer: 'Bob Wilson',
    email: 'bob@example.com',
    total: 299.99,
    status: 'pending',
    items: 5,
    date: '2024-01-24',
  },
  {
    id: 'ORD-004',
    customer: 'Alice Brown',
    email: 'alice@example.com',
    total: 49.99,
    status: 'refunded',
    items: 1,
    date: '2024-01-23',
  },
  {
    id: 'ORD-005',
    customer: 'Charlie Davis',
    email: 'charlie@example.com',
    total: 199.99,
    status: 'completed',
    items: 2,
    date: '2024-01-22',
  },
];

const statusColors: Record<string, string> = {
  completed: 'badge-success',
  processing: 'badge-info',
  pending: 'badge-warning',
  refunded: 'badge-error',
  cancelled: 'badge-error',
};

export default function OrdersPage() {
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
          <input
            type="search"
            placeholder="Search orders..."
            className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <select className="rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="refunded">Refunded</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <input
            type="date"
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <input
            type="date"
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <button className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent">
            Export CSV
          </button>
        </div>
      </div>

      {/* Order Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Total Orders</p>
          <p className="text-2xl font-bold">2,350</p>
          <p className="text-xs text-success">+12% from last month</p>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Pending</p>
          <p className="text-2xl font-bold">45</p>
          <p className="text-xs text-muted-foreground">Awaiting processing</p>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Processing</p>
          <p className="text-2xl font-bold">128</p>
          <p className="text-xs text-muted-foreground">In progress</p>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Refund Requests</p>
          <p className="text-2xl font-bold">8</p>
          <p className="text-xs text-destructive">Needs attention</p>
        </div>
      </div>

      <div className="rounded-lg border bg-card shadow-sm">
        <table className="data-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>
                  <Link
                    href={`/orders/${order.id}`}
                    className="text-primary hover:underline font-medium"
                  >
                    {order.id}
                  </Link>
                </td>
                <td>
                  <div>
                    <span className="font-medium">{order.customer}</span>
                    <p className="text-xs text-muted-foreground">
                      {order.email}
                    </p>
                  </div>
                </td>
                <td>{order.items} items</td>
                <td className="font-medium">${order.total.toFixed(2)}</td>
                <td>
                  <span className={`badge ${statusColors[order.status]}`}>
                    {order.status}
                  </span>
                </td>
                <td className="text-muted-foreground">{order.date}</td>
                <td>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/orders/${order.id}`}
                      className="text-primary hover:underline text-sm"
                    >
                      View
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={1}
        totalPages={50}
        totalItems={500}
        itemsPerPage={10}
      />
    </div>
  );
}
