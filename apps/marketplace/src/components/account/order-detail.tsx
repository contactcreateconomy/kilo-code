"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery, useMutation } from "convex/react";
import { api } from "@createconomy/convex";
import type { Id } from "@createconomy/convex/dataModel";
import { useAuth } from "@/hooks/use-auth";
import { formatPriceCents, formatDate } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Separator,
  Skeleton,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@createconomy/ui";
import { useToast } from "@createconomy/ui";
import { ArrowLeft, Download, XCircle, LogIn } from "lucide-react";

interface OrderDetailProps {
  orderId: string;
}

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

function getPaymentStatusLabel(status: string): string {
  switch (status) {
    case "paid":
      return "Paid";
    case "pending":
      return "Payment Pending";
    case "failed":
      return "Payment Failed";
    case "refunded":
      return "Refunded";
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
}

export function OrderDetail({ orderId }: OrderDetailProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const order = useQuery(
    api.functions.orders.getOrder,
    isAuthenticated ? { orderId: orderId as Id<"orders"> } : "skip"
  );

  const cancelOrder = useMutation(api.functions.orders.cancelOrder);
  const toast = useToast();

  // Auth loading state
  if (authLoading) {
    return <OrderDetailSkeleton />;
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <LogIn className="h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-lg font-semibold">Sign in required</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Please sign in to view order details.
          </p>
          <Button asChild className="mt-6">
            <Link href="/auth/signin">Sign In</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Data loading state
  if (order === undefined) {
    return <OrderDetailSkeleton />;
  }

  // Order not found
  if (order === null) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <XCircle className="h-12 w-12 text-muted-foreground" />
            <h2 className="mt-4 text-lg font-semibold">Order not found</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              The order you&apos;re looking for doesn&apos;t exist or you
              don&apos;t have permission to view it.
            </p>
            <Button asChild className="mt-6" variant="outline">
              <Link href="/account/orders">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Orders
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const canCancel =
    order.status === "pending" || order.status === "confirmed";

  async function handleCancelOrder() {
    setIsCancelling(true);
    try {
      await cancelOrder({
        orderId: orderId as Id<"orders">,
        reason: "Cancelled by customer",
      });
      toast.addToast("Order cancelled successfully", "success");
      setCancelDialogOpen(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to cancel order";
      toast.addToast(message, "error");
    } finally {
      setIsCancelling(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Order #{order.orderNumber}
          </h1>
          <p className="text-muted-foreground">
            Placed on {formatDate(new Date(order.createdAt))}
          </p>
        </div>
        <Badge
          variant={getStatusBadgeVariant(order.status)}
          className="w-fit text-sm"
        >
          {formatStatusLabel(order.status)}
        </Badge>
      </div>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.items?.map((item, index) => {
              const productName = item.product?.name ?? "Unknown Product";
              const productImage = item.product?.primaryImage;
              const itemKey = item.product?.id ?? `item-${index}`;

              return (
                <div key={itemKey}>
                  <div className="flex items-center gap-4">
                    <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-muted">
                      {productImage ? (
                        <Image
                          src={productImage}
                          alt={productName}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{productName}</p>
                      <p className="text-sm text-muted-foreground">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold">
                      {formatPriceCents(item.subtotal)}
                    </p>
                  </div>
                  {order.items && index < order.items.length - 1 && (
                    <Separator className="mt-4" />
                  )}
                </div>
              );
            })}
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
            <span>{formatPriceCents(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tax</span>
            <span>{formatPriceCents(order.tax)}</span>
          </div>
          {order.shipping != null && order.shipping > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>{formatPriceCents(order.shipping)}</span>
            </div>
          )}
          {order.discount != null && order.discount > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Discount</span>
              <span className="text-green-600">
                -{formatPriceCents(order.discount)}
              </span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between pt-1 font-semibold">
            <span>Total</span>
            <span>{formatPriceCents(order.total)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Payment Info */}
      {order.payment && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <span>{getPaymentStatusLabel(order.payment.status)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount</span>
              <span>{formatPriceCents(order.payment.amount)}</span>
            </div>
            {order.payment.paidAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Paid on</span>
                <span>
                  {formatDate(new Date(order.payment.paidAt))}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap gap-4">
        <Button asChild variant="outline">
          <Link href="/account/orders">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Link>
        </Button>
        <Button variant="outline" disabled>
          <Download className="mr-2 h-4 w-4" />
          Download Invoice
        </Button>
        {canCancel && (
          <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <XCircle className="mr-2 h-4 w-4" />
                Cancel Order
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cancel Order</DialogTitle>
                <DialogDescription>
                  Are you sure you want to cancel order #{order.orderNumber}?
                  This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" disabled={isCancelling}>
                    Keep Order
                  </Button>
                </DialogClose>
                <Button
                  variant="destructive"
                  onClick={handleCancelOrder}
                  disabled={isCancelling}
                >
                  {isCancelling ? "Cancelling..." : "Yes, Cancel Order"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}

function OrderDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-36" />
        </div>
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>

      {/* Order items skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-28" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i}>
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-5 w-16" />
              </div>
              {i < 1 && <Separator className="mt-4" />}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Summary skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-4 w-12" />
          </div>
          <Separator />
          <div className="flex justify-between pt-1">
            <Skeleton className="h-5 w-12" />
            <Skeleton className="h-5 w-16" />
          </div>
        </CardContent>
      </Card>

      {/* Payment skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-48" />
        </CardContent>
      </Card>

      {/* Actions skeleton */}
      <div className="flex gap-4">
        <Skeleton className="h-10 w-36" />
        <Skeleton className="h-10 w-40" />
      </div>
    </div>
  );
}
