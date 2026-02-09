import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, Button } from "@createconomy/ui";

export const metadata: Metadata = {
  title: "Order History",
  description: "View your order history.",
};

// Mock orders data - replace with Convex query
const orders = [
  {
    id: "ord_123456",
    date: "2024-01-15",
    status: "completed",
    total: 79.99,
    items: [
      {
        id: "1",
        name: "Premium Website Template",
        price: 49.99,
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=100",
      },
      {
        id: "2",
        name: "Icon Pack Pro",
        price: 29.99,
        image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100",
      },
    ],
  },
  {
    id: "ord_123457",
    date: "2024-01-10",
    status: "completed",
    total: 99.99,
    items: [
      {
        id: "3",
        name: "Complete React Course",
        price: 99.99,
        image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=100",
      },
    ],
  },
];

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Order History</h1>
        <p className="text-muted-foreground">
          View and track your past orders
        </p>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <PackageIcon className="h-12 w-12 text-muted-foreground" />
            <h2 className="mt-4 text-lg font-semibold">No orders yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              When you make a purchase, your orders will appear here.
            </p>
            <Button asChild className="mt-6">
              <Link href="/products">Browse Products</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium">Order #{order.id}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <StatusBadge status={order.status} />
                    <span className="font-semibold">
                      ${order.total.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 border-t pt-4">
                  <div className="flex flex-wrap gap-2">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2"
                      >
                        <span className="text-sm">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/account/orders/${order.id}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusStyles: Record<string, string> = {
    completed: "bg-success/10 text-success",
    processing: "bg-primary/10 text-primary",
    pending: "bg-warning/10 text-warning",
    cancelled: "bg-destructive/10 text-destructive",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
        statusStyles[status] || "bg-muted text-muted-foreground"
      }`}
    >
      {status}
    </span>
  );
}

function PackageIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m7.5 4.27 9 5.15" />
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}
