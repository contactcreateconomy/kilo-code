import Link from "next/link";
import { SearchBar } from "@/components/forum/search-bar";
import { UserMenu } from "@/components/auth/user-menu";
import { Button } from "@createconomy/ui";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Categories", href: "/c" },
  { name: "Search", href: "/search" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Main Site Link */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold">💬</span>
              <span className="font-bold text-lg hidden sm:inline-block">
                Createconomy Forum
              </span>
            </Link>

            {/* Main Navigation */}
            <nav className="hidden md:flex items-center gap-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Search and User Actions */}
          <div className="flex items-center gap-4">
            {/* Search - Hidden on mobile */}
            <div className="hidden lg:block w-64">
              <SearchBar placeholder="Search forum..." />
            </div>

            {/* New Thread Button */}
            <Button asChild size="sm" className="hidden sm:inline-flex">
              <Link href="/t/new">New Thread</Link>
            </Button>

            {/* User Menu */}
            <UserMenu />

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-md hover:bg-accent"
              aria-label="Open menu"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Back to Main Site Banner */}
      <div className="border-t bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="flex h-8 items-center justify-between text-xs">
            <Link
              href={process.env['NEXT_PUBLIC_MAIN_SITE_URL'] || "https://createconomy.com"}
              className="text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              ← Back to Createconomy
            </Link>
            <span className="text-muted-foreground hidden sm:inline">
              Community Discussion Forum
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
