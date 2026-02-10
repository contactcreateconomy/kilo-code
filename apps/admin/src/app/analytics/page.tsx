'use client';

import { RevenueChart } from '@/components/dashboard/revenue-chart';
import { StatsCard } from '@/components/dashboard/stats-card';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@createconomy/ui/components/card';
import { useQuery } from 'convex/react';
import { api } from '@createconomy/convex';
import { Loader2 } from 'lucide-react';

function centsToDollars(cents: number): string {
  return (cents / 100).toFixed(2);
}

export default function AnalyticsPage() {
  const stats = useQuery(api.functions.admin.getDashboardStats, {});
  const sellers = useQuery(api.functions.admin.listAllSellers, { limit: 5 });
  const products = useQuery(api.functions.admin.listAllProducts, { limit: 5 });
  const categories = useQuery(api.functions.categories.listCategories, {});

  if (!stats) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const avgOrderValue =
    stats.orders.total > 0
      ? centsToDollars(stats.revenue.total / stats.orders.total)
      : '0.00';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Platform performance and insights
          </p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard
          title="Total Revenue"
          value={`$${centsToDollars(stats.revenue.total)}`}
          icon="dollar"
        />
        <StatsCard
          title="Total Orders"
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

      {/* Revenue Chart */}
      <RevenueChart />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            {!products ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : products.items.length === 0 ? (
              <p className="py-4 text-center text-muted-foreground">
                No products yet
              </p>
            ) : (
              <div className="divide-y">
                {products.items
                  .sort((a, b) => b.salesCount - a.salesCount)
                  .map((product, index) => (
                    <div
                      key={String(product.id)}
                      className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-muted-foreground">
                          #{index + 1}
                        </span>
                        <span className="text-sm font-medium">
                          {product.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          ${centsToDollars(product.salesCount * product.price)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {product.salesCount} sales
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Sellers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Sellers</CardTitle>
          </CardHeader>
          <CardContent>
            {!sellers ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : sellers.items.length === 0 ? (
              <p className="py-4 text-center text-muted-foreground">
                No sellers yet
              </p>
            ) : (
              <div className="divide-y">
                {sellers.items
                  .sort((a, b) => b.totalRevenue - a.totalRevenue)
                  .map((seller, index) => (
                    <div
                      key={String(seller.id)}
                      className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-muted-foreground">
                          #{index + 1}
                        </span>
                        <span className="text-sm font-medium">
                          {seller.businessName ?? seller.user?.name ?? 'Unknown'}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          ${centsToDollars(seller.totalRevenue)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {seller.totalSales} sales
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            {!categories ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : categories.length === 0 ? (
              <p className="py-4 text-center text-muted-foreground">
                No categories yet
              </p>
            ) : (
              <div className="divide-y">
                {categories.map((category, index) => (
                  <div
                    key={String(category._id)}
                    className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-muted-foreground">
                        #{index + 1}
                      </span>
                      <span className="text-sm font-medium">
                        {category.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <span
                        className={`badge text-xs ${category.isActive ? 'badge-success' : 'badge-error'}`}
                      >
                        {category.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Platform Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Platform Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Pending Orders
              </span>
              <span className="text-sm font-medium">{stats.orders.pending}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Orders (Last 24h)
              </span>
              <span className="text-sm font-medium">
                {stats.orders.last24Hours}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Orders (Last Week)
              </span>
              <span className="text-sm font-medium">
                {stats.orders.lastWeek}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Revenue (Last Month)
              </span>
              <span className="text-sm font-medium">
                ${centsToDollars(stats.revenue.lastMonth)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Forum Threads</span>
              <span className="text-sm font-medium">{stats.forum.threads}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Forum Posts</span>
              <span className="text-sm font-medium">{stats.forum.posts}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Average Order Value"
          value={`$${avgOrderValue}`}
          icon="dollar"
        />
        <StatsCard
          title="Banned Users"
          value={stats.users.banned.toString()}
          icon="users"
        />
        <StatsCard
          title="Draft Products"
          value={stats.products.draft.toString()}
          icon="package"
        />
      </div>
    </div>
  );
}
