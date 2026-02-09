'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';

export function AdminHeader() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 gap-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="text-xl">🛠️</span>
          <span>Createconomy Admin</span>
        </Link>

        <div className="flex-1" />

        {/* Search */}
        <div className="relative">
          <input
            type="search"
            placeholder="Search..."
            className="w-64 rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        {/* Notifications */}
        <button className="relative rounded-md p-2 hover:bg-muted">
          <span className="text-lg">🔔</span>
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] font-medium text-white flex items-center justify-center">
            3
          </span>
        </button>

        {/* Quick Links */}
        <div className="flex items-center gap-2 border-l pl-4">
          <a
            href="https://createconomy.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Marketplace
          </a>
          <a
            href="https://community.createconomy.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Forum
          </a>
        </div>

        {/* User Menu */}
        <div className="flex items-center gap-2 border-l pl-4">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium">{user?.name || 'Admin'}</p>
            <p className="text-xs text-muted-foreground">
              {user?.profile?.defaultRole || 'Administrator'}
            </p>
          </div>
          <button className="rounded-md p-1 hover:bg-muted">
            <span className="text-sm">▼</span>
          </button>
        </div>
      </div>
    </header>
  );
}
