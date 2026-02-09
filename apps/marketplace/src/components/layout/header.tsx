"use client";

import { useState } from "react";
import Link from "next/link";
import { LogoWithText } from "@createconomy/ui/components/logo";
import { Input } from "@createconomy/ui";
import { Button } from "@createconomy/ui";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@createconomy/ui/components/sheet";
import { Search, Menu } from "lucide-react";
import { Navigation } from "./navigation";
import { UserMenu } from "@/components/auth/user-menu";

const FORUM_URL =
  process.env["NEXT_PUBLIC_FORUM_URL"] || "https://discuss.createconomy.com";
const SELLER_URL =
  process.env["NEXT_PUBLIC_SELLER_URL"] || "https://seller.createconomy.com";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center gap-4">
        {/* Mobile hamburger */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 md:hidden"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>

          <SheetContent side="left" className="w-72">
            <SheetHeader>
              <SheetTitle asChild>
                <Link
                  href="/"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center"
                >
                  <LogoWithText size={24} />
                </Link>
              </SheetTitle>
            </SheetHeader>

            {/* Mobile search */}
            <form action="/products" method="GET" className="relative mt-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                name="search"
                placeholder="Search products..."
                className="w-full pl-10"
              />
            </form>

            {/* Mobile nav links */}
            <nav className="mt-6 flex flex-col gap-1">
              <Link
                href="/products"
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Products
              </Link>
              <Link
                href="/categories"
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Categories
              </Link>
              <a
                href={FORUM_URL}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Discuss
              </a>
              <a
                href={SELLER_URL}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Sell
              </a>
            </nav>

            {/* Mobile sign-in */}
            <div className="mt-6">
              <Button asChild className="w-full">
                <Link
                  href="/auth/signin"
                  onClick={() => setMobileOpen(false)}
                >
                  Sign In
                </Link>
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center">
          <LogoWithText size={28} />
        </Link>

        {/* Desktop navigation links */}
        <nav className="hidden items-center gap-5 md:flex">
          <Navigation />
          <span className="text-border">|</span>
          <a
            href={FORUM_URL}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Discuss
          </a>
          <a
            href={SELLER_URL}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Sell
          </a>
        </nav>

        {/* Desktop centered search */}
        <div className="hidden flex-1 justify-center md:flex">
          <form
            action="/products"
            method="GET"
            className="relative w-full max-w-lg"
          >
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              name="search"
              placeholder="Search products..."
              className="w-full pl-10"
            />
          </form>
        </div>

        {/* Mobile search icon (compact) */}
        <div className="flex flex-1 justify-end md:hidden">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/products?focus=search" aria-label="Search products">
              <Search className="h-5 w-5" />
            </Link>
          </Button>
        </div>

        {/* Right actions — UserMenu */}
        <div className="flex shrink-0 items-center">
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
