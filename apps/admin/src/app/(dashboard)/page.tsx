import { StatsCard } from '@/components/dashboard/stats-card';
import { RevenueChart } from '@/components/dashboard/revenue-chart';
import { RecentOrders } from '@/components/dashboard/recent-orders';
import { QuickActions } from '@/components/dashboard/quick-actions';

export default function DashboardPage() {
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
          value="$45,231.89"
          change={20.1}
          trend="up"
          icon="dollar"
        />
        <StatsCard
          title="Orders"
          value="2,350"
          change={15.2}
          trend="up"
          icon="shopping-cart"
        />
        <StatsCard
          title="Active Users"
          value="12,234"
          change={5.4}
          trend="up"
          icon="users"
        />
        <StatsCard
          title="Products"
          value="573"
          change={12}
          trend="neutral"
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
