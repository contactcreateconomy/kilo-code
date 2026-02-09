"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@createconomy/ui/components/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@createconomy/ui/components/chart";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

// Mock data — in production this would come from Convex
const data = [
  { name: "Jan", revenue: 1200, orders: 48 },
  { name: "Feb", revenue: 1800, orders: 72 },
  { name: "Mar", revenue: 2200, orders: 95 },
  { name: "Apr", revenue: 1950, orders: 83 },
  { name: "May", revenue: 2800, orders: 112 },
  { name: "Jun", revenue: 3200, orders: 128 },
  { name: "Jul", revenue: 2900, orders: 119 },
  { name: "Aug", revenue: 3500, orders: 142 },
  { name: "Sep", revenue: 4100, orders: 168 },
  { name: "Oct", revenue: 3800, orders: 155 },
  { name: "Nov", revenue: 4600, orders: 189 },
  { name: "Dec", revenue: 5200, orders: 213 },
];

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function RevenueChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Overview</CardTitle>
        <CardDescription>Monthly revenue for the current year</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-80 w-full">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="fillSellerRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-revenue)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-revenue)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="dot"
                  formatter={(value) => (
                    <span className="font-mono font-medium">
                      ${Number(value).toLocaleString()}
                    </span>
                  )}
                />
              }
            />
            <Area
              type="natural"
              dataKey="revenue"
              stroke="var(--color-revenue)"
              fill="url(#fillSellerRevenue)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
