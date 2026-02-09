'use client';

import { RevenueChart } from '@/components/dashboard/revenue-chart';
import { StatsCard } from '@/components/dashboard/stats-card';

// Mock data - in production this would come from Convex
const analyticsData = {
  overview: {
    totalRevenue: 125000,
    revenueChange: 12.5,
    totalOrders: 3456,
    ordersChange: 8.2,
    totalUsers: 12500,
    usersChange: 15.3,
    conversionRate: 3.2,
    conversionChange: 0.5,
  },
  topProducts: [
    { name: 'Premium UI Kit', sales: 234, revenue: 11700 },
    { name: 'Icon Pack Pro', sales: 189, revenue: 5670 },
    { name: 'Landing Page Templates', sales: 156, revenue: 12480 },
    { name: 'Photo Presets Collection', sales: 145, revenue: 4350 },
    { name: 'React Component Library', sales: 123, revenue: 9840 },
  ],
  topSellers: [
    { name: 'Creative Designs', sales: 456, revenue: 22800 },
    { name: 'Digital Assets Pro', sales: 389, revenue: 19450 },
    { name: 'Code Templates Hub', sales: 312, revenue: 15600 },
    { name: 'Photo Presets Hub', sales: 278, revenue: 8340 },
    { name: 'Design Studio', sales: 234, revenue: 11700 },
  ],
  topCategories: [
    { name: 'UI Kits', products: 234, revenue: 45000 },
    { name: 'Templates', products: 189, revenue: 38000 },
    { name: 'Icons', products: 156, revenue: 22000 },
    { name: 'Photography', products: 145, revenue: 15000 },
    { name: 'Code', products: 123, revenue: 12000 },
  ],
  trafficSources: [
    { source: 'Organic Search', visits: 45000, percentage: 45 },
    { source: 'Direct', visits: 25000, percentage: 25 },
    { source: 'Social Media', visits: 15000, percentage: 15 },
    { source: 'Referral', visits: 10000, percentage: 10 },
    { source: 'Email', visits: 5000, percentage: 5 },
  ],
};

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Platform performance and insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select className="rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted">
            Export Report
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard
          title="Total Revenue"
          value={`$${analyticsData.overview.totalRevenue.toLocaleString()}`}
          change={analyticsData.overview.revenueChange}
          trend="up"
        />
        <StatsCard
          title="Total Orders"
          value={analyticsData.overview.totalOrders.toLocaleString()}
          change={analyticsData.overview.ordersChange}
          trend="up"
        />
        <StatsCard
          title="Total Users"
          value={analyticsData.overview.totalUsers.toLocaleString()}
          change={analyticsData.overview.usersChange}
          trend="up"
        />
        <StatsCard
          title="Conversion Rate"
          value={`${analyticsData.overview.conversionRate}%`}
          change={analyticsData.overview.conversionChange}
          trend="up"
        />
      </div>

      {/* Revenue Chart */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Revenue Overview</h2>
        <RevenueChart />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Products */}
        <div className="rounded-lg border bg-card shadow-sm">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Top Products</h2>
          </div>
          <div className="divide-y">
            {analyticsData.topProducts.map((product, index) => (
              <div
                key={product.name}
                className="p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground font-medium">
                    #{index + 1}
                  </span>
                  <span className="font-medium">{product.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    ${product.revenue.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {product.sales} sales
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Sellers */}
        <div className="rounded-lg border bg-card shadow-sm">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Top Sellers</h2>
          </div>
          <div className="divide-y">
            {analyticsData.topSellers.map((seller, index) => (
              <div
                key={seller.name}
                className="p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground font-medium">
                    #{index + 1}
                  </span>
                  <span className="font-medium">{seller.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    ${seller.revenue.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {seller.sales} sales
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Categories */}
        <div className="rounded-lg border bg-card shadow-sm">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Top Categories</h2>
          </div>
          <div className="divide-y">
            {analyticsData.topCategories.map((category, index) => (
              <div
                key={category.name}
                className="p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground font-medium">
                    #{index + 1}
                  </span>
                  <span className="font-medium">{category.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    ${category.revenue.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {category.products} products
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="rounded-lg border bg-card shadow-sm">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Traffic Sources</h2>
          </div>
          <div className="p-4 space-y-4">
            {analyticsData.trafficSources.map((source) => (
              <div key={source.source}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{source.source}</span>
                  <span className="text-sm text-muted-foreground">
                    {source.visits.toLocaleString()} ({source.percentage}%)
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${source.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="font-semibold mb-4">Average Order Value</h3>
          <p className="text-3xl font-bold">$36.18</p>
          <p className="text-sm text-success mt-1">+5.2% from last period</p>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="font-semibold mb-4">Customer Lifetime Value</h3>
          <p className="text-3xl font-bold">$142.50</p>
          <p className="text-sm text-success mt-1">+8.7% from last period</p>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="font-semibold mb-4">Refund Rate</h3>
          <p className="text-3xl font-bold">2.1%</p>
          <p className="text-sm text-success mt-1">-0.3% from last period</p>
        </div>
      </div>
    </div>
  );
}
