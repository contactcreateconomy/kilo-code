"use client";

import { use, useState } from "react";
import Link from "next/link";
import { SellerLayout } from "@/components/layout/seller-layout";
import { SellerGuard } from "@/components/auth/seller-guard";
import { OrderStatus } from "@/components/orders/order-status";
import { ShippingForm } from "@/components/orders/shipping-form";
import { useQuery, useMutation } from "convex/react";
import { api } from "@createconomy/convex";
import type { Id } from "@createconomy/convex/dataModel";
import { Loader2 } from "lucide-react";

function centsToDollars(cents: number): string {
  return (cents / 100).toFixed(2);
}

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = use(params);
  const [isUpdating, setIsUpdating] = useState(false);

  const order = useQuery(api.functions.orders.getOrder, {
    orderId: id as Id<"orders">,
  });
  const updateOrderStatus = useMutation(
    api.functions.orders.updateOrderStatus
  );

  if (order === undefined) {
    return (
      <SellerGuard>
        <SellerLayout>
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </SellerLayout>
      </SellerGuard>
    );
  }

  if (order === null) {
    return (
      <SellerGuard>
        <SellerLayout>
          <div className="text-center py-20">
            <h2 className="text-xl font-semibold">Order not found</h2>
            <Link
              href="/orders"
              className="mt-4 inline-block text-primary hover:underline"
            >
              ← Back to orders
            </Link>
          </div>
        </SellerLayout>
      </SellerGuard>
    );
  }

  const handleStatusChange = async (
    newStatus: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  ) => {
    setIsUpdating(true);
    try {
      await updateOrderStatus({
        orderId: id as Id<"orders">,
        status: newStatus,
      });
    } catch (error) {
      console.error("Failed to update order status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const shippingAddress = order.shippingAddress;

  return (
    <SellerGuard>
      <SellerLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">
                  Order #{order.orderNumber}
                </h1>
                <OrderStatus
                  status={
                    order.status as
                      | "pending"
                      | "processing"
                      | "shipped"
                      | "delivered"
                      | "cancelled"
                  }
                  onStatusChange={handleStatusChange}
                  isLoading={isUpdating}
                />
              </div>
              <p className="text-[var(--muted-foreground)]">
                Placed on {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
            <Link
              href="/orders"
              className="px-4 py-2 border border-[var(--border)] rounded-lg hover:bg-[var(--muted)] transition-colors"
            >
              ← Back to Orders
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Order Items */}
            <div className="lg:col-span-2 space-y-6">
              <div className="seller-card">
                <h2 className="text-lg font-semibold mb-4">Order Items</h2>
                <div className="space-y-4">
                  {order.items?.map((item) => (
                    <div
                      key={item._id}
                      className="flex gap-4 pb-4 border-b border-[var(--border)] last:border-0 last:pb-0"
                    >
                      <div className="w-16 h-16 rounded-lg bg-[var(--muted)] overflow-hidden">
                        {item.product?.primaryImage ? (
                          <img
                            src={item.product.primaryImage}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">
                            📦
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-[var(--muted-foreground)]">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          ${centsToDollars(item.subtotal)}
                        </p>
                        <p className="text-sm text-[var(--muted-foreground)]">
                          ${centsToDollars(item.price)} each
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="mt-4 pt-4 border-t border-[var(--border)] space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--muted-foreground)]">
                      Subtotal
                    </span>
                    <span>${centsToDollars(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--muted-foreground)]">
                      Shipping
                    </span>
                    <span>${centsToDollars(order.shipping)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--muted-foreground)]">Tax</span>
                    <span>${centsToDollars(order.tax)}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--muted-foreground)]">
                        Discount
                      </span>
                      <span className="text-emerald-500">
                        -${centsToDollars(order.discount)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold pt-2 border-t border-[var(--border)]">
                    <span>Total</span>
                    <span>${centsToDollars(order.total)}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Information */}
              <div className="seller-card">
                <h2 className="text-lg font-semibold mb-4">
                  Shipping Information
                </h2>
                <ShippingForm
                  orderId={id}
                  currentStatus={
                    order.status as
                      | "pending"
                      | "processing"
                      | "shipped"
                      | "delivered"
                      | "cancelled"
                  }
                />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="seller-card">
                <h2 className="text-lg font-semibold mb-4">Customer</h2>
                <div className="space-y-3">
                  {shippingAddress && (
                    <>
                      <div>
                        <p className="font-medium">{shippingAddress.name}</p>
                        {shippingAddress.phone && (
                          <p className="text-sm text-[var(--muted-foreground)]">
                            {shippingAddress.phone}
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[var(--muted-foreground)] mb-1">
                          Shipping Address
                        </p>
                        <p className="text-sm">
                          {shippingAddress.street}
                          <br />
                          {shippingAddress.city}
                          {shippingAddress.state
                            ? `, ${shippingAddress.state}`
                            : ""}{" "}
                          {shippingAddress.postalCode}
                          <br />
                          {shippingAddress.country}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Order Notes */}
              {order.notes && (
                <div className="seller-card">
                  <h2 className="text-lg font-semibold mb-4">Order Notes</h2>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {order.notes}
                  </p>
                </div>
              )}

              {/* Payment Info */}
              {order.payment && (
                <div className="seller-card">
                  <h2 className="text-lg font-semibold mb-4">Payment</h2>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[var(--muted-foreground)]">
                        Status
                      </span>
                      <span className="capitalize">{order.payment.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--muted-foreground)]">
                        Amount
                      </span>
                      <span>
                        ${centsToDollars(order.payment.amount)}{" "}
                        {order.payment.currency?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="seller-card">
                <h2 className="text-lg font-semibold mb-4">Actions</h2>
                <div className="space-y-2">
                  <button className="w-full px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg hover:opacity-90 transition-opacity">
                    Print Packing Slip
                  </button>
                  {order.status !== "cancelled" &&
                    order.status !== "delivered" && (
                      <button
                        onClick={() => handleStatusChange("cancelled")}
                        disabled={isUpdating}
                        className="w-full px-4 py-2 text-[var(--destructive)] border border-[var(--destructive)] rounded-lg hover:bg-[var(--destructive)]/10 transition-colors disabled:opacity-50"
                      >
                        {isUpdating ? "Cancelling..." : "Cancel Order"}
                      </button>
                    )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </SellerLayout>
    </SellerGuard>
  );
}
