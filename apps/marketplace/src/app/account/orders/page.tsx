import type { Metadata } from "next";
import Link from "next/link";
import {
  Card,
  CardContent,
  Button,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@createconomy/ui";
import { Package, Eye } from "lucide-react";

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
        image:
          "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=100",
      },
      {
        id: "2",
        name: "Icon Pack Pro",
        price: 29.99,
        image:
          "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100",
      },
    ],
  },
  {
    id: "ord_123457",
    date: "2024-01-10",
    status: "processing",
    total: 99.99,
    items: [
      {
        id: "3",
        name: "Complete React Course",
        price: 99.99,
        image:
          "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=100",
      },
    ],
  },
  {
    id: "ord_123458",
    date: "2024-01-05",
    status: "pending",
    total: 34.99,
    items: [
      {
        id: "4",
        name: "UI Kit Basic",
        price: 34.99,
        image:
          "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100",
      },
    ],
  },
  {
    id: "ord_123459",
    date: "2023-12-20",
    status: "cancelled",
    total: 149.99,
    items: [
      {
        id: "5",
        name: "Design System Pro",
        price: 149.99,
        image:
          "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=100",
      },
    ],
  },
];

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
            <Package className="h-12 w-12 text-muted-foreground" />
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
        <>
          {/* Desktop Table View */}
          <Card className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>
                      {new Date(order.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      {order.items.length}{" "}
                      {order.items.length === 1 ? "item" : "items"}
                    </TableCell>
                    <TableCell>${order.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(order.status)}>
                        {order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/account/orders/${order.id}`}>
                          <Eye className="mr-1.5 h-3.5 w-3.5" />
                          View
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {/* Mobile Card View */}
          <div className="space-y-4 md:hidden">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{order.id}</p>
                    <Badge variant={getStatusBadgeVariant(order.status)}>
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                      {new Date(order.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <span>
                      {order.items.length}{" "}
                      {order.items.length === 1 ? "item" : "items"}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="font-semibold">
                      ${order.total.toFixed(2)}
                    </span>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/account/orders/${order.id}`}>
                        <Eye className="mr-1.5 h-3.5 w-3.5" />
                        View
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
