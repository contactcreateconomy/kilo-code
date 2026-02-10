'use client';

import { useQuery } from 'convex/react';
import { api } from '@createconomy/convex';
import { StatsCard } from '@/components/dashboard/stats-card';
import { RevenueChart } from '@/components/dashboard/revenue-chart';
import { RecentOrders } from '@/components/dashboard/recent-orders';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { Loader2 } from 'lucide-react';

function centsToDollars(cents: number): string {
  return (cents / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function DashboardPage() {
  const stats = useQuery(api.functions.admin.getDashboardStats, {});

  if (!stats) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to the Createconomy Admin Dashboard
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Revenue"
          value={`$${centsToDollars(stats.revenue.total)}`}
          icon="dollar"
        />
        <StatsCard
          title="Orders"
          value={stats.orders.total.toLocaleString()}
          icon="shopping-cart"
        />
        <StatsCard
          title="Total Users"
          value={stats.users.total.toLocaleString()}
          icon="users"
        />
        <StatsCard
          title="Active Products"
          value={stats.products.active.toLocaleString()}
          icon="package"
        />
      </div>

      {/* Charts and Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <RevenueChart />
        </div>
        <div className="lg:col-span-3">
          <QuickActions />
        </div>
      </div>

      {/* Recent Orders */}
      <RecentOrders />
    </div>
  );
}
