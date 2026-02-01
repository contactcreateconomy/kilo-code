"use client";

import { SellerLayout } from "@/components/layout/seller-layout";
import { SellerGuard } from "@/components/auth/seller-guard";
import { OrderStatus } from "@/components/orders/order-status";
import { ShippingForm } from "@/components/orders/shipping-form";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;
  
  // Mock order data - in real app, fetch from Convex
  const order = {
    id,
    status: "processing" as const,
    customer: {
      name: "John Doe",
      email: "j***@example.com",
      shippingAddress: {
        line1: "123 Main St",
        city: "New York",
        state: "NY",
        postalCode: "10001",
        country: "US",
      },
    },
    items: [
      {
        id: "1",
        name: "Handcrafted Wooden Bowl",
        quantity: 2,
        price: 45.99,
        image: "/placeholder-product.jpg",
      },
      {
        id: "2",
        name: "Ceramic Vase Set",
        quantity: 1,
        price: 89.99,
        image: "/placeholder-product.jpg",
      },
    ],
    subtotal: 181.97,
    shipping: 12.99,
    tax: 15.45,
    total: 210.41,
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T14:20:00Z",
    notes: "Please handle with care",
  };

  return (
    <SellerGuard>
      <SellerLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">Order {order.id}</h1>
                <OrderStatus status={order.status} />
              </div>
              <p className="text-[var(--muted-foreground)]">
                Placed on {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
            <a
              href="/orders"
              className="px-4 py-2 border border-[var(--border)] rounded-lg hover:bg-[var(--muted)] transition-colors"
            >
              ← Back to Orders
            </a>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Order Items */}
            <div className="lg:col-span-2 space-y-6">
              <div className="seller-card">
                <h2 className="text-lg font-semibold mb-4">Order Items</h2>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 pb-4 border-b border-[var(--border)] last:border-0 last:pb-0"
                    >
                      <div className="w-16 h-16 rounded-lg bg-[var(--muted)] overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-[var(--muted-foreground)]">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                        <p className="text-sm text-[var(--muted-foreground)]">
                          ${item.price.toFixed(2)} each
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
                    <span>${order.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--muted-foreground)]">
                      Shipping
                    </span>
                    <span>${order.shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--muted-foreground)]">Tax</span>
                    <span>${order.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold pt-2 border-t border-[var(--border)]">
                    <span>Total</span>
                    <span>${order.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Information */}
              <div className="seller-card">
                <h2 className="text-lg font-semibold mb-4">
                  Shipping Information
                </h2>
                <ShippingForm orderId={order.id} currentStatus={order.status} />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="seller-card">
                <h2 className="text-lg font-semibold mb-4">Customer</h2>
                <div className="space-y-3">
                  <div>
                    <p className="font-medium">{order.customer.name}</p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {order.customer.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--muted-foreground)] mb-1">
                      Shipping Address
                    </p>
                    <p className="text-sm">
                      {order.customer.shippingAddress.line1}
                      <br />
                      {order.customer.shippingAddress.city},{" "}
                      {order.customer.shippingAddress.state}{" "}
                      {order.customer.shippingAddress.postalCode}
                      <br />
                      {order.customer.shippingAddress.country}
                    </p>
                  </div>
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

              {/* Actions */}
              <div className="seller-card">
                <h2 className="text-lg font-semibold mb-4">Actions</h2>
                <div className="space-y-2">
                  <button className="w-full px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg hover:opacity-90 transition-opacity">
                    Print Packing Slip
                  </button>
                  <button className="w-full px-4 py-2 border border-[var(--border)] rounded-lg hover:bg-[var(--muted)] transition-colors">
                    Contact Customer
                  </button>
                  <button className="w-full px-4 py-2 text-[var(--destructive)] border border-[var(--destructive)] rounded-lg hover:bg-[var(--destructive)]/10 transition-colors">
                    Cancel Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SellerLayout>
    </SellerGuard>
  );
}
