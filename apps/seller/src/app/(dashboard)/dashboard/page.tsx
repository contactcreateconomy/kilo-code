import { SalesCard } from "@/components/dashboard/sales-card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { RecentOrders } from "@/components/dashboard/recent-orders";
import { LowStockAlert } from "@/components/dashboard/low-stock-alert";
import { QuickActions } from "@/components/dashboard/quick-actions";

export default function SellerDashboard() {
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
          title="Total Sales"
          value="$12,450.00"
          change={12.5}
          trend="up"
          icon="dollar"
        />
        <SalesCard
          title="Orders"
          value="156"
          change={8.2}
          trend="up"
          icon="shopping-cart"
        />
        <SalesCard
          title="Products"
          value="42"
          change={3}
          trend="neutral"
          icon="package"
        />
        <SalesCard
          title="Views"
          value="8,432"
          change={-2.1}
          trend="down"
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
