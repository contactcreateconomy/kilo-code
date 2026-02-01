import { SellerLayout } from "@/components/layout/seller-layout";
import { SellerGuard } from "@/components/auth/seller-guard";
import { SalesCard } from "@/components/dashboard/sales-card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { RecentOrders } from "@/components/dashboard/recent-orders";
import { LowStockAlert } from "@/components/dashboard/low-stock-alert";
import { QuickActions } from "@/components/dashboard/quick-actions";

export default function SellerDashboard() {
  return (
    <SellerGuard>
      <SellerLayout>
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p className="text-[var(--muted-foreground)]">
                Welcome back! Here&apos;s an overview of your store.
              </p>
            </div>
            <QuickActions />
          </div>

          {/* Sales Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <SalesCard
              title="Total Revenue"
              value="$12,450.00"
              change="+12.5%"
              changeType="positive"
              icon="dollar"
            />
            <SalesCard
              title="Orders"
              value="156"
              change="+8.2%"
              changeType="positive"
              icon="shopping-bag"
            />
            <SalesCard
              title="Products Sold"
              value="423"
              change="+15.3%"
              changeType="positive"
              icon="package"
            />
            <SalesCard
              title="Conversion Rate"
              value="3.2%"
              change="-0.4%"
              changeType="negative"
              icon="trending-up"
            />
          </div>

          {/* Charts and Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue Chart */}
            <div className="lg:col-span-2">
              <div className="seller-card">
                <h2 className="text-lg font-semibold mb-4">Revenue Overview</h2>
                <RevenueChart />
              </div>
            </div>

            {/* Low Stock Alerts */}
            <div className="lg:col-span-1">
              <div className="seller-card">
                <h2 className="text-lg font-semibold mb-4">Low Stock Alerts</h2>
                <LowStockAlert />
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="seller-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Recent Orders</h2>
              <a
                href="/orders"
                className="text-sm text-[var(--primary)] hover:underline"
              >
                View all orders →
              </a>
            </div>
            <RecentOrders />
          </div>
        </div>
      </SellerLayout>
    </SellerGuard>
  );
}
