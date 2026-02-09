import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@createconomy/ui/components/card';
import { Plus, ClipboardList, Star, Store } from 'lucide-react';

const quickActions = [
  {
    name: 'Add Product',
    href: '/products/new' as const,
    icon: Plus,
    description: 'Create a new product listing',
  },
  {
    name: 'View Orders',
    href: '/orders' as const,
    icon: ClipboardList,
    description: 'Manage customer orders',
  },
  {
    name: 'Pending Reviews',
    href: '/moderation/reviews' as const,
    icon: Star,
    description: 'Approve product reviews',
  },
  {
    name: 'Seller Applications',
    href: '/sellers/pending' as const,
    icon: Store,
    description: 'Review new sellers',
  },
];

export function QuickActions() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.name}
              href={action.href}
              className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <action.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium leading-none">
                  {action.name}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {action.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
