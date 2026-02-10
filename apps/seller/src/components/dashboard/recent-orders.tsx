"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@createconomy/ui/components/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@createconomy/ui/components/table";
import { Badge } from "@createconomy/ui/components/badge";
import { Button } from "@createconomy/ui/components/button";
import { useQuery } from "convex/react";
import { api } from "@createconomy/convex";
import { Loader2 } from "lucide-react";

function centsToDollars(cents: number): string {
  return (cents / 100).toFixed(2);
}

const statusStyles: Record<string, string> = {
  delivered: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  shipped: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  processing: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  pending: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  confirmed: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
  refunded: "bg-purple-500/10 text-purple-500 border-purple-500/20",
};

export function RecentOrders() {
  const rawOrders = useQuery(api.functions.orders.getSellerOrders, { limit: 5 });

  if (!rawOrders) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1.5">
            <CardTitle className="text-lg">Recent Orders</CardTitle>
            <CardDescription>Latest customer transactions</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Filter out null entries from the backend
  const orders = rawOrders.filter(
    (o): o is NonNullable<typeof o> => o !== null
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1.5">
          <CardTitle className="text-lg">Recent Orders</CardTitle>
          <CardDescription>Latest customer transactions</CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/orders">View All →</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No orders yet
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell>
                    <Link
                      href={`/orders/${order._id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {order.orderNumber}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {order.buyer?.name ?? order.buyer?.email ?? "Unknown"}
                  </TableCell>
                  <TableCell className="font-medium">
                    ${centsToDollars(order.total)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={statusStyles[order.status] ?? ""}
                    >
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
