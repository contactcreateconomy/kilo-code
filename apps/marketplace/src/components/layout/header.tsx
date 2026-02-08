import Link from "next/link";
import { Navigation } from "./navigation";
import { UserMenu } from "@/components/auth/user-menu";
import { Input } from "@createconomy/ui";

const FORUM_URL = process.env["NEXT_PUBLIC_FORUM_URL"] || "https://discuss.createconomy.com";
const SELLER_URL = process.env["NEXT_PUBLIC_SELLER_URL"] || "https://seller.createconomy.com";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center gap-6">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="text-xl font-bold text-primary">Createconomy</span>
        </Link>

        {/* Navigation Links */}
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

        {/* Centered Search */}
        <div className="hidden flex-1 justify-center md:flex">
          <form action="/products" method="GET" className="relative w-full max-w-lg">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              name="search"
              placeholder="Search products..."
              className="w-full pl-10"
            />
          </form>
        </div>

        {/* Right Actions */}
        <div className="flex shrink-0 items-center">
          <UserMenu />
        </div>
      </div>
    </header>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
