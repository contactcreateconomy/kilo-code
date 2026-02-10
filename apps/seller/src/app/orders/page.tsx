"use client";

import { useState } from "react";
import { SellerLayout } from "@/components/layout/seller-layout";
import { SellerGuard } from "@/components/auth/seller-guard";
import { OrderCard } from "@/components/orders/order-card";
import { useQuery } from "convex/react";
import { api } from "@createconomy/convex";
import { Loader2 } from "lucide-react";

function centsToDollars(cents: number): number {
  return cents / 100;
}

export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState("all");

  const rawOrders = useQuery(api.functions.orders.getSellerOrders, {});

  if (!rawOrders) {
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

  // Filter out any null entries from the backend
  const orders = rawOrders.filter(
    (o): o is NonNullable<typeof o> => o !== null
  );

  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    const matchesSearch =
      (order.orderNumber ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.buyer?.name ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.buyer?.email ?? "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const statusCounts = {
    all: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    confirmed: orders.filter((o) => o.status === "confirmed").length,
    processing: orders.filter((o) => o.status === "processing").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };

  return (
    <SellerGuard>
      <SellerLayout>
        <div className="space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-2xl font-bold">Orders</h1>
            <p className="text-[var(--muted-foreground)]">
              Manage and fulfill your customer orders
            </p>
          </div>

          {/* Status Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {Object.entries(statusCounts)
              .filter(([status, count]) => count > 0 || status === "all" || status === "pending")
              .map(([status, count]) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    statusFilter === status
                      ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--border)]"
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)} ({count})
                </button>
              ))}
          </div>

          {/* Filters */}
          <div className="seller-card">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search by order number or customer..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                </div>
              </div>

              {/* Date Range */}
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
              </select>
            </div>
          </div>

          {/* Orders List */}
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order._id}
                order={{
                  id: order._id,
                  orderNumber: order.orderNumber,
                  customer: order.buyer?.name ?? order.buyer?.email ?? "Unknown",
                  items: order.items?.length ?? 0,
                  total: centsToDollars(order.total),
                  status: order.status,
                  date: new Date(order.createdAt).toLocaleDateString(),
                }}
              />
            ))}
          </div>

          {/* Empty State */}
          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--muted)] flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-[var(--muted-foreground)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">No orders found</h3>
              <p className="text-[var(--muted-foreground)]">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "You haven't received any orders yet"}
              </p>
            </div>
          )}
        </div>
      </SellerLayout>
    </SellerGuard>
  );
}
