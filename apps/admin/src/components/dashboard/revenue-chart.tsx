'use client';

import { useQuery } from 'convex/react';
import { api } from '@createconomy/convex';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@createconomy/ui/components/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@createconomy/ui/components/chart';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import { Loader2 } from 'lucide-react';

const chartConfig = {
  revenue: {
    label: 'Revenue',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

function centsToDollars(cents: number): number {
  return cents / 100;
}

export function RevenueChart() {
  const monthlyData = useQuery(api.functions.admin.getMonthlyRevenue, {});

  if (!monthlyData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revenue Overview</CardTitle>
          <CardDescription>Monthly revenue for the current year</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-80">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const chartData = monthlyData.map((d) => ({
    name: d.name,
    revenue: centsToDollars(d.revenue),
    orders: d.orders,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Overview</CardTitle>
        <CardDescription>Monthly revenue for the current year</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-80 text-muted-foreground">
            No revenue data yet
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-80 w-full">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
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
                fill="url(#fillRevenue)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
