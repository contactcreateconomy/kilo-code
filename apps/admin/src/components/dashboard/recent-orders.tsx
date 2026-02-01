import Link from 'next/link';

// Mock data - in production this would come from Convex
const recentOrders = [
  {
    id: 'ORD-001',
    customer: 'John Doe',
    product: 'Premium UI Kit',
    amount: 49.99,
    status: 'completed',
    date: '2024-01-25',
  },
  {
    id: 'ORD-002',
    customer: 'Alice Brown',
    product: 'Icon Pack Pro',
    amount: 29.99,
    status: 'processing',
    date: '2024-01-25',
  },
  {
    id: 'ORD-003',
    customer: 'Bob Wilson',
    product: 'Landing Page Templates',
    amount: 79.99,
    status: 'completed',
    date: '2024-01-24',
  },
  {
    id: 'ORD-004',
    customer: 'Emily Davis',
    product: 'Photo Presets Collection',
    amount: 39.99,
    status: 'pending',
    date: '2024-01-24',
  },
  {
    id: 'ORD-005',
    customer: 'Charlie Smith',
    product: 'React Component Library',
    amount: 99.99,
    status: 'completed',
    date: '2024-01-23',
  },
];

const statusColors: Record<string, string> = {
  completed: 'badge-success',
  processing: 'badge-info',
  pending: 'badge-warning',
  cancelled: 'badge-error',
  refunded: 'badge-secondary',
};

export function RecentOrders() {
  return (
    <div className="rounded-lg border bg-card shadow-sm">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="font-semibold">Recent Orders</h2>
        <Link
          href="/orders"
          className="text-sm text-primary hover:underline"
        >
          View All →
        </Link>
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Product</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {recentOrders.map((order) => (
            <tr key={order.id}>
              <td>
                <Link
                  href={`/orders/${order.id}`}
                  className="text-primary hover:underline"
                >
                  {order.id}
                </Link>
              </td>
              <td>{order.customer}</td>
              <td className="max-w-[200px] truncate">{order.product}</td>
              <td className="font-medium">${order.amount}</td>
              <td>
                <span className={`badge ${statusColors[order.status]}`}>
                  {order.status}
                </span>
              </td>
              <td className="text-muted-foreground">{order.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
