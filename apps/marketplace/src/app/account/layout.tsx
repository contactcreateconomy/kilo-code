"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@createconomy/ui/components/breadcrumb";
import { Card, CardContent } from "@createconomy/ui/components/card";
import { cn } from "@createconomy/ui";
import { User, ClipboardList, Settings, Star, Heart, Download } from "lucide-react";

interface AccountLayoutProps {
  children: React.ReactNode;
}

const navLinks = [
  { href: "/account", label: "My Account", icon: User, exact: true },
  { href: "/account/orders", label: "My Orders", icon: ClipboardList, exact: false },
  { href: "/account/reviews", label: "My Reviews", icon: Star, exact: false },
  { href: "/account/wishlist", label: "Wishlist", icon: Heart, exact: false },
  { href: "/account/downloads", label: "Downloads", icon: Download, exact: false },
  { href: "/account/settings", label: "Settings", icon: Settings, exact: false },
] as const;

function getBreadcrumbLabel(pathname: string): string | null {
  if (pathname === "/account") return null;
  if (pathname.startsWith("/account/orders")) return "Orders";
  if (pathname.startsWith("/account/reviews")) return "Reviews";
  if (pathname.startsWith("/account/wishlist")) return "Wishlist";
  if (pathname.startsWith("/account/downloads")) return "Downloads";
  if (pathname.startsWith("/account/settings")) return "Settings";
  return null;
}

export default function AccountLayout({ children }: AccountLayoutProps) {
  const pathname = usePathname();
  const breadcrumbLabel = getBreadcrumbLabel(pathname);

  return (
    <div className="container py-8">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          {breadcrumbLabel ? (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/account">Account</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{breadcrumbLabel}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          ) : (
            <BreadcrumbItem>
              <BreadcrumbPage>Account</BreadcrumbPage>
            </BreadcrumbItem>
          )}
        </BreadcrumbList>
      </Breadcrumb>

      {/* Mobile Nav — horizontal scrollable tabs */}
      <div className="mb-6 flex gap-1 overflow-x-auto lg:hidden">
        {navLinks.map((link) => {
          const isActive = link.exact
            ? pathname === link.href
            : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Sidebar — desktop only */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <Card>
            <CardContent className="p-2">
              <nav className="space-y-1">
                {navLinks.map((link) => {
                  const isActive = link.exact
                    ? pathname === link.href
                    : pathname.startsWith(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <link.icon className="h-4 w-4" />
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </aside>

        {/* Main Content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
