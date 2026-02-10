'use client';

import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '@createconomy/convex';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@createconomy/ui/components/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@createconomy/ui/components/table';
import { Badge } from '@createconomy/ui/components/badge';
import { Button } from '@createconomy/ui/components/button';
import { Loader2 } from 'lucide-react';

const statusStyles: Record<string, string> = {
  delivered: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  shipped: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  confirmed: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  processing: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  pending: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  cancelled: 'bg-red-500/10 text-red-500 border-red-500/20',
  refunded: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  partially_refunded: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  disputed: 'bg-red-500/10 text-red-500 border-red-500/20',
};

function centsToDollars(cents: number): string {
  return (cents / 100).toFixed(2);
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function RecentOrders() {
  const orders = useQuery(api.functions.admin.getRecentOrders, { limit: 5 });

  if (!orders) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1.5">
            <CardTitle className="text-lg">Recent Orders</CardTitle>
            <CardDescription>Latest customer transactions</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

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
          <p className="text-center text-muted-foreground py-8">
            No orders yet
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <Link
                      href={`/orders/${order.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {order.orderNumber}
                    </Link>
                  </TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {order.productName}
                  </TableCell>
                  <TableCell className="font-medium">
                    ${centsToDollars(order.total)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={statusStyles[order.status] ?? ''}
                    >
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1).replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(order.createdAt)}
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
