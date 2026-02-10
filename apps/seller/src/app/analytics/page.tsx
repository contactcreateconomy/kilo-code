"use client";

import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "convex/react";
import { api } from "@createconomy/convex";
import type { Id } from "@createconomy/convex/dataModel";
import { Loader2 } from "lucide-react";

function centsToDollars(cents: number): string {
  return (cents / 100).toFixed(2);
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const stats = useQuery(api.functions.orders.getSellerDashboardStats, {});
  const products = useQuery(
    api.functions.products.getProductsBySeller,
    user?._id ? { sellerId: user._id as Id<"users"> } : "skip"
  );

  if (!stats || !products) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Calculate derived analytics
  const averageOrderValue =
    stats.orders > 0 ? stats.revenue / stats.orders : 0;

  // Top products by salesCount
  const topProducts = [...products]
    .sort((a, b) => b.salesCount - a.salesCount)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">Analytics Overview</h1>
        <p className="text-[var(--muted-foreground)]">
          Track your store performance and insights
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="seller-card">
          <p className="text-sm text-[var(--muted-foreground)]">
            Total Revenue
          </p>
          <p className="text-2xl font-bold mt-1">
            ${centsToDollars(stats.revenue)}
          </p>
        </div>
        <div className="seller-card">
          <p className="text-sm text-[var(--muted-foreground)]">Orders</p>
          <p className="text-2xl font-bold mt-1">{stats.orders}</p>
        </div>
        <div className="seller-card">
          <p className="text-sm text-[var(--muted-foreground)]">
            Average Order Value
          </p>
          <p className="text-2xl font-bold mt-1">
            ${centsToDollars(averageOrderValue)}
          </p>
        </div>
        <div className="seller-card">
          <p className="text-sm text-[var(--muted-foreground)]">Total Views</p>
          <p className="text-2xl font-bold mt-1">
            {stats.views.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="seller-card">
        <h2 className="text-lg font-semibold mb-4">Revenue Trends</h2>
        <div className="h-80">
          <RevenueChart />
        </div>
      </div>

      {/* Top Products & Product Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="seller-card">
          <h2 className="text-lg font-semibold mb-4">Top Products</h2>
          {topProducts.length === 0 ? (
            <p className="text-sm text-[var(--muted-foreground)] py-6 text-center">
              No product data yet
            </p>
          ) : (
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div
                  key={product._id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <span className="font-medium truncate max-w-[200px]">
                      {product.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      ${centsToDollars(product.salesCount * product.price)}
                    </p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {product.salesCount} sales
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Breakdown */}
        <div className="seller-card">
          <h2 className="text-lg font-semibold mb-4">Product Breakdown</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-[var(--border)]">
              <div>
                <p className="font-medium">Total Products</p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  All listed products
                </p>
              </div>
              <p className="text-2xl font-bold">{stats.products}</p>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-[var(--border)]">
              <div>
                <p className="font-medium">Active Products</p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Currently available
                </p>
              </div>
              <p className="text-2xl font-bold">{stats.activeProducts}</p>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-[var(--border)]">
              <div>
                <p className="font-medium">Draft Products</p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Not yet published
                </p>
              </div>
              <p className="text-2xl font-bold">{stats.draftProducts}</p>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Total Sales</p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Units sold across all products
                </p>
              </div>
              <p className="text-2xl font-bold">{stats.sales}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
