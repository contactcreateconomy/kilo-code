"use client";

import { useState } from "react";
import { RevenueChart } from "@/components/dashboard/revenue-chart";

export const metadata = {
  title: "Analytics",
  description: "View your store analytics and insights",
};

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("30d");

  const stats = [
    {
      label: "Total Revenue",
      value: "$12,450.00",
      change: "+12.5%",
      changeType: "positive",
    },
    {
      label: "Orders",
      value: "156",
      change: "+8.2%",
      changeType: "positive",
    },
    {
      label: "Average Order Value",
      value: "$79.81",
      change: "+3.1%",
      changeType: "positive",
    },
    {
      label: "Conversion Rate",
      value: "3.2%",
      change: "-0.4%",
      changeType: "negative",
    },
  ];

  const topProducts = [
    { name: "Handcrafted Wooden Bowl", sales: 156, revenue: 7174.44 },
    { name: "Ceramic Vase Set", sales: 89, revenue: 8009.11 },
    { name: "Woven Wall Hanging", sales: 67, revenue: 8375.0 },
    { name: "Leather Journal", sales: 45, revenue: 1575.0 },
    { name: "Macrame Plant Hanger", sales: 34, revenue: 1190.0 },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics Overview</h1>
          <p className="text-[var(--muted-foreground)]">
            Track your store performance and insights
          </p>
        </div>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="1y">Last year</option>
        </select>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="seller-card">
            <p className="text-sm text-[var(--muted-foreground)]">
              {stat.label}
            </p>
            <p className="text-2xl font-bold mt-1">{stat.value}</p>
            <p
              className={`text-sm mt-1 ${
                stat.changeType === "positive"
                  ? "text-[var(--success)]"
                  : "text-[var(--destructive)]"
              }`}
            >
              {stat.change} vs previous period
            </p>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="seller-card">
        <h2 className="text-lg font-semibold mb-4">Revenue Trends</h2>
        <div className="h-80">
          <RevenueChart />
        </div>
      </div>

      {/* Top Products & Customer Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="seller-card">
          <h2 className="text-lg font-semibold mb-4">Top Products</h2>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div
                key={product.name}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </span>
                  <span className="font-medium">{product.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-medium">${product.revenue.toFixed(2)}</p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {product.sales} sales
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Insights */}
        <div className="seller-card">
          <h2 className="text-lg font-semibold mb-4">Customer Insights</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-[var(--border)]">
              <div>
                <p className="font-medium">New Customers</p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  First-time buyers
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">89</p>
                <p className="text-sm text-[var(--success)]">+15.3%</p>
              </div>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-[var(--border)]">
              <div>
                <p className="font-medium">Returning Customers</p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Repeat purchases
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">67</p>
                <p className="text-sm text-[var(--success)]">+8.7%</p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Customer Retention</p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  30-day retention rate
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">42.9%</p>
                <p className="text-sm text-[var(--success)]">+2.1%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
