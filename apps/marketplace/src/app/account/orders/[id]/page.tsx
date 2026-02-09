import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Separator,
} from "@createconomy/ui";
import { ArrowLeft, Download } from "lucide-react";

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
          image:
            "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200",
          seller: "Creative Studio",
        },
        {
          id: "2",
          name: "Icon Pack Pro",
          price: 29.99,
          image:
            "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200",
          seller: "Design Hub",
        },
      ],
    },
  ];

  return orders.find((o) => o.id === id) || null;
}

function getStatusBadgeVariant(
  status: string
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "completed":
      return "default";
    case "processing":
      return "secondary";
    case "pending":
      return "outline";
    case "cancelled":
      return "destructive";
    default:
      return "outline";
  }
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

export default async function OrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const { id } = await params;
  const order = await getOrder(id);

  if (!order) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
        <Badge
          variant={getStatusBadgeVariant(order.status)}
          className="w-fit text-sm"
        >
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </Badge>
      </div>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div key={item.id}>
                <div className="flex items-center gap-4">
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
                {index < order.items.length - 1 && (
                  <Separator className="mt-4" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>${order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tax</span>
            <span>${order.tax.toFixed(2)}</span>
          </div>
          <Separator />
          <div className="flex justify-between pt-1 font-semibold">
            <span>Total</span>
            <span>${order.total.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Payment Info */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{order.paymentMethod}</p>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button asChild variant="outline">
          <Link href="/account/orders">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Link>
        </Button>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Download Invoice
        </Button>
      </div>
    </div>
  );
}
