"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@createconomy/convex";
import { useAuth } from "@/hooks/use-auth";
import { formatPriceCents, formatDate } from "@/lib/utils";
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
  Skeleton,
} from "@createconomy/ui";
import { Package, Eye, LogIn } from "lucide-react";

function getStatusBadgeVariant(
  status: string
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "completed":
      return "default";
    case "processing":
    case "confirmed":
      return "secondary";
    case "pending":
      return "outline";
    case "cancelled":
    case "refunded":
      return "destructive";
    default:
      return "outline";
  }
}

function formatStatusLabel(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function OrdersList() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const orders = useQuery(
    api.functions.orders.getUserOrders,
    isAuthenticated ? {} : "skip"
  );

  // Auth loading state
  if (authLoading) {
    return <OrdersListSkeleton />;
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Order History</h1>
          <p className="text-muted-foreground">
            View and track your past orders
          </p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <LogIn className="h-12 w-12 text-muted-foreground" />
            <h2 className="mt-4 text-lg font-semibold">Sign in required</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Please sign in to view your orders.
            </p>
            <Button asChild className="mt-6">
              <Link href="/auth/signin">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Data loading state
  if (orders === undefined) {
    return <OrdersListSkeleton />;
  }

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
                  <TableRow key={order._id}>
                    <TableCell className="font-medium">
                      {order.orderNumber}
                    </TableCell>
                    <TableCell>
                      {formatDate(new Date(order.createdAt))}
                    </TableCell>
                    <TableCell>
                      {order.itemCount}{" "}
                      {order.itemCount === 1 ? "item" : "items"}
                    </TableCell>
                    <TableCell>
                      {formatPriceCents(order.total)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(order.status)}>
                        {formatStatusLabel(order.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/account/orders/${order._id}`}>
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
              <Card key={order._id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{order.orderNumber}</p>
                    <Badge variant={getStatusBadgeVariant(order.status)}>
                      {formatStatusLabel(order.status)}
                    </Badge>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                      {formatDate(new Date(order.createdAt))}
                    </span>
                    <span>
                      {order.itemCount}{" "}
                      {order.itemCount === 1 ? "item" : "items"}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="font-semibold">
                      {formatPriceCents(order.total)}
                    </span>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/account/orders/${order._id}`}>
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

function OrdersListSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Order History</h1>
        <p className="text-muted-foreground">
          View and track your past orders
        </p>
      </div>

      {/* Desktop skeleton */}
      <Card className="hidden md:block">
        <div className="p-4 space-y-4">
          {/* Table header skeleton */}
          <div className="grid grid-cols-6 gap-4 pb-2 border-b">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12 ml-auto" />
          </div>
          {/* Table rows skeleton */}
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="grid grid-cols-6 gap-4 py-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-8 w-16 ml-auto" />
            </div>
          ))}
        </div>
      </Card>

      {/* Mobile skeleton */}
      <div className="space-y-4 md:hidden">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-8 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
