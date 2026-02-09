'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BarChart3,
  Package,
  FolderTree,
  ShoppingCart,
  Store,
  Shield,
  Flag,
  Star,
  Ban,
  Users,
  Settings,
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
    label: 'Overview',
    items: [
      { title: 'Dashboard', href: '/', icon: LayoutDashboard },
      { title: 'Analytics', href: '/analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'Commerce',
    items: [
      { title: 'Products', href: '/products', icon: Package },
      { title: 'Categories', href: '/categories', icon: FolderTree },
      { title: 'Orders', href: '/orders', icon: ShoppingCart },
      { title: 'Sellers', href: '/sellers', icon: Store },
    ],
  },
  {
    label: 'Moderation',
    items: [
      { title: 'Overview', href: '/moderation', icon: Shield },
      { title: 'Reports', href: '/moderation/reports', icon: Flag },
      { title: 'Reviews', href: '/moderation/reviews', icon: Star },
      { title: 'Bans', href: '/moderation/bans', icon: Ban },
    ],
  },
  {
    label: 'System',
    items: [
      { title: 'Users', href: '/users', icon: Users },
      { title: 'Settings', href: '/settings', icon: Settings },
    ],
  },
] as const;

function isNavActive(pathname: string, href: string): boolean {
  if (href === '/') {
    return pathname === '/';
  }
  // Exact match for sub-paths like /moderation vs /moderation/reports
  if (href === '/moderation') {
    return pathname === '/moderation';
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
                <LogoWithText size={24} appName="Admin" />
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
            Check out our admin documentation for guides and tutorials.
          </p>
          <a
            href="/docs"
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
