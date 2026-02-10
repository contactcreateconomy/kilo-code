"use client";

import { SalesCard } from "@/components/dashboard/sales-card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { RecentOrders } from "@/components/dashboard/recent-orders";
import { LowStockAlert } from "@/components/dashboard/low-stock-alert";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { useQuery } from "convex/react";
import { api } from "@createconomy/convex";
import { Loader2 } from "lucide-react";

function centsToDollars(cents: number): string {
  return (cents / 100).toFixed(2);
}

export default function SellerDashboard() {
  const stats = useQuery(api.functions.orders.getSellerDashboardStats, {});

  if (!stats) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s an overview of your store.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SalesCard
          title="Total Revenue"
          value={`$${centsToDollars(stats.revenue)}`}
          icon="dollar"
        />
        <SalesCard
          title="Orders"
          value={String(stats.orders)}
          icon="shopping-cart"
        />
        <SalesCard
          title="Products"
          value={String(stats.products)}
          icon="package"
        />
        <SalesCard
          title="Views"
          value={stats.views.toLocaleString()}
          icon="eye"
        />
      </div>

      {/* Revenue Chart + Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <RevenueChart />
        </div>
        <div className="lg:col-span-3">
          <QuickActions />
        </div>
      </div>

      {/* Recent Orders + Low Stock Alerts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <RecentOrders />
        </div>
        <div className="lg:col-span-3">
          <LowStockAlert />
        </div>
      </div>
    </div>
  );
}
