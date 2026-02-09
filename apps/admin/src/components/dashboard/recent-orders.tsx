import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@createconomy/ui/components/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@createconomy/ui/components/table';
import { Badge } from '@createconomy/ui/components/badge';
import { Button } from '@createconomy/ui/components/button';

// Mock data - in production this would come from Convex
const recentOrders = [
  {
    id: 'ORD-001',
    customer: 'John Doe',
    product: 'Premium UI Kit',
    amount: 49.99,
    status: 'completed',
    date: '2024-01-25',
  },
  {
    id: 'ORD-002',
    customer: 'Alice Brown',
    product: 'Icon Pack Pro',
    amount: 29.99,
    status: 'processing',
    date: '2024-01-25',
  },
  {
    id: 'ORD-003',
    customer: 'Bob Wilson',
    product: 'Landing Page Templates',
    amount: 79.99,
    status: 'completed',
    date: '2024-01-24',
  },
  {
    id: 'ORD-004',
    customer: 'Emily Davis',
    product: 'Photo Presets Collection',
    amount: 39.99,
    status: 'pending',
    date: '2024-01-24',
  },
  {
    id: 'ORD-005',
    customer: 'Charlie Smith',
    product: 'React Component Library',
    amount: 99.99,
    status: 'completed',
    date: '2024-01-23',
  },
];

const statusStyles: Record<string, string> = {
  completed: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  processing: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  pending: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  cancelled: 'bg-red-500/10 text-red-500 border-red-500/20',
  refunded: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
};

export function RecentOrders() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1.5">
          <CardTitle className="text-lg">Recent Orders</CardTitle>
          <CardDescription>Latest customer transactions</CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/orders">View All →</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  <Link
                    href={`/orders/${order.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {order.id}
                  </Link>
                </TableCell>
                <TableCell>{order.customer}</TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {order.product}
                </TableCell>
                <TableCell className="font-medium">
                  ${order.amount.toFixed(2)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={statusStyles[order.status]}
                  >
                    {order.status.charAt(0).toUpperCase() +
                      order.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {order.date}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
