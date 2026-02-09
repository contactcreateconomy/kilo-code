'use client';

import { RevenueChart } from '@/components/dashboard/revenue-chart';
import { StatsCard } from '@/components/dashboard/stats-card';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@createconomy/ui/components/card';
import { Progress } from '@createconomy/ui/components/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@createconomy/ui/components/select';
import { Button } from '@createconomy/ui/components/button';
import { Download } from 'lucide-react';

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
          <Select defaultValue="30d">
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard
          title="Total Revenue"
          value={`$${analyticsData.overview.totalRevenue.toLocaleString()}`}
          change={analyticsData.overview.revenueChange}
          trend="up"
          icon="dollar"
        />
        <StatsCard
          title="Total Orders"
          value={analyticsData.overview.totalOrders.toLocaleString()}
          change={analyticsData.overview.ordersChange}
          trend="up"
          icon="shopping-cart"
        />
        <StatsCard
          title="Total Users"
          value={analyticsData.overview.totalUsers.toLocaleString()}
          change={analyticsData.overview.usersChange}
          trend="up"
          icon="users"
        />
        <StatsCard
          title="Conversion Rate"
          value={`${analyticsData.overview.conversionRate}%`}
          change={analyticsData.overview.conversionChange}
          trend="up"
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
            <div className="divide-y">
              {analyticsData.topProducts.map((product, index) => (
                <div
                  key={product.name}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground">
                      #{index + 1}
                    </span>
                    <span className="text-sm font-medium">{product.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      ${product.revenue.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {product.sales} sales
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Sellers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Sellers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {analyticsData.topSellers.map((seller, index) => (
                <div
                  key={seller.name}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground">
                      #{index + 1}
                    </span>
                    <span className="text-sm font-medium">{seller.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      ${seller.revenue.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {seller.sales} sales
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {analyticsData.topCategories.map((category, index) => (
                <div
                  key={category.name}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground">
                      #{index + 1}
                    </span>
                    <span className="text-sm font-medium">{category.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      ${category.revenue.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {category.products} products
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Traffic Sources */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Traffic Sources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analyticsData.trafficSources.map((source) => (
              <div key={source.source}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">{source.source}</span>
                  <span className="text-sm text-muted-foreground">
                    {source.visits.toLocaleString()} ({source.percentage}%)
                  </span>
                </div>
                <Progress value={source.percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Average Order Value"
          value="$36.18"
          change={5.2}
          trend="up"
          icon="dollar"
        />
        <StatsCard
          title="Customer Lifetime Value"
          value="$142.50"
          change={8.7}
          trend="up"
          icon="users"
        />
        <StatsCard
          title="Refund Rate"
          value="2.1%"
          change={-0.3}
          trend="down"
        />
      </div>
    </div>
  );
}
