import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Card, CardContent, Button } from "@createconomy/ui";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

// Mock function to get order - replace with Convex query
async function getOrder(id: string) {
  const orders = [
    {
      id: "ord_123456",
      date: "2024-01-15",
      status: "completed",
      total: 79.99,
      subtotal: 79.99,
      tax: 0,
      paymentMethod: "Visa ending in 4242",
      items: [
        {
          id: "1",
          name: "Premium Website Template",
          price: 49.99,
          image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200",
          seller: "Creative Studio",
        },
        {
          id: "2",
          name: "Icon Pack Pro",
          price: 29.99,
          image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200",
          seller: "Design Hub",
        },
      ],
    },
  ];

  return orders.find((o) => o.id === id) || null;
}

export async function generateMetadata({
  params,
}: OrderDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Order ${id}`,
    description: `View details for order ${id}`,
  };
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;
  const order = await getOrder(id);

  if (!order) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Order #{order.id}
          </h1>
          <p className="text-muted-foreground">
            Placed on{" "}
            {new Date(order.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Order Items */}
      <Card>
        <CardContent className="p-6">
          <h2 className="mb-4 font-semibold">Order Items</h2>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 border-b pb-4 last:border-0 last:pb-0"
              >
                <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-muted">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    by {item.seller}
                  </p>
                </div>
                <p className="font-semibold">${item.price.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card>
        <CardContent className="p-6">
          <h2 className="mb-4 font-semibold">Order Summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span>${order.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t pt-2 font-semibold">
              <span>Total</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Info */}
      <Card>
        <CardContent className="p-6">
          <h2 className="mb-4 font-semibold">Payment Information</h2>
          <p className="text-muted-foreground">{order.paymentMethod}</p>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button asChild variant="outline">
          <Link href="/account/orders">Back to Orders</Link>
        </Button>
        <Button variant="outline">Download Invoice</Button>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusStyles: Record<string, string> = {
    completed: "bg-green-100 text-green-800",
    processing: "bg-blue-100 text-blue-800",
    pending: "bg-yellow-100 text-yellow-800",
    cancelled: "bg-red-100 text-red-800",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-sm font-medium capitalize ${
        statusStyles[status] || "bg-gray-100 text-gray-800"
      }`}
    >
      {status}
    </span>
  );
}
