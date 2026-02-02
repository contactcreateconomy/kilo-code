'use client';

import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useAuth } from '@/hooks/use-auth';
import {
  GlassmorphismNavbar,
  Logo,
  AnimatedSearch,
  ThemeToggle,
  NotificationsDropdown,
  ProfileDropdown,
  type Notification,
  type UserProfile,
  type MenuItem,
} from '@createconomy/ui';
import { Settings, LogOut, User, ExternalLink } from 'lucide-react';

export function AdminHeader() {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();

  // Mock notifications - in production, fetch from API
  const notifications: Notification[] = [
    {
      id: '1',
      title: 'New Seller Application',
      message: 'A new seller has applied for verification',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      read: false,
      type: 'warning',
    },
    {
      id: '2',
      title: 'Report Submitted',
      message: 'A user reported a product for review',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      read: false,
      type: 'error',
    },
    {
      id: '3',
      title: 'System Update',
      message: 'Platform update completed successfully',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      read: true,
      type: 'success',
    },
  ];

  const userProfile: UserProfile = {
    name: user?.name || 'Admin',
    email: user?.email || 'admin@createconomy.com',
    avatar: user?.image,
    role: user?.role || 'Administrator',
  };

  const menuItems: MenuItem[] = [
    {
      label: 'Profile',
      icon: <User className="h-4 w-4" />,
      href: '/settings',
    },
    {
      label: 'Settings',
      icon: <Settings className="h-4 w-4" />,
      href: '/settings',
    },
    {
      label: 'View Marketplace',
      icon: <ExternalLink className="h-4 w-4" />,
      href: 'https://createconomy.com',
      external: true,
    },
    {
      label: 'Sign Out',
      icon: <LogOut className="h-4 w-4" />,
      onClick: () => signOut(),
      variant: 'destructive',
    },
  ];

  const handleSearch = (query: string) => {
    console.log('Admin search:', query);
    // Implement admin search functionality
  };

  const handleNotificationClick = (notification: Notification) => {
    console.log('Notification clicked:', notification);
  };

  const handleMarkAllRead = () => {
    console.log('Mark all as read');
  };

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
  };

  return (
    <GlassmorphismNavbar className="fixed left-64 right-0 top-0">
      {/* Left Section - Logo */}
      <div className="flex items-center gap-4">
        <Logo
          text="Admin"
          href="/"
          icon="🛠️"
          showIcon={false}
          iconClassName="bg-gradient-to-br from-orange-500 to-red-600"
        />
        
        {/* Quick Links */}
        <div className="hidden md:flex items-center gap-4 border-l pl-4">
          <a
            href="https://createconomy.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Marketplace
          </a>
          <a
            href="https://community.createconomy.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Forum
          </a>
        </div>
      </div>

      {/* Center Section - Search */}
      <div className="hidden flex-1 justify-center px-8 lg:flex">
        <AnimatedSearch
          placeholder="Search users, products, orders..."
          onSearch={handleSearch}
          className="max-w-md"
        />
      </div>

      {/* Right Section - Actions */}
      <div className="flex items-center gap-2">
        <ThemeToggle
          theme={(theme as 'light' | 'dark') || 'light'}
          onThemeChange={handleThemeChange}
        />
        <NotificationsDropdown
          notifications={notifications}
          onNotificationClick={handleNotificationClick}
          onMarkAllRead={handleMarkAllRead}
        />
        <ProfileDropdown user={userProfile} menuItems={menuItems} />
      </div>
    </GlassmorphismNavbar>
  );
}
