"use client";

import { useState } from "react";

export default function ProductAnalyticsPage() {
  const [sortBy, setSortBy] = useState("revenue");

  const products = [
    {
      id: "1",
      name: "Handcrafted Wooden Bowl",
      views: 2450,
      sales: 156,
      revenue: 7174.44,
      conversionRate: 6.4,
      avgRating: 4.8,
    },
    {
      id: "2",
      name: "Ceramic Vase Set",
      views: 1890,
      sales: 89,
      revenue: 8009.11,
      conversionRate: 4.7,
      avgRating: 4.6,
    },
    {
      id: "3",
      name: "Woven Wall Hanging",
      views: 1567,
      sales: 67,
      revenue: 8375.0,
      conversionRate: 4.3,
      avgRating: 4.9,
    },
    {
      id: "4",
      name: "Leather Journal",
      views: 1234,
      sales: 45,
      revenue: 1575.0,
      conversionRate: 3.6,
      avgRating: 4.7,
    },
    {
      id: "5",
      name: "Macrame Plant Hanger",
      views: 987,
      sales: 34,
      revenue: 1190.0,
      conversionRate: 3.4,
      avgRating: 4.5,
    },
  ];

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case "revenue":
        return b.revenue - a.revenue;
      case "sales":
        return b.sales - a.sales;
      case "views":
        return b.views - a.views;
      case "conversion":
        return b.conversionRate - a.conversionRate;
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Product Performance</h1>
          <p className="text-[var(--muted-foreground)]">
            Analyze how your products are performing
          </p>
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
        >
          <option value="revenue">Sort by Revenue</option>
          <option value="sales">Sort by Sales</option>
          <option value="views">Sort by Views</option>
          <option value="conversion">Sort by Conversion</option>
        </select>
      </div>

      {/* Products Table */}
      <div className="seller-card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="text-left py-3 px-4 font-medium text-[var(--muted-foreground)]">
                Product
              </th>
              <th className="text-right py-3 px-4 font-medium text-[var(--muted-foreground)]">
                Views
              </th>
              <th className="text-right py-3 px-4 font-medium text-[var(--muted-foreground)]">
                Sales
              </th>
              <th className="text-right py-3 px-4 font-medium text-[var(--muted-foreground)]">
                Revenue
              </th>
              <th className="text-right py-3 px-4 font-medium text-[var(--muted-foreground)]">
                Conversion
              </th>
              <th className="text-right py-3 px-4 font-medium text-[var(--muted-foreground)]">
                Rating
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedProducts.map((product) => (
              <tr
                key={product.id}
                className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)]/50"
              >
                <td className="py-4 px-4">
                  <a
                    href={`/products/${product.id}`}
                    className="font-medium hover:text-[var(--primary)]"
                  >
                    {product.name}
                  </a>
                </td>
                <td className="py-4 px-4 text-right">
                  {product.views.toLocaleString()}
                </td>
                <td className="py-4 px-4 text-right">{product.sales}</td>
                <td className="py-4 px-4 text-right font-medium">
                  ${product.revenue.toFixed(2)}
                </td>
                <td className="py-4 px-4 text-right">
                  <span
                    className={`${
                      product.conversionRate >= 5
                        ? "text-[var(--success)]"
                        : product.conversionRate >= 3
                          ? "text-[var(--warning)]"
                          : "text-[var(--destructive)]"
                    }`}
                  >
                    {product.conversionRate}%
                  </span>
                </td>
                <td className="py-4 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <svg
                      className="w-4 h-4 text-yellow-400 fill-current"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                    <span>{product.avgRating}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Performance Tips */}
      <div className="seller-card bg-[var(--muted)]">
        <h3 className="font-semibold mb-3">Performance Tips</h3>
        <ul className="space-y-2 text-sm text-[var(--muted-foreground)]">
          <li className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-[var(--primary)] flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>
              Products with high views but low conversion may need better
              descriptions or images
            </span>
          </li>
          <li className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-[var(--primary)] flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>
              Consider running promotions on products with high ratings but
              lower sales
            </span>
          </li>
          <li className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-[var(--primary)] flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>
              Respond to reviews to improve customer engagement and trust
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
