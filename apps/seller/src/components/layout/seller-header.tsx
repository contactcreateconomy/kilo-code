'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, LogOut, Search, User } from 'lucide-react';

import { useAuth } from '@/hooks/use-auth';
import { SidebarTrigger } from '@createconomy/ui/components/sidebar';
import { Separator } from '@createconomy/ui/components/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@createconomy/ui/components/breadcrumb';
import { Input } from '@createconomy/ui/components/input';
import { Button } from '@createconomy/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@createconomy/ui/components/dropdown-menu';
import { Avatar, AvatarFallback } from '@createconomy/ui/components/avatar';

interface BreadcrumbSegment {
  label: string;
  href: string;
  isLast: boolean;
}

/** Map URL path segments to the navigation group they belong to. */
const segmentGroupMap: Record<string, string> = {
  products: 'Store Management',
  orders: 'Store Management',
  analytics: 'Store Management',
  earnings: 'Finance',
  payouts: 'Finance',
  settings: 'Account',
  profile: 'Account',
};

function getBreadcrumbs(pathname: string): BreadcrumbSegment[] {
  const segments = pathname.split('/').filter(Boolean);

  return segments.map((segment, index) => ({
    label: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
    href: '/' + segments.slice(0, index + 1).join('/'),
    isLast: index === segments.length - 1,
  }));
}

export function SellerHeader() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const breadcrumbs = getBreadcrumbs(pathname);

  // Determine the parent group for the first segment (if applicable)
  const firstSegment = pathname.split('/').filter(Boolean)[0];
  const parentGroup = firstSegment ? segmentGroupMap[firstSegment] : undefined;

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb>
          <BreadcrumbList>
            {/* Always show a root breadcrumb when on a sub-page */}
            {breadcrumbs.length > 0 && parentGroup && (
              <>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink asChild>
                    <span className="text-muted-foreground">{parentGroup}</span>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
              </>
            )}
            {breadcrumbs.map((crumb) => (
              <BreadcrumbItem key={crumb.href}>
                {crumb.isLast ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  <>
                    <BreadcrumbLink asChild>
                      <Link href={crumb.href}>{crumb.label}</Link>
                    </BreadcrumbLink>
                    <BreadcrumbSeparator />
                  </>
                )}
              </BreadcrumbItem>
            ))}
            {breadcrumbs.length === 0 && (
              <BreadcrumbItem>
                <BreadcrumbPage>Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="ml-auto flex items-center gap-2 px-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products, orders..."
            className="w-64 pl-8"
          />
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-4" />
          <span className="sr-only">Notifications</span>
        </Button>

        {/* User menu */}
        <Separator
          orientation="vertical"
          className="hidden md:block data-[orientation=vertical]:h-4"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="size-8">
                <AvatarFallback>
                  {user?.name?.charAt(0)?.toUpperCase() || 'S'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.name || 'Seller'}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email || 'seller@example.com'}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">
                <User className="mr-2 size-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <User className="mr-2 size-4" />
                Store Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut()}>
              <LogOut className="mr-2 size-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
