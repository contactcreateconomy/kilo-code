import Link from 'next/link';

const quickActions = [
  {
    name: 'Add Product',
    href: '/products/new' as const,
    icon: '➕',
    description: 'Create a new product listing',
  },
  {
    name: 'View Orders',
    href: '/orders' as const,
    icon: '📋',
    description: 'Manage customer orders',
  },
  {
    name: 'Pending Reviews',
    href: '/moderation/reviews' as const,
    icon: '⭐',
    description: 'Approve product reviews',
  },
  {
    name: 'Seller Applications',
    href: '/sellers/pending' as const,
    icon: '🏪',
    description: 'Review new sellers',
  },
] as const;

export function QuickActions() {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <h2 className="font-semibold mb-4">Quick Actions</h2>
      <div className="grid gap-4 md:grid-cols-4">
        {quickActions.map((action) => (
          <Link
            key={action.name}
            href={action.href}
            className="flex flex-col items-center gap-2 rounded-lg border p-4 text-center hover:bg-muted transition-colors"
          >
            <span className="text-2xl">{action.icon}</span>
            <span className="font-medium">{action.name}</span>
            <span className="text-xs text-muted-foreground">
              {action.description}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
