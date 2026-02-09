'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  DollarSign,
  Wallet,
  Settings,
  User,
  BookOpen,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@createconomy/ui/components/sidebar';
import { LogoWithText } from '@createconomy/ui/components/logo';

const navGroups = [
  {
    label: 'Store Management',
    items: [
      { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { title: 'Products', href: '/products', icon: Package },
      { title: 'Orders', href: '/orders', icon: ShoppingCart },
      { title: 'Analytics', href: '/analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'Finance',
    items: [
      { title: 'Earnings', href: '/earnings', icon: DollarSign },
      { title: 'Payouts', href: '/payouts', icon: Wallet },
    ],
  },
  {
    label: 'Account',
    items: [
      { title: 'Store Settings', href: '/settings', icon: Settings },
      { title: 'Profile', href: '/profile', icon: User },
    ],
  },
] as const;

function isNavActive(pathname: string, href: string): boolean {
  if (href === '/dashboard') {
    return pathname === '/dashboard';
  }
  return pathname.startsWith(href);
}

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <LogoWithText size={24} appName="Seller" />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isNavActive(pathname, item.href)}
                      tooltip={item.title}
                    >
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <div className="rounded-lg bg-muted p-4 group-data-[collapsible=icon]:hidden">
          <div className="flex items-center gap-2">
            <BookOpen className="size-4 shrink-0 text-muted-foreground" />
            <h4 className="text-sm font-medium">Need Help?</h4>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Check out our seller documentation for guides and tutorials.
          </p>
          <a
            href="/support"
            className="mt-2 inline-block text-xs text-primary hover:underline"
          >
            View Documentation →
          </a>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
