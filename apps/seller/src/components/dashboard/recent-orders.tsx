import Link from "next/link";

interface Order {
  id: string;
  customer: string;
  product: string;
  amount: number;
  status: "pending" | "processing" | "shipped" | "delivered";
  date: string;
}

interface RecentOrdersProps {
  orders: Order[];
}

export function RecentOrders({ orders }: RecentOrdersProps) {
  const statusColors = {
    pending: "status-pending",
    processing: "status-pending",
    shipped: "status-active",
    delivered: "status-active",
  };

  return (
    <div className="seller-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Recent Orders</h3>
        <Link
          href="/orders"
          className="text-sm text-[var(--primary)] hover:underline"
        >
          View all
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="text-left py-3 px-2 text-sm font-medium text-[var(--muted-foreground)]">
                Order
              </th>
              <th className="text-left py-3 px-2 text-sm font-medium text-[var(--muted-foreground)]">
                Customer
              </th>
              <th className="text-left py-3 px-2 text-sm font-medium text-[var(--muted-foreground)]">
                Product
              </th>
              <th className="text-right py-3 px-2 text-sm font-medium text-[var(--muted-foreground)]">
                Amount
              </th>
              <th className="text-right py-3 px-2 text-sm font-medium text-[var(--muted-foreground)]">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)]/50"
              >
                <td className="py-3 px-2">
                  <Link
                    href={`/orders/${order.id}`}
                    className="font-medium hover:text-[var(--primary)]"
                  >
                    #{order.id}
                  </Link>
                </td>
                <td className="py-3 px-2 text-sm">{order.customer}</td>
                <td className="py-3 px-2 text-sm text-[var(--muted-foreground)]">
                  {order.product}
                </td>
                <td className="py-3 px-2 text-right font-medium">
                  ${order.amount.toFixed(2)}
                </td>
                <td className="py-3 px-2 text-right">
                  <span className={`status-badge ${statusColors[order.status]}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {orders.length === 0 && (
        <p className="text-center py-8 text-[var(--muted-foreground)]">
          No recent orders
        </p>
      )}
    </div>
  );
}
