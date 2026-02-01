'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigation = [
  { name: 'Dashboard', href: '/', icon: '📊' },
  { name: 'Users', href: '/users', icon: '👥' },
  { name: 'Products', href: '/products', icon: '📦' },
  { name: 'Categories', href: '/categories', icon: '📁' },
  { name: 'Orders', href: '/orders', icon: '🛒' },
  { name: 'Sellers', href: '/sellers', icon: '🏪' },
  { name: 'Moderation', href: '/moderation', icon: '🛡️' },
  { name: 'Analytics', href: '/analytics', icon: '📈' },
  { name: 'Settings', href: '/settings', icon: '⚙️' },
];

export function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed left-0 top-14 z-40 h-[calc(100vh-3.5rem)] w-64 border-r bg-background">
      <nav className="flex flex-col gap-1 p-4">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              isActive(item.href)
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 border-t p-4">
        <div className="rounded-lg bg-muted p-4">
          <h4 className="text-sm font-medium">Need Help?</h4>
          <p className="mt-1 text-xs text-muted-foreground">
            Check out our admin documentation for guides and tutorials.
          </p>
          <a
            href="/docs"
            className="mt-2 inline-block text-xs text-primary hover:underline"
          >
            View Documentation →
          </a>
        </div>
      </div>
    </aside>
  );
}
